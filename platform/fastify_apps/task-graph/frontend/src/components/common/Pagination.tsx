interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
}

export default function Pagination({ total, limit, offset, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const canGoPrevious = offset > 0;
  const canGoNext = offset + limit < total;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} results
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={!canGoPrevious}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(offset + limit)}
          disabled={!canGoNext}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
