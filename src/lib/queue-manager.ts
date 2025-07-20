import { ErrorHandlingService, ErrorSeverity, ErrorCategory } from './error-handling';
import { connectionPool } from './connection-pool';

export enum QueuePriority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
  BACKGROUND = 5
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  DEAD = 'dead'
}

export interface QueueJob {
  id: string;
  type: string;
  priority: QueuePriority;
  status: JobStatus;
  data: Record<string, any>;
  metadata: {
    createdAt: Date;
    scheduledAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    retryCount: number;
    maxRetries: number;
    error?: string;
    processingTime?: number;
    workerId?: string;
  };
  dependencies?: string[];
  tags?: string[];
}

export interface QueueWorker {
  id: string;
  name: string;
  concurrency: number;
  activeJobs: Set<string>;
  lastHeartbeat: Date;
  isActive: boolean;
  supportedJobTypes: string[];
  processingStats: {
    totalProcessed: number;
    totalFailed: number;
    averageProcessingTime: number;
  };
}

export interface QueueMetrics {
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  deadJobs: number;
  averageWaitTime: number;
  averageProcessingTime: number;
  throughput: number;
  errorRate: number;
}

interface QueueConfig {
  maxConcurrentJobs: number;
  maxRetries: number;
  retryDelayMs: number;
  jobTimeoutMs: number;
  deadLetterThreshold: number;
  heartbeatIntervalMs: number;
  cleanupIntervalMs: number;
  metricsIntervalMs: number;
}

export class QueueManager {
  private static instance: QueueManager;
  private jobs: Map<string, QueueJob> = new Map();
  private workers: Map<string, QueueWorker> = new Map();
  private pendingQueues: Map<QueuePriority, QueueJob[]> = new Map();
  private processingJobs: Map<string, QueueJob> = new Map();
  private deadLetterQueue: QueueJob[] = [];
  private jobHandlers: Map<string, (job: QueueJob) => Promise<any>> = new Map();
  private config: QueueConfig;
  private metrics: QueueMetrics;
  private isRunning: boolean = false;
  private workerIntervals: Map<string, NodeJS.Timeout> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      maxConcurrentJobs: 10,
      maxRetries: 3,
      retryDelayMs: 1000,
      jobTimeoutMs: 300000, // 5 minutes
      deadLetterThreshold: 100,
      heartbeatIntervalMs: 30000,
      cleanupIntervalMs: 60000,
      metricsIntervalMs: 10000
    };

    this.metrics = {
      totalJobs: 0,
      pendingJobs: 0,
      processingJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      deadJobs: 0,
      averageWaitTime: 0,
      averageProcessingTime: 0,
      throughput: 0,
      errorRate: 0
    };

    // Initialize priority queues
    Object.values(QueuePriority).forEach(priority => {
      if (typeof priority === 'number') {
        this.pendingQueues.set(priority, []);
      }
    });

    this.initialize();
  }

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Load persisted jobs from database
      await this.loadPersistedJobs();
      
      // Start background processes
      this.startCleanupProcess();
      this.startMetricsCollection();
      
      this.isRunning = true;

      await ErrorHandlingService.logError({
        message: 'Queue manager initialized successfully',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.INFO,
        details: { config: this.config }
      });
    } catch (error) {
      await ErrorHandlingService.logError({
        message: 'Failed to initialize queue manager',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.CRITICAL,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  public registerJobHandler(jobType: string, handler: (job: QueueJob) => Promise<any>): void {
    this.jobHandlers.set(jobType, handler);
  }

  public async addJob(
    type: string,
    data: Record<string, any>,
    options: {
      priority?: QueuePriority;
      delay?: number;
      maxRetries?: number;
      dependencies?: string[];
      tags?: string[];
    } = {}
  ): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const scheduledAt = options.delay ? new Date(now.getTime() + options.delay) : now;

    const job: QueueJob = {
      id: jobId,
      type,
      priority: options.priority || QueuePriority.NORMAL,
      status: JobStatus.PENDING,
      data,
      metadata: {
        createdAt: now,
        scheduledAt,
        retryCount: 0,
        maxRetries: options.maxRetries || this.config.maxRetries
      },
      dependencies: options.dependencies,
      tags: options.tags
    };

    try {
      // Persist job to database
      await this.persistJob(job);
      
      // Add to queue
      this.jobs.set(jobId, job);
      this.addToQueue(job);
      
      this.metrics.totalJobs++;
      this.updateMetrics();

      await ErrorHandlingService.logError({
        message: 'Job added to queue',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.INFO,
        details: { 
          jobId, 
          type, 
          priority: job.priority,
          scheduledAt: job.metadata.scheduledAt
        }
      });

      return jobId;
    } catch (error) {
      await ErrorHandlingService.logError({
        message: 'Failed to add job to queue',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        details: { 
          jobId, 
          type, 
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  public async registerWorker(
    name: string,
    supportedJobTypes: string[],
    concurrency: number = 1
  ): Promise<string> {
    const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const worker: QueueWorker = {
      id: workerId,
      name,
      concurrency,
      activeJobs: new Set(),
      lastHeartbeat: new Date(),
      isActive: true,
      supportedJobTypes,
      processingStats: {
        totalProcessed: 0,
        totalFailed: 0,
        averageProcessingTime: 0
      }
    };

    this.workers.set(workerId, worker);
    
    // Start worker process
    this.startWorker(worker);

    await ErrorHandlingService.logError({
      message: 'Worker registered successfully',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.INFO,
      details: { 
        workerId, 
        name, 
        supportedJobTypes, 
        concurrency 
      }
    });

    return workerId;
  }

  private startWorker(worker: QueueWorker): void {
    const processJobs = async () => {
      if (!this.isRunning || !worker.isActive) return;

      try {
        // Update heartbeat
        worker.lastHeartbeat = new Date();

        // Process jobs if worker has capacity
        while (worker.activeJobs.size < worker.concurrency) {
          const job = this.getNextJob(worker.supportedJobTypes);
          if (!job) break;

          await this.processJob(job, worker);
        }
      } catch (error) {
        await ErrorHandlingService.logError({
          message: 'Worker error during job processing',
          category: ErrorCategory.SYSTEM,
          severity: ErrorSeverity.HIGH,
          details: { 
            workerId: worker.id,
            error: error instanceof Error ? error.message : String(error)
          }
        });
      }
    };

    // Start worker interval
    const interval = setInterval(processJobs, 1000);
    this.workerIntervals.set(worker.id, interval);
    
    // Initial processing
    processJobs();
  }

  private getNextJob(supportedJobTypes: string[]): QueueJob | null {
    // Check jobs by priority
    for (const priority of [QueuePriority.CRITICAL, QueuePriority.HIGH, QueuePriority.NORMAL, QueuePriority.LOW, QueuePriority.BACKGROUND]) {
      const queue = this.pendingQueues.get(priority);
      if (!queue) continue;

      for (let i = 0; i < queue.length; i++) {
        const job = queue[i];
        
        // Check if job type is supported
        if (!supportedJobTypes.includes(job.type)) continue;
        
        // Check if job is ready (scheduled time passed)
        if (job.metadata.scheduledAt > new Date()) continue;
        
        // Check dependencies
        if (job.dependencies && !this.areDependenciesMet(job.dependencies)) continue;

        // Remove from queue and return
        queue.splice(i, 1);
        return job;
      }
    }

    return null;
  }

  private areDependenciesMet(dependencies: string[]): boolean {
    return dependencies.every(depId => {
      const depJob = this.jobs.get(depId);
      return depJob && depJob.status === JobStatus.COMPLETED;
    });
  }

  private async processJob(job: QueueJob, worker: QueueWorker): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Mark job as processing
      job.status = JobStatus.PROCESSING;
      job.metadata.startedAt = new Date();
      job.metadata.workerId = worker.id;
      
      this.processingJobs.set(job.id, job);
      worker.activeJobs.add(job.id);
      
      // Update job in database
      await this.persistJob(job);

      // Get job handler
      const handler = this.jobHandlers.get(job.type);
      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.type}`);
      }

      // Set timeout for job processing
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), this.config.jobTimeoutMs);
      });

      // Process the job
      const result = await Promise.race([
        handler(job),
        timeoutPromise
      ]);

      // Job completed successfully
      job.status = JobStatus.COMPLETED;
      job.metadata.completedAt = new Date();
      job.metadata.processingTime = Date.now() - startTime;
      
      this.processingJobs.delete(job.id);
      worker.activeJobs.delete(job.id);
      
      // Update worker stats
      worker.processingStats.totalProcessed++;
      worker.processingStats.averageProcessingTime = 
        (worker.processingStats.averageProcessingTime + job.metadata.processingTime) / 2;

      // Update job in database
      await this.persistJob(job);

      this.metrics.completedJobs++;
      this.updateMetrics();

      await ErrorHandlingService.logError({
        message: 'Job completed successfully',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.INFO,
        details: { 
          jobId: job.id,
          type: job.type,
          processingTime: job.metadata.processingTime,
          workerId: worker.id
        }
      });

    } catch (error) {
      await this.handleJobFailure(job, worker, error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async handleJobFailure(job: QueueJob, worker: QueueWorker, error: Error): Promise<void> {
    job.metadata.error = error.message;
    job.metadata.retryCount++;
    
    this.processingJobs.delete(job.id);
    worker.activeJobs.delete(job.id);
    worker.processingStats.totalFailed++;

    if (job.metadata.retryCount <= job.metadata.maxRetries) {
      // Retry the job
      job.status = JobStatus.RETRYING;
      
      // Calculate exponential backoff delay
      const delay = this.config.retryDelayMs * Math.pow(2, job.metadata.retryCount - 1);
      job.metadata.scheduledAt = new Date(Date.now() + delay);
      
      this.addToQueue(job);
      
      await ErrorHandlingService.logError({
        message: 'Job failed, scheduling retry',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        details: { 
          jobId: job.id,
          retryCount: job.metadata.retryCount,
          maxRetries: job.metadata.maxRetries,
          delay,
          error: error.message
        }
      });
    } else {
      // Move to dead letter queue
      job.status = JobStatus.DEAD;
      job.metadata.completedAt = new Date();
      
      this.deadLetterQueue.push(job);
      this.metrics.deadJobs++;
      
      // Limit dead letter queue size
      if (this.deadLetterQueue.length > this.config.deadLetterThreshold) {
        this.deadLetterQueue.shift();
      }

      await ErrorHandlingService.logError({
        message: 'Job moved to dead letter queue',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        details: { 
          jobId: job.id,
          type: job.type,
          retryCount: job.metadata.retryCount,
          error: error.message
        }
      });
    }

    await this.persistJob(job);
    this.metrics.failedJobs++;
    this.updateMetrics();
  }

  private addToQueue(job: QueueJob): void {
    const queue = this.pendingQueues.get(job.priority);
    if (queue) {
      queue.push(job);
      queue.sort((a, b) => a.metadata.scheduledAt.getTime() - b.metadata.scheduledAt.getTime());
    }
  }

  private async persistJob(job: QueueJob): Promise<void> {
    try {
      await connectionPool.executeWithConnection(async (client) => {
        const { error } = await client
          .from('queue_jobs')
          .upsert({
            id: job.id,
            type: job.type,
            priority: job.priority,
            status: job.status,
            data: job.data,
            metadata: job.metadata,
            dependencies: job.dependencies,
            tags: job.tags,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      });
    } catch (error) {
      await ErrorHandlingService.logError({
        message: 'Failed to persist job',
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        details: { 
          jobId: job.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  private async loadPersistedJobs(): Promise<void> {
    try {
      await connectionPool.executeWithConnection(async (client) => {
        const { data, error } = await client
          .from('queue_jobs')
          .select('*')
          .in('status', [JobStatus.PENDING, JobStatus.RETRYING, JobStatus.PROCESSING]);

        if (error) throw error;

        if (data) {
          for (const jobData of data) {
            const job: QueueJob = {
              id: jobData.id,
              type: jobData.type,
              priority: jobData.priority,
              status: jobData.status,
              data: jobData.data,
              metadata: {
                ...jobData.metadata,
                createdAt: new Date(jobData.metadata.createdAt),
                scheduledAt: new Date(jobData.metadata.scheduledAt),
                startedAt: jobData.metadata.startedAt ? new Date(jobData.metadata.startedAt) : undefined,
                completedAt: jobData.metadata.completedAt ? new Date(jobData.metadata.completedAt) : undefined
              },
              dependencies: jobData.dependencies,
              tags: jobData.tags
            };

            this.jobs.set(job.id, job);
            
            if (job.status === JobStatus.PENDING || job.status === JobStatus.RETRYING) {
              this.addToQueue(job);
            } else if (job.status === JobStatus.PROCESSING) {
              // Reset processing jobs to pending on startup
              job.status = JobStatus.PENDING;
              this.addToQueue(job);
            }
          }
        }
      });
    } catch (error) {
      await ErrorHandlingService.logError({
        message: 'Failed to load persisted jobs',
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(async () => {
      try {
        // Remove completed jobs older than 24 hours
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        for (const [jobId, job] of this.jobs.entries()) {
          if (job.status === JobStatus.COMPLETED && 
              job.metadata.completedAt && 
              job.metadata.completedAt < cutoffTime) {
            this.jobs.delete(jobId);
          }
        }

        // Clean up inactive workers
        for (const [workerId, worker] of this.workers.entries()) {
          const timeSinceHeartbeat = Date.now() - worker.lastHeartbeat.getTime();
          if (timeSinceHeartbeat > this.config.heartbeatIntervalMs * 3) {
            worker.isActive = false;
            
            // Move worker's active jobs back to queue
            for (const jobId of worker.activeJobs) {
              const job = this.jobs.get(jobId);
              if (job) {
                job.status = JobStatus.PENDING;
                this.addToQueue(job);
                this.processingJobs.delete(jobId);
              }
            }
            
            worker.activeJobs.clear();
          }
        }
      } catch (error) {
        await ErrorHandlingService.logError({
          message: 'Error during cleanup process',
          category: ErrorCategory.SYSTEM,
          severity: ErrorSeverity.MEDIUM,
          details: { error: error instanceof Error ? error.message : String(error) }
        });
      }
    }, this.config.cleanupIntervalMs);
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
    }, this.config.metricsIntervalMs);
  }

  private updateMetrics(): void {
    const jobs = Array.from(this.jobs.values());
    
    this.metrics.pendingJobs = jobs.filter(j => j.status === JobStatus.PENDING || j.status === JobStatus.RETRYING).length;
    this.metrics.processingJobs = jobs.filter(j => j.status === JobStatus.PROCESSING).length;
    this.metrics.completedJobs = jobs.filter(j => j.status === JobStatus.COMPLETED).length;
    this.metrics.failedJobs = jobs.filter(j => j.status === JobStatus.FAILED).length;
    
    // Calculate average wait time
    const completedJobs = jobs.filter(j => j.status === JobStatus.COMPLETED && j.metadata.startedAt);
    if (completedJobs.length > 0) {
      const totalWaitTime = completedJobs.reduce((sum, job) => {
        return sum + (job.metadata.startedAt!.getTime() - job.metadata.createdAt.getTime());
      }, 0);
      this.metrics.averageWaitTime = totalWaitTime / completedJobs.length;
    }

    // Calculate average processing time
    const jobsWithProcessingTime = jobs.filter(j => j.metadata.processingTime);
    if (jobsWithProcessingTime.length > 0) {
      const totalProcessingTime = jobsWithProcessingTime.reduce((sum, job) => sum + job.metadata.processingTime!, 0);
      this.metrics.averageProcessingTime = totalProcessingTime / jobsWithProcessingTime.length;
    }

    // Calculate error rate
    const totalProcessedJobs = this.metrics.completedJobs + this.metrics.failedJobs;
    this.metrics.errorRate = totalProcessedJobs > 0 ? (this.metrics.failedJobs / totalProcessedJobs) * 100 : 0;
  }

  public getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  public getJobStatus(jobId: string): QueueJob | null {
    return this.jobs.get(jobId) || null;
  }

  public getWorkers(): QueueWorker[] {
    return Array.from(this.workers.values());
  }

  public getDeadLetterQueue(): QueueJob[] {
    return [...this.deadLetterQueue];
  }

  public async retryDeadJob(jobId: string): Promise<boolean> {
    const deadJobIndex = this.deadLetterQueue.findIndex(job => job.id === jobId);
    if (deadJobIndex === -1) return false;

    const job = this.deadLetterQueue[deadJobIndex];
    job.status = JobStatus.PENDING;
    job.metadata.retryCount = 0;
    job.metadata.error = undefined;
    job.metadata.scheduledAt = new Date();

    this.deadLetterQueue.splice(deadJobIndex, 1);
    this.addToQueue(job);
    await this.persistJob(job);

    return true;
  }

  public async shutdown(): Promise<void> {
    this.isRunning = false;

    // Stop all worker intervals
    for (const interval of this.workerIntervals.values()) {
      clearInterval(interval);
    }
    this.workerIntervals.clear();

    // Stop cleanup and metrics intervals
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    // Wait for active jobs to complete
    const shutdownTimeout = 30000;
    const startShutdown = Date.now();

    while (this.processingJobs.size > 0 && (Date.now() - startShutdown) < shutdownTimeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await ErrorHandlingService.logError({
      message: 'Queue manager shut down successfully',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.INFO,
      details: { 
        shutdownDuration: Date.now() - startShutdown,
        remainingJobs: this.processingJobs.size
      }
    });
  }
}

// Export singleton instance
export const queueManager = QueueManager.getInstance();