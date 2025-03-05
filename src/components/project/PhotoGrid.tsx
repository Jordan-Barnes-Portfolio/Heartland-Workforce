import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DocumentationItem } from '@/types/project';

interface PhotoGridProps {
  photos: DocumentationItem[];
  onPhotoClick: (index: number) => void;
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const photosPerPage = 4;
  const totalPages = Math.ceil(photos.length / photosPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const visiblePhotos = photos.slice(
    currentPage * photosPerPage,
    (currentPage + 1) * photosPerPage
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {visiblePhotos.map((photo, index) => (
          <Card
            key={photo.id}
            className="group relative overflow-hidden transition-all hover:shadow-md"
            onClick={() => onPhotoClick(currentPage * photosPerPage + index)}
          >
            <div className="relative aspect-[4/3] cursor-pointer">
              {/* Photo Number Badge */}
              <div className="absolute right-2 top-2 z-10 rounded-full bg-black/75 px-2 py-1 text-xs font-medium text-white">
                Photo {currentPage * photosPerPage + index + 1} of {photos.length}
              </div>
              
              <img
                src={photo.url}
                alt={photo.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60" />
              
              {/* Photo Description */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h4 className="font-medium leading-tight">{photo.title}</h4>
                {photo.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-200">
                    {photo.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  currentPage === i
                    ? 'bg-gray-900 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}