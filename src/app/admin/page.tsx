'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, List, ListItemText, Divider, Button, Chip, Stack, ListItemButton } from '@mui/material';

type Entity = { id: string; code: string; name: string };

type DepartmentDetail = {
  id: string;
  code: string;
  name: string;
  majors: Entity[];
} | null;

type MajorDetail = {
  id: string;
  code: string;
  name: string;
  department: Entity | null;
  courses: Entity[];
  tracks: Entity[];
} | null;

type TrackDetail = {
  id: string;
  code: string;
  name: string;
  courses: Entity[];
  majors: Entity[];
} | null;

type LinkPayload = {
  action: 'add' | 'remove';
  relation: 'department:major' | 'major:course' | 'major:track' | 'track:course';
  fromId: string;
  toId: string;
};

export default function AdminPage() {
  const [departments, setDepartments] = useState<Entity[]>([]);
  const [majors, setMajors] = useState<Entity[]>([]);
  const [tracks, setTracks] = useState<Entity[]>([]);
  const [courses, setCourses] = useState<Entity[]>([]);

  const [selectedDept, setSelectedDept] = useState<Entity | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<Entity | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Entity | null>(null);

  const [majorDetail, setMajorDetail] = useState<MajorDetail>(null);
  const [deptDetail, setDeptDetail] = useState<DepartmentDetail>(null);
  const [trackDetail, setTrackDetail] = useState<TrackDetail>(null);

  const loadEntities = async () => {
    const res = await fetch('/api/admin/entities', { cache: 'no-store' });
    const json = await res.json();
    setDepartments(json.departments);
    setMajors(json.majors);
    setTracks(json.tracks);
    setCourses(json.courses);
  };

  const loadDetail = async (type: 'department' | 'major' | 'track', id: string) => {
    const res = await fetch(`/api/admin/detail?type=${type}&id=${id}`, { cache: 'no-store' });
    const json = await res.json();
    if (type === 'department') setDeptDetail(json);
    if (type === 'major') setMajorDetail(json);
    if (type === 'track') setTrackDetail(json);
  };

  useEffect(() => { void loadEntities(); }, []);

  useEffect(() => { if (selectedDept) void loadDetail('department', selectedDept.id); }, [selectedDept]);
  useEffect(() => { if (selectedMajor) void loadDetail('major', selectedMajor.id); }, [selectedMajor]);
  useEffect(() => { if (selectedTrack) void loadDetail('track', selectedTrack.id); }, [selectedTrack]);

  const notIn = (all: Entity[], inList: Entity[] | undefined) => {
    const set = new Set((inList ?? []).map(e => e.id));
    return all.filter(e => !set.has(e.id));
  };

  const postLink = async (payload: LinkPayload) => {
    await fetch('/api/admin/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    // refresh details
    if (selectedDept) void loadDetail('department', selectedDept.id);
    if (selectedMajor) void loadDetail('major', selectedMajor.id);
    if (selectedTrack) void loadDetail('track', selectedTrack.id);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Admin — Relationships</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 280px', minWidth: 260 }}>
          <Paper variant="outlined" sx={{ p: 2, background: 'transparent' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Departments</Typography>
            <List dense>
              {departments.map(d => (
                <ListItemButton key={d.id} selected={selectedDept?.id === d.id} onClick={() => setSelectedDept(d)}>
                  <ListItemText primary={d.name} secondary={d.code} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 280px', minWidth: 260 }}>
          <Paper variant="outlined" sx={{ p: 2, background: 'transparent' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Majors</Typography>
            <List dense>
              {majors.map(m => (
                <ListItemButton key={m.id} selected={selectedMajor?.id === m.id} onClick={() => setSelectedMajor(m)}>
                  <ListItemText primary={m.name} secondary={m.code} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 280px', minWidth: 260 }}>
          <Paper variant="outlined" sx={{ p: 2, background: 'transparent' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Tracks</Typography>
            <List dense>
              {tracks.map(t => (
                <ListItemButton key={t.id} selected={selectedTrack?.id === t.id} onClick={() => setSelectedTrack(t)}>
                  <ListItemText primary={t.name} secondary={t.code} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Department → Majors */}
      {selectedDept && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, background: 'transparent' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Department: {selectedDept.name}</Typography>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Majors in this Department</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(deptDetail?.majors ?? []).map((m: Entity) => (
              <Chip key={m.id} label={m.name} onDelete={() => postLink({ action: 'remove', relation: 'department:major', fromId: selectedDept.id, toId: m.id })} />
            ))}
          </Stack>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Add Major</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {notIn(majors, deptDetail?.majors).map(m => (
              <Button key={m.id} variant="outlined" size="small" onClick={() => postLink({ action: 'add', relation: 'department:major', fromId: selectedDept.id, toId: m.id })}>{m.name}</Button>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Major → Courses/Tracks and Major → Department */}
      {selectedMajor && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, background: 'transparent' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Major: {selectedMajor.name}</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>Department: {majorDetail?.department?.name ?? '—'}</Typography>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Courses in this Major</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(majorDetail?.courses ?? []).map((c: Entity) => (
              <Chip key={c.id} label={c.name} onDelete={() => postLink({ action: 'remove', relation: 'major:course', fromId: selectedMajor.id, toId: c.id })} />
            ))}
          </Stack>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Add Course</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {notIn(courses, majorDetail?.courses).map(c => (
              <Button key={c.id} variant="outlined" size="small" onClick={() => postLink({ action: 'add', relation: 'major:course', fromId: selectedMajor.id, toId: c.id })}>{c.name}</Button>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Tracks available in this Major</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(majorDetail?.tracks ?? []).map((t: Entity) => (
              <Chip key={t.id} label={t.name} onDelete={() => postLink({ action: 'remove', relation: 'major:track', fromId: selectedMajor.id, toId: t.id })} />
            ))}
          </Stack>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Add Track</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {notIn(tracks, majorDetail?.tracks).map(t => (
              <Button key={t.id} variant="outlined" size="small" onClick={() => postLink({ action: 'add', relation: 'major:track', fromId: selectedMajor.id, toId: t.id })}>{t.name}</Button>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Track → Courses */}
      {selectedTrack && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, background: 'transparent' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Track: {selectedTrack.name}</Typography>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Courses in this Track</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(trackDetail?.courses ?? []).map((c: Entity) => (
              <Chip key={c.id} label={c.name} onDelete={() => postLink({ action: 'remove', relation: 'track:course', fromId: selectedTrack.id, toId: c.id })} />
            ))}
          </Stack>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Add Course</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {notIn(courses, trackDetail?.courses).map(c => (
              <Button key={c.id} variant="outlined" size="small" onClick={() => postLink({ action: 'add', relation: 'track:course', fromId: selectedTrack.id, toId: c.id })}>{c.name}</Button>
            ))}
          </Stack>
        </Paper>
      )}
    </Container>
  );
}
