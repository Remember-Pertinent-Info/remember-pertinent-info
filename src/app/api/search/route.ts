import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/search?q=term
 * Searches Concept table for exact (case-insensitive) matches on code, name, or description
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  if (!q.trim()) {
    // Return a default list when no query provided (e.g., initial page load)
    try {
      const all = await prisma.concept.findMany({
        select: { id: true, code: true, name: true, description: true },
        orderBy: { name: 'asc' },
        take: 100,
      });
      return NextResponse.json({ results: all, message: 'Showing all items' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Default list fetch failed', e);
      return NextResponse.json({ results: [] });
    }
  }

  const term = q.trim();

  try {
    // Hybrid search strategy
    // 1) Exact case-insensitive matches on code, name, description
    // 2) Postgres full-text search (if available) against combined fields, ranked
    // 3) Trigram similarity fallback (pg_trgm) for typo tolerance

    // 1) Exact matches
    const exact = await prisma.concept.findMany({
      where: {
        OR: [
          { code: { equals: term, mode: 'insensitive' } },
          { name: { equals: term, mode: 'insensitive' } },
          { description: { equals: term, mode: 'insensitive' } },
        ],
      },
      select: { id: true, code: true, name: true, description: true },
      take: 100,
    });

    // Use a map to deduplicate results by id
    const resultsMap: Record<string, { id: string; code: string; name: string; description?: string | null }> = {};
    exact.forEach((r) => {
      resultsMap[r.id] = r;
    });

    // If we already have enough results, return them
    if (Object.keys(resultsMap).length >= 100) {
      return NextResponse.json({ results: Object.values(resultsMap).slice(0, 100) });
    }

    // 2) Full-text search using a raw query
    // We'll attempt to run a raw SQL query that uses to_tsvector over name || ' ' || description || ' ' || code
    // and ranks using ts_rank. If the DB doesn't have the text search configuration, this will still work
    // on standard Postgres installations.
    try {
      const ftsQuery = `
        SELECT id, code, name, description
        FROM "Concept"
        WHERE to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(code,'')) @@ plainto_tsquery('english', $1)
        ORDER BY ts_rank(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(code,'')), plainto_tsquery('english', $1)) DESC
        LIMIT $2
      `;

      const fts = await prisma.$queryRawUnsafe(ftsQuery, term, 100);
      // fts is an array of rows; normalize and add to results map
      if (Array.isArray(fts)) {
        (fts as any[]).forEach((r) => {
          if (r && r.id && !resultsMap[r.id]) {
            resultsMap[r.id] = { id: String(r.id), code: r.code, name: r.name, description: r.description };
          }
        });
      }
    } catch (ftsErr) {
      // If FTS fails for any reason, log and continue to trigram fallback
      // eslint-disable-next-line no-console
      console.warn('FTS query failed, skipping full-text stage', ftsErr);
    }

    // If we have enough results after FTS, return them
    if (Object.keys(resultsMap).length >= 100) {
      return NextResponse.json({ results: Object.values(resultsMap).slice(0, 100) });
    }

    // 3) Trigram similarity fallback using pg_trgm functions
    // Only run if the extension is available; check pg_extension first to avoid undefined function errors
    let trigramUnavailable = false;
    try {
      const extCheck = await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'`;
      const hasPgTrgm = Array.isArray(extCheck) && (extCheck as any[]).length > 0;
      if (!hasPgTrgm) {
        trigramUnavailable = true;
        // eslint-disable-next-line no-console
        console.warn('pg_trgm extension not installed; skipping trigram stage');
      } else {
        const trigramQuery = `
          SELECT id, code, name, description,
            GREATEST(similarity(coalesce(name,''), $1), similarity(coalesce(code,''), $1), similarity(coalesce(description,''), $1)) AS sim
          FROM "Concept"
          WHERE similarity(coalesce(name,''), $1) > 0.1 OR similarity(coalesce(code,''), $1) > 0.1 OR similarity(coalesce(description,''), $1) > 0.1
          ORDER BY sim DESC
          LIMIT $2
        `;

        const trigram = await prisma.$queryRawUnsafe(trigramQuery, term, 100);
        if (Array.isArray(trigram)) {
          (trigram as any[]).forEach((r) => {
            if (r && r.id && !resultsMap[r.id]) {
              resultsMap[r.id] = { id: String(r.id), code: r.code, name: r.name, description: r.description };
            }
          });
        }
      }
    } catch (trErr: any) {
      trigramUnavailable = true;
      // eslint-disable-next-line no-console
      console.warn('Trigram similarity stage failed, skipping trigram stage', trErr?.message ?? trErr);
    }

    const final = Object.values(resultsMap).slice(0, 100);
    const payload: any = { results: final };
    if (trigramUnavailable) {
      payload.warning = 'pg_trgm extension or similarity() function not available on the database; trigram fallback skipped';
    }
    if (final.length === 0) {
      payload.message = `No results found for "${term}"`;
    }
    return NextResponse.json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Search failed', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
