import type { AppState } from '../types';
import { store } from '../state';
import { getAllTasks } from '../tasks';

export function renderLehrerPanel(container: HTMLElement, state: AppState) {
  container.className = `lehrer-panel${state.teacherPanelOpen ? ' open' : ''}`;
  container.setAttribute('aria-label', 'Lehrkraft-Einstellungen');
  container.setAttribute('role', 'dialog');
  container.innerHTML = '';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'lehrer-panel-close btn-icon';
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Panel schließen');
  closeBtn.addEventListener('click', () => store.toggleTeacherPanel());
  container.appendChild(closeBtn);

  const title = document.createElement('h2');
  title.textContent = 'Lehrkraft';
  container.appendChild(title);

  // Filter: first operand
  const filterLabel = document.createElement('label');
  filterLabel.textContent = 'Erstes Element filtern';
  const filterSelect = document.createElement('select');
  const allOpt = document.createElement('option');
  allOpt.value = '';
  allOpt.textContent = 'Alle';
  filterSelect.appendChild(allOpt);

  const values = state.operation === 'addition'
    ? [2, 3, 4, 5, 6, 7, 8, 9]
    : [11, 12, 13, 14, 15, 16, 17, 18];

  for (const v of values) {
    const opt = document.createElement('option');
    opt.value = String(v);
    opt.textContent = String(v);
    if (state.filterFirstOperand === v) opt.selected = true;
    filterSelect.appendChild(opt);
  }

  filterSelect.addEventListener('change', () => {
    const val = filterSelect.value ? parseInt(filterSelect.value) : null;
    store.patch({ filterFirstOperand: val });
  });

  filterLabel.appendChild(filterSelect);
  container.appendChild(filterLabel);

  // Task list
  const listTitle = document.createElement('p');
  listTitle.style.fontWeight = '700';
  listTitle.style.marginTop = '8px';
  listTitle.textContent = 'Aufgabe direkt wählen:';
  container.appendChild(listTitle);

  const taskList = document.createElement('div');
  taskList.className = 'task-list';

  const tasks = getAllTasks(state.operation);
  for (const t of tasks) {
    const btn = document.createElement('button');
    btn.className = 'task-item';
    const op = t.operation === 'addition' ? '+' : '−';
    btn.textContent = `${t.a} ${op} ${t.b} = ${t.result}`;
    if (state.currentTask?.id === t.id) {
      btn.style.fontWeight = '700';
      btn.style.borderColor = 'var(--accent)';
    }
    btn.addEventListener('click', () => {
      store.patch({
        currentTask: t,
        phase: 'idle',
        inputAttempts: 0,
        row1Active: t.operation === 'subtraktion' ? Math.min(t.a, 10) : 0,
        row2Active: t.operation === 'subtraktion' ? Math.max(0, t.a - 10) : 0,
        highlightedBeads: null,
        highlightedTermPart: null,
      });
      store.toggleTeacherPanel();
    });
    taskList.appendChild(btn);
  }

  container.appendChild(taskList);

  // Reset progress button
  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn-control';
  resetBtn.style.marginTop = '12px';
  resetBtn.textContent = 'Fortschritt zurücksetzen';
  resetBtn.addEventListener('click', () => {
    store.patch({
      currentTask: null,
      phase: 'idle',
      row1Active: 0,
      row2Active: 0,
      inputAttempts: 0,
    });
    store.toggleTeacherPanel();
  });
  container.appendChild(resetBtn);
}
