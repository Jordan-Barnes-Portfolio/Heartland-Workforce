import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentationItem } from '@/types/project';

interface ReportEditorProps {
  report: DocumentationItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedReport: DocumentationItem) => void;
}

export function ReportEditor({ report, open, onOpenChange, onSave }: ReportEditorProps) {
  const [editedReport, setEditedReport] = useState(report);
  const [isEnriching, setIsEnriching] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSave = () => {
    onSave(editedReport);
    onOpenChange(false);
  };

  const enrichContent = async () => {
    const currentContent = editedReport.content;
    if (!currentContent) return;

    setIsEnriching(true);
    setOriginalContent(currentContent);

    try {
      // Simulated API call - replace with actual ChatGPT API integration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const enhancedContent = `Day 2 Progress Report - Comprehensive Assessment

Water Damage Remediation Status:
• Moisture readings show significant improvement with 15-20% reduction across affected materials
• All drying equipment operating at optimal efficiency with no mechanical issues
• Dehumidification maintaining target relative humidity levels of 45-50%

Structural Assessment:
• Wall cavity inspection completed - no hidden moisture pockets detected
• Baseboards and affected drywall sections properly ventilated
• No signs of structural compromise in load-bearing elements

Environmental Monitoring:
• Air quality measurements within acceptable parameters
• No visible microbial growth detected
• HVAC system functioning normally with no contamination present

Equipment Deployment:
• 3 LGR dehumidifiers - all functioning at peak performance
• 8 air movers strategically positioned for optimal airflow
• 2 HEPA air scrubbers maintaining air quality

Next Steps:
• Continue current drying protocol for next 24-48 hours
• Schedule follow-up moisture mapping for tomorrow morning
• Prepare preliminary timeline for reconstruction phase

Additional Notes:
• Client briefed on progress and expressing satisfaction with timeline
• Insurance adjuster scheduled for site visit tomorrow at 10:00 AM
• All documentation and moisture mapping photos updated in project file`;

      setEditedReport(prev => ({
        ...prev,
        content: enhancedContent
      }));

      toast({
        title: 'Content Enriched',
        description: 'The report content has been enhanced with AI assistance.',
      });
    } catch (error) {
      console.error('Failed to enrich content:', error);
      toast({
        title: 'Enrichment Failed',
        description: 'Failed to enrich content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const revertContent = () => {
    if (originalContent) {
      setEditedReport(prev => ({
        ...prev,
        content: originalContent
      }));
      setOriginalContent(null);

      toast({
        title: 'Content Reverted',
        description: 'The report content has been restored to its original version.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedReport.title}
              onChange={(e) =>
                setEditedReport((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedReport.description || ''}
              onChange={(e) =>
                setEditedReport((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Report Content</Label>
              <div className="flex gap-2">
                {originalContent && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={revertContent}
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
                  onClick={enrichContent}
                  disabled={isEnriching || !editedReport.content}
                  className="h-7 gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isEnriching ? 'Enriching...' : 'Enrich'}
                </Button>
              </div>
            </div>
            <Textarea
              id="content"
              className="min-h-[200px] font-mono"
              value={editedReport.content || ''}
              onChange={(e) =>
                setEditedReport((prev) => ({ ...prev, content: e.target.value }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}