import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentationItem } from '@/types/project';

interface AIReportGeneratorProps {
  photos: DocumentationItem[];
  report: DocumentationItem | null;
  date: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (content: string) => void;
}

export function AIReportGenerator({
  photos,
  report,
  date,
  open,
  onOpenChange,
  onGenerate,
}: AIReportGeneratorProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const togglePhoto = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      if (newSelected.size >= 5) {
        toast({
          title: 'Selection Limit Reached',
          description: 'You can only select up to 5 photos for the AI report.',
          variant: 'destructive',
        });
        return;
      }
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const handleGenerate = async () => {
    if (selectedPhotos.size === 0) {
      toast({
        title: 'No Photos Selected',
        description: 'Please select at least one photo to generate the report.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulated API call - replace with actual ChatGPT API integration
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedPhotosList = photos.filter(photo => selectedPhotos.has(photo.id));
      const photoDescriptions = selectedPhotosList
        .map(photo => `• ${photo.title}: ${photo.description}`)
        .join('\n');

      const generatedContent = `Project Documentation Report
Date: ${new Date(date).toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

Photo Documentation Summary:
${photoDescriptions}

Detailed Analysis:
Based on the photographic evidence, the project shows significant progress in water damage remediation. The affected areas have been properly documented, showing:

1. Water Damage Assessment
   • Extent of water infiltration clearly visible in living spaces
   • Moisture mapping completed with detailed readings
   • Affected materials identified and marked for treatment

2. Remediation Progress
   • Water extraction completed in primary affected areas
   • Drying equipment properly positioned for optimal results
   • Environmental controls established and monitored

3. Structural Considerations
   • Load-bearing elements assessed for damage
   • Wall cavity inspection results documented
   • No signs of secondary damage detected

4. Safety Protocols
   • PPE requirements maintained throughout
   • Containment measures properly implemented
   • Air quality monitoring in place

Next Steps:
1. Continue monitoring moisture levels in affected materials
2. Maintain current drying protocols
3. Schedule follow-up inspection for hidden moisture pockets
4. Prepare preliminary timeline for reconstruction phase

Additional Notes:
• All documentation complies with insurance requirements
• Client has been briefed on current progress
• Timeline remains aligned with project milestones`;

      onGenerate(generatedContent);
      onOpenChange(false);
      
      toast({
        title: 'Report Generated',
        description: 'AI report has been generated successfully.',
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate AI report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generate AI Report</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <h3 className="font-medium">Select Photos to Include</h3>
            <p className="text-sm text-gray-500">
              Choose up to 5 photos for the AI to analyze for the report
            </p>
            <p className="mt-1 text-sm font-medium text-orange-600">
              {selectedPhotos.size}/5 photos selected
            </p>
          </div>
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => togglePhoto(photo.id)}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-all"
                >
                  <div className="absolute right-3 top-3 z-10">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md border-2 bg-white transition-colors ${
                        selectedPhotos.has(photo.id)
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      <Checkbox
                        checked={selectedPhotos.has(photo.id)}
                        className="h-4 w-4 border-none data-[state=checked]:bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="aspect-video">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium">{photo.title}</h4>
                    {photo.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}