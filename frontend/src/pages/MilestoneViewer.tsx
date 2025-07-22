
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, User, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/db-client";

interface Milestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  completion_date: string;
  is_completed: boolean;
  project: {
    title: string;
    location: string;
    progress_percentage: number;
  };
}

const MilestoneViewer = () => {
  const { token } = useParams();
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetchMilestone();
    }
  }, [token]);

  const fetchMilestone = async () => {
    try {
      // First, try to get the token data using direct table access
      const { data: tokenData, error: tokenError } = await (supabase as any)
        .from('milestone_share_tokens')
        .select('milestone_id, expires_at, is_active')
        .eq('token', token)
        .eq('is_active', true)
        .single();
      
      if (tokenError || !tokenData) {
        setError("Invalid or expired share link");
        return;
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        setError("This share link has expired");
        return;
      }

      // Fetch milestone data
      const { data: milestoneData, error: milestoneError } = await supabase
        .from('project_milestones')
        .select(`
          *,
          projects!inner(title, location, progress_percentage)
        `)
        .eq('id', tokenData.milestone_id)
        .single();

      if (milestoneError || !milestoneData) {
        setError("Milestone not found");
        return;
      }

      setMilestone({
        ...milestoneData,
        project: milestoneData.projects
      });
    } catch (error) {
      console.error('Error fetching milestone:', error);
      setError("Failed to load milestone data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading milestone...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!milestone) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Milestone</h1>
          <p className="text-gray-600">Shared milestone progress view</p>
        </div>

        {/* Project Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {milestone.project.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {milestone.project.location}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Project Progress</span>
                  <span>{milestone.project.progress_percentage}%</span>
                </div>
                <Progress value={milestone.project.progress_percentage} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestone Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{milestone.title}</CardTitle>
              <Badge variant={milestone.is_completed ? "default" : "secondary"}>
                {milestone.is_completed ? "Completed" : "In Progress"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {milestone.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Target Date</p>
                      <p className="text-sm text-gray-600">
                        {milestone.target_date 
                          ? new Date(milestone.target_date).toLocaleDateString()
                          : "Not set"
                        }
                      </p>
                    </div>
                  </div>

                  {milestone.completion_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Completion Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(milestone.completion_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    milestone.is_completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <span className={`text-3xl ${
                      milestone.is_completed ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {milestone.is_completed ? '✓' : '⏳'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This milestone was shared by the project team for your review.</p>
        </div>
      </div>
    </div>
  );
};

export default MilestoneViewer;
