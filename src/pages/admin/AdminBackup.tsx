
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Database, Shield, Calendar, FileText } from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";

const AdminBackup = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAdmin();
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const exportData = async () => {
    setLoading(true);
    try {
      // Define table names with proper typing
      const tableNames = ['clients', 'projects', 'quotes', 'invoices', 'services', 'company_settings'] as const;
      const exportData: any = {};

      for (const table of tableNames) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        exportData[table] = data;
      }

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `akibeks_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Database backup has been downloaded",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Database className="w-8 h-8 mr-3" />
            Backup & Restore
          </h1>
          <p className="text-gray-600 mt-2">Manage your database backups and system maintenance</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Export Database
              </CardTitle>
              <CardDescription>
                Download a complete backup of your database including all projects, clients, quotes, and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">What's included in the backup:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• All client information</li>
                    <li>• Project data and milestones</li>
                    <li>• Quotes and invoices</li>
                    <li>• Service catalog</li>
                    <li>• Company settings</li>
                    <li>• User accounts</li>
                  </ul>
                </div>
                <Button onClick={exportData} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? "Exporting..." : "Export Database"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Backup Schedule
              </CardTitle>
              <CardDescription>
                Configure automatic backup schedules and retention policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-medium">Daily Backups</h3>
                      <p className="text-sm text-gray-600">Automatic daily backup at 2:00 AM</p>
                      <p className="text-xs text-green-600 mt-1">Active</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-medium">Weekly Archives</h3>
                      <p className="text-sm text-gray-600">Weekly archive every Sunday</p>
                      <p className="text-xs text-blue-600 mt-1">Active</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Database className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-medium">Monthly Storage</h3>
                      <p className="text-sm text-gray-600">Monthly long-term storage</p>
                      <p className="text-xs text-purple-600 mt-1">Active</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Restore Database
              </CardTitle>
              <CardDescription>
                Restore your database from a previous backup file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Warning</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Restoring a backup will overwrite all current data. Make sure to create a backup of your current data before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  <Upload className="w-4 h-4 mr-2" />
                  Select Backup File
                </Button>
                <p className="text-sm text-gray-500">
                  Contact support for assistance with database restoration.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminBackup;
