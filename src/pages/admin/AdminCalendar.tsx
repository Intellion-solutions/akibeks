import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarDays, Clock, MapPin, Users, Plus, Edit, Trash2, Bell, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { service as CalendarManager } from "@/lib/calendar-manager";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, isSameMonth, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  event_type: 'meeting' | 'deadline' | 'milestone' | 'reminder' | 'other';
  location?: string;
  attendees?: string[];
  is_recurring: boolean;
  recurrence_pattern?: string;
  reminder_minutes?: number;
  project_id?: string;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

interface CalendarReminder {
  id?: string;
  event_id: string;
  reminder_type: 'email' | 'sms' | 'push';
  minutes_before: number;
  is_sent: boolean;
  sent_at?: Date;
}

const AdminCalendar: React.FC = () => {
  const { isAuthenticated } = useAdmin();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
      loadUpcomingDeadlines();
    }
  }, [isAuthenticated, selectedDate, currentView]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const calendarManager = new CalendarManager();
      
      let start_date, end_date;
      
      if (currentView === 'month') {
        start_date = startOfMonth(selectedDate);
        end_date = endOfMonth(selectedDate);
      } else if (currentView === 'week') {
        start_date = startOfWeek(selectedDate);
        end_date = endOfWeek(selectedDate);
      } else {
        start_date = selectedDate;
        end_date = addDays(selectedDate, 1);
      }

      const eventsData = await calendarManager.getEvents({
        start_date,
        end_date,
        event_type: filterType !== 'all' ? filterType : undefined,
        search: searchTerm || undefined
      });

      setEvents(eventsData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calendar events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingDeadlines = async () => {
    try {
      const calendarManager = new CalendarManager();
      const deadlines = await calendarManager.getUpcomingDeadlines(7); // Next 7 days
      setUpcomingDeadlines(deadlines || []);
    } catch (error) {
      console.error('Failed to load upcoming deadlines:', error);
    }
  };

  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const calendarManager = new CalendarManager();
      const newEvent = await calendarManager.createEvent({
        ...eventData,
        created_by: 'admin' // This should come from auth context
      } as CalendarEvent);

      if (newEvent) {
        toast({
          title: "Success",
          description: "Event created successfully.",
        });
        loadEvents();
        setIsEventDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      const calendarManager = new CalendarManager();
      const updatedEvent = await calendarManager.updateEvent(eventId, updates);

      if (updatedEvent) {
        toast({
          title: "Success",
          description: "Event updated successfully.",
        });
        loadEvents();
        setSelectedEvent(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const calendarManager = new CalendarManager();
      await calendarManager.deleteEvent(eventId);
      
      toast({
        title: "Success",
        description: "Event deleted successfully.",
      });
      loadEvents();
      setSelectedEvent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    if (currentView === 'month') {
      setSelectedDate(direction === 'next' ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1));
    } else if (currentView === 'week') {
      setSelectedDate(direction === 'next' ? addDays(selectedDate, 7) : addDays(selectedDate, -7));
    } else {
      setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : addDays(selectedDate, -1));
    }
  };

  const CreateEventForm: React.FC<{ onSubmit: (data: Partial<CalendarEvent>) => void }> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<Partial<CalendarEvent>>({
      title: '',
      description: '',
      event_type: 'meeting',
      location: '',
      is_recurring: false,
      reminder_minutes: 15,
      start_time: new Date(),
      end_time: addDays(new Date(), 1)
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="event_type">Event Type</Label>
            <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_time">Start Date & Time</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time ? format(formData.start_time, "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => setFormData({ ...formData, start_time: new Date(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label htmlFor="end_time">End Date & Time</Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={formData.end_time ? format(formData.end_time, "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => setFormData({ ...formData, end_time: new Date(e.target.value) })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="reminder_minutes">Reminder (minutes before)</Label>
          <Select 
            value={formData.reminder_minutes?.toString()} 
            onValueChange={(value) => setFormData({ ...formData, reminder_minutes: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No reminder</SelectItem>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="1440">1 day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">Create Event</Button>
      </form>
    );
  };

  const MonthView: React.FC = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold bg-gray-100">
            {day}
          </div>
        ))}
        {dateRange.map(date => {
          const dayEvents = events.filter(event => 
            isSameDay(new Date(event.start_time), date)
          );
          const isCurrentMonth = isSameMonth(date, selectedDate);
          const isToday = isSameDay(date, new Date());

          return (
            <div 
              key={date.toISOString()} 
              className={`min-h-[100px] p-2 border border-gray-200 ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              <div className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                {format(date, 'd')}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {event.title}
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
    );
  };

  const WeekView: React.FC = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart) });

    return (
      <div className="grid grid-cols-8 gap-1">
        <div className="p-2"></div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="p-2 text-center border-b">
            <div className="font-semibold">{format(day, 'EEE')}</div>
            <div className="text-lg">{format(day, 'd')}</div>
          </div>
        ))}
        
        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div className="p-2 text-sm text-gray-500 border-r">
              {format(new Date().setHours(hour, 0, 0, 0), 'ha')}
            </div>
            {weekDays.map(day => {
              const dayEvents = events.filter(event => {
                const eventStart = new Date(event.start_time);
                return isSameDay(eventStart, day) && eventStart.getHours() === hour;
              });

              return (
                <div key={`${day.toISOString()}-${hour}`} className="min-h-[50px] border border-gray-100 p-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 mb-1 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const AgendaView: React.FC = () => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    return (
      <div className="space-y-4">
        {sortedEvents.map(event => (
          <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4" onClick={() => setSelectedEvent(event)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.start_time), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant={event.event_type === 'deadline' ? 'destructive' : 'default'}>
                  {event.event_type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const UpcomingDeadlinesSidebar: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming deadlines</p>
        ) : (
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{deadline.title}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(deadline.due_date), 'MMM d, yyyy')}
                </p>
                <Badge size="sm" variant="destructive" className="mt-2">
                  {deadline.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Calendar Management</h1>
          
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <CreateEventForm onSubmit={handleCreateEvent} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">
                      {format(selectedDate, 'MMMM yyyy')}
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="meeting">Meetings</SelectItem>
                        <SelectItem value="deadline">Deadlines</SelectItem>
                        <SelectItem value="milestone">Milestones</SelectItem>
                        <SelectItem value="reminder">Reminders</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
                      <TabsList>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="day">Day</TabsTrigger>
                        <TabsTrigger value="agenda">Agenda</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search events..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={loadEvents}>
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Tabs value={currentView} className="w-full">
                    <TabsContent value="month">
                      <MonthView />
                    </TabsContent>
                    <TabsContent value="week">
                      <div className="overflow-x-auto">
                        <WeekView />
                      </div>
                    </TabsContent>
                    <TabsContent value="day">
                      <AgendaView />
                    </TabsContent>
                    <TabsContent value="agenda">
                      <AgendaView />
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <UpcomingDeadlinesSidebar />
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Events</span>
                    <span className="font-semibold">{events.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="font-semibold">
                      {events.filter(e => {
                        const eventDate = new Date(e.start_time);
                        const weekStart = startOfWeek(new Date());
                        const weekEnd = endOfWeek(new Date());
                        return eventDate >= weekStart && eventDate <= weekEnd;
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deadlines</span>
                    <span className="font-semibold text-red-600">
                      {events.filter(e => e.event_type === 'deadline').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-600">{selectedEvent.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Start:</strong> {format(new Date(selectedEvent.start_time), 'MMM d, yyyy h:mm a')}
                  </div>
                  <div>
                    <strong>End:</strong> {format(new Date(selectedEvent.end_time), 'MMM d, yyyy h:mm a')}
                  </div>
                  <div>
                    <strong>Type:</strong> <Badge variant="outline">{selectedEvent.event_type}</Badge>
                  </div>
                  {selectedEvent.location && (
                    <div>
                      <strong>Location:</strong> {selectedEvent.location}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                    Close
                  </Button>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => selectedEvent.id && handleDeleteEvent(selectedEvent.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminCalendar;