import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  HardHat,
  Loader2,
  Phone,
  Shield,
  Skull,
  ThumbsUp,
  User,
  Wind,
  ChevronDown,
  ChevronUp,
  Edit2,
  ExternalLink,
  Trash2,
  UserCog,
  Mail,
  Heart,
} from 'lucide-react';
import { ProjectForm } from './ProjectForm';
import { ReferralPartnersList } from './ReferralPartnersList';
import { CustomerDetailsDialog } from './CustomerDetailsDialog';
import type { Project, Client } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/firestore-service';

const statusColors = {
  'not-started': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-orange-100 text-orange-800',
  'completed': 'bg-green-100 text-green-800',
};

interface ExpandableProjectCardProps {
  project: Project;
  onUpdate?: (project: Project) => Promise<void | Project>;
  onDelete?: (project: Project) => void;
}

export function ExpandableProjectCard({ project, onUpdate, onDelete }: ExpandableProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditCustomer = () => {
    if (!project.client) {
      toast({
        title: 'Customer details not available',
        description: 'This project does not have customer details to edit.',
        variant: 'destructive',
      });
      return;
    }
    setIsEditingCustomer(true);
  };

  const handleSave = async (updatedProject: Project) => {
    console.log('🔍 ExpandableProjectCard.handleSave called with:', JSON.stringify(updatedProject, null, 2));
    
    try {
      console.log('🔍 Original project:', JSON.stringify(project, null, 2));
      console.log('🔍 onUpdate function exists:', !!onUpdate);
      
      if (onUpdate) {
        console.log('🔍 Calling onUpdate with updatedProject');
        try {
          // The project has already been updated in Firebase by the ProjectForm component
          // We just need to update the UI state
          await onUpdate(updatedProject);
          console.log('🔍 onUpdate completed successfully');
          
          toast({
            title: 'Project Updated',
            description: 'Project has been successfully updated.',
          });
        } catch (updateError) {
          console.error('🔍 Error in onUpdate:', updateError);
          throw updateError;
        }
      } else {
        console.log('🔍 onUpdate function is not provided');
      }
      
      setIsEditing(false);
      console.log('🔍 Set isEditing to false');
    } catch (error) {
      console.error('🔍 Failed to update project:', error);
      toast({
        title: 'Update failed',
        description: 'There was an error updating the project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveCustomer = async (updatedClient: Client) => {
    try {
      if (onUpdate) {
        const updatedProject = {
          ...project,
          client: updatedClient,
        };
        await onUpdate(updatedProject);
      }
      setIsEditingCustomer(false);
    } catch (error) {
      console.error('Failed to update customer details:', error);
      throw error; // Let the CustomerDetailsDialog handle the error
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden bg-white shadow-md transition-all hover:shadow-lg">
      {/* Header - Always visible */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-600">
              {project.client.contact.name}
              <span className="mx-2 text-gray-400">|</span>
              <span className="text-gray-600">{project.projectType}</span>
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {project.synopsis || project.description}
            </p>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <Badge className={statusColors[project.status]}>
              {project.status.replace('-', ' ').toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/projects/${project.id}/documentation`)}
              className="h-8 w-8"
              title="View Documentation"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleEditCustomer} 
              className="h-8 w-8"
              title="Edit Customer Details"
            >
              <UserCog className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleEdit} 
              className="h-8 w-8"
              title="Edit Project"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(project)}
                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                title="Delete Project"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div
        className={`grid transition-all duration-200 ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100">
            {/* Project Details */}
            <div className="grid gap-6 p-4 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Referrer Information */}
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                  <h4 className="mb-2 font-medium text-gray-700 border-b border-gray-200 pb-2">
                    Referral Partners
                  </h4>
                  <ReferralPartnersList referrers={project.referrers} />
                </div>

                <div className="border-t border-gray-200 pt-4"></div>

                {/* Timeline */}
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                  <h4 className="mb-2 font-medium text-gray-700 border-b border-gray-200 pb-2">
                    Timeline
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Created:</span>
                      {new Date(project.dates.created).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Est. Completion:</span>
                      {project.dates.estimatedCompletion ? 
                        new Date(project.dates.estimatedCompletion).toLocaleDateString() : 
                        "No estimate yet"}
                    </div>
                    {project.dates.actualCompletion && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="font-medium">Actual Completion:</span>
                        {new Date(project.dates.actualCompletion).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4"></div>

                {/* Project Estimates */}
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                  <h4 className="mb-2 font-medium text-gray-700 border-b border-gray-200 pb-2">
                    Estimates
                  </h4>
                  <div className="grid gap-2 text-sm">
                    {project.estimates?.mitigation && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">Mitigation:</span>
                        {formatCurrency(project.estimates.mitigation)}
                      </div>
                    )}
                    {project.estimates?.putBack && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <HardHat className="h-4 w-4" />
                        <span className="font-medium">Put Back:</span>
                        {formatCurrency(project.estimates.putBack)}
                      </div>
                    )}
                    {project.estimates?.completionEstimates && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">Completion Estimates:</span>
                        {formatCurrency(project.estimates.completionEstimates)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                {project.team && (
                  <>
                    <div className="border-t border-gray-200 pt-4"></div>
                    <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                      <h4 className="mb-2 font-medium text-gray-700 border-b border-gray-200 pb-2">
                        Team
                      </h4>
                      <div className="flex -space-x-2">
                        {project.team.map((member) => (
                          <div
                            key={member.id}
                            className="relative"
                            title={`${member.name} - ${member.role}`}
                          >
                            <div className="h-8 w-8 rounded-full bg-gray-200 ring-2 ring-white">
                              {member.avatar ? (
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-500 text-white">
                                  {member.name[0]}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Customer Information */}
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2 w-full">
                      Customer Information
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-800">{project.client?.contact.name}</p>
                    {project.client?.address && (
                      <div className="text-gray-600">
                        <p>{project.client.address.street}</p>
                        <p>
                          {project.client.address.city}, {project.client.address.state}{' '}
                          {project.client.address.zipCode}
                        </p>
                      </div>
                    )}
                    {project.client?.contact && (
                      <>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          {project.client.contact.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          {project.client.contact.name}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          {project.client.contact.email}
                        </div>
                      </>
                    )}
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditCustomer}
                        className="h-7 px-2"
                      >
                        <UserCog className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Technologies */}
                {project.technologies && (
                  <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                    <h4 className="mb-2 font-medium text-gray-700 border-b border-gray-200 pb-2">
                      Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge
                          key={tech.id}
                          variant="secondary"
                          className="bg-gray-100"
                        >
                          {tech.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Indicators */}
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                  <h4 className="mb-2 font-medium text-gray-700 border-b border-gray-200 pb-2">
                    Project Indicators
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.indicators.healthConcerns && (
                      <Badge variant="destructive" className="gap-1">
                        <Heart className="h-3 w-3" />
                        Health Concerns
                      </Badge>
                    )}
                    {project.indicators.claimRecommended && (
                      <Badge variant="secondary" className="gap-1">
                        <DollarSign className="h-3 w-3" />
                        Claim
                      </Badge>
                    )}
                    {project.indicators.mitigationRequired && (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Mitigation
                      </Badge>
                    )}
                    {project.indicators.emergencyCall && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Emergency
                      </Badge>
                    )}
                    {project.indicators.asbestosConcerns && (
                      <Badge variant="destructive" className="gap-1">
                        <Skull className="h-3 w-3" />
                        Asbestos
                      </Badge>
                    )}
                    {project.indicators.moldConcerns && (
                      <Badge variant="destructive" className="gap-1">
                        <Wind className="h-3 w-3" />
                        Mold
                      </Badge>
                    )}
                    {project.indicators.nonStandardDryTimes && (
                      <Badge variant="secondary" className="gap-1">
                        <Loader2 className="h-3 w-3" />
                        Non-Standard
                      </Badge>
                    )}
                    {project.indicators.ppeRequired && (
                      <Badge variant="secondary" className="gap-1">
                        <HardHat className="h-3 w-3" />
                        PPE
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Full Description */}
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                  <h4 className="mb-2 font-medium text-gray-700 border-b border-gray-200 pb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  {project.referrers && project.referrers.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Referral Fee:</span>
                      <span className="font-medium">{formatCurrency(project.totalReferralFee)}</span>
                      {project.referrers.length > 1 && (
                        <span className="text-xs text-gray-500">
                          ({project.referrers.length} partners)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-orange-600">
                    {formatCurrency(project.totalReferralFee)}
                  </span>
                  {project.referrers && project.referrers.length > 0 && project.estimates?.completionEstimates && (
                    <div className="text-xs text-gray-500 mt-1">
                      {project.referrers[0]?.referralPercentage || 0}% of {formatCurrency(project.estimates.completionEstimates)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={project}
            onSubmit={handleSave}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Customer Details Edit Dialog */}
      {project.client && (
        <CustomerDetailsDialog
          isOpen={isEditingCustomer}
          onClose={() => setIsEditingCustomer(false)}
          client={project.client}
          onSave={handleSaveCustomer}
          projectId={project.id}
        />
      )}
    </Card>
  );
}