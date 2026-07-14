import { PROJECT_STORAGE_KEY, TEAM_STORAGE_KEY } from '../data/mockData';

/** Bump when seed data or schema changes — clears persisted team/project state once. */
export const DATA_STORE_VERSION = 2;
const DATA_VERSION_KEY = 'pap_data_version';

export function ensureFreshDataStore(): void {
  const stored = Number(localStorage.getItem(DATA_VERSION_KEY) ?? 0);
  if (stored >= DATA_STORE_VERSION) return;
  localStorage.removeItem(TEAM_STORAGE_KEY);
  localStorage.removeItem(PROJECT_STORAGE_KEY);
  localStorage.setItem(DATA_VERSION_KEY, String(DATA_STORE_VERSION));
}
