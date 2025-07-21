import { supabase } from "@/integrations/supabase/client";
import { ErrorHandler } from "./error-handling";
import { QueueManager } from "./queue-manager";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  event_type: 'meeting' | 'deadline' | 'milestone' | 'appointment' | 'reminder' | 'project_phase';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  project_id?: string;
  client_id?: string;
  assigned_to?: string[];
  location?: string;
  meeting_link?: string;
  attachments?: string[];
  reminders: CalendarReminder[];
  recurrence?: CalendarRecurrence;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarReminder {
  id: string;
  event_id: string;
  reminder_time: string;
  type: 'email' | 'sms' | 'push' | 'system';
  status: 'pending' | 'sent' | 'failed';
  recipients: string[];
}

export interface CalendarRecurrence {
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  end_date?: string;
  occurrences?: number;
  days_of_week?: number[];
  day_of_month?: number;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda' | 'timeline';
  start_date: string;
  end_date: string;
  filters?: {
    event_types?: string[];
    priorities?: string[];
    projects?: string[];
    clients?: string[];
    assigned_users?: string[];
  };
}

export class CalendarManager {
  private errorHandler: ErrorHandler;
  private queueManager: QueueManager;

  constructor() {
    this.errorHandler = new ErrorHandler();
    this.queueManager = new QueueManager();
  }

  async createEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select('*')
        .single();

      if (error) throw error;

      // Schedule reminders
      if (event.reminders?.length > 0) {
        await this.scheduleReminders(data.id, event.reminders);
      }

      // Create recurring events if specified
      if (event.recurrence) {
        await this.createRecurringEvents(data.id, event.recurrence);
      }

      await this.logCalendarActivity('event_created', data.id, event.created_by);
      return data;
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.createEvent', 'high');
      throw error;
    }
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>, userId: string): Promise<CalendarEvent> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', eventId)
        .select('*')
        .single();

      if (error) throw error;

      // Update reminders if changed
      if (updates.reminders) {
        await this.updateEventReminders(eventId, updates.reminders);
      }

      await this.logCalendarActivity('event_updated', eventId, userId);
      return data;
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.updateEvent', 'medium');
      throw error;
    }
  }

  async deleteEvent(eventId: string, userId: string): Promise<void> {
    try {
      // Cancel all reminders
      await supabase
        .from('calendar_reminders')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId);

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      await this.logCalendarActivity('event_deleted', eventId, userId);
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.deleteEvent', 'medium');
      throw error;
    }
  }

  async getEvents(view: CalendarView): Promise<CalendarEvent[]> {
    try {
      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          calendar_reminders (*),
          projects (title),
          clients (name)
        `)
        .gte('start_date', view.start_date)
        .lte('end_date', view.end_date);

      // Apply filters
      if (view.filters) {
        if (view.filters.event_types?.length) {
          query = query.in('event_type', view.filters.event_types);
        }
        if (view.filters.priorities?.length) {
          query = query.in('priority', view.filters.priorities);
        }
        if (view.filters.projects?.length) {
          query = query.in('project_id', view.filters.projects);
        }
        if (view.filters.clients?.length) {
          query = query.in('client_id', view.filters.clients);
        }
      }

      const { data, error } = await query.order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.getEvents', 'low');
      return [];
    }
  }

  async scheduleReminders(eventId: string, reminders: CalendarReminder[]): Promise<void> {
    try {
      for (const reminder of reminders) {
        // Insert reminder into database
        await supabase
          .from('calendar_reminders')
          .insert({
            event_id: eventId,
            reminder_time: reminder.reminder_time,
            type: reminder.type,
            status: 'pending',
            recipients: reminder.recipients
          });

        // Schedule job for reminder
        await this.queueManager.addJob({
          type: 'send_calendar_reminder',
          priority: 'medium',
          scheduled_for: new Date(reminder.reminder_time),
          data: {
            event_id: eventId,
            reminder_id: reminder.id,
            type: reminder.type,
            recipients: reminder.recipients
          }
        });
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.scheduleReminders', 'medium');
    }
  }

  async createRecurringEvents(baseEventId: string, recurrence: CalendarRecurrence): Promise<void> {
    try {
      const { data: baseEvent } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', baseEventId)
        .single();

      if (!baseEvent) return;

      const events = this.generateRecurringEvents(baseEvent, recurrence);
      
      if (events.length > 0) {
        await supabase
          .from('calendar_events')
          .insert(events);
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.createRecurringEvents', 'medium');
    }
  }

  private generateRecurringEvents(baseEvent: CalendarEvent, recurrence: CalendarRecurrence): Omit<CalendarEvent, 'id'>[] {
    const events: Omit<CalendarEvent, 'id'>[] = [];
    const startDate = new Date(baseEvent.start_date);
    const endDate = new Date(baseEvent.end_date);
    const duration = endDate.getTime() - startDate.getTime();

    let currentDate = new Date(startDate);
    let count = 0;
    const maxOccurrences = recurrence.occurrences || 100;
    const endRecurrence = recurrence.end_date ? new Date(recurrence.end_date) : null;

    while (count < maxOccurrences) {
      // Move to next occurrence
      switch (recurrence.pattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + recurrence.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * recurrence.interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + recurrence.interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + recurrence.interval);
          break;
      }

      if (endRecurrence && currentDate > endRecurrence) break;

      const newEndDate = new Date(currentDate.getTime() + duration);
      
      events.push({
        ...baseEvent,
        start_date: currentDate.toISOString(),
        end_date: newEndDate.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      count++;
    }

    return events;
  }

  async updateEventReminders(eventId: string, reminders: CalendarReminder[]): Promise<void> {
    try {
      // Cancel existing reminders
      await supabase
        .from('calendar_reminders')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('status', 'pending');

      // Add new reminders
      await this.scheduleReminders(eventId, reminders);
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.updateEventReminders', 'medium');
    }
  }

  async checkOverdueEvents(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      const { data: overdueEvents, error } = await supabase
        .from('calendar_events')
        .select('*')
        .lt('end_date', now)
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .neq('status', 'overdue');

      if (error) throw error;

      if (overdueEvents?.length) {
        // Update status to overdue
        await supabase
          .from('calendar_events')
          .update({ status: 'overdue' })
          .in('id', overdueEvents.map(e => e.id));

        // Send overdue alerts
        for (const event of overdueEvents) {
          await this.queueManager.addJob({
            type: 'send_overdue_alert',
            priority: 'high',
            data: {
              event_id: event.id,
              event_title: event.title,
              assigned_to: event.assigned_to,
              project_id: event.project_id
            }
          });
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.checkOverdueEvents', 'medium');
    }
  }

  async getUpcomingDeadlines(days: number = 7): Promise<CalendarEvent[]> {
    try {
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + days);

      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          projects (title),
          clients (name)
        `)
        .eq('event_type', 'deadline')
        .gte('start_date', now.toISOString())
        .lte('start_date', future.toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.getUpcomingDeadlines', 'low');
      return [];
    }
  }

  async synchronizeProjectMilestones(projectId: string): Promise<void> {
    try {
      const { data: milestones } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId);

      if (!milestones) return;

      for (const milestone of milestones) {
        // Check if calendar event exists
        const { data: existingEvent } = await supabase
          .from('calendar_events')
          .select('id')
          .eq('project_id', projectId)
          .eq('event_type', 'milestone')
          .eq('title', milestone.title)
          .single();

        if (!existingEvent) {
          await this.createEvent({
            title: milestone.title,
            description: milestone.description,
            start_date: milestone.due_date,
            end_date: milestone.due_date,
            event_type: 'milestone',
            status: milestone.status === 'completed' ? 'completed' : 'scheduled',
            priority: 'high',
            project_id: projectId,
            created_by: 'system',
            reminders: []
          });
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.synchronizeProjectMilestones', 'medium');
    }
  }

  private async logCalendarActivity(action: string, eventId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('calendar_activity_log')
        .insert({
          action,
          event_id: eventId,
          user_id: userId,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      this.errorHandler.handleError(error, 'CalendarManager.logCalendarActivity', 'low');
    }
  }
}

export default CalendarManager;