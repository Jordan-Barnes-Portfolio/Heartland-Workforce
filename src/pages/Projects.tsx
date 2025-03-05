import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ExpandableProjectCard } from '@/components/project/ExpandableProjectCard';
import { useProjects } from '@/lib/project-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Filter, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project } from '@/types/project';
import { ReferrerSelect } from '@/components/project/ReferrerSelect';

export function Projects() {
  const { projects, updateProject, addProject, removeProject, loading, error } = useProjects();
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    clientName: '',
    projectType: '',
    status: 'not-started',
    description: '',
    totalReferralFee: 0,
    referrers: [{
      id: '1',
      companyName: '',
      contact: {
        name: '',
        phone: '',
        email: '',
      },
      referralFee: 0,
      referralPercentage: 0,
    }],
    client: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      contact: {
        name: '',
        phone: '',
        email: '',
      },
    },
    dates: {
      created: new Date().toISOString(),
      estimatedCompletion: '',
    },
    estimates: {
      mitigation: '0',
      putBack: '0',
      completionEstimates: '',
    },
    indicators: {
      claimRecommended: false,
      mitigationRequired: false,
      emergencyCall: false,
      asbestosConcerns: false,
      moldConcerns: false,
      healthConcerns: false,
      nonStandardDryTimes: false,
      ppeRequired: false,
    },
  });

  const handleCreateProject = async () => {
    if (!newProject.clientName || !newProject.projectType) {
      // Show error toast
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure all required fields are present
      const projectToCreate = {
        clientName: newProject.clientName || '',
        projectType: newProject.projectType || '',
        status: newProject.status || 'not-started',
        description: newProject.description || '',
        totalReferralFee: newProject.totalReferralFee || 0,
        referrers: newProject.referrers || [],
        client: newProject.client || {
          name: '',
          address: { street: '', city: '', state: '', zipCode: '' },
          contact: { name: '', phone: '', email: '' }
        },
        dates: newProject.dates || {
          created: new Date().toISOString().split('T')[0],
          estimatedCompletion: new Date().toISOString().split('T')[0]
        },
        estimates: newProject.estimates || {
          mitigation: '',
          putBack: '',
          completionEstimates: ''
        },
        indicators: newProject.indicators || {
          claimRecommended: false,
          mitigationRequired: false,
          emergencyCall: false,
          asbestosConcerns: false,
          moldConcerns: false,
          healthConcerns: false,
          nonStandardDryTimes: false,
          ppeRequired: false
        }
      };
      
      // Add the project using the addProject function from context
      await addProject(projectToCreate);
      setIsAddingProject(false);
      setNewProject({});
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await removeProject(projectToDelete.id);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage and track all your restoration projects
                </p>
              </div>
              <div className="flex gap-3 sm:self-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>All Projects</DropdownMenuItem>
                    <DropdownMenuItem>Active Projects</DropdownMenuItem>
                    <DropdownMenuItem>Completed Projects</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  className="gap-2"
                  onClick={() => setIsAddingProject(true)}
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">Loading projects...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-red-800">Failed to load projects: {error}</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    className="animate-slideIn [animation-fill-mode:both]"
                    style={{
                      animationDelay: `${projects.indexOf(project) * 50}ms`
                    }}
                  >
                    <ExpandableProjectCard
                      project={project}
                      onUpdate={async (updatedProject) => {
                        console.log('🔍 Projects.tsx: onUpdate called with project:', JSON.stringify(updatedProject, null, 2));
                        console.log('🔍 Projects.tsx: Project with ID:', project.id);
                        
                        try {
                          console.log('🔍 Projects.tsx: Calling updateProject');
                          // Update the project in the context
                          const result = await updateProject(project.id, updatedProject);
                          console.log('🔍 Projects.tsx: UI state updated successfully, result:', JSON.stringify(result, null, 2));
                          // Don't return the result to match the expected void return type
                        } catch (error) {
                          console.error('🔍 Projects.tsx: Error updating UI state:', error);
                          throw error;
                        }
                      }}
                      onDelete={() => setProjectToDelete(project)}
                    />
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && projects.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <div className="rounded-full bg-gray-100 p-3">
                  <Plus className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No projects</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new project
                </p>
                <Button 
                  className="mt-4 gap-2"
                  onClick={() => setIsAddingProject(true)}
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Project Dialog */}
      <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={newProject.clientName || ''}
                  onChange={(e) =>
                    setNewProject({ ...newProject, clientName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Input
                  id="projectType"
                  value={newProject.projectType || ''}
                  onChange={(e) =>
                    setNewProject({ ...newProject, projectType: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value: Project['status']) =>
                    setNewProject({ ...newProject, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <ReferrerSelect 
                  selectedReferrers={newProject.referrers || []} 
                  onReferrersChange={(referrers) => {
                    setNewProject({
                      ...newProject,
                      referrers,
                      totalReferralFee: referrers.reduce((total, referrer) => total + referrer.referralFee, 0)
                    });
                  }}
                  completionEstimate={newProject.estimates?.completionEstimates || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description || ''}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              
              <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium text-gray-900">Project Estimates</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="mitigationEstimate">Mitigation Estimate</Label>
                  <Input
                    id="mitigationEstimate"
                    placeholder="e.g. $5,000"
                    value={newProject.estimates?.mitigation || ''}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        estimates: {
                          ...newProject.estimates!,
                          mitigation: e.target.value
                        }
                      })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="putBackEstimate">Put Back Estimate</Label>
                  <Input
                    id="putBackEstimate"
                    placeholder="e.g. $7,500"
                    value={newProject.estimates?.putBack || ''}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        estimates: {
                          ...newProject.estimates!,
                          putBack: e.target.value
                        }
                      })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="completionEstimate">Total Completion Estimate</Label>
                  <Input
                    id="completionEstimate"
                    placeholder="e.g. $12,500"
                    value={newProject.estimates?.completionEstimates || ''}
                    onChange={(e) => {
                      const completionEstimate = e.target.value;
                      setNewProject({
                        ...newProject,
                        estimates: {
                          ...newProject.estimates!,
                          completionEstimates: completionEstimate
                        }
                      });
                      
                      // Calculate referral fees if we have a completion estimate and referrers
                      if (completionEstimate && newProject.referrers && newProject.referrers.length > 0) {
                        try {
                          const estimateValue = parseFloat(completionEstimate.replace(/[^0-9.]/g, ''));
                          if (!isNaN(estimateValue) && estimateValue > 0) {
                            const updatedReferrers = newProject.referrers.map(referrer => {
                              const percentage = referrer.referralPercentage || 0;
                              const fee = (percentage / 100) * estimateValue;
                              return {
                                ...referrer,
                                referralFee: Math.round(fee * 100) / 100 // Round to 2 decimal places
                              };
                            });
                            
                            const totalFee = updatedReferrers.reduce(
                              (total, r) => total + (r.referralFee || 0), 
                              0
                            );
                            
                            setNewProject(prev => ({
                              ...prev,
                              referrers: updatedReferrers,
                              totalReferralFee: totalFee
                            }));
                          }
                        } catch (error) {
                          console.error('Error calculating referral fees:', error);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddingProject(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteProject}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}