# CLAUDE.md

## Projekt

Mikrobiom Counter: PWA zum Tracken von Pflanzenvielfalt pro Woche (Ziel: 30 Pflanzen).
Im Google Play Store als TWA (Trusted Web Activity) via Bubblewrap. Danach native Android App geplant.

## Wissenschaftliche Grundlage + Design-Entscheidungen

Siehe `knowledge/` Ordner für die vollständige Dokumentation:
- `knowledge/science.md` - Originalstudie, Methodik, was die Daten sagen, spätere Interpretationen
- `knowledge/decisions.md` - Alle Design-Entscheidungen (D1-D6) mit Begründung und Tradeoffs
- `knowledge/data.md` - Pflanzendatenbank: Struktur, Alias-Typen, Suchindex, bekannte Probleme
- `knowledge/journal.md` - Tester-Feedback, Savepoints, Dead Ends, offene Fragen
- `knowledge/playstore.md` - TWA-Setup, Signing, Digital Asset Links, Store Listing, Deployment-Checkliste

**Kurzfassung:** Jede Pflanzenart = 1 Punkt (wie Originalstudie, keine Viertelpunkte). Feste Liste mit Aliasen statt LLM. Ganze/minimal verarbeitete Pflanzen zählen, ultra-verarbeitete nicht.

## Befehle

```bash
npm run dev          # Dev-Server (HTTPS, --host für Handy)
npm run build        # Production Build
npm run preview      # Production Preview
npm run check        # Svelte + TypeScript Check
```

## Architektur

- **Svelte 5** mit Runes ($state, $derived, $effect). Stores müssen `.svelte.ts` heißen, nicht `.ts`.
- **Dexie.js** für IndexedDB (v2 Schema: `entries` + `settings` Tabellen). Bekannter Bug: `liveQuery` funktioniert nicht mit Svelte 5 — stattdessen Promise-API + manuelle $state-Updates.
- **vite-plugin-pwa** mit `registerType: 'prompt'` — zeigt Update-Banner statt Auto-Update.
- **@vitejs/plugin-basic-ssl** für HTTPS im Dev/Preview (nötig für Mikrofon-Zugriff auf Remote-Geräten).

## Dateistruktur

```
src/
  data/plants.ts         — 276 deutsche Pflanzen mit Aliasen in 10 Kategorien
  data/plantIndex.ts     — Such-Index (Normalisierung, De-Umlaut, Stemming)
  data/db.ts             — Dexie IndexedDB Schema (v2: entries + settings)
  data/types.ts          — TypeScript Interfaces + PlantCategory Union
  lib/plantMatcher.ts    — 5-Tier Fuzzy Matching (Exakt → De-Umlaut → Prefix → Levenshtein → Adjektiv-Stripping)
  lib/speechService.ts   — Web Speech API Wrapper (de-DE)
  lib/transcriptParser.ts — Transkript → Pflanzen-Tokens
  lib/weekUtils.ts       — ISO-Wochen-Berechnung (Montag-Start)
  lib/statsUtils.ts      — Shared Streak-Berechnung, Wochen-Historie, historische Plant-IDs
  lib/exportService.ts   — JSON/CSV Export/Import (mit Dedup beim Import)
  stores/*.svelte.ts     — Svelte 5 Rune-basierte Stores
  views/                 — 4 Hauptviews (Home, Liste, Statistik, Einstellungen)
  components/            — UI-Komponenten (ProgressRing, VoiceModal, ManualInput, UpdateBanner, ...)
```

## Wichtige Konventionen

- Pflanzen-IDs: lowercase, keine Umlaute (ae/oe/ue/ss), Bindestriche statt Leerzeichen
- Wochen-Keys: ISO 8601 Format "2026-W08", Montag-Start
- Alle Daten client-side in IndexedDB, kein Backend
- Pflanzendatenbank-Details: siehe `knowledge/data.md`

## Bekannte Pitfalls

- `$state` nur in `.svelte` und `.svelte.ts` Dateien verwenden, NICHT in `.ts`
- `src/vite-env.d.ts` muss `/// <reference types="svelte" />` und `/// <reference types="vite-plugin-pwa/client" />` enthalten
- Web Speech API `$effect` muss `untrack()` nutzen um Race Conditions zu vermeiden
- PWA Install nur im Production Build testbar, nicht im Dev-Server
- HTTPS nötig für Mikrofon-Zugriff auf Remote-Geräten (nicht localhost)
- Dexie DB Schema: Version hochzählen wenn Tabellen/Indizes sich ändern (aktuell v2)
