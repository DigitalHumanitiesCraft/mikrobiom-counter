import { db } from '../data/db';
import { getISOWeekKey } from '../lib/weekUtils';
import { getSettingsStore } from './settingsStore.svelte';
import type { PlantEntry, WeekSummary } from '../data/types';

let currentWeekKey = $state(getISOWeekKey());
let entries = $state<PlantEntry[]>([]);
const { settings } = getSettingsStore();

// Re-check week key when app becomes visible (handles Monday midnight crossover)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const newKey = getISOWeekKey();
      if (newKey !== currentWeekKey) {
        currentWeekKey = newKey;
        loadEntries(currentWeekKey);
      }
    }
  });
}

async function loadEntries(weekKey: string) {
  entries = await db.entries.where('weekKey').equals(weekKey).sortBy('timestamp');
}

function getSummary(): WeekSummary {
  const seen = new Set<string>();
  for (const e of entries) {
    seen.add(e.plantId);
  }
  return {
    weekKey: currentWeekKey,
    uniquePlants: [...seen],
    count: seen.size,
    goal: settings.weeklyGoal,
    entries,
  };
}

export function getWeekStore() {
  // Load on first access
  loadEntries(currentWeekKey);

  return {
    get weekKey() { return currentWeekKey; },
    get entries() { return entries; },
    get summary(): WeekSummary { return getSummary(); },

    async addEntry(plantId: string, plantName: string, source: 'voice' | 'manual'): Promise<'added' | 'duplicate'> {
      const isDuplicate = entries.some(e => e.plantId === plantId);
      if (isDuplicate) return 'duplicate';

      await db.entries.add({
        plantId,
        plantName,
        weekKey: currentWeekKey,
        timestamp: Date.now(),
        source,
      });
      await loadEntries(currentWeekKey);
      return 'added';
    },

    async removeEntry(id: number) {
      await db.entries.delete(id);
      await loadEntries(currentWeekKey);
    },

    async refresh() {
      await loadEntries(currentWeekKey);
    },
  };
}
