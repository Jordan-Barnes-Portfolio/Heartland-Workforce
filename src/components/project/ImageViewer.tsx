import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { DocumentationItem } from '@/types/project';

interface ImageViewerProps {
  images: DocumentationItem[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageViewer({ images, initialIndex, open, onOpenChange }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-7xl overflow-hidden p-0">
        <DialogHeader className="absolute right-4 top-4 z-50">
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/75"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="relative flex h-[80vh] items-center justify-center bg-black">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/75"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/75"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="h-full w-full">
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].title || `Image ${currentIndex + 1}`}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <div className="bg-white p-4">
          <h3 className="font-medium">
            {images[currentIndex].title || `Image ${currentIndex + 1}`}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(images[currentIndex].uploadedAt).toLocaleDateString()}
          </p>
          {images[currentIndex].description && (
            <p className="mt-2 text-sm">{images[currentIndex].description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}