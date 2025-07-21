import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  User, 
  Clock,
  AlertCircle,
  CheckCircle,
  Target,
  Flag,
  Filter,
  Search,
  Zap,
  Eye,
  Edit,
  Trash2,
  Copy,
  Link,
  MessageSquare,
  Paperclip,
  Timer,
  TrendingUp,
  BarChart3,
  Users,
  Archive,
  Star,
  Lightbulb,
  Rocket,
  Award,
  Settings,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

// React Beautiful DnD (you'll need to install this)
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignees: User[];
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  tags: string[];
  dependencies: string[];
  subtasks: SubTask[];
  attachments: Attachment[];
  comments: Comment[];
  milestone_id?: string;
  project_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  automation_triggers?: string[];
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: User;
  due_date?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  due_date: string;
  progress: number;
  status: 'upcoming' | 'active' | 'completed' | 'overdue';
  tasks: string[];
  deliverables: string[];
  budget_allocated: number;
  budget_spent: number;
  project_id: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_by: string;
  uploaded_at: string;
}

interface Comment {
  id: string;
  content: string;
  author: User;
  created_at: string;
  mentions: string[];
}

interface TaskBoardProps {
  projectId: string;
  tasks: Task[];
  milestones: Milestone[];
  users: User[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskCreate: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onMilestoneUpdate: (milestoneId: string, updates: Partial<Milestone>) => Promise<void>;
}

export const DragDropTaskBoard: React.FC<TaskBoardProps> = ({
  projectId,
  tasks,
  milestones,
  users,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onMilestoneUpdate
}) => {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  const [viewMode, setViewMode] = useState<'board' | 'timeline' | 'calendar' | 'milestones'>('board');
  const [filters, setFilters] = useState({
    assignee: '',
    priority: '',
    milestone: '',
    tags: [] as string[],
    search: ''
  });
  const [autoOrganize, setAutoOrganize] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'bg-gray-100', limit: null },
    { id: 'todo', title: 'To Do', color: 'bg-blue-100', limit: 5 },
    { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-100', limit: 3 },
    { id: 'review', title: 'Review', color: 'bg-purple-100', limit: 2 },
    { id: 'done', title: 'Done', color: 'bg-green-100', limit: null },
    { id: 'archived', title: 'Archived', color: 'bg-gray-50', limit: null }
  ];

  // Filter tasks based on current filters
  const filteredTasks = localTasks.filter(task => {
    if (filters.assignee && !task.assignees.some(a => a.id === filters.assignee)) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.milestone && task.milestone_id !== filters.milestone) return false;
    if (filters.tags.length > 0 && !filters.tags.some(tag => task.tags.includes(tag))) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !task.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  // Drag and drop handler
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const task = localTasks.find(t => t.id === draggableId);
    if (!task) return;

    // Check column limits
    const destinationColumn = columns.find(c => c.id === destination.droppableId);
    if (destinationColumn?.limit) {
      const destinationTasks = tasksByStatus[destination.droppableId];
      if (destinationTasks.length >= destinationColumn.limit && source.droppableId !== destination.droppableId) {
        toast.error(`Column "${destinationColumn.title}" is at capacity (${destinationColumn.limit} tasks)`);
        return;
      }
    }

    // Update task status
    const updatedTask = { ...task, status: destination.droppableId as Task['status'] };
    
    // Auto-organize logic
    if (autoOrganize) {
      await applyAutoOrganizeRules(updatedTask);
    }

    setLocalTasks(prev => prev.map(t => t.id === draggableId ? updatedTask : t));
    
    try {
      await onTaskUpdate(draggableId, { status: destination.droppableId });
      toast.success('Task updated successfully');
      
      // Trigger automations based on status change
      if (task.automation_triggers?.includes('status_change')) {
        await triggerAutomation(task, 'status_change', {
          old_status: source.droppableId,
          new_status: destination.droppableId
        });
      }
    } catch (error) {
      // Revert on error
      setLocalTasks(prev => prev.map(t => t.id === draggableId ? task : t));
      toast.error('Failed to update task');
    }
  };

  // Auto-organize rules
  const applyAutoOrganizeRules = async (task: Task) => {
    const now = new Date();
    const dueDate = new Date(task.due_date);
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    // Auto-prioritize based on due date
    if (daysDiff <= 1 && task.priority !== 'critical') {
      await onTaskUpdate(task.id, { priority: 'critical' });
    } else if (daysDiff <= 3 && task.priority === 'low') {
      await onTaskUpdate(task.id, { priority: 'medium' });
    }

    // Auto-assign based on workload balancing
    if (task.assignees.length === 0) {
      const availableUser = getOptimalAssignee();
      if (availableUser) {
        await onTaskUpdate(task.id, { assignees: [availableUser] });
      }
    }
  };

  // Get optimal assignee based on current workload
  const getOptimalAssignee = (): User | null => {
    const userWorkloads = users.map(user => {
      const userTasks = localTasks.filter(task => 
        task.assignees.some(a => a.id === user.id) && 
        ['todo', 'in_progress', 'review'].includes(task.status)
      );
      return {
        user,
        taskCount: userTasks.length,
        totalHours: userTasks.reduce((sum, task) => sum + task.estimated_hours, 0)
      };
    });

    userWorkloads.sort((a, b) => a.totalHours - b.totalHours);
    return userWorkloads[0]?.user || null;
  };

  // Trigger automation
  const triggerAutomation = async (task: Task, trigger: string, context: any) => {
    // This would integrate with the AdvancedAutomationService
    console.log('Triggering automation:', trigger, task, context);
  };

  // Create new task
  const handleCreateTask = async () => {
    if (!newTask.title) {
      toast.error('Task title is required');
      return;
    }

    const task: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
      title: newTask.title || '',
      description: newTask.description || '',
      status: 'backlog',
      priority: newTask.priority || 'medium',
      assignees: newTask.assignees || [],
      due_date: newTask.due_date || '',
      estimated_hours: newTask.estimated_hours || 0,
      actual_hours: 0,
      tags: newTask.tags || [],
      dependencies: [],
      subtasks: [],
      attachments: [],
      comments: [],
      milestone_id: newTask.milestone_id,
      project_id: projectId,
      created_by: 'current_user' // This should come from auth context
    };

    try {
      await onTaskCreate(task);
      setNewTask({});
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  // Calculate project statistics
  const projectStats = {
    totalTasks: localTasks.length,
    completedTasks: localTasks.filter(t => t.status === 'done').length,
    overdueTasks: localTasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'done').length,
    totalHours: localTasks.reduce((sum, t) => sum + t.estimated_hours, 0),
    actualHours: localTasks.reduce((sum, t) => sum + t.actual_hours, 0),
    averageCompletionTime: 0 // This would be calculated from historical data
  };

  // Task Card Component
  const TaskCard: React.FC<{ task: Task; index: number }> = ({ task, index }) => (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm border p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
          }`}
          onClick={() => setSelectedTask(task)}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-sm text-gray-900 flex-1 pr-2">{task.title}</h4>
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {task.due_date && (
                <div className={`flex items-center gap-1 ${
                  new Date(task.due_date) < new Date() ? 'text-red-500' : ''
                }`}>
                  <Calendar className="h-3 w-3" />
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
              {task.estimated_hours > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimated_hours}h
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {task.comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {task.comments.length}
                </div>
              )}
              {task.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {task.attachments.length}
                </div>
              )}
            </div>
          </div>

          {task.assignees.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {task.assignees.slice(0, 3).map(assignee => (
                <Avatar key={assignee.id} className="h-6 w-6">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {assignee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignees.length > 3 && (
                <span className="text-xs text-gray-500">+{task.assignees.length - 3}</span>
              )}
            </div>
          )}

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {task.subtasks.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span>Subtasks</span>
                <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
              </div>
              <Progress 
                value={(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100} 
                className="h-1 mt-1"
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );

  // Milestone Card Component
  const MilestoneCard: React.FC<{ milestone: Milestone }> = ({ milestone }) => {
    const milestoneProgress = (milestone.tasks.length > 0) 
      ? (localTasks.filter(t => t.milestone_id === milestone.id && t.status === 'done').length / milestone.tasks.length) * 100
      : 0;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">{milestone.title}</CardTitle>
            </div>
            <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
              {milestone.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(milestoneProgress)}%</span>
            </div>
            <Progress value={milestoneProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <span className="text-gray-500">Due Date</span>
              <p className="font-medium">{new Date(milestone.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Tasks</span>
              <p className="font-medium">{milestone.tasks.length}</p>
            </div>
            <div>
              <span className="text-gray-500">Budget</span>
              <p className="font-medium">${milestone.budget_allocated.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Spent</span>
              <p className="font-medium">${milestone.budget_spent.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Project Board</h2>
          <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <TabsList>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAutoOrganize(!autoOrganize)}
            className={autoOrganize ? 'bg-blue-50 text-blue-600' : ''}
          >
            <Zap className="h-4 w-4 mr-2" />
            Auto-organize
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newTask.title || ''}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task title..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newTask.priority} onValueChange={(value: any) => 
                      setNewTask(prev => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={newTask.due_date || ''}
                      onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-64"
          />
        </div>

        <Select value={filters.assignee} onValueChange={(value) => 
          setFilters(prev => ({ ...prev, assignee: value }))
        }>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Assignees</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(value) => 
          setFilters(prev => ({ ...prev, priority: value }))
        }>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        {milestones.length > 0 && (
          <Select value={filters.milestone} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, milestone: value }))
          }>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Milestone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Milestones</SelectItem>
              {milestones.map(milestone => (
                <SelectItem key={milestone.id} value={milestone.id}>{milestone.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="p-4 bg-blue-50 border-b">
          <div className="grid grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{projectStats.totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{projectStats.completedTasks}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{projectStats.overdueTasks}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{projectStats.totalHours}h</div>
              <div className="text-sm text-gray-600">Estimated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{projectStats.actualHours}h</div>
              <div className="text-sm text-gray-600">Actual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'board' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="h-full overflow-x-auto">
              <div className="flex gap-4 p-4 min-w-max">
                {columns.map(column => (
                  <div key={column.id} className="w-72 flex-shrink-0">
                    <div className={`rounded-lg ${column.color} p-3 mb-3`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{column.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {tasksByStatus[column.id]?.length || 0}
                          </Badge>
                          {column.limit && (
                            <Badge variant="outline" className="text-xs">
                              /{column.limit}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-96 rounded-lg p-2 transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                          }`}
                        >
                          {tasksByStatus[column.id]?.map((task, index) => (
                            <TaskCard key={task.id} task={task} index={index} />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>
          </DragDropContext>
        )}

        {viewMode === 'milestones' && (
          <div className="p-4 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Project Milestones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {milestones.map(milestone => (
                  <MilestoneCard key={milestone.id} milestone={milestone} />
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="p-4">
            <div className="text-center py-20 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Timeline View</h3>
              <p>Timeline visualization coming soon...</p>
            </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="p-4">
            <div className="text-center py-20 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Calendar View</h3>
              <p>Calendar integration coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{selectedTask.title}</span>
                <Badge className={getPriorityColor(selectedTask.priority)}>
                  {selectedTask.priority}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700">{selectedTask.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="capitalize">{selectedTask.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span>{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Hours:</span>
                      <span>{selectedTask.estimated_hours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual Hours:</span>
                      <span>{selectedTask.actual_hours}h</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Assignees</h4>
                  <div className="space-y-2">
                    {selectedTask.assignees.map(assignee => (
                      <div key={assignee.id} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback className="text-xs">
                            {assignee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{assignee.name}</span>
                      </div>
                    ))}
                    {selectedTask.assignees.length === 0 && (
                      <p className="text-sm text-gray-500">No assignees</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedTask.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.subtasks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Subtasks</h4>
                  <div className="space-y-2">
                    {selectedTask.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={subtask.completed}
                          className="rounded border-gray-300"
                          readOnly
                        />
                        <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DragDropTaskBoard;