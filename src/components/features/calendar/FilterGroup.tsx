"use client";

import type { ReactNode } from "react";

type FilterGroupProps = {
  title: string;
  selectedCount?: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  children: ReactNode;
};

export function FilterGroup({
  title,
  selectedCount,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  children,
}: FilterGroupProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {title}
          {selectedCount != null && selectedCount > 0 ? (
            <span className="ml-2 text-xs font-medium text-gray-500">
              ({selectedCount})
            </span>
          ) : null}
        </h2>
      </div>

      <input
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="max-h-56 overflow-auto rounded-md border border-gray-200 bg-white p-2">
        {children}
      </div>
    </section>
  );
}
