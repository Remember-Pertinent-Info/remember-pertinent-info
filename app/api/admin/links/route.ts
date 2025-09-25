import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

type LinkBody = {
  action: 'add' | 'remove';
  relation: 'department:major' | 'major:course' | 'major:track' | 'track:course';
  fromId: string;
  toId: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LinkBody;
  const { action, relation, fromId, toId } = body;
  if (!action || !relation || !fromId || !toId) return new NextResponse('Bad Request', { status: 400 });

  try {
    switch (relation) {
      case 'department:major': {
        // one-to-many: set/unset departmentId on Major
        const data = action === 'add' ? { departmentId: fromId } : { departmentId: null };
        await prisma.major.update({ where: { id: toId }, data });
        break; 
      }
      case 'major:course': {
        await prisma.major.update({
          where: { id: fromId },
          data: {
            courses: {
              [action === 'add' ? 'connect' : 'disconnect']: { id: toId },
            },
          },
        });
        break;
      }
      case 'major:track': {
        await prisma.major.update({
          where: { id: fromId },
          data: {
            tracks: {
              [action === 'add' ? 'connect' : 'disconnect']: { id: toId },
            },
          },
        });
        break;
      }
      case 'track:course': {
        await prisma.track.update({
          where: { id: fromId },
          data: {
            courses: {
              [action === 'add' ? 'connect' : 'disconnect']: { id: toId },
            },
          },
        });
        break;
      }
      default:
        return new NextResponse('Unsupported relation', { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to update link', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
