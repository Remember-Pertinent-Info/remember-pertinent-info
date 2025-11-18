'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Tabs, Tab, Button, TextField } from '@mui/material';
import { SearchResult } from '@/components/SearchResults';
import { useSemester } from '@/providers/SemesterProvider';

interface CourseDetailProps {
  course: SearchResult;
}

// Copy interfaces from QuacsVisualizer
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

// Helper functions from QuacsVisualizer
// QUACS courses.json is an array of departments, each with a courses array
function processCourses(coursesArray: any[]): ProcessedCourses {
    const courseMap: ProcessedCourses = {};
    coursesArray.forEach(dept => {
        if (dept.courses && Array.isArray(dept.courses)) {
            dept.courses.forEach((course: any) => {
                courseMap[course.id] = {
                    ...course,
                    prerequisites: [],
                    dept: dept.code
                };
            });
        }
    });
    return courseMap;
}

function buildPrerequisiteTree(
    courseId: string,
    courses: ProcessedCourses,
    catalog: Catalog,
    prereqsByCRN: PrereqData,
    depth: number = 0,
    visited: Set<string> = new Set()
): Course | null {
    // Prevent infinite recursion
    if (depth > 5 || visited.has(courseId)) {
        return null;
    }
    visited.add(courseId);

    const course = courses[courseId];
    if (!course) return null;

    const node: Course = {
        id: courseId,
        title: catalog[courseId]?.name || courseId,
        prerequisites: [],
    };

    // Find prerequisites from first section's CRN
    const section = course.sections && course.sections[0];
    if (section && section.crn) {
        const prereqData = prereqsByCRN[section.crn];
        if (prereqData && prereqData.prerequisites) {
            node.prerequisites = parsePrerequisites(
                prereqData.prerequisites,
                courses,
                catalog,
                prereqsByCRN,
                depth + 1,
                new Set(visited)
            );
        }
    }

    return node;
}

function parsePrerequisites(
    prereqData: any,
    courses: ProcessedCourses,
    catalog: Catalog,
    prereqsByCRN: PrereqData,
    depth: number,
    visited: Set<string>
): Prerequisite[] {
    if (!prereqData || typeof prereqData !== 'object') return [];

    const prereqs: Prerequisite[] = [];

    // Handle direct course prerequisite (e.g., "MATH 1010")
    if (prereqData.type === 'course' && prereqData.course) {
        const parts = prereqData.course.split(' ');
        if (parts.length >= 2) {
            const courseId = `${parts[0]}-${parts[1]}`;
            const subtree = buildPrerequisiteTree(courseId, courses, catalog, prereqsByCRN, depth, new Set(visited));
            if (subtree) {
                prereqs.push({
                    ...subtree,
                    minGrade: prereqData.min_grade || 'D',
                });
            }
        }
    }

    // Handle nested prerequisites (AND/OR groups)
    if (prereqData.nested && Array.isArray(prereqData.nested)) {
        const isOr = prereqData.type === 'or';
        prereqData.nested.forEach((item: any) => {
            const subPrereqs = parsePrerequisites(item, courses, catalog, prereqsByCRN, depth, visited);
            subPrereqs.forEach(p => {
                p.isAlternative = isOr;
                prereqs.push(p);
            });
        });
    }

    return prereqs;
}

/**
 * Detail component for Course entities with prerequisites and uploads
 */
const CourseDetail: React.FC<CourseDetailProps> = ({ course }) => {
  const { currentSemester } = useSemester();
  const [tabValue, setTabValue] = useState(0);
  const [treeData, setTreeData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogData, setCatalogData] = useState<Catalog>({});

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Load prerequisite data on mount and when semester changes
  useEffect(() => {
    if (currentSemester) {
      loadQuacsData(course.code, currentSemester);
    }
  }, [course.code, currentSemester]);

  const loadQuacsData = async (courseId: string, semester: string) => {
    setLoading(true);
    setError(null);
    setTreeData(null);

    try {
      const [coursesRes, catalogRes, prereqsRes] = await Promise.all([
        fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${semester}/courses.json`),
        fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${semester}/catalog.json`),
        fetch(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${semester}/prerequisites.json`)
      ]);

      if (!coursesRes.ok || !catalogRes.ok || !prereqsRes.ok) {
        throw new Error('Failed to fetch one or more QUACS data files.');
      }

      const coursesArray = await coursesRes.json();
      const catalog = await catalogRes.json();
      const prereqsByCRN = await prereqsRes.json();

      setCatalogData(catalog);
      const processedCourses = processCourses(coursesArray);
      const tree = buildPrerequisiteTree(courseId, processedCourses, catalog, prereqsByCRN);
      setTreeData(tree);

    } catch (err: any) {
      console.error("Error loading QUACS data:", err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle) {
      alert('Please provide a title and select a file');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);
      formData.append('courseId', course.code);
      formData.append('resourceType', 'document');

      const response = await fetch('/api/resources', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadSuccess(true);
      setSelectedFile(null);
      setUploadTitle('');
      setUploadDescription('');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Recursive tree node component
  const PrereqTreeNode: React.FC<{ node: Prerequisite; level: number; seenCourses?: Set<string> }> = ({ node, level, seenCourses = new Set() }) => {
    const [isExpanded, setIsExpanded] = useState(true);

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
    <Box>
      {course.description && (
        <Typography variant="body1" sx={{ mb: 2, mt: 0, color: '#ffffff', fontSize: '1.1rem', lineHeight: 1.6 }}>
          {course.description}
        </Typography>
      )}

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab label="Prerequisites" />
        <Tab label="Upload Resources" />
      </Tabs>

      {/* Prerequisites Tab */}
      {tabValue === 0 && (
        <Box>
          {loading && <CircularProgress sx={{ mt: 2 }} />}
          {error && <Typography color="error" sx={{ mt: 2 }}>Error: {error}</Typography>}
          {treeData ? (
            <Box sx={{ mt: 2 }}>
              <PrereqTreeNode node={treeData} level={0} />
            </Box>
          ) : (
            !loading && <Typography sx={{mt: 2, fontStyle: 'italic'}}>No prerequisite information available for this course.</Typography>
          )}
        </Box>
      )}

      {/* Upload Tab */}
      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload study materials, notes, or other resources for this course.
          </Typography>

          <TextField
            fullWidth
            label="Resource Title"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Description (optional)"
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <Button
            variant="outlined"
            component="label"
            sx={{ mb: 2 }}
          >
            Choose File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </Button>

          {selectedFile && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || !uploadTitle || uploading}
            fullWidth
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>

          {uploadSuccess && (
            <Typography color="success.main" sx={{ mt: 2 }}>
              Upload successful!
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CourseDetail;
