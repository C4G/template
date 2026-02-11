import { auth } from '@/lib/auth';
import { convertFilterModelToPrisma } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

interface PrismaModel {
  findMany: (_args?: unknown) => Promise<unknown[]>;
}

function isPrismaModel(model: unknown): model is PrismaModel {
  return (
    typeof model === 'object' &&
    model !== null &&
    'findMany' in model &&
    typeof model.findMany === 'function'
  );
}

/**
 * POST /api/export-csv
 *
 * Exports data from any table as a CSV file.
 *
 * Request body:
 *   - table: string (Prisma model name, e.g. 'user')
 *   - filterModel: object (same as used in users API)
 *   - columns: string[] (list of columns to include in CSV)
 *
 * Returns a CSV file as an attachment.
 */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  try {
    const { table, filterModel, columns } = await req.json();
    if (!table || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: 'Missing table or columns' },
        { status: 400 }
      );
    }

    // Convert filter model to Prisma where clause
    const where = filterModel
      ? convertFilterModelToPrisma(filterModel)
      : undefined;

    // Dynamically access the Prisma model
    const model = prisma[table];
    if (!isPrismaModel(model)) {
      return NextResponse.json(
        { error: 'Invalid table name' },
        { status: 400 }
      );
    }

    // Query data
    const data = await model.findMany({
      where,
      select: columns.reduce<Record<string, boolean>>((acc, col: string) => {
        acc[col] = true;
        return acc;
      }, {}),
    });

    const csv = Papa.unparse(data, { columns });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${table}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json({ error: 'Error exporting CSV' }, { status: 500 });
  }
}
