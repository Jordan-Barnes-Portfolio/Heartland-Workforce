import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, ExternalLink, Edit2, Trash2 } from 'lucide-react';

interface WikiDocument {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  lastUpdated: string;
}

// Mock data for wiki documents
const mockDocuments: WikiDocument[] = [
  {
    id: '1',
    title: 'Project Management Guidelines',
    description: 'Standard operating procedures for project management and execution',
    url: 'https://docs.google.com/document/d/1abc...',
    category: 'Procedures',
    lastUpdated: '2024-03-15',
  },
  {
    id: '2',
    title: 'Equipment Maintenance Manual',
    description: 'Detailed maintenance schedules and procedures for restoration equipment',
    url: 'https://docs.google.com/document/d/2def...',
    category: 'Equipment',
    lastUpdated: '2024-03-14',
  },
  {
    id: '3',
    title: 'Safety Protocols',
    description: 'Comprehensive safety guidelines and emergency procedures',
    url: 'https://docs.google.com/document/d/3ghi...',
    category: 'Safety',
    lastUpdated: '2024-03-13',
  },
];

export function Wiki() {
  const [documents, setDocuments] = useState<WikiDocument[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [newDocument, setNewDocument] = useState<Partial<WikiDocument>>({});
  const { toast } = useToast();

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDocument = () => {
    if (!newDocument.title || !newDocument.url) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const document: WikiDocument = {
      id: Date.now().toString(),
      title: newDocument.title,
      description: newDocument.description || '',
      url: newDocument.url,
      category: newDocument.category || 'Uncategorized',
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setDocuments([...documents, document]);
    setNewDocument({});
    setIsAddingDocument(false);
    
    toast({
      title: 'Document Added',
      description: 'The document has been successfully added to the wiki.',
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    toast({
      title: 'Document Deleted',
      description: 'The document has been removed from the wiki.',
    });
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
                <h1 className="text-2xl font-bold text-gray-900">Wiki</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Access and manage documentation and guidelines
                </p>
              </div>
              <div className="flex gap-4 sm:items-center">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button onClick={() => setIsAddingDocument(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="group transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{document.title}</CardTitle>
                        <CardDescription>{document.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => handleDeleteDocument(document.id)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5">
                        {document.category}
                      </span>
                      <span>•</span>
                      <span>Updated {document.lastUpdated}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => window.open(document.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Document
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newDocument.title || ''}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newDocument.description || ''}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Google Docs URL</Label>
              <Input
                id="url"
                value={newDocument.url || ''}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, url: e.target.value })
                }
                placeholder="https://docs.google.com/document/d/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newDocument.category || ''}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, category: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingDocument(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDocument}>Add Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}