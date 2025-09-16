// app/buyers/[id]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditLeadForm } from "../components/EditLeadForm";
import { HistoryPanel } from "../components/HistoryPanel";

interface EditPageProps {
  params: {
    id: string;
  };
}

export default async function EditLeadPage({ params }: EditPageProps) {
  const { id } = params;

  // Fetch the lead and its history in parallel
  const [lead, history] = await Promise.all([
    prisma.buyers.findUnique({
      where: { id },
    }),
    prisma.buyer_history.findMany({
      where: { buyerId: id },
      orderBy: { changedAt: 'desc' },
      take: 5, // Requirement: last 5 changes
    })
  ]);

  if (!lead) {
    notFound(); // If no lead is found, show a 404 page
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="p-4 mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Lead: <span className="font-normal">{lead.fullName}</span>
          </h1>
        </div>
      </header>

      <main className="p-4 mx-auto md:p-8 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content: The Edit Form */}
          <div className="p-6 bg-white rounded-lg shadow-md lg:col-span-2">
            {/* We will create this form next */}
            <EditLeadForm lead={lead} />
          </div>

          {/* Sidebar: The History Panel */}
          <div className="lg:col-span-1">
            {/* We will create this panel next */}
            <HistoryPanel history={history} />
          </div>
        </div>
      </main>
    </div>
  );
}