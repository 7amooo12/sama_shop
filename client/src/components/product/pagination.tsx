import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Start displaying pages from currentPage - 1
    let startPage = Math.max(2, currentPage - 1);
    
    // Add ellipsis if needed
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    // Add middle pages
    for (let i = startPage; i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (currentPage + 2 < totalPages) {
      pageNumbers.push('...');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  const pages = getPageNumbers();
  
  // Handle page change with validation
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-lg border-2",
          currentPage === 1
            ? "border-gray-700 text-gray-600 cursor-not-allowed"
            : "border-gray-700 hover:border-electric-blue text-white hover:text-electric-blue transition-colors"
        )}
      >
        <ChevronLeft size={18} />
      </button>
      
      {/* Page numbers */}
      {pages.map((page, i) => (
        <button
          key={i}
          onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
          disabled={typeof page !== 'number'}
          className={cn(
            "flex items-center justify-center h-10 w-10 rounded-lg font-medium border-2",
            typeof page !== 'number'
              ? "border-transparent text-gray-600"
              : page === currentPage
                ? "border-electric-blue text-electric-blue"
                : "border-gray-700 text-white hover:border-electric-blue hover:text-electric-blue transition-colors"
          )}
        >
          {page}
        </button>
      ))}
      
      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-lg border-2",
          currentPage === totalPages
            ? "border-gray-700 text-gray-600 cursor-not-allowed"
            : "border-gray-700 hover:border-electric-blue text-white hover:text-electric-blue transition-colors"
        )}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;