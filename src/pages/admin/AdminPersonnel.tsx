import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Users, 
  Shield, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  UserCheck, 
  UserX, 
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Activity,
  Clock,
  MapPin,
  Settings,
  Key,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Ban,
  UserPlus,
  Lock,
  Unlock,
  ShieldCheck,
  Globe,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Database,
  Monitor
} from "lucide-react";
import { AuthenticationService, User, Role, Permission, Session } from "@/lib/auth-management";
import { ErrorHandlingService } from "@/lib/error-handling";

// Create alias for compatibility
const AuthManagementService = AuthenticationService;
import { connectionPool } from "@/lib/connection-pool";
import { queueManager, QueuePriority } from "@/lib/queue-manager";
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface AdminUser extends User {
  sessions?: Session[];
  lastActivity?: Date;
  loginAttempts?: number;
  isLocked?: boolean;
  createdBy?: string;
  department?: string;
  location?: string;
  twoFactorEnabled?: boolean;
}

interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'login' | 'logout' | 'failed_login' | 'password_change' | 'role_change' | 'account_lock' | 'suspicious_activity';
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface DashboardMetrics {
  totalAdmins: number;
  activeAdmins: number;
  lockedAccounts: number;
  recentLogins: number;
  failedLogins: number;
  securityAlerts: number;
  avgSessionDuration: number;
  connectionPoolStatus: any;
  queueMetrics: any;
}

const AdminPersonnel: React.FC = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showEditAdmin, setShowEditAdmin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAdmins: 0,
    activeAdmins: 0,
    lockedAccounts: 0,
    recentLogins: 0,
    failedLogins: 0,
    securityAlerts: 0,
    avgSessionDuration: 0,
    connectionPoolStatus: {},
    queueMetrics: {}
  });

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin",
    department: "",
    location: "",
    password: "",
    confirmPassword: "",
    permissions: [] as string[],
    twoFactorRequired: false,
    sendWelcomeEmail: true
  });

  const [bulkActions, setBulkActions] = useState({
    selectedAdmins: [] as string[],
    action: "",
    reason: ""
  });

  const departments = ["IT", "HR", "Finance", "Operations", "Security", "Management"];
  const locations = ["New York", "London", "Tokyo", "Sydney", "Toronto", "Dubai"];

  useEffect(() => {
    initializeComponent();
  }, []);

  useEffect(() => {
    updateMetrics();
  }, [admins, securityEvents]);

  const initializeComponent = async () => {
    setLoading(true);
    try {
      // Load current user, admins, roles, and permissions in parallel
      await Promise.all([
        loadCurrentUser(),
        loadAdmins(),
        loadRoles(),
        loadPermissions(),
        loadSecurityEvents(),
        loadSystemMetrics()
      ]);
    } catch (error) {
      toast({
        title: "Initialization Error",
        description: "Failed to load admin personnel data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      // Get current user from session or context
      const user = await AuthManagementService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      const adminUsers = await AuthManagementService.getAdminUsers();
      setAdmins(adminUsers.map(user => ({
        ...user,
        lastActivity: user.last_login ? new Date(user.last_login) : undefined,
        isLocked: user.account_locked || false,
        loginAttempts: user.failed_login_attempts || 0
      })));
    } catch (error) {
      await ErrorHandlingService.logError({
        message: 'Failed to load admin users',
        category: 'UI',
        severity: 'HIGH',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  };

  const loadRoles = async () => {
    try {
      const rolesData = await AuthManagementService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const permissionsData = await AuthManagementService.getPermissions();
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const loadSecurityEvents = async () => {
    try {
      const events = await AuthManagementService.getSecurityEvents();
      setSecurityEvents(events);
    } catch (error) {
      console.error('Failed to load security events:', error);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const [poolMetrics, queueMetrics] = await Promise.all([
        connectionPool.getMetrics(),
        queueManager.getMetrics()
      ]);
      
      setMetrics(prev => ({
        ...prev,
        connectionPoolStatus: poolMetrics,
        queueMetrics
      }));
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    }
  };

  const updateMetrics = () => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentLogins = securityEvents.filter(event => 
      event.eventType === 'login' && event.timestamp > last24Hours
    ).length;
    
    const failedLogins = securityEvents.filter(event => 
      event.eventType === 'failed_login' && event.timestamp > last24Hours
    ).length;
    
    const securityAlerts = securityEvents.filter(event => 
      event.severity === 'high' || event.severity === 'critical'
    ).length;

    setMetrics(prev => ({
      ...prev,
      totalAdmins: admins.length,
      activeAdmins: admins.filter(admin => admin.is_active).length,
      lockedAccounts: admins.filter(admin => admin.isLocked).length,
      recentLogins,
      failedLogins,
      securityAlerts
    }));
  };

  const handleCreateAdmin = async () => {
    if (!currentUser) {
      toast({
        title: "Authorization Error",
        description: "You must be logged in to create admin users",
        variant: "destructive"
      });
      return;
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Password and confirm password must match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userData: Partial<User> = {
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
        department: newAdmin.department,
        location: newAdmin.location,
        is_active: true,
        two_factor_enabled: newAdmin.twoFactorRequired
      };

      const createdUser = await AuthManagementService.createAdminUser(
        userData,
        currentUser.id,
        newAdmin.password,
        newAdmin.sendWelcomeEmail
      );

      // Assign permissions if any selected
      if (newAdmin.permissions.length > 0) {
        await AuthManagementService.assignPermissions(
          createdUser.id,
          newAdmin.permissions,
          currentUser.id
        );
      }

      // Add job to queue for post-creation tasks
      await queueManager.addJob('admin_user_created', {
        userId: createdUser.id,
        createdBy: currentUser.id,
        sendWelcomeEmail: newAdmin.sendWelcomeEmail
      }, { priority: QueuePriority.HIGH });

      toast({
        title: "Admin Created",
        description: `Admin user ${newAdmin.name} has been created successfully`,
        variant: "default"
      });

      // Reset form and reload data
      setNewAdmin({
        name: "",
        email: "",
        phone: "",
        role: "admin",
        department: "",
        location: "",
        password: "",
        confirmPassword: "",
        permissions: [],
        twoFactorRequired: false,
        sendWelcomeEmail: true
      });
      setShowCreateAdmin(false);
      await loadAdmins();

    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create admin user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAdmin = async () => {
    if (!selectedAdmin || !currentUser) return;

    setLoading(true);
    try {
      const updatedData: Partial<User> = {
        name: selectedAdmin.name,
        email: selectedAdmin.email,
        phone: selectedAdmin.phone,
        role: selectedAdmin.role,
        department: selectedAdmin.department,
        location: selectedAdmin.location,
        is_active: selectedAdmin.is_active,
        two_factor_enabled: selectedAdmin.twoFactorEnabled
      };

      await AuthManagementService.updateAdminUser(
        selectedAdmin.id,
        updatedData,
        currentUser.id
      );

      toast({
        title: "Admin Updated",
        description: `Admin user ${selectedAdmin.name} has been updated successfully`,
        variant: "default"
      });

      setShowEditAdmin(false);
      setSelectedAdmin(null);
      await loadAdmins();

    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update admin user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin || !currentUser) return;

    setLoading(true);
    try {
      await AuthManagementService.deleteAdminUser(selectedAdmin.id, currentUser.id);

      toast({
        title: "Admin Deleted",
        description: `Admin user ${selectedAdmin.name} has been deleted successfully`,
        variant: "default"
      });

      setShowDeleteConfirm(false);
      setSelectedAdmin(null);
      await loadAdmins();

    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete admin user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLockAccount = async (admin: AdminUser) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await AuthManagementService.lockUserAccount(admin.id, currentUser.id, "Manual lock by administrator");

      toast({
        title: "Account Locked",
        description: `${admin.name}'s account has been locked`,
        variant: "default"
      });

      await loadAdmins();

    } catch (error) {
      toast({
        title: "Lock Failed",
        description: error instanceof Error ? error.message : "Failed to lock account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockAccount = async (admin: AdminUser) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await AuthManagementService.unlockUserAccount(admin.id, currentUser.id);

      toast({
        title: "Account Unlocked",
        description: `${admin.name}'s account has been unlocked`,
        variant: "default"
      });

      await loadAdmins();

    } catch (error) {
      toast({
        title: "Unlock Failed",
        description: error instanceof Error ? error.message : "Failed to unlock account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvalidateSessions = async (admin: AdminUser) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await AuthManagementService.invalidateUserSessions(admin.id, currentUser.id);

      toast({
        title: "Sessions Invalidated",
        description: `All sessions for ${admin.name} have been invalidated`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "Invalidation Failed",
        description: error instanceof Error ? error.message : "Failed to invalidate sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkActions = async () => {
    if (!currentUser || bulkActions.selectedAdmins.length === 0 || !bulkActions.action) return;

    setLoading(true);
    try {
      const promises = bulkActions.selectedAdmins.map(async (adminId) => {
        switch (bulkActions.action) {
          case 'lock':
            return AuthManagementService.lockUserAccount(adminId, currentUser.id, bulkActions.reason);
          case 'unlock':
            return AuthManagementService.unlockUserAccount(adminId, currentUser.id);
          case 'invalidate_sessions':
            return AuthManagementService.invalidateUserSessions(adminId, currentUser.id);
          case 'delete':
            return AuthManagementService.deleteAdminUser(adminId, currentUser.id);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);

      toast({
        title: "Bulk Action Completed",
        description: `${bulkActions.action} applied to ${bulkActions.selectedAdmins.length} admin(s)`,
        variant: "default"
      });

      setBulkActions({ selectedAdmins: [], action: "", reason: "" });
      await loadAdmins();

    } catch (error) {
      toast({
        title: "Bulk Action Failed",
        description: error instanceof Error ? error.message : "Failed to execute bulk action",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || admin.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && admin.is_active) ||
                         (filterStatus === "inactive" && !admin.is_active) ||
                         (filterStatus === "locked" && admin.isLocked);
    const matchesDepartment = filterDepartment === "all" || admin.department === filterDepartment;

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const getStatusBadge = (admin: AdminUser) => {
    if (admin.isLocked) {
      return <Badge variant="destructive" className="flex items-center gap-1"><Lock className="w-3 h-3" />Locked</Badge>;
    }
    if (!admin.is_active) {
      return <Badge variant="secondary" className="flex items-center gap-1"><UserX className="w-3 h-3" />Inactive</Badge>;
    }
    return <Badge variant="default" className="flex items-center gap-1"><UserCheck className="w-3 h-3" />Active</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      'super_admin': 'bg-red-100 text-red-800',
      'admin': 'bg-blue-100 text-blue-800',
      'manager': 'bg-green-100 text-green-800',
      'operator': 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>{role.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getSecurityEventBadge = (severity: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[severity]}>{severity.toUpperCase()}</Badge>;
  };

  if (loading && admins.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminPageHeader 
        title="Admin Personnel Management" 
        description="Manage admin users, roles, permissions, and security settings"
      />

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalAdmins}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.activeAdmins} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.securityAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.failedLogins} failed logins today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((metrics.connectionPoolStatus.totalConnections / 20) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Pool utilization
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.queueMetrics.pendingJobs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Pending jobs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Latest security events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {securityEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getSecurityEventBadge(event.severity)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>{role.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Depts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Admin User</DialogTitle>
                  <DialogDescription>
                    Add a new admin user with proper roles and permissions
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newAdmin.phone}
                      onChange={(e) => setNewAdmin({...newAdmin, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin({...newAdmin, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>{role.display_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={newAdmin.department} onValueChange={(value) => setNewAdmin({...newAdmin, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select value={newAdmin.location} onValueChange={(value) => setNewAdmin({...newAdmin, location: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                      placeholder="Enter password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={newAdmin.confirmPassword}
                      onChange={(e) => setNewAdmin({...newAdmin, confirmPassword: e.target.value})}
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="twoFactor"
                      checked={newAdmin.twoFactorRequired}
                      onCheckedChange={(checked) => setNewAdmin({...newAdmin, twoFactorRequired: checked})}
                    />
                    <Label htmlFor="twoFactor">Require Two-Factor Authentication</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="welcomeEmail"
                      checked={newAdmin.sendWelcomeEmail}
                      onCheckedChange={(checked) => setNewAdmin({...newAdmin, sendWelcomeEmail: checked})}
                    />
                    <Label htmlFor="welcomeEmail">Send Welcome Email</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAdmin} disabled={loading}>
                    {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    Create Admin
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Admin Users Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkActions({
                              ...bulkActions,
                              selectedAdmins: filteredAdmins.map(a => a.id)
                            });
                          } else {
                            setBulkActions({...bulkActions, selectedAdmins: []});
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={bulkActions.selectedAdmins.includes(admin.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkActions({
                                ...bulkActions,
                                selectedAdmins: [...bulkActions.selectedAdmins, admin.id]
                              });
                            } else {
                              setBulkActions({
                                ...bulkActions,
                                selectedAdmins: bulkActions.selectedAdmins.filter(id => id !== admin.id)
                              });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={admin.avatar_url} />
                            <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{admin.name}</div>
                            <div className="text-sm text-muted-foreground">{admin.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell>{admin.department}</TableCell>
                      <TableCell>{getStatusBadge(admin)}</TableCell>
                      <TableCell>
                        {admin.lastActivity ? (
                          <div className="text-sm">
                            {admin.lastActivity.toLocaleDateString()}
                            <br />
                            <span className="text-muted-foreground">
                              {admin.lastActivity.toLocaleTimeString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowEditAdmin(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          {admin.isLocked ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnlockAccount(admin)}
                            >
                              <Unlock className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLockAccount(admin)}
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInvalidateSessions(admin)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Roles */}
            <Card>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>Manage user roles and hierarchies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{role.display_name}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Level {role.level}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>Manage system permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-muted-foreground">{permission.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{permission.resource}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Monitor security events and threats</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.slice(0, 10).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.eventType.replace('_', ' ').toUpperCase()}</div>
                          <div className="text-sm text-muted-foreground">{event.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {admins.find(a => a.id === event.userId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{getSecurityEventBadge(event.severity)}</TableCell>
                      <TableCell className="font-mono text-sm">{event.ipAddress}</TableCell>
                      <TableCell>{event.timestamp.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowSecurityDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connection Pool Status */}
            <Card>
              <CardHeader>
                <CardTitle>Database Connection Pool</CardTitle>
                <CardDescription>Monitor database connection health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Connections</div>
                    <div className="text-2xl font-bold">{metrics.connectionPoolStatus.totalConnections}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Active Connections</div>
                    <div className="text-2xl font-bold">{metrics.connectionPoolStatus.activeConnections}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Pool Utilization</div>
                    <div className="text-2xl font-bold">{metrics.connectionPoolStatus.poolUtilization?.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Latency</div>
                    <div className="text-2xl font-bold">{metrics.connectionPoolStatus.averageLatency?.toFixed(0)}ms</div>
                  </div>
                </div>
                <Progress value={metrics.connectionPoolStatus.poolUtilization || 0} className="w-full" />
              </CardContent>
            </Card>

            {/* Queue Status */}
            <Card>
              <CardHeader>
                <CardTitle>Job Queue Status</CardTitle>
                <CardDescription>Monitor background job processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Pending Jobs</div>
                    <div className="text-2xl font-bold">{metrics.queueMetrics.pendingJobs}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Processing Jobs</div>
                    <div className="text-2xl font-bold">{metrics.queueMetrics.processingJobs}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Completed Jobs</div>
                    <div className="text-2xl font-bold">{metrics.queueMetrics.completedJobs}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                    <div className="text-2xl font-bold">{metrics.queueMetrics.errorRate?.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={metrics.queueMetrics.errorRate || 0} className="w-full" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Actions</CardTitle>
              <CardDescription>Perform actions on multiple admin accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Selected Admins: {bulkActions.selectedAdmins.length}</Label>
                  <div className="text-sm text-muted-foreground">
                    {bulkActions.selectedAdmins.map(id => 
                      admins.find(a => a.id === id)?.name
                    ).join(', ')}
                  </div>
                </div>
                
                <Select value={bulkActions.action} onValueChange={(value) => setBulkActions({...bulkActions, action: value})}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lock">Lock Accounts</SelectItem>
                    <SelectItem value="unlock">Unlock Accounts</SelectItem>
                    <SelectItem value="invalidate_sessions">Invalidate Sessions</SelectItem>
                    <SelectItem value="delete">Delete Accounts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(bulkActions.action === 'lock' || bulkActions.action === 'delete') && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={bulkActions.reason}
                    onChange={(e) => setBulkActions({...bulkActions, reason: e.target.value})}
                    placeholder="Enter reason for this action..."
                  />
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleBulkActions}
                  disabled={bulkActions.selectedAdmins.length === 0 || !bulkActions.action || loading}
                  variant={bulkActions.action === 'delete' ? 'destructive' : 'default'}
                >
                  {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Execute Action
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAdmin?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin} disabled={loading}>
              {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Delete Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPersonnel;