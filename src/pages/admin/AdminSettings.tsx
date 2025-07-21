import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";

const AdminSettings = () => {
  const { toast } = useToast();
  const { isAuthenticated, companySettings, loadCompanySettings } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    company: {
      company_name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      tax_id: "",
      registration_number: "",
      logo_url: "",
      description: "",
    },
    billing: {
      currency_symbol: "KSh",
      tax_rate: 0,
      payment_terms: "",
      invoice_prefix: "INV",
      quote_prefix: "Q",
    },
    notifications: {
      email_notifications: false,
      project_updates: false,
      payment_reminders: false,
      quote_expiry_alerts: false,
      system_maintenance: false,
    },
    system: {
      timezone: "UTC",
      date_format: "DD/MM/YYYY",
      language: "en",
      backup_frequency: "daily",
      auto_archive: false,
    },
    security: {
      two_factor_auth: false,
      session_timeout: 30,
      password_policy: "standard",
      login_attempts: 3,
      ip_restrictions: false,
    },
    ui: {
      theme: "light",
      primary_color: "#3b82f6",
      sidebar_collapsed: false,
      compact_mode: false,
      show_animations: false,
    }
  });

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  useEffect(() => {
    loadCompanySettings();
  }, [loadCompanySettings]);

  useEffect(() => {
    if (Object.keys(companySettings).length > 0) {
      setSettings({
        company: {
          company_name: companySettings.company_name || "",
          address: companySettings.address || "",
          phone: companySettings.phone || "",
          email: companySettings.email || "",
          website: companySettings.website || "",
          tax_id: companySettings.tax_id || "",
          registration_number: companySettings.registration_number || "",
          logo_url: companySettings.logo_url || "",
          description: companySettings.description || "",
        },
        billing: {
          currency_symbol: companySettings.currency_symbol || "KSh",
          tax_rate: Number(companySettings.tax_rate) || 0,
          payment_terms: companySettings.payment_terms || "",
          invoice_prefix: companySettings.invoice_prefix || "INV",
          quote_prefix: companySettings.quote_prefix || "Q",
        },
        notifications: {
          email_notifications: Boolean(companySettings.email_notifications),
          project_updates: Boolean(companySettings.project_updates),
          payment_reminders: Boolean(companySettings.payment_reminders),
          quote_expiry_alerts: Boolean(companySettings.quote_expiry_alerts),
          system_maintenance: Boolean(companySettings.system_maintenance),
        },
        system: {
          timezone: companySettings.timezone || "UTC",
          date_format: companySettings.date_format || "DD/MM/YYYY",
          language: companySettings.language || "en",
          backup_frequency: companySettings.backup_frequency || "daily",
          auto_archive: Boolean(companySettings.auto_archive),
        },
        security: {
          two_factor_auth: Boolean(companySettings.two_factor_auth),
          session_timeout: Number(companySettings.session_timeout) || 30,
          password_policy: companySettings.password_policy || "standard",
          login_attempts: Number(companySettings.login_attempts) || 3,
          ip_restrictions: Boolean(companySettings.ip_restrictions),
        },
        ui: {
          theme: companySettings.theme || "light",
          primary_color: companySettings.primary_color || "#3b82f6",
          sidebar_collapsed: Boolean(companySettings.sidebar_collapsed),
          compact_mode: Boolean(companySettings.compact_mode),
          show_animations: Boolean(companySettings.show_animations),
        }
      });
    }
  }, [companySettings]);

  const handleSettingsChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Prepare settings to be saved
      const updates = [];
      for (const sectionKey in settings) {
        const section = settings[sectionKey];
        for (const settingKey in section) {
          let settingValue = section[settingKey];

          // Convert boolean values to string
          if (typeof settingValue === 'boolean') {
            settingValue = settingValue.toString();
          } else if (typeof settingValue === 'number') {
            settingValue = settingValue.toString();
          }

          updates.push({
            setting_key: settingKey,
            setting_value: settingValue,
          });
        }
      }

      // Update company settings in the database
      for (const update of updates) {
        const { error } = await supabase
          .from('company_settings')
          .upsert({
            setting_key: update.setting_key,
            setting_value: update.setting_value,
          }, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      toast({
        title: "Settings Saved",
        description: "Company settings have been updated successfully.",
      });

      // Reload company settings to reflect changes
      await loadCompanySettings();
    } catch (error) {
      console.error('Error updating company settings:', error);
      toast({
        title: "Error",
        description: "Failed to update company settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3" />
            Company Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your company information and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Update your company details
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.company.company_name}
                  onChange={(e) => handleSettingsChange('company', 'company_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.company.address}
                  onChange={(e) => handleSettingsChange('company', 'address', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={settings.company.phone}
                  onChange={(e) => handleSettingsChange('company', 'phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.company.email}
                  onChange={(e) => handleSettingsChange('company', 'email', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.company.website}
                  onChange={(e) => handleSettingsChange('company', 'website', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={settings.company.tax_id}
                  onChange={(e) => handleSettingsChange('company', 'tax_id', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={settings.company.registration_number}
                  onChange={(e) => handleSettingsChange('company', 'registration_number', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={settings.company.logo_url}
                  onChange={(e) => handleSettingsChange('company', 'logo_url', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.company.description}
                onChange={(e) => handleSettingsChange('company', 'description', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Settings</CardTitle>
            <CardDescription>
              Configure billing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currencySymbol">Currency Symbol</Label>
                <Input
                  id="currencySymbol"
                  value={settings.billing.currency_symbol}
                  onChange={(e) => handleSettingsChange('billing', 'currency_symbol', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.billing.tax_rate}
                  onChange={(e) => handleSettingsChange('billing', 'tax_rate', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={settings.billing.payment_terms}
                  onChange={(e) => handleSettingsChange('billing', 'payment_terms', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={settings.billing.invoice_prefix}
                  onChange={(e) => handleSettingsChange('billing', 'invoice_prefix', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quotePrefix">Quote Prefix</Label>
              <Input
                id="quotePrefix"
                value={settings.billing.quote_prefix}
                onChange={(e) => handleSettingsChange('billing', 'quote_prefix', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Manage email notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="emailNotifications"
                checked={settings.notifications.email_notifications}
                onCheckedChange={(checked) => handleSettingsChange('notifications', 'email_notifications', checked)}
              />
              <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="projectUpdates"
                checked={settings.notifications.project_updates}
                onCheckedChange={(checked) => handleSettingsChange('notifications', 'project_updates', checked)}
              />
              <Label htmlFor="projectUpdates">Project Updates</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="paymentReminders"
                checked={settings.notifications.payment_reminders}
                onCheckedChange={(checked) => handleSettingsChange('notifications', 'payment_reminders', checked)}
              />
              <Label htmlFor="paymentReminders">Payment Reminders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="quoteExpiryAlerts"
                checked={settings.notifications.quote_expiry_alerts}
                onCheckedChange={(checked) => handleSettingsChange('notifications', 'quote_expiry_alerts', checked)}
              />
              <Label htmlFor="quoteExpiryAlerts">Quote Expiry Alerts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="systemMaintenance"
                checked={settings.notifications.system_maintenance}
                onCheckedChange={(checked) => handleSettingsChange('notifications', 'system_maintenance', checked)}
              />
              <Label htmlFor="systemMaintenance">System Maintenance Alerts</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={settings.system.timezone}
                  onChange={(e) => handleSettingsChange('system', 'timezone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Input
                  id="dateFormat"
                  value={settings.system.date_format}
                  onChange={(e) => handleSettingsChange('system', 'date_format', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={settings.system.language}
                  onChange={(e) => handleSettingsChange('system', 'language', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Input
                  id="backupFrequency"
                  value={settings.system.backup_frequency}
                  onChange={(e) => handleSettingsChange('system', 'backup_frequency', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoArchive"
                checked={settings.system.auto_archive}
                onCheckedChange={(checked) => handleSettingsChange('system', 'auto_archive', checked)}
              />
              <Label htmlFor="autoArchive">Auto Archive</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Configure security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="twoFactorAuth"
                checked={settings.security.two_factor_auth}
                onCheckedChange={(checked) => handleSettingsChange('security', 'two_factor_auth', checked)}
              />
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.session_timeout}
                  onChange={(e) => handleSettingsChange('security', 'session_timeout', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="passwordPolicy">Password Policy</Label>
                <Input
                  id="passwordPolicy"
                  value={settings.security.password_policy}
                  onChange={(e) => handleSettingsChange('security', 'password_policy', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loginAttempts">Login Attempts</Label>
                <Input
                  id="loginAttempts"
                  type="number"
                  value={settings.security.login_attempts}
                  onChange={(e) => handleSettingsChange('security', 'login_attempts', parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ipRestrictions"
                  checked={settings.security.ip_restrictions}
                  onCheckedChange={(checked) => handleSettingsChange('security', 'ip_restrictions', checked)}
                />
                <Label htmlFor="ipRestrictions">IP Restrictions</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>UI Settings</CardTitle>
            <CardDescription>
              Customize the look and feel of your application
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Input
                  id="theme"
                  value={settings.ui.theme}
                  onChange={(e) => handleSettingsChange('ui', 'theme', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  value={settings.ui.primary_color}
                  onChange={(e) => handleSettingsChange('ui', 'primary_color', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sidebarCollapsed"
                  checked={settings.ui.sidebar_collapsed}
                  onCheckedChange={(checked) => handleSettingsChange('ui', 'sidebar_collapsed', checked)}
                />
                <Label htmlFor="sidebarCollapsed">Sidebar Collapsed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="compactMode"
                  checked={settings.ui.compact_mode}
                  onCheckedChange={(checked) => handleSettingsChange('ui', 'compact_mode', checked)}
                />
                <Label htmlFor="compactMode">Compact Mode</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showAnimations"
                checked={settings.ui.show_animations}
                onCheckedChange={(checked) => handleSettingsChange('ui', 'show_animations', checked)}
              />
              <Label htmlFor="showAnimations">Show Animations</Label>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
