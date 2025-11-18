
import { NextResponse } from 'next/server';

// A simple in-memory cache to store QUACS data to avoid re-fetching on every search.
// Cache is per-semester to handle semester switching
const cache = new Map<string, {
  data: any | null;
  timestamp: number;
}>();
const TTL = 1000 * 60 * 60; // 1 hour

async function getQuacsData(semester?: string) {
    const now = Date.now();

    // If no semester specified, get the latest one
    let targetSemester = semester;
    if (!targetSemester) {
        const semesterResponse = await fetch('https://api.github.com/repos/quacs/quacs-data/contents/semester_data');
        if (!semesterResponse.ok) throw new Error('Failed to fetch semester list from GitHub API');
        const semesters = await semesterResponse.json();
        targetSemester = semesters
            .filter((item: any) => item.type === 'dir' && /^\d{6}$/.test(item.name))
            .sort((a: any, b: any) => b.name.localeCompare(a.name))[0]?.name;

        if (!targetSemester) throw new Error('No valid semesters found in QUACS data');
    }

    // Check cache for this semester
    const cached = cache.get(targetSemester);
    if (cached && (now - cached.timestamp < TTL)) {
        return cached.data;
    }

    try {

        const [coursesRes, catalogRes] = await Promise.all([
            fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${targetSemester}/courses.json`),
            fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${targetSemester}/catalog.json`),
        ]);

        if (!coursesRes.ok || !catalogRes.ok) {
            throw new Error('Failed to fetch one or more QUACS data files.');
        }

        const coursesArray = await coursesRes.json();
        const catalog = await catalogRes.json();

        // QUACS courses.json is an array of departments, each with a courses array
        // We need to flatten it first (like PR #7 processCourses function)
        const allCoursesList: any[] = [];
        coursesArray.forEach((dept: any) => {
            if (dept.courses && Array.isArray(dept.courses)) {
                dept.courses.forEach((course: any) => {
                    const catalogInfo = catalog[course.id];
                    const name = catalogInfo?.name || course.title || course.id;

                    // Only include courses with valid names (filter out blank/empty courses)
                    if (name && name.trim()) {
                        allCoursesList.push({
                            id: course.id,
                            code: course.id,
                            name: name,
                            description: catalogInfo?.description || null,
                            type: 'courses'
                        });
                    }
                });
            }
        });

        const combinedData = allCoursesList;

        cache.set(targetSemester, {
            data: combinedData,
            timestamp: now
        });

        return combinedData;

    } catch (error) {
        console.error("Failed to fetch QUACS data:", error);
        // If fetching fails, return stale cache data if available, otherwise throw
        const cached = cache.get(targetSemester);
        if (cached) {
            return cached.data;
        }
        throw error;
    }
}


/**
 * GET /api/search?q=term&semester=202501
 * Searches all entity tables for substring matches on code, name, or description
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const semester = url.searchParams.get('semester') || undefined;

  try {
    const allCourses = await getQuacsData(semester);

    if (!q) {
      // Return a default list of the first 200 courses if no query
      return NextResponse.json({
          results: allCourses.slice(0, 200),
          message: 'Showing a list of available courses.'
      });
    }

    // Three-bucket search logic from index.html
    // Prioritize: ID matches → Name matches → Description matches
    const idMatches: any[] = [];
    const nameMatches: any[] = [];
    const descMatches: any[] = [];

    allCourses.forEach((course: any) => {
      const courseId = (course.code || '').toLowerCase();
      const courseName = (course.name || '').toLowerCase();
      const courseDesc = (course.description || '').toLowerCase();

      // Bucket 1: Exact or starts-with match on course ID
      if (courseId === q || courseId.startsWith(q)) {
        idMatches.push(course);
      }
      // Bucket 2: Match in course name
      else if (courseName.includes(q)) {
        nameMatches.push(course);
      }
      // Bucket 3: Match in description
      else if (courseDesc.includes(q)) {
        descMatches.push(course);
      }
    });

    // Combine buckets in priority order
    const sortedResults = [...idMatches, ...nameMatches, ...descMatches];
    const limitedResults = sortedResults.slice(0, 200);

    return NextResponse.json({ 
      results: limitedResults,
      message: limitedResults.length === 0 ? `No results found for "${q}"` : undefined
    });

  } catch (err) {
    console.error('Search failed', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
