import { useLocalStorage } from '@/hooks/use-local-storage';
import { safeUUID } from '@/lib/utils';

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
}

const initialPoliciesPersonali: Policy[] = [
  {
    id: safeUUID(),
    clientName: 'Mario Rossi',
    policyType: 'RC Auto Personale',
    status: 'emessa',
    expiryDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    issuedAt: new Date().toISOString(),
    daMettereACassa: true,
  }
];

const initialPoliciesAgenzia: Policy[] = [
  {
    id: safeUUID(),
    clientName: 'Studio Bianchi SRL',
    policyType: 'RC Professionale Agenzia',
    status: 'da_emettere',
    targetIssueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  }
];

export function usePoliciesPersonali() {
  const [policies, setPolicies] = useLocalStorage<Policy[]>('gestionale.policies.personali.v1', initialPoliciesPersonali);

  const addPolicy = (input: Omit<Policy, 'id' | 'createdAt'>) => {
    setPolicies(prev => [...prev, { ...input, id: safeUUID(), createdAt: new Date().toISOString() }]);
  };

  const updatePolicy = (id: string, patch: Partial<Omit<Policy, 'id' | 'createdAt'>>) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  const deletePolicy = (id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  return { policies, addPolicy, updatePolicy, deletePolicy };
}

export function usePoliciesAgenzia() {
  const [policies, setPolicies] = useLocalStorage<Policy[]>('gestionale.policies.agenzia.v1', initialPoliciesAgenzia);

  const addPolicy = (input: Omit<Policy, 'id' | 'createdAt'>) => {
    setPolicies(prev => [...prev, { ...input, id: safeUUID(), createdAt: new Date().toISOString() }]);
  };

  const updatePolicy = (id: string, patch: Partial<Omit<Policy, 'id' | 'createdAt'>>) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  const deletePolicy = (id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  return { policies, addPolicy, updatePolicy, deletePolicy };
}
