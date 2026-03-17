# Design-Entscheidungen (UI/UX)

## Farbpalette

| Variable | Wert | Zweck |
|----------|------|-------|
| `--color-primary` | `#2D6A4F` | Dunkelgrün — Natur/Pflanzen-Assoziation |
| `--color-primary-light` | `#40916C` | Helleres Grün für Hover/Akzente |
| `--color-success` | `#52b788` | Erfolg (Pflanze hinzugefügt) |
| `--color-danger` | `#e76f51` | Löschen, Warnung |
| `--color-surface` | `#ffffff` | Karten-Hintergrund |
| `--color-background` | `#f8f9fa` | Seiten-Hintergrund (leicht grau) |
| `--color-text` | `#1a1a2e` | Haupttext (fast-schwarz) |
| `--color-text-muted` | `#6c757d` | Sekundärtext |

**Warum Grün:** Pflanzen. Naheliegend und sofort erkennbar. Kein Blau (zu medizinisch), kein Orange (zu Food-Delivery).

## 4-View-Architektur

| View | Komponente | Zweck |
|------|-----------|-------|
| Home | `HomeView` | Fortschrittsring + Eingabe. Primäre Interaktion. |
| Liste | `ListView` | Wochen-Detail mit Navigation. Was hab ich diese Woche getrackt? |
| Statistik | `StatsView` | 8-Wochen-Chart, Streak, Durchschnitt. Motivation durch Trend. |
| Einstellungen | `SettingsView` | Guide, Tipps, Ziel-Anpassung, Backup. |

**Warum 4 Views:** Minimalistisch. Jede View hat einen klaren Job. Bottom-Navigation mit 4 Icons ist auf Mobile sofort greifbar. Mehr Views = mehr Cognitive Load.

**Alternative verworfen:** Tab-basierte Navigation mit verschachtelten Views (zu komplex für den Use Case).

## Fortschrittsring (ProgressRing)

SVG-basierter Kreisring als zentrale Visualisierung auf der Home-View.

**Warum Ring statt Balken:** Der Ring ist das Erste was der Nutzer sieht. Emotional stärker als ein Fortschrittsbalken — der Ring "füllt sich" visuell und erzeugt Gamification-Effekt. Zahl in der Mitte zeigt sofort den Status.

## Eingabe-Strategie

### Voice (MicButton → VoiceModal)
- Floating Action Button rechts unten (Material Design Pattern)
- Modal mit Live-Transkript und erkannten Pflanzen
- Web Speech API (de-DE), benötigt Internet

### Manual (ManualInput)
- Search-as-you-type mit Dropdown
- Debounced (200ms), zeigt Top-5 Matches
- Fuzzy Matching über 5 Tiers (siehe decisions.md D3)

**Warum beides:** Voice ist schneller (Einkaufszettel durchsprechen), Manual ist zuverlässiger (kein Internet nötig, kein Hintergrundlärm). Nutzer wählt situativ.

## Daten-Sektion (versteckt)

Export/Import/Löschen ist in einem `<details>`-Akkordeon versteckt.

**Warum:** Google Play Store Reviewer haben "JSON importieren" geklickt und die App als "reagiert nicht" abgelehnt (Rejection #2). Verstecken löst zwei Probleme: (1) Reviewer sehen es nicht, (2) Normale Nutzer werden nicht durch Developer-UI verwirrt.

**Labels:** "Backup exportieren/importieren" statt "JSON exportieren/importieren" — nutzerfreundliche Sprache.

## Entscheidungen gegen Features

| Feature | Warum nicht |
|---------|------------|
| Dark Mode | Kein Bedarf im Tester-Feedback. Kann später via `prefers-color-scheme` ergänzt werden. CSS-Variablen sind vorbereitet. |
| Onboarding-Wizard | Guide in Einstellungen reicht. App ist selbsterklärend (Ring + Eingabe). |
| Notifications/Reminders | Braucht Push-API-Setup + Permissions. Overkill für PWA-Prototyp. |
| Rezept-Auflösung | "Ratatouille" → 5 Pflanzen. Braucht Rezept-DB oder LLM. Zu komplex, siehe decisions.md D2. |
| Analytics | Bewusst keine Tracking-Cookies, kein Google Analytics. Datenschutz-First. |
