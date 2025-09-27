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
  uploadFileFromInput: (stageId: string, file: globalThis.File, uploaderName: string) => void;
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
  saveProjectFiles: (projectId: string, fileList: globalThis.File[], uploaderName: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  isUploading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Supabase client
let supabase: SupabaseClient | null = externalSupabase;

// Enhanced mock data with Indian names
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
  const [isUploading, setIsUploading] = useState(false);

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
      }

      if (user.role === 'employee') {
        // Employee can access projects where they are assigned
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .contains('assigned_employees', [user.id]);
        if (error) {
          console.error('Error fetching employee-accessible projects:', error);
          return [];
        }
        return (data || []).map((p: any) => p.id as string);
      }

      // Manager: schema has no manager linkage; allow all for now
      const { data, error } = await supabase
        .from('projects')
        .select('id');
      if (error) {
        console.error('Error fetching manager project IDs:', error);
        return [];
      }
      return (data || []).map((p: any) => p.id as string);
    } catch (e) {
      console.error('Error computing accessible project IDs:', e);
      return [];
    }
  };

  // Refresh accessible projects whenever user changes
  useEffect(() => {
    (async () => {
      const ids = await fetchAccessibleProjectIds();
      setAccessibleProjectIds(ids);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  // Load brochure projects from Supabase
  const loadBrochureProjects = async () => {
    if (!supabase) return;
    
    try {
      console.log('Loading brochure projects from Supabase...');
      let query = supabase
        .from('brochure_projects')
        .select(`
          *,
          client:profiles!brochure_projects_client_id_fkey(full_name)
        `);

      if (user) {
        if (user.role === 'client') {
          const ids = accessibleProjectIds || [];
          if (ids.length > 0) {
            query = query.or(`client_id.eq.${user.id},project_id.in.(${ids.join(',')})`);
          } else {
            query = query.eq('client_id', user.id);
          }
        } else if (user.role === 'employee') {
          const ids = accessibleProjectIds || [];
          if (ids.length > 0) {
            query = query.in('project_id', ids);
          } else {
            setBrochureProjects([]);
            return;
          }
        }
      }

      const { data, error } = await query;
      
      if (!error && data) {
        console.log('Brochure projects loaded successfully:', data.length);
        const mappedProjects: BrochureProject[] = data.map((p: any) => ({
          id: p.id,
          project_id: p.project_id,
          client_id: p.client_id,
          client_name: p.client?.full_name || 'Unknown Client',
          status: p.status,
          created_at: p.created_at,
          updated_at: p.updated_at,
          pages: []
        }));
        setBrochureProjects(mappedProjects);
      } else if (error) {
        console.error('Supabase error loading brochure projects:', error);
      }
    } catch (error) {
      console.error('Error loading brochure projects:', error);
    }
  };

  // Load brochure pages from Supabase
  const loadBrochurePages = async () => {
    if (!supabase) return;
    
    try {
      console.log('Loading brochure pages from Supabase...');
      const { data, error } = await supabase
        .from('brochure_pages')
        .select(`
          *,
          locked_by_profile:profiles!brochure_pages_locked_by_fkey(full_name)
        `);
      
      if (!error && data) {
        console.log('Brochure pages loaded successfully:', data.length);
        const mappedPages: BrochurePage[] = data.map((p: any) => ({
          id: p.id,
          project_id: p.project_id,
          page_number: p.page_number,
          approval_status: p.approval_status,
          is_locked: p.is_locked,
          locked_by: p.locked_by,
          locked_by_name: p.locked_by_profile?.full_name || p.locked_by_name,
          locked_at: p.locked_at,
          content: p.content || {},
          created_at: p.created_at,
          updated_at: p.updated_at
        }));

        let filteredPages = mappedPages;
        if (user && (user.role === 'client' || user.role === 'employee')) {
          const allowedBrochureProjectIds = new Set(
            brochureProjects.map(bp => bp.id)
          );
          filteredPages = mappedPages.filter(p => allowedBrochureProjectIds.has(p.project_id));
        }
        setBrochurePages(filteredPages);
      } else if (error) {
        console.error('Supabase error loading brochure pages:', error);
      }
    } catch (error) {
      console.error('Error loading brochure pages:', error);
    }
  };

  // Load page comments from Supabase
  const loadPageComments = async () => {
    if (!supabase) return;
    
    try {
      console.log('Loading page comments from Supabase...');
      const { data, error } = await supabase
        .from('page_comments')
        .select(`
          *,
          author:profiles!page_comments_added_by_fkey(full_name)
        `);
      
      if (!error && data) {
        console.log('Page comments loaded successfully:', data.length);
        const mappedComments: PageComment[] = data.map((c: any) => ({
          id: c.id,
          page_id: c.page_id,
          text: c.text,
          added_by: c.added_by,
          author_name: c.author?.full_name || 'Unknown User',
          author_role: c.author_role,
          timestamp: c.timestamp,
          marked_done: c.marked_done,
          action_type: c.action_type
        }));
        setPageComments(mappedComments);
      } else if (error) {
        console.error('Supabase error loading page comments:', error);
      }
    } catch (error) {
      console.error('Error loading page comments:', error);
    }
  };

  // Upload image to Supabase Storage
  const uploadBrochureImage = async (file: globalThis.File, projectId: string): Promise<string> => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('brochure-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('brochure-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading brochure image:', error);
      throw error;
    }
  };

  const loadGlobalComments = async () => {
    if (!supabase) return;
    
    try {
      console.log('Loading global comments from Supabase...');
      const { data, error } = await supabase
        .from('global_comments')
        .select(`
          *,
          author:profiles!global_comments_added_by_fkey(full_name)
        `);
      
      if (!error && data) {
        console.log('Global comments loaded successfully:', data.length);
        const mappedComments: GlobalComment[] = data.map((c: any) => ({
          id: c.id,
          project_id: c.project_id,
          text: c.text,
          added_by: c.added_by,
          author_name: c.author?.full_name || 'Unknown User',
          author_role: c.author_role,
          timestamp: c.timestamp
        }));
        setGlobalComments(mappedComments);
      } else if (error) {
        console.error('Supabase error loading global comments:', error);
      }
    } catch (error) {
      console.error('Error loading global comments:', error);
    }
  };

  const createUserAccount = async (params: { email: string; password: string; full_name: string; role: 'employee' | 'client' }) => {
    if (!supabase) {
      throw new Error('User creation requires Supabase to be configured. Please check your environment variables.');
    }
    const { email, password, full_name = 'Unknown User', role } = params;
    
    try {
      console.log('Attempting to create user account for:', email, 'with full_name:', full_name);

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (existingProfile) {
        throw new Error(`A user with email ${email} already exists.`);
      }

      const signup = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, role }
        }
      });

      console.log('Signup response:', signup);

      if (signup.error || !signup.data.user) {
        console.error('Signup error:', signup.error);
        if (signup.error?.message?.includes('Database error saving new user')) {
          throw new Error('Unable to create user account. This may be due to server configuration. Please contact your administrator or try again later.');
        } else if (signup.error?.message?.includes('User already registered')) {
          throw new Error(`A user with email ${email} is already registered.`);
        } else if (signup.error?.message?.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (signup.error?.message?.includes('Password')) {
          throw new Error('Password must be at least 6 characters long.');
        } else {
          throw new Error(signup.error?.message || 'Failed to create user account. Please try again.');
        }
      }

      const userId = signup.data.user.id;
      console.log('Creating profile for user:', userId);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: signup.data.user.user_metadata?.full_name || full_name,
          role: signup.data.user.user_metadata?.role || role,
          email
        }, {
          onConflict: 'id'
        });

      if (upsertErr) {
        console.error('Profile creation error:', upsertErr);
        console.warn('User account created but profile setup failed. User may need to complete profile setup.');
      }

      console.log('User account created successfully:', userId);

      setUsers(prev => [...prev, { id: userId, name: full_name, email, role } as User]);
      return { id: userId };
    } catch (error) {
      console.error('Error creating user account:', error);
      throw error;
    }
  };

  const refreshUsers = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('profiles').select('id, full_name, role, email');
    if (!error && data) {
      const mapped: User[] = (data as any[]).map(p => ({ id: p.id, name: p.full_name || p.email || 'User', email: p.email || '', role: p.role }));
      setUsers(mapped);
    }
  };

  const loadProjects = async () => {
    if (!supabase) return;
    
    try {
      console.log('Loading projects from Supabase...');
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:profiles!projects_client_id_fkey(full_name)
        `);
      
      if (!error && data) {
        console.log('Projects loaded successfully:', data.length);
        const mappedProjects: Project[] = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description || '',
          client_id: p.client_id,
          client_name: p.client?.full_name || 'Unknown Client',
          deadline: p.deadline,
          progress_percentage: p.progress_percentage,
          assigned_employees: p.assigned_employees || [],
          created_at: p.created_at,
          status: p.status,
          priority: p.priority
        }));
        setProjects(mappedProjects);
      } else if (error) {
        console.error('Supabase error loading projects:', error);
        console.log('Falling back to mock data');
        setProjects(mockProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      console.log('Network error, falling back to mock data');
      setProjects(mockProjects);
    }
  };

  const loadTasks = async () => {
    if (!supabase) return;
    
    try {
      console.log('Loading tasks from Supabase...');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      
      if (!error && data) {
        console.log('Raw tasks data from Supabase:', data);
      
        const mappedTasks: Task[] = data.map((t: any) => ({
          id: t.id,
          project_id: t.project_id,
          title: t.title,
          description: t.description,
          assigned_to: t.assigned_to,
          created_by: t.created_by,
          status: t.status,
          priority: t.priority,
          deadline: t.deadline,
          created_at: t.created_at,
          updated_at: t.updated_at
        }));
        
        console.log('Mapped tasks:', mappedTasks);
        setTasks(mappedTasks);
      } else if (error) {
        console.error('Supabase error loading tasks:', error);
        console.log('Error loading tasks, keeping existing state');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      console.log('Network error loading tasks, keeping existing state');
    }
  };

  useEffect(() => {
    refreshUsers();
    loadProjects();
    loadTasks();
    loadGlobalComments();
    (async () => {
      const ids = await fetchAccessibleProjectIds();
      setAccessibleProjectIds(ids);
      await loadBrochureProjects();
      await loadBrochurePages();
      await loadPageComments();
    })();
    
    if (supabase) {
      const projectsSubscription = supabase
        .channel('projects')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
          loadProjects();
        })
        .subscribe();

      const profilesSubscription = supabase
        .channel('profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          refreshUsers();
        })
        .subscribe();

      const tasksSubscription = supabase
        .channel('tasks')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
          loadTasks();
        })
        .subscribe();

      const globalCommentsSubscription = supabase
        .channel('global_comments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'global_comments' }, () => {
          loadGlobalComments();
        })
        .subscribe();

      const brochureProjectsSubscription = supabase
        .channel('brochure_projects')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'brochure_projects' }, () => {
          loadBrochureProjects();
        })
        .subscribe();

      const brochurePagesSubscription = supabase
        .channel('brochure_pages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'brochure_pages' }, () => {
          loadBrochurePages();
        })
        .subscribe();

      const pageCommentsSubscription = supabase
        .channel('page_comments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'page_comments' }, () => {
          loadPageComments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(projectsSubscription);
        supabase.removeChannel(profilesSubscription);
        supabase.removeChannel(tasksSubscription);
        supabase.removeChannel(globalCommentsSubscription);
        supabase.removeChannel(brochureProjectsSubscription);
        supabase.removeChannel(brochurePagesSubscription);
        supabase.removeChannel(pageCommentsSubscription);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const existingProjectIds = new Set(stages.map(s => s.project_id));
    const newProjects = projects.filter(p => !existingProjectIds.has(p.id));
    
    if (newProjects.length > 0) {
      const newStages: Stage[] = [];
      newProjects.forEach(project => {
        STAGE_NAMES.forEach((stageName, index) => {
          newStages.push({
            id: uuidv4(),
            project_id: project.id,
            name: stageName,
            notes: '',
            progress_percentage: 0,
            approval_status: 'pending',
            files: [],
            comments: [],
            order: index
          });
        });
      });
      setStages(prev => [...prev, ...newStages]);
    }
  }, [projects]);

  // Save multiple files to project storage
  const saveProjectFiles = async (projectId: string, fileList: globalThis.File[], uploaderName: string) => {
    if (!fileList.length) return;
    
    setIsUploading(true);
    try {
      if (supabase) {
        // Upload files to Supabase storage and database
        const uploadPromises = fileList.map(async (file) => {
          // Upload to storage bucket
          const fileName = `${projectId}/${Date.now()}-${file.name}`;
          const { data: storageData, error: storageError } = await supabase.storage
            .from('project-files')
            .upload(fileName, file);

          if (storageError) throw storageError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('project-files')
            .getPublicUrl(fileName);

          // Save file metadata to database
          const fileData = {
            project_id: projectId,
            filename: file.name,
            file_url: publicUrl,
            storage_path: fileName,
            uploaded_by: user?.id || '',
            uploader_name: uploaderName,
            size: file.size,
            file_type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
            category: 'other',
            download_count: 0,
            is_archived: false,
            timestamp: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('files')
            .insert([fileData])
            .select()
            .single();

          if (error) throw error;
          return data;
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        
        // Update local state
        setFiles(prev => [...prev, ...uploadedFiles]);
        
      } else {
        // Fallback to local storage
        const newFiles = fileList.map(file => ({
          id: uuidv4(),
          project_id: projectId,
          filename: file.name,
          file_url: URL.createObjectURL(file),
          uploaded_by: user?.id || '',
          uploader_name: uploaderName,
          size: file.size,
          file_type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          category: 'other' as const,
          download_count: 0,
          is_archived: false,
          timestamp: new Date().toISOString()
        }));
        
        setFiles(prev => [...prev, ...newFiles]);
        localStorage.setItem('xeetrack_files', JSON.stringify([...files, ...newFiles]));
      }
    } catch (error) {
      console.error('Error saving files:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete file from storage and database
  const deleteFile = async (fileId: string) => {
    try {
      if (supabase) {
        const fileToDelete = files.find(f => f.id === fileId);
        if (!fileToDelete) throw new Error('File not found');

        // Delete from storage if storage_path exists
        if (fileToDelete.storage_path) {
          const { error: storageError } = await supabase.storage
            .from('project-files')
            .remove([fileToDelete.storage_path]);
          
          if (storageError) {
            console.warn('Error deleting from storage:', storageError);
            // Continue with database deletion even if storage deletion fails
          }
        }

        // Delete from database
        const { error } = await supabase
          .from('files')
          .delete()
          .eq('id', fileId);

        if (error) throw error;
        
        // Update local state
        setFiles(prev => prev.filter(f => f.id !== fileId));
        
      } else {
        // Fallback to local storage
        const updatedFiles = files.filter(f => f.id !== fileId);
        setFiles(updatedFiles);
        localStorage.setItem('xeetrack_files', JSON.stringify(updatedFiles));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const downloadFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file || !user) return;

    let downloadUrl = file.file_url;
    if (supabase && file.storage_path) {
      const { data, error } = await supabase.storage
        .from('project-files')
        .createSignedUrl(file.storage_path, 60 * 5);
      if (!error && data?.signedUrl) {
        downloadUrl = data.signedUrl;
      } else {
        console.error('Failed to create signed URL:', error);
      }
    }

    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { 
            ...f, 
            download_count: f.download_count + 1,
            last_downloaded: new Date().toISOString(),
            last_downloaded_by: user.id
          }
        : f
    ));

    const historyEntry: DownloadHistory = {
      id: uuidv4(),
      file_id: fileId,
      downloaded_by: user.id,
      downloader_name: user.name,
      download_date: new Date().toISOString(),
      file_name: file.filename,
      file_size: file.size
    };
    setDownloadHistory(prev => [...prev, historyEntry]);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.filename;
    link.click();
  };

  const downloadMultipleFiles = (fileIds: string[]) => {
    if (!user) return;

    const filesToDownload = files.filter(f => fileIds.includes(f.id));
    
    filesToDownload.forEach(file => {
      setTimeout(() => downloadFile(file.id), 100);
    });
  };

  const getDownloadHistory = (): DownloadHistory[] => {
    return downloadHistory
      .filter(entry => {
        const file = files.find(f => f.id === entry.file_id);
        if (!file) return false;
        
        if (user?.role === 'manager') return true;
        if (user?.role === 'employee') {
          const project = projects.find(p => p.id === file.project_id);
          return project?.assigned_employees.includes(user.id);
        }
        return false;
      })
      .sort((a, b) => new Date(b.download_date).getTime() - new Date(a.download_date).getTime());
  };

  const updateFileMetadata = (fileId: string, metadata: Partial<File>) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...metadata } : f
    ));
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at'>) => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert({
            title: projectData.title,
            description: projectData.description,
            client_id: projectData.client_id,
            deadline: projectData.deadline,
            progress_percentage: projectData.progress_percentage,
            assigned_employees: projectData.assigned_employees,
            status: projectData.status,
            priority: projectData.priority
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating project:', error);
          throw error;
        }

        if (data) {
          const stageInserts = STAGE_NAMES.map((stageName, index) => ({
            project_id: data.id,
            name: stageName,
            notes: '',
            progress_percentage: 0,
            approval_status: 'pending',
            order: index
          }));

          await supabase.from('stages').insert(stageInserts);
        }

        await loadProjects();
      } catch (error) {
        console.error('Error creating project:', error);
        throw error;
      }
    } else {
      const newProject: Project = {
        ...projectData,
        id: uuidv4(),
        created_at: new Date().toISOString()
      };
      setProjects(prev => [...prev, newProject]);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('projects')
          .update({
            title: updates.title,
            description: updates.description,
            client_id: updates.client_id,
            deadline: updates.deadline,
            progress_percentage: updates.progress_percentage,
            assigned_employees: updates.assigned_employees,
            status: updates.status,
            priority: updates.priority
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating project:', error);
          throw error;
        }

        await loadProjects();
      } catch (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    } else {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const addCommentTask = async (data: Omit<CommentTask, 'id' | 'timestamp'>) => {
    const newCommentTask: CommentTask = {
      ...data,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    setCommentTasks(prev => [...prev, newCommentTask]);
    if (supabase) {
      await supabase.from('comment_tasks').insert(newCommentTask);
    } else {
      console.error('Supabase not configured - comment task not saved to database. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
  };

  const addGlobalComment = async (data: { project_id: string; text: string; added_by: string; author_role: string }) => {
    if (!data.text || data.text.trim() === '') {
      console.error('Comment text cannot be empty');
      throw new Error('Comment text is required');
    }

    const author = users.find(u => u.id === data.added_by);
    const authorName = author?.name || 'Unknown User';

    const newGlobalComment: GlobalComment = {
      id: uuidv4(),
      project_id: data.project_id,
      text: data.text,
      added_by: data.added_by,
      author_name: authorName,
      timestamp: new Date().toISOString(),
      author_role: data.author_role
    };
    
    if (supabase) {
      const { error } = await supabase
        .from('global_comments')
        .insert({
          project_id: data.project_id,
          text: data.text,
          added_by: data.added_by,
          author_role: data.author_role,
          timestamp: newGlobalComment.timestamp,
        });
      if (error) {
        console.error('Error adding global comment:', error);
        throw error;
      }
      await loadGlobalComments();
    } else {
      setGlobalComments(prev => [...prev, newGlobalComment]);
      console.error('Supabase not configured - global comment not saved to database. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
  };

  const updateCommentTaskStatus = async (taskId: string, status: 'open' | 'in-progress' | 'done') => {
    setCommentTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
    if (supabase) {
      await supabase.from('comment_tasks').update({ status }).eq('id', taskId);
    } else {
      console.error('Supabase not configured - comment task status not updated in database. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
  };

  const updateStageApproval = async (stageId: string, status: 'approved' | 'rejected', comment?: string) => {
    setStages(prev => prev.map(s => 
      s.id === stageId ? { ...s, approval_status: status } : s
    ));
    if (supabase) {
      await supabase.from('stages').update({ approval_status: status }).eq('id', stageId);
    } else {
      console.error('Supabase not configured - stage approval not updated in database. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
    
    if (comment) {
      const stage = stages.find(s => s.id === stageId);
      if (stage) {
        await addCommentTask({
          stage_id: stageId,
          project_id: stage.project_id,
          text: comment,
          added_by: 'client',
          author_name: 'Client',
          author_role: 'client',
          status: 'open'
        });
      }
    }
  };

  const uploadFile = async (fileData: Omit<File, 'id' | 'timestamp'>) => {
    const newFile: File = {
      ...fileData,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    setFiles(prev => [...prev, newFile]);
    if (supabase) {
      await supabase.from('files').insert(newFile);
    } else {
      console.error('Supabase not configured - file not saved to database. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
  };

  const uploadFileFromInput = async (stageId: string, file: globalThis.File, uploaderName: string) => {
    const projectId = stages.find(s => s.id === stageId)?.project_id || '';
    const fileType = file.name.split('.').pop()?.toLowerCase() || 'unknown';

    const tempId = uuidv4();
    const optimisticFile: File = {
      id: tempId,
      stage_id: stageId,
      project_id: projectId,
      filename: file.name,
      file_url: URL.createObjectURL(file),
      uploaded_by: user?.id || '',
      uploader_name: uploaderName,
      timestamp: new Date().toISOString(),
      size: file.size,
      file_type: fileType,
      category: 'other',
      description: '',
      download_count: 0,
      is_archived: false,
      tags: []
    };
    setFiles(prev => [...prev, optimisticFile]);

    if (!supabase) return;

    try {
      const fileExt = file.name.split('.').pop();
      const storagePath = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('project-files')
        .upload(storagePath, file);
      if (uploadErr) throw uploadErr;

      const saved: File = {
        ...optimisticFile,
        id: uuidv4(),
        file_url: optimisticFile.file_url,
        storage_path: storagePath,
      };

      setFiles(prev => prev.map(f => f.id === tempId ? saved : f));
    } catch (e) {
      console.error('Error uploading to storage:', e);
      setFiles(prev => prev.filter(f => f.id !== tempId));
      throw e;
    }
  };

  const updateStageProgress = async (stageId: string, progress: number) => {
    setStages(prev => prev.map(s => 
      s.id === stageId ? { ...s, progress_percentage: progress } : s
    ));
    if (supabase) {
      await supabase.from('stages').update({ progress_percentage: progress }).eq('id', stageId);
    } else {
      console.error('Supabase not configured - stage progress not updated in database. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
  };

  const scheduleMeeting = async (meetingData: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: uuidv4()
    };
    setMeetings(prev => [...prev, newMeeting]);
    if (supabase) {
      await supabase.from('meetings').insert(newMeeting);
    } else {
      console.error('Supabase not configured - meeting not saved to database. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at'>) => {
    if (supabase) {
      try {
        const taskToInsert = {
          project_id: taskData.project_id,
          title: taskData.title,
          description: taskData.description,
          assigned_to: taskData.assigned_to,
          status: taskData.status || 'open',
          priority: taskData.priority || 'medium',
          deadline: taskData.deadline || null
        };

        console.log('Creating task with data:', taskToInsert);

        const { data, error } = await supabase
          .from('tasks')
          .insert(taskToInsert)
          .select()
          .single();

        if (error) {
          console.error('Error creating task:', error);
          console.error('Error details:', error.message, error.details, error.hint);
          throw error;
        }

        console.log('Task created successfully:', data);

        await loadTasks();
      } catch (error) {
        console.error('Error creating task:', error);
        throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      const newTask: Task = {
        ...taskData,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        priority: taskData.priority || 'medium'
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const updateTaskStatus = async (taskId: string, status: 'open' | 'in-progress' | 'done') => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ status })
          .eq('id', taskId);

        if (error) {
          console.error('Error updating task status:', error);
          throw error;
        }

        await loadTasks();
      } catch (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
    } else {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: updates.title,
            description: updates.description,
            assigned_to: updates.assigned_to,
            priority: updates.priority,
            deadline: updates.deadline,
            status: updates.status
          })
          .eq('id', taskId);

        if (error) {
          console.error('Error updating task:', error);
          throw error;
        }

        await loadTasks();
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    } else {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    }
  };

  const deleteTask = async (taskId: string) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) {
          console.error('Error deleting task:', error);
          throw error;
        }

        await loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    } else {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const createBrochureProject = async (projectId: string, clientId: string, clientName: string): Promise<BrochureProject | null> => {
    const brochureId = uuidv4();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('brochure_projects')
          .insert({
            id: brochureId,
            project_id: projectId,
            client_id: clientId,
            status: 'draft'
          })
          .select('*')
          .single();
        if (error) {
          console.error('Error creating brochure project:', error);
          return null;
        }
        const created: BrochureProject = {
          id: data.id,
          project_id: data.project_id,
          client_id: data.client_id,
          client_name: clientName,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at,
          pages: []
        };
        setBrochureProjects(prev => {
          if (prev.find(p => p.id === created.id)) return prev;
          return [...prev, created];
        });
        loadBrochureProjects();
        return created;
      } catch (e) {
        console.error('Error creating brochure project:', e);
        return null;
      }
    } else {
      const newProject: BrochureProject = {
        id: brochureId,
        project_id: projectId,
        client_id: clientId,
        client_name: clientName,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pages: []
      };
      setBrochureProjects(prev => [...prev, newProject]);
      return newProject;
    }
  };

  const updateBrochureProject = async (id: string, updates: Partial<BrochureProject>) => {
    if (supabase) {
      const { error } = await supabase
        .from('brochure_projects')
        .update({ 
          status: updates.status,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating brochure project:', error);
      } else {
        loadBrochureProjects();
      }
    } else {
      setBrochureProjects(prev => prev.map(project => 
        project.id === id ? { ...project, ...updates, updated_at: new Date().toISOString() } : project
      ));
    }
  };

  const deleteBrochurePage = async (projectId: string, pageNumber: number) => {
    if (!supabase) {
      setBrochurePages(prev => prev.filter(p => !(p.project_id === projectId && p.page_number === pageNumber)));
      return;
    }

    try {
      const { error } = await supabase
        .from('brochure_pages')
        .delete()
        .eq('project_id', projectId)
        .eq('page_number', pageNumber);

      if (error) throw error;

      setBrochurePages(prev => prev.filter(p => !(p.project_id === projectId && p.page_number === pageNumber)));

      const remainingPages = brochurePages
        .filter(p => p.project_id === projectId && p.page_number > pageNumber)
        .sort((a, b) => a.page_number - b.page_number);

      for (let i = 0; i < remainingPages.length; i++) {
        const page = remainingPages[i];
        const newPageNumber = pageNumber + i;
        
        if (page.page_number !== newPageNumber) {
          await supabase
            .from('brochure_pages')
            .update({ page_number: newPageNumber })
            .eq('id', page.id);

          setBrochurePages(prev => prev.map(p => 
            p.id === page.id ? { ...p, page_number: newPageNumber } : p
          ));
        }
      }
    } catch (error) {
      console.error('Error deleting brochure page:', error);
      throw error;
    }
  };

  const saveBrochurePage = async (pageData: { project_id: string; page_number: number; content: BrochurePage['content']; approval_status?: 'pending' | 'approved' | 'rejected'; is_locked?: boolean }) => {
    if (supabase) {
      try {
        const { data: existingPage } = await supabase
          .from('brochure_pages')
          .select('id')
          .eq('project_id', pageData.project_id)
          .eq('page_number', pageData.page_number)
          .maybeSingle();

        if (existingPage) {
          const { error } = await supabase
            .from('brochure_pages')
            .update({ 
              content: pageData.content,
              approval_status: pageData.approval_status || 'pending',
              updated_at: new Date().toISOString() 
            })
            .eq('id', existingPage.id);

          if (error) {
            console.error('Error updating brochure page:', error);
            throw error;
          }
        } else {
          const { error } = await supabase
            .from('brochure_pages')
            .insert({
              project_id: pageData.project_id,
              page_number: pageData.page_number,
              content: pageData.content,
              approval_status: pageData.approval_status || 'pending',
              is_locked: pageData.is_locked || false
            });

          if (error) {
            console.error('Error creating brochure page:', error);
            throw error;
          }
        }

        await loadBrochurePages();
      } catch (error) {
        console.error('Error in saveBrochurePage:', error);
        throw error;
      }
    } else {
      const existingPageIndex = brochurePages.findIndex(
        page => page.project_id === pageData.project_id && page.page_number === pageData.page_number
      );

      if (existingPageIndex >= 0) {
        setBrochurePages(prev => prev.map((page, index) => 
          index === existingPageIndex 
            ? { ...page, content: pageData.content, updated_at: new Date().toISOString() }
            : page
        ));
      } else {
        const newPage: BrochurePage = {
          ...pageData,
          approval_status: pageData.approval_status ?? 'pending',
          is_locked: pageData.is_locked ?? false,
          id: uuidv4(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setBrochurePages(prev => [...prev, newPage]);
      }
    }
  };

  const getBrochurePages = (projectId: string): BrochurePage[] => {
    return brochurePages
      .filter(page => page.project_id === projectId)
      .sort((a, b) => a.page_number - b.page_number);
  };

  const addPageComment = async (commentData: Omit<PageComment, 'id' | 'timestamp'>) => {
    if (supabase) {
      const { error } = await supabase
        .from('page_comments')
        .insert({
          page_id: commentData.page_id,
          text: commentData.text,
          added_by: commentData.added_by,
          author_role: commentData.author_role,
          marked_done: commentData.marked_done || false,
          action_type: commentData.action_type
        });
      
      if (error) {
        console.error('Error adding page comment:', error);
      } else {
        loadPageComments();
      }
    } else {
      const newComment: PageComment = {
        ...commentData,
        id: uuidv4(),
        timestamp: new Date().toISOString()
      };
      setPageComments(prev => [...prev, newComment]);
    }
  };

  const getPageComments = (pageId: string): PageComment[] => {
    return pageComments
      .filter(comment => comment.page_id === pageId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const markCommentDone = async (commentId: string) => {
    if (supabase) {
      const { error } = await supabase
        .from('page_comments')
        .update({ marked_done: true })
        .eq('id', commentId);
      
      if (error) {
        console.error('Error marking comment done:', error);
      } else {
        loadPageComments();
      }
    } else {
      setPageComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, marked_done: true } : comment
      ));
    }
  };

  const approveBrochurePage = (pageId: string, status: 'approved' | 'rejected', comment?: string) => {
    setBrochurePages(prev => prev.map(page => 
      page.id === pageId ? { ...page, approval_status: status, updated_at: new Date().toISOString() } : page
    ));
    
    const actionText = status === 'approved' 
      ? `Page has been approved by ${user?.name || 'Manager'}${comment ? `: ${comment}` : ''}`
      : `Page requires changes - ${user?.name || 'Manager'}${comment ? `: ${comment}` : ''}`;
    
    addPageComment({
      page_id: pageId,
      text: actionText,
      added_by: user?.id || '',
      author_name: user?.name || 'Manager',
      author_role: user?.role || 'manager',
      marked_done: false,
      action_type: 'approval'
    });
  };

  const getBrochureProjectsForReview = (): BrochureProject[] => {
    if (!user) return [];
    
    const reviewableProjects = brochureProjects.filter(project => 
      project.status === 'ready_for_design' || project.status === 'in_design'
    );
    
    if (user.role === 'manager') {
      return reviewableProjects;
    } else if (user.role === 'employee') {
      const assignedProjectIds = projects
        .filter(p => p.assigned_employees.includes(user.id))
        .map(p => p.id);
      return reviewableProjects.filter(bp => 
        bp.project_id && assignedProjectIds.includes(bp.project_id)
      );
    } else if (user.role === 'client') {
      return reviewableProjects.filter(bp => bp.client_id === user.id);
    }
    
    return [];
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    const newLead: Lead = {
      ...leadData,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setLeads(prev => [...prev, newLead]);
    if (supabase) {
      await supabase.from('leads').insert(newLead);
    } else {
      console.error('Supabase not configured - lead not saved to database. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === id 
        ? { ...lead, ...updates, updated_at: new Date().toISOString() }
        : lead
    ));
    if (supabase) {
      await supabase.from('leads').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      console.error('Supabase not configured - lead not updated in database. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
  };

  const deleteLead = async (id: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== id));
    if (supabase) {
      await supabase.from('leads').delete().eq('id', id);
    } else {
      console.error('Supabase not configured - lead not deleted from database. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
  };

  const lockBrochurePage = async (pageId: string) => {
    if (!user) return;
    
    if (supabase) {
      const { error } = await supabase
        .from('brochure_pages')
        .update({ 
          is_locked: true, 
          locked_by: user.id, 
          locked_by_name: user.name, 
          locked_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', pageId);
      
      if (error) {
        console.error('Error locking page:', error);
      } else {
        loadBrochurePages();
      }
    } else {
      setBrochurePages(prev => prev.map(page => 
        page.id === pageId 
          ? { 
              ...page, 
              is_locked: true,
              locked_by: user.id,
              locked_by_name: user.name,
              locked_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : page
      ));
    }
  };

  const unlockBrochurePage = async (pageId: string) => {
    if (supabase) {
      const { error } = await supabase
        .from('brochure_pages')
        .update({ 
          is_locked: false, 
          locked_by: null, 
          locked_by_name: null, 
          locked_at: null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', pageId);
      
      if (error) {
        console.error('Error unlocking page:', error);
      } else {
        loadBrochurePages();
      }
    } else {
      setBrochurePages(prev => prev.map(page => 
        page.id === pageId 
          ? { 
              ...page, 
              is_locked: false,
              locked_by: undefined,
              locked_by_name: undefined,
              locked_at: undefined,
              updated_at: new Date().toISOString()
            }
          : page
      ));
    }
  };

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
      approveBrochurePage,
      getBrochureProjectsForReview,
      downloadFile,
      downloadMultipleFiles,
      getDownloadHistory,
      updateFileMetadata,
      createLead,
      updateLead,
      deleteLead,
      lockBrochurePage,
      unlockBrochurePage,
      createUserAccount,
      refreshUsers,
      loadProjects,
      saveProjectFiles,
      deleteFile,
      isUploading,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}