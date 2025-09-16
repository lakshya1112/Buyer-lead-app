// app/buyers/page.tsx

import Link from "next/link";
import prisma from "@/lib/prisma";
import { City, Status } from "@prisma/client";

// This is the main component for the buyers list page.
// It's a Server Component, so it can fetch data directly.
export default async function BuyersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const page = parseInt(searchParams.page ?? "1", 10);
  const searchTerm = searchParams.search ?? "";
  const cityFilter = (searchParams.city as City) ?? undefined;
  const statusFilter = (searchParams.status as Status) ?? undefined;

  const pageSize = 10;

  // Build the filter conditions for the database query
  const where = {
    OR: searchTerm
      ? [
          { fullName: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm, mode: "insensitive" } },
        ]
      : undefined,
    city: cityFilter,
    status: statusFilter,
  };

  // Fetch the data and the total count in parallel
  const [buyers, totalBuyers] = await Promise.all([
    prisma.buyers.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.buyers.count({ where }),
  ]);

  const totalPages = Math.ceil(totalBuyers / pageSize);

  return (
    <div className="p-8 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Buyer Leads</h1>
        {/* We will create this button component next */}
        <LogoutButton />
      </div>

      <div className="mb-4 text-right">
        <Link href="/buyers/new" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          + Create Lead
        </Link>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
          {/* We will create these interactive components next */}
          <SearchBar placeholder="Search by name, email, phone..." />
          <FilterSelect
            paramName="city"
            placeholder="Filter by city"
            options={Object.values(City)}
          />
          <FilterSelect
            paramName="status"
            placeholder="Filter by status"
            options={Object.values(Status)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">City</th>
                <th className="p-3">Budget</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Updated</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {buyers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No leads found.
                  </td>
                </tr>
              ) : (
                buyers.map((buyer) => (
                  <tr key={buyer.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{buyer.fullName}</td>
                    <td className="p-3">{buyer.phone}</td>
                    <td className="p-3">{buyer.city}</td>
                    <td className="p-3">
                      {buyer.budgetMin && buyer.budgetMax
                        ? `$${buyer.budgetMin} - $${buyer.budgetMax}`
                        : "N/A"}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                        {buyer.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(buyer.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/buyers/${buyer.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View / Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}