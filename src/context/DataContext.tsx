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

// Get Supabase URL for file URLs
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

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

const DataContext = createContext<DataContextType | undefined>(undefined);

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

  // Load projects from database
  const loadProjects = async () => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot load projects');
      return;
    }

    try {
      console.log('Loading projects for user:', user.id, 'Role:', user.role);
      
      let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
      
      // Apply role-based filtering
      if (user.role === 'client') {
        query = query.eq('client_id', user.id);
      } else if (user.role === 'employee') {
        // For employees, we need to check assigned_employees array
        query = query.contains('assigned_employees', [user.id]);
      }
      // Managers can see all projects (no additional filter)

      const { data, error } = await query;

      if (error) {
        console.error('Error loading projects:', error);
        return;
      }

      if (data) {
        const mappedProjects: Project[] = data.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          client_id: project.client_id,
          client_name: project.client_name,
          deadline: project.deadline,
          progress_percentage: project.progress_percentage || 0,
          assigned_employees: project.assigned_employees || [],
          created_at: project.created_at,
          status: project.status || 'active',
          priority: project.priority || 'medium'
        }));
        
        setProjects(mappedProjects);
        console.log('Projects loaded successfully:', mappedProjects.length);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Load users from database
  const refreshUsers = async () => {
    if (!supabase) {
      console.warn('Supabase not configured - cannot load users');
      return;
    }

    try {
      console.log('Loading users from database');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      if (data) {
        const mappedUsers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.full_name || profile.email || 'Unknown User',
          email: profile.email || '',
          role: profile.role || 'employee'
        }));
        
        setUsers(mappedUsers);
        console.log('Users loaded successfully:', mappedUsers.length);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Create new project
  const createProject = async (project: Omit<Project, 'id' | 'created_at'>) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot create project');
      return;
    }

    try {
      console.log('Creating new project:', project.title);
      
      const projectData = {
        title: project.title,
        description: project.description,
        client_id: project.client_id,
        client_name: project.client_name,
        deadline: project.deadline,
        progress_percentage: project.progress_percentage || 0,
        assigned_employees: project.assigned_employees || [],
        status: project.status || 'active',
        priority: project.priority || 'medium'
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      console.log('Project created successfully:', data.id);
      
      // Reload projects to update the UI
      await loadProjects();
      
      // Create default stages for the new project
      await createDefaultStages(data.id);
      
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  // Update existing project
  const updateProject = async (id: string, updates: Partial<Project>, updatingUser?: User) => {
    if (!supabase) {
      console.warn('Supabase not configured - cannot update project');
      return;
    }

    try {
      console.log('Updating project:', id, updates);
      
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }

      console.log('Project updated successfully:', data.id);
      
      // Reload projects to update the UI
      await loadProjects();
      
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  // Create default stages for a new project
  const createDefaultStages = async (projectId: string) => {
    if (!supabase) return;

    try {
      console.log('Creating default stages for project:', projectId);
      
      const defaultStages = STAGE_NAMES.map((name, index) => ({
        project_id: projectId,
        name,
        notes: `${name} stage for the project`,
        progress_percentage: 0,
        approval_status: 'pending' as const,
        order: index
      }));

      const { error } = await supabase
        .from('stages')
        .insert(defaultStages);

      if (error) {
        console.error('Error creating default stages:', error);
      } else {
        console.log('Default stages created successfully');
      }
    } catch (error) {
      console.error('Error creating default stages:', error);
    }
  };

  // Load files from database
  const loadFiles = async (projectId?: string) => {
    if (!supabase) {
      console.warn('Supabase not configured - cannot load files');
      return;
    }

    try {
      console.log('Loading files for project:', projectId || 'all');
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
    if (!supabase || !user) {
      console.warn('Supabase or user not available');
      return null;
    }

    try {
      console.log('Fetching accessible project IDs for user:', user.id, 'Role:', user.role);
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
      console.log('Uploading file to storage:', storagePath);
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
      console.log('File uploaded successfully:', file.name);
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
      console.log('Deleting file from storage:', storagePath);
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
      console.log('File deleted successfully:', fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  // Placeholder implementations for other context methods
  const addCommentTask = (data: Omit<CommentTask, 'id' | 'timestamp'>) => {
    const newTask: CommentTask = {
      ...data,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    setCommentTasks(prev => [...prev, newTask]);
  };
  
  const addGlobalComment = (data: { project_id: string; text: string; added_by: string; author_role: string }) => {
    const newComment: GlobalComment = {
      id: uuidv4(),
      project_id: data.project_id,
      text: data.text,
      added_by: data.added_by,
      author_name: user?.name || 'Unknown',
      author_role: data.author_role as 'manager' | 'employee' | 'client',
      timestamp: new Date().toISOString()
    };
    setGlobalComments(prev => [...prev, newComment]);
  };
  
  const updateCommentTaskStatus = (taskId: string, status: 'open' | 'in-progress' | 'done') => {
    setCommentTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      )
    );
  };
  
  const updateStageApproval = (stageId: string, status: 'approved' | 'rejected', comment?: string) => {
    setStages(prev => 
      prev.map(stage => 
        stage.id === stageId ? { ...stage, approval_status: status } : stage
      )
    );
  };
  
  const uploadFile = (fileData: Omit<File, 'id' | 'timestamp'>) => {
    const newFile: File = {
      ...fileData,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    setFiles(prev => [...prev, newFile]);
  };
  
  const uploadBrochureImage = async (file: globalThis.File, projectId: string) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const storagePath = `brochures/${projectId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('brochure-images')
        .upload(storagePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('brochure-images')
        .getPublicUrl(storagePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading brochure image:', error);
      throw error;
    }
  };
  
  const updateStageProgress = (stageId: string, progress: number) => {
    setStages(prev => 
      prev.map(stage => 
        stage.id === stageId ? { ...stage, progress_percentage: progress } : stage
      )
    );
  };
  
  const scheduleMeeting = (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: uuidv4()
    };
    setMeetings(prev => [...prev, newMeeting]);
  };
  
  const createTask = (task: Omit<Task, 'id' | 'created_at'>) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      created_at: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };
  
  const updateTaskStatus = (taskId: string, status: 'open' | 'in-progress' | 'done') => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      )
    );
  };
  
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };
  
  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };
  
  const createBrochureProject = async (projectId: string, clientId: string, clientName: string) => {
    const newBrochureProject: BrochureProject = {
      id: uuidv4(),
      client_id: clientId,
      project_id: projectId,
      client_name: clientName,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pages: []
    };
    setBrochureProjects(prev => [...prev, newBrochureProject]);
    return newBrochureProject;
  };
  
  const updateBrochureProject = (id: string, updates: Partial<BrochureProject>) => {
    setBrochureProjects(prev => 
      prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };
  
  const deleteBrochurePage = async (projectId: string, pageNumber: number) => {
    setBrochurePages(prev => 
      prev.filter(page => 
        !(page.project_id === projectId && page.page_number === pageNumber)
      )
    );
  };
  
  const saveBrochurePage = async (pageData: { project_id: string; page_number: number; content: BrochurePage['content']; approval_status?: 'pending' | 'approved' | 'rejected'; is_locked?: boolean }) => {
    const existingPageIndex = brochurePages.findIndex(
      page => page.project_id === pageData.project_id && page.page_number === pageData.page_number
    );

    if (existingPageIndex >= 0) {
      setBrochurePages(prev => 
        prev.map((page, index) => 
          index === existingPageIndex 
            ? { ...page, content: pageData.content, updated_at: new Date().toISOString() }
            : page
        )
      );
    } else {
      const newPage: BrochurePage = {
        id: uuidv4(),
        project_id: pageData.project_id,
        page_number: pageData.page_number,
        approval_status: pageData.approval_status || 'pending',
        is_locked: pageData.is_locked || false,
        content: pageData.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setBrochurePages(prev => [...prev, newPage]);
    }
  };
  
  const getBrochurePages = (projectId: string) => {
    return brochurePages.filter(page => page.project_id === projectId);
  };
  
  const addPageComment = (comment: Omit<PageComment, 'id' | 'timestamp'>) => {
    const newComment: PageComment = {
      ...comment,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    setPageComments(prev => [...prev, newComment]);
  };
  
  const getPageComments = (pageId: string) => {
    return pageComments.filter(comment => comment.page_id === pageId);
  };
  
  const markCommentDone = (commentId: string) => {
    setPageComments(prev => 
      prev.map(comment => 
        comment.id === commentId ? { ...comment, marked_done: true } : comment
      )
    );
  };
  
  const downloadFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      const link = document.createElement('a');
      link.href = file.file_url;
      link.download = file.filename;
      link.click();
      
      // Update download count
      setFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, download_count: f.download_count + 1, last_downloaded: new Date().toISOString() }
            : f
        )
      );
    }
  };
  
  const downloadMultipleFiles = (fileIds: string[]) => {
    fileIds.forEach(fileId => downloadFile(fileId));
  };
  
  const getDownloadHistory = () => {
    return downloadHistory;
  };
  
  const updateFileMetadata = (fileId: string, metadata: Partial<File>) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, ...metadata } : file
      )
    );
  };
  
  const createLead = (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    const newLead: Lead = {
      ...lead,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setLeads(prev => [...prev, newLead]);
  };
  
  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => 
      prev.map(lead => 
        lead.id === id ? { ...lead, ...updates, updated_at: new Date().toISOString() } : lead
      )
    );
  };
  
  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== id));
  };
  
  const approveBrochurePage = (pageId: string, status: 'approved' | 'rejected', comment?: string) => {
    setBrochurePages(prev => 
      prev.map(page => 
        page.id === pageId ? { ...page, approval_status: status } : page
      )
    );
  };
  
  const getBrochureProjectsForReview = () => {
    return brochureProjects.filter(project => 
      project.status === 'ready_for_design' || project.status === 'in_design'
    );
  };
  
  const lockBrochurePage = (pageId: string) => {
    setBrochurePages(prev => 
      prev.map(page => 
        page.id === pageId 
          ? { 
              ...page, 
              is_locked: true, 
              locked_by: user?.id,
              locked_by_name: user?.name,
              locked_at: new Date().toISOString()
            } 
          : page
      )
    );
  };
  
  const unlockBrochurePage = (pageId: string) => {
    setBrochurePages(prev => 
      prev.map(page => 
        page.id === pageId 
          ? { 
              ...page, 
              is_locked: false, 
              locked_by: undefined,
              locked_by_name: undefined,
              locked_at: undefined
            } 
          : page
      )
    );
  };
  
  const createUserAccount = async (params: { email: string; password: string; full_name: string; role: 'employee' | 'client' }) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      console.log('Creating user account:', params.email, params.role);
      
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.full_name,
            role: params.role
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Insert/Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: params.full_name,
            role: params.role,
            email: params.email
          });

        if (profileError) throw profileError;

        console.log('User account created successfully:', data.user.id);
        return { id: data.user.id };
      }
      
      return null;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw error;
    }
  };

  // Load accessible project IDs and files on mount or user change
  useEffect(() => {
    if (user) {
      fetchAccessibleProjectIds().then(ids => {
        setAccessibleProjectIds(ids);
        // Load all data when user is available
        loadProjects();
        refreshUsers();
        loadFiles();
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