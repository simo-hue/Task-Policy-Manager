import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { cleanFirestoreData } from '@/lib/utils';

export interface Claim {
  id: string;
  clientName: string;
  openDate?: string; // YYYY-MM-DD (null/undefined se da aprire)
  ramo: string;
  notes?: string;
  status?: 'liquidato' | 'incaricato' | 'visita_medico_legale' | 'da_aprire' | 'aperto';
  createdAt: string;
  userId: string;
}

export function useClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setClaims([]);
      return;
    }
    const q = query(collection(db, 'claims'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Claim));
      setClaims(data);
    });
    return () => unsubscribe();
  }, [user]);

  const addClaim = async (input: Omit<Claim, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, 'claims'), cleanFirestoreData({
      ...input,
      createdAt: new Date().toISOString(),
      userId: user.uid
    }));
  };

  const updateClaim = async (id: string, patch: Partial<Omit<Claim, 'id' | 'createdAt' | 'userId'>>) => {
    await updateDoc(doc(db, 'claims', id), cleanFirestoreData(patch));
  };

  const deleteClaim = async (id: string) => {
    await deleteDoc(doc(db, 'claims', id));
  };

  return { claims, addClaim, updateClaim, deleteClaim };
}
