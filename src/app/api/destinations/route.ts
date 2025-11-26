import { NextResponse } from 'next/server';
import { getDestinationSummaries } from '@/lib/destinations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const destinations = getDestinationSummaries();
  return NextResponse.json(destinations);
}
