"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

type Props = {
  href: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  fallback: React.ReactNode;
  children?: React.ReactNode;
};

export function DirectoryCardLink({
  href,
  title,
  subtitle,
  imageUrl,
  fallback,
  children,
}: Props) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative h-16 w-16 flex-shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                {fallback}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {children}
      </div>
    </Link>
  );
}
