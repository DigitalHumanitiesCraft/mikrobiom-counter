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

## Native App — Feature-Ideen

- **Share-Card**: Wochen-Ergebnis als visuelles Bild generieren (Fortschrittsring + Zahl + Pflanzenliste), über nativen Share Sheet teilen (WhatsApp, Instagram Story, etc.). Canvas-to-Image + Share Intent. Gamification-Effekt: "Schau mal, 32 Pflanzen diese Woche!"
