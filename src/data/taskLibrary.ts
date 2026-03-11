import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import { Theme } from '../types';
import { DEFAULT_THEMES } from './defaultThemes';

const TASK_LIBRARY_KEY = 'couple-flying-chess-task-library';

function normalizeTheme(theme: Theme): Theme {
  return {
    id: theme.id,
    name: theme.name,
    desc: theme.desc,
    audience: 'common',
    tasks: Array.isArray(theme.tasks)
      ? theme.tasks.map(task => String(task).trim()).filter(Boolean)
      : []
  };
}

export function getTaskLibrary(): Theme[] {
  const stored = loadFromStorage<Theme[] | null>(TASK_LIBRARY_KEY, null);
  const source = stored && stored.length > 0 ? stored : DEFAULT_THEMES;

  const merged = [...DEFAULT_THEMES, ...source].reduce<Theme[]>((acc, item) => {
    const theme = normalizeTheme(item);
    const existingIndex = acc.findIndex(x => x.id === theme.id);
    if (existingIndex >= 0) acc[existingIndex] = theme;
    else acc.push(theme);
    return acc;
  }, []);

  return merged.filter(theme => theme.id === 'surprise' || theme.id === 'trap');
}

export function saveTaskLibrary(themes: Theme[]) {
  const cleaned = themes.map(normalizeTheme).filter(theme => theme.id === 'surprise' || theme.id === 'trap');
  saveToStorage(TASK_LIBRARY_KEY, cleaned);
}
