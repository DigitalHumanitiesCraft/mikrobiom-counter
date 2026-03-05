# Pflanzendatenbank

## Überblick

| Kategorie | ID | Einträge | Beispiele |
|-----------|-----|---------|-----------|
| Gemüse | `gemuese` | 61 | Tomate, Karotte, Nori, Lotuswurzel |
| Obst | `obst` | 57 | Apfel, Avocado, Olive, Ringlotte |
| Nüsse | `nuesse` | 14 | Walnuss, Erdnuss, Tigernuss |
| Samen | `samen` | 15 | Sesam/Tahini, Chiasamen, Senfsaat |
| Hülsenfrüchte | `huelsenfruechte` | 19 | Linsen, Tofu/Sojabohne, Käferbohne |
| Getreide | `getreide` | 22 | Hafer, Weizen/Pasta, Quinoa |
| Kräuter | `kraeuter` | 40 | Basilikum, Kamille, Gartenkresse |
| Gewürze | `gewuerze` | 32 | Kurkuma, Zimt, Currypulver, Za'atar |
| Pilze | `pilze` | 12 | Champignon, Shiitake, Parasol |
| Genussmittel | `genuss` | 4 | Kaffee, Kakao, Tee (Camellia), Mate |

**Gesamt:** 276 Pflanzen (Stand: plants.ts)

## Datenstruktur

```typescript
interface Plant {
  id: string;              // lowercase, keine Umlaute, Bindestriche statt Leerzeichen
  name: string;            // Anzeigename (Deutsch)
  category: PlantCategory; // Eine der 10 Kategorien
  aliases: string[];       // Alle alternativen Namen
}
```

## Alias-Typen

| Typ | Beispiel | Zweck |
|-----|----------|-------|
| Pluralform | Tomate/Tomaten | Grammatische Varianten |
| AT/CH-Variante | Paradeiser, Rüebli, Erdäpfel, Karfiol | Regionale Abdeckung |
| Umgangssprachlich | Knobi (Knoblauch), Knofel | Alltagssprache |
| Produktform | Tofu, Tempeh, Miso (= Sojabohne) | Verarbeitete Formen |
| Produktname | Tahini (= Sesam), Hummus (= Kichererbsen) | Handelsname |
| Kurzform | Salat (= Kopfsalat) | Häufige Abkürzung |
| Zubereitungsform | Popcorn, Polenta (= Mais) | Geläufige Gerichte |
| Speech-Typo | Brokoli, Zuccini | Häufige Fehlerkennungen |
| Fremdsprachlich | Courgette (= Zucchini), Cilantro (= Koriander) | Englische/franz. Namen |

## Suchindex (plantIndex.ts)

Für jeden Eintrag (Name + alle Aliase) wird ein SearchEntry gebaut:

```
normalized:  "grüner salat"          → lowercase, trim
deUmlauted:  "gruener salat"         → ä→ae, ö→oe, ü→ue, ß→ss
stemmed:     "gruen salat"           → deutsche Endungen entfernt
```

Stemming-Regeln (Reihenfolge wichtig):
1. `-chen` → entfernt (Diminutiv)
2. `-lein` → entfernt (Diminutiv)
3. `-nen` → `-n`
4. `-en` → entfernt
5. `-er` → entfernt
6. `-es` → entfernt
7. `-e` → entfernt
8. `-s` → entfernt
9. `-n` → entfernt

## Bekannte Probleme

### Doppelte Einträge / Überschneidungen

- `mais` (Gemüse) vs. `mais-getreide` (Getreide): Maiskolben als Gemüse, Maismehl/Popcorn als Getreide. Biologisch dieselbe Pflanze, aber zwei Einträge weil verschiedene Kategorien.
- `haferkleie` und `weizenkeime` haben eigene Einträge, obwohl sie Teile von Hafer/Weizen sind. Redundant.
- `vollkornreis` und `wildreis` sind separate Einträge neben `reis`. Wildreis ist biologisch eine andere Pflanze (Zizania), Vollkornreis nicht.
- `hanfsamen` und `hanfnuesse` waren dasselbe Produkt → behoben: `hanfnuesse` gelöscht, Aliase in `hanfsamen` gemergt.
- `brunnenkresse` Duplikat behoben: `brunnenkresse` (Gemüse, Nasturtium officinale) und `gartenkresse` (Kraut, Lepidium sativum) sind jetzt separate Arten.

### Fehlende Einträge (behoben)

- Rosinen/Sultaninen/Korinthen als Aliase bei Traube hinzugefügt
- Sojasauce/Shoyu/Tamari als Aliase bei Sojabohnen hinzugefügt
- Essiggurke/Gewürzgurke/Cornichons als Aliase bei Gurke hinzugefügt
- Tomatenmark/Passierte Tomaten/Dosentomaten als Aliase bei Tomate hinzugefügt
- Trockenpflaume/Dörrpflaume als Aliase bei Pflaume hinzugefügt
- Brechbohnen als Alias bei Grüne Bohnen hinzugefügt
- Spitzkohl/Spitzkraut als Aliase bei Weißkohl hinzugefügt
- Weinblätter als Alias bei Traube (selbe Art: Vitis vinifera)
- Hefeflocken als neuer Eintrag unter Pilze

### Entfernte Einträge (nicht wissenschaftskonform)

- Rauchsalz: Kein Pflanzenprodukt
- Kokosöl: Isoliertes Extrakt ohne Fasern
- Trüffelöl: Meist synthetisches Aroma/reines Extrakt
- Vanillezucker: 95% Zucker
- Club Mate: Zuckerhaltige Limonade (Mate als Tee bleibt)
- Leinöl, Sesamöl, Traubenkernöl: Isolierte Extrakte (konsistent mit Kokosöl-Regel)

### Fehlende Aliase (behoben)

- Weizengras/Weizengraspulver als Aliase bei Weizen
- Zitronenschale/Zitronenabrieb als Aliase bei Zitrone
- Orangenschale/Orangenabrieb als Aliase bei Orange
- Österreichische Dialekt-Aliase: Schwammerl(n), Erdäpfl, Kipfler, Heurige, Heiden/Heidenmehl, Ogrosl/Agrasel, Kletzen, Zibeben, Kriacherl/Kriecherl, Murke(n), Umurke, Neugewürz, Strankalan/Strankerl
- Käferbohne als neuer Eintrag (Phaseolus coccineus, steirisches Grundnahrungsmittel)
- Speech Recognition von de-DE auf de-AT umgestellt

### Grenzfälle in der Kategorisierung

- Erdnuss unter Nüsse (botanisch eine Hülsenfrucht)
- Rhabarber unter Obst (botanisch ein Gemüse)
- Kokosnuss unter Obst (botanisch eine Steinfrucht)
- Pilze sind keine Pflanzen (eigenes Biologisches Reich), werden aber allgemein mitgezählt
- Algen (Nori, Wakame, Kombu) unter Gemüse (sind weder Pflanzen noch Pilze)

### Alias-Lücken die bei Tests aufgefallen sind

- "Salat" wurde nicht erkannt (behoben: Alias für Kopfsalat)
- "Grüne Paprika" wurde nicht erkannt (behoben: Adjektiv-Stripping in plantMatcher Tier 5)
- "Brot" war Alias für Weizen (ungenau, Brot kann Roggen/Dinkel sein). Behoben: "Brot"/"Brötchen" entfernt, stattdessen Vorschläge via searchPlants im Voice-Flow

### Adjektiv-Stripping (Tier 5) - Verifizierte Sicherheit

- Compound-Nouns (Süßkartoffel, Blumenkohl) sind sicher: `stripFoodAdjectives()` greift nur bei mehrteiligen Eingaben (min. 2 Wörter)
- "süß" ist nicht in der FOOD_ADJECTIVES-Liste
- "Rote Bete" und "Rote Linsen" matchen in Tier 1 exakt, bevor Tier 5 greift
- Nur führende Adjektive werden entfernt, nie Wörter mitten im String

## Quelle der Einträge

Die initiale Liste wurde mit LLM-Unterstützung erstellt, basierend auf:
- Häufige Pflanzen in deutschsprachigen Supermärkten
- Österreichische und Schweizer Varianten
- Asiatische/internationale Pflanzen die in DE/AT/CH verbreitet sind
- Wildkräuter und Heilpflanzen die als Lebensmittel genutzt werden

Nicht systematisch abgeglichen mit einer Referenzdatenbank. Die Liste ist pragmatisch: was User wahrscheinlich einsprechen oder eintippen. Lücken werden über Tester-Feedback gefunden und gefüllt.

## Migration zur nativen App

Für die native Android-Version:
- Datenformat beibehalten (JSON-Array, gleiche Felder)
- Alias-Liste ist die wertvollste Arbeit, nicht die Pflanzennamen selbst
- Suchindex-Logik (Normalisierung, De-Umlaut, Stemming) ist sprachunabhängig wiederverwendbar
- Bekannte Probleme (Doppeleinträge, Kategorisierungsgrenzen) vor Migration bereinigen
