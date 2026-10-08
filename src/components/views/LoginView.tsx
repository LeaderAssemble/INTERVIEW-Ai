import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic2, Mail, Lock, Sun, Moon, Loader2, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export function LoginView({
  passwordRecovery = false,
  onBack,
}: {
  passwordRecovery?: boolean;
  onBack?: () => void;
}) {
  const {
    signIn,
    signUp,
    sendPasswordReset,
    updatePassword,
    finishPasswordRecovery,
    startDemo,
  } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!passwordRecovery && !email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    let authError: string | null;
    try {
      if (passwordRecovery) {
        ({ error: authError } = await updatePassword(password));
      } else {
        const fn = mode === 'signin' ? signIn : signUp;
        ({ error: authError } = await fn(email.trim(), password));
      }
    } catch (requestError) {
      setLoading(false);
      setError(requestError instanceof Error ? requestError.message : 'Authentication request failed.');
      return;
    }
    setLoading(false);

    if (authError) {
      if (authError.toLowerCase().includes('already registered') || authError.toLowerCase().includes('already been registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (authError.toLowerCase().includes('invalid credentials') || authError.toLowerCase().includes('invalid login')) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(authError);
      }
      return;
    }

    if (mode === 'signup') {
      setSuccessMessage('Account created. Check your email if confirmation is required.');
    }
    if (passwordRecovery) {
      setSuccessMessage('Password updated. You can now continue using your account.');
      finishPasswordRecovery();
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setSuccessMessage(null);
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await sendPasswordReset(email.trim());
      setLoading(false);
      if (resetError) {
        setError(resetError);
      } else {
        setSuccessMessage('If an account exists for that email, a password reset link has been sent.');
      }
    } catch (requestError) {
      setLoading(false);
      setError(requestError instanceof Error ? requestError.message : 'Password reset request failed.');
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      {/* Theme toggle */}
      {onBack && !passwordRecovery && (
        <button
          onClick={onBack}
          className="absolute left-4 top-6 z-10 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-secondary-300 transition-colors hover:bg-secondary-800/50 hover:text-white sm:left-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>
      )}

      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl glass hover:border-white/20 transition-all z-10"
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
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30 mb-4"
          >
            <Mic2 className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text mb-2">InterviewAI</h1>
          <p className="text-secondary-400 text-sm">
            {passwordRecovery
              ? 'Choose a new password for your account.'
              : mode === 'signin'
                ? 'Welcome back! Sign in to continue.'
                : 'Create an account to get started.'}
          </p>
        </div>

        {/* Form card */}
        <div className="card space-y-6">
          {/* Mode tabs */}
          {!passwordRecovery && (
            <div className="flex gap-1 p-1 rounded-xl bg-secondary-800/30 border border-secondary-700/30">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-secondary-400 hover:text-secondary-200 border border-transparent'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-secondary-400 hover:text-secondary-200 border border-transparent'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            {!passwordRecovery && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="input-field pl-11"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signin' && !passwordRecovery ? 'Your password' : 'At least 6 characters'}
                  autoComplete={mode === 'signin' && !passwordRecovery ? 'current-password' : 'new-password'}
                  className="input-field pl-11"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-success-500/10 border border-success-500/20 text-success-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : passwordRecovery ? (
                <>Update Password</>
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {!passwordRecovery && mode === 'signin' && (
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={loading}
              className="w-full text-sm text-primary-400 hover:text-primary-300"
            >
              Forgot password?
            </button>
          )}

          {!passwordRecovery && (
            <button
              type="button"
              onClick={startDemo}
              className="btn-secondary w-full"
            >
              Try a demo without signing in
            </button>
          )}

          {/* Switch link */}
          {!passwordRecovery && <p className="text-center text-sm text-secondary-400">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>}
        </div>

        <p className="text-center text-xs text-secondary-500 mt-6">
          Practice makes perfect. Your interview journey starts here.
        </p>
      </motion.div>
    </div>
  );
}
