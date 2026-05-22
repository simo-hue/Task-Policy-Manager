import { useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL;
    if (allowedEmail && email !== allowedEmail) {
      const err = new Error("Accesso negato: Indirizzo email non autorizzato.");
      toast({
        title: "Errore di accesso",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto nel gestionale.",
      });
    } catch (e: any) {
      toast({
        title: "Errore di accesso",
        description: e.message,
        variant: "destructive"
      });
      throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
    toast({
      title: "Disconnesso",
      description: "Hai effettuato il logout.",
    });
  };

  return { user, loading, login, logout };
}
