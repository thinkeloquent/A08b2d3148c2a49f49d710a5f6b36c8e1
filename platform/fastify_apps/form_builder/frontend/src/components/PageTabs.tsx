import { FormPage } from '../types';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PageTabsProps {
  pages: FormPage[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onUpdatePageTitle: (index: number, title: string) => void;
}

const PageTabs = ({
  pages,
  currentPageIndex,
  onPageChange,
  onAddPage,
  onDeletePage,
  onUpdatePageTitle,
}: PageTabsProps) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center px-4 py-2 gap-2">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <button
            onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page {currentPageIndex + 1} of {pages.length}
          </span>
          <button
            onClick={() => onPageChange(Math.min(pages.length - 1, currentPageIndex + 1))}
            disabled={currentPageIndex === pages.length - 1}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                index === currentPageIndex
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => onPageChange(index)}
            >
              <input
                type="text"
                value={page.title}
                onChange={(e) => onUpdatePageTitle(index, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={`w-24 bg-transparent text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 ${
                  index === currentPageIndex ? 'text-indigo-700' : 'text-gray-600'
                }`}
              />
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(index);
                  }}
                  className="p-0.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onAddPage}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>
    </div>
  );
};

export default PageTabs;
