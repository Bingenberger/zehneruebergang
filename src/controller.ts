import type { Phase, AppState, Task } from './types';
import { store } from './state';
import { audio } from './audio';
import { animateBeads } from './components/rechenrahmen';

// Short pause after audio finishes before advancing to the next phase
const POST_AUDIO_PAUSE = 400;
// Wait time in input phases (schau-zu mode) – gives pupils time to think
const INPUT_WAIT = 1000;

let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

function clearAutoAdvance() {
  if (autoAdvanceTimer !== null) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
}

function scheduleNext(nextPhase: Phase, delayMs: number) {
  clearAutoAdvance();
  autoAdvanceTimer = setTimeout(() => {
    if (!store.state.paused) runPhaseTransition(nextPhase, store.state);
  }, delayMs);
}

// Returns the sequence promise so callers can await it
function playClips(clips: string[], state: AppState): Promise<void> {
  audio.stop();
  if (state.muted) return Promise.resolve();
  return audio.sequence(clips);
}

// ── Main transition entry point ───────────────────────
export async function runPhaseTransition(toPhase: Phase, prevState: AppState) {
  const task = prevState.currentTask;
  if (!task) return;

  clearAutoAdvance();
  store.transition(toPhase);
  const state = store.state;

  await handlePhase(toPhase, task, state);
}

async function handlePhase(phase: Phase, task: Task, state: AppState) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const opWord = task.operation === 'addition' ? 'woerter/plus' : 'woerter/minus';
  const rrContainer = document.querySelector<HTMLElement>('.rechenrahmen-wrap');

  switch (phase) {

    case 'ersterSummand': {
      const clips = ['prompts/wir_rechnen', `zahlen/${pad(task.a)}`, opWord, `zahlen/${pad(task.b)}`];
      const audioP = playClips(clips, state);
      const animP = (task.operation === 'addition' && rrContainer)
        ? animateBeads(rrContainer, 1, 0, task.a).then(() => store.patch({ row1Active: task.a }))
        : Promise.resolve();
      await Promise.all([audioP, animP]);
      if (store.state.phase !== phase) break;
      scheduleNext('frageErgaenzung', POST_AUDIO_PAUSE);
      break;
    }

    case 'frageErgaenzung': {
      const clip = task.operation === 'addition'
        ? 'prompts/wie_viele_bis_zehn'
        : 'prompts/wie_viele_weg_bis_zehn';
      await playClips([clip], state);
      if (store.state.phase !== phase) break;
      scheduleNext('eingabeErgaenzung', POST_AUDIO_PAUSE);
      break;
    }

    case 'eingabeErgaenzung': {
      if (state.mode === 'schau-zu') {
        scheduleNext('animationErgaenzung', INPUT_WAIT);
      }
      break;
    }

    case 'animationErgaenzung': {
      const clips = [
        `zahlen/${pad(task.a)}`, opWord, `zahlen/${pad(task.ergaenzung)}`, 'woerter/ist', 'zahlen/10',
      ];
      const audioP = playClips(clips, state);

      let animP: Promise<void> = Promise.resolve();
      if (rrContainer) {
        if (task.operation === 'addition') {
          store.patch({ highlightedBeads: { row: 1, start: task.a + 1, count: task.ergaenzung } });
          animP = animateBeads(rrContainer, 1, task.a, 10).then(() => {
            store.patch({ row1Active: 10, highlightedBeads: null });
          });
        } else {
          const row2Start = Math.max(0, task.a - 10);
          if (row2Start > 0 && task.ergaenzung <= row2Start) {
            store.patch({ highlightedBeads: { row: 2, start: row2Start - task.ergaenzung + 1, count: task.ergaenzung } });
            animP = animateBeads(rrContainer, 2, row2Start, row2Start - task.ergaenzung).then(() => {
              store.patch({ row2Active: row2Start - task.ergaenzung, highlightedBeads: null });
            });
          } else if (row2Start > 0) {
            animP = (async () => {
              await animateBeads(rrContainer, 2, row2Start, 0);
              store.patch({ row2Active: 0 });
              const remaining = task.ergaenzung - row2Start;
              await animateBeads(rrContainer, 1, 10, 10 - remaining);
              store.patch({ row1Active: 10 - remaining, highlightedBeads: null });
            })();
          } else {
            animP = animateBeads(rrContainer, 1, task.a, task.a - task.ergaenzung).then(() => {
              store.patch({ row1Active: task.a - task.ergaenzung });
            });
          }
        }
      }

      await Promise.all([audioP, animP]);
      store.patch({ highlightedTermPart: 'decomp' });
      if (store.state.phase !== phase) break;
      scheduleNext('frageRest', POST_AUDIO_PAUSE);
      break;
    }

    case 'frageRest': {
      const frClips = [
        'prompts/in_was_haben_wir_die', `zahlen/${pad(task.b)}`,
        'prompts/zerlegt_in', `zahlen/${pad(task.ergaenzung)}`, 'prompts/und_noch',
        task.operation === 'addition' ? 'prompts/wie_viele_noch_dazu' : 'prompts/wie_viele_noch_weg',
      ];
      await playClips(frClips, state);
      if (store.state.phase !== phase) break;
      scheduleNext('eingabeRest', POST_AUDIO_PAUSE);
      break;
    }

    case 'eingabeRest': {
      if (state.mode === 'schau-zu') {
        scheduleNext('animationRest', INPUT_WAIT);
      }
      break;
    }

    case 'animationRest': {
      const clips = [
        'zahlen/10', opWord, `zahlen/${pad(task.rest)}`, 'woerter/ist', `zahlen/${pad(task.result)}`,
      ];
      const audioP = playClips(clips, state);

      let animP: Promise<void> = Promise.resolve();
      if (rrContainer) {
        if (task.operation === 'addition') {
          store.patch({ highlightedBeads: { row: 2, start: 1, count: task.rest } });
          animP = animateBeads(rrContainer, 2, 0, task.rest).then(() => {
            store.patch({ row2Active: task.rest, highlightedBeads: null });
          });
        } else {
          const currentRow1 = store.state.row1Active;
          store.patch({ highlightedBeads: { row: 1, start: currentRow1 - task.rest + 1, count: task.rest } });
          animP = animateBeads(rrContainer, 1, currentRow1, currentRow1 - task.rest).then(() => {
            store.patch({ row1Active: currentRow1 - task.rest, highlightedBeads: null });
          });
        }
      }

      await Promise.all([audioP, animP]);
      store.patch({ highlightedTermPart: 'step1' });
      if (store.state.phase !== phase) break;
      scheduleNext('abschluss', POST_AUDIO_PAUSE);
      break;
    }

    case 'abschluss': {
      store.patch({ highlightedTermPart: 'result' });
      spawnKonfetti();
      const clips = [
        `zahlen/${pad(task.a)}`, opWord, `zahlen/${pad(task.b)}`,
        'woerter/ist', `zahlen/${pad(task.result)}`,
      ];
      await playClips(clips, state);
      if (store.state.phase !== phase) break;
      if (!store.state.muted) {
        await audio.play('feedback/super');
      }
      break;
    }
  }
}

function spawnKonfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#E89923', '#5A8B3A', '#2B5C8F', '#C73E3E'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'konfetti-particle';
    p.style.left = `${20 + Math.random() * 60}vw`;
    p.style.top = `${10 + Math.random() * 30}vh`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    p.style.animation = `konfettiFall ${0.8 + Math.random() * 1.2}s ease-in forwards`;
    p.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove(), { once: true });
  }
}

export function togglePause() {
  store.togglePause();
  if (!store.state.paused) {
    runPhaseTransition(store.state.phase, store.state);
  } else {
    clearAutoAdvance();
    audio.stop();
  }
}

export { clearAutoAdvance };
