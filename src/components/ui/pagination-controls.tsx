import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (_page: number) => void;
  onPageSizeChange: (_pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationControlsProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Show pages 2, 3, 4, 5, ellipsis, last
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('ellipsis');
        }
      } else if (currentPage >= totalPages - 3) {
        // Show 1, ellipsis, last-4, last-3, last-2, last-1, last
        pages.push('ellipsis');
        for (let i = Math.max(2, totalPages - 4); i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1, ellipsis, current-1, current, current+1, ellipsis, last
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className='flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row'>
      <div className='order-2 flex w-full flex-wrap items-center justify-center gap-3 sm:order-1 sm:w-auto sm:justify-start'>
        <p className='whitespace-nowrap text-sm text-muted-foreground'>
          {totalCount === 0
            ? 'No entries found'
            : `Showing ${startItem} to ${endItem} of ${totalCount} entries`}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='h-8 px-3 text-xs'>
              <span>{pageSize}</span> per page
              <ChevronDown className='ml-1.5 h-3.5 w-3.5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='min-w-[120px]'>
            {pageSizeOptions.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onPageSizeChange(size)}
                className={cn(
                  'flex items-center justify-between text-sm',
                  pageSize === size ? 'bg-accent font-medium' : ''
                )}
              >
                <span>{size} per page</span>
                {pageSize === size && (
                  <span className='ml-2 h-1.5 w-1.5 rounded-full bg-primary' />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Pagination className='order-1 w-full sm:order-2 sm:w-auto'>
        <PaginationContent className='justify-center sm:justify-end'>
          {totalPages > 1 && currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(currentPage - 1)}
                className='cursor-pointer'
              />
            </PaginationItem>
          )}

          {totalPages > 0 &&
            pageNumbers.map((page, index) =>
              page === 'ellipsis' ? (
                <PaginationItem
                  key={`ellipsis-${index}`}
                  className='hidden sm:flex'
                >
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem
                  key={page}
                  className={cn(
                    // Hide some numbers on small screens except current page and boundaries
                    page !== 1 &&
                      page !== totalPages &&
                      page !== currentPage &&
                      page !== currentPage - 1 &&
                      page !== currentPage + 1 &&
                      'hidden sm:flex'
                  )}
                >
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                    className='cursor-pointer'
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

          {totalPages > 1 && currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                className='cursor-pointer'
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
