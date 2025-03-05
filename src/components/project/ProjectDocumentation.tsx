import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  Image as ImageIcon,
  Play,
  Upload,
  Calendar,
  User,
  Clock,
  Edit2,
  Plus,
} from 'lucide-react';
import { ImageViewer } from './ImageViewer';
import { ReportEditor } from './ReportEditor';
import type { Project, DocumentationItem } from '@/types/project';
import { useToast } from '@/hooks/use-toast';

interface ProjectDocumentationProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDocumentation({ project, open, onOpenChange }: ProjectDocumentationProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    project.documentation?.[0]?.date || null
  );
  const [selectedImage, setSelectedImage] = useState<{
    images: DocumentationItem[];
    index: number;
  } | null>(null);
  const [selectedReport, setSelectedReport] = useState<DocumentationItem | null>(null);
  const { toast } = useToast();

  const handleSaveReport = (updatedReport: DocumentationItem) => {
    // In a real app, this would make an API call to update the report
    toast({
      title: 'Report Updated',
      description: 'The report has been successfully updated.',
    });
  };

  const handleCreateReport = () => {
    if (!selectedDate) return;

    const newReport: DocumentationItem = {
      id: `report-${Date.now()}`,
      type: 'report',
      title: 'End of Day Report',
      description: '',
      url: '',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User', // This would come from auth context in a real app
      content: '',
    };

    setSelectedReport(newReport);
  };

  const renderMediaItem = (item: DocumentationItem) => {
    return (
      <Card key={item.id} className="group relative overflow-hidden hover:shadow-md">
        {item.type === 'photo' ? (
          <div 
            className="relative aspect-video cursor-pointer"
            onClick={() => {
              const selectedDayDocs = project.documentation?.find(
                (doc) => doc.date === selectedDate
              );
              if (selectedDayDocs) {
                setSelectedImage({
                  images: selectedDayDocs.photos,
                  index: selectedDayDocs.photos.findIndex((photo) => photo.id === item.id),
                });
              }
            }}
          >
            <img
              src={item.url}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="relative aspect-video bg-gray-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-12 w-12 text-white opacity-75" />
            </div>
            <video
              src={item.url}
              className="h-full w-full object-cover opacity-50"
              poster={item.url.replace(/\.[^/.]+$/, '_thumb.jpg')}
            />
          </div>
        )}
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">{item.title}</CardTitle>
          {item.description && (
            <CardDescription className="line-clamp-2">{item.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(parseISO(item.uploadedAt), 'h:mm a')}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {item.uploadedBy}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const selectedDayDocs = project.documentation?.find(
    (doc) => doc.date === selectedDate
  );

  const dailyReport = selectedDayDocs?.reports[0];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Project Documentation</DialogTitle>
          </DialogHeader>
          <div className="flex h-[calc(90vh-8rem)] gap-6 p-6">
            {/* Date Sidebar */}
            <div className="w-64 shrink-0 overflow-hidden rounded-lg border bg-white">
              <div className="border-b p-4">
                <h3 className="font-semibold">Timeline</h3>
              </div>
              <ScrollArea className="h-full">
                <div className="space-y-1 p-2">
                  {project.documentation?.map((doc) => (
                    <button
                      key={doc.date}
                      onClick={() => setSelectedDate(doc.date)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                        selectedDate === doc.date ? 'bg-gray-100' : ''
                      }`}
                    >
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <span className="font-medium">
                          {format(parseISO(doc.date), 'MMM d, yyyy')}
                        </span>
                        <div className="mt-1 flex gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {doc.photos.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {doc.videos.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {doc.reports.length > 0 ? '1' : '0'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden rounded-lg border bg-white">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h3 className="font-semibold">
                    {selectedDate
                      ? format(parseISO(selectedDate), 'MMMM d, yyyy')
                      : 'Select a date'}
                  </h3>
                </div>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Files
                </Button>
              </div>

              {selectedDayDocs ? (
                <div className="grid h-[calc(100%-4rem)] grid-cols-2 divide-x">
                  {/* Media Section */}
                  <div className="overflow-hidden">
                    <div className="border-b p-4">
                      <h4 className="font-medium">Photos & Videos</h4>
                    </div>
                    <ScrollArea className="h-[calc(100%-4rem)] p-4">
                      <div className="grid gap-4">
                        {[...selectedDayDocs.photos, ...selectedDayDocs.videos].map(renderMediaItem)}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Report Section */}
                  <div className="overflow-hidden">
                    <div className="flex items-center justify-between border-b p-4">
                      <h4 className="font-medium">End of Day Report</h4>
                      {!dailyReport && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={handleCreateReport}
                        >
                          <Plus className="h-4 w-4" />
                          Create Report
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[calc(100%-4rem)] p-4">
                      {dailyReport ? (
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{dailyReport.title}</CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedReport(dailyReport)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {dailyReport.description && (
                              <CardDescription>{dailyReport.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(parseISO(dailyReport.uploadedAt), 'h:mm a')}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {dailyReport.uploadedBy}
                              </div>
                            </div>
                            <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-sm">
                              {dailyReport.content || 'No content added yet.'}
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="flex h-full items-center justify-center text-center text-gray-500">
                          <div>
                            <FileText className="mx-auto h-12 w-12 opacity-50" />
                            <p className="mt-2">No end of day report yet</p>
                            <p className="text-sm">Click "Create Report" to add one</p>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="flex h-[calc(100%-4rem)] items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-2">Select a date to view documentation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer */}
      {selectedImage && (
        <ImageViewer
          images={selectedImage.images}
          initialIndex={selectedImage.index}
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        />
      )}

      {/* Report Editor */}
      {selectedReport && (
        <ReportEditor
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
          onSave={handleSaveReport}
        />
      )}
    </>
  );
}