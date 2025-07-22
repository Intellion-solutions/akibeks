export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user' | 'client' | 'employee';
    isActive: boolean;
    isEmailVerified: boolean;
    phoneNumber?: string;
    kraPin?: string;
    idNumber?: string;
    county?: string;
    profileImage?: string;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    startDate: string;
    estimatedEndDate: string;
    actualEndDate?: string;
    budget: number;
    clientId: string;
    assignedToId: string;
    progress: number;
    location?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}
export interface Service {
    id: string;
    name: string;
    description: string;
    category: 'design' | 'construction' | 'consultation' | 'maintenance';
    price: number;
    duration: string;
    isActive: boolean;
    features: string[];
    requirements?: string[];
    deliverables?: string[];
    createdAt: string;
    updatedAt: string;
}
export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    company?: string;
    serviceInterest?: string;
    message: string;
    source: string;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Testimonial {
    id: string;
    name: string;
    email?: string;
    company?: string;
    position?: string;
    message: string;
    rating: number;
    projectType?: string;
    location?: string;
    imageUrl?: string;
    approved: boolean;
    featured: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}
export interface SEOConfiguration {
    id: string;
    pageUrl: string;
    title: string;
    description: string;
    keywords: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    robotsDirective: string;
    structuredData?: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T = any> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface DatabaseResult<T = any> {
    success: boolean;
    data?: T;
    error?: string | null;
    count?: number;
}
export interface QueryOptions {
    filters?: FilterOption[];
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
export interface FilterOption {
    column: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
    value: any;
}
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    variables: string[];
    category: 'welcome' | 'notification' | 'invoice' | 'quotation' | 'alert' | 'general';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface EmailLog {
    id: string;
    to: string;
    from: string;
    subject: string;
    status: 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';
    templateId?: string;
    variables?: Record<string, any>;
    sentAt?: string;
    deliveredAt?: string;
    errorMessage?: string;
    createdAt: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}
export interface AuthSession {
    user: User;
    token: string;
    expiresAt: string;
}
export interface FileUpload {
    id: string;
    filename: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    category: string;
    uploadedBy: string;
    createdAt: string;
}
export interface UploadedFile {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
//# sourceMappingURL=index.d.ts.map