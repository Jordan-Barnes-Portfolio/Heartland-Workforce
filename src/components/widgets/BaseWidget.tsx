import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, GripVertical, RefreshCw } from 'lucide-react';
import type { Widget } from '@/types/widget';

interface BaseWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export function BaseWidget({ widget, onRemove, onRefresh, children }: BaseWidgetProps) {
  return (
    <Card className="group relative z-10 flex h-full flex-col overflow-hidden border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="drag-handle h-8 w-8 cursor-grab hover:bg-gray-100 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </Button>
          <h3 className="text-lg font-semibold">{widget.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-100"
            onClick={() => onRemove(widget.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="widget-content flex-1 overflow-auto">
        {children}
      </div>
    </Card>
  );
}