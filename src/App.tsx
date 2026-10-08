import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { SessionProvider } from './contexts/SessionContext';
import { StreakProvider } from './contexts/StreakContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/views/Dashboard';
import { InterviewView } from './components/views/InterviewView';
import { HistoryView } from './components/views/HistoryView';
import { LoginView } from './components/views/LoginView';
import { LandingView } from './components/views/LandingView';
import { Chatbot } from './components/interview/Chatbot';
import { View } from './types';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading, isRecovering } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!user) setShowLogin(false);
  }, [user]);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-950 via-secondary-900 to-secondary-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-secondary-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (isRecovering) {
    return <LoginView passwordRecovery />;
  }

  if (!user) {
    return showLogin
      ? <LoginView onBack={() => setShowLogin(false)} />
      : <LandingView onLogin={() => setShowLogin(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-secondary-950 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950">
      <Header currentView={currentView} onNavigate={handleNavigate} />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
              {currentView === 'interview' && <InterviewView onNavigate={handleNavigate} />}
              {currentView === 'history' && <HistoryView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-4 px-6 glass-dark border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-secondary-500">
          <div className="flex items-center gap-2">
            <span className="gradient-text font-semibold">InterviewAI</span>
            <span>-</span>
            <span>Practice makes perfect</span>
          </div>
          <div className="text-xs">
            Built with React, TypeScript & Framer Motion
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StreakProvider>
          <SessionProvider>
            <AppContent />
          </SessionProvider>
        </StreakProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
