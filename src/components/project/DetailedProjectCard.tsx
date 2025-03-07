import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  UserCog,
  Mail,
  Heart,
} from 'lucide-react';
import type { Project, Client } from '@/types/project';
import { ReferralPartnersList } from './ReferralPartnersList';
import { CustomerDetailsDialog } from './CustomerDetailsDialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/firestore-service';

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const statusColors = {
  'not-started': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-orange-100 text-orange-800',
  'completed': 'bg-green-100 text-green-800',
};

interface DetailedProjectCardProps {
  project: Project;
  onUpdate?: (project: Project) => Promise<void>;
}

export function DetailedProjectCard({ project, onUpdate }: DetailedProjectCardProps) {
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const { toast } = useToast();

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

  return (
    <Card className="overflow-hidden bg-white shadow-md transition-shadow hover:shadow-lg">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {project.client.contact.name}
              <span className="mx-2 text-gray-400">|</span>
              <span className="text-gray-600">{project.projectType}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[project.status]}>
              {project.status.replace('-', ' ').toUpperCase()}
            </Badge>
            {onUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditCustomer}
                className="h-8 w-8"
                title="Edit Customer Details"
              >
                <UserCog className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="divide-y divide-gray-100">
        {/* Contact Information Section */}
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {/* Referrer Information */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-3 font-medium text-gray-900">Referral Partners</h4>
            <ReferralPartnersList referrers={project.referrers} showEmail={true} />
          </div>

          {/* Client Information */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Client Information</h4>
              {onUpdate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditCustomer}
                  className="h-7 px-2"
                >
                  <UserCog className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              )}
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
                    <Mail className="h-4 w-4" />
                    {project.client.contact.email}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-white p-4">
          <h4 className="mb-3 font-medium text-gray-900">Project Timeline</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Created:</span>
              {formatDate(project.dates.created)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Est. Completion:</span>
              {project.dates.estimatedCompletion ? 
                formatDate(project.dates.estimatedCompletion) : 
                "No estimate yet"}
            </div>
            {project.dates.actualCompletion && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ThumbsUp className="h-4 w-4" />
                <span className="font-medium">Actual Completion:</span>
                {formatDate(project.dates.actualCompletion)}
              </div>
            )}
          </div>
        </div>

        {/* Estimates Section */}
        <div className="bg-white p-4">
          <h4 className="mb-3 font-medium text-gray-900">Project Estimates</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Mitigation</p>
              <p className="text-sm text-gray-600">
                {project.estimates.mitigation 
                  ? formatCurrency(project.estimates.mitigation) 
                  : "Not specified"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Put Back</p>
              <p className="text-sm text-gray-600">
                {project.estimates.putBack 
                  ? formatCurrency(project.estimates.putBack) 
                  : "Not specified"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Completion Estimates</p>
              <p className="text-sm text-gray-600">
                {project.estimates.completionEstimates 
                  ? formatCurrency(project.estimates.completionEstimates) 
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Indicators Section */}
        <div className="bg-white p-4">
          <h4 className="mb-3 font-medium text-gray-900">Project Indicators</h4>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
            {project.indicators.healthConcerns && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="destructive" className="gap-1">
                      <Heart className="h-3 w-3" />
                      Health
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Health Concerns</TooltipContent>
                </Tooltip>
              )}
              {project.indicators.claimRecommended && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      Claim
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Claim Recommended</TooltipContent>
                </Tooltip>
              )}
              {project.indicators.mitigationRequired && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Mitigation
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Mitigation Required</TooltipContent>
                </Tooltip>
              )}
              {project.indicators.emergencyCall && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Emergency
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Emergency Call</TooltipContent>
                </Tooltip>
              )}
              {project.indicators.asbestosConcerns && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="destructive" className="gap-1">
                      <Skull className="h-3 w-3" />
                      Asbestos
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Asbestos Concerns</TooltipContent>
                </Tooltip>
              )}
              {project.indicators.moldConcerns && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="destructive" className="gap-1">
                      <Wind className="h-3 w-3" />
                      Mold
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Mold Concerns</TooltipContent>
                </Tooltip>
              )}
              {project.indicators.nonStandardDryTimes && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="gap-1">
                      <Loader2 className="h-3 w-3" />
                      Non-Standard
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Non-Standard Dry Times</TooltipContent>
                </Tooltip>
              )}
              {project.indicators.ppeRequired && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="gap-1">
                      <HardHat className="h-3 w-3" />
                      PPE
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>PPE Required</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white p-4">
          <h4 className="mb-3 font-medium text-gray-900">Project Description</h4>
          <p className="text-sm text-gray-600">{project.description}</p>
        </div>

        {/* Footer Section */}
        <div className="bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Referral Fee</span>
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