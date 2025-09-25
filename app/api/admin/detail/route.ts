import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id');

  if (!type || !id) return new NextResponse('Missing type or id', { status: 400 });

  try {
    if (type === 'department') {
      const dept = await prisma.department.findUnique({
        where: { id },
        include: { majors: { select: { id: true, code: true, name: true } } },
      });
      return NextResponse.json(dept);
    }
    if (type === 'major') {
      const major = await prisma.major.findUnique({
        where: { id },
        include: {
          department: { select: { id: true, code: true, name: true } },
          courses: { select: { id: true, code: true, name: true } },
          tracks: { select: { id: true, code: true, name: true } },
        },
      });
      return NextResponse.json(major);
    }
    if (type === 'track') {
      const track = await prisma.track.findUnique({
        where: { id },
        include: { courses: { select: { id: true, code: true, name: true } }, majors: { select: { id: true, code: true, name: true } } },
      });
      return NextResponse.json(track);
    }
    return new NextResponse('Unsupported type', { status: 400 });
  } catch (err) {
    console.error('Failed to load entity detail', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
