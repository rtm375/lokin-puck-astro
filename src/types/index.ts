/**
 * Centralized TypeScript types for the application
 * Single source of truth for all shared interfaces and types
 */

// ============================================================================
// Website & Pages
// ============================================================================

export enum Status {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  MAINTENANCE = "MAINTENANCE",
}

export interface Website {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  status: Status;
  created_at: string;
}

export interface Page {
  id: string;
  title: string;
  path: string;
  status: "draft" | "published";
  updated_at: string;
  image_url?: string;
  description?: string;
  head_code?: string;
  is_front_page?: boolean;
  website_id: string;
}

// ============================================================================
// Domains
// ============================================================================

export interface Domain {
  domain: string;
  status: "pending" | "active" | "invalid";
  type: "subdomain" | "custom";
  is_primary: boolean;
}

// ============================================================================
// Components
// ============================================================================

export interface Component {
  id: string;
  website_id: string;
  name: string;
  data: any; // Puck Data type
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Files
// ============================================================================

export interface FileItem {
  id: number;
  key: string;
  url: string;
  size: number;
  created_at: string;
  name: string;
  type: string;
}

// ============================================================================
// Profile
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  [key: string]: any; // Allow additional properties
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

export interface PagesResponse {
  pages: Page[];
  page: number;
  totalPages: number;
  total: number;
}

export interface FilesResponse {
  files: FileItem[];
  page: number;
  totalPages: number;
  total: number;
  totalStorage: number;
}

// ============================================================================
// Upload Types
// ============================================================================

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  name: string;
}

export interface UploadError {
  message: string;
  file?: string;
}
