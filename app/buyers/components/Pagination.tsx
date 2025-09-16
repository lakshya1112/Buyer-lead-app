// app/buyers/components/Pagination.tsx
"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function PaginationControls({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center space-x-4">
      <Link
        href={createPageURL(currentPage - 1)}
        className={`px-4 py-2 border rounded-md ${
          currentPage <= 1 ? "pointer-events-none text-gray-400" : ""
        }`}
      >
        Previous
      </Link>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Link
        href={createPageURL(currentPage + 1)}
        className={`px-4 py-2 border rounded-md ${
          currentPage >= totalPages ? "pointer-events-none text-gray-400" : ""
        }`}
      >
        Next
      </Link>
    </div>
  );
}