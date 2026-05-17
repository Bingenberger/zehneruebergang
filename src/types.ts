export type Operation = 'addition' | 'subtraktion';

export type AppMode = 'schau-zu' | 'mach-mit';

export type Phase =
  | 'idle'
  | 'ersterSummand'
  | 'frageErgaenzung'
  | 'eingabeErgaenzung'
  | 'animationErgaenzung'
  | 'frageRest'
  | 'eingabeRest'
  | 'animationRest'
  | 'abschluss';

export interface Task {
  id: string;
  operation: Operation;
  a: number;
  b: number;
  result: number;
  ergaenzung: number; // Perlen bis zur 10
  rest: number;       // Rest nach der 10
}

export interface AppState {
  mode: AppMode;
  operation: Operation;
  currentTask: Task | null;
  phase: Phase;
  inputAttempts: number;
  muted: boolean;
  teacherPanelOpen: boolean;
  paused: boolean;
  // bead positions: how many beads are on the active (left) side
  row1Active: number; // 0-10
  row2Active: number; // 0-10
  // highlight state
  highlightedBeads: { row: 1 | 2; start: number; count: number } | null;
  highlightedTermPart: string | null;
  // filter
  filterFirstOperand: number | null; // null = alle
  manualTask: string | null;
}

