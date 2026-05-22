import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { cleanFirestoreData } from '@/lib/utils';

export interface Preventivo {
  id: string;
  clientName: string;
  policyType: string;
  notes?: string;
  status: 'da_fare' | 'fatto' | 'trattativa_in_corso';
  createdAt: string;
  userId: string;
  premio?: number;
}

export function usePreventivi() {
  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPreventivi([]);
      return;
    }
    const q = query(collection(db, 'preventivi'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Preventivo));
      // Sort by creation date descending
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPreventivi(data);
    });
    return () => unsubscribe();
  }, [user]);

  const addPreventivo = async (input: Omit<Preventivo, 'id' | 'createdAt' | 'userId'> & { createdAt?: string }) => {
    if (!user) return;
    await addDoc(collection(db, 'preventivi'), cleanFirestoreData({
      ...input,
      createdAt: input.createdAt || new Date().toISOString(),
      userId: user.uid
    }));
  };

  const updatePreventivo = async (id: string, patch: Partial<Omit<Preventivo, 'id' | 'userId'>>) => {
    await updateDoc(doc(db, 'preventivi', id), cleanFirestoreData(patch));
  };

  const deletePreventivo = async (id: string) => {
    await deleteDoc(doc(db, 'preventivi', id));
  };

  return { preventivi, addPreventivo, updatePreventivo, deletePreventivo };
}
