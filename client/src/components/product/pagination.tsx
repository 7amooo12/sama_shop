import { ChevronLeft, ChevronRight } from 'lucide-react';
import NeoButton from '@/components/ui/neo-button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Logic to show appropriate number of page links
    if (totalPages <= maxPagesToShow) {
      // If total pages are less than max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range to always show 3 middle pages when possible
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      // Add ellipsis before middle pages if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis after middle pages if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always include last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  const pages = getPageNumbers();
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <NeoButton
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        size="sm"
        variant="default"
        className={cn(
          "text-white p-2",
          currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
        )}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </NeoButton>
      
      {pages.map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="text-muted-gray px-2">
            ...
          </span>
        ) : (
          <NeoButton
            key={`page-${page}`}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            variant={currentPage === page ? "primary" : "default"}
            size="sm"
            className={cn(
              "min-w-[36px]",
              currentPage === page ? "text-white" : "text-muted-gray"
            )}
          >
            {page}
          </NeoButton>
        )
      ))}
      
      <NeoButton
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        size="sm"
        variant="default"
        className={cn(
          "text-white p-2",
          currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
        )}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </NeoButton>
    </div>
  );
};

export default Pagination;