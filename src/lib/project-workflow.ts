import { dbClient, Tables } from './db-client';
import { z } from 'zod';

// Validation schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().min(1, 'Project description is required'),
  clientId: z.string().uuid('Invalid client ID'),
  budgetKes: z.number().positive('Budget must be positive'),
  location: z.string().min(1, 'Location is required'),
  county: z.string().min(1, 'County is required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const updateProjectSchema = createProjectSchema.partial();

// Types
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  budgetKes: number;
  clientId: string;
  location: string;
  county: string;
  completionPercentage: number;
  featured: boolean;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  type: 'general' | 'issue' | 'update' | 'client_communication';
  visibility: 'internal' | 'client' | 'public';
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export class ProjectWorkflow {
  private static instance: ProjectWorkflow;

  public static getInstance(): ProjectWorkflow {
    if (!ProjectWorkflow.instance) {
      ProjectWorkflow.instance = new ProjectWorkflow();
    }
    return ProjectWorkflow.instance;
  }

  // Project Management
  async createProject(data: z.infer<typeof createProjectSchema>): Promise<{
    project?: Project;
    error?: string;
  }> {
    try {
      const validatedData = createProjectSchema.parse(data);

      const projectData = {
        ...validatedData,
        status: 'planning' as const,
        completionPercentage: 0,
        featured: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await dbClient.insert(Tables.projects, projectData);

      if (result.error) {
        return { error: 'Failed to create project' };
      }

      // Log project creation activity
      await this.logActivity({
        projectId: (result.data as any).id,
        action: 'project_created',
        description: `Project "${validatedData.title}" created`,
        metadata: { budget: validatedData.budgetKes, location: validatedData.location }
      });

      return { project: result.data as Project };
    } catch (error) {
      console.error('Create project error:', error);
      if (error instanceof z.ZodError) {
        return { error: error.errors.map(e => e.message).join(', ') };
      }
      return { error: 'Failed to create project' };
    }
  }

  async updateProject(
    projectId: string, 
    updates: z.infer<typeof updateProjectSchema>
  ): Promise<{ project?: Project; error?: string }> {
    try {
      const validatedUpdates = updateProjectSchema.parse(updates);

      const updateData = {
        ...validatedUpdates,
        updatedAt: new Date(),
      };

      const result = await dbClient.update(Tables.projects, projectId, updateData);

      if (result.error) {
        return { error: 'Failed to update project' };
      }

      // Log project update activity
      await this.logActivity({
        projectId,
        action: 'project_updated',
        description: 'Project details updated',
        metadata: validatedUpdates
      });

      return { project: result.data as Project };
    } catch (error) {
      console.error('Update project error:', error);
      if (error instanceof z.ZodError) {
        return { error: error.errors.map(e => e.message).join(', ') };
      }
      return { error: 'Failed to update project' };
    }
  }

  async getProject(projectId: string): Promise<{ project?: Project; error?: string }> {
    try {
      const result = await dbClient.findOne(Tables.projects, { id: projectId });

      if (result.error || !result.data) {
        return { error: 'Project not found' };
      }

      return { project: result.data as Project };
    } catch (error) {
      console.error('Get project error:', error);
      return { error: 'Failed to get project' };
    }
  }

  async getProjects(filters: {
    status?: string;
    clientId?: string;
    county?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ projects: Project[]; total: number; error?: string }> {
    try {
      const filterOptions = [];

      if (filters.status) {
        filterOptions.push({ column: 'status', operator: 'eq' as const, value: filters.status });
      }
      if (filters.clientId) {
        filterOptions.push({ column: 'clientId', operator: 'eq' as const, value: filters.clientId });
      }
      if (filters.county) {
        filterOptions.push({ column: 'county', operator: 'eq' as const, value: filters.county });
      }
      if (filters.featured !== undefined) {
        filterOptions.push({ column: 'featured', operator: 'eq' as const, value: filters.featured });
      }

      const result = await dbClient.selectPaginated(
        Tables.projects,
        Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1,
        filters.limit || 10,
        {
          filters: filterOptions,
          orderBy: 'createdAt',
          orderDirection: 'desc'
        }
      );

      return {
        projects: result.data as Project[],
        total: result.total
      };
    } catch (error) {
      console.error('Get projects error:', error);
      return { projects: [], total: 0, error: 'Failed to get projects' };
    }
  }

  async updateProjectStatus(
    projectId: string, 
    newStatus: Project['status']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await dbClient.update(Tables.projects, projectId, {
        status: newStatus,
        updatedAt: new Date(),
      });

      if (result.error) {
        return { success: false, error: 'Failed to update project status' };
      }

      // Log status change
      await this.logActivity({
        projectId,
        action: 'status_changed',
        description: `Project status changed to ${newStatus}`,
        metadata: { newStatus, previousStatus: 'unknown' } // TODO: Get previous status
      });

      return { success: true };
    } catch (error) {
      console.error('Update project status error:', error);
      return { success: false, error: 'Failed to update project status' };
    }
  }

  async updateProjectProgress(
    projectId: string, 
    percentage: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (percentage < 0 || percentage > 100) {
        return { success: false, error: 'Progress percentage must be between 0 and 100' };
      }

      const result = await dbClient.update(Tables.projects, projectId, {
        completionPercentage: percentage,
        updatedAt: new Date(),
      });

      if (result.error) {
        return { success: false, error: 'Failed to update project progress' };
      }

      // Log progress update
      await this.logActivity({
        projectId,
        action: 'progress_updated',
        description: `Project progress updated to ${percentage}%`,
        metadata: { percentage }
      });

      // Auto-complete project if 100%
      if (percentage === 100) {
        await this.updateProjectStatus(projectId, 'completed');
      }

      return { success: true };
    } catch (error) {
      console.error('Update project progress error:', error);
      return { success: false, error: 'Failed to update project progress' };
    }
  }

  // Task Management
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
    task?: Task;
    error?: string;
  }> {
    try {
      const newTask = {
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // For now, store in mock data or implement tasks table
      const mockTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        ...newTask,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Log task creation
      await this.logActivity({
        projectId: taskData.projectId,
        action: 'task_created',
        description: `Task "${taskData.title}" created`,
        metadata: { taskId: mockTask.id, priority: taskData.priority }
      });

      return { task: mockTask };
    } catch (error) {
      console.error('Create task error:', error);
      return { error: 'Failed to create task' };
    }
  }

  async updateTaskStatus(
    taskId: string, 
    projectId: string, 
    newStatus: Task['status']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Implement tasks table and proper update
      
      // Log task status change
      await this.logActivity({
        projectId,
        action: 'task_status_changed',
        description: `Task status changed to ${newStatus}`,
        metadata: { taskId, newStatus }
      });

      return { success: true };
    } catch (error) {
      console.error('Update task status error:', error);
      return { success: false, error: 'Failed to update task status' };
    }
  }

  // Milestone Management
  async createMilestone(milestoneData: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
    milestone?: Milestone;
    error?: string;
  }> {
    try {
      // TODO: Implement milestones table
      const mockMilestone: Milestone = {
        id: Math.random().toString(36).substr(2, 9),
        ...milestoneData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Log milestone creation
      await this.logActivity({
        projectId: milestoneData.projectId,
        action: 'milestone_created',
        description: `Milestone "${milestoneData.title}" created`,
        metadata: { milestoneId: mockMilestone.id, dueDate: milestoneData.dueDate }
      });

      return { milestone: mockMilestone };
    } catch (error) {
      console.error('Create milestone error:', error);
      return { error: 'Failed to create milestone' };
    }
  }

  async completeMilestone(
    milestoneId: string, 
    projectId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Implement milestone completion
      
      // Log milestone completion
      await this.logActivity({
        projectId,
        action: 'milestone_completed',
        description: 'Milestone completed',
        metadata: { milestoneId }
      });

      return { success: true };
    } catch (error) {
      console.error('Complete milestone error:', error);
      return { success: false, error: 'Failed to complete milestone' };
    }
  }

  // Activity Logging
  private async logActivity(activity: {
    projectId: string;
    userId?: string;
    action: string;
    description: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const activityData = {
        userId: activity.userId || null,
        action: activity.action,
        resource: 'project',
        resourceId: activity.projectId,
        details: {
          description: activity.description,
          ...activity.metadata
        },
        createdAt: new Date(),
      };

      await dbClient.insert(Tables.activityLogs, activityData);
    } catch (error) {
      console.error('Log activity error:', error);
      // Don't throw error for logging failures
    }
  }

  // Project Analytics
  async getProjectStats(projectId?: string): Promise<{
    stats: {
      totalProjects: number;
      activeProjects: number;
      completedProjects: number;
      overdueProjects: number;
      totalBudget: number;
      averageProgress: number;
    };
    error?: string;
  }> {
    try {
      const filters = projectId ? [{ column: 'id', operator: 'eq' as const, value: projectId }] : [];

      const [
        totalResult,
        activeResult,
        completedResult,
        allProjectsResult
      ] = await Promise.all([
        dbClient.count(Tables.projects, filters),
        dbClient.count(Tables.projects, [...filters, { column: 'status', operator: 'eq', value: 'active' }]),
        dbClient.count(Tables.projects, [...filters, { column: 'status', operator: 'eq', value: 'completed' }]),
        dbClient.select(Tables.projects, { filters })
      ]);

      const projects = allProjectsResult.data as Project[] || [];
      
      // Calculate overdue projects
      const now = new Date();
      const overdueProjects = projects.filter(p => 
        p.status === 'active' && new Date(p.endDate) < now
      ).length;

      // Calculate total budget and average progress
      const totalBudget = projects.reduce((sum, p) => sum + p.budgetKes, 0);
      const averageProgress = projects.length > 0 
        ? projects.reduce((sum, p) => sum + p.completionPercentage, 0) / projects.length 
        : 0;

      return {
        stats: {
          totalProjects: totalResult.data || 0,
          activeProjects: activeResult.data || 0,
          completedProjects: completedResult.data || 0,
          overdueProjects,
          totalBudget,
          averageProgress
        }
      };
    } catch (error) {
      console.error('Get project stats error:', error);
      return {
        stats: {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          overdueProjects: 0,
          totalBudget: 0,
          averageProgress: 0
        },
        error: 'Failed to get project statistics'
      };
    }
  }

  // Project Search
  async searchProjects(query: string): Promise<{ projects: Project[]; error?: string }> {
    try {
      const result = await dbClient.select(Tables.projects, {
        filters: [
          { column: 'title', operator: 'like', value: query }
        ],
        limit: 20,
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      return { projects: result.data as Project[] || [] };
    } catch (error) {
      console.error('Search projects error:', error);
      return { projects: [], error: 'Failed to search projects' };
    }
  }

  // Client Projects
  async getClientProjects(clientId: string): Promise<{ projects: Project[]; error?: string }> {
    try {
      const result = await dbClient.select(Tables.projects, {
        filters: [{ column: 'clientId', operator: 'eq', value: clientId }],
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      return { projects: result.data as Project[] || [] };
    } catch (error) {
      console.error('Get client projects error:', error);
      return { projects: [], error: 'Failed to get client projects' };
    }
  }
}

// Export singleton instance
export const projectWorkflow = ProjectWorkflow.getInstance();
export default projectWorkflow;