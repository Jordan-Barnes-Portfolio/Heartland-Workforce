import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ImageViewer } from '@/components/project/ImageViewer';
import { ReportEditor } from '@/components/project/ReportEditor';
import { useProjects } from '@/lib/project-context';
import { useToast } from '@/hooks/use-toast';
import { PhotoGrid } from '@/components/project/PhotoGrid';
import { AIReportGenerator } from '@/components/project/AIReportGenerator';
import { CustomerDetailsDialog } from '@/components/project/CustomerDetailsDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Play,
  Upload,
  User,
  Clock,
  Edit2,
  Plus,
  ArrowLeft,
  Filter,
  Download,
  Sparkles,
  UserCog,
} from 'lucide-react';
import type { DocumentationItem, Client, DailyDocumentation } from '@/types/project';

export function ProjectDocumentation() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjects();
  const { toast } = useToast();
  
  const project = projects.find(p => p.id === projectId);
  
  const [selectedImage, setSelectedImage] = useState<{
    images: DocumentationItem[];
    index: number;
  } | null>(null);
  const [selectedReport, setSelectedReport] = useState<DocumentationItem | null>(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [selectedDocDate, setSelectedDocDate] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project Not Found</h1>
          <p className="mt-2 text-gray-600">The project you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveReport = (updatedReport: DocumentationItem) => {
    // In a real app, this would make an API call to update the report
    toast({
      title: 'Report Updated',
      description: 'The report has been successfully updated.',
    });
  };
  
  const handleCreateReport = (date: string) => {
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
    setSelectedDocDate(date);
  };

  const handleExport = () => {
    // In a real app, this would trigger a download of all documentation
    toast({
      title: 'Export Started',
      description: 'Your documentation export will begin shortly.',
    });
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

  const handleSaveCustomer = async (updatedClient: Client) => {
    try {
      const updatedProject = {
        ...project,
        client: updatedClient,
      };
      await updateProject(project.id, updatedProject);
      setIsEditingCustomer(false);
    } catch (error) {
      console.error('Failed to update customer details:', error);
      throw error; // Let the CustomerDetailsDialog handle the error
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => navigate('/projects')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Projects
                </Button>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Project Documentation
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {project.client.contact.name} - {project.projectType}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleEditCustomer}
                  >
                    <UserCog className="h-4 w-4" />
                    Edit Customer
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                    Export All
                  </Button>
                  <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </Button>
                </div>
              </div>
            </div>

            {/* Documentation Content */}
            <Tabs defaultValue="timeline" className="space-y-6">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              {/* Timeline View */}
              <TabsContent value="timeline">
                <div className="space-y-6">
                  {project.documentation?.map((doc: DailyDocumentation) => (
                    <Card key={doc.date}>
                      <CardHeader>
                        <CardTitle>
                          {format(parseISO(doc.date), 'MMMM d, yyyy')}
                        </CardTitle>
                        <CardDescription>
                          {doc.photos.length} photos • {doc.videos.length} videos •{' '}
                          {doc.reports.length > 0 ? '1 report' : 'No report'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Media Grid */}
                          <div className="space-y-4">
                            <h3 className="font-medium">Media</h3>
                            <PhotoGrid
                              photos={doc.photos}
                              onPhotoClick={(index) => {
                                setSelectedImage({
                                  images: doc.photos,
                                  index,
                                });
                              }}
                            />
                          </div>

                          {/* Daily Report */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">End of Day Report</h3>
                              {doc.reports.length === 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleCreateReport(doc.date)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Create Report
                                </Button>
                              )}
                            </div>
                            {doc.reports[0] ? (
                              <Card>
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                      {doc.reports[0].title}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => {
                                          setSelectedReport(doc.reports[0]);
                                          setSelectedDocDate(doc.date);
                                        }}
                                      >
                                        <Sparkles className="h-4 w-4" />
                                        Generate AI Report
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                          setSelectedReport(doc.reports[0]);
                                          setSelectedDocDate(doc.date);
                                        }}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  {doc.reports[0].description && (
                                    <CardDescription>
                                      {doc.reports[0].description}
                                    </CardDescription>
                                  )}
                                </CardHeader>
                                <CardContent>
                                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {format(
                                        parseISO(doc.reports[0].uploadedAt),
                                        'h:mm a'
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <User className="h-4 w-4" />
                                      {doc.reports[0].uploadedBy}
                                    </div>
                                  </div>
                                  <div className="prose prose-sm max-w-none">
                                    <p>{doc.reports[0].content}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ) : (
                              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                                <p className="text-sm text-gray-500">
                                  No report for this day yet.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Photos View */}
              <TabsContent value="photos">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {project.documentation?.flatMap((doc) =>
                    doc.photos.map((photo) => (
                      <Card
                        key={photo.id}
                        className="group relative overflow-hidden hover:shadow-md"
                      >
                        <div
                          className="relative aspect-video cursor-pointer"
                          onClick={() => {
                            setSelectedImage({
                              images: doc.photos,
                              index: doc.photos.findIndex((p) => p.id === photo.id),
                            });
                          }}
                        >
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{photo.title}</CardTitle>
                              <CardDescription>
                                {format(parseISO(doc.date), 'MMMM d, yyyy')}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Videos View */}
              <TabsContent value="videos">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {project.documentation?.flatMap((doc) =>
                    doc.videos.map((video) => (
                      <Card
                        key={video.id}
                        className="group relative overflow-hidden hover:shadow-md"
                      >
                        <div className="relative aspect-video bg-gray-900">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-12 w-12 text-white opacity-75" />
                          </div>
                          <video
                            src={video.url}
                            className="h-full w-full object-cover opacity-50"
                            poster={video.url.replace(/\.[^/.]+$/, '_thumb.jpg')}
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{video.title}</CardTitle>
                              <CardDescription>
                                {format(parseISO(doc.date), 'MMMM d, yyyy')}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Reports View */}
              <TabsContent value="reports">
                <div className="space-y-6">
                  {project.documentation?.map((doc) => (
                    doc.reports[0] && (
                      <Card key={doc.date}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>{doc.reports[0].title}</CardTitle>
                              <CardDescription>
                                {format(parseISO(doc.date), 'MMMM d, yyyy')}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedReport(doc.reports[0]);
                                setSelectedDocDate(doc.date);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(parseISO(doc.reports[0].uploadedAt), 'h:mm a')}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {doc.reports[0].uploadedBy}
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-sm">
                            {doc.reports[0].content || 'No content added yet.'}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* AI Report Generator */}
      {selectedReport && (
        <AIReportGenerator
          photos={project.documentation?.find(
            (doc) => doc.date === selectedDocDate
          )?.photos || []}
          report={selectedReport}
          date={selectedDocDate || ''}
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
          onGenerate={(content) => {
            handleSaveReport({
              ...selectedReport,
              content,
            });
          }}
        />
      )}

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
      {selectedReport && !selectedDocDate && (
        <ReportEditor
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
          onSave={handleSaveReport}
        />
      )}

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
    </div>
  );
}