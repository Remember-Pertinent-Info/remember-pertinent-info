
'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, CircularProgress } from '@mui/material';

// Define interfaces for the data structures
interface Course {
    id: string;
    title: string;
    prerequisites: Prerequisite[];
    minGrade?: string;
}

interface Prerequisite {
    id: string;
    title: string;
    prerequisites: Prerequisite[];
    minGrade?: string;
    isAlternative?: boolean;
}

interface Catalog {
    [key: string]: {
        name: string;
        description: string;
        credits_min?: number;
        credits_max?: number;
    };
}

interface PrereqData {
    [key: string]: any;
}

interface ProcessedCourses {
    [key: string]: Course;
}


interface QuacsVisualizerProps {
  courseId: string;
  open: boolean;
  onClose: () => void;
}

// Helper functions (adapted from index.html)
function processCourses(courses: any[]): ProcessedCourses {
    const courseMap: ProcessedCourses = {};
    courses.forEach(course => {
        courseMap[course.id] = { ...course, prerequisites: [] };
    });
    return courseMap;
}

function buildPrerequisiteTree(
    courseId: string,
    courses: ProcessedCourses,
    catalog: Catalog,
    prereqs: PrereqData,
    path: string[] = []
): Course | null {
    if (path.includes(courseId)) {
        console.warn('Circular dependency detected:', [...path, courseId].join(' -> '));
        return { id: courseId, title: courses[courseId]?.title || 'Unknown Course', prerequisites: [], minGrade: 'Circular' };
    }

    const course = courses[courseId];
    if (!course) return null;

    const newPath = [...path, courseId];
    const coursePrereqs = prereqs[courseId];

    const builtPrerequisites = coursePrereqs
        ? parsePrerequisites(coursePrereqs, courses, catalog, prereqs, newPath)
        : [];

    return {
        ...course,
        title: catalog[courseId]?.name || course.title,
        prerequisites: builtPrerequisites,
    };
}

function parsePrerequisites(
    prereqObject: any,
    courses: ProcessedCourses,
    catalog: Catalog,
    prereqs: PrereqData,
    path: string[]
): Prerequisite[] {
    const results: Prerequisite[] = [];

    if (prereqObject.and) {
        prereqObject.and.forEach((p: any) => {
            results.push(...parsePrerequisites(p, courses, catalog, prereqs, path));
        });
    }

    if (prereqObject.or) {
        const alternatives = prereqObject.or.flatMap((p: any) =>
            parsePrerequisites(p, courses, catalog, prereqs, path)
        );
        alternatives.forEach(alt => {
            alt.isAlternative = true;
        });
        results.push(...alternatives);
    }

    if (prereqObject.course) {
        const tree = buildPrerequisiteTree(prereqObject.course, courses, catalog, prereqs, path);
        if (tree) {
            results.push({ ...tree, minGrade: prereqObject.min_grade || 'C-' });
        }
    }

    return results;
}


export default function QuacsVisualizer({ courseId, open, onClose }: QuacsVisualizerProps) {
  const [treeData, setTreeData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogData, setCatalogData] = useState<Catalog>({});

  useEffect(() => {
    if (open && courseId) {
      loadQuacsData(courseId);
    }
  }, [open, courseId]);

  const loadQuacsData = async (courseId: string) => {
    setLoading(true);
    setError(null);
    setTreeData(null);

    try {
      const semesterResponse = await fetch('https://api.github.com/repos/quacs/quacs-data/contents/semester_data');
      if (!semesterResponse.ok) throw new Error('Failed to fetch semester list from GitHub API');
      const semesters = await semesterResponse.json();
      const latestSemester = semesters
        .filter((item: any) => item.type === 'dir' && /^\d{6}$/.test(item.name))
        .sort((a: any, b: any) => b.name.localeCompare(a.name))[0]?.name;

      if (!latestSemester) throw new Error('No valid semesters found in QUACS data');

      const [coursesRes, catalogRes, prereqsRes] = await Promise.all([
        fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${latestSemester}/courses.json`),
        fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${latestSemester}/catalog.json`),
        fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${latestSemester}/prerequisites.json`)
      ]);

      if (!coursesRes.ok || !catalogRes.ok || !prereqsRes.ok) {
        throw new Error('Failed to fetch one or more QUACS data files.');
      }

      const courses = await coursesRes.json();
      const catalog = await catalogRes.json();
      const prereqs = await prereqsRes.json();

      setCatalogData(catalog);
      const processedCourses = processCourses(courses);
      const tree = buildPrerequisiteTree(courseId, processedCourses, catalog, prereqs);
      setTreeData(tree);

    } catch (err: any) {
      console.error("Error loading QUACS data:", err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Renders the prerequisite tree using a recursive component
  const PrereqTreeNode: React.FC<{ node: Prerequisite; level: number; seenCourses?: Set<string>, parentPath?: string[] }> = ({ node, level, seenCourses = new Set(), parentPath = [] }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const uniqueId = `${node.id.replace(/[^a-zA-Z0-9]/g, '-')}-${level}`;

    const isDuplicate = seenCourses.has(node.id);
    const newSeenCourses = new Set(seenCourses);
    newSeenCourses.add(node.id);
    
    const catalog = catalogData[node.id] || {};
    const credits = catalog.credits_min && catalog.credits_max
        ? (catalog.credits_min === catalog.credits_max
            ? `${catalog.credits_min} cr`
            : `${catalog.credits_min}-${catalog.credits_max} cr`)
        : '';

    const hasPrereqs = node.prerequisites && node.prerequisites.length > 0 && !isDuplicate && level < 4;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const groupPrerequisites = (prerequisites: Prerequisite[]) => {
        return {
            required: prerequisites.filter(p => !p.isAlternative),
            alternatives: prerequisites.filter(p => p.isAlternative)
        };
    };

    const prereqGroups = hasPrereqs ? groupPrerequisites(node.prerequisites) : { required: [], alternatives: [] };

    return (
      <Box sx={{ pl: level > 0 ? 2 : 0, borderLeft: level > 0 ? '1px solid #ddd' : 'none', ml: level > 0 ? 1: 0, pt: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            borderRadius: 1,
            backgroundColor: level === 0 ? 'primary.main' : 'background.paper',
            color: level === 0 ? 'primary.contrastText' : 'text.primary',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: level === 0 ? 'primary.dark' : '#f0f0f0'
            }
          }}
        >
            {hasPrereqs ? (
                <Box onClick={handleToggle} sx={{ cursor: 'pointer', width: 24, textAlign: 'center' }}>
                    {isExpanded ? '▼' : '▶'}
                </Box>
            ) : (
                <Box sx={{ width: 24 }} />
            )}
            <Typography component="span" sx={{ flexGrow: 1 }}>
                <Typography component="strong" sx={{ mr: 1 }}>{node.id}</Typography>
                {node.title}
                {credits && <Typography component="span" sx={{ ml: 1, color: 'text.secondary' }}>({credits})</Typography>}
                {node.minGrade && level > 0 && <Typography component="span" sx={{ ml: 1, fontSize: '0.8rem', color: 'text.secondary' }}>Min: {node.minGrade}</Typography>}
                {isDuplicate && <Typography component="span" sx={{ ml: 1, fontStyle: 'italic', color: 'warning.main' }}>(see above)</Typography>}
                 {level >= 4 && hasPrereqs && <Typography component="span" sx={{ ml: 1, fontStyle: 'italic', color: 'text.secondary' }}>(...)</Typography>}
            </Typography>
        </Box>
        {hasPrereqs && isExpanded && (
            <Box>
                {prereqGroups.required.length > 0 && prereqGroups.required.map((prereq, index) => (
                    <PrereqTreeNode key={`${prereq.id}-${index}`} node={prereq} level={level + 1} seenCourses={newSeenCourses} />
                ))}
                {prereqGroups.alternatives.length > 0 && (
                    <Box sx={{ pl: 2, borderLeft: '1px dashed #ccc', ml:1, mt: 1 }}>
                        <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 1 }}>OR one of:</Typography>
                        {prereqGroups.alternatives.map((prereq, index) => (
                            <PrereqTreeNode key={`alt-${prereq.id}-${index}`} node={prereq} level={level + 1} seenCourses={newSeenCourses} />
                        ))}
                    </Box>
                )}
            </Box>
        )}
      </Box>
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, bgcolor: 'background.paper', margin: 'auto', mt: '5%', width: 'clamp(300px, 90%, 1200px)', maxHeight: '90%', overflowY: 'auto', borderRadius: 2, boxShadow: 24 }}>
        <Typography variant="h5" component="h2">
          Prerequisites for {courseId}
        </Typography>
        {loading && <CircularProgress sx={{ mt: 2 }} />}
        {error && <Typography color="error" sx={{ mt: 2 }}>Error: {error}</Typography>}
        {treeData ? (
            <Box sx={{ mt: 2 }}>
                <PrereqTreeNode node={treeData} level={0} />
            </Box>
        ) : (
            !loading && <Typography sx={{mt: 2, fontStyle: 'italic'}}>No prerequisite information available.</Typography>
        )}
      </Box>
    </Modal>
  );
}
