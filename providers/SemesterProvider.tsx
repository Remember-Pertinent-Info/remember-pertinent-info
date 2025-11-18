'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SemesterContextType {
  currentSemester: string;
  setSemester: (semester: string) => void;
  availableSemesters: Array<{ code: string; name: string }>;
  loading: boolean;
}

const SemesterContext = createContext<SemesterContextType | undefined>(undefined);

export function useSemester() {
  const context = useContext(SemesterContext);
  if (!context) {
    throw new Error('useSemester must be used within SemesterProvider');
  }
  return context;
}

/**
 * Format semester code into readable name
 * @param code - Semester code (e.g., "202501")
 * @returns Formatted name (e.g., "Spring 2025")
 */
function formatSemesterName(code: string): string {
  const year = code.substring(0, 4);
  const term = code.substring(4, 6);

  const termNames: { [key: string]: string } = {
    '01': 'Spring',
    '05': 'Summer',
    '09': 'Fall',
    '12': 'Winter'
  };

  return `${termNames[term] || 'Unknown'} ${year}`;
}

export function SemesterProvider({ children }: { children: ReactNode }) {
  const [currentSemester, setCurrentSemester] = useState<string>('');
  const [availableSemesters, setAvailableSemesters] = useState<Array<{ code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSemesters();
  }, []);

  async function loadSemesters() {
    try {
      const response = await fetch('https://api.github.com/repos/quacs/quacs-data/contents/semester_data');
      if (!response.ok) throw new Error('Failed to fetch semester list');

      const folders = await response.json();

      const semesters = folders
        .filter((item: any) => item.type === 'dir' && /^\d{6}$/.test(item.name))
        .map((item: any) => ({
          code: item.name,
          name: formatSemesterName(item.name)
        }))
        .sort((a: any, b: any) => b.code.localeCompare(a.code)); // Newest first

      setAvailableSemesters(semesters);

      // Load saved semester from localStorage or use most recent
      const saved = localStorage.getItem('selectedSemester');
      const initial = saved && semesters.find((s: any) => s.code === saved)
        ? saved
        : semesters[0]?.code;

      if (initial) {
        setCurrentSemester(initial);
      }
    } catch (error) {
      console.error('Error loading semesters:', error);
      // Fallback to hardcoded semesters
      const fallback = [
        { code: '202501', name: 'Spring 2025' },
        { code: '202409', name: 'Fall 2024' }
      ];
      setAvailableSemesters(fallback);
      setCurrentSemester(fallback[0].code);
    } finally {
      setLoading(false);
    }
  }

  function setSemester(semester: string) {
    setCurrentSemester(semester);
    localStorage.setItem('selectedSemester', semester);
  }

  return (
    <SemesterContext.Provider value={{ currentSemester, setSemester, availableSemesters, loading }}>
      {children}
    </SemesterContext.Provider>
  );
}
