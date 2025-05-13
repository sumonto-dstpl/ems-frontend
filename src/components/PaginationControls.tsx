import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faAngleDoubleLeft, 
  faAngleDoubleRight
} from '@fortawesome/free-solid-svg-icons';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false
}) => {
  // Generate page numbers to display
  const getPageNumbers = (): (number | '...')[] => {
    const pageNumbers: (number | '...')[] = [];
    
    if (totalPages <= 7) {
      // If there are 7 or fewer pages, show all page numbers
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(0);
      
      if (currentPage > 3) {
        pageNumbers.push('...');
      }
      
      // Add pages around current page
      const startPage = Math.max(1, currentPage - 1);
      const endPage = Math.min(totalPages - 2, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (currentPage < totalPages - 4) {
        pageNumbers.push('...');
      }
      
      // Always include last page if there is more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages - 1);
      }
    }
    
    return pageNumbers;
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages && !disabled) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="flex items-center justify-center my-6">
      <div className="flex items-center space-x-1">
        {/* First page button */}
        <button
          className={`flex items-center justify-center w-10 h-10 border rounded-md ${
            currentPage === 0 || disabled
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0 || disabled}
          aria-label="First page"
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
        </button>
        
        {/* Previous page button */}
        <button
          className={`flex items-center justify-center w-10 h-10 border rounded-md ${
            currentPage === 0 || disabled
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || disabled}
          aria-label="Previous page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        
        {/* Page number buttons */}
        {getPageNumbers().map((pageNumber, index) => (
          pageNumber === '...' ? (
            <span 
              key={`ellipsis-${index}`} 
              className="flex items-center justify-center w-10 h-10 text-gray-600"
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${pageNumber}`}
              className={`flex items-center justify-center w-10 h-10 border rounded-md ${
                pageNumber === currentPage
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handlePageChange(pageNumber as number)}
              disabled={disabled}
              aria-label={`Page ${(pageNumber as number) + 1}`}
              aria-current={pageNumber === currentPage ? 'page' : undefined}
            >
              {(pageNumber as number) + 1}
            </button>
          )
        ))}
        
        {/* Next page button */}
        <button
          className={`flex items-center justify-center w-10 h-10 border rounded-md ${
            currentPage === totalPages - 1 || disabled
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1 || disabled}
          aria-label="Next page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        {/* Last page button */}
        <button
          className={`flex items-center justify-center w-10 h-10 border rounded-md ${
            currentPage === totalPages - 1 || disabled
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1 || disabled}
          aria-label="Last page"
        >
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;