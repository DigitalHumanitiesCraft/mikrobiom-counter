<script lang="ts">
  import { untrack } from 'svelte';
  import { isSpeechAvailable, isOnline, createRecognition } from '../lib/speechService';
  import { parseTranscript } from '../lib/transcriptParser';
  import { matchPlant, searchPlants, type MatchResult } from '../lib/plantMatcher';
  import { PLANTS } from '../data/plants';

  interface Props {
    onconfirm: (plants: { id: string; name: string }[]) => void;
    onclose: () => void;
  }

  let { onconfirm, onclose }: Props = $props();

  type State = 'ready' | 'listening' | 'results' | 'error';

  let phase = $state<State>('ready');
  let interimText = $state('');
  let errorMessage = $state('');
  let matches = $state<MatchResult[]>([]);
  let selected = $state<Set<number>>(new Set());
  let recognition: SpeechRecognition | null = null;

  function startListening() {
    if (!isSpeechAvailable()) {
      errorMessage = 'Spracheingabe wird in diesem Browser nicht unterstützt.';
      phase = 'error';
      return;
    }

    if (!isOnline()) {
      errorMessage = 'Keine Internetverbindung. Spracheingabe benötigt Internet.';
      phase = 'error';
      return;
    }

    phase = 'listening';
    interimText = '';

    recognition = createRecognition({
      onInterim: (text) => {
        interimText = text;
      },
      onFinal: (text) => {
        processTranscript(text);
      },
      onError: (error) => {
        errorMessage = error;
        phase = 'error';
      },
      onEnd: () => {
        if (phase === 'listening') {
          if (interimText) {
            // Final result never arrived — use interim text
            processTranscript(interimText);
          } else {
            errorMessage = 'Nichts erkannt. Bitte nochmal versuchen.';
            phase = 'error';
          }
        }
      },
    });

    recognition?.start();
  }

  function stopListening() {
    recognition?.stop();
    recognition = null;
  }

  function processTranscript(transcript: string) {
    const tokens = parseTranscript(transcript);
    const rawMatches = tokens.map(t => matchPlant(t));

    // Expand: replace unmatched terms with their search suggestions as individual entries
    const expanded: MatchResult[] = [];
    const selectedSet = new Set<number>();

    for (const m of rawMatches) {
      if (m.confidence === 'none') {
        // Find plants that have an ALIAS ending with the search term
        // "Brot" → Weizen (via "Weizenbrot"), Roggen (via "Roggenbrot"), Dinkel (via "Dinkelbrot")
        // Filters out: Johannisbrot (plant name, not an alias ending in "Brot")
        // Filters out: Kokosmilch noise when someone just says "Milch"... wait, that passes.
        // But at least suggestions are NOT pre-selected, so user actively chooses.
        const term = m.matchedTerm.toLowerCase();
        const suggestions = searchPlants(m.matchedTerm, 10).filter(p =>
          p.aliases.some(a => a.toLowerCase().endsWith(term))
        );

        if (suggestions.length > 0) {
          for (const plant of suggestions.slice(0, 5)) {
            expanded.push({ plant, confidence: 'medium', matchedTerm: m.matchedTerm });
            // Suggestions are NOT pre-selected — user picks actively
          }
        } else {
          expanded.push(m); // truly unmatched
        }
      } else {
        const idx = expanded.length;
        expanded.push(m);
        if (m.plant) selectedSet.add(idx);
      }
    }

    matches = expanded;
    selected = selectedSet;
    phase = 'results';
  }

  function toggleMatch(index: number) {
    const next = new Set(selected);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    selected = next;
  }

  function confirm() {
    const seen = new Set<string>();
    const plants: { id: string; name: string }[] = [];
    for (const [i, m] of matches.entries()) {
      if (selected.has(i) && m.plant && !seen.has(m.plant.id)) {
        seen.add(m.plant.id);
        plants.push({ id: m.plant.id, name: m.plant.name });
      }
    }

    if (plants.length > 0) {
      onconfirm(plants);
    }
  }

  async function reportUnknown(term: string) {
    const text = `Mikrobiom Counter Feedback:\n„${term}" wurde nicht erkannt.\nIch denke, das sollte zählen.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Feedback: Fehlender Eintrag', text });
        return;
      } catch (_) { /* user cancelled or share failed */ }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      alert('Feedback in Zwischenablage kopiert!');
    } catch (_) {
      // Last resort: mailto
      window.open(`mailto:?subject=${encodeURIComponent('Fehlender Eintrag: ' + term)}&body=${encodeURIComponent(text)}`);
    }
  }

  function retry() {
    errorMessage = '';
    matches = [];
    selected = new Set();
    startListening();
  }

  // Start listening on mount, cleanup on unmount
  $effect(() => {
    untrack(() => startListening());
    return () => stopListening();
  });
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') onclose(); }} />
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-backdrop" onclick={onclose}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    {#if phase === 'listening'}
      <div class="listening">
        <div class="mic-pulse">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--color-primary)">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </div>
        <p class="listening-text">Ich höre zu...</p>
        {#if interimText}
          <p class="interim">"{interimText}"</p>
        {/if}
        <button class="btn-secondary" onclick={stopListening}>Stopp</button>
      </div>

    {:else if phase === 'results'}
      <div class="results">
        <h3>Erkannte Pflanzen</h3>
        {#if matches.length === 0}
          <p class="no-results">Keine Pflanzen erkannt.</p>
        {:else}
          <ul class="match-list">
            {#each matches as match, i}
              <li class="match-item" class:unmatched={!match.plant}>
                {#if match.plant}
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onchange={() => toggleMatch(i)}
                    />
                    <span class="match-name">{match.plant.name}</span>
                    {#if match.confidence !== 'exact'}
                      {@const alias = match.plant.aliases.find(a => a.toLowerCase().includes(match.matchedTerm.toLowerCase()))}
                      <span class="match-source">{alias ? `(${alias})` : `(${match.matchedTerm})`}</span>
                    {/if}
                  </label>
                {:else}
                  <div class="match-unknown-block">
                    <span class="match-unknown">"{match.matchedTerm}" - nicht erkannt</span>
                    <span class="match-unknown-hint">Nur ganze Pflanzen werden gezählt. Siehe "Was zählt?" in den Einstellungen.</span>
                    <button class="report-btn" onclick={() => reportUnknown(match.matchedTerm)}>Fehler melden</button>
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
        <div class="actions">
          <button class="btn-secondary" onclick={retry}>Nochmal</button>
          <button
            class="btn-primary"
            onclick={confirm}
            disabled={selected.size === 0}
          >
            Speichern ({selected.size})
          </button>
        </div>
      </div>

    {:else if phase === 'error'}
      <div class="error-state">
        <p class="error-msg">{errorMessage}</p>
        <div class="actions">
          <button class="btn-secondary" onclick={onclose}>Abbrechen</button>
          <button class="btn-primary" onclick={retry}>Nochmal versuchen</button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }

  .modal {
    background: var(--color-surface);
    border-radius: 1rem;
    padding: 1.5rem;
    margin: 1rem;
    max-width: 400px;
    width: 100%;
  }

  .listening {
    text-align: center;
    padding: 1rem 0;
  }

  .mic-pulse {
    display: inline-flex;
    padding: 1rem;
    border-radius: 50%;
    background: rgba(45, 106, 79, 0.1);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  .listening-text {
    margin-top: 1rem;
    font-size: 1.1rem;
    color: var(--color-text);
  }

  .interim {
    margin-top: 0.5rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .results h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .match-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .match-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .match-item label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .match-name {
    font-weight: 500;
  }

  .match-source {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .match-unknown {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .unmatched {
    opacity: 0.6;
  }

  .match-unknown-block {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .match-unknown-hint {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .report-btn {
    padding: 0.25rem 0.6rem;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    font-size: 0.7rem;
    color: var(--color-text-muted);
    cursor: pointer;
    align-self: flex-start;
  }

  .no-results {
    color: var(--color-text-muted);
    text-align: center;
    padding: 1rem 0;
  }

  .error-state {
    text-align: center;
    padding: 1rem 0;
  }

  .error-msg {
    color: var(--color-danger);
    margin-bottom: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .btn-primary {
    padding: 0.6rem 1.5rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    padding: 0.6rem 1.5rem;
    background: none;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
  }
</style>
