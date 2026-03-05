# Play Store Deployment

## Ziel

Mikrobiom Counter PWA als Android App im Google Play Store veröffentlichen via Trusted Web Activity (TWA).

## Architektur-Entscheidung: TWA via Bubblewrap

**Gewählt:** TWA (Trusted Web Activity) mit Bubblewrap CLI
**Alternativen verworfen:**
- PWABuilder (GUI): nutzt Bubblewrap unter der Haube, weniger Kontrolle
- WebView-Wrapper: kein Zugriff auf Service Worker, keine Offline-Fähigkeit
- Capacitor/Cordova: Overkill — die App ist eine reine PWA ohne native APIs

**Warum TWA:** Zeigt die PWA in Chrome ohne Browser-UI an. Google-unterstützt, kein WebView, volle PWA-Features (Service Worker, IndexedDB, Web Speech API). Voraussetzung: Digital Asset Links zur Domain-Verifizierung.

## Hosting

| Was | Wo |
|-----|----|
| App-URL | `https://dhcraft.org/mikrobiom-counter/` |
| Repo | `DigitalHumanitiesCraft/mikrobiom-counter` (GitHub) |
| GitHub Pages | Via `digitalhumanitiescraft.github.io` Repo (CNAME → `dhcraft.org`) |
| Asset Links | `https://dhcraft.org/.well-known/assetlinks.json` (im Root-Repo) |

**DNS:** dhcraft.org → GitHub Pages IPs (185.199.108-111.153), CNAME im Root-Repo bestätigt.

**GitHub Pages + `.well-known/`:** Jekyll (GitHub Pages Standard) ignoriert Verzeichnisse die mit `.` beginnen. Das `digitalhumanitiescraft.github.io` Repo braucht eine `.nojekyll` Datei im Root ODER `_config.yml` mit `include: [".well-known"]`. Ohne das → assetlinks.json liefert 404.

## Voraussetzungen

### PWA-Readiness (im App-Repo)

- [x] PWA Icons generieren: `pwa-192x192.png`, `pwa-512x512.png`
- [x] Maskable Icon erstellen (Safe Zone beachten: 80% des Icons)
- [x] `package.json` Version auf `1.0.0` setzen
- [x] `vite.config.ts`: `scope: '/mikrobiom-counter/'` im Manifest ergänzen
- [x] Lighthouse Audit: Score >= 80
- [x] Offline-Funktionalität verifiziert
- [x] Manifest vollständig (name, short_name, icons, start_url, display, scope)
- [ ] Web Speech API in TWA testen (Mikrofon-Zugriff)

Base-Path `/mikrobiom-counter/` ist bereits korrekt gesetzt in `vite.config.ts`.

### Play Store Account

- [x] Google Play Developer Account erstellt ($25 Einmalgebühr)
- [x] Account-Verifizierung abgeschlossen

### Bubblewrap Setup

```bash
npm i -g @bubblewrap/cli
```

Benötigt: JDK 11+ und Android SDK (Bubblewrap bietet an, beides automatisch herunterzuladen beim ersten `init`).

### Signing: Upload Key + Google Play App Signing

**Seit August 2021 Pflicht:** Google Play App Signing. Google managed den eigentlichen Signing Key — du generierst nur einen **Upload Key**.

**Schritt 1: Upload Key generieren (lokal)**
```bash
keytool -genkeypair -alias upload -keyalg RSA -keysize 2048 \
  -validity 10000 -keystore mikrobiom-counter-upload.keystore
```

**Schritt 2: Bei App-Erstellung in Play Console**
- "App Signing by Google Play" wird automatisch aktiviert (Pflicht für neue Apps)
- Google generiert den **App Signing Key**

**Schritt 3: Signing Key Fingerprint aus Play Console holen**
- Play Console → Release → Setup → App signing
- SHA-256 Fingerprint des **App Signing Key** kopieren (NICHT des Upload Keys!)

**WICHTIG:**
- Upload Keystore sicher aufbewahren (NICHT ins Git-Repo)
- Verlust des Upload Keys = Support-Ticket bei Google (wiederherstellbar, aber aufwändig)
- Verlust des App Signing Keys = unmöglich (Google verwaltet ihn)

### Digital Asset Links

Datei: `/.well-known/assetlinks.json` auf `dhcraft.org` (im `digitalhumanitiescraft.github.io` Repo)

**WICHTIG:** Braucht ZWEI Fingerprints — Upload Key (für lokales Debugging) und App Signing Key (für Play Store Version). Ohne App Signing Key Fingerprint → TWA zeigt URL-Bar statt Fullscreen!

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "org.dhcraft.mikrobiomcounter",
    "sha256_cert_fingerprints": [
      "<SHA-256 App Signing Key — aus Play Console>",
      "<SHA-256 Upload Key — aus lokalem Keystore>"
    ]
  }
}]
```

Upload Key SHA-256 auslesen:
```bash
keytool -list -v -keystore mikrobiom-counter-upload.keystore -alias upload | grep SHA256
```

App Signing Key SHA-256: Play Console → Release → Setup → App signing → "App signing key certificate" → SHA-256.

## Play Store Listing — Benötigte Assets

| Asset | Spezifikation | Status |
|-------|--------------|--------|
| App-Icon | 512x512 PNG, 32-bit, kein Alpha | ✅ `public/pwa-512x512.png` |
| Feature Graphic | 1024x500 PNG/JPG | ✅ `store/feature-graphic-1024x500.png` |
| Phone Screenshots | Min. 4, 1080px+ pro Seite, 9:16 | ✅ 5 Screenshots in `store/` |
| 7" Tablet Screenshots | 16:9 oder 9:16, 320-3840px | ✅ 4 Screenshots in `store/` |
| 10" Tablet Screenshots | 16:9 oder 9:16, 320-3840px | ✅ 4 Screenshots in `store/` |
| Kurzbeschreibung | Max. 80 Zeichen | ✅ in `store/listing.md` |
| Vollbeschreibung | Max. 4000 Zeichen | ✅ in `store/listing.md` |
| Datenschutzerklärung | URL zu einer Webseite | ✅ `store/datenschutz.md` → dhcraft.org |
| App-Kategorie | Health & Fitness | ✅ |
| Content Rating | IARC Fragebogen ausfüllen | ✅ |
| Zielgruppe | **Nicht für Kinder** | ✅ |
| Health Apps Declaration | Pflicht-Formular seit Jan 2026 | ✅ |

## Package Name

`org.dhcraft.mikrobiomcounter`

**WICHTIG:** Nach Veröffentlichung nicht mehr änderbar.

## Versionierung

- **versionName:** Menschenlesbar, z.B. `"1.0.0"` (in `package.json` + `twa-manifest.json`)
- **versionCode:** Integer, muss bei jedem Play Store Update steigen: `1`, `2`, `3`... (in `twa-manifest.json`, managed von Bubblewrap)

## Deployment-Schritte (Reihenfolge)

### Phase A: PWA vorbereiten ✅
1. ✅ Icons generieren (PNG aus bestehendem SVG-Design)
2. ✅ Manifest: `scope` Feld ergänzen
3. ✅ Version auf 1.0.0 setzen
4. ✅ Repo in DigitalHumanitiesCraft Org transferieren
5. ✅ GitHub Actions für Deploy auf dhcraft.org anpassen
6. ✅ `.nojekyll` Datei im Root-Repo sicherstellen (für `.well-known/`)
7. ✅ Lighthouse Audit bestehen (>= 80)

### Phase B: TWA bauen ✅
8. ✅ Bubblewrap CLI installieren (benötigt JDK + Android SDK)
9. ✅ Upload Keystore generieren
10. ✅ `bubblewrap init --manifest https://dhcraft.org/mikrobiom-counter/manifest.webmanifest`
11. ✅ `bubblewrap build` → AAB liegt in `twa/app/build/outputs/bundle/release/app-release.aab`

### Phase C: Play Store
12. ✅ Developer Account erstellt + verifiziert
13. ✅ App erstellt → App Signing Key SHA-256 aus Play Console geholt
14. ✅ Digital Asset Links (`assetlinks.json`) mit BEIDEN Fingerprints in Root-Repo deployed
15. ✅ Store Listing erstellt (Texte, Screenshots, Feature Graphic)
16. ✅ Datenschutzerklärung erstellt + verlinkt
17. ✅ Health Apps Declaration ausgefüllt
18. ✅ Content Rating ausgefüllt (IARC)
19. ✅ Zielgruppe: "Nicht für Kinder" deklariert
20. ✅ Länder/Regionen ausgewählt
21. ✅ AAB hochladen → Production Release erstellt (2026-03-05)
22. ✅ Release zur Überprüfung an Google gesendet (2026-03-05)
23. ⬜ TWA Fullscreen verifizieren nach Veröffentlichung (kein URL-Bar?)
24. ⬜ Web Speech API in TWA testen auf echtem Gerät

### Timeline-Erwartung
- Phase A: 1-2 Tage (größtenteils automatisierbar)
- Phase B: 1 Tag (Bubblewrap Setup + Build)
- Phase C: **1-3 Wochen** (Account-Verifizierung + Review bei Erstveröffentlichung)
- **Kritischer Pfad:** Developer Account Verifizierung → so früh wie möglich starten

## Play Store Policies (Stand: März 2026)

### Health Apps Declaration (Pflicht seit Januar 2026)
Seit Januar 2026 müssen alle Health & Fitness Apps ein **Health Apps Declaration Formular** in der Play Console ausfüllen. Betrifft uns, weil die App unter Health & Fitness fällt (Pflanzenvielfalt-Tracking = Nutrition Tracker).

**Was wir deklarieren müssen:**
- App trackt Ernährungsdaten (Pflanzenvielfalt pro Woche)
- Keine Health Connect Integration (nur lokale IndexedDB)
- Keine medizinischen Diagnosen oder Empfehlungen
- Keine Vitaldaten (kein Blutdruck, kein Puls, etc.)

**Was wir NICHT tun dürfen im Listing:**
- Keine medizinischen Health Claims ("heilt", "verbessert Gesundheit")
- OK: "Tracke deine Pflanzenvielfalt" (beschreibend)
- Grenzwertig: "für ein gesundes Darmmikrobiom" (implizierter Health Claim)
- Empfehlung: Listing-Texte neutral formulieren, wissenschaftliche Referenz ohne Heilversprechen

**Kategorie-Entscheidung:** Health & Fitness ist korrekt (ZOE, Cronometer etc. sind dort). "Food & Drink" wäre eine Alternative, aber Nutrition Tracker sind standardmäßig unter Health & Fitness.

### Zielgruppe: Nicht für Kinder
Als 18+ oder "nicht für Kinder" deklarieren. Wenn "Alle Altersgruppen" gewählt wird, gelten strengere Regeln (COPPA, Families Policy) — unnötiger Aufwand für diese App.

### Datenschutzerklärung
Pflicht für den Play Store. Muss enthalten:
- Welche Daten erhoben werden (Pflanzen-Einträge, Wochen-Daten)
- Wo gespeichert (lokal auf dem Gerät, IndexedDB — kein Server)
- Keine Datenübertragung an Dritte
- Keine Analytics, keine Tracking-Cookies
- Kontaktdaten des Entwicklers

**Vorteil:** Komplett client-side App = sehr einfache Datenschutzerklärung.

## Bekannte Einschränkungen TWA

- **Nur Chrome:** TWA läuft in Chrome. Andere Browser zeigen Custom Tab mit URL-Bar.
- **Kein Play Store Badge bei Nicht-Chrome:** Samsung Internet, Firefox etc. zeigen Browser-UI.
- **Updates:** App-Inhalt aktualisiert sich automatisch (ist ja die Website). Store-Version nur bei TWA-Wrapper-Änderungen updaten (Icons, Splash Screen, Package-Metadata).
- **Offline:** Funktioniert über Service Worker wie in der PWA.
- **Kein nativer Zugriff:** Keine Kamera/GPS/Push-Notifications über die Web-APIs hinaus.
- **Web Speech API:** Sollte in TWA funktionieren (ist Chrome), muss aber getestet werden.

## Risiken

| Risiko | Mitigation |
|--------|-----------|
| Upload-Keystore-Verlust | Sicher extern speichern (verschlüsselt in Cloud). Bei Verlust: Google Support Ticket. |
| Play Store Ablehnung | Content Policy checken, Datenschutz korrekt, keine Health Claims |
| Lighthouse < 80 | Vor TWA-Build testen und optimieren |
| assetlinks.json 404 | `.nojekyll` im Root-Repo + vor Submission testen: `curl https://dhcraft.org/.well-known/assetlinks.json` |
| TWA zeigt URL-Bar | Beide SHA-256 Fingerprints in assetlinks.json (Upload + App Signing Key) |
| Account-Verifizierung dauert | Developer Account ASAP anlegen, parallel zu Phase A |
| Web Speech API in TWA | Frühzeitig auf echtem Gerät testen |
| Health Claims im Listing | Listing-Texte neutral formulieren, keine Heilversprechen |
| Health Apps Declaration | Formular korrekt ausfüllen, keine Health Connect Nutzung deklarieren |

## TWA Build Workflow

### Verzeichnisstruktur

```
twa/
  twa-manifest.json                    — Bubblewrap-Konfiguration
  mikrobiom-counter-upload.keystore    — Upload Key (NICHT im Git!)
  app/build/outputs/bundle/release/
    app-release.aab                    — Signiertes App Bundle für Play Store
```

### Erstmaliger Build (bereits erledigt)

```bash
npm i -g @bubblewrap/cli
cd twa
bubblewrap init --manifest https://dhcraft.org/mikrobiom-counter/manifest.webmanifest
bubblewrap build
```

Bubblewrap fragt beim ersten `init` nach JDK und Android SDK — beides wird automatisch heruntergeladen wenn nicht vorhanden.

### Update-Workflow: Nur PWA-Änderungen (kein Store-Update nötig)

Die TWA ist ein dünner Wrapper um die PWA. Änderungen an der Web-App (Code, Pflanzenliste, UI) werden automatisch übernommen, sobald sie auf `dhcraft.org` deployed sind. Der Service Worker zeigt das Update-Banner.

**Kein neuer AAB-Upload nötig** für:
- Code-Änderungen (neue Features, Bugfixes)
- Pflanzendatenbank-Updates
- CSS/UI-Änderungen
- Neue Pflanzen-Aliase

### Update-Workflow: Store-Update nötig

Ein neuer AAB-Upload ist nötig wenn sich der TWA-Wrapper selbst ändert:
- Icon-Änderungen (Splash Screen, App Icon)
- Package-Metadata (Name, Theme-Farben)
- `twa-manifest.json`-Änderungen
- Android SDK Target-Version erhöhen (Google verlangt das periodisch)

**Schritte:**

```bash
cd twa

# 1. twa-manifest.json anpassen:
#    - appVersionCode um 1 erhöhen (Pflicht!)
#    - appVersionName aktualisieren (z.B. "1.1.0")

# 2. Neu bauen
bubblewrap build
# Fragt nach Keystore-Passwort

# 3. AAB hochladen
# Play Console → Release → Production → Neuen Release erstellen
# app/build/outputs/bundle/release/app-release.aab hochladen
# Versionshinweise eintragen
# Release zur Überprüfung senden
```

**Wichtig:** `appVersionCode` in `twa-manifest.json` muss bei jedem Upload steigen. Google lehnt AABs mit gleichem oder niedrigerem versionCode ab.

### Screenshots aktualisieren

Bei größeren UI-Änderungen Screenshots neu machen:

1. `npm run dev` (oder deployed Version)
2. Chrome DevTools → Device Toolbar → Pixel 7 (Phone) / iPad Air (10" Tablet) / 7in Tablet
3. Ctrl+Shift+P im DevTools-Panel → "Capture screenshot"
4. Screenshots in `store/` ablegen und in Play Console hochladen

### Lighthouse Check

Vor jedem Store-Update Production-Version prüfen:
- Chrome Inkognito → `https://dhcraft.org/mikrobiom-counter/`
- DevTools → Lighthouse → Mobile → Analyze
- Minimum: Performance 80+, Accessibility 90+
- Letzter Check (2026-03-05): 100/92/100/100
