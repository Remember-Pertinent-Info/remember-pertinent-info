export type CategoryKey = 'concepts' | 'skills' | 'courses' | 'tracks' | 'departments' | 'majors';

export const categoryColors: Record<CategoryKey, { vibrant: string; pastel: string }> = {
  concepts: { vibrant: '#e53935', pastel: '#ffcdd2' },
  skills: { vibrant: '#ff8c00ff', pastel: '#fde9b3ff' },
  courses: { vibrant: '#43a047', pastel: '#c8e6c9' },
  tracks: { vibrant: '#1e88e5', pastel: '#bbdefb' },
  departments: { vibrant: 'rgba(118, 138, 255, 1)', pastel: '#c5cae9' },
  majors: { vibrant: '#b342d3ff', pastel: '#e1bee7' },
};

export const getCategoryColors = (key: CategoryKey) => categoryColors[key];
