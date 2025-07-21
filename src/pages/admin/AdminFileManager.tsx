import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FolderPlus, 
  Search, 
  Filter, 
  Download, 
  Share, 
  Trash2, 
  Edit, 
  Eye, 
  File, 
  Folder, 
  Image, 
  FileText, 
  Video,
  Music,
  Archive,
  Code,
  Grid,
  List,
  SortAsc,
  MoreVertical,
  Link,
  Copy,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileStorageManager } from "@/lib/file-storage";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';

interface FileMetadata {
  id?: string;
  name: string;
  path: string;
  size: number;
  type: string;
  folder_id?: string;
  uploaded_by: string;
  uploaded_at: Date;
  updated_at?: Date;
  is_public: boolean;
  download_count: number;
  tags?: string[];
  description?: string;
}

interface FileFolder {
  id?: string;
  name: string;
  path: string;
  parent_id?: string;
  created_by: string;
  created_at: Date;
  updated_at?: Date;
}

interface FileShareLink {
  id?: string;
  file_id: string;
  share_token: string;
  expires_at?: Date;
  password?: string;
  download_limit?: number;
  download_count: number;
  created_by: string;
  created_at: Date;
}

const AdminFileManager: React.FC = () => {
  const { isAuthenticated } = useAdmin();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [folders, setFolders] = useState<FileFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedFileForShare, setSelectedFileForShare] = useState<FileMetadata | null>(null);
  const [shareLinks, setShareLinks] = useState<FileShareLink[]>([]);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0 });

  const fileStorageManager = new FileStorageManager();

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
      loadFolders();
      loadStorageUsage();
    }
  }, [isAuthenticated, currentFolderId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filesData = await fileStorageManager.getFilesByFolder(currentFolderId || 'root');
      setFiles(filesData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load files.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const foldersData = await fileStorageManager.getFoldersByParent(currentFolderId);
      setFolders(foldersData || []);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const loadStorageUsage = async () => {
    try {
      const usage = await fileStorageManager.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Failed to load storage usage:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const result = await fileStorageManager.uploadFile(
          file,
          currentFolderId || 'root',
          {
            onProgress: (progress) => {
              setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
            }
          }
        );

        if (result) {
          toast({
            title: "Success",
            description: `${file.name} uploaded successfully.`,
          });
          loadFiles();
          loadStorageUsage();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}.`,
          variant: "destructive",
        });
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  }, [currentFolderId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleCreateFolder = async (folderName: string) => {
    try {
      const newFolder = await fileStorageManager.createFolder(
        folderName,
        currentFolderId || 'root',
        'admin'
      );

      if (newFolder) {
        toast({
          title: "Success",
          description: "Folder created successfully.",
        });
        loadFolders();
        setIsCreateFolderOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFile = async (file: FileMetadata) => {
    try {
      const url = await fileStorageManager.downloadFile(file.id!);
      window.open(url, '_blank');
      
      toast({
        title: "Success",
        description: "File download started.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileStorageManager.deleteFile(fileId);
      
      toast({
        title: "Success",
        description: "File deleted successfully.",
      });
      loadFiles();
      loadStorageUsage();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file.",
        variant: "destructive",
      });
    }
  };

  const handleShareFile = async (file: FileMetadata, options: { expires_at?: Date; password?: string; download_limit?: number }) => {
    try {
      const shareLink = await fileStorageManager.createShareLink(file.id!, options);
      
      if (shareLink) {
        toast({
          title: "Success",
          description: "Share link created successfully.",
        });
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareLink.url);
        setIsShareDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create share link.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (fileType === 'application/pdf' || extension === 'pdf') return <FileText className="w-4 h-4" />;
    if (['zip', 'rar', '7z', 'tar'].includes(extension || '')) return <Archive className="w-4 h-4" />;
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml'].includes(extension || '')) return <Code className="w-4 h-4" />;
    
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type.startsWith(filterType);
    return matchesSearch && matchesFilter;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'date':
        return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const CreateFolderForm: React.FC<{ onSubmit: (name: string) => void }> = ({ onSubmit }) => {
    const [folderName, setFolderName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (folderName.trim()) {
        onSubmit(folderName.trim());
        setFolderName('');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="folderName">Folder Name</Label>
          <Input
            id="folderName"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name"
            required
          />
        </div>
        <Button type="submit" className="w-full">Create Folder</Button>
      </form>
    );
  };

  const ShareDialog: React.FC<{ file: FileMetadata; onShare: (options: any) => void }> = ({ file, onShare }) => {
    const [shareOptions, setShareOptions] = useState({
      expires_at: '',
      password: '',
      download_limit: ''
    });

    const handleSubmit = () => {
      const options: any = {};
      if (shareOptions.expires_at) options.expires_at = new Date(shareOptions.expires_at);
      if (shareOptions.password) options.password = shareOptions.password;
      if (shareOptions.download_limit) options.download_limit = parseInt(shareOptions.download_limit);
      
      onShare(options);
    };

    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Sharing: {file.name}</h4>
          <p className="text-sm text-gray-600 mt-1">Create a secure link to share this file</p>
        </div>

        <div>
          <Label htmlFor="expires_at">Expiration Date (optional)</Label>
          <Input
            id="expires_at"
            type="datetime-local"
            value={shareOptions.expires_at}
            onChange={(e) => setShareOptions({ ...shareOptions, expires_at: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="password">Password Protection (optional)</Label>
          <Input
            id="password"
            type="password"
            value={shareOptions.password}
            onChange={(e) => setShareOptions({ ...shareOptions, password: e.target.value })}
            placeholder="Enter password"
          />
        </div>

        <div>
          <Label htmlFor="download_limit">Download Limit (optional)</Label>
          <Input
            id="download_limit"
            type="number"
            value={shareOptions.download_limit}
            onChange={(e) => setShareOptions({ ...shareOptions, download_limit: e.target.value })}
            placeholder="Number of downloads allowed"
            min="1"
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          <Link className="w-4 h-4 mr-2" />
          Create Share Link
        </Button>
      </div>
    );
  };

  const FileUploadArea: React.FC = () => (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      {isDragActive ? (
        <p className="text-lg text-blue-600">Drop the files here...</p>
      ) : (
        <div>
          <p className="text-lg text-gray-600 mb-2">Drag & drop files here, or click to select</p>
          <p className="text-sm text-gray-500">Maximum file size: 100MB</p>
        </div>
      )}
    </div>
  );

  const FileItem: React.FC<{ file: FileMetadata; isSelected: boolean; onSelect: () => void }> = ({ 
    file, 
    isSelected, 
    onSelect 
  }) => {
    const [showOptions, setShowOptions] = useState(false);

    if (viewMode === 'grid') {
      return (
        <Card className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getFileIcon(file.name, file.type)}
                <span className="text-xs text-gray-500">{file.type.split('/')[1]?.toUpperCase()}</span>
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                {showOptions && (
                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleDownloadFile(file)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedFileForShare(file);
                        setIsShareDialogOpen(true);
                      }}
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600"
                      onClick={() => handleDeleteFile(file.id!)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div onClick={onSelect}>
              {file.type.startsWith('image/') ? (
                <img
                  src={`/api/files/thumbnail/${file.id}`}
                  alt={file.name}
                  className="w-full h-32 object-cover rounded mb-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                  {getFileIcon(file.name, file.type)}
                </div>
              )}
              
              <h4 className="font-medium text-sm truncate" title={file.name}>
                {file.name}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(file.size)} • {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
              </p>
              
              {file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {file.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {file.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{file.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div 
        className={`flex items-center p-3 border-b hover:bg-gray-50 cursor-pointer ${
          isSelected ? 'bg-blue-50 border-blue-200' : ''
        }`}
        onClick={onSelect}
      >
        <div className="flex items-center gap-3 flex-1">
          {getFileIcon(file.name, file.type)}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{file.name}</h4>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.size)} • {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {file.type.split('/')[1]?.toUpperCase()}
          </Badge>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadFile(file);
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFileForShare(file);
                setIsShareDialogOpen(true);
              }}
            >
              <Share className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile(file.id!);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const StorageUsageCard: React.FC = () => {
    const usagePercentage = storageUsage.total > 0 ? (storageUsage.used / storageUsage.total) * 100 : 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={usagePercentage} className="w-full" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{formatFileSize(storageUsage.used)} used</span>
              <span>{formatFileSize(storageUsage.total)} total</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium">
                {usagePercentage.toFixed(1)}% used
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">File Manager</h1>
          
          <div className="flex items-center gap-2">
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <CreateFolderForm onSubmit={handleCreateFolder} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search files..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Files</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="application">Documents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="size">Size</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                      {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="files" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="files" className="mt-6">
                    {/* Folders */}
                    {folders.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Folders</h3>
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-1'}>
                          {folders.map(folder => (
                            <Card key={folder.id} className="cursor-pointer hover:shadow-md" onClick={() => setCurrentFolderId(folder.id!)}>
                              <CardContent className="p-4 flex items-center gap-3">
                                <Folder className="w-8 h-8 text-blue-500" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">{folder.name}</h4>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(folder.created_at), 'MMM d, yyyy')}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files */}
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : sortedFiles.length === 0 ? (
                      <div className="text-center py-8">
                        <File className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No files found</p>
                      </div>
                    ) : (
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-1'}>
                        {sortedFiles.map(file => (
                          <FileItem
                            key={file.id}
                            file={file}
                            isSelected={selectedFiles.has(file.id!)}
                            onSelect={() => {
                              const newSelected = new Set(selectedFiles);
                              if (newSelected.has(file.id!)) {
                                newSelected.delete(file.id!);
                              } else {
                                newSelected.add(file.id!);
                              }
                              setSelectedFiles(newSelected);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="upload" className="mt-6">
                    <FileUploadArea />
                    
                    {/* Upload Progress */}
                    {Object.keys(uploadProgress).length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h3 className="font-medium">Uploading Files</h3>
                        {Object.entries(uploadProgress).map(([fileName, progress]) => (
                          <div key={fileName} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="truncate">{fileName}</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <StorageUsageCard />
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download Selected ({selectedFiles.size})
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share className="w-4 h-4 mr-2" />
                  Bulk Share
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.slice(0, 5).map(file => (
                    <div key={file.id} className="flex items-center gap-3 text-sm">
                      {getFileIcon(file.name, file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(file.uploaded_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Share Dialog */}
        {selectedFileForShare && (
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Share File</DialogTitle>
              </DialogHeader>
              <ShareDialog
                file={selectedFileForShare}
                onShare={(options) => handleShareFile(selectedFileForShare, options)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminFileManager;