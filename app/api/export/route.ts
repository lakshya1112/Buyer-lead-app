// app/api/export/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { City, Status, Prisma } from '@/lib/generated/prisma'; // 👈 ADD PRISMA HERE
import Papa from 'papaparse';

const EXPORT_COLUMNS = [
  'id', 'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 
  'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'status',
  'notes', 'tags', 'ownerId', 'updatedAt'
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') ?? '';
    const cityFilter = (searchParams.get('city') as City) ?? undefined;
    const statusFilter = (searchParams.get('status') as Status) ?? undefined;

    // 👇 EXPLICITLY TYPE THE 'where' OBJECT
    const where: Prisma.buyersWhereInput = {
      OR: searchTerm
        ? [
            { fullName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
          ]
        : undefined,
      city: cityFilter,
      status: statusFilter,
    };

    const buyers = await prisma.buyers.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formattedData = buyers.map(buyer => ({
      ...buyer,
      tags: Array.isArray(buyer.tags) ? buyer.tags.join(',') : '', 
      updatedAt: buyer.updatedAt instanceof Date ? buyer.updatedAt.toISOString() : '', 
    }));

    const csv = Papa.unparse(formattedData, {
      columns: EXPORT_COLUMNS,
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="buyer_leads_${new Date().toISOString()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Failed to export leads:', error);
    return new NextResponse(JSON.stringify({ message: 'Failed to export leads' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}