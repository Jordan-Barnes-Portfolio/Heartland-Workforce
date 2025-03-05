import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List, Calendar } from 'lucide-react';

interface ViewToggleProps {
  view: string;
  onViewChange: (view: string) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <ToggleGroup type="single" value={view} onValueChange={onViewChange} className="bg-white">
      <ToggleGroupItem value="board" aria-label="Board view" className="data-[state=on]:bg-gray-100">
        <LayoutGrid className="h-4 w-4 text-gray-600" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view" className="data-[state=on]:bg-gray-100">
        <List className="h-4 w-4 text-gray-600" />
      </ToggleGroupItem>
      <ToggleGroupItem value="calendar" aria-label="Calendar view" className="data-[state=on]:bg-gray-100">
        <Calendar className="h-4 w-4 text-gray-600" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}