import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Brain,
  FileText,
  LogIn,
  Mic,
  Mic2,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface LandingViewProps {
  onLogin: () => void;
}

const features = [
  {
    icon: Brain,
    title: 'AI Questions',
    description: 'Role-specific questions tailored to your interview goals.',
  },
  {
    icon: Mic,
    title: 'Voice Input',
    description: 'Practice answering naturally with voice or text.',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Track your interview practice and see your progress.',
  },
  {
    icon: FileText,
    title: 'PDF Reports',
    description: 'Keep a report of your interview feedback and scores.',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Get helpful feedback after every answer.',
  },
  {
    icon: Shield,
    title: 'Multiple Categories',
    description: 'Prepare for HR, technical, and behavioral interviews.',
  },
];

export function LandingView({ onLogin }: LandingViewProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-secondary-950 via-secondary-900 to-secondary-950 text-secondary-100">
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="glass-dark border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex h-16 items-center justify-between">
              <a href="#home" className="flex items-center gap-3" aria-label="InterviewAI home">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
                  <Mic2 className="h-5 w-5 text-white" />
                </span>
                <span>
                  <span className="block text-xl font-bold gradient-text">InterviewAI</span>
                  <span className="hidden text-xs text-secondary-400 sm:block">Mock Interview Platform</span>
                </span>
              </a>

              <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
                <a
                  href="#home"
                  className="rounded-lg bg-primary-500/20 px-4 py-2 font-medium text-primary-400"
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="rounded-lg px-4 py-2 font-medium text-secondary-300 transition-all duration-300 hover:bg-secondary-800/50 hover:text-white"
                >
                  Features
                </a>
              </nav>

              <div className="flex items-center gap-3">
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={toggleTheme}
                  className="rounded-lg bg-secondary-800/50 p-2 transition-colors hover:bg-secondary-700/50"
                  aria-label="Toggle theme"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5 text-warning-400" />
                    ) : (
                      <Moon className="h-5 w-5 text-primary-400" />
                    )}
                  </motion.div>
                </motion.button>
                <button
                  onClick={onLogin}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-500/20 px-4 py-2 font-medium text-primary-400 transition-all duration-300 hover:bg-primary-500/30"
                  aria-label="Sign in"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="home" className="pt-16">
        <section className="relative isolate px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <div className="absolute left-[15%] top-12 h-72 w-72 rounded-full bg-primary-600/10 blur-[110px]" />
            <div className="absolute right-[12%] top-24 h-72 w-72 rounded-full bg-accent-500/10 blur-[110px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-4xl flex-col items-center text-center"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary-400/10 bg-primary-500/10 px-4 py-2 text-sm text-primary-300">
              <Sparkles className="h-4 w-4" />
              AI-powered interview practice
            </div>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Ace Your Next
              <span className="mt-1 block bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
                Interview with AI
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-secondary-400 sm:text-lg">
              Build confidence with realistic mock interviews, personalized questions, and clear feedback
              to help you take the next step in your career.
            </p>
            <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <button
                onClick={onLogin}
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Start Free Interview
                <ArrowRight className="h-5 w-5" />
              </button>
              <a href="#features" className="btn-secondary text-center">
                Explore Features
              </a>
            </div>
          </motion.div>
        </section>

        <section id="features" className="bg-secondary-900/70 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-center sm:mb-12"
            >
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Everything You Need to <span className="gradient-text">Succeed</span>
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-secondary-400">
                Practical tools to help you prepare, practice, and improve at your own pace.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, index) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="glass rounded-2xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-primary-500/5"
                >
                  <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-secondary-400">{description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-3xl font-bold text-white">Your next opportunity starts with practice.</h2>
          <p className="mx-auto mt-3 max-w-xl text-secondary-400">
            Sign in or create an account to start building interview confidence.
          </p>
          <button onClick={onLogin} className="btn-primary mt-7 inline-flex items-center gap-2">
            Get Started
            <ArrowRight className="h-5 w-5" />
          </button>
        </section>
      </main>

      <footer className="border-t border-white/5 px-4 py-6 text-center text-sm text-secondary-500">
        <span className="gradient-text font-semibold">InterviewAI</span>
        <span className="mx-2">·</span>
        Practice makes perfect
      </footer>
    </div>
  );
}
