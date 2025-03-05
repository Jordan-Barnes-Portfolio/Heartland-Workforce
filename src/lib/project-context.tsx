import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Project } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { 
  getProjects, 
  getProjectsByStatus,
  getProject,
  createProject, 
  updateProject, 
  deleteProject,
  getRecentProjects,
  searchProjectsByClient
} from './firestore-service';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Promise<Project | undefined>;
  getProjectsByStatus: (status: Project['status']) => Promise<Project[]>;
  getRecentProjects: (count?: number) => Promise<Project[]>;
  searchByClient: (clientName: string) => Promise<Project[]>;
  refreshProjects: () => Promise<Project[]>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProjects = async () => {
    console.log('📊 Fetching all projects');
    try {
      setLoading(true);
      const projectsData = await getProjects();
      console.log(`📊 Fetched ${projectsData.length} projects successfully`);
      setProjects(projectsData);
      return projectsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      console.error('❌ Error fetching projects:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  async function addProject(project: Omit<Project, 'id'>) {
    console.log('📊 Adding new project:', project);
    try {
      setLoading(true);
      const docRef = await createProject(project);
      const newProject = { ...project, id: docRef.id } as Project;
      console.log('📊 Project created successfully with ID:', docRef.id);
      setProjects((prev) => [newProject, ...prev]);
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add project';
      console.error('❌ Error adding project:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateProjectState(id: string, updatedProject: Partial<Project>) {
    console.log('🔍 project-context: Updating project in context:', {
      projectId: id,
      updatedProject: JSON.stringify(updatedProject, null, 2)
    });
    
    try {
      setLoading(true);
      console.log('🔍 project-context: Calling updateProject from firestore-service');
      const updated = await updateProject(id, updatedProject);
      console.log('🔍 project-context: Project updated in database, response:', JSON.stringify(updated, null, 2));
      
      console.log('🔍 project-context: Updating projects state');
      setProjects(prevProjects => 
        prevProjects.map((project) => {
          if (project.id === id) {
            const mergedProject = { ...project, ...updated };
            console.log('🔍 project-context: Merged project in state:', JSON.stringify(mergedProject, null, 2));
            return mergedProject;
          }
          return project;
        })
      );
      
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      console.log('🔍 project-context: Success toast displayed');
      
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      console.error('🔍 project-context: Error updating project:', err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      console.log('🔍 project-context: Setting loading to false');
      setLoading(false);
    }
  }

  async function removeProject(id: string) {
    console.log('📊 Removing project with ID:', id);
    try {
      setLoading(true);
      await deleteProject(id);
      console.log('📊 Project deleted successfully');
      setProjects(projects.filter((project) => project.id !== id));
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      console.error('❌ Error deleting project:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function getProjectById(id: string): Promise<Project | undefined> {
    console.log('📊 Fetching project with ID:', id);
    try {
      setLoading(true);
      const project = await getProject(id);
      console.log('📊 Project fetched:', project ? 'success' : 'not found');
      return project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch project with ID: ${id}`;
      console.error('❌ Error fetching project by ID:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return undefined;
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjectsByStatus(status: Project['status']): Promise<Project[]> {
    console.log('📊 Fetching projects with status:', status);
    try {
      setLoading(true);
      const projects = await getProjectsByStatus(status);
      console.log(`📊 Fetched ${projects.length} projects with status: ${status}`);
      return projects;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch projects with status: ${status}`;
      console.error('❌ Error fetching projects by status:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentProjects(count: number = 5): Promise<Project[]> {
    console.log('📊 Fetching recent projects, count:', count);
    try {
      setLoading(true);
      const projects = await getRecentProjects(count);
      console.log(`📊 Fetched ${projects.length} recent projects`);
      return projects;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent projects';
      console.error('❌ Error fetching recent projects:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function searchByClient(clientName: string): Promise<Project[]> {
    console.log('📊 Searching projects by client name:', clientName);
    try {
      setLoading(true);
      const projects = await searchProjectsByClient(clientName);
      console.log(`📊 Found ${projects.length} projects for client: ${clientName}`);
      return projects;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search projects';
      console.error('❌ Error searching projects by client:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }

  const value = {
    projects,
    loading,
    error,
    addProject,
    updateProject: updateProjectState,
    removeProject,
    getProjectById,
    getProjectsByStatus: fetchProjectsByStatus,
    getRecentProjects: fetchRecentProjects,
    searchByClient,
    refreshProjects: fetchProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}