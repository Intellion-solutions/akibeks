
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Star, Eye, Check, X, Edit, Trash2, Search, Users, Award } from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/ui/user-avatar";

interface Testimonial {
  id: string;
  client_name: string;
  client_role: string;
  content: string;
  rating: number;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  projects?: {
    title: string;
  } | null;
}

const AdminTestimonials = () => {
  const { isAuthenticated } = useAdmin();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    featured: 0,
    averageRating: 0
  });
  const { toast } = useToast();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          *,
          projects (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTestimonials(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(t => !t.is_approved).length || 0;
      const approved = data?.filter(t => t.is_approved).length || 0;
      const featured = data?.filter(t => t.is_featured).length || 0;
      const averageRating = total > 0 ? data?.reduce((sum, t) => sum + (t.rating || 0), 0) / total : 0;

      setStats({ total, pending, approved, featured, averageRating });
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: "Error",
        description: "Failed to fetch testimonials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;

      await fetchTestimonials();
      toast({
        title: "Success",
        description: "Testimonial approved successfully"
      });
    } catch (error) {
      console.error('Error approving testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to approve testimonial",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTestimonials();
      toast({
        title: "Success",
        description: "Testimonial rejected and removed"
      });
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to reject testimonial",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      await fetchTestimonials();
      toast({
        title: "Success",
        description: `Testimonial ${!currentStatus ? 'featured' : 'unfeatured'} successfully`
      });
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to update testimonial",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (updatedTestimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          client_name: updatedTestimonial.client_name,
          client_role: updatedTestimonial.client_role,
          content: updatedTestimonial.content,
          rating: updatedTestimonial.rating
        })
        .eq('id', updatedTestimonial.id);

      if (error) throw error;

      await fetchTestimonials();
      setEditingTestimonial(null);
      toast({
        title: "Success",
        description: "Testimonial updated successfully"
      });
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to update testimonial",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (testimonial.client_role || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "pending" && !testimonial.is_approved) ||
                         (statusFilter === "approved" && testimonial.is_approved) ||
                         (statusFilter === "featured" && testimonial.is_featured);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-8 h-8 mr-3" />
              Testimonial Management
            </h1>
            <p className="text-gray-600 mt-2">Review, approve, and manage client testimonials</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.featured}</p>
                </div>
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600 fill-current" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search testimonials, clients, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTestimonials.map(testimonial => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <UserAvatar 
                      name={testimonial.client_name}
                      size="md"
                    />
                    <div>
                      <CardTitle className="text-lg">{testimonial.client_name}</CardTitle>
                      <CardDescription>{testimonial.client_role}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {testimonial.is_featured && (
                      <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                    )}
                    <Badge variant={testimonial.is_approved ? "default" : "secondary"}>
                      {testimonial.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(testimonial.rating || 0)}
                  <span className="ml-2 text-sm text-gray-600">({testimonial.rating || 0}/5)</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{testimonial.content}</p>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    {new Date(testimonial.created_at).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTestimonial(testimonial)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <div className="flex items-center space-x-3 mb-4">
                            <UserAvatar 
                              name={selectedTestimonial?.client_name || ''}
                              size="lg"
                            />
                            <div>
                              <DialogTitle>{selectedTestimonial?.client_name}</DialogTitle>
                              <DialogDescription>{selectedTestimonial?.client_role}</DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-1">
                            {selectedTestimonial && renderStars(selectedTestimonial.rating || 0)}
                            <span className="ml-2">({selectedTestimonial?.rating || 0}/5)</span>
                          </div>
                          <p className="text-gray-700">{selectedTestimonial?.content}</p>
                          <p className="text-sm text-gray-500">
                            Submitted: {selectedTestimonial && new Date(selectedTestimonial.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingTestimonial(testimonial)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    {!testimonial.is_approved && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApprove(testimonial.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}

                    {testimonial.is_approved && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
                        className={testimonial.is_featured ? "text-purple-600" : "text-gray-600"}
                      >
                        <Award className="w-4 h-4" />
                      </Button>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReject(testimonial.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTestimonials.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search criteria or filters"
                  : "No testimonials submitted yet"
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingTestimonial} onOpenChange={() => setEditingTestimonial(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Testimonial</DialogTitle>
              <DialogDescription>Update testimonial details</DialogDescription>
            </DialogHeader>
            {editingTestimonial && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={editingTestimonial.client_name}
                      onChange={(e) => setEditingTestimonial({
                        ...editingTestimonial,
                        client_name: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientRole">Client Role</Label>
                    <Input
                      id="clientRole"
                      value={editingTestimonial.client_role || ''}
                      onChange={(e) => setEditingTestimonial({
                        ...editingTestimonial,
                        client_role: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Select 
                    value={(editingTestimonial.rating || 0).toString()} 
                    onValueChange={(value) => setEditingTestimonial({
                      ...editingTestimonial,
                      rating: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Testimonial Content</Label>
                  <Textarea
                    id="content"
                    value={editingTestimonial.content}
                    onChange={(e) => setEditingTestimonial({
                      ...editingTestimonial,
                      content: e.target.value
                    })}
                    rows={5}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTestimonial(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingTestimonial && handleUpdate(editingTestimonial)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTestimonials;
