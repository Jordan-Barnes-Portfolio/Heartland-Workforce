import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Users, Calendar } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Project } from '@/types/project';

const statusColors = {
  'not-started': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-orange-100 text-orange-800',
  'completed': 'bg-green-100 text-green-800',
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative cursor-grab overflow-hidden rounded-lg border border-gray-100 bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_8px_rgba(0,0,0,0.05)] active:cursor-grabbing"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{project.clientName}</h3>
          <p className="mt-1 text-sm text-gray-500">{project.projectType}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[project.status]}>
            {project.status.replace('-', ' ').toUpperCase()}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-lg p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-gray-50 group-hover:opacity-100">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="mt-4">
        {/* Referral Partners - Compact View */}
        {project.referrers && project.referrers.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {project.referrers.map((referrer) => (
                <Badge 
                  key={referrer.id} 
                  variant="outline" 
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  {referrer.companyName}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Timeline */}
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          {project.dates.estimatedCompletion ? 
            `Est. Completion: ${new Date(project.dates.estimatedCompletion).toLocaleDateString()}` : 
            `Created: ${new Date(project.dates.created).toLocaleDateString()}`}
        </div>
      </div>
    </Card>
  );
} 