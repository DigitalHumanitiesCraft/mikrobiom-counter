<script lang="ts">
  interface Props {
    onclick: () => void;
    disabled?: boolean;
  }

  let { onclick, disabled = false }: Props = $props();
</script>

<button class="mic-button" {onclick} {disabled}>
  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
  <span>Spracheingabe</span>
</button>

<style>
  .mic-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.1s ease, background 0.2s ease;
    box-shadow: 0 2px 8px rgba(45, 106, 79, 0.3);
  }

  .mic-button:active {
    transform: scale(0.97);
  }

  .mic-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
