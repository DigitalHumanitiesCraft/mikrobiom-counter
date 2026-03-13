<script lang="ts">
  import { CATEGORY_LABELS, type PlantCategory, type PlantEntry } from '../data/types';
  import { PLANTS } from '../data/plants';
  import { formatWeekLabel, getWeekRange, getISOWeekKey } from '../lib/weekUtils';
  import { db } from '../data/db';

  interface Props {
    weekKey: string;
    entries: PlantEntry[];
    onremove: (id: number) => void;
  }

  let { weekKey, entries, onremove }: Props = $props();

  let viewedWeekKey = $state('');
  let historicalEntries = $state<PlantEntry[]>([]);

  // Initialize viewedWeekKey from prop
  $effect(() => {
    if (!viewedWeekKey) viewedWeekKey = weekKey;
  });

  let isCurrentWeek = $derived(viewedWeekKey === weekKey);

  // Active entries: use prop for current week, Dexie for historical
  let activeEntries = $derived(isCurrentWeek ? entries : historicalEntries);

  async function loadWeek(wk: string) {
    if (wk === weekKey) {
      historicalEntries = [];
    } else {
      historicalEntries = await db.entries.where('weekKey').equals(wk).sortBy('timestamp');
    }
  }

  function navigate(direction: -1 | 1) {
    const { start } = getWeekRange(viewedWeekKey);
    const shifted = new Date(start);
    shifted.setUTCDate(start.getUTCDate() + direction * 7);
    viewedWeekKey = getISOWeekKey(shifted);
    loadWeek(viewedWeekKey);
  }

  let canGoNext = $derived(viewedWeekKey < weekKey);

  // Group unique plants by category
  const CATEGORY_ORDER: PlantCategory[] = [
    'gemuese', 'obst', 'pilze', 'nuesse', 'samen',
    'huelsenfruechte', 'getreide', 'kraeuter', 'gewuerze', 'genuss'
  ];

  let grouped = $derived.by(() => {
    const seen = new Map<string, PlantEntry>();
    for (const e of activeEntries) {
      if (!seen.has(e.plantId)) seen.set(e.plantId, e);
    }

    const groups = new Map<PlantCategory, { name: string; entry: PlantEntry }[]>();
    for (const [plantId, entry] of seen) {
      const plant = PLANTS.find(p => p.id === plantId);
      const cat: PlantCategory = plant?.category ?? 'gemuese';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push({ name: entry.plantName, entry });
    }

    return CATEGORY_ORDER
      .filter(cat => groups.has(cat))
      .map(cat => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        plants: groups.get(cat)!.sort((a, b) => a.name.localeCompare(b.name, 'de')),
      }));
  });

  let uniqueCount = $derived.by(() => {
    const seen = new Set<string>();
    for (const e of activeEntries) seen.add(e.plantId);
    return seen.size;
  });
</script>

<div class="list-view">
  <div class="week-nav">
    <button class="nav-btn" aria-label="Vorherige Woche" onclick={() => navigate(-1)}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
    <div class="week-title">
      <h2>{formatWeekLabel(viewedWeekKey)}</h2>
      {#if uniqueCount > 0}
        <span class="week-count">{uniqueCount} Pflanzen</span>
      {/if}
    </div>
    <button class="nav-btn" aria-label="Nächste Woche" onclick={() => navigate(1)} disabled={!canGoNext}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  </div>

  {#if grouped.length === 0}
    <p class="empty">
      {#if isCurrentWeek}
        Noch keine Pflanzen diese Woche. Starte auf der Home-Seite!
      {:else}
        Keine Pflanzen in dieser Woche.
      {/if}
    </p>
  {:else}
    {#each grouped as group}
      <section class="category-group">
        <h3>{group.label} ({group.plants.length})</h3>
        <ul>
          {#each group.plants as plant}
            <li>
              <span class="plant-name">{plant.name}</span>
              {#if isCurrentWeek}
                <button class="remove-btn" onclick={() => {
                  if (plant.entry.id != null) onremove(plant.entry.id);
                }}>✕</button>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {/if}
</div>

<style>
  .list-view {
    padding: 1.5rem 1rem;
  }

  .week-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .week-title {
    text-align: center;
  }

  .week-title h2 {
    font-size: 1.1rem;
    color: var(--color-text);
    margin: 0;
  }

  .week-count {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .nav-btn {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 0.4rem;
    cursor: pointer;
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .empty {
    color: var(--color-text-muted);
    text-align: center;
    margin-top: 2rem;
  }

  .category-group {
    margin-bottom: 1.25rem;
  }

  .category-group h3 {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .plant-name {
    font-size: 0.95rem;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 4px 8px;
    font-size: 0.8rem;
  }
</style>
