import type { AppState } from '../types';

export function renderRechenrahmen(container: HTMLElement, state: AppState) {
  container.innerHTML = '';

  const rr = document.createElement('div');
  rr.className = 'rechenrahmen';
  rr.setAttribute('aria-label', '20er Rechenrahmen');
  rr.setAttribute('role', 'img');

  for (let row = 1; row <= 2; row++) {
    const active = row === 1 ? state.row1Active : state.row2Active;
    rr.appendChild(buildRow(row as 1 | 2, active, state));
  }

  container.appendChild(rr);
}

function buildRow(
  row: 1 | 2,
  activeCount: number,
  state: AppState
): HTMLElement {
  const reihe = document.createElement('div');
  reihe.className = 'reihe';
  reihe.setAttribute('aria-label', `Reihe ${row}`);

  const beadContainer = document.createElement('div');
  beadContainer.className = 'bead-container';

  // Group 1: beads 1-5 (red)
  const group1 = document.createElement('div');
  group1.className = 'bead-group';

  for (let i = 1; i <= 5; i++) {
    group1.appendChild(makeBead(i, row, activeCount, state));
  }

  // Visual gap between the two groups of 5
  const gap = document.createElement('div');
  gap.className = 'bead-gap';

  // Group 2: beads 6-10 (blue)
  const group2 = document.createElement('div');
  group2.className = 'bead-group';

  for (let i = 6; i <= 10; i++) {
    group2.appendChild(makeBead(i, row, activeCount, state));
  }

  beadContainer.appendChild(group1);
  beadContainer.appendChild(gap);
  beadContainer.appendChild(group2);
  reihe.appendChild(beadContainer);

  return reihe;
}

function makeBead(
  position: number,
  row: 1 | 2,
  activeCount: number,
  state: AppState
): HTMLElement {
  const bead = document.createElement('div');
  const isRed = position <= 5;
  const isActive = position <= activeCount;

  bead.className = [
    'bead',
    isRed ? 'red' : 'blue',
    isActive ? '' : 'inactive',
  ].filter(Boolean).join(' ');

  bead.setAttribute('aria-hidden', 'true');

  // Apply highlight
  const h = state.highlightedBeads;
  if (h && h.row === row) {
    // Highlighted beads: positions start..start+count-1 (1-indexed)
    if (position >= h.start && position < h.start + h.count) {
      bead.classList.add('highlighted');
    }
  }

  return bead;
}

// Animate beads from one count to another
export async function animateBeads(
  container: HTMLElement,
  row: 1 | 2,
  fromCount: number,
  toCount: number,
  stagger = true
): Promise<void> {
  // Find bead elements in the container
  const rr = container.querySelector('.rechenrahmen');
  if (!rr) return;

  const reihen = rr.querySelectorAll<HTMLElement>('.reihe');
  const targetReihe = reihen[row - 1];
  if (!targetReihe) return;

  const beads = targetReihe.querySelectorAll<HTMLElement>('.bead');
  const isAdding = toCount > fromCount;
  const positions = isAdding
    ? range(fromCount + 1, toCount)
    : range(toCount + 1, fromCount);

  const delays = stagger
    ? positions.map((_, i) => i * 50)
    : positions.map(() => 0);

  const promises = positions.map((pos, i) =>
    animateSingleBead(beads[pos - 1], delays[i], isAdding)
  );

  await Promise.all(promises);
}

function animateSingleBead(
  bead: HTMLElement | undefined,
  delay: number,
  activate: boolean
): Promise<void> {
  if (!bead) return Promise.resolve();
  return new Promise(resolve => {
    setTimeout(() => {
      bead.classList.add('highlighted');
      if (activate) {
        bead.classList.remove('inactive');
      } else {
        bead.classList.add('inactive');
      }
      setTimeout(() => {
        bead.classList.remove('highlighted');
        resolve();
      }, 320 + 80);
    }, delay);
  });
}

function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) result.push(i);
  return result;
}
