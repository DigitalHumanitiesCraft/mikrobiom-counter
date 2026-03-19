# Journal

## Savepoints

| Hash | Beschreibung | Datum |
|------|-------------|-------|
| `ba1d71d` | MVP: Voice + Manual Input, 276 Pflanzen, 4 Views | 2026-02-16 |
| `4f3dcf9` | Prototype Polish: 13 TODO-Items (Bugs, UX, Performance) | 2026-02-16 |
| `76c6f25` | GitHub Pages Deployment via Actions | 2026-02-16 |
| `c33e6dd` | Adjektiv-Stripping (Tier 5 Matching) | 2026-02-16 |
| `9fcef2a` | PWA short_name fix | 2026-02-16 |
| `1adef81` | Glossar, Knowledge-Docs, "Salat"-Alias | 2026-02-16 |
| `139f9aa` | Type errors, week rollover, CSV encoding, a11y fixes | 2026-03-16 |
| `884c9f1` | 290 Pflanzen, Data-UI versteckt, Play Store Fixes | 2026-03-17 |
| `bc101fe` | CSV-Export entfernt, Buttons zu "Backup" umbenannt | 2026-03-17 |

## Tester-Feedback

### Susi (2026-02-16)

- "Grüne Paprika" wurde nicht erkannt, nur "Paprika"
  - **Fix:** Tier 5 im plantMatcher: deutsche Lebensmittel-Adjektive werden vor dem Matching gestrippt
  - **Learning:** Speech Recognition liefert oft "grüne Paprika", "rote Linsen" etc. Adjektive müssen systematisch behandelt werden.

- PWA-Icon auf Android Home Screen zeigte "MikroCount" statt sinnvollem Namen
  - **Fix:** `short_name` in Manifest von "MikroCount" auf "30 Pflanzen" geändert
  - **Learning:** `short_name` im PWA-Manifest bestimmt den App-Namen auf dem Home Screen. Max. ~12 Zeichen sinnvoll.

### Chris (2026-02-16, Eigentest)

- "Salat" wurde nicht erkannt (nur Kopfsalat, Feldsalat etc.)
  - **Fix:** "Salat" als Alias für Kopfsalat hinzugefügt
  - **Learning:** Alltagssprache weicht von der Datenbankstruktur ab. Oberbegriffe als Alias für die häufigste Variante hinterlegen.

## Dead Ends

- **Dexie liveQuery + Svelte 5:** Bekannte Regression, liveQuery funktioniert nicht. Workaround: Promise-API + manuelle $state-Updates. Kein Fix in Sicht, wird für native App irrelevant.

## Offene Fragen

- ~~Gewürzmischungen (Curry, Garam Masala, Za'atar): Zählen als 1 Pflanze oder als ihre Einzelbestandteile?~~ Behoben: Pragmatische Regel — fertige Mischung = 1 Punkt (Spuren reichen biologisch nicht). Einzeln verwenden = einzeln zählen. Gilt auch für Kräutertee-Mischungen.
- ~~Sojasauce: Zählt das als Sojabohne?~~ Behoben: Sojasauce/Shoyu/Tamari als Aliase hinzugefügt.
- ~~Rauchsalz: Ist kein Pflanzenprodukt.~~ Behoben: Eintrag gelöscht.

## Play Store Deployment (2026-03-03)

**Entscheidung:** PWA via TWA (Trusted Web Activity) in den Google Play Store bringen.
- **Tool:** Bubblewrap CLI (Google Chrome Labs)
- **Hosting:** Repo nach `DigitalHumanitiesCraft/mikrobiom-counter` transferieren, Deploy auf `dhcraft.org/mikrobiom-counter/`
- **Domain:** `dhcraft.org` (GitHub Pages, CNAME bestätigt)
- **Package Name:** `org.dhcraft.mikrobiomcounter`
- **Knowledge Doc:** `knowledge/playstore.md`

**Gefundene Probleme (alle behoben):**
- ~~PWA Icons (192px, 512px PNG) fehlen im Projekt~~ → generiert
- ~~Version steht auf `0.0.0`~~ → auf 1.0.0 gesetzt
- ~~assetlinks.json muss ins `digitalhumanitiescraft.github.io` Root-Repo~~ → deployed

## Play Store Submission (2026-03-05)

**Status:** Alle Store-Assets erstellt, App in Play Console angelegt, AAB gebaut. Bereit für Release-Submission.

**Erstellte Assets:**
- Feature Graphic: `store/feature-graphic-1024x500.png` (via Canvas-Generator)
- Phone Screenshots (5x Pixel 7): Home leer, Home mit Tracking, Voice Input, Liste, Einstellungen
- 7" Tablet Screenshots (4x)
- 10" Tablet Screenshots (4x iPad Air)
- Store Listing Text: `store/listing.md`
- Datenschutzerklärung: `store/datenschutz.md`

**Release eingereicht:** AAB hochgeladen, Production Release zur Überprüfung an Google gesendet. Erwartete Review-Dauer: 3-7 Tage.

**Nach Veröffentlichung testen:**
- TWA Fullscreen verifizieren (kein URL-Bar?)
- Web Speech API in TWA auf echtem Gerät testen

## Play Store Rejections + Fixes (2026-03-07 bis 2026-03-17)

### Rejection 1: Name Mismatch (2026-03-07)
- **Problem:** `short_name: "30 Pflanzen"` im PWA-Manifest vs. Store Name "Mikrobiom Counter"
- **Fix:** `short_name` → `"Mikrobiom"` in vite.config.ts, TWA launcherName angepasst

### Rejection 2: "App reagiert nicht" (2026-03-14)
- **Problem:** Google-Reviewer klickte "JSON importieren" Button, der einen File-Picker öffnet — Reviewer wusste nicht was er tun soll → markierte als "App reagiert nicht"
- **Fix:** Daten-Sektion in `<details>` Akkordeon versteckt
- **Learning:** Google-Reviewer testen ALLE sichtbaren Buttons. Developer-facing UI muss versteckt sein.

### Resubmission vorbereitet (2026-03-17)
- versionCode 3 (vC2 war verbraucht durch abgelehnten Release)
- CSV-Export entfernt (Developer-Feature, kein User-Nutzen)
- Buttons umbenannt: "Backup exportieren/importieren" statt "JSON exportieren/importieren"
- Pflanzendatenbank auf 290 Einträge erweitert (3 Runden Tester-Feedback)
- ID-Fix: `blattkohl` → `palmkohl`

### Tester-Feedback Runde 2 (Rich + Romy, 2026-03-16)
- **Feature-Wünsche:** Challenge-Modus (#1), Social/Sharing (#2), Plant of the Day (#3)
- **Daten-Feedback:** Fehlende Pflanzen (Taro, Nashi-Birne, Shiso etc.), fehlende Aliase (Rote Zwiebel, Sojamilch etc.)
- **Bugs:** Gurkenkraut-Duplikat (Dill + Borretsch), Beifuß redundanter Alias
- Alle Daten-Issues gefixt in 3 Runden

### GitHub Issues angelegt
- #1: Challenge-Modus (Tage bis 30 Pflanzen)
- #2: Social/Sharing
- #3: Plant of the Day
- #8: Saison-Info pro Pflanze
- #9: Guide durchsuchbar machen

## 2026-03-19 – Play Store Live!

App ist im Google Play Store veröffentlicht. versionCode 3, nach 2 Rejections und 3 Submissions approved.

**Rejection-Historie:**
1. Name-Mismatch: `short_name: "30 Pflanzen"` vs Store-Name "Mikrobiom Counter" → Fix: `"Mikrobiom"`
2. "App reagiert nicht": Google-Reviewer klickte "JSON importieren" → Fix: Daten-Section in `<details>` versteckt
3. Approved.

### Post-Launch Feedback (2026-03-19)
- **TWA Origin Bar**: Tester mit Firefox als Default-Browser sieht Chrome Origin Bar. Ursache: TWA ist Chrome-only, Firefox fällt auf Custom Tab zurück. Kein Fix möglich, ist Android/Chrome-Limitierung.
- **D7: Direktsaft zählt**: Erste Nutzer fragten "Zählt Zitronensaft?". Recherche ergab: Originalstudie schließt Säfte nicht aus, Ballaststoff-Argument ist inkonsistent mit Gewürze-Regelung. Entscheidung: 100% Direktsaft zählt, Industriesaft/Konzentrat nicht.

## 2026-03-17 08:00 – handoff

**Summary:** Pflanzendatenbank auf 290 erweitert (3 Runden Tester-Feedback), Play Store Rejections #1 (Name) und #2 (JSON-Button) gefixt, CSV-Export entfernt, Daten-UI versteckt und umbenannt. Alle knowledge-Docs aktualisiert, requirements.md und design.md neu erstellt. TWA-AAB mit versionCode 3 gebaut.

## Native App — Feature-Ideen

- **Share-Card**: Wochen-Ergebnis als visuelles Bild generieren (Fortschrittsring + Zahl + Pflanzenliste), über nativen Share Sheet teilen (WhatsApp, Instagram Story, etc.). Canvas-to-Image + Share Intent. Gamification-Effekt: "Schau mal, 32 Pflanzen diese Woche!"
