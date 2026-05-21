import { useLocalStorage } from '@/hooks/use-local-storage';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

const initialTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: 'Richiamare Mario Rossi',
    notes: 'Per rinnovo polizza auto',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Inviare preventivo Studio Bianchi',
    createdAt: new Date().toISOString(),
  }
];

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('gestionale.tasks.v1', initialTasks);

  const addTask = (input: Omit<Task, 'id' | 'createdAt'>) => {
    setTasks(prev => [...prev, { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
  };

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completedAt: new Date().toISOString() } : t));
  };

  const reopenTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completedAt: undefined } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = (id: string, input: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...input } : t));
  };

  return { tasks, addTask, completeTask, reopenTask, deleteTask, updateTask };
}
