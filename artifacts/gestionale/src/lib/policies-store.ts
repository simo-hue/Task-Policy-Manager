import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { cleanFirestoreData } from '@/lib/utils';

export interface Policy {
  id: string;
  clientName: string;
  policyType: string;
  notes?: string;
  status: 'da_emettere' | 'emessa';
  expiryDate?: string;
  targetIssueDate?: string;
  createdAt: string;
  issuedAt?: string;
  daMettereACassa?: boolean;
  cassaStato?: 'regolare' | 'da_mettere' | 'pagata';
  userId: string;
  premio?: number;
}

export function usePoliciesPersonali() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPolicies([]);
      return;
    }
    const q = query(collection(db, 'policies_personali'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Policy));
      setPolicies(data);
    });
    return () => unsubscribe();
  }, [user]);

  const addPolicy = async (input: Omit<Policy, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, 'policies_personali'), cleanFirestoreData({
      ...input,
      createdAt: new Date().toISOString(),
      userId: user.uid
    }));
  };

  const updatePolicy = async (id: string, patch: Partial<Omit<Policy, 'id' | 'createdAt' | 'userId'>>) => {
    await updateDoc(doc(db, 'policies_personali', id), cleanFirestoreData(patch));
  };

  const deletePolicy = async (id: string) => {
    await deleteDoc(doc(db, 'policies_personali', id));
  };

  return { policies, addPolicy, updatePolicy, deletePolicy };
}

export function usePoliciesAgenzia() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPolicies([]);
      return;
    }
    const q = query(collection(db, 'policies_agenzia'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Policy));
      setPolicies(data);
    });
    return () => unsubscribe();
  }, [user]);

  const addPolicy = async (input: Omit<Policy, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, 'policies_agenzia'), cleanFirestoreData({
      ...input,
      createdAt: new Date().toISOString(),
      userId: user.uid
    }));
  };

  const updatePolicy = async (id: string, patch: Partial<Omit<Policy, 'id' | 'createdAt' | 'userId'>>) => {
    await updateDoc(doc(db, 'policies_agenzia', id), cleanFirestoreData(patch));
  };

  const deletePolicy = async (id: string) => {
    await deleteDoc(doc(db, 'policies_agenzia', id));
  };

  return { policies, addPolicy, updatePolicy, deletePolicy };
}
