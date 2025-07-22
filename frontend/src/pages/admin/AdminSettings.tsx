import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, RefreshCw } from "lucide-react";
import SEOHead from "@/components/SEO/SEOHead";

const AdminSettings: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Settings - Admin Panel" 
        description="Configure system settings and preferences." 
        noindex={true} 
        nofollow={true} 
      />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              Settings
            </h1>
            <p className="text-gray-600 mt-2">Configure system settings and preferences</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input defaultValue="AKIBEKS Engineering Solutions" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue="info@akibeks.co.ke" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input defaultValue="+254 700 000 000" />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Textarea defaultValue="Nairobi, Kenya" rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Configure system behavior and defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Email Notifications</label>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-save</label>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Dark Mode</label>
                <input type="checkbox" className="rounded" />
              </div>
              <div>
                <label className="text-sm font-medium">Default Currency</label>
                <Input defaultValue="KES" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Two-Factor Authentication</label>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Session Timeout (minutes)</label>
                <Input defaultValue="30" type="number" className="w-20" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password Expiry (days)</label>
                <Input defaultValue="90" type="number" className="w-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup & Maintenance</CardTitle>
              <CardDescription>System maintenance and backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Backup</label>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Backup Frequency</label>
                <select className="border rounded px-3 py-2">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Create Backup Now
                </Button>
                <Button variant="outline" className="w-full">
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;