// app/buyers/page.tsx

export const dynamic = 'force-dynamic';

import Link from "next/link";
import prisma from "@/lib/prisma";
import { City, Status } from "@prisma/client";
import { SearchBar } from "./components/SearchBar";
import { FilterSelect } from "./components/FilterSelect";
import { PaginationControls } from "./components/Pagination";
import { LogoutButton } from "./components/LogoutButton";
import { ExportButton } from './components/ExportButton';

const getStatusColor = (status: Status) => {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-800';
    case 'Qualified': return 'bg-green-100 text-green-800';
    case 'Contacted': return 'bg-yellow-100 text-yellow-800';
    case 'Visited': return 'bg-indigo-100 text-indigo-800';
    case 'Converted': return 'bg-purple-100 text-purple-800';
    case 'Dropped': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const searchTerm = typeof searchParams.search === 'string' ? searchParams.search : "";
  const cityFilter = typeof searchParams.city === 'string' ? (searchParams.city as City) : undefined;
  const statusFilter = typeof searchParams.status === 'string' ? (searchParams.status as Status) : undefined;

  const pageSize = 10;
  const where = {
    OR: searchTerm ? [ { fullName: { contains: searchTerm, mode: "insensitive" } }, { email: { contains: searchTerm, mode: "insensitive" } }, { phone: { contains: searchTerm, mode: "insensitive" } }, ] : undefined,
    city: cityFilter,
    status: statusFilter,
  };

  const [buyers, totalBuyers] = await Promise.all([
    prisma.buyers.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.buyers.count({ where }),
  ]);

  const totalPages = Math.ceil(totalBuyers / pageSize);

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4 mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900">Buyer Leads</h1>
          <LogoutButton />
        </div>
      </header>
      
      <main className="p-4 mx-auto max-w-7xl md:p-8">
        <div className="flex items-center justify-end mb-4 space-x-2">
             {/* 👇 ADD THIS IMPORT LINK */}
          <Link href="/buyers/import" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            Import
          </Link>
          
          <ExportButton />
          <Link href="/buyers/new" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            + Create Lead
          </Link>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
            <SearchBar placeholder="Search by name, email, phone..." />
            <FilterSelect paramName="city" placeholder="Filter by city" options={Object.values(City)} />
            <FilterSelect paramName="status" placeholder="Filter by status" options={Object.values(Status)} />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Phone</th>
                  <th scope="col" className="px-6 py-3">City</th>
                  <th scope="col" className="px-6 py-3">Budget</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Last Updated</th>
                  <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {buyers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">No leads found.</td>
                  </tr>
                ) : (
                  buyers.map((buyer) => (
                    <tr key={buyer.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{buyer.fullName}</td>
                      <td className="px-6 py-4">{buyer.phone}</td>
                      <td className="px-6 py-4">{buyer.city}</td>
                      <td className="px-6 py-4">
                        {buyer.budgetMin && buyer.budgetMax ? `$${buyer.budgetMin} - $${buyer.budgetMax}` : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(buyer.status)}`}>
                          {buyer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{new Date(buyer.updatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/buyers/${buyer.id}`} className="font-medium text-blue-600 hover:underline">
                          View / Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pt-4 mt-4 border-t">
              <PaginationControls currentPage={page} totalPages={totalPages} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}