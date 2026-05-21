import { useLocalStorage } from '@/hooks/use-local-storage';
import { safeUUID } from '@/lib/utils';

export interface Claim {
  id: string;
  clientName: string;
  openDate: string; // YYYY-MM-DD
  ramo: string;
  notes?: string;
  createdAt: string;
}

const initialClaims: Claim[] = [
  {
    id: safeUUID(),
    clientName: 'Luca Verdi',
    openDate: '2026-05-10',
    ramo: 'RC Auto',
    notes: 'Tamponamento a catena in autostrada. CID compilato.',
    createdAt: new Date().toISOString(),
  },
  {
    id: safeUUID(),
    clientName: 'Elena Neri',
    openDate: '2026-05-18',
    ramo: 'Infortuni',
    notes: 'Caduta accidentale durante attività sportiva.',
    createdAt: new Date().toISOString(),
  }
];

export function useClaims() {
  const [claims, setClaims] = useLocalStorage<Claim[]>('gestionale.claims.v1', initialClaims);

  const addClaim = (input: Omit<Claim, 'id' | 'createdAt'>) => {
    setClaims(prev => [...prev, { ...input, id: safeUUID(), createdAt: new Date().toISOString() }]);
  };

  const updateClaim = (id: string, patch: Partial<Omit<Claim, 'id' | 'createdAt'>>) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const deleteClaim = (id: string) => {
    setClaims(prev => prev.filter(c => c.id !== id));
  };

  return { claims, addClaim, updateClaim, deleteClaim };
}
