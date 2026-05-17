import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import { store } from './state';
import { renderRechenrahmen } from './components/rechenrahmen';
import { renderTermAnzeige } from './components/termAnzeige';
import { renderSprachLeiste } from './components/sprachLeiste';
import { renderNummernfeld, setupKeyboardInput } from './components/nummernfeld';
import { renderControlBar } from './components/controlBar';
import { renderLehrerPanel } from './components/lehrerPanel';
import { runPhaseTransition, togglePause, clearAutoAdvance } from './controller';
import { audio } from './audio';

// ── Preload audio clips ───────────────────────────────
const AUDIO_CLIPS = [
  ...Array.from({ length: 20 }, (_, i) => `zahlen/${String(i + 1).padStart(2, '0')}`),
  'woerter/plus', 'woerter/minus', 'woerter/ist',
  'prompts/wir_rechnen', 'prompts/wie_viele_bis_zehn',
  'prompts/wie_viele_weg_bis_zehn', 'prompts/wie_viele_noch_dazu',
  'prompts/wie_viele_noch_weg', 'prompts/denke_an_die_zehn',
  'prompts/in_was_haben_wir_die', 'prompts/zerlegt_in', 'prompts/und_noch',
  'feedback/richtig', 'feedback/super', 'feedback/klasse', 'feedback/nochmal',
];
audio.preload(AUDIO_CLIPS);

// ── Build DOM skeleton ────────────────────────────────
const app = document.getElementById('app')!;
app.innerHTML = `
  <header class="header">
    <h1>Rechenrahmen-Trainer</h1>
    <div class="control-bar" id="control-bar"></div>
    <button class="btn-icon" id="btn-lehrer" aria-label="Lehrkraft-Bereich öffnen" title="Lehrkraft-Bereich">⚙</button>
  </header>

  <div class="main-grid">
    <div class="term-anzeige" id="term-anzeige"></div>

    <div class="rechenrahmen-wrap" id="rechenrahmen-wrap"></div>

    <div class="sprach-leiste" id="sprach-leiste"></div>

    <div class="eingabe-bereich" id="eingabe-bereich">
      <div class="nummernfeld" id="nummernfeld"></div>
      <div id="rechte-steuerung"></div>
    </div>
  </div>

  <div class="lehrer-panel" id="lehrer-panel"></div>
`;

// ── Element refs ──────────────────────────────────────
const elControlBar = document.getElementById('control-bar')!;
const elTerm = document.getElementById('term-anzeige')!;
const elRR = document.getElementById('rechenrahmen-wrap')!;
const elSprach = document.getElementById('sprach-leiste')!;
const elNummern = document.getElementById('nummernfeld')!;
const elRechte = document.getElementById('rechte-steuerung')!;
const elLehrer = document.getElementById('lehrer-panel')!;
const btnLehrer = document.getElementById('btn-lehrer')!;

btnLehrer.addEventListener('click', () => store.toggleTeacherPanel());

// ── Render all components ─────────────────────────────
function renderAll() {
  const state = store.state;
  renderControlBar(elControlBar, state);
  renderTermAnzeige(elTerm, state);
  renderRechenrahmen(elRR, state);
  renderSprachLeiste(elSprach, state);
  renderNummernfeld(elNummern, state);
  renderRechteSeite(elRechte, state);
  renderLehrerPanel(elLehrer, state);
}

function renderRechteSeite(container: HTMLElement, state: typeof store.state) {
  container.innerHTML = '';

  if (state.mode === 'schau-zu' && state.currentTask && state.phase !== 'idle' && state.phase !== 'abschluss') {
    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'btn-control';
    pauseBtn.textContent = state.paused ? '▶ Weiter' : '⏸ Pause';
    pauseBtn.setAttribute('aria-label', state.paused ? 'Weiter' : 'Pause');
    pauseBtn.addEventListener('click', togglePause);

    const div = document.createElement('div');
    div.className = 'schau-zu-controls';
    div.appendChild(pauseBtn);
    container.appendChild(div);
  }

  const neueBtn = document.createElement('button');
  neueBtn.className = 'btn-neue-aufgabe';
  neueBtn.textContent = 'Neue Aufgabe';
  neueBtn.setAttribute('aria-label', 'Neue Aufgabe starten');
  neueBtn.addEventListener('click', startNewTask);
  container.appendChild(neueBtn);
}

// ── Start new task ────────────────────────────────────
function startNewTask() {
  clearAutoAdvance();
  audio.stop();
  store.startNewTask();
  requestAnimationFrame(() => {
    runPhaseTransition('ersterSummand', store.state);
  });
}

// ── Keyboard shortcuts ────────────────────────────────
setupKeyboardInput(() => store.state);

document.addEventListener('keydown', (e) => {
  const state = store.state;
  if (e.key === ' ' && state.mode === 'schau-zu') {
    e.preventDefault();
    togglePause();
  }
  if (e.key === 'Escape') {
    if (state.currentTask) {
      clearAutoAdvance();
      audio.stop();
      store.patch({
        phase: 'idle',
        row1Active: state.operation === 'subtraktion' ? Math.min(state.currentTask.a, 10) : 0,
        row2Active: state.operation === 'subtraktion' ? Math.max(0, state.currentTask.a - 10) : 0,
        highlightedBeads: null,
        highlightedTermPart: null,
        inputAttempts: 0,
      });
    }
  }
  if (e.key === 'n' || e.key === 'N') {
    startNewTask();
  }
});

// ── Subscribe and initial render ──────────────────────
store.subscribe(renderAll);
renderAll();
