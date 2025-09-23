import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [departments, majors, tracks, courses] = await Promise.all([
      prisma.department.findMany({ select: { id: true, code: true, name: true } }),
      prisma.major.findMany({ select: { id: true, code: true, name: true } }),
      prisma.track.findMany({ select: { id: true, code: true, name: true } }),
      prisma.course.findMany({ select: { id: true, code: true, name: true } }),
    ]);
    return NextResponse.json({ departments, majors, tracks, courses });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load admin entities', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
