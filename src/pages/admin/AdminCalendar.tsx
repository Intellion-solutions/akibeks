import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Plus, Filter, Search, Clock, Users, MapPin, Link2, Bell, Repeat, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CalendarManager, { CalendarEvent, CalendarView } from '@/lib/calendar-manager';

interface AdminCalendarProps {}

const AdminCalendar: React.FC<AdminCalendarProps> = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<CalendarView['type']>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filters, setFilters] = useState({
    event_types: [] as string[],
    priorities: [] as string[],
    projects: [] as string[],
    assigned_users: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();
  const calendarManager = new CalendarManager();

  useEffect(() => {
    loadEvents();
  }, [currentView, selectedDate, filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      const viewStart = getViewStartDate();
      const viewEnd = getViewEndDate();
      
      const view: CalendarView = {
        type: currentView,
        start_date: viewStart.toISOString(),
        end_date: viewEnd.toISOString(),
        filters: Object.keys(filters).length > 0 ? filters : undefined
      };

      const loadedEvents = await calendarManager.getEvents(view);
      setEvents(loadedEvents);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getViewStartDate = (): Date => {
    const date = new Date(selectedDate);
    switch (currentView) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth(), 1);
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return startOfWeek;
      case 'day':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      default:
        return date;
    }
  };

  const getViewEndDate = (): Date => {
    const date = new Date(selectedDate);
    switch (currentView) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
      case 'week':
        const endOfWeek = new Date(date);
        endOfWeek.setDate(date.getDate() - date.getDay() + 6);
        return endOfWeek;
      case 'day':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      default:
        return new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      setLoading(true);
      
      await calendarManager.createEvent({
        ...eventData,
        created_by: 'current-user-id' // Replace with actual user ID
      });

      toast({
        title: "Success",
        description: "Event created successfully"
      });

      setIsCreateEventOpen(false);
      loadEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: any) => {
    try {
      setLoading(true);
      
      await calendarManager.updateEvent(eventId, updates, 'current-user-id');

      toast({
        title: "Success",
        description: "Event updated successfully"
      });

      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setLoading(true);
      
      await calendarManager.deleteEvent(eventId, 'current-user-id');

      toast({
        title: "Success",
        description: "Event deleted successfully"
      });

      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventsByDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const generateCalendarGrid = () => {
    const startDate = getViewStartDate();
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = startDate.getDay();
    
    const days = [];
    
    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(startDate);
      prevDate.setDate(startDate.getDate() - i - 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Next month days to complete the grid
    const remainingCells = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="w-3 h-3" />;
      case 'deadline': return <AlertTriangle className="w-3 h-3" />;
      case 'milestone': return <Clock className="w-3 h-3" />;
      case 'appointment': return <CalendarIcon className="w-3 h-3" />;
      default: return <CalendarIcon className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar Management</h1>
          <p className="text-gray-600">Manage events, meetings, and project deadlines</p>
        </div>
        
        <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <CreateEventForm onSubmit={handleCreateEvent} onCancel={() => setIsCreateEventOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Select value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  Next
                </Button>
              </div>

              <h2 className="text-xl font-semibold">
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      {currentView === 'month' && (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-4 text-center font-medium bg-gray-50 border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7">
              {generateCalendarGrid().map((day, index) => {
                const dayEvents = getEventsByDate(day.date);
                const isToday = day.date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-32 p-2 border-r border-b last:border-r-0 ${
                      !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    } ${isToday ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: getEventPriorityColor(event.priority) }}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-center space-x-1 text-white">
                            {getEventTypeIcon(event.event_type)}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {currentView === 'week' && (
        <Card>
          <CardContent className="p-0">
            <WeekView 
              events={events} 
              selectedDate={selectedDate}
              onEventClick={setSelectedEvent}
            />
          </CardContent>
        </Card>
      )}

      {/* Day View */}
      {currentView === 'day' && (
        <Card>
          <CardContent className="p-4">
            <DayView 
              events={getEventsByDate(selectedDate)}
              date={selectedDate}
              onEventClick={setSelectedEvent}
            />
          </CardContent>
        </Card>
      )}

      {/* Agenda View */}
      {currentView === 'agenda' && (
        <Card>
          <CardContent className="p-4">
            <AgendaView 
              events={events}
              onEventClick={setSelectedEvent}
            />
          </CardContent>
        </Card>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
            </DialogHeader>
            <EventDetailsForm
              event={selectedEvent}
              onUpdate={handleUpdateEvent}
              onDelete={handleDeleteEvent}
              onCancel={() => setSelectedEvent(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Upcoming Deadlines Sidebar */}
      <UpcomingDeadlinesSidebar />
    </div>
  );
};

// Create Event Form Component
const CreateEventForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    event_type: 'meeting',
    priority: 'medium',
    location: '',
    meeting_link: '',
    assigned_to: [] as string[],
    reminders: [] as any[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="event_type">Event Type</Label>
          <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date & Time</Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="end_date">End Date & Time</Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
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
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Meeting room, address, etc."
          />
        </div>
      </div>

      <div>
        <Label htmlFor="meeting_link">Meeting Link</Label>
        <Input
          id="meeting_link"
          type="url"
          value={formData.meeting_link}
          onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
          placeholder="https://zoom.us/j/..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Event
        </Button>
      </div>
    </form>
  );
};

// Week View Component
const WeekView: React.FC<{
  events: CalendarEvent[];
  selectedDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}> = ({ events, selectedDate, onEventClick }) => {
  const weekDays = [];
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }

  return (
    <div className="grid grid-cols-8 h-96">
      <div className="border-r">
        <div className="h-12 border-b flex items-center justify-center font-medium">
          Time
        </div>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="h-8 border-b text-xs flex items-center justify-center text-gray-500">
            {i}:00
          </div>
        ))}
      </div>
      
      {weekDays.map((day, dayIndex) => (
        <div key={dayIndex} className="border-r last:border-r-0">
          <div className="h-12 border-b flex items-center justify-center font-medium">
            <div className="text-center">
              <div className="text-sm text-gray-500">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg font-semibold">
                {day.getDate()}
              </div>
            </div>
          </div>
          
          <div className="relative">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-8 border-b"></div>
            ))}
            
            {events
              .filter(event => new Date(event.start_date).toDateString() === day.toDateString())
              .map((event) => {
                const startTime = new Date(event.start_date);
                const endTime = new Date(event.end_date);
                const top = (startTime.getHours() + startTime.getMinutes() / 60) * 32;
                const height = ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)) * 32;
                
                return (
                  <div
                    key={event.id}
                    className="absolute left-0 right-0 mx-1 p-1 text-xs rounded cursor-pointer"
                    style={{
                      top: `${top}px`,
                      height: `${Math.max(height, 24)}px`,
                      backgroundColor: event.priority === 'critical' ? '#ef4444' : 
                                     event.priority === 'high' ? '#f97316' :
                                     event.priority === 'medium' ? '#eab308' : '#22c55e'
                    }}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="text-white font-medium truncate">
                      {event.title}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      ))}
    </div>
  );
};

// Day View Component
const DayView: React.FC<{
  events: CalendarEvent[];
  date: Date;
  onEventClick: (event: CalendarEvent) => void;
}> = ({ events, date, onEventClick }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        {date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </h3>
      
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events scheduled for this day</p>
        ) : (
          events
            .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => onEventClick(event)}
              >
                <div className={`w-3 h-3 rounded-full ${
                  event.priority === 'critical' ? 'bg-red-500' :
                  event.priority === 'high' ? 'bg-orange-500' :
                  event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{event.title}</span>
                    <Badge variant="outline">{event.event_type}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.start_date).toLocaleTimeString()} - {new Date(event.end_date).toLocaleTimeString()}
                  </div>
                  {event.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

// Agenda View Component
const AgendaView: React.FC<{
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}> = ({ events, onEventClick }) => {
  const groupedEvents = events.reduce((groups, event) => {
    const date = new Date(event.start_date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .map(([date, dayEvents]) => (
          <div key={date}>
            <h3 className="text-lg font-semibold mb-3">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            <div className="space-y-2">
              {dayEvents
                .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => onEventClick(event)}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      event.priority === 'critical' ? 'bg-red-500' :
                      event.priority === 'high' ? 'bg-orange-500' :
                      event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{event.title}</span>
                        <Badge variant="outline">{event.event_type}</Badge>
                        <Badge variant="outline">{event.priority}</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.start_date).toLocaleTimeString()} - {new Date(event.end_date).toLocaleTimeString()}
                      </div>
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        ))
      }
    </div>
  );
};

// Event Details Form Component
const EventDetailsForm: React.FC<{
  event: CalendarEvent;
  onUpdate: (eventId: string, updates: any) => void;
  onDelete: (eventId: string) => void;
  onCancel: () => void;
}> = ({ event, onUpdate, onDelete, onCancel }) => {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    start_date: new Date(event.start_date).toISOString().slice(0, 16),
    end_date: new Date(event.end_date).toISOString().slice(0, 16),
    event_type: event.event_type,
    priority: event.priority,
    status: event.status,
    location: event.location || '',
    meeting_link: event.meeting_link || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(event.id, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date & Time</Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="end_date">End Date & Time</Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="meeting_link">Meeting Link</Label>
          <Input
            id="meeting_link"
            type="url"
            value={formData.meeting_link}
            onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="destructive"
          onClick={() => onDelete(event.id)}
        >
          Delete Event
        </Button>
        
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Update Event
          </Button>
        </div>
      </div>
    </form>
  );
};

// Upcoming Deadlines Sidebar Component
const UpcomingDeadlinesSidebar: React.FC = () => {
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<CalendarEvent[]>([]);
  const calendarManager = new CalendarManager();

  useEffect(() => {
    loadUpcomingDeadlines();
  }, []);

  const loadUpcomingDeadlines = async () => {
    try {
      const deadlines = await calendarManager.getUpcomingDeadlines(7);
      setUpcomingDeadlines(deadlines);
    } catch (error) {
      console.error('Failed to load upcoming deadlines:', error);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <span>Upcoming Deadlines</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming deadlines</p>
        ) : (
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center space-x-3 p-2 border rounded">
                <div className={`w-2 h-2 rounded-full ${
                  deadline.priority === 'critical' ? 'bg-red-500' :
                  deadline.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{deadline.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(deadline.start_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCalendar;