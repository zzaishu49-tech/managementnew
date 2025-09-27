import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, Stage, CommentTask, GlobalComment, File, Task, Meeting, BrochureProject, BrochurePage, PageComment, Lead, STAGE_NAMES, DownloadHistory, User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { supabase as externalSupabase } from '../superBaseClient';

interface DataContextType {
  projects: Project[];
  stages: Stage[];
  commentTasks: CommentTask[];
  globalComments: GlobalComment[];
  users: User[];
  files: File[];
  tasks: Task[];
  meetings: Meeting[];
  brochureProjects: BrochureProject[];
  brochurePages: BrochurePage[];
  pageComments: PageComment[];
  leads: Lead[];
  downloadHistory: DownloadHistory[];
  createProject: (project: Omit<Project, 'id' | 'created_at'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addCommentTask: (data: Omit<CommentTask, 'id' | 'timestamp'>) => void;
  addGlobalComment: (data: { project_id: string; text: string; added_by: string; author_role: string }) => void;
  updateCommentTaskStatus: (taskId: string, status: 'open' | 'in-progress' | 'done') => void;
  updateStageApproval: (stageId: string, status: 'approved' | 'rejected', comment?: string) => void;
  uploadFile: (fileData: Omit<File, 'id' | 'timestamp'>) => void;
  uploadFileFromInput: (stageId: string, file: globalThis.File, projectId: string, uploaderName: string) => Promise<void>;
  uploadBrochureImage: (file: globalThis.File, projectId: string) => Promise<string>;
  updateStageProgress: (stageId: string, progress: number) => void;
  scheduleMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  createTask: (task: Omit<Task, 'id' | 'created_at'>) => void;
  updateTaskStatus: (taskId: string, status: 'open' | 'in-progress' | 'done') => void;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createBrochureProject: (projectId: string, clientId: string, clientName: string) => Promise<BrochureProject | null>;
  updateBrochureProject: (id: string, updates: Partial<BrochureProject>) => void;
  deleteBrochurePage: (projectId: string, pageNumber: number) => Promise<void>;
  saveBrochurePage: (pageData: { project_id: string; page_number: number; content: BrochurePage['content']; approval_status?: 'pending' | 'approved' | 'rejected'; is_locked?: boolean }) => Promise<void>;
  getBrochurePages: (projectId: string) => BrochurePage[];
  addPageComment: (comment: Omit<PageComment, 'id' | 'timestamp'>) => void;
  getPageComments: (pageId: string) => PageComment[];
  markCommentDone: (commentId: string) => void;
  downloadFile: (fileId: string) => void;
  downloadMultipleFiles: (fileIds: string[]) => void;
  getDownloadHistory: () => DownloadHistory[];
  updateFileMetadata: (fileId: string, metadata: Partial<File>) => void;
  createLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  approveBrochurePage: (pageId: string, status: 'approved' | 'rejected', comment?: string) => void;
  getBrochureProjectsForReview: () => BrochureProject[];
  lockBrochurePage: (pageId: string) => void;
  unlockBrochurePage: (pageId: string) => void;
  createUserAccount: (params: { email: string; password: string; full_name: string; role: 'employee' | 'client' }) => Promise<{ id: string } | null>;
  refreshUsers: () => Promise<void>;
  loadProjects: () => Promise<void>;
  deleteFile: (fileId: string, storagePath: string) => Promise<void>;
}

// Supabase client
let supabase: SupabaseClient | null = externalSupabase;

// Mock data (unchanged)
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Website for Xee Design',
    description: 'Complete website redesign and development for Xee Design agency with modern UI/UX, responsive design, and CMS integration',
    client_id: '3',
    client_name: 'Priya Sharma',
    deadline: '2025-03-15',
    progress_percentage: 65,
    assigned_employees: ['2', '4'],
    created_at: '2025-01-01',
    status: 'active',
    priority: 'high'
  },
  {
    id: '2',
    title: 'E-commerce Mobile App',
    description: 'Native mobile application for online shopping with payment gateway integration and inventory management',
    client_id: '5',
    client_name: 'Rajesh Kumar',
    deadline: '2025-04-30',
    progress_percentage: 30,
    assigned_employees: ['2'],
    created_at: '2025-01-10',
    status: 'active',
    priority: 'medium'
  }
];

const mockStages: Stage[] = [
  {
    id: '1',
    project_id: '1',
    name: 'Planning',
    notes: 'Project requirements gathering, wireframes, and technical specifications completed',
    progress_percentage: 100,
    approval_status: 'approved',
    files: [],
    comments: [],
    order: 0
  },
  {
    id: '2',
    project_id: '1',
    name: 'Design',
    notes: 'UI/UX design mockups and prototypes ready for client review',
    progress_percentage: 90,
    approval_status: 'pending',
    files: [],
    comments: [],
    order: 1
  },
  {
    id: '3',
    project_id: '1',
    name: 'Development',
    notes: 'Frontend development in progress, backend API integration started',
    progress_percentage: 45,
    approval_status: 'pending',
    files: [],
    comments: [],
    order: 2
  }
];

const mockCommentTasks: CommentTask[] = [
  {
    id: '1',
    stage_id: '2',
    project_id: '1',
    text: 'Please update the color scheme to match our brand guidelines. The current blue is too dark.',
    added_by: '3',
    author_name: 'Priya Sharma',
    author_role: 'client',
    status: 'open',
    assigned_to: '2',
    timestamp: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    stage_id: '3',
    project_id: '1',
    text: 'Need to implement responsive design for mobile devices',
    added_by: '1',
    author_name: 'Arjun Singh',
    author_role: 'manager',
    status: 'in-progress',
    assigned_to: '2',
    deadline: '2025-02-01',
    timestamp: '2025-01-12T14:20:00Z'
  },
  {
    id: '3',
    stage_id: '3',
    project_id: '1',
    text: 'Database optimization completed, performance improved by 40%',
    added_by: '2',
    author_name: 'Rakesh Gupta',
    author_role: 'employee',
    status: 'done',
    timestamp: '2025-01-14T16:45:00Z'
  }
];

const mockFiles: File[] = [
  {
    id: '1',
    stage_id: '1',
    project_id: '1',
    filename: 'project-requirements.pdf',
    file_url: '#',
    uploaded_by: '1',
    uploader_name: 'Arjun Singh',
    timestamp: '2025-01-02T09:00:00Z',
    size: 2048576,
    file_type: 'pdf',
    category: 'requirements',
    description: 'Initial project requirements and specifications',
    download_count: 5,
    last_downloaded: '2025-01-15T14:30:00Z',
    last_downloaded_by: '2',
    is_archived: false,
    tags: ['requirements', 'initial', 'specifications']
  },
  {
    id: '2',
    stage_id: '2',
    project_id: '1',
    filename: 'design-mockups.fig',
    file_url: '#',
    uploaded_by: '2',
    uploader_name: 'Rakesh Gupta',
    timestamp: '2025-01-08T11:15:00Z',
    size: 5242880,
    file_type: 'fig',
    category: 'assets',
    description: 'Figma design mockups for homepage and key pages',
    download_count: 3,
    last_downloaded: '2025-01-14T16:20:00Z',
    last_downloaded_by: '3',
    is_archived: false,
    tags: ['design', 'mockups', 'figma']
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [stages, setStages] = useState<Stage[]>(mockStages);
  const [commentTasks, setCommentTasks] = useState<CommentTask[]>(mockCommentTasks);
  const [globalComments, setGlobalComments] = useState<GlobalComment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<File[]>(mockFiles);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [brochureProjects, setBrochureProjects] = useState<BrochureProject[]>([]);
  const [brochurePages, setBrochurePages] = useState<BrochurePage[]>([]);
  const [pageComments, setPageComments] = useState<PageComment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([]);
  const [accessibleProjectIds, setAccessibleProjectIds] = useState<string[] | null>(null);

  // Load files from database
  const loadFiles = async (projectId?: string) => {
    if (!supabase) {
      console.warn('Supabase not configured - cannot load files');
      return;
    }

    try {
      let query = supabase.from('files').select('*').order('timestamp', { ascending: false });

      // Filter by projectId if provided
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading files:', error);
        return;
      }

      if (data) {
        const mappedFiles: File[] = data.map(file => ({
          id: file.id,
          stage_id: file.stage_id,
          project_id: file.project_id,
          filename: file.filename,
          file_url: file.file_url,
          storage_path: file.storage_path,
          uploaded_by: file.uploaded_by,
          uploader_name: file.uploader_name || 'Unknown',
          timestamp: file.timestamp,
          size: file.size,
          file_type: file.file_type,
          category: file.category,
          description: file.description,
          download_count: file.download_count || 0,
          last_downloaded: file.last_downloaded,
          last_downloaded_by: file.last_downloaded_by,
          is_archived: file.is_archived || false,
          tags: file.tags || []
        }));
        
        setFiles(mappedFiles);
        console.log('Files loaded successfully:', mappedFiles.length);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  // Compute project IDs the current user can access (role-based)
  const fetchAccessibleProjectIds = async (): Promise<string[] | null> => {
    if (!supabase || !user) return null;
    try {
      if (user.role === 'client') {
        // Client can access only their projects
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .eq('client_id', user.id);
        if (error) {
          console.error('Error fetching client-accessible projects:', error);
          return [];
        }
        return (data || []).map((p: any) => p.id as string);
      } else if (user.role === 'employee') {
        // Employee can access projects where they are assigned
        const { data, error } = await supabase
          .from('project_assignments')
          .select('project_id')
          .eq('employee_id', user.id);
        if (error) {
          console.error('Error fetching employee-accessible projects:', error);
          return [];
        }
        return (data || []).map((p: any) => p.project_id as string);
      } else if (user.role === 'manager') {
        // Manager can access projects they manage
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .eq('manager_id', user.id);
        if (error) {
          console.error('Error fetching manager-accessible projects:', error);
          return [];
        }
        return (data || []).map((p: any) => p.id as string);
      }
      return [];
    } catch (error) {
      console.error('Error fetching accessible project IDs:', error);
      return [];
    }
  };

  // Upload file from input (modified for Storage Section)
  const uploadFileFromInput = async (stageId: string, file: globalThis.File, projectId: string, uploaderName: string) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available');
      return;
    }

    try {
      // Verify user has access to the project
      const projectIds = await fetchAccessibleProjectIds();
      if (!projectIds?.includes(projectId)) {
        throw new Error('Unauthorized access to project');
      }

      // Upload file to Supabase Storage
      const storagePath = `projects/${projectId}/${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('files')
        .upload(storagePath, file, { upsert: true });
      if (storageError) throw storageError;

      // Save file metadata to database
      const fileData: Omit<File, 'id' | 'timestamp'> = {
        stage_id: stageId,
        project_id: projectId,
        filename: file.name,
        file_url: `${supabaseUrl}/storage/v1/object/public/files/${storagePath}`,
        storage_path: storagePath,
        uploaded_by: user.id,
        uploader_name: uploaderName,
        size: file.size,
        file_type: file.type,
        category: file.type.split('/')[0], // e.g., 'image' or 'application'
        description: '',
        download_count: 0,
        last_downloaded: null,
        last_downloaded_by: null,
        is_archived: false,
        tags: []
      };

      const { error: dbError } = await supabase.from('files').insert(fileData);
      if (dbError) throw dbError;

      // Reload files for the project
      await loadFiles(projectId);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Delete file from Storage and database
  const deleteFile = async (fileId: string, storagePath: string) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available');
      return;
    }

    try {
      // Verify user has access to the project
      const file = files.find(f => f.id === fileId);
      if (!file || !(await fetchAccessibleProjectIds())?.includes(file.project_id)) {
        throw new Error('Unauthorized access to file');
      }

      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([storagePath]);
      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);
      if (dbError) throw dbError;

      // Update local state
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  // Placeholder implementations for other context methods
  const createProject = (project: Omit<Project, 'id' | 'created_at'>) => {
    // Implementation (unchanged)
  };
  const updateProject = (id: string, updates: Partial<Project>) => {
    // Implementation (unchanged)
  };
  const addCommentTask = (data: Omit<CommentTask, 'id' | 'timestamp'>) => {
    // Implementation (unchanged)
  };
  const addGlobalComment = (data: { project_id: string; text: string; added_by: string; author_role: string }) => {
    // Implementation (unchanged)
  };
  const updateCommentTaskStatus = (taskId: string, status: 'open' | 'in-progress' | 'done') => {
    // Implementation (unchanged)
  };
  const updateStageApproval = (stageId: string, status: 'approved' | 'rejected', comment?: string) => {
    // Implementation (unchanged)
  };
  const uploadFile = (fileData: Omit<File, 'id' | 'timestamp'>) => {
    // Implementation (unchanged)
  };
  const uploadBrochureImage = async (file: globalThis.File, projectId: string) => {
    // Implementation (unchanged)
    return '';
  };
  const updateStageProgress = (stageId: string, progress: number) => {
    // Implementation (unchanged)
  };
  const scheduleMeeting = (meeting: Omit<Meeting, 'id'>) => {
    // Implementation (unchanged)
  };
  const createTask = (task: Omit<Task, 'id' | 'created_at'>) => {
    // Implementation (unchanged)
  };
  const updateTaskStatus = (taskId: string, status: 'open' | 'in-progress' | 'done') => {
    // Implementation (unchanged)
  };
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Implementation (unchanged)
  };
  const deleteTask = async (taskId: string) => {
    // Implementation (unchanged)
  };
  const createBrochureProject = async (projectId: string, clientId: string, clientName: string) => {
    // Implementation (unchanged)
    return null;
  };
  const updateBrochureProject = (id: string, updates: Partial<BrochureProject>) => {
    // Implementation (unchanged)
  };
  const deleteBrochurePage = async (projectId: string, pageNumber: number) => {
    // Implementation (unchanged)
  };
  const saveBrochurePage = async (pageData: { project_id: string; page_number: number; content: BrochurePage['content']; approval_status?: 'pending' | 'approved' | 'rejected'; is_locked?: boolean }) => {
    // Implementation (unchanged)
  };
  const getBrochurePages = (projectId: string) => {
    // Implementation (unchanged)
    return [];
  };
  const addPageComment = (comment: Omit<PageComment, 'id' | 'timestamp'>) => {
    // Implementation (unchanged)
  };
  const getPageComments = (pageId: string) => {
    // Implementation (unchanged)
    return [];
  };
  const markCommentDone = (commentId: string) => {
    // Implementation (unchanged)
  };
  const downloadFile = (fileId: string) => {
    // Implementation (unchanged)
  };
  const downloadMultipleFiles = (fileIds: string[]) => {
    // Implementation (unchanged)
  };
  const getDownloadHistory = () => {
    // Implementation (unchanged)
    return [];
  };
  const updateFileMetadata = (fileId: string, metadata: Partial<File>) => {
    // Implementation (unchanged)
  };
  const createLead = (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    // Implementation (unchanged)
  };
  const updateLead = (id: string, updates: Partial<Lead>) => {
    // Implementation (unchanged)
  };
  const deleteLead = (id: string) => {
    // Implementation (unchanged)
  };
  const approveBrochurePage = (pageId: string, status: 'approved' | 'rejected', comment?: string) => {
    // Implementation (unchanged)
  };
  const getBrochureProjectsForReview = () => {
    // Implementation (unchanged)
    return [];
  };
  const lockBrochurePage = (pageId: string) => {
    // Implementation (unchanged)
  };
  const unlockBrochurePage = (pageId: string) => {
    // Implementation (unchanged)
  };
  const createUserAccount = async (params: { email: string; password: string; full_name: string; role: 'employee' | 'client' }) => {
    // Implementation (unchanged)
    return null;
  };
  const refreshUsers = async () => {
    // Implementation (unchanged)
  };
  const loadProjects = async () => {
    // Implementation (unchanged)
  };

  // Load accessible project IDs and files on mount or user change
  useEffect(() => {
    if (user) {
      fetchAccessibleProjectIds().then(ids => {
        setAccessibleProjectIds(ids);
        if (ids) {
          loadFiles(); // Load all accessible files initially
        }
      }).catch(error => console.error('Error initializing data:', error));
    }
  }, [user]);

  return (
    <DataContext.Provider value={{
      projects,
      stages,
      commentTasks,
      globalComments,
      users,
      files,
      tasks,
      meetings,
      brochureProjects,
      brochurePages,
      pageComments,
      leads,
      downloadHistory,
      createProject,
      updateProject,
      addCommentTask,
      addGlobalComment,
      updateCommentTaskStatus,
      updateStageApproval,
      uploadFile,
      uploadFileFromInput,
      uploadBrochureImage,
      updateStageProgress,
      scheduleMeeting,
      createTask,
      updateTaskStatus,
      updateTask,
      deleteTask,
      createBrochureProject,
      updateBrochureProject,
      deleteBrochurePage,
      saveBrochurePage,
      getBrochurePages,
      addPageComment,
      getPageComments,
      markCommentDone,
      downloadFile,
      downloadMultipleFiles,
      getDownloadHistory,
      updateFileMetadata,
      createLead,
      updateLead,
      deleteLead,
      approveBrochurePage,
      getBrochureProjectsForReview,
      lockBrochurePage,
      unlockBrochurePage,
      createUserAccount,
      refreshUsers,
      loadProjects,
      deleteFile
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};