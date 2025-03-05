import { useState } from 'react';
import { BaseWidget } from './BaseWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Search } from 'lucide-react';
import type { Widget } from '@/types/widget';

interface WikiDocument {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  lastUpdated: string;
}

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

interface WikiWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

export function WikiWidget({ widget, onRemove }: WikiWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = mockDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <BaseWidget widget={widget} onRemove={onRemove}>
      <div className="flex flex-col p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2">
                <h3 className="font-medium">{document.title}</h3>
                <p className="text-sm text-gray-500">{document.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5">
                    {document.category}
                  </span>
                  <span>•</span>
                  <span>Updated {document.lastUpdated}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(document.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseWidget>
  );
}