import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { cleanFirestoreData } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  userId: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      // Ordina per data di creazione, i più recenti in alto se non hanno una dueDate? 
      // Lasciamo che la UI gestisca l'ordine, restituiamo solo i dati.
      setTasks(data);
    });
    return () => unsubscribe();
  }, [user]);

  const addTask = async (input: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, 'tasks'), cleanFirestoreData({
      ...input,
      createdAt: new Date().toISOString(),
      userId: user.uid
    }));
  };

  const completeTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const reopenTask = async (id: string) => {
    await updateDoc(doc(db, 'tasks', id), cleanFirestoreData({
      completedAt: null
    }));
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const updateTask = async (id: string, input: Partial<Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'userId'>>) => {
    await updateDoc(doc(db, 'tasks', id), cleanFirestoreData(input));
  };

  return { tasks, addTask, completeTask, reopenTask, deleteTask, updateTask };
}
