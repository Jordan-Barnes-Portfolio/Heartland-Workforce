import { BaseWidget } from './BaseWidget';
import { DetailedProjectCard } from '@/components/project/DetailedProjectCard';
import { useProjects } from '@/lib/project-context';
import type { Widget } from '@/types/widget';
import type { Project } from '@/types/project';

interface ProjectsWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

export function ProjectsWidget({ widget, onRemove }: ProjectsWidgetProps) {
  const { projects, loading, error, updateProject } = useProjects();

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await updateProject(updatedProject.id, updatedProject);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  if (loading) {
    return (
      <BaseWidget widget={widget} onRemove={onRemove}>
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      </BaseWidget>
    );
  }

  if (error) {
    return (
      <BaseWidget widget={widget} onRemove={onRemove}>
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-red-500">Failed to load projects</p>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget widget={widget} onRemove={onRemove}>
      <div className="grid gap-4 p-4">
        {projects.map((project) => (
          <DetailedProjectCard 
            key={project.id} 
            project={project} 
            onUpdate={handleUpdateProject}
          />
        ))}
      </div>
    </BaseWidget>
  );
}