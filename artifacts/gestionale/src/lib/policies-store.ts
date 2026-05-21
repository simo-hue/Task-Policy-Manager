import { useLocalStorage } from '@/hooks/use-local-storage';

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
}

const initialPolicies: Policy[] = [
  {
    id: crypto.randomUUID(),
    clientName: 'Mario Rossi',
    policyType: 'RC Auto',
    status: 'emessa',
    expiryDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    issuedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    clientName: 'Studio Bianchi SRL',
    policyType: 'RC Professionale',
    status: 'da_emettere',
    targetIssueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  }
];

export function usePolicies() {
  const [policies, setPolicies] = useLocalStorage<Policy[]>('gestionale.policies.v1', initialPolicies);

  const addPolicy = (input: Omit<Policy, 'id' | 'createdAt'>) => {
    setPolicies(prev => [...prev, { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
  };

  const updatePolicy = (id: string, patch: Partial<Omit<Policy, 'id' | 'createdAt'>>) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  const deletePolicy = (id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  const issuePolicy = (id: string, expiryDate: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { 
      ...p, 
      status: 'emessa', 
      expiryDate, 
      targetIssueDate: undefined,
      issuedAt: new Date().toISOString() 
    } : p));
  };

  return { policies, addPolicy, updatePolicy, deletePolicy, issuePolicy };
}
