import type { AppState, Phase } from '../types';

type CellStyle = 'normal' | 'link' | 'highlight' | 'new' | 'placeholder' | 'pulse';

interface CellSpec { text: string; style: CellStyle }

let lastPhase: Phase | '' = '';

export function renderTermAnzeige(container: HTMLElement, state: AppState) {
  const isEntry = state.phase !== lastPhase;
  lastPhase = state.phase;

  container.innerHTML = '';

  if (!state.currentTask) {
    const p = document.createElement('p');
    p.className = 'term-empty';
    p.textContent = '…';
    container.appendChild(p);
    return;
  }

  const { a, b, ergaenzung, rest, result, operation } = state.currentTask;
  const phase = state.phase;
  const opChar = operation === 'addition' ? '+' : '−';

  const showRow2 = ['animationErgaenzung','frageRest','eingabeRest','animationRest','abschluss'].includes(phase);
  const showRow3 = ['animationRest','abschluss'].includes(phase);
  const isAbschluss = phase === 'abschluss';
  const isFrEntry = isEntry && phase === 'frageRest';

  // Bei Einstieg in frageRest: b und ergaenzung pulsen, um den Zusammenhang zu betonen
  const bStyle: CellStyle = isFrEntry ? 'pulse' : (showRow2 ? 'link' : 'normal');

  const ergStyle: CellStyle =
    isFrEntry                                          ? 'pulse'     :
    (isEntry && phase === 'animationErgaenzung')       ? 'new'       :
    ['animationErgaenzung','frageRest',
     'eingabeRest'].includes(phase)                    ? 'highlight' :
    'normal';

  const restStyle: CellStyle =
    (isEntry && phase === 'animationRest') ? 'new'       :
    phase === 'animationRest'              ? 'highlight' :
    'normal';

  const resStyle: CellStyle = isAbschluss ? (isEntry ? 'new' : 'normal') : 'placeholder';
  const resText = isAbschluss ? String(result) : '?';

  const stack = document.createElement('div');
  stack.className = 'term-stack';

  // Oval zuerst einfügen → liegt hinter den Text-Zellen (DOM-Reihenfolge)
  if (isAbschluss && showRow3) {
    const oval = document.createElement('span');
    oval.className = 'term-oval';
    oval.style.gridRow = '1 / 4';
    oval.style.gridColumn = '3';
    oval.setAttribute('aria-hidden', 'true');
    stack.appendChild(oval);
  }

  // Zeile 1: a op b = ?/Ergebnis
  addCells(stack, 1, [
    { text: String(a),  style: 'normal'  },
    { text: opChar,     style: 'normal'  },
    { text: String(b),  style: bStyle    },
    { text: '=',        style: 'normal'  },
    { text: resText,    style: resStyle  },
  ], false);

  // Zeile 2: a op ergaenzung = 10
  if (showRow2) {
    addCells(stack, 2, [
      { text: String(a),          style: 'normal'  },
      { text: opChar,             style: 'normal'  },
      { text: String(ergaenzung), style: ergStyle  },
      { text: '=',                style: 'normal'  },
      { text: '10',               style: 'normal'  },
    ], isEntry && phase === 'animationErgaenzung');
  }

  // Zeile 3: 10 op rest = Ergebnis
  if (showRow3) {
    addCells(stack, 3, [
      { text: '10',           style: 'normal'  },
      { text: opChar,         style: 'normal'  },
      { text: String(rest),   style: restStyle },
      { text: '=',            style: 'normal'  },
      { text: String(result), style: 'normal'  },
    ], isEntry && phase === 'animationRest');
  }

  container.appendChild(stack);
}

function addCells(
  grid: HTMLElement,
  row: number,
  cells: CellSpec[],
  animate: boolean,
) {
  cells.forEach((c, col) => {
    const span = document.createElement('span');
    const cls = ['term-cell', `tc-col${col + 1}`];
    if (c.style !== 'normal') cls.push(`tc-${c.style}`);
    if (animate) cls.push('tc-row-entry');
    span.className = cls.join(' ');
    span.style.gridRow = String(row);
    span.style.gridColumn = String(col + 1);
    if (animate) span.style.animationDelay = `${col * 35}ms`;
    span.textContent = c.text;
    grid.appendChild(span);
  });
}
