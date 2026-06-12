import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const scan = await prisma.faceScan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ scan });
  } catch (error) {
    console.error('Fetch single scan error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve scan details' },
      { status: 500 }
    );
  }
}
