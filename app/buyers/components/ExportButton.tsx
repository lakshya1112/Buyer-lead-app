// app/buyers/components/ExportButton.tsx
"use client";

import { useSearchParams } from 'next/navigation';

export function ExportButton() {
  const searchParams = useSearchParams();
  
  // Create a URL-safe string of the current filters
  const currentQuery = new URLSearchParams(Array.from(searchParams.entries())).toString();

  return (
    <a
      href={`/api/export?${currentQuery}`}
      download
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
    >
      Export CSV
    </a>
  );
}