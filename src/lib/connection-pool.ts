import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ErrorHandlingService, ErrorSeverity, ErrorCategory } from './error-handling';

interface PoolConnection {
  id: string;
  client: SupabaseClient;
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
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  private constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    this.config = {
      minConnections: 5,
      maxConnections: 20,
      idleTimeoutMs: 300000, // 5 minutes
      healthCheckIntervalMs: 30000, // 30 seconds
      maxRetries: 3,
      retryDelayMs: 1000,
      connectionTimeoutMs: 10000,
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

    this.initialize();
  }

  public static getInstance(): ConnectionPoolService {
    if (!ConnectionPoolService.instance) {
      ConnectionPoolService.instance = new ConnectionPoolService();
    }
    return ConnectionPoolService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Create initial connections
      for (let i = 0; i < this.config.minConnections; i++) {
        await this.createConnection();
      }

      // Start health check monitoring
      this.startHealthChecking();

      // Setup cleanup on process exit
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());

      await ErrorHandlingService.logError({
        message: 'Connection pool initialized successfully',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.INFO,
        details: { 
          minConnections: this.config.minConnections,
          maxConnections: this.config.maxConnections 
        }
      });
    } catch (error) {
      await ErrorHandlingService.logError({
        message: 'Failed to initialize connection pool',
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.CRITICAL,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  private async createConnection(): Promise<PoolConnection> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const client = createClient(this.supabaseUrl, this.supabaseKey, {
        auth: { persistSession: false },
        db: { schema: 'public' }
      });

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
      await ErrorHandlingService.logError({
        message: 'Failed to create database connection',
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        details: { connectionId, error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  public async getConnection(): Promise<PoolConnection> {
    if (this.isShuttingDown) {
      throw new Error('Connection pool is shutting down');
    }

    const startTime = Date.now();
    let connection: PoolConnection | null = null;

    try {
      // Try to get an available healthy connection
      connection = this.findAvailableConnection();

      if (!connection) {
        // Create new connection if under max limit
        if (this.connections.size < this.config.maxConnections) {
          connection = await this.createConnection();
        } else {
          // Wait for an available connection with timeout
          connection = await this.waitForAvailableConnection();
        }
      }

      if (!connection) {
        throw new Error('No connections available');
      }

      // Mark connection as in use
      connection.inUse = true;
      connection.lastUsed = new Date();
      
      // Health check the connection before returning
      if (connection.healthStatus !== 'healthy') {
        await this.healthCheckConnection(connection);
      }

      this.metrics.totalRequests++;
      this.metrics.averageLatency = (this.metrics.averageLatency + (Date.now() - startTime)) / 2;
      this.updateMetrics();

      return connection;
    } catch (error) {
      this.metrics.failedRequests++;
      await ErrorHandlingService.logError({
        message: 'Failed to get database connection',
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        details: { 
          error: error instanceof Error ? error.message : String(error),
          poolSize: this.connections.size,
          activeConnections: this.getActiveConnectionCount()
        }
      });
      throw error;
    }
  }

  public async releaseConnection(connection: PoolConnection): Promise<void> {
    try {
      connection.inUse = false;
      connection.lastUsed = new Date();
      this.updateMetrics();
    } catch (error) {
      await ErrorHandlingService.logError({
        message: 'Error releasing connection',
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.MEDIUM,
        details: { 
          connectionId: connection.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  private findAvailableConnection(): PoolConnection | null {
    for (const connection of this.connections.values()) {
      if (!connection.inUse && connection.healthStatus === 'healthy') {
        return connection;
      }
    }
    return null;
  }

  private async waitForAvailableConnection(): Promise<PoolConnection> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout: No connections available'));
      }, this.config.connectionTimeoutMs);

      const checkInterval = setInterval(() => {
        const connection = this.findAvailableConnection();
        if (connection) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(connection);
        }
      }, 100);
    });
  }

  private async healthCheckConnection(connection: PoolConnection): Promise<boolean> {
    const startTime = Date.now();
    connection.healthStatus = 'checking';

    try {
      // Simple health check query
      const { error } = await connection.client
        .from('users')
        .select('count')
        .limit(1);

      const latency = Date.now() - startTime;
      connection.latency = latency;

      if (error) {
        connection.errorCount++;
        connection.healthStatus = 'unhealthy';
        
        if (connection.errorCount >= this.config.maxErrorsBeforeEviction) {
          await this.evictConnection(connection);
        }
        return false;
      }

      connection.healthStatus = 'healthy';
      connection.errorCount = 0;
      return true;
    } catch (error) {
      connection.errorCount++;
      connection.healthStatus = 'unhealthy';
      
      await ErrorHandlingService.logError({
        message: 'Connection health check failed',
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.MEDIUM,
        details: { 
          connectionId: connection.id,
          errorCount: connection.errorCount,
          error: error instanceof Error ? error.message : String(error)
        }
      });

      if (connection.errorCount >= this.config.maxErrorsBeforeEviction) {
        await this.evictConnection(connection);
      }

      return false;
    }
  }

  private async evictConnection(connection: PoolConnection): Promise<void> {
    try {
      this.connections.delete(connection.id);
      
      // Create a replacement connection if below minimum
      if (this.connections.size < this.config.minConnections) {
        await this.createConnection();
      }

      this.updateMetrics();

      await ErrorHandlingService.logError({
        message: 'Connection evicted due to health issues',
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.MEDIUM,
        details: { 
          connectionId: connection.id,
          errorCount: connection.errorCount,
          age: Date.now() - connection.createdAt.getTime()
        }
      });
    } catch (error) {
      await ErrorHandlingService.logError({
        message: 'Failed to evict unhealthy connection',
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        details: { 
          connectionId: connection.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(async () => {
      if (this.isShuttingDown) return;

      const promises: Promise<void>[] = [];
      
      for (const connection of this.connections.values()) {
        if (!connection.inUse) {
          // Check for idle timeout
          const idleTime = Date.now() - connection.lastUsed.getTime();
          if (idleTime > this.config.idleTimeoutMs && this.connections.size > this.config.minConnections) {
            promises.push(this.evictConnection(connection));
            continue;
          }

          // Health check
          promises.push(this.healthCheckConnection(connection).then(() => {}));
        }
      }

      await Promise.allSettled(promises);
      this.updateMetrics();
    }, this.config.healthCheckIntervalMs);
  }

  private getActiveConnectionCount(): number {
    return Array.from(this.connections.values()).filter(conn => conn.inUse).length;
  }

  private updateMetrics(): void {
    const connections = Array.from(this.connections.values());
    
    this.metrics.totalConnections = connections.length;
    this.metrics.activeConnections = connections.filter(c => c.inUse).length;
    this.metrics.idleConnections = connections.filter(c => !c.inUse && c.healthStatus === 'healthy').length;
    this.metrics.unhealthyConnections = connections.filter(c => c.healthStatus === 'unhealthy').length;
    this.metrics.poolUtilization = (this.metrics.activeConnections / this.config.maxConnections) * 100;
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

  public async executeWithConnection<T>(
    operation: (client: SupabaseClient) => Promise<T>,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      let connection: PoolConnection | null = null;

      try {
        connection = await this.getConnection();
        const result = await operation(connection.client);
        await this.releaseConnection(connection);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (connection) {
          connection.errorCount++;
          await this.releaseConnection(connection);
        }

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError || new Error('Operation failed after all retries');
  }

  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Wait for active connections to be released (with timeout)
    const shutdownTimeout = 30000; // 30 seconds
    const startShutdown = Date.now();

    while (this.getActiveConnectionCount() > 0 && (Date.now() - startShutdown) < shutdownTimeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Clear all connections
    this.connections.clear();
    this.updateMetrics();

    await ErrorHandlingService.logError({
      message: 'Connection pool shut down successfully',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.INFO,
      details: { shutdownDuration: Date.now() - startShutdown }
    });
  }
}

// Export singleton instance
export const connectionPool = ConnectionPoolService.getInstance();