import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    let scans;
    if (user) {
      // Authenticated user: return their complete scan history
      scans = await prisma.faceScan.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Guest: return last 12 scans (public/anonymous history)
      scans = await prisma.faceScan.findMany({
        where: { userId: null },
        orderBy: { createdAt: 'desc' },
        take: 12,
      });
    }

    return NextResponse.json({ scans });
  } catch (error) {
    console.error('Fetch scans error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve scan history' },
      { status: 500 }
    );
  }
}
