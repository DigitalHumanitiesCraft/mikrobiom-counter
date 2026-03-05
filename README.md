# Mikrobiom Counter

PWA zum Tracken der wöchentlichen Pflanzenvielfalt.

## Wissenschaftliche Grundlage

Das [American Gut Project](https://pmc.ncbi.nlm.nih.gov/articles/PMC5954204/) (McDonald et al., mSystems 2018, 10.000+ Teilnehmer) hat gezeigt: Wer 30+ verschiedene Pflanzenarten pro Woche isst, hat ein signifikant diverseres Darmmikrobiom als jemand mit weniger als 10. Diese App zählt wie die Originalstudie: jede Art = 1 Punkt, ohne Gewichtung.

Details zu Zählweise, was zählt/nicht zählt, und Design-Entscheidungen: siehe [`knowledge/`](knowledge/).

## Features

- **Spracheingabe** per Web Speech API (de-DE)
- **Manuelle Eingabe** mit Search-as-you-type, 276 Pflanzen in 10 Kategorien
- **Fuzzy Matching** für Plurale, Umlaute, regionale Varianten (Paradeiser, Erdäpfel, ...)
- **Glossar** erklärt was zählt und was nicht, mit Verweis auf die Originalstudie
- **Wöchentlicher Counter** mit Fortschrittsring
- **Duplikat-Erkennung** mit Toast-Feedback
- **Wochen-Navigation** in der Listenansicht
- **Streak-Tracking** für aufeinanderfolgende Wochen mit 20+ Pflanzen
- **Statistik** mit 8-Wochen-Verlauf, Durchschnitt, Streak
- **Daten-Export** als JSON und CSV (mit Duplikat-Schutz beim Import)
- **Installierbar** als PWA mit Offline-Support (außer Voice Input)

## Tech Stack

| Layer | Technologie |
|-------|-------------|
| UI | Svelte 5 |
| Build | Vite |
| Persistenz | Dexie.js (IndexedDB) |
| PWA | vite-plugin-pwa + Workbox |
| Sprache | TypeScript |

Kein Backend. Alle Daten bleiben lokal auf dem Gerät.

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server
npm run build      # Production Build
npm run check      # Svelte + TypeScript Check
```

### Handy testen (HTTPS für Mikrofon)

```bash
npm run build && npx vite preview --host
```

`https://<deine-ip>:4173/` in Chrome auf dem Handy (gleiches WLAN).

## Einschränkungen

- **Voice Input braucht Internet.** Chrome sendet Audio an Google-Server. Offline nur manuelle Eingabe.
- **Nur Chrome Android.** Safari iOS PWA unterstützt SpeechRecognition nicht.
- **Kein Cloud-Backup.** Daten nur lokal. Export-Funktion nutzen!

## Lizenz

AGPL-3.0 — siehe [LICENSE](LICENSE).
