export declare const APP_CONFIG: {
    name: string;
    url: string;
    contact: {
        email: string;
        phone: string;
        address: string;
        workingHours: string;
    };
    social: {
        facebook: string;
        twitter: string;
        linkedin: string;
        instagram: string;
    };
    kenya: {
        currency: string;
        timezone: string;
        vatRate: number;
        language: string;
    };
};
export declare const PAGES_CONFIG: {
    navigation: ({
        name: string;
        path: string;
        exact: boolean;
    } | {
        name: string;
        path: string;
        exact?: undefined;
    })[];
    footer: {
        name: string;
        path: string;
    }[];
};
export declare const DATABASE_TABLES: {
    readonly USERS: "users";
    readonly PROJECTS: "projects";
    readonly SERVICES: "services";
    readonly CONTACT_SUBMISSIONS: "contactSubmissions";
    readonly TESTIMONIALS: "testimonials";
    readonly SEO_CONFIGURATIONS: "seoConfigurations";
    readonly SESSIONS: "sessions";
    readonly ACTIVITY_LOGS: "activityLogs";
    readonly ERROR_LOGS: "errorLogs";
};
export declare const USER_ROLES: {
    readonly ADMIN: "admin";
    readonly USER: "user";
    readonly CLIENT: "client";
    readonly EMPLOYEE: "employee";
};
export declare const PROJECT_STATUS: {
    readonly PLANNING: "planning";
    readonly IN_PROGRESS: "in_progress";
    readonly COMPLETED: "completed";
    readonly ON_HOLD: "on_hold";
};
export declare const PROJECT_PRIORITY: {
    readonly LOW: "low";
    readonly MEDIUM: "medium";
    readonly HIGH: "high";
    readonly URGENT: "urgent";
};
export declare const SERVICE_CATEGORIES: {
    readonly DESIGN: "design";
    readonly CONSTRUCTION: "construction";
    readonly CONSULTATION: "consultation";
    readonly MAINTENANCE: "maintenance";
};
export declare const CONTACT_STATUS: {
    readonly NEW: "new";
    readonly CONTACTED: "contacted";
    readonly QUALIFIED: "qualified";
    readonly CONVERTED: "converted";
    readonly CLOSED: "closed";
};
export declare const EMAIL_CATEGORIES: {
    readonly WELCOME: "welcome";
    readonly NOTIFICATION: "notification";
    readonly INVOICE: "invoice";
    readonly QUOTATION: "quotation";
    readonly ALERT: "alert";
    readonly GENERAL: "general";
};
export declare const EMAIL_STATUS: {
    readonly PENDING: "pending";
    readonly SENT: "sent";
    readonly FAILED: "failed";
    readonly DELIVERED: "delivered";
    readonly BOUNCED: "bounced";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const VALIDATION_RULES: {
    EMAIL_REGEX: RegExp;
    PHONE_REGEX: RegExp;
    KRA_PIN_REGEX: RegExp;
    PASSWORD_MIN_LENGTH: number;
    MAX_FILE_SIZE: number;
    ALLOWED_FILE_TYPES: string[];
};
export declare const CACHE_KEYS: {
    readonly USER_SESSION: "user_session";
    readonly PROJECTS: "projects";
    readonly SERVICES: "services";
    readonly TESTIMONIALS: "testimonials";
    readonly SEO_CONFIG: "seo_config";
};
export declare const ERROR_MESSAGES: {
    readonly INVALID_EMAIL: "Please enter a valid email address";
    readonly INVALID_PHONE: "Please enter a valid Kenyan phone number (+254XXXXXXXXX)";
    readonly INVALID_KRA_PIN: "Please enter a valid KRA PIN";
    readonly PASSWORD_TOO_SHORT: "Password must be at least 8 characters long";
    readonly REQUIRED_FIELD: "This field is required";
    readonly FILE_TOO_LARGE: "File size must be less than 5MB";
    readonly INVALID_FILE_TYPE: "Invalid file type";
    readonly UNAUTHORIZED: "You are not authorized to perform this action";
    readonly NOT_FOUND: "Resource not found";
    readonly INTERNAL_ERROR: "An internal error occurred. Please try again later.";
};
//# sourceMappingURL=index.d.ts.map