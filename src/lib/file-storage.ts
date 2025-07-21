import { supabase } from "./db-client";
import { ErrorHandler } from "./error-handling";
import { QueueManager } from "./queue-manager";

export interface FileMetadata {
  id: string;
  name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  category: 'project' | 'invoice' | 'quotation' | 'client' | 'template' | 'asset' | 'backup';
  project_id?: string;
  client_id?: string;
  invoice_id?: string;
  quotation_id?: string;
  folder_id?: string;
  version: number;
  parent_file_id?: string;
  tags: string[];
  description?: string;
  visibility: 'private' | 'team' | 'client' | 'public';
  shared_with?: string[];
  access_permissions: {
    read: string[];
    write: string[];
    delete: string[];
  };
  virus_scan_status: 'pending' | 'clean' | 'infected' | 'failed';
  thumbnail_path?: string;
  preview_path?: string;
  metadata: {
    dimensions?: { width: number; height: number };
    duration?: number;
    pages?: number;
    author?: string;
    created_date?: string;
  };
  upload_progress: number;
  upload_status: 'uploading' | 'completed' | 'failed' | 'processing';
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface FileFolder {
  id: string;
  name: string;
  parent_folder_id?: string;
  path: string;
  project_id?: string;
  client_id?: string;
  category: string;
  permissions: {
    read: string[];
    write: string[];
    delete: string[];
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FileShareLink {
  id: string;
  file_id: string;
  token: string;
  permissions: 'view' | 'download' | 'edit';
  password_protected: boolean;
  password_hash?: string;
  expires_at?: string;
  download_limit?: number;
  download_count: number;
  created_by: string;
  created_at: string;
}

export interface FileUploadOptions {
  category: string;
  folder_id?: string;
  project_id?: string;
  client_id?: string;
  tags?: string[];
  description?: string;
  visibility?: 'private' | 'team' | 'client' | 'public';
  auto_process?: boolean;
  generate_thumbnail?: boolean;
  virus_scan?: boolean;
}

export class FileStorageManager {
  private errorHandler: ErrorHandler;
  private queueManager: QueueManager;
  private readonly BUCKET_NAME = 'project-files';
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/*', 'video/*', 'audio/*',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/*', 'application/zip', 'application/x-rar-compressed'
  ];

  constructor() {
    this.errorHandler = new ErrorHandler();
    this.queueManager = new QueueManager();
  }

  async uploadFile(
    file: File, 
    options: FileUploadOptions, 
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<FileMetadata> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate file path
      const filePath = this.generateFilePath(file.name, options);
      
      // Create file metadata record
      const fileMetadata = await this.createFileRecord(file, filePath, options, userId);

      // Upload file to storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            onProgress?.(percentage);
            this.updateUploadProgress(fileMetadata.id, percentage);
          }
        });

      if (error) throw error;

      // Update file status
      await this.updateFileStatus(fileMetadata.id, 'completed', 100);

      // Queue post-processing tasks
      if (options.auto_process) {
        await this.queuePostProcessing(fileMetadata.id, file.type);
      }

      if (options.virus_scan) {
        await this.queueVirusScan(fileMetadata.id);
      }

      if (options.generate_thumbnail && this.isImageOrVideo(file.type)) {
        await this.queueThumbnailGeneration(fileMetadata.id);
      }

      return fileMetadata;
    } catch (error) {
      this.errorHandler.handleError(error, 'FileStorageManager.uploadFile', 'high');
      throw error;
    }
  }

  async downloadFile(fileId: string, userId: string): Promise<Blob> {
    try {
      // Check permissions
      const hasAccess = await this.checkFileAccess(fileId, userId, 'read');
      if (!hasAccess) {
        throw new Error('Access denied to file');
      }

      const fileMetadata = await this.getFileMetadata(fileId);
      if (!fileMetadata) {
        throw new Error('File not found');
      }

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(fileMetadata.file_path);

      if (error) throw error;

      // Log download activity
      await this.logFileActivity('download', fileId, userId);

      return data;
    } catch (error) {
      this.errorHandler.handleError(error, 'FileStorageManager.downloadFile', 'medium');
      throw error;
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      // Check permissions
      const hasAccess = await this.checkFileAccess(fileId, userId, 'delete');
      if (!hasAccess) {
        throw new Error('Access denied to delete file');
      }

      const fileMetadata = await this.getFileMetadata(fileId);
      if (!fileMetadata) {
        throw new Error('File not found');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileMetadata.file_path]);

      if (storageError) throw storageError;

      // Delete thumbnails and previews
      if (fileMetadata.thumbnail_path) {
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([fileMetadata.thumbnail_path]);
      }

      if (fileMetadata.preview_path) {
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([fileMetadata.preview_path]);
      }

      // Delete metadata record
      const { error } = await supabase
        .from('file_metadata')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      await this.logFileActivity('delete', fileId, userId);
    } catch (error) {
      this.errorHandler.handleError(error, 'FileStorageManager.deleteFile', 'medium');
      throw error;
    }
  }

  async createFolder(name: string, parentFolderId: string | null, userId: string, options: any = {}): Promise<FileFolder> {
    try {
      const path = await this.generateFolderPath(name, parentFolderId);

      const { data, error } = await supabase
        .from('file_folders')
        .insert({
          name,
          parent_folder_id: parentFolderId,
          path,
          project_id: options.project_id,
          client_id: options.client_id,
          category: options.category || 'general',
          permissions: options.permissions || {
            read: [userId],
            write: [userId],
            delete: [userId]
          },
          created_by: userId
        })
        .select('*')
        .single();

      if (error) throw error;

      await this.logFileActivity('folder_created', data.id, userId);
      return data;
    } catch (error) {
      this.errorHandler.handleError(error, 'FileStorageManager.createFolder', 'medium');
      throw error;
    }
  }

  async moveFile(fileId: string, targetFolderId: string | null, userId: string): Promise<void> {
    try {
      const hasAccess = await this.checkFileAccess(fileId, userId, 'write');
      if (!hasAccess) {
        throw new Error('Access denied to move file');
      }

      const { error } = await supabase
        .from('file_metadata')
        .update({ 
          folder_id: targetFolderId,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      if (error) throw error;

      await this.logFileActivity('move', fileId, userId);
    } catch (error) {
      this.errorHandler.handleError(error, 'FileStorageManager.moveFile', 'medium');
      throw error;
    }
  }

  async createShareLink(
    fileId: string, 
    permissions: 'view' | 'download' | 'edit',
    options: {
      password?: string;
      expires_at?: string;
      download_limit?: number;
    },
    userId: string
  ): Promise<FileShareLink> {
    try {
      const hasAccess = await this.checkFileAccess(fileId, userId, 'read');
      if (!hasAccess) {
        throw new Error('Access denied to share file');
      }

      const token = this.generateSecureToken();
      let passwordHash;

      if (options.password) {
        passwordHash = await this.hashPassword(options.password);
      }

      const { data, error } = await supabase
        .from('file_share_links')
        .insert({
          file_id: fileId,
          token,
          permissions,
          password_protected: !!options.password,
          password_hash: passwordHash,
          expires_at: options.expires_at,
          download_limit: options.download_limit,
          download_count: 0,
          created_by: userId
        })
        .select('*')
        .single();

      if (error) throw error;

      await this.logFileActivity('share_link_created', fileId, userId);
      return data;
    } catch (error) {
      this.errorHandler.handleError(error, 'FileStorageManager.createShareLink', 'medium');
      throw error;
    }
  }

  async getFilesByFolder(folderId: string | null, userId: string): Promise<{ files: FileMetadata[]; folders: FileFolder[] }> {
    try {
      // Get folders
      let folderQuery = supabase
        .from('file_folders')
        .select('*')
        .eq('parent_folder_id', folderId || null);

      const { data: folders, error: folderError } = await folderQuery;
      if (folderError) throw folderError;

      // Filter folders by permissions
      const accessibleFolders = folders?.filter(folder => 
        this.hasPermission(folder.permissions, userId, 'read')
      ) || [];

      // Get files
      let fileQuery = supabase
        .from('file_metadata')
        .select('*')
        .eq('folder_id', folderId || null);

      const { data: files, error: fileError } = await fileQuery;
      if (fileError) throw fileError;

      // Filter files by permissions
      const accessibleFiles = files?.filter(file => 
        this.hasPermission(file.access_permissions, userId, 'read')
      ) || [];

      return {
        files: accessibleFiles,
        folders: accessibleFolders
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'FileStorageManager.getFilesByFolder', 'low');
      return { files: [], folders: [] };
    }
  }

  async searchFiles(query: string, filters: any = {}, userId: string): Promise<FileMetadata[]> {
    try {
      let searchQuery = supabase
        .from('file_metadata')
        .select('*')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%, tags.cs.{${query}}`);

      // Apply filters
      if (filters.category) {
        searchQuery = searchQuery.eq('category', filters.category);
      }
      if (filters.file_type) {
        searchQuery = searchQuery.eq('file_type', filters.file_type);
      }
      if (filters.project_id) {
        searchQuery = searchQuery.eq('project_id', filters.project_id);
      }
      if (filters.client_id) {
        searchQuery = searchQuery.eq('client_id', filters.client_id);
      }

      const { data, error } = await searchQuery;
      if (error) throw error;

      // Filter by permissions
      return data?.filter(file => 
        this.hasPermission(file.access_permissions, userId, 'read')
      ) || [];
    } catch (error) {
      this.errorHandler.handleError(error, 'FileStorageManager.searchFiles', 'low');
      return [];
    }
  }

  async getFileVersions(fileId: string, userId: string): Promise<FileMetadata[]> {
    try {
      const hasAccess = await this.checkFileAccess(fileId, userId, 'read');
      if (!hasAccess) {
        throw new Error('Access denied to view file versions');
      }

      const { data, error } = await supabase
        .from('file_metadata')
        .select('*')
        .or(`id.eq.${fileId}, parent_file_id.eq.${fileId}`)
        .order('version', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      this.errorHandler.handleError(error, 'FileStorageManager.getFileVersions', 'low');
      return [];
    }
  }

  private validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const isAllowed = this.ALLOWED_MIME_TYPES.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -2));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      throw new Error(`File type ${file.type} is not allowed`);
    }
  }

  private generateFilePath(fileName: string, options: FileUploadOptions): string {
    const timestamp = new Date().getTime();
    const randomId = Math.random().toString(36).substring(2);
    const extension = fileName.split('.').pop();
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    let basePath = options.category;
    
    if (options.project_id) {
      basePath += `/projects/${options.project_id}`;
    } else if (options.client_id) {
      basePath += `/clients/${options.client_id}`;
    }
    
    if (options.folder_id) {
      basePath += `/folders/${options.folder_id}`;
    }

    return `${basePath}/${timestamp}_${randomId}_${safeName}`;
  }

  private async generateFolderPath(name: string, parentFolderId: string | null): Promise<string> {
    if (!parentFolderId) {
      return name;
    }

    const { data: parent } = await supabase
      .from('file_folders')
      .select('path')
      .eq('id', parentFolderId)
      .single();

    return parent ? `${parent.path}/${name}` : name;
  }

  private async createFileRecord(
    file: File, 
    filePath: string, 
    options: FileUploadOptions, 
    userId: string
  ): Promise<FileMetadata> {
    const fileType = this.determineFileType(file.type);
    
    const { data, error } = await supabase
      .from('file_metadata')
      .insert({
        name: file.name,
        original_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        file_type: fileType,
        category: options.category,
        project_id: options.project_id,
        client_id: options.client_id,
        folder_id: options.folder_id,
        version: 1,
        tags: options.tags || [],
        description: options.description,
        visibility: options.visibility || 'private',
        access_permissions: {
          read: [userId],
          write: [userId],
          delete: [userId]
        },
        virus_scan_status: 'pending',
        upload_progress: 0,
        upload_status: 'uploading',
        uploaded_by: userId
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  private determineFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf' || 
        mimeType.includes('word') || 
        mimeType.includes('excel') || 
        mimeType.includes('powerpoint') ||
        mimeType.startsWith('text/')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
    return 'other';
  }

  private isImageOrVideo(mimeType: string): boolean {
    return mimeType.startsWith('image/') || mimeType.startsWith('video/');
  }

  private async updateUploadProgress(fileId: string, progress: number): Promise<void> {
    await supabase
      .from('file_metadata')
      .update({ upload_progress: progress })
      .eq('id', fileId);
  }

  private async updateFileStatus(fileId: string, status: string, progress: number): Promise<void> {
    await supabase
      .from('file_metadata')
      .update({ 
        upload_status: status, 
        upload_progress: progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);
  }

  private async queuePostProcessing(fileId: string, mimeType: string): Promise<void> {
    await this.queueManager.addJob({
      type: 'process_file',
      priority: 'medium',
      data: { file_id: fileId, mime_type: mimeType }
    });
  }

  private async queueVirusScan(fileId: string): Promise<void> {
    await this.queueManager.addJob({
      type: 'virus_scan',
      priority: 'high',
      data: { file_id: fileId }
    });
  }

  private async queueThumbnailGeneration(fileId: string): Promise<void> {
    await this.queueManager.addJob({
      type: 'generate_thumbnail',
      priority: 'low',
      data: { file_id: fileId }
    });
  }

  private async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    const { data } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('id', fileId)
      .single();
    
    return data;
  }

  private async checkFileAccess(fileId: string, userId: string, permission: 'read' | 'write' | 'delete'): Promise<boolean> {
    const file = await this.getFileMetadata(fileId);
    if (!file) return false;
    
    return this.hasPermission(file.access_permissions, userId, permission);
  }

  private hasPermission(permissions: any, userId: string, permission: string): boolean {
    return permissions[permission]?.includes(userId) || false;
  }

  private generateSecureToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async logFileActivity(action: string, fileId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('file_activity_log')
        .insert({
          action,
          file_id: fileId,
          user_id: userId,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      this.errorHandler.handleError(error, 'FileStorageManager.logFileActivity', 'low');
    }
  }
}

export default FileStorageManager;