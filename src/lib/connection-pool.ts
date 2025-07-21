import { Pool, PoolClient } from 'pg';
import { ErrorHandlingService, ErrorSeverity, ErrorCategory } from './error-handling';

interface PoolConnection {
  id: string;
  client: PoolClient;
  inUse: boolean;
  lastUsed: Date;
  createdAt: Date;
  healthStatus: 'healthy' | 'unhealthy' | 'checking';
  errorCount: number;
  latency: number;
}

interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  idleTimeoutMs: number;
  healthCheckIntervalMs: number;
  maxRetries: number;
  retryDelayMs: number;
  connectionTimeoutMs: number;
  maxErrorsBeforeEviction: number;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  unhealthyConnections: number;
  totalRequests: number;
  failedRequests: number;
  averageLatency: number;
  poolUtilization: number;
}

export class ConnectionPoolService {
  private static instance: ConnectionPoolService;
  private connections: Map<string, PoolConnection> = new Map();
  private config: PoolConfig;
  private metrics: ConnectionMetrics;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: process.env.VITE_DB_HOST || 'localhost',
      port: parseInt(process.env.VITE_DB_PORT || '5432'),
      database: process.env.VITE_DB_NAME || 'project_management',
      user: process.env.VITE_DB_USER || 'postgres',
      password: process.env.VITE_DB_PASSWORD || 'password',
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    this.config = {
      minConnections: 2,
      maxConnections: 20,
      idleTimeoutMs: 30000,
      healthCheckIntervalMs: 60000, // 1 minute
      maxRetries: 3,
      retryDelayMs: 1000,
      connectionTimeoutMs: 5000,
      maxErrorsBeforeEviction: 5
    };

    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      unhealthyConnections: 0,
      totalRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      poolUtilization: 0
    };

    this.startHealthChecks();
    this.initializePool();
  }

  public static getInstance(): ConnectionPoolService {
    if (!ConnectionPoolService.instance) {
      ConnectionPoolService.instance = new ConnectionPoolService();
    }
    return ConnectionPoolService.instance;
  }

  private async initializePool(): Promise<void> {
    try {
      // Create minimum connections
      for (let i = 0; i < this.config.minConnections; i++) {
        await this.createConnection();
      }
      console.log(`Connection pool initialized with ${this.config.minConnections} connections`);
    } catch (error) {
      await ErrorHandlingService.logError(
        ErrorCategory.DATABASE,
        'POOL_INIT_FAILED',
        'Failed to initialize connection pool',
        error,
        ErrorSeverity.CRITICAL
      );
      throw error;
    }
  }

  private async createConnection(): Promise<PoolConnection> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const client = await this.pool.connect();
      
      const connection: PoolConnection = {
        id: connectionId,
        client,
        inUse: false,
        lastUsed: new Date(),
        createdAt: new Date(),
        healthStatus: 'healthy',
        errorCount: 0,
        latency: 0
      };

      this.connections.set(connectionId, connection);
      this.updateMetrics();
      
      return connection;
    } catch (error) {
      await ErrorHandlingService.logError(
        ErrorCategory.DATABASE,
        'CONNECTION_CREATE_FAILED',
        `Failed to create connection ${connectionId}`,
        error,
        ErrorSeverity.HIGH
      );
      throw error;
    }
  }

  public async getConnection(): Promise<PoolConnection> {
    this.metrics.totalRequests++;
    
    try {
      // Find available healthy connection
      for (const [id, connection] of this.connections) {
        if (!connection.inUse && connection.healthStatus === 'healthy') {
          connection.inUse = true;
          connection.lastUsed = new Date();
          this.updateMetrics();
          return connection;
        }
      }

      // Create new connection if under max limit
      if (this.connections.size < this.config.maxConnections) {
        const newConnection = await this.createConnection();
        newConnection.inUse = true;
        this.updateMetrics();
        return newConnection;
      }

      // Wait for available connection
      return await this.waitForConnection();
    } catch (error) {
      this.metrics.failedRequests++;
      await ErrorHandlingService.logError(
        ErrorCategory.DATABASE,
        'CONNECTION_ACQUIRE_FAILED',
        'Failed to acquire database connection',
        error,
        ErrorSeverity.HIGH
      );
      throw error;
    }
  }

  public async releaseConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.inUse = false;
      connection.lastUsed = new Date();
      this.updateMetrics();
    }
  }

  private async waitForConnection(): Promise<PoolConnection> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.config.connectionTimeoutMs);

      const checkForConnection = setInterval(() => {
        for (const [id, connection] of this.connections) {
          if (!connection.inUse && connection.healthStatus === 'healthy') {
            clearInterval(checkForConnection);
            clearTimeout(timeout);
            connection.inUse = true;
            connection.lastUsed = new Date();
            this.updateMetrics();
            resolve(connection);
            return;
          }
        }
      }, 100);
    });
  }

  public async query(text: string, params?: any[], connectionId?: string): Promise<any> {
    const startTime = Date.now();
    let connection: PoolConnection | null = null;

    try {
      if (connectionId) {
        connection = this.connections.get(connectionId);
        if (!connection || connection.healthStatus !== 'healthy') {
          throw new Error('Invalid or unhealthy connection');
        }
      } else {
        connection = await this.getConnection();
      }

      const result = await connection.client.query(text, params);
      
      // Update latency metrics
      const latency = Date.now() - startTime;
      connection.latency = latency;
      this.updateLatencyMetrics(latency);
      
      if (!connectionId) {
        await this.releaseConnection(connection.id);
      }

      return result;
    } catch (error) {
      if (connection) {
        connection.errorCount++;
        await this.handleConnectionError(connection, error);
        if (!connectionId) {
          await this.releaseConnection(connection.id);
        }
      }
      throw error;
    }
  }

  private async handleConnectionError(connection: PoolConnection, error: any): Promise<void> {
    connection.errorCount++;
    
    await ErrorHandlingService.logError(
      ErrorCategory.DATABASE,
      'CONNECTION_ERROR',
      `Connection ${connection.id} error`,
      error,
      ErrorSeverity.MEDIUM
    );

    if (connection.errorCount >= this.config.maxErrorsBeforeEviction) {
      await this.evictConnection(connection.id);
    }
  }

  private async evictConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      try {
        connection.client.release();
      } catch (error) {
        // Ignore errors when releasing
      }
      
      this.connections.delete(connectionId);
      this.updateMetrics();
      
      await ErrorHandlingService.logError(
        ErrorCategory.DATABASE,
        'CONNECTION_EVICTED',
        `Connection ${connectionId} evicted due to errors`,
        null,
        ErrorSeverity.MEDIUM
      );

      // Create replacement connection if needed
      if (this.connections.size < this.config.minConnections) {
        try {
          await this.createConnection();
        } catch (error) {
          // Handle error creating replacement connection
        }
      }
    }
  }

  private async performHealthCheck(connection: PoolConnection): Promise<boolean> {
    if (connection.inUse || connection.healthStatus === 'checking') {
      return connection.healthStatus === 'healthy';
    }

    connection.healthStatus = 'checking';
    const startTime = Date.now();

    try {
      await connection.client.query('SELECT 1');
      
      connection.healthStatus = 'healthy';
      connection.latency = Date.now() - startTime;
      connection.errorCount = 0;
      
      return true;
    } catch (error) {
      connection.healthStatus = 'unhealthy';
      await this.handleConnectionError(connection, error);
      return false;
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      if (this.isShuttingDown) return;

      const healthCheckPromises = Array.from(this.connections.values()).map(
        connection => this.performHealthCheck(connection)
      );

      await Promise.allSettled(healthCheckPromises);
      this.updateMetrics();
      
      // Clean up idle connections
      await this.cleanupIdleConnections();
    }, this.config.healthCheckIntervalMs);
  }

  private async cleanupIdleConnections(): Promise<void> {
    const now = new Date();
    const connectionsToRemove: string[] = [];

    for (const [id, connection] of this.connections) {
      if (
        !connection.inUse &&
        (now.getTime() - connection.lastUsed.getTime()) > this.config.idleTimeoutMs &&
        this.connections.size > this.config.minConnections
      ) {
        connectionsToRemove.push(id);
      }
    }

    for (const id of connectionsToRemove) {
      await this.evictConnection(id);
    }
  }

  private updateMetrics(): void {
    let activeCount = 0;
    let idleCount = 0;
    let unhealthyCount = 0;

    for (const connection of this.connections.values()) {
      if (connection.inUse) {
        activeCount++;
      } else {
        idleCount++;
      }
      
      if (connection.healthStatus === 'unhealthy') {
        unhealthyCount++;
      }
    }

    this.metrics.totalConnections = this.connections.size;
    this.metrics.activeConnections = activeCount;
    this.metrics.idleConnections = idleCount;
    this.metrics.unhealthyConnections = unhealthyCount;
    this.metrics.poolUtilization = (activeCount / this.config.maxConnections) * 100;
  }

  private updateLatencyMetrics(latency: number): void {
    // Simple moving average for latency
    this.metrics.averageLatency = (this.metrics.averageLatency + latency) / 2;
  }

  public getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  public getConfig(): PoolConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<PoolConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async getConnectionHealth(): Promise<Map<string, any>> {
    const healthMap = new Map();
    
    for (const [id, connection] of this.connections) {
      healthMap.set(id, {
        id: connection.id,
        inUse: connection.inUse,
        healthStatus: connection.healthStatus,
        errorCount: connection.errorCount,
        latency: connection.latency,
        lastUsed: connection.lastUsed,
        createdAt: connection.createdAt
      });
    }
    
    return healthMap;
  }

  public async forceHealthCheck(): Promise<void> {
    const healthCheckPromises = Array.from(this.connections.values()).map(
      connection => this.performHealthCheck(connection)
    );

    await Promise.allSettled(healthCheckPromises);
    this.updateMetrics();
  }

  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Wait for active connections to finish
    const maxWait = 30000; // 30 seconds
    const startTime = Date.now();
    
    while (this.metrics.activeConnections > 0 && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
      this.updateMetrics();
    }

    // Force close remaining connections
    for (const connection of this.connections.values()) {
      try {
        connection.client.release();
      } catch (error) {
        // Ignore errors during shutdown
      }
    }

    await this.pool.end();
    this.connections.clear();
    this.updateMetrics();
  }

  // Load balancing
  public async getOptimalConnection(): Promise<PoolConnection> {
    let bestConnection: PoolConnection | null = null;
    let bestScore = Infinity;

    for (const connection of this.connections.values()) {
      if (!connection.inUse && connection.healthStatus === 'healthy') {
        // Score based on latency and error count
        const score = connection.latency + (connection.errorCount * 100);
        if (score < bestScore) {
          bestScore = score;
          bestConnection = connection;
        }
      }
    }

    if (bestConnection) {
      bestConnection.inUse = true;
      bestConnection.lastUsed = new Date();
      this.updateMetrics();
      return bestConnection;
    }

    // Fallback to regular connection acquisition
    return this.getConnection();
  }

  // Transaction support
  public async transaction<T>(
    queries: Array<{ text: string; params?: any[] }>,
    isolationLevel?: string
  ): Promise<T[]> {
    const connection = await this.getConnection();
    
    try {
      // Start transaction
      if (isolationLevel) {
        await connection.client.query(`BEGIN ISOLATION LEVEL ${isolationLevel}`);
      } else {
        await connection.client.query('BEGIN');
      }

      const results: T[] = [];
      
      // Execute queries
      for (const query of queries) {
        const result = await connection.client.query(query.text, query.params);
        results.push(result.rows);
      }

      // Commit transaction
      await connection.client.query('COMMIT');
      
      return results;
    } catch (error) {
      // Rollback on error
      try {
        await connection.client.query('ROLLBACK');
      } catch (rollbackError) {
        // Log rollback error but don't throw
        await ErrorHandlingService.logError(
          ErrorCategory.DATABASE,
          'ROLLBACK_FAILED',
          'Failed to rollback transaction',
          rollbackError,
          ErrorSeverity.HIGH
        );
      }
      
      await this.handleConnectionError(connection, error);
      throw error;
    } finally {
      await this.releaseConnection(connection.id);
    }
  }
}

// Singleton instance
export const connectionPool = ConnectionPoolService.getInstance();

// Export for direct usage
export default ConnectionPoolService;