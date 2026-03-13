import { db } from '../data/db';
import { PLANTS } from '../data/plants';
import type { PlantEntry } from '../data/types';

export async function exportJSON(): Promise<void> {
  const entries = await db.entries.toArray();
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    entries,
  };
  downloadFile(
    JSON.stringify(data, null, 2),
    `mikrobiom-export-${formatDate()}.json`,
    'application/json'
  );
}

export async function exportCSV(): Promise<void> {
  const entries = await db.entries.toArray();
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = 'Datum,Pflanze,Kategorie,Kalenderwoche,Eingabeart';
  const rows = entries.map(e => {
    const plant = PLANTS.find(p => p.id === e.plantId);
    const cat = plant?.category ?? '';
    const date = new Date(e.timestamp).toLocaleString('de-DE');
    return [date, e.plantName, cat, e.weekKey, e.source].map(esc).join(',');
  });
  downloadFile(
    '\uFEFF' + [header, ...rows].join('\n'),
    `mikrobiom-export-${formatDate()}.csv`,
    'text/csv;charset=utf-8'
  );
}

export async function importJSON(file: File): Promise<{ added: number; skipped: number }> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data.entries || !Array.isArray(data.entries)) {
    throw new Error('Ungültiges Exportformat');
  }

  // Build set of existing entries for dedup
  const existing = await db.entries.toArray();
  const existingKeys = new Set(
    existing.map(e => `${e.plantId}|${e.weekKey}|${e.timestamp}`)
  );

  const toAdd: PlantEntry[] = [];
  let skipped = 0;
  for (const e of data.entries) {
    const key = `${e.plantId}|${e.weekKey}|${e.timestamp}`;
    if (existingKeys.has(key)) {
      skipped++;
    } else {
      toAdd.push({
        plantId: e.plantId,
        plantName: e.plantName,
        weekKey: e.weekKey,
        timestamp: e.timestamp,
        source: e.source,
      });
    }
  }

  if (toAdd.length > 0) {
    await db.entries.bulkAdd(toAdd);
  }
  return { added: toAdd.length, skipped };
}

export async function clearAllData(): Promise<void> {
  await db.entries.clear();
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(): string {
  return new Date().toISOString().slice(0, 10);
}
