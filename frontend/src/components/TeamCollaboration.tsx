import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  Users, 
  Bell, 
  Calendar,
  FileText,
  Image,
  Download,
  Eye,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Reply,
  Forward,
  Edit,
  Trash2,
  Pin,
  Archive
} from "lucide-react";
import { supabase } from "@/lib/db-client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  last_seen?: string;
}

interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'system';
  file_url?: string;
  file_name?: string;
  created_at: string;
  edited_at?: string;
  reply_to?: string;
  reactions?: { emoji: string; users: string[] }[];
  pinned?: boolean;
}

interface Notification {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface Meeting {
  id: string;
  project_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  meeting_url?: string;
  attendees: string[];
  created_by: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface SharedFile {
  id: string;
  project_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
  tags?: string[];
  folder?: string;
}

interface TeamCollaborationProps {
  projectId: string;
  currentUserId: string;
}

const TeamCollaboration: React.FC<TeamCollaborationProps> = ({ projectId, currentUserId }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // New meeting form
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    attendees: [] as string[]
  });

  useEffect(() => {
    fetchTeamData();
    // Set up real-time subscriptions
    setupRealtimeSubscriptions();
  }, [projectId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch team members
      const { data: membersData, error: membersError } = await supabase
        .from('project_team_members')
        .select('*')
        .eq('project_id', projectId);
        
      if (membersError) throw membersError;
      setTeamMembers(membersData || []);
      
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('project_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
      
      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('project_notifications')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });
        
      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);
      
      // Fetch meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('project_meetings')
        .select('*')
        .eq('project_id', projectId)
        .order('start_time', { ascending: true });
        
      if (meetingsError) throw meetingsError;
      setMeetings(meetingsData || []);
      
      // Fetch shared files
      const { data: filesData, error: filesError } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });
        
      if (filesError) throw filesError;
      setSharedFiles(filesData || []);
      
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Real-time subscriptions would be handled by the server in production
    // For now, we'll use mock data and polling
    console.log('Real-time subscriptions would be set up for project:', projectId);
    
    return () => {
      console.log('Cleaning up subscriptions');
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        project_id: projectId,
        sender_id: currentUserId,
        sender_name: 'Current User', // This would come from auth context
        content: newMessage,
        message_type: 'text' as const,
        reply_to: replyTo
      };

      const { error } = await supabase
        .from('project_messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    }
  };

  const scheduleMovie = async () => {
    if (!newMeeting.title || !newMeeting.start_time) return;

    try {
      const meetingData = {
        project_id: projectId,
        title: newMeeting.title,
        description: newMeeting.description,
        start_time: newMeeting.start_time,
        end_time: newMeeting.end_time,
        attendees: newMeeting.attendees,
        created_by: currentUserId,
        status: 'scheduled' as const
      };

      const { error } = await supabase
        .from('project_meetings')
        .insert([meetingData]);

      if (error) throw error;

      toast({
        title: "Meeting scheduled",
        description: "Meeting has been successfully scheduled."
      });

      setNewMeeting({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        attendees: []
      });

      fetchTeamData();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting.",
        variant: "destructive"
      });
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('project_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = sharedFiles.filter(file =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Team Collaboration
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {teamMembers.filter(m => m.status === 'online').length} online
            </Badge>
            {unreadNotifications.length > 0 && (
              <Badge variant="destructive">
                {unreadNotifications.length} new
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mx-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                  {unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col px-4 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px]">
              {filteredMessages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender_avatar} />
                    <AvatarFallback>{message.sender_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.sender_name}</span>
                      <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                      {message.pinned && <Pin className="w-3 h-3 text-orange-500" />}
                      {message.edited_at && <span className="text-xs text-gray-400">(edited)</span>}
                    </div>
                    
                    {message.reply_to && (
                      <div className="mb-2 p-2 bg-gray-100 rounded border-l-2 border-gray-300">
                        <p className="text-xs text-gray-600">Replying to a message</p>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      {message.message_type === 'text' && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      {message.message_type === 'file' && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{message.file_name}</span>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      {message.message_type === 'image' && (
                        <div className="max-w-xs">
                          <img 
                            src={message.file_url} 
                            alt={message.file_name}
                            className="rounded-lg w-full"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setReplyTo(message.id)}>
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Star className="w-3 h-3 mr-1" />
                        React
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {replyTo && (
              <div className="mb-2 p-2 bg-blue-50 rounded border-l-2 border-blue-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600">Replying to message</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setReplyTo(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="resize-none"
                  rows={2}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button onClick={sendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="flex-1 px-4 pb-4">
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(member.status)} border-2 border-white`} />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                      {member.status !== 'online' && member.last_seen && (
                        <p className="text-xs text-gray-400">
                          Last seen {formatDate(member.last_seen)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={member.status === 'online' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="flex-1 px-4 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      {file.file_type.startsWith('image/') ? (
                        <Image className="w-5 h-5 text-green-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.file_name}</p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(file.file_size)} • Uploaded by {file.uploaded_by}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(file.uploaded_at)}</p>
                      {file.description && (
                        <p className="text-xs text-gray-600 mt-1">{file.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="flex-1 px-4 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Upcoming Meetings</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule New Meeting</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={newMeeting.title}
                        onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                        placeholder="Meeting title"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={newMeeting.description}
                        onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                        placeholder="Meeting description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Start Time</label>
                        <Input
                          type="datetime-local"
                          value={newMeeting.start_time}
                          onChange={(e) => setNewMeeting({ ...newMeeting, start_time: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">End Time</label>
                        <Input
                          type="datetime-local"
                          value={newMeeting.end_time}
                          onChange={(e) => setNewMeeting({ ...newMeeting, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={scheduleMovie} className="w-full">
                      Schedule Meeting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{meeting.title}</h4>
                    <Badge variant={meeting.status === 'scheduled' ? 'default' : 'secondary'}>
                      {meeting.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(meeting.start_time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {meeting.attendees.length} attendees
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {meeting.meeting_url && (
                        <Button variant="outline" size="sm">
                          <Video className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="flex-1 px-4 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Notifications</h3>
              <Button variant="outline" size="sm">
                Mark all as read
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            notification.type === 'error' ? 'destructive' :
                            notification.type === 'warning' ? 'default' :
                            notification.type === 'success' ? 'default' : 'secondary'
                          }
                        >
                          {notification.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TeamCollaboration;