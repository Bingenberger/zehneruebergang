import type { AppState } from '../types';
import { store } from '../state';
import { audio } from '../audio';
import { runPhaseTransition } from '../controller';

export function renderNummernfeld(container: HTMLElement, state: AppState) {
  container.innerHTML = '';

  const isInputPhase =
    state.phase === 'eingabeErgaenzung' || state.phase === 'eingabeRest';
  const isMachMit = state.mode === 'mach-mit';

  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement('button');
    btn.className = 'num-btn';
    btn.textContent = String(i);
    btn.setAttribute('aria-label', `Zahl ${i} eingeben`);
    btn.disabled = !isInputPhase || !isMachMit;

    if (isInputPhase && isMachMit) {
      const correctAnswer = getCorrectAnswer(state);
      btn.addEventListener('click', () => handleInput(i, correctAnswer, btn, state));
    }

    container.appendChild(btn);
  }
}

function getCorrectAnswer(state: AppState): number {
  if (!state.currentTask) return -1;
  if (state.phase === 'eingabeErgaenzung') return state.currentTask.ergaenzung;
  if (state.phase === 'eingabeRest') return state.currentTask.rest;
  return -1;
}

function handleInput(value: number, correct: number, btn: HTMLElement, state: AppState) {
  if (value === correct) {
    btn.classList.add('correct');
    audio.stop();
    audio.play('feedback/richtig').catch(() => {});
    setTimeout(() => {
      btn.classList.remove('correct');
      const nextPhase =
        state.phase === 'eingabeErgaenzung' ? 'animationErgaenzung' : 'animationRest';
      runPhaseTransition(nextPhase, state);
    }, 400);
  } else {
    store.registerInputAttempt();
    btn.classList.add('shake');
    audio.stop();
    audio.play('feedback/nochmal').catch(() => {});
    btn.addEventListener('animationend', () => btn.classList.remove('shake'), { once: true });

    // After 2nd wrong attempt, highlight the correct button
    if (store.state.inputAttempts >= 2) {
      showHint(correct);
    }
  }
}

function showHint(correct: number) {
  const allBtns = document.querySelectorAll<HTMLElement>('.num-btn');
  allBtns.forEach((b, i) => {
    if (i + 1 === correct) {
      b.classList.add('hint');
      setTimeout(() => b.classList.remove('hint'), 1500);
    }
  });
}

// Keyboard support
export function setupKeyboardInput(state: () => AppState) {
  document.addEventListener('keydown', (e) => {
    const s = state();
    const digit = parseInt(e.key);
    if (digit >= 1 && digit <= 9 && s.mode === 'mach-mit') {
      if (s.phase === 'eingabeErgaenzung' || s.phase === 'eingabeRest') {
        const correct = s.phase === 'eingabeErgaenzung'
          ? s.currentTask?.ergaenzung ?? -1
          : s.currentTask?.rest ?? -1;
        const btn = document.querySelectorAll<HTMLElement>('.num-btn')[digit - 1];
        if (btn) handleInput(digit, correct, btn, s);
      }
    }
  });
}
