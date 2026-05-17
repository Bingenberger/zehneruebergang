import type { AppState } from '../types';
import { audio } from '../audio';

const PHASE_TEXTS: Record<string, (state: AppState) => string> = {
  idle: (s) => {
    if (!s.currentTask) return 'Drücke „Neue Aufgabe", um zu beginnen.';
    const { a, b, operation } = s.currentTask;
    const op = operation === 'addition' ? 'plus' : 'minus';
    return `Wir rechnen ${a} ${op} ${b}.`;
  },
  ersterSummand: (s) => {
    if (!s.currentTask) return '';
    const { a, b, operation } = s.currentTask;
    const op = operation === 'addition' ? 'plus' : 'minus';
    return `Wir rechnen ${a} ${op} ${b}.`;
  },
  frageErgaenzung: (s) => {
    if (!s.currentTask) return '';
    return s.currentTask.operation === 'addition'
      ? 'Wie viele fehlen bis zur Zehn?'
      : 'Wie viele nehmen wir weg, bis wir bei Zehn sind?';
  },
  eingabeErgaenzung: (s) => {
    if (!s.currentTask) return '';
    return s.currentTask.operation === 'addition'
      ? 'Wie viele fehlen bis zur Zehn?'
      : 'Wie viele nehmen wir weg, bis wir bei Zehn sind?';
  },
  animationErgaenzung: (s) => {
    if (!s.currentTask) return '';
    const { a, ergaenzung, operation } = s.currentTask;
    return operation === 'addition'
      ? `${a} plus ${ergaenzung} ist zehn.`
      : `${a} minus ${ergaenzung} ist zehn.`;
  },
  frageRest: (s) => {
    if (!s.currentTask) return '';
    return s.currentTask.operation === 'addition'
      ? 'Wie viele kommen jetzt noch dazu?'
      : 'Wie viele nehmen wir jetzt noch weg?';
  },
  eingabeRest: (s) => {
    if (!s.currentTask) return '';
    return s.currentTask.operation === 'addition'
      ? 'Wie viele kommen jetzt noch dazu?'
      : 'Wie viele nehmen wir jetzt noch weg?';
  },
  animationRest: (s) => {
    if (!s.currentTask) return '';
    const { rest, result, operation } = s.currentTask;
    return operation === 'addition'
      ? `Zehn plus ${rest} ist ${result}.`
      : `Zehn minus ${rest} ist ${result}.`;
  },
  abschluss: (s) => {
    if (!s.currentTask) return '';
    const { a, b, result, operation } = s.currentTask;
    const op = operation === 'addition' ? 'plus' : 'minus';
    return `${a} ${op} ${b} ist ${result}. Super gemacht!`;
  },
};

// Phasen, die eine zweizeilige Darstellung brauchen: Hinweis + Hauptfrage gleichzeitig
function buildHint(state: AppState): string {
  if (!state.currentTask) return '';
  const { b, ergaenzung } = state.currentTask;
  if (state.phase === 'frageRest' || state.phase === 'eingabeRest') {
    return `In was haben wir die ${b} zerlegt? In ${ergaenzung} und …?`;
  }
  return '';
}

let lastText = '';
let lastHint = '';
let replayClips: string[] = [];

export function renderSprachLeiste(container: HTMLElement, state: AppState) {
  const textFn = PHASE_TEXTS[state.phase];
  const text = textFn ? textFn(state) : '';
  const hint = buildHint(state);

  let hintEl  = container.querySelector<HTMLElement>('.sprach-hint');
  let textEl  = container.querySelector<HTMLElement>('.sprach-text');
  let replayBtn = container.querySelector<HTMLElement>('.btn-replay');

  if (!textEl) {
    container.innerHTML = '';

    const textWrap = document.createElement('div');
    textWrap.className = 'sprach-wrap';

    hintEl = document.createElement('p');
    hintEl.className = 'sprach-hint';
    hintEl.setAttribute('aria-live', 'polite');

    textEl = document.createElement('p');
    textEl.className = 'sprach-text';
    textEl.setAttribute('aria-live', 'polite');
    textEl.setAttribute('aria-atomic', 'true');

    replayBtn = document.createElement('button');
    replayBtn.className = 'btn-replay btn-icon';
    replayBtn.setAttribute('aria-label', 'Satz wiederholen');
    replayBtn.textContent = '🔊';
    replayBtn.addEventListener('click', () => {
      if (replayClips.length) { audio.stop(); audio.sequence(replayClips); }
    });

    textWrap.appendChild(hintEl);
    textWrap.appendChild(textEl);
    container.appendChild(textWrap);
    container.appendChild(replayBtn);
  }

  if (hint !== lastHint) {
    hintEl = container.querySelector<HTMLElement>('.sprach-hint')!;
    hintEl.classList.add('fade');
    setTimeout(() => {
      hintEl!.textContent = hint;
      hintEl!.classList.remove('fade');
      hintEl!.classList.toggle('sprach-hint--visible', hint !== '');
    }, 200);
    lastHint = hint;
  }

  if (text !== lastText) {
    textEl = container.querySelector<HTMLElement>('.sprach-text')!;
    textEl.classList.add('fade');
    setTimeout(() => {
      textEl!.textContent = text;
      textEl!.classList.remove('fade');
    }, 200);
    lastText = text;
  }

  replayClips = buildClips(state);
}

function buildClips(state: AppState): string[] {
  if (!state.currentTask) return [];
  const { a, b, ergaenzung, rest, result, operation } = state.currentTask;
  const opWord = operation === 'addition' ? 'woerter/plus' : 'woerter/minus';
  const pad = (n: number) => String(n).padStart(2, '0');

  switch (state.phase) {
    case 'idle':
    case 'ersterSummand':
      return ['prompts/wir_rechnen', `zahlen/${pad(a)}`, opWord, `zahlen/${pad(b)}`];
    case 'frageErgaenzung':
    case 'eingabeErgaenzung':
      return [operation === 'addition'
        ? 'prompts/wie_viele_bis_zehn'
        : 'prompts/wie_viele_weg_bis_zehn'];
    case 'animationErgaenzung':
      return [`zahlen/${pad(a)}`, opWord, `zahlen/${pad(ergaenzung)}`, 'woerter/ist', `zahlen/10`];
    case 'frageRest':
    case 'eingabeRest':
      return [
        'prompts/in_was_haben_wir_die', `zahlen/${pad(b)}`,
        'prompts/zerlegt_in', `zahlen/${pad(ergaenzung)}`, 'prompts/und_noch',
        operation === 'addition' ? 'prompts/wie_viele_noch_dazu' : 'prompts/wie_viele_noch_weg',
      ];
    case 'animationRest':
      return [`zahlen/10`, opWord, `zahlen/${pad(rest)}`, 'woerter/ist', `zahlen/${pad(result)}`];
    case 'abschluss':
      return [`zahlen/${pad(a)}`, opWord, `zahlen/${pad(b)}`, 'woerter/ist', `zahlen/${pad(result)}`];
    default:
      return [];
  }
}

export { buildClips };
