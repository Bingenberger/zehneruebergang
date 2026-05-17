import type { AppState } from '../types';
import { store } from '../state';

export function renderControlBar(container: HTMLElement, state: AppState) {
  container.innerHTML = '';

  // Mode toggle
  const modeGroup = document.createElement('div');
  modeGroup.className = 'toggle-group';
  modeGroup.setAttribute('role', 'group');
  modeGroup.setAttribute('aria-label', 'Modus wählen');

  for (const [label, value] of [['Schau zu', 'schau-zu'], ['Mach mit', 'mach-mit']] as const) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = state.mode === value ? 'active' : '';
    btn.setAttribute('aria-pressed', String(state.mode === value));
    btn.addEventListener('click', () => store.setMode(value));
    modeGroup.appendChild(btn);
  }

  // Operation toggle
  const opGroup = document.createElement('div');
  opGroup.className = 'toggle-group';
  opGroup.setAttribute('role', 'group');
  opGroup.setAttribute('aria-label', 'Operation wählen');

  for (const [label, value] of [['Plus', 'addition'], ['Minus', 'subtraktion']] as const) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = state.operation === value ? 'active' : '';
    btn.setAttribute('aria-pressed', String(state.operation === value));
    btn.addEventListener('click', () => store.setOperation(value));
    opGroup.appendChild(btn);
  }

  // Mute button
  const muteBtn = document.createElement('button');
  muteBtn.className = 'btn-icon';
  muteBtn.textContent = state.muted ? '🔇' : '🔊';
  muteBtn.setAttribute('aria-label', state.muted ? 'Ton einschalten' : 'Ton ausschalten');
  muteBtn.addEventListener('click', () => store.toggleMute());

  container.appendChild(modeGroup);
  container.appendChild(opGroup);
  container.appendChild(muteBtn);
}
