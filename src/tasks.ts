import type { Task, Operation } from './types';

// All single-digit addends where a+b ∈ [11,20]
const ADDITION_TASKS: [number, number][] = [
  [2, 9],
  [3, 8], [3, 9],
  [4, 7], [4, 8], [4, 9],
  [5, 6], [5, 7], [5, 8], [5, 9],
  [6, 5], [6, 6], [6, 7], [6, 8], [6, 9],
  [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9],
  [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8], [8, 9],
  [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9],
];

// All tasks a-b where a ∈ [11,18], b single-digit, result ∈ [1,9]
const SUBTRACTION_TASKS: [number, number][] = [
  [11, 2], [11, 3], [11, 4], [11, 5], [11, 6], [11, 7], [11, 8], [11, 9],
  [12, 3], [12, 4], [12, 5], [12, 6], [12, 7], [12, 8], [12, 9],
  [13, 4], [13, 5], [13, 6], [13, 7], [13, 8], [13, 9],
  [14, 5], [14, 6], [14, 7], [14, 8], [14, 9],
  [15, 6], [15, 7], [15, 8], [15, 9],
  [16, 7], [16, 8], [16, 9],
  [17, 8], [17, 9],
  [18, 9],
];

function buildTask(operation: Operation, a: number, b: number): Task {
  const isAdd = operation === 'addition';
  const result = isAdd ? a + b : a - b;
  const ergaenzung = isAdd ? 10 - a : a - 10;
  const rest = b - ergaenzung;

  return {
    id: `${operation}-${a}-${b}`,
    operation,
    a,
    b,
    result,
    ergaenzung,
    rest,
  };
}

export function getAllTasks(operation: Operation): Task[] {
  const pairs = operation === 'addition' ? ADDITION_TASKS : SUBTRACTION_TASKS;
  return pairs.map(([a, b]) => buildTask(operation, a, b));
}

export function getRandomTask(
  operation: Operation,
  filter: number | null = null,
  exclude?: string
): Task {
  let tasks = getAllTasks(operation);
  if (filter !== null) {
    tasks = tasks.filter(t => t.a === filter);
  }
  if (exclude && tasks.length > 1) {
    tasks = tasks.filter(t => t.id !== exclude);
  }
  const idx = Math.floor(Math.random() * tasks.length);
  return tasks[idx];
}

export function getTaskById(id: string, operation: Operation): Task | undefined {
  return getAllTasks(operation).find(t => t.id === id);
}
