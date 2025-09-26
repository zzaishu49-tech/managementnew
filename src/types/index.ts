export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee' | 'client';
  password_hash?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  client_id: string;
  client_name: string;
  deadline: string;
  progress_percentage: number;
  assigned_employees: string[];
  created_at: string;
  status: 'active' | 'completed' | 'on_hold';
  priority?: 'low' | 'medium' | 'high';
}

export interface Stage {
  id: string;
  project_id: string;
  name: string;
  notes: string;
  progress_percentage: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  files: File[];
  comments: CommentTask[];
  order: number;
}

export interface CommentTask {
  id: string;
  stage_id?: string;
  project_id?: string;
  text: string;
  added_by: string;
  author_name: string;
  author_role: 'manager' | 'employee' | 'client';
  status: 'open' | 'in-progress' | 'done';
  assigned_to?: string;
  deadline?: string;
  timestamp: string;
  is_global?: boolean;
}

export interface GlobalComment {
  id: string;
  project_id: string;
  text: string;
  added_by: string;
  author_name: string;
  author_role: 'manager' | 'employee' | 'client';
  timestamp: string;
}

export interface File {
  id: string;
  stage_id?: string;
  project_id: string;
  filename: string;
  file_url: string; // may be a signed URL; prefer storage_path for private buckets
  storage_path?: string; // path inside 'project-files' bucket
  uploaded_by: string;
  uploader_name: string;
  timestamp: string;
  size: number;
  file_type: string;
  category?: 'reference' | 'content' | 'assets' | 'requirements' | 'other';
  description?: string;
  download_count: number;
  last_downloaded?: string;
  last_downloaded_by?: string;
  is_archived: boolean;
  tags?: string[];
}

export interface DownloadHistory {
  id: string;
  file_id: string;
  downloaded_by: string;
  downloader_name: string;
  download_date: string;
  file_name: string;
  file_size: number;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  assigned_to: string;
  status: 'open' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  created_at: string;
  updated_at?: string;
}

export interface Meeting {
  id: string;
  project_id: string;
  title: string;
  date: string;
  attendees: string[];
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  contact_info: string;
  estimated_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BrochurePage {
  id: string;
  project_id: string;
  page_number: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_locked: boolean;
  locked_by?: string;
  locked_by_name?: string;
  locked_at?: string;
  content: {
    // Page 1 - Project Metadata
    project_name?: string;
    description?: string;
    deadline?: string;
    logo_url?: string;
    tagline?: string;
    company_name?: string;
    
    // Page 2 - Company Information
    about_us?: string;
    email?: string;
    phone?: string;
    address?: string;
    
    // Pages 3-10 - Flexible Content
    heading?: string;
    body_content?: string;
    bullet_points?: string[];
    images?: string[];
    cta_text?: string;
    cta_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface BrochureProject {
  id: string;
  client_id: string;
  project_id: string;
  client_name: string;
  status: 'draft' | 'ready_for_design' | 'in_design' | 'completed';
  created_at: string;
  updated_at: string;
  pages: BrochurePage[];
}

export interface PageComment {
  id: string;
  page_id: string;
  text: string;
  added_by: string;
  author_name: string;
  author_role: 'manager' | 'employee' | 'client';
  timestamp: string;
  marked_done: boolean;
  action_type?: 'comment' | 'lock' | 'unlock' | 'approval';
}

export interface BrochurePage {
  id: string;
  project_id: string;
  page_number: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_locked: boolean;
  locked_by?: string;
  locked_by_name?: string;
  locked_at?: string;
  content: {
    // Page 1 - Project Metadata
    project_name?: string;
    description?: string;
    deadline?: string;
    logo_url?: string;
    tagline?: string;
    company_name?: string;
    
    // Page 2 - Company Information
    about_us?: string;
    email?: string;
    phone?: string;
    address?: string;
    
    // Pages 3-10 - Flexible Content
    heading?: string;
    body_content?: string;
    bullet_points?: string[];
    images?: string[];
    cta_text?: string;
    cta_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface BrochureProject {
  id: string;
  client_id: string;
  project_id: string;
  client_name: string;
  status: 'draft' | 'ready_for_design' | 'in_design' | 'completed';
  created_at: string;
  updated_at: string;
  pages: BrochurePage[];
}

export interface PageComment {
  id: string;
  page_id: string;
  text: string;
  added_by: string;
  author_name: string;
  author_role: 'manager' | 'employee' | 'client';
  timestamp: string;
  marked_done: boolean;
  action_type?: 'comment' | 'lock' | 'unlock' | 'approval';
}

export const STAGE_NAMES = ['Planning', 'Design', 'Development', 'QC', 'Launch'] as const;
export type StageName = typeof STAGE_NAMES[number];