export type CourseProgress = {
  completedModules: string[];
};

const STORAGE_KEY = 'esc4sdg_progress_v1';

function safeParse(json: string | null) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCourseProgress(courseSlug: string): CourseProgress {
  if (typeof window === 'undefined') return { completedModules: [] };
  const raw = safeParse(window.localStorage.getItem(STORAGE_KEY));
  const course = raw?.[courseSlug];
  const completedModules = Array.isArray(course?.completedModules)
    ? course.completedModules.filter((x: unknown) => typeof x === 'string')
    : [];
  return { completedModules };
}

export function setCourseProgress(courseSlug: string, progress: CourseProgress) {
  if (typeof window === 'undefined') return;
  const raw = safeParse(window.localStorage.getItem(STORAGE_KEY)) ?? {};
  const next = {
    ...raw,
    [courseSlug]: {
      completedModules: Array.from(new Set(progress.completedModules))
    }
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function markModuleCompleted(courseSlug: string, moduleSlug: string) {
  const p = getCourseProgress(courseSlug);
  setCourseProgress(courseSlug, {
    completedModules: Array.from(new Set([...p.completedModules, moduleSlug]))
  });
}

export function resetCourseProgress(courseSlug: string) {
  setCourseProgress(courseSlug, { completedModules: [] });
}

