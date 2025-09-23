import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/search?q=term
 * Searches all entity tables for substring matches on code, name, or description
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  if (!q.trim()) {
    // Return a default list when no query provided (e.g., initial page load)
    try {
      const [concepts, skills, courses, tracks, departments, majors] = await Promise.all([
        prisma.concept.findMany({
          select: { id: true, code: true, name: true, description: true },
          orderBy: { name: 'asc' },
          take: 20,
        }),
        prisma.skill.findMany({
          select: { id: true, code: true, name: true, description: true },
          orderBy: { name: 'asc' },
          take: 20,
        }),
        prisma.course.findMany({
          select: { id: true, code: true, name: true, description: true },
          orderBy: { name: 'asc' },
          take: 20,
        }),
        prisma.track.findMany({
          select: { id: true, code: true, name: true, description: true },
          orderBy: { name: 'asc' },
          take: 20,
        }),
        prisma.department.findMany({
          select: { id: true, code: true, name: true, description: true },
          orderBy: { name: 'asc' },
          take: 20,
        }),
        prisma.major.findMany({
          select: { id: true, code: true, name: true, description: true },
          orderBy: { name: 'asc' },
          take: 20,
        }),
      ]);

      const all = [
        ...concepts.map(c => ({ ...c, type: 'concepts' })),
        ...skills.map(s => ({ ...s, type: 'skills' })),
        ...courses.map(c => ({ ...c, type: 'courses' })),
        ...tracks.map(t => ({ ...t, type: 'tracks' })),
        ...departments.map(d => ({ ...d, type: 'departments' })),
        ...majors.map(m => ({ ...m, type: 'majors' })),
      ].sort((a, b) => a.name.localeCompare(b.name));

      return NextResponse.json({ results: all, message: 'Showing all items' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Default list fetch failed', e);
      return NextResponse.json({ results: [] });
    }
  }

  const term = q.trim();

  try {
    // Use substring matching with Prisma's contains filter
    // This is case-insensitive by default and matches anywhere in the string
    const [concepts, skills, courses, tracks, departments, majors] = await Promise.all([
      prisma.concept.findMany({
        where: {
          OR: [
            { code: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: { id: true, code: true, name: true, description: true },
        take: 100,
      }),
      prisma.skill.findMany({
        where: {
          OR: [
            { code: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: { id: true, code: true, name: true, description: true },
        take: 100,
      }),
      prisma.course.findMany({
        where: {
          OR: [
            { code: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: { id: true, code: true, name: true, description: true },
        take: 100,
      }),
      prisma.track.findMany({
        where: {
          OR: [
            { code: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: { id: true, code: true, name: true, description: true },
        take: 100,
      }),
      prisma.department.findMany({
        where: {
          OR: [
            { code: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: { id: true, code: true, name: true, description: true },
        take: 100,
      }),
      prisma.major.findMany({
        where: {
          OR: [
            { code: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: { id: true, code: true, name: true, description: true },
        take: 100,
      }),
    ]);

    // Combine all results with their type
    const allResults = [
      ...concepts.map(c => ({ ...c, type: 'concepts' })),
      ...skills.map(s => ({ ...s, type: 'skills' })),
      ...courses.map(c => ({ ...c, type: 'courses' })),
      ...tracks.map(t => ({ ...t, type: 'tracks' })),
      ...departments.map(d => ({ ...d, type: 'departments' })),
      ...majors.map(m => ({ ...m, type: 'majors' })),
    ];

    // Sort results to prioritize matches at the beginning of words
    const sortedResults = allResults.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aCode = a.code.toLowerCase();
      const bCode = b.code.toLowerCase();
      const searchTerm = term.toLowerCase();
      
      // Prioritize exact matches
      if (aName === searchTerm || aCode === searchTerm) return -1;
      if (bName === searchTerm || bCode === searchTerm) return 1;
      
      // Then prioritize starts with
      const aStartsName = aName.startsWith(searchTerm);
      const bStartsName = bName.startsWith(searchTerm);
      const aStartsCode = aCode.startsWith(searchTerm);
      const bStartsCode = bCode.startsWith(searchTerm);
      
      if ((aStartsName || aStartsCode) && !(bStartsName || bStartsCode)) return -1;
      if (!(aStartsName || aStartsCode) && (bStartsName || bStartsCode)) return 1;
      
      // Then prioritize word boundary matches
      const aWordBoundary = aName.includes(' ' + searchTerm) || aName.includes('-' + searchTerm);
      const bWordBoundary = bName.includes(' ' + searchTerm) || bName.includes('-' + searchTerm);
      
      if (aWordBoundary && !bWordBoundary) return -1;
      if (!aWordBoundary && bWordBoundary) return 1;
      
      // Finally, alphabetical order
      return aName.localeCompare(bName);
    });

    // Limit to 200 results for performance
    const limitedResults = sortedResults.slice(0, 200);

    return NextResponse.json({ 
      results: limitedResults,
      message: limitedResults.length === 0 ? `No results found for "${term}"` : undefined
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Search failed', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
