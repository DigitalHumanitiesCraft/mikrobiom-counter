<script lang="ts">
  import { getSettingsStore } from '../stores/settingsStore.svelte';
  import { exportJSON, importJSON, clearAllData } from '../lib/exportService';
  import { getWeekStore } from '../stores/weekStore.svelte';
  import { PLANTS } from '../data/plants';
  import { CATEGORY_LABELS, type PlantCategory } from '../data/types';

  const store = getSettingsStore();
  const weekStore = getWeekStore();

  let importMessage = $state('');
  let showDeleteConfirm = $state(false);

  const version = __APP_VERSION__;
  const plantCount = PLANTS.length;
  const categoryCount = Object.keys(CATEGORY_LABELS).length;

  // Count plants per category
  const categoryCounts: Record<string, number> = {};
  for (const p of PLANTS) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  type TipEntry = { cat: PlantCategory; tips: string[] };
  const tips: TipEntry[] = [
    { cat: 'gewuerze', tips: ['Jedes Gewürz zählt einzeln!', 'Pfeffer, Kurkuma, Zimt, Kreuzkümmel, Kardamom ...', 'Auch Gewürzmischungen: Curry, Garam Masala, Za\'atar'] },
    { cat: 'genuss', tips: ['Kaffee = Kaffeebohne (Pflanze!)', 'Dunkle Schokolade = Kakao', 'Grüner, schwarzer, weißer Tee = Camellia', 'Mate'] },
    { cat: 'huelsenfruechte', tips: ['Tofu, Tempeh, Miso, Sojasauce = Sojabohne', 'Erdnüsse sind Hülsenfrüchte', 'Hummus = Kichererbsen', 'Jede Bohnenart zählt einzeln (Kidney, schwarze, weiße ...)'] },
    { cat: 'getreide', tips: ['Vollkorn-Pasta = Weizen (normale Pasta aus Weißmehl zählt nicht)', 'Vollkornreis, Naturreis = zählt (weißer Reis zählt nicht)', 'Couscous = Weizen (Vollkorn bevorzugt)', 'Haferflocken, Porridge = Hafer', 'Brot? Kommt drauf an: Weizen-, Roggen- oder Dinkelbrot', 'Pseudogetreide: Quinoa, Amaranth, Buchweizen'] },
    { cat: 'kraeuter', tips: ['Jedes Kraut zählt einzeln', 'Auch als Tee: Kamille, Pfefferminze, Salbei', 'Wildkräuter: Brennnessel, Löwenzahn, Bärlauch'] },
    { cat: 'samen', tips: ['Sesam (auch Tahini!)', 'Leinsamen, Chiasamen, Hanfsamen', 'Senf = Senfkörner', 'Mohn, Sonnenblumenkerne, Kürbiskerne'] },
    { cat: 'nuesse', tips: ['Jede Nuss einzeln: Walnuss, Cashew, Mandel ...', 'Kokosnuss zählt auch!', 'Muskatnuss (das Gewürz)'] },
    { cat: 'pilze', tips: ['Pilze sind keine Pflanzen, zählen aber trotzdem!', 'Champignon, Shiitake, Austernpilz, Pfifferling ...'] },
    { cat: 'gemuese', tips: ['Algen zählen: Nori (Sushi!), Wakame', 'Sprossen: Sojasprossen, Alfalfa', 'Salat = Kopfsalat, Feldsalat, Rucola ... jeder einzeln'] },
    { cat: 'obst', tips: ['Oliven zählen', 'Avocado ist eine Frucht', 'Trockenfrüchte zählen (Datteln, Rosinen ...)', '100% Direktsaft zählt (frisch gepresster OJ = Orange)'] },
  ];

  async function handleImport(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const { added, skipped } = await importJSON(file);
      const parts: string[] = [];
      if (added > 0) parts.push(`${added} Einträge importiert`);
      if (skipped > 0) parts.push(`${skipped} Duplikate übersprungen`);
      importMessage = parts.join(', ') + '.';
      if (added === 0 && skipped > 0) importMessage = `Alle ${skipped} Einträge waren bereits vorhanden.`;
      await weekStore.refresh();
    } catch (err) {
      importMessage = `Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`;
    }
    input.value = '';
  }

  async function handleDelete() {
    await clearAllData();
    showDeleteConfirm = false;
    importMessage = 'Alle Daten gelöscht.';
    await weekStore.refresh();
  }
</script>

<div class="settings-view">
  <h2>Einstellungen</h2>

  <section class="setting-group guide">
    <details>
      <summary class="guide-header">
        <span class="guide-title">Was zählt alles?</span>
        <span class="guide-subtitle">{plantCount} Pflanzen in {categoryCount} Kategorien</span>
      </summary>
      <div class="guide-content">
        <p class="guide-intro">
          Das <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5954204/" target="_blank" rel="noopener"><em>American Gut Project</em></a> (2018, 10.000+ Teilnehmer) hat gezeigt: Wer 30+ verschiedene pflanzliche Lebensmittel pro Woche isst, hat ein signifikant diverseres Darmmikrobiom als jemand mit weniger als 10.
        </p>
        <p class="guide-intro">
          Jedes pflanzliche Lebensmittel = 1 Punkt — gezählt wird auf Lebensmittel-Ebene, wie in der Originalstudie. Unabhängig von Menge oder Zubereitung.
        </p>

        <h3 class="guide-section-title">Was zählt?</h3>
        <p class="guide-rule">Ganze oder minimal verarbeitete Pflanzen. Frisch, getrocknet, tiefgekühlt, eingelegt oder fermentiert. Smoothies und 100% Direktsäfte zählen (jede Zutat/Frucht einzeln).</p>

        {#each tips as { cat, tips: items }}
          <div class="tip-category">
            <h4>{CATEGORY_LABELS[cat]} <span class="tip-count">({categoryCounts[cat]})</span></h4>
            <ul>
              {#each items as item}
                <li>{item}</li>
              {/each}
            </ul>
          </div>
        {/each}

        <h3 class="guide-section-title">Was zählt nicht?</h3>
        <ul class="exclusion-list">
          <li>Ultra-verarbeitete Produkte (Chips, Schokoriegel, Fertiggerichte)</li>
          <li>Industriesäfte, Nektar, Saft aus Konzentrat</li>
          <li>Sirup, raffinierter Zucker</li>
          <li>Weißmehlprodukte (Weißbrot, normale Pasta aus Auszugsmehl, weißer Reis)</li>
          <li>Isolierte Extrakte (Öle, Nahrungsergänzungsmittel)</li>
        </ul>

        <p class="guide-source">
          Quelle: McDonald et al., <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5954204/" target="_blank" rel="noopener"><em>American Gut: an Open Platform for Citizen Science Microbiome Research</em></a>, mSystems 2018.
          Die Forschung wird weitergeführt als <a href="https://microsetta.ucsd.edu/" target="_blank" rel="noopener"><em>The Microsetta Initiative</em></a> (UC San Diego).
          Für aktuelle Studien und Hintergründe: <a href="https://www.gutmicrobiotaforhealth.com/" target="_blank" rel="noopener"><em>Gut Microbiota for Health</em></a> (ESNM).
        </p>
      </div>
    </details>
  </section>

  <section class="setting-group guide">
    <details>
      <summary class="guide-header">
        <span class="guide-title">Tipps</span>
        <span class="guide-subtitle">9 Hacks + 5 Klarstellungen</span>
      </summary>
      <div class="guide-content">
        <h3 class="guide-section-title">Schnell auf 30</h3>
        <ul class="tips-list">
          <li><strong>Samen-Streuer</strong>: Chia, Lein, Hanf, Kürbiskerne, Sonnenblumenkerne, Sesam in ein Glas mischen. Löffel drüber = 6 Pflanzen!</li>
          <li><strong>TK-Mix statt Mono</strong>: Waldbeer-Mix statt nur Himbeeren (4 statt 1!). Gemüse-Mix statt nur Erbsen</li>
          <li><strong>Gewürzregal durchzählen</strong>: Jedes einzelne Gewürz zählt! Wer selbst würzt, sammelt schnell 5–8 Extra-Punkte</li>
          <li><strong>Frühstücks-Baukasten</strong>: Porridge + Samen-Streuer + Obst = 8–10 Pflanzen pro Frühstück</li>
          <li><strong>Bohnen-Mix aus der Dose</strong>: Die bunte Dose nehmen (Kidney, weiße, Kichererbsen) = 3 statt 1</li>
          <li><strong>Kräuter auf alles</strong>: Jedes zählt einzeln! Auch reiner Kräutertee (Kamillentee, Pfefferminztee)</li>
          <li><strong>Nussmix statt eine Sorte</strong>: Studentenfutter statt nur Mandeln = 4 Punkte im Vorbeigehen</li>
          <li><strong>Dips zählen mit</strong>: Hummus = Kichererbsen + Sesam (Tahini!) + Knoblauch = 3 Pflanzen (Zutatenliste checken)</li>
          <li><strong>Suppen &amp; Eintöpfe</strong>: Gemüsesuppe mit 6–10 Zutaten = Wochen-Jackpot</li>
        </ul>

        <h3 class="guide-section-title">Gut zu wissen</h3>
        <ul class="tips-list">
          <li><strong>Gleiche Pflanzenart = 1 Punkt</strong>: Paprika, Chili, Jalapeño, Peperoni und Paprikapulver sind alles Capsicum annuum = 1 Punkt. Auch Fenchel + Fenchelsamen oder Koriander + Koriandersamen: gleiche Pflanze, egal welcher Teil</li>
          <li><strong>Tee-Falle</strong>: Grüner, schwarzer, weißer Tee = selbe Pflanze (Camellia sinensis) = 1 Punkt. Kräutertees zählen dagegen einzeln!</li>
          <li><strong>Mischungen = 1 Punkt</strong>: Currypulver, Kräuter der Provence, 7-Kräuter-Tee: eine Mischung = 1 Punkt, egal wie viele Zutaten. Die einzelnen Gewürze sind nur in Spuren enthalten. Einzeln verwenden = einzeln zählen</li>
          <li><strong>Weißmehl &amp; weißer Reis = 0 Punkte</strong>: Semmel, Weißbrot, normale Pasta aus Auszugsmehl und geschälter weißer Reis zählen nicht. Nur Vollkorn (auch Vollkorn-Basmati oder Vollkorn-Jasmin zählen!)</li>
          <li><strong>Fermentiert = Bonus</strong>: Sauerkraut zählt 1 Punkt (Weißkohl), ist aber durch Fermentation extra wertvoll fürs Mikrobiom. Gilt auch für Kimchi, Miso, Tempeh</li>
        </ul>
      </div>
    </details>
  </section>

  <section class="setting-group">
    <label class="setting-row">
      <span class="setting-label">Wochenziel</span>
      <input
        type="number"
        min="1"
        max="100"
        value={store.settings.weeklyGoal}
        onchange={(e) => store.update({ weeklyGoal: parseInt((e.target as HTMLInputElement).value) || 30 })}
      />
    </label>

    <label class="setting-row">
      <span class="setting-label">Serien-Schwelle</span>
      <input
        type="number"
        min="1"
        max="100"
        value={store.settings.streakThreshold}
        onchange={(e) => store.update({ streakThreshold: parseInt((e.target as HTMLInputElement).value) || 20 })}
      />
      <span class="setting-hint">Min. Pflanzen für Serie</span>
    </label>
  </section>

  <section class="setting-group guide">
    <details>
      <summary class="guide-header">
        <span class="guide-title">Daten</span>
        <span class="guide-subtitle">Backup & Zurücksetzen</span>
      </summary>
      <div class="guide-content">
        <button class="btn" onclick={exportJSON}>Backup exportieren</button>

        <label class="btn btn-file">
          Backup importieren
          <input type="file" accept=".json" onchange={handleImport} hidden />
        </label>

        {#if !showDeleteConfirm}
          <button class="btn btn-danger" onclick={() => showDeleteConfirm = true}>
            Alle Daten löschen
          </button>
        {:else}
          <div class="confirm-delete">
            <p>Wirklich alle Daten löschen?</p>
            <div class="button-group">
              <button class="btn" onclick={() => showDeleteConfirm = false}>Abbrechen</button>
              <button class="btn btn-danger" onclick={handleDelete}>Ja, löschen</button>
            </div>
          </div>
        {/if}

        {#if importMessage}
          <p class="import-msg">{importMessage}</p>
        {/if}
      </div>
    </details>
  </section>

  <section class="setting-group info">
    <p>Mikrobiom Counter v{version}</p>
    <p>Daten werden lokal auf deinem Gerät gespeichert.</p>
    <p class="info-links">
      Ein Projekt von <a href="https://dhcraft.org" target="_blank" rel="noopener">DHCraft</a>
      · <a href="https://github.com/DigitalHumanitiesCraft/mikrobiom-counter" target="_blank" rel="noopener">GitHub</a>
    </p>
  </section>
</div>

<style>
  .settings-view {
    padding: 1.5rem 1rem;
  }

  h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 0.75rem;
  }

  .setting-group {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .setting-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .setting-label {
    flex: 1;
    font-size: 0.9rem;
  }

  .setting-hint {
    width: 100%;
    font-size: 0.7rem;
    color: var(--color-text-muted);
  }

  .setting-row input[type="number"] {
    width: 60px;
    padding: 0.4rem;
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
    font-size: 0.9rem;
    text-align: center;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .btn {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 0.6rem 1rem;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .btn-file {
    cursor: pointer;
  }

  .btn-danger {
    color: var(--color-danger);
    border-color: var(--color-danger);
  }

  .button-group .btn {
    flex: 1;
    margin-bottom: 0;
  }

  .confirm-delete {
    padding: 0.75rem;
    background: rgba(231, 111, 81, 0.05);
    border-radius: 0.5rem;
    text-align: center;
  }

  .confirm-delete p {
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .import-msg {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    text-align: center;
  }

  .info {
    text-align: center;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .info p {
    margin-bottom: 0.25rem;
  }

  .info-links {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border);
  }

  .info-links a {
    color: var(--color-primary);
    text-decoration: none;
  }

  /* Guide / Glossary */
  .guide {
    padding: 0;
  }

  .guide details {
    width: 100%;
  }

  .guide summary {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    padding-right: 2rem;
    cursor: pointer;
    list-style: none;
    position: relative;
  }

  .guide summary::-webkit-details-marker {
    display: none;
  }

  .guide summary::after {
    content: '›';
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
    color: var(--color-text-muted);
    transition: transform 0.2s;
  }

  .guide details[open] summary::after {
    transform: translateY(-50%) rotate(90deg);
  }

  .guide-title {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .guide-subtitle {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 2px;
  }

  .guide-content {
    padding: 0 1rem 1rem;
  }

  .guide-intro {
    font-size: 0.82rem;
    color: var(--color-text);
    line-height: 1.45;
    margin-bottom: 0.75rem;
  }

  .tip-category {
    margin-bottom: 0.6rem;
  }

  .tip-category h4 {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: 0.2rem;
  }

  .tip-count {
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .tip-category ul {
    margin: 0;
    padding-left: 1.2rem;
  }

  .tip-category li {
    font-size: 0.78rem;
    color: var(--color-text);
    line-height: 1.4;
    padding: 1px 0;
  }

  .guide-section-title {
    font-size: 0.82rem;
    font-weight: 600;
    margin-top: 0.75rem;
    margin-bottom: 0.4rem;
  }

  .guide-rule {
    font-size: 0.78rem;
    color: var(--color-text);
    line-height: 1.4;
    margin-bottom: 0.5rem;
  }

  .exclusion-list {
    margin: 0;
    padding-left: 1.2rem;
  }

  .exclusion-list li {
    font-size: 0.78rem;
    color: var(--color-text);
    line-height: 1.4;
    padding: 1px 0;
  }

  .tips-list {
    margin: 0;
    padding-left: 1.2rem;
  }

  .tips-list li {
    font-size: 0.78rem;
    color: var(--color-text);
    line-height: 1.4;
    padding: 2px 0;
  }

  .guide-source {
    margin-top: 0.75rem;
    font-size: 0.72rem;
    color: var(--color-text-muted);
    line-height: 1.4;
    border-top: 1px solid var(--color-border);
    padding-top: 0.6rem;
  }

  .guide-source a {
    color: var(--color-primary);
    text-decoration: underline;
  }
</style>
