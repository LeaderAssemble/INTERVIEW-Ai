import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: Pick<User, 'id' | 'email'> | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  isRecovering: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  finishPasswordRecovery: () => void;
  startDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const demoOnly = import.meta.env.VITE_DEMO_ONLY === 'true';
const demoUser = { id: 'interviewai-demo-user', email: 'demo@interviewai.local' };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Pick<User, 'id' | 'email'> | null>(demoOnly ? demoUser : null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!demoOnly);
  const [isDemo, setIsDemo] = useState(demoOnly);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    if (demoOnly || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsDemo(false);
      setIsRecovering(event === 'PASSWORD_RECOVERY');
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: 'Account sign-up is unavailable in this demo.' };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Account sign-in is unavailable in this demo.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const sendPasswordReset = async (email: string) => {
    if (!supabase) return { error: 'Password recovery is unavailable in this demo.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (password: string) => {
    if (!supabase) return { error: 'Password updates are unavailable in this demo.' };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  };

  const finishPasswordRecovery = () => setIsRecovering(false);

  const startDemo = () => {
    setIsDemo(true);
    setUser(demoUser);
    setSession(null);
  };

  const signOut = async () => {
    if (demoOnly) return;
    if (!isDemo && supabase) await supabase.auth.signOut();
    setIsDemo(false);
    setIsRecovering(false);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isDemo,
      isRecovering,
      signUp,
      signIn,
      sendPasswordReset,
      updatePassword,
      finishPasswordRecovery,
      startDemo,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
