import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Download, 
  Trash2, 
  Share2, 
  FolderPlus, 
  File, 
  Folder, 
  Search, 
  Filter,
  Grid,
  List,
  Image,
  FileText,
  Archive,
  Video,
  Music,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Move
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from 'react-dropzone';
import FileStorageManager, { FileMetadata, FileFolder, FileUploadOptions } from '@/lib/file-storage';

interface AdminFileManagerProps {}

const AdminFileManager: React.FC<AdminFileManagerProps> = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [folders, setFolders] = useState<FileFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const fileManager = new FileStorageManager();

  useEffect(() => {
    loadFiles();
  }, [currentFolder, filterCategory, searchQuery]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      
      if (searchQuery) {
        const searchResults = await fileManager.searchFiles(
          searchQuery,
          { category: filterCategory !== 'all' ? filterCategory : undefined },
          'current-user-id'
        );
        setFiles(searchResults);
        setFolders([]);
      } else {
        const { files: folderFiles, folders: folderSubfolders } = await fileManager.getFilesByFolder(
          currentFolder,
          'current-user-id'
        );
        setFiles(folderFiles);
        setFolders(folderSubfolders);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => handleFileUpload(file));
  }, [currentFolder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const handleFileUpload = async (file: File) => {
    try {
      const options: FileUploadOptions = {
        category: 'project',
        folder_id: currentFolder || undefined,
        auto_process: true,
        generate_thumbnail: true,
        virus_scan: true
      };

      const fileId = `upload-${Date.now()}-${Math.random()}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      await fileManager.uploadFile(
        file,
        options,
        'current-user-id',
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }
      );

      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`
      });

      loadFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload ${file.name}`,
        variant: "destructive"
      });
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await fileManager.createFolder(
        name,
        currentFolder,
        'current-user-id',
        { category: 'general' }
      );

      toast({
        title: "Success",
        description: "Folder created successfully"
      });

      setIsCreateFolderOpen(false);
      loadFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await fileManager.downloadFile(fileId, 'current-user-id');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "File downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await fileManager.deleteFile(fileId, 'current-user-id');
      
      toast({
        title: "Success",
        description: "File deleted successfully"
      });

      loadFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (fileId: string) => {
    try {
      const shareLink = await fileManager.createShareLink(
        fileId,
        'download',
        {
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        'current-user-id'
      );

      const shareUrl = `${window.location.origin}/shared/${shareLink.token}`;
      
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Success",
        description: "Share link copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (fileType: string, mimeType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-green-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-yellow-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const breadcrumbs = [];
  let currentPath = currentFolder;
  while (currentPath) {
    const folder = folders.find(f => f.id === currentPath);
    if (folder) {
      breadcrumbs.unshift(folder);
      currentPath = folder.parent_folder_id;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">File Manager</h1>
          <p className="text-gray-600">Manage, organize, and share your files</p>
        </div>
        
        <div className="flex items-center space-x-2">
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
              <CreateFolderForm 
                onSubmit={handleCreateFolder} 
                onCancel={() => setIsCreateFolderOpen(false)} 
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <FileUploadArea onDrop={onDrop} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Breadcrumbs */}
              <div className="flex items-center space-x-2 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentFolder(null)}
                  className="px-2"
                >
                  Home
                </Button>
                {breadcrumbs.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <span className="text-gray-400">/</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentFolder(folder.id)}
                      className="px-2"
                    >
                      {folder.name}
                    </Button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Grid/List */}
      <Card>
        <CardContent className="p-0">
          <div 
            {...getRootProps()}
            className={`p-6 border-2 border-dashed border-gray-300 rounded-lg ${
              isDragActive ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <input {...getInputProps()} />
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading files...</p>
              </div>
            ) : (
              <>
                {/* Folders */}
                {folders.length > 0 && (
                  <div className={`mb-6 ${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' 
                      : 'space-y-2'
                  }`}>
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className={`cursor-pointer group ${
                          viewMode === 'grid'
                            ? 'p-4 border rounded-lg hover:bg-gray-50 text-center'
                            : 'flex items-center p-3 border rounded-lg hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentFolder(folder.id)}
                      >
                        <Folder className={`text-blue-500 ${
                          viewMode === 'grid' ? 'w-8 h-8 mx-auto mb-2' : 'w-5 h-5 mr-3'
                        }`} />
                        <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                          <p className="font-medium text-sm truncate">{folder.name}</p>
                          {viewMode === 'list' && (
                            <p className="text-xs text-gray-500">
                              {new Date(folder.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Files */}
                {files.length > 0 ? (
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' 
                      : 'space-y-2'
                  }>
                    {files.map((file) => (
                      <FileItem
                        key={file.id}
                        file={file}
                        viewMode={viewMode}
                        isSelected={selectedFiles.includes(file.id)}
                        onSelect={(fileId, selected) => {
                          if (selected) {
                            setSelectedFiles(prev => [...prev, fileId]);
                          } else {
                            setSelectedFiles(prev => prev.filter(id => id !== fileId));
                          }
                        }}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onShare={handleShare}
                        getFileIcon={getFileIcon}
                        formatFileSize={formatFileSize}
                      />
                    ))}
                  </div>
                ) : !loading && (
                  <div className="text-center py-8">
                    {isDragActive ? (
                      <p className="text-blue-600">Drop files here to upload</p>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No files found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Drag and drop files here or click upload to add files
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {selectedFiles.length} file(s) selected
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Move className="w-4 h-4 mr-2" />
                  Move
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Usage */}
      <StorageUsageCard />
    </div>
  );
};

// File Item Component
const FileItem: React.FC<{
  file: FileMetadata;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: (fileId: string, selected: boolean) => void;
  onDownload: (fileId: string, fileName: string) => void;
  onDelete: (fileId: string) => void;
  onShare: (fileId: string) => void;
  getFileIcon: (fileType: string, mimeType: string) => React.ReactNode;
  formatFileSize: (bytes: number) => string;
}> = ({ 
  file, 
  viewMode, 
  isSelected, 
  onSelect, 
  onDownload, 
  onDelete, 
  onShare, 
  getFileIcon, 
  formatFileSize 
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`group relative ${
        viewMode === 'grid'
          ? 'p-4 border rounded-lg hover:bg-gray-50 text-center'
          : 'flex items-center p-3 border rounded-lg hover:bg-gray-50'
      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Selection Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(file.id, e.target.checked)}
        className="absolute top-2 left-2 rounded"
      />

      {/* File Icon/Thumbnail */}
      {viewMode === 'grid' && (
        <div className="mb-2">
          {file.thumbnail_path ? (
            <img
              src={file.thumbnail_path}
              alt={file.name}
              className="w-16 h-16 object-cover rounded mx-auto"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center mx-auto">
              {getFileIcon(file.file_type, file.mime_type)}
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="mr-3">
          {getFileIcon(file.file_type, file.mime_type)}
        </div>
      )}

      {/* File Info */}
      <div className={viewMode === 'grid' ? '' : 'flex-1'}>
        <p className="font-medium text-sm truncate" title={file.name}>
          {file.name}
        </p>
        
        <div className="text-xs text-gray-500 mt-1">
          <div>{formatFileSize(file.file_size)}</div>
          {viewMode === 'list' && (
            <div>{new Date(file.created_at).toLocaleDateString()}</div>
          )}
        </div>

        {file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {file.tags.slice(0, 2).map((tag) => (
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

      {/* Actions */}
      <div className={`${
        viewMode === 'grid' 
          ? 'absolute top-2 right-2 opacity-0 group-hover:opacity-100'
          : 'ml-2'
      } transition-opacity`}>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-32">
              <button
                onClick={() => onDownload(file.id, file.name)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={() => onShare(file.id)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                onClick={() => onDelete(file.id)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Folder Form Component
const CreateFolderForm: React.FC<{
  onSubmit: (name: string) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
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
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Folder
        </Button>
      </div>
    </form>
  );
};

// File Upload Area Component
const FileUploadArea: React.FC<{
  onDrop: (files: File[]) => void;
}> = ({ onDrop }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
        isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      {isDragActive ? (
        <p className="text-blue-600 font-medium">Drop files here to upload</p>
      ) : (
        <div>
          <p className="text-gray-700 font-medium mb-2">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-sm text-gray-500">
            Supports images, documents, videos, and more
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Maximum file size: 100MB
          </p>
        </div>
      )}
    </div>
  );
};

// Storage Usage Card Component
const StorageUsageCard: React.FC = () => {
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: 0,
    breakdown: {} as Record<string, number>
  });

  useEffect(() => {
    // Simulate fetching storage usage
    setStorageUsage({
      used: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
      total: 10 * 1024 * 1024 * 1024, // 10 GB
      breakdown: {
        images: 0.8 * 1024 * 1024 * 1024,
        documents: 1.2 * 1024 * 1024 * 1024,
        videos: 0.3 * 1024 * 1024 * 1024,
        other: 0.2 * 1024 * 1024 * 1024
      }
    });
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const usagePercentage = (storageUsage.used / storageUsage.total) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Used Storage</span>
              <span>
                {formatBytes(storageUsage.used)} of {formatBytes(storageUsage.total)}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Images: {formatBytes(storageUsage.breakdown.images || 0)}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Documents: {formatBytes(storageUsage.breakdown.documents || 0)}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span>Videos: {formatBytes(storageUsage.breakdown.videos || 0)}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
              <span>Other: {formatBytes(storageUsage.breakdown.other || 0)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFileManager;