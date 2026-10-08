import { motion } from 'framer-motion';
import { Sun, Moon, Menu, X, Mic2, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { View } from '../../types';
import { useState } from 'react';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isDemo, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { view: View; label: string }[] = [
    { view: 'dashboard', label: 'Dashboard' },
    { view: 'interview', label: 'Practice' },
    { view: 'history', label: 'History' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">InterviewAI</h1>
                <p className="text-xs text-secondary-400 hidden sm:block">Mock Interview Platform</p>
              </div>
            </motion.div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.view}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onNavigate(item.view)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentView === item.view
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-secondary-300 hover:text-white hover:bg-secondary-800/50'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-secondary-400">
                  <span className="max-w-[160px] truncate">{isDemo ? 'Demo mode' : user.email}</span>
                </div>
              )}

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary-800/50 hover:bg-secondary-700/50 transition-colors"
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-warning-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-primary-400" />
                  )}
                </motion.div>
              </motion.button>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg bg-secondary-800/50 hover:bg-error-500/20 text-secondary-300 hover:text-error-400 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-secondary-800/50 hover:bg-secondary-700/50 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4"
            >
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigate(item.view);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    currentView === item.view
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-secondary-300 hover:text-white hover:bg-secondary-800/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </motion.nav>
          )}
        </div>
      </div>
    </header>
  );
}
