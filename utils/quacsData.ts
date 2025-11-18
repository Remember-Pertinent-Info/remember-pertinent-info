/**
 * QUACS Data Service
 * Fetches course data from QUACS GitHub repository
 * Implements in-memory caching to avoid rate limits
 * Based on the QUACS data structure from PR #7
 */

interface Course {
  id: string;
  title: string;
  dept?: string;
  [key: string]: any;
}

interface CatalogEntry {
  name: string;
  description: string;
  credits_min?: number;
  credits_max?: number;
}

interface Catalog {
  [courseId: string]: CatalogEntry;
}

interface Prerequisites {
  [courseId: string]: any;
}

interface ProcessedCourses {
  [courseId: string]: Course;
}

interface QuacsData {
  courses: ProcessedCourses;  // Changed from array to object map
  catalog: Catalog;
  prerequisites: Prerequisites;
  semester: string;
  timestamp: number;
}

// In-memory cache
let cachedData: QuacsData | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch the latest semester from QUACS GitHub
 */
async function getLatestSemester(): Promise<string> {
  const response = await fetch('https://api.github.com/repos/quacs/quacs-data/contents/semester_data');
  if (!response.ok) {
    throw new Error('Failed to fetch semester list from GitHub API');
  }

  const semesters = await response.json();
  const latestSemester = semesters
    .filter((item: any) => item.type === 'dir' && /^\d{6}$/.test(item.name))
    .sort((a: any, b: any) => b.name.localeCompare(a.name))[0]?.name;

  if (!latestSemester) {
    throw new Error('No valid semesters found in QUACS data');
  }

  return latestSemester;
}

/**
 * Convert course array (grouped by department) into a flat map by course ID
 * Matches the processCourses function from PR #7
 */
function processCourses(courseArray: any[]): ProcessedCourses {
  const courseMap: ProcessedCourses = {};
  courseArray.forEach(dept => {
    if (dept.courses && Array.isArray(dept.courses)) {
      dept.courses.forEach((course: any) => {
        courseMap[course.id] = {
          ...course,
          dept: dept.code  // Add department code for easy reference
        };
      });
    }
  });
  return courseMap;
}

/**
 * Fetch all QUACS data (courses, catalog, prerequisites)
 */
async function fetchQuacsData(): Promise<QuacsData> {
  const semester = await getLatestSemester();

  const [coursesRes, catalogRes, prereqsRes] = await Promise.all([
    fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${semester}/courses.json`),
    fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${semester}/catalog.json`),
    fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${semester}/prerequisites.json`)
  ]);

  if (!coursesRes.ok || !catalogRes.ok || !prereqsRes.ok) {
    throw new Error('Failed to fetch one or more QUACS data files');
  }

  const [coursesArray, catalog, prerequisites] = await Promise.all([
    coursesRes.json(),
    catalogRes.json(),
    prereqsRes.json()
  ]);

  // Process courses array into map
  const courses = processCourses(coursesArray);

  return {
    courses,
    catalog,
    prerequisites,
    semester,
    timestamp: Date.now()
  };
}

/**
 * Get QUACS data with caching
 */
export async function getQuacsData(): Promise<QuacsData> {
  // Return cached data if still valid
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    return cachedData;
  }

  // Fetch fresh data
  cachedData = await fetchQuacsData();
  return cachedData;
}

/**
 * Get all courses as an object map
 */
export async function getCourses(): Promise<ProcessedCourses> {
  const data = await getQuacsData();
  return data.courses;
}

/**
 * Get catalog
 */
export async function getCatalog(): Promise<Catalog> {
  const data = await getQuacsData();
  return data.catalog;
}

/**
 * Get prerequisites
 */
export async function getPrerequisites(): Promise<Prerequisites> {
  const data = await getQuacsData();
  return data.prerequisites;
}

/**
 * Search courses by query string
 * Uses three-bucket approach from PR #7: ID matches, name matches, description matches
 * Prioritizes results in that order for better UX
 */
export async function searchCourses(query: string): Promise<Array<{
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: 'courses';
}>> {
  const data = await getQuacsData();
  const { courses, catalog } = data;

  const q = (query || '').toLowerCase().trim();

  // Three-bucket approach: collect matches into Maps to preserve order and uniqueness
  const idMatches = new Map<string, Course>();
  const nameMatches = new Map<string, Course>();
  const descMatches = new Map<string, Course>();

  Object.entries(courses).forEach(([id, course]) => {
    const catalogEntry = catalog[id] || {};
    const idLower = (id || '').toLowerCase();
    const nameLower = (catalogEntry.name || '').toLowerCase();
    const descLower = (catalogEntry.description || '').toLowerCase();

    if (!q) {
      // Empty query: treat as "show all" but still prioritized
      idMatches.set(id, course);
      return;
    }

    // Bucket by match type (ID takes priority over name over description)
    if (idLower.includes(q)) {
      idMatches.set(id, course);
    } else if (nameLower.includes(q)) {
      nameMatches.set(id, course);
    } else if (descLower.includes(q)) {
      descMatches.set(id, course);
    }
  });

  // Merge results: ID matches first, then name matches, then description matches
  // Limit to 200 total results
  const merged: Array<{ id: string; course: Course }> = [];

  for (const bucket of [idMatches, nameMatches, descMatches]) {
    for (const [id, course] of bucket.entries()) {
      if (merged.length >= 200) break;
      merged.push({ id, course });
    }
    if (merged.length >= 200) break;
  }

  // Convert to SearchResult format
  return merged.map(({ id, course }) => ({
    id: id,
    code: id,
    name: catalog[id]?.name || course.title || id,
    description: catalog[id]?.description || null,
    type: 'courses' as const
  }));
}

/**
 * Clear the cache (useful for testing or forcing refresh)
 */
export function clearCache(): void {
  cachedData = null;
}
