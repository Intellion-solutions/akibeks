
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, FileText, Download, Eye, Upload, Folder, Calendar } from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";

const AdminDocuments = () => {
  const { isAuthenticated } = useAdmin();
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file_path: "",
    file_name: "",
    file_type: "",
    category: "general",
    project_id: ""
  });

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  useEffect(() => {
    fetchDocuments();
    fetchProjects();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          project:project_id(title),
          uploaded_by:uploaded_by_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .neq('status', 'cancelled');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        project_id: formData.project_id || null,
        file_size: 0 // Mock file size since we're not handling actual file uploads yet
      };

      const { error } = await supabase
        .from('documents')
        .insert([submitData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document added successfully"
      });
      
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        file_path: "",
        file_name: "",
        file_type: "",
        category: "general",
        project_id: ""
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = documents.filter((doc: any) =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'image':
        return <Folder className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const totalDocuments = documents.length;
  const categories = new Set(documents.map((doc: any) => doc.category)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3" />
              Document Management
            </h1>
            <p className="text-gray-600 mt-2">Manage project documents and files</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Document</DialogTitle>
                <DialogDescription>
                  Add a new document to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter document title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter document description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="file_name">File Name</Label>
                    <Input
                      id="file_name"
                      value={formData.file_name}
                      onChange={(e) => setFormData({...formData, file_name: e.target.value})}
                      placeholder="e.g., document.pdf"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="file_type">File Type</Label>
                    <Select value={formData.file_type} onValueChange={(value) => setFormData({...formData, file_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select file type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="file_path">File Path/URL</Label>
                  <Input
                    id="file_path"
                    value={formData.file_path}
                    onChange={(e) => setFormData({...formData, file_path: e.target.value})}
                    placeholder="Enter file path or URL"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="proposals">Proposals</SelectItem>
                        <SelectItem value="contracts">Contracts</SelectItem>
                        <SelectItem value="reports">Technical Reports</SelectItem>
                        <SelectItem value="legal">Legal Documents</SelectItem>
                        <SelectItem value="site">Site Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="project_id">Project</Label>
                    <Select value={formData.project_id} onValueChange={(value) => setFormData({...formData, project_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No project</SelectItem>
                        {projects.map((project: any) => (
                          <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Document</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {documents.filter((doc: any) => {
                      const docDate = new Date(doc.created_at);
                      const now = new Date();
                      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(documents.filter((doc: any) => doc.project_id).map((doc: any) => doc.project_id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Folder className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc: any) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(doc.file_type)}
                      <div>
                        <h3 className="font-semibold text-lg">{doc.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>File: {doc.file_name}</span>
                          {doc.project?.title && (
                            <>
                              <span>•</span>
                              <span>Project: {doc.project.title}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Category: {doc.category}</span>
                          <span>•</span>
                          <span>Added: {new Date(doc.created_at).toLocaleDateString()}</span>
                          {doc.uploaded_by?.full_name && (
                            <>
                              <span>•</span>
                              <span>By: {doc.uploaded_by.full_name}</span>
                            </>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="capitalize">
                        {doc.category}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search criteria" : "Start by adding your first document"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDocuments;
