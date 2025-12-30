"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";

type Props = {
  title: string;
  subtitle?: string;
  loading: boolean;
  error: string | null;
  emptyTitle: string;
  emptySubtitle?: string;
  children: React.ReactNode;
};

export function DirectoryGridPage({
  title,
  subtitle,
  loading,
  error,
  emptyTitle,
  emptySubtitle,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : (
          children
        )}

        {!loading && !error && (
          <>
            {(React.Children.count(children) === 0 || children == null) && (
              <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm">
                <p className="text-xl font-medium">{emptyTitle}</p>
                {emptySubtitle && (
                  <p className="text-sm mt-2">{emptySubtitle}</p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
