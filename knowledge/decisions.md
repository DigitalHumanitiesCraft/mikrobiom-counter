# Design-Entscheidungen

## D1: Einfaches Zählen statt gewichtetem Punktesystem

**Entscheidung:** Jede Pflanzenart = 1 Punkt. Keine Viertelpunkte für Kräuter/Gewürze.

**Begründung:**
- Die Originalstudie (McDonald et al. 2018) hat einfach verschiedene Pflanzenarten gezählt
- Die Viertelpunkt-Systeme (ZOE, Dr. Rossi) sind spätere Interpretationen, nicht peer-reviewed
- Einfacheres mentales Modell: "Hab ich diese Pflanze diese Woche schon gehabt?"
- Weniger Erklärungsbedarf in der App

**Tradeoff:** Kräuter/Gewürze könnten "überbewertet" sein, weil man davon nur kleine Mengen isst. Aber die Originalstudie hat das auch nicht unterschieden.

## D2: Feste Pflanzenliste statt LLM-Interpretation

**Entscheidung:** Hardcoded Liste mit 276 Pflanzen + Aliasen. Kein LLM für die Interpretation von Spracheingaben.

**Begründung:**
- **Determinismus:** Gleiche Eingabe = gleiches Ergebnis. Immer.
- **Transparenz:** Was in der Liste ist, zählt. Was nicht drin ist, zählt nicht. Kein Graubereich.
- **"Was zählt nicht?" durch Abwesenheit:** Chips, Schokoriegel, Algenöl sind nicht in der Liste. Kein Prompt Engineering nötig.
- **Offline + kostenlos:** Kein API-Call, kein Token-Verbrauch. Manuelle Eingabe funktioniert komplett offline.
- **Schnell:** Matching in <1ms statt LLM-Latenz.

**Tradeoff:** Gerichte können nicht aufgelöst werden ("Ratatouille" = 5 Pflanzen). User muss Einzelzutaten eingeben. Akzeptabel für den Prototyp, mögliches Feature für die native App (dann aber via strukturierte Rezept-DB, nicht LLM).

## D3: Fuzzy Matching mit 5 Tiers

**Entscheidung:** 5-stufiges Matching statt exakter Suche.

| Tier | Methode | Confidence | Beispiel |
|------|---------|------------|----------|
| 1 | Exakt gegen alle Aliase | exact | "Tomate" = Tomate |
| 2 | De-Umlaut + Stemming | high | "Nüsse" = Nuss |
| 3 | Prefix-Match (eindeutig) | medium | "Brok" = Brokkoli |
| 4 | Levenshtein <= 2 | low | "Brokkolo" = Brokkoli |
| 5 | Adjektiv-Stripping + Retry | varies | "grüne Paprika" = Paprika |

**Begründung:** Speech Recognition liefert oft ungenaue Transkripte (Plurale, Umlaute, regionale Varianten). Ohne Fuzzy Matching wäre Voice Input frustrierend.

## D4: Alias-Strategie für die Pflanzenliste

**Entscheidung:** Jede Pflanze hat eine Liste von Aliasen die manuell kuratiert werden.

Alias-Typen:
- **Pluralformen:** Tomate/Tomaten, Nuss/Nüsse
- **Regionale Varianten:** Paradeiser (AT), Rüebli (CH), Erdäpfel (AT)
- **Speech-Recognition-Varianten:** Häufige Fehlertranskriptionen
- **Produktnamen:** Tahini = Sesam, Hummus = Kichererbsen, Popcorn = Mais
- **Kurzformen:** Salat = Kopfsalat

**Begründung:** Arbeitsintensiv aber verlässlich. Jeder Alias ist eine bewusste Entscheidung. Kein Overmatching durch zu aggressive Fuzzy-Logik.

## D5: PWA statt Native Android

**Entscheidung:** Progressive Web App für den Prototyp.

**Begründung:**
- User (Entwickler) hat Web-Erfahrung, kann schneller iterieren
- PWA reicht für die Validierung der Grundidee
- GitHub Pages Deployment, kein App Store nötig
- Tester können sofort loslegen (Link teilen statt APK installieren)

**Tradeoff:** Voice Input braucht Internet (Chrome sendet Audio an Google). Native Android hätte on-device SpeechRecognizer. Akzeptabel für den Prototyp, Hauptgrund für die geplante native Version.

## D6: Client-only, kein Backend

**Entscheidung:** Alle Daten lokal in IndexedDB (Dexie.js). Kein Server, kein Account, kein Cloud-Sync.

**Begründung:**
- Datenschutz: Ernährungsdaten sind sensibel
- Null Infrastruktur-Kosten
- Offline-fähig (außer Voice)
- Einfachheit: kein Auth, kein API, kein Hosting

**Tradeoff:** Kein Backup (Export-Funktion als Workaround). Kein Sync zwischen Geräten. Akzeptabel für den Prototyp.
