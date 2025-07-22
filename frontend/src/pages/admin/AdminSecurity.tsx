import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Search,
  Filter,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";
import { SecurityService } from '@/lib/security';
import PasswordSecurityService, { PasswordPolicy, SecureCredential, PasswordStrengthResult } from '@/lib/password-security';
import SEOHead from "@/components/SEO/SEOHead";

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'suspicious_activity' | 'rate_limit_exceeded';
  userId?: string;
  email?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ActiveSession {
  id: string;
  userId: string;
  email: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  device: string;
  location: string;
}

interface SecurityMetrics {
  totalSessions: number;
  failedLogins24h: number;
  suspiciousActivities: number;
  blockedIPs: number;
  averageSessionDuration: number;
  loginSuccessRate: number;
}

const AdminSecurity: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalSessions: 0,
    failedLogins24h: 0,
    suspiciousActivities: 0,
    blockedIPs: 0,
    averageSessionDuration: 0,
    loginSuccessRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [credentials, setCredentials] = useState<SecureCredential[]>([]);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>(PasswordSecurityService.getPasswordPolicy());
  const [passwordAudit, setPasswordAudit] = useState({
    weakPasswords: 0,
    expiredPasswords: 0,
    reusedPasswords: 0,
    policyViolations: 0,
    totalCredentials: 0,
    securityScore: 0,
    recommendations: [] as string[]
  });
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);

      // Get security status from SecurityService
      const status = SecurityService.getSecurityStatus();

      // Fetch password audit data
      const auditData = await PasswordSecurityService.auditPasswordSecurity();
      setPasswordAudit(auditData);

      // Mock security events (in production, fetch from API)
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login_success',
          userId: 'user1',
          email: 'admin@akibeks.co.ke',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          details: { location: 'Nairobi, Kenya' },
          severity: 'low'
        },
        {
          id: '2',
          type: 'login_failure',
          email: 'unknown@example.com',
          ip: '10.0.0.1',
          userAgent: 'curl/7.68.0',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          details: { reason: 'invalid_credentials', attempts: 3 },
          severity: 'medium'
        },
        {
          id: '3',
          type: 'suspicious_activity',
          userId: 'user2',
          email: 'user@akibeks.co.ke',
          ip: '203.0.113.0',
          userAgent: 'Suspicious Bot v1.0',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          details: { activity: 'multiple_rapid_requests', count: 50 },
          severity: 'high'
        },
        {
          id: '4',
          type: 'rate_limit_exceeded',
          ip: '198.51.100.0',
          userAgent: 'AttackBot/2.0',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          details: { requests: 1000, window: '15min' },
          severity: 'critical'
        }
      ];

      // Mock active sessions
      const mockSessions: ActiveSession[] = [
        {
          id: 'session1',
          userId: 'user1',
          email: 'admin@akibeks.co.ke',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          lastActivity: new Date(Date.now() - 5 * 60 * 1000),
          device: 'Windows Desktop',
          location: 'Nairobi, Kenya'
        },
        {
          id: 'session2',
          userId: 'user2',
          email: 'manager@akibeks.co.ke',
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          lastActivity: new Date(Date.now() - 2 * 60 * 1000),
          device: 'iPhone',
          location: 'Mombasa, Kenya'
        }
      ];

      setSecurityEvents(mockEvents);
      setActiveSessions(mockSessions);
      setMetrics({
        totalSessions: status.activeSessions,
        failedLogins24h: status.failedAttempts,
        suspiciousActivities: mockEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length,
        blockedIPs: status.rateLimitedIPs,
        averageSessionDuration: 2.5,
        loginSuccessRate: 94.2,
      });
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'login_failure': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'logout': return <Lock className="h-4 w-4 text-blue-600" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'rate_limit_exceeded': return <Ban className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  // Password Management Functions
  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    if (password) {
      const strength = PasswordSecurityService.analyzePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  };

  const generateSecurePassword = () => {
    const password = PasswordSecurityService.generateSecurePassword(16);
    handlePasswordChange(password);
  };

  const updatePasswordPolicy = async (updates: Partial<PasswordPolicy>) => {
    PasswordSecurityService.setPasswordPolicy(updates);
    setPasswordPolicy({ ...passwordPolicy, ...updates });
    
    // Refresh audit data
    const auditData = await PasswordSecurityService.auditPasswordSecurity();
    setPasswordAudit(auditData);
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very-strong': return 'text-green-600 bg-green-100';
      case 'strong': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'weak': return 'text-orange-600 bg-orange-100';
      case 'very-weak': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      // In production, call API to terminate session
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  };

  const blockIP = async (ip: string) => {
    try {
      // In production, call API to block IP
      console.log('Blocking IP:', ip);
    } catch (error) {
      console.error('Failed to block IP:', error);
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = !searchTerm || 
      event.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.ip.includes(searchTerm) ||
      event.type.includes(searchTerm);
    
    const matchesType = selectedEventType === 'all' || event.type === selectedEventType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Security Dashboard - Admin Panel"
        description="Monitor security events, active sessions, and system security metrics."
        noindex={true}
        nofollow={true}
      />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Security Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Monitor system security and user activities</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={fetchSecurityData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.totalSessions}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Logins (24h)</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.failedLogins24h}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspicious Activities</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.suspiciousActivities}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.blockedIPs}</p>
                </div>
                <Ban className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Session (hrs)</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.averageSessionDuration}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Login Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.loginSuccessRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            <TabsTrigger value="passwords">Password Security</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search events by email, IP, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Events</option>
                    <option value="login_success">Login Success</option>
                    <option value="login_failure">Login Failure</option>
                    <option value="suspicious_activity">Suspicious Activity</option>
                    <option value="rate_limit_exceeded">Rate Limit Exceeded</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Security Events Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>
                  Monitor authentication attempts and security incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>User/Email</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            <span className="capitalize">{event.type.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{event.email || 'N/A'}</div>
                          {event.userId && (
                            <div className="text-sm text-gray-500">ID: {event.userId}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            {event.ip}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{event.timestamp.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {JSON.stringify(event.details)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => blockIP(event.ip)}>
                              <Ban className="h-3 w-3 mr-1" />
                              Block IP
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

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active User Sessions</CardTitle>
                <CardDescription>
                  Monitor and manage currently active user sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="font-medium">{session.email}</div>
                          <div className="text-sm text-gray-500">ID: {session.userId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.userAgent)}
                            {session.device}
                          </div>
                        </TableCell>
                        <TableCell>{session.location}</TableCell>
                        <TableCell>{session.ip}</TableCell>
                        <TableCell>
                          {session.createdAt.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {session.lastActivity.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => terminateSession(session.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Terminate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="passwords" className="space-y-6">
            {/* Password Security Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Security Score</p>
                      <p className="text-2xl font-bold text-blue-600">{passwordAudit.securityScore}%</p>
                    </div>
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Weak Passwords</p>
                      <p className="text-2xl font-bold text-red-600">{passwordAudit.weakPasswords}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expired Passwords</p>
                      <p className="text-2xl font-bold text-orange-600">{passwordAudit.expiredPasswords}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Credentials</p>
                      <p className="text-2xl font-bold text-gray-900">{passwordAudit.totalCredentials}</p>
                    </div>
                    <Lock className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password Generator */}
              <Card>
                <CardHeader>
                  <CardTitle>Password Generator</CardTitle>
                  <CardDescription>Generate secure passwords that meet policy requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="Generated password will appear here"
                      className="flex-1"
                    />
                    <Button onClick={generateSecurePassword}>
                      Generate
                    </Button>
                  </div>

                  {passwordStrength && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Password Strength</span>
                        <Badge className={getPasswordStrengthColor(passwordStrength.strength)}>
                          {passwordStrength.strength.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        Score: {passwordStrength.score}/100
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Suggestions:</p>
                          {passwordStrength.feedback.map((feedback, index) => (
                            <p key={index} className="text-sm text-gray-600">• {feedback}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password Policy */}
              <Card>
                <CardHeader>
                  <CardTitle>Password Policy</CardTitle>
                  <CardDescription>Configure password requirements and security rules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Min Length</label>
                      <Input
                        type="number"
                        value={passwordPolicy.minLength}
                        onChange={(e) => updatePasswordPolicy({ minLength: Number(e.target.value) })}
                        min="8"
                        max="128"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Age (days)</label>
                      <Input
                        type="number"
                        value={passwordPolicy.maxAge}
                        onChange={(e) => updatePasswordPolicy({ maxAge: Number(e.target.value) })}
                        min="30"
                        max="365"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Require Uppercase</label>
                      <input
                        type="checkbox"
                        checked={passwordPolicy.requireUppercase}
                        onChange={(e) => updatePasswordPolicy({ requireUppercase: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Require Numbers</label>
                      <input
                        type="checkbox"
                        checked={passwordPolicy.requireNumbers}
                        onChange={(e) => updatePasswordPolicy({ requireNumbers: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Require Special Characters</label>
                      <input
                        type="checkbox"
                        checked={passwordPolicy.requireSpecialChars}
                        onChange={(e) => updatePasswordPolicy({ requireSpecialChars: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Prevent Common Passwords</label>
                      <input
                        type="checkbox"
                        checked={passwordPolicy.preventCommonPasswords}
                        onChange={(e) => updatePasswordPolicy({ preventCommonPasswords: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Recommendations */}
            {passwordAudit.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Recommendations</CardTitle>
                  <CardDescription>Actions to improve password security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {passwordAudit.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Settings</CardTitle>
                  <CardDescription>Configure login and security policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Maximum login attempts</span>
                    <Input type="number" defaultValue="5" className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lockout duration (minutes)</span>
                    <Input type="number" defaultValue="15" className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Session timeout (hours)</span>
                    <Input type="number" defaultValue="24" className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Require strong passwords</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rate Limiting</CardTitle>
                  <CardDescription>Configure API rate limiting policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Requests per window</span>
                    <Input type="number" defaultValue="100" className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Window duration (minutes)</span>
                    <Input type="number" defaultValue="15" className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-block on exceeded</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <Button className="w-full">Update Limits</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminSecurity;