import type { AppState, Phase, Operation, AppMode } from './types';
import { getRandomTask } from './tasks';
import { audio } from './audio';

type Listener = () => void;

class Store {
  private listeners: Listener[] = [];

  state: AppState = {
    mode: 'schau-zu',
    operation: 'addition',
    currentTask: null,
    phase: 'idle',
    inputAttempts: 0,
    muted: false,
    teacherPanelOpen: false,
    paused: false,
    row1Active: 0,
    row2Active: 0,
    highlightedBeads: null,
    highlightedTermPart: null,
    filterFirstOperand: null,
    manualTask: null,
  };

  subscribe(fn: Listener): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  patch(partial: Partial<AppState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  // ---- High-level actions ----

  startNewTask() {
    audio.stop();
    const task = getRandomTask(
      this.state.operation,
      this.state.filterFirstOperand,
      this.state.currentTask?.id
    );
    // For subtraction: a beads active. a > 10 means row1=10, row2=a-10
    const row1 = this.state.operation === 'subtraktion' ? Math.min(task.a, 10) : 0;
    const row2 = this.state.operation === 'subtraktion' ? Math.max(0, task.a - 10) : 0;

    this.state = {
      ...this.state,
      currentTask: task,
      phase: 'idle',
      inputAttempts: 0,
      paused: false,
      row1Active: row1,
      row2Active: row2,
      highlightedBeads: null,
      highlightedTermPart: null,
    };
    this.notify();
  }

  transition(toPhase: Phase) {
    this.state = {
      ...this.state,
      phase: toPhase,
      inputAttempts: 0,
      highlightedBeads: null,
      highlightedTermPart: null,
    };
    this.notify();
  }

  setMode(mode: AppMode) {
    audio.stop();
    this.patch({ mode, paused: false });
  }

  setOperation(op: Operation) {
    audio.stop();
    this.patch({ operation: op, currentTask: null, phase: 'idle', row1Active: 0, row2Active: 0 });
  }

  toggleMute() {
    const muted = !this.state.muted;
    audio.setMuted(muted);
    this.patch({ muted });
  }

  togglePause() {
    this.patch({ paused: !this.state.paused });
  }

  registerInputAttempt() {
    this.patch({ inputAttempts: this.state.inputAttempts + 1 });
  }

  toggleTeacherPanel() {
    this.patch({ teacherPanelOpen: !this.state.teacherPanelOpen });
  }
}

export const store = new Store();
