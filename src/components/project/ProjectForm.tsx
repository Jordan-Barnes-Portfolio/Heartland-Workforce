import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, RotateCcw, Calculator, DollarSign, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ReferrerSelect } from './ReferrerSelect';
import { Checkbox } from '@/components/ui/checkbox';
import type { Project, Referrer } from '@/types/project';
import { formatCurrency, updateProject } from '@/lib/firestore-service';
import { enrichProjectDescription, isOpenAIConfigured } from '@/lib/openai-service';
import { OpenAIConfigModal } from './OpenAIConfigModal';
import { OpenAIStatusBadge } from './OpenAIStatusBadge';

const STORAGE_KEY = 'project_form_data';

const projectSchema = z.object({
  projectType: z.string().min(1, 'Project type is required'),
  status: z.enum(['not-started', 'in-progress', 'completed']),
  description: z.string().min(1, 'Description is required'),
  synopsis: z.string().optional(),
  referrers: z.array(z.object({
    id: z.string(),
    companyName: z.string(),
    contact: z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string(),
    }),
    referralFee: z.number(),
    referralPercentage: z.number(),
  })),
  totalReferralFee: z.number().min(0, 'Total referral fee must be positive'),
  estimatedCompletion: z.string().optional(),
  estimates: z.object({
    mitigation: z.string().optional().default(''),
    putBack: z.string().optional().default(''),
    completionEstimates: z.string().optional().default(''),
  }).optional().default({
    mitigation: '',
    putBack: '',
    completionEstimates: '',
  }),
  indicators: z.object({
    claimRecommended: z.boolean().default(false),
    mitigationRequired: z.boolean().default(false),
    emergencyCall: z.boolean().default(false),
    asbestosConcerns: z.boolean().default(false),
    moldConcerns: z.boolean().default(false),
    healthConcerns: z.boolean().default(false),
    nonStandardDryTimes: z.boolean().default(false),
    ppeRequired: z.boolean().default(false),
  }).default({
    claimRecommended: false,
    mitigationRequired: false,
    emergencyCall: false,
    asbestosConcerns: false,
    moldConcerns: false,
    healthConcerns: false,
    nonStandardDryTimes: false,
    ppeRequired: false,
  }),
  mitigationEstimate: z.string().optional(),
  putBackEstimate: z.string().optional(),
  completionEstimate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project: Project;
  onSubmit: (data: Project) => Promise<void>;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [originalDescription, setOriginalDescription] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectType: project.projectType,
      status: project.status,
      description: project.description,
      synopsis: project.synopsis,
      referrers: project.referrers || [],
      totalReferralFee: project.totalReferralFee,
      estimatedCompletion: project.dates?.estimatedCompletion || '',
      indicators: {
        claimRecommended: project.indicators?.claimRecommended || false,
        mitigationRequired: project.indicators?.mitigationRequired || false,
        emergencyCall: project.indicators?.emergencyCall || false,
        asbestosConcerns: project.indicators?.asbestosConcerns || false,
        moldConcerns: project.indicators?.moldConcerns || false,
        healthConcerns: project.indicators?.healthConcerns || false,
        nonStandardDryTimes: project.indicators?.nonStandardDryTimes || false,
        ppeRequired: project.indicators?.ppeRequired || false,
      },
      estimates: {
        mitigation: project.estimates?.mitigation || '',
        putBack: project.estimates?.putBack || '',
        completionEstimates: project.estimates?.completionEstimates || '',
      },
      mitigationEstimate: project.estimates?.mitigation || '',
      putBackEstimate: project.estimates?.putBack || '',
      completionEstimate: project.estimates?.completionEstimates || '',
    },
  });

  // Log form default values when component mounts
  useEffect(() => {
    console.log('🔍 ProjectForm mounted with project:', JSON.stringify(project, null, 2));
    console.log('🔍 Form default values:', JSON.stringify(form.getValues(), null, 2));
  }, []);

  // Load saved form data from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.id === project.id) {
          console.log('🔍 Found saved form data in localStorage:', JSON.stringify(parsedData, null, 2));
          Object.entries(parsedData.data).forEach(([key, value]) => {
            if (key === 'referrers' || key === 'indicators') {
              form.setValue(key as keyof ProjectFormData, value as any);
            } else {
              form.setValue(key as keyof ProjectFormData, value as any);
            }
          });
          toast({
            title: 'Form Data Restored',
            description: 'Your previous changes have been restored.',
          });
        }
      }
    } catch (error) {
      console.error('🔍 Failed to load saved form data:', error);
    }
  }, [project.id, form, toast]);

  const handleSubmit = async (data: ProjectFormData) => {
    console.log('🔍 handleSubmit triggered with form data:', JSON.stringify(data, null, 2));
    console.log('🔍 Form validation state:', JSON.stringify(form.formState, null, 2));
    
    // Check if the form is valid
    console.log('🔍 Running form validation via trigger...');
    const isValid = await form.trigger();
    console.log('🔍 Form validation result:', isValid);
    
    if (!isValid) {
      console.error('🔍 Form validation failed. Errors:', JSON.stringify(form.formState.errors, null, 2));
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('🔍 Form validation passed, proceeding with submission');
    
    try {
      setIsSubmitting(true);
      console.log('🔍 Setting isSubmitting to true');
      
      // Always synchronize the estimates object with the individual estimate fields
      data.estimates = {
        mitigation: data.mitigationEstimate || '',
        putBack: data.putBackEstimate || '',
        completionEstimates: data.completionEstimate || ''
      };
      console.log('🔍 Synchronized estimates object:', JSON.stringify(data.estimates, null, 2));
      
      // Format currency values before saving
      console.log('🔍 Formatting currency values');
      const formattedData = {
        ...data,
        mitigationEstimate: data.mitigationEstimate ? formatCurrency(data.mitigationEstimate) : '',
        putBackEstimate: data.putBackEstimate ? formatCurrency(data.putBackEstimate) : '',
        completionEstimate: data.completionEstimate ? formatCurrency(data.completionEstimate) : '',
      };
      
      console.log('🔍 Formatted data:', JSON.stringify(formattedData, null, 2));

      // Save form data to localStorage
      console.log('🔍 Saving to localStorage');
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          id: project.id,
          data: formattedData,
          timestamp: new Date().toISOString(),
        })
      );

      // Prepare the updated project data
      console.log('🔍 Preparing updated project data');
      const updatedProject = {
        ...project,
        projectType: data.projectType,
        status: data.status,
        description: data.description,
        synopsis: data.synopsis,
        referrers: data.referrers,
        totalReferralFee: data.totalReferralFee,
        dates: {
          ...project.dates,
          estimatedCompletion: data.estimatedCompletion || project.dates?.estimatedCompletion || '',
        },
        estimates: {
          mitigation: data.estimates.mitigation || '',
          putBack: data.estimates.putBack || '',
          completionEstimates: data.estimates.completionEstimates || '',
        },
        indicators: data.indicators
      };
      
      console.log('🔍 Prepared updatedProject:', JSON.stringify(updatedProject, null, 2));
      
      // Directly update the project in Firebase
      console.log('🔍 Calling updateProject with project ID:', project.id);
      const result = await updateProject(project.id, updatedProject);
      console.log('🔍 Firebase update completed successfully, result:', JSON.stringify(result, null, 2));
      
      // Call the onSubmit prop to update the UI
      console.log('🔍 Calling onSubmit with updatedProject');
      await onSubmit(updatedProject);
      console.log('🔍 onSubmit completed successfully');

      // Clear saved form data after successful submission
      console.log('🔍 Removing localStorage data');
      localStorage.removeItem(STORAGE_KEY);

      toast({
        title: 'Changes Saved',
        description: 'Your changes have been saved successfully.',
      });
      console.log('🔍 Success toast displayed');
    } catch (error) {
      console.error('🔍 Form submission failed with error:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      console.log('🔍 Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  // Calculate total referral fee
  const calculateTotalReferralFee = (referrers: Referrer[]): number => {
    console.log('Calculating total referral fee for referrers:', JSON.stringify(referrers, null, 2));
    
    // Get the completion estimate from the form
    const completionEstimateStr = form.getValues('completionEstimate');
    console.log('Completion estimate from form:', completionEstimateStr);
    
    // Parse the completion estimate to a number
    let completionEstimate = 0;
    if (completionEstimateStr) {
      // Remove any non-numeric characters except decimal point
      const numericValue = completionEstimateStr.replace(/[^0-9.]/g, '');
      completionEstimate = parseFloat(numericValue);
      console.log('Parsed completion estimate:', completionEstimate);
    }
    
    if (isNaN(completionEstimate) || completionEstimate <= 0) {
      console.log('Invalid completion estimate, using sum of referral fees');
      // If we can't calculate based on percentage, sum up the existing referral fees
      return referrers.reduce((total, referrer) => total + (referrer.referralFee || 0), 0);
    }
    
    // Calculate the total referral fee based on the percentage of each referrer
    return referrers.reduce((total, referrer) => {
      // Ensure percentage is a number
      const percentage = typeof referrer.referralPercentage === 'string'
        ? parseFloat(referrer.referralPercentage) || 0
        : (referrer.referralPercentage || 0);
        
      console.log(`Referrer ${referrer.companyName} percentage:`, percentage);
      
      const fee = (percentage / 100) * completionEstimate;
      console.log(`Calculated fee for ${referrer.companyName}:`, fee);
      
      return total + fee;
    }, 0);
  };

  // Calculate referral fees based on completion estimate and percentages
  const calculateReferralFees = () => {
    const completionEstimateStr = form.getValues('completionEstimate');
    if (!completionEstimateStr) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a completion estimate to calculate referral fees.',
        variant: 'destructive',
      });
      return;
    }

    // Parse the completion estimate, removing any non-numeric characters except decimal point
    const completionEstimate = parseFloat(completionEstimateStr.replace(/[^0-9.]/g, ''));
    
    if (isNaN(completionEstimate) || completionEstimate <= 0) {
      toast({
        title: 'Invalid Estimate',
        description: 'Please enter a valid completion estimate amount.',
        variant: 'destructive',
      });
      return;
    }

    const referrers = form.getValues('referrers');
    if (!referrers || referrers.length === 0) {
      toast({
        title: 'No Referrers',
        description: 'Please add at least one referrer to calculate fees.',
        variant: 'destructive',
      });
      return;
    }

    // Calculate referral fees based on percentages
    const updatedReferrers = referrers.map(referrer => {
      // Ensure percentage is a number
      const percentage = typeof referrer.referralPercentage === 'string'
        ? parseFloat(referrer.referralPercentage) || 0
        : (referrer.referralPercentage || 0);
        
      const fee = (percentage / 100) * completionEstimate;
      
      return {
        ...referrer,
        referralPercentage: percentage, // Ensure it's stored as a number
        referralFee: Math.round(fee * 100) / 100, // Round to 2 decimal places
      };
    });

    // Update the form with new referral fees
    form.setValue('referrers', updatedReferrers);
    
    // Update total referral fee
    const totalFee = calculateTotalReferralFee(updatedReferrers);
    form.setValue('totalReferralFee', totalFee);

    toast({
      title: 'Referral Fees Calculated',
      description: `Total referral fees: $${totalFee.toLocaleString()}`,
    });
  };

  const enrichDescription = async () => {
    const currentDescription = form.getValues('description');
    if (!currentDescription) {
      toast({
        title: 'Empty Description',
        description: 'Please enter a description to enrich.',
        variant: 'destructive',
      });
      return;
    }

    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      toast({
        title: 'API Not Configured',
        description: 'Please configure your OpenAI API key first.',
        variant: 'destructive',
      });
      setIsConfigModalOpen(true);
      return;
    }

    setIsEnriching(true);
    setOriginalDescription(currentDescription);

    try {
      // Call the OpenAI API to enrich the description
      const enhancedDescription = await enrichProjectDescription(currentDescription);
      
      form.setValue('description', enhancedDescription, { 
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true 
      });

      // Save the enriched description to localStorage
      const currentFormData = form.getValues();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          id: project.id,
          data: { ...currentFormData, description: enhancedDescription },
          timestamp: new Date().toISOString(),
        })
      );
      
      toast({
        title: 'Description Enriched',
        description: 'Your project description has been enhanced.',
      });
    } catch (error) {
      console.error('Failed to enrich description:', error);
      toast({
        title: 'Enrichment Failed',
        description: error instanceof Error ? error.message : 'Failed to enrich description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const revertDescription = () => {
    if (originalDescription) {
      form.setValue('description', originalDescription, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
      setOriginalDescription(null);

      // Update localStorage with reverted description
      const currentFormData = form.getValues();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          id: project.id,
          data: { ...currentFormData, description: originalDescription },
          timestamp: new Date().toISOString(),
        })
      );

      toast({
        title: 'Description Reverted',
        description: 'The description has been restored to its original version.',
      });
    }
  };

  // Format input value as currency on blur
  const formatEstimateOnBlur = (field: any, value: string) => {
    if (!value) return;
    
    try {
      const formattedValue = formatCurrency(value);
      field.onChange(formattedValue);
    } catch (error) {
      console.error('Error formatting currency:', error);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log('🔍 Form onSubmit event triggered', e);
          console.log('🔍 Current form state before submission:', form.formState);
          console.log('🔍 Form values before submission:', form.getValues());
          console.log('🔍 Is form dirty?', form.formState.isDirty);
          console.log('🔍 Calling form.handleSubmit with handleSubmit function');
          form.handleSubmit((data) => {
            console.log('🔍 Inside form.handleSubmit callback with data:', data);
            return handleSubmit(data);
          })(e);
        }} 
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Type</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedCompletion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Completion Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 border rounded-md bg-gray-50">
          <h3 className="font-medium text-gray-900">Project Estimates</h3>
          
          <FormField
            control={form.control}
            name="mitigationEstimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mitigation Estimate</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      {...field} 
                      className="pl-8"
                      placeholder="e.g. 5,000" 
                      onBlur={(e) => formatEstimateOnBlur(field, e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="putBackEstimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Put Back Estimate</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      {...field} 
                      className="pl-8"
                      placeholder="e.g. 7,500" 
                      onBlur={(e) => formatEstimateOnBlur(field, e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="completionEstimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Total Completion Estimate</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={calculateReferralFees}
                    className="h-7 gap-1.5"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    Calculate Referral Fees
                  </Button>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      {...field} 
                      className="pl-8"
                      placeholder="e.g. 12,500" 
                      onBlur={(e) => formatEstimateOnBlur(field, e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Project Indicators</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="indicators.claimRecommended"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Claim Recommended</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="indicators.mitigationRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mitigation Required</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="indicators.emergencyCall"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Emergency Call</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="indicators.asbestosConcerns"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Asbestos Concerns</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="indicators.moldConcerns"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mold Concerns</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="indicators.healthConcerns"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Health Concerns</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="indicators.nonStandardDryTimes"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Non-Standard Dry Times</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="indicators.ppeRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>PPE Required</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="referrers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Partners</FormLabel>
                <FormControl>
                  <ReferrerSelect 
                    selectedReferrers={field.value || []} 
                    onReferrersChange={(referrers) => {
                      console.log('Referrers changed in ProjectForm:', JSON.stringify(referrers, null, 2));
                      field.onChange(referrers);
                      const totalFee = calculateTotalReferralFee(referrers);
                      console.log('Calculated total fee:', totalFee);
                      form.setValue('totalReferralFee', totalFee);
                    }}
                    completionEstimate={form.getValues('completionEstimate') || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="synopsis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Synopsis</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Brief project overview"
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Description</span>
                  <OpenAIStatusBadge />
                </div>
                <div className="flex gap-2">
                  {originalDescription && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={revertDescription}
                      className="h-7 gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Revert
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConfigModalOpen(true)}
                    className="h-7 w-7 p-0"
                    title="Configure OpenAI API"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={enrichDescription}
                    disabled={isEnriching}
                    className="h-7 gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isEnriching ? 'Enriching...' : 'Enrich'}
                  </Button>
                </div>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Detailed project description"
                  className="min-h-[150px] resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            onClick={(e) => {
              console.log('🔍 Save button clicked', e);
              console.log('🔍 Event type:', e.type);
              console.log('🔍 Default prevented?', e.defaultPrevented);
              console.log('🔍 Is form valid?', form.formState.isValid);
              console.log('🔍 Form errors:', JSON.stringify(form.formState.errors, null, 2));
              // Don't add any logic here - we want the native form submission to work
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* OpenAI Configuration Modal */}
      <OpenAIConfigModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </Form>
  );
}