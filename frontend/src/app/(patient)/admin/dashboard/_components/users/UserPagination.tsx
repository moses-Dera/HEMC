'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalFilteredUsers: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function UserPagination({
  currentPage,
  totalPages,
  pageSize,
  totalFilteredUsers,
  onPageChange,
  onPageSizeChange,
}: UserPaginationProps) {
  return (
    <div className="p-4 md:px-6 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex items-center gap-2">
        <span>Showing</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {totalFilteredUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1}
        </span>
        <span>to</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {Math.min(currentPage * pageSize, totalFilteredUsers)}
        </span>
        <span>of</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">{totalFilteredUsers}</span>
        <span>users</span>

        {/* Page Size Selector */}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="ml-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-md px-2 py-1 text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-primary text-white'
                    : 'border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {pageNum}
              </button>
            );
          }
          if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
            return (
              <span key={pageNum} className="px-1 text-slate-400">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
