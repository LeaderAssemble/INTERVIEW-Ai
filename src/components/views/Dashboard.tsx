import { motion } from 'framer-motion';
import {
  TrendingUp, Target, Clock, Award, ChevronRight,
  Mic, Code, Users
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell } from 'recharts';
import { useSession } from '../../contexts/SessionContext';
import { StreakDisplay } from '../interview/StreakDisplay';
import { View } from '../../types';
import { format } from 'date-fns';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { sessionStats, sessionHistory } = useSession();

  const performanceTrend = sessionHistory.slice(-7).map((session) => ({
    date: format(new Date(session.startedAt), 'MMM dd'),
    score: session.overallScore || 0,
  }));

  const categoryData = [
    { category: 'HR', score: sessionStats.categoryScores.hr, fullMark: 100 },
    { category: 'Technical', score: sessionStats.categoryScores.technical, fullMark: 100 },
    { category: 'Behavioral', score: sessionStats.categoryScores.behavioral, fullMark: 100 },
  ];

  const sessionsByCategory = [
    { name: 'HR', count: sessionHistory.filter(s => s.category === 'hr').length, color: '#3b82f6' },
    { name: 'Technical', count: sessionHistory.filter(s => s.category === 'technical').length, color: '#10b981' },
    { name: 'Behavioral', count: sessionHistory.filter(s => s.category === 'behavioral').length, color: '#f59e0b' },
  ];
  const feedbacks = sessionHistory.flatMap(session => session.feedbacks);
  const skillScores = [
    { label: 'Clarity', value: feedbacks.length ? feedbacks.reduce((sum, feedback) => sum + feedback.clarity, 0) / feedbacks.length : null },
    { label: 'Relevance', value: feedbacks.length ? feedbacks.reduce((sum, feedback) => sum + feedback.relevance, 0) / feedbacks.length : null },
    { label: 'Completeness', value: feedbacks.length ? feedbacks.reduce((sum, feedback) => sum + feedback.completeness, 0) / feedbacks.length : null },
    { label: 'Confidence (text)', value: feedbacks.length ? feedbacks.reduce((sum, feedback) => sum + feedback.confidence, 0) / feedbacks.length : null },
  ];
  const focusSkill = skillScores
    .filter((skill): skill is { label: string; value: number } => skill.value !== null)
    .sort((first, second) => first.value - second.value)[0];

  const categoryCards = [
    {
      id: 'hr',
      title: 'HR Interview',
      description: 'Master common HR questions about yourself, experience, and career goals',
      icon: Users,
      color: 'primary',
      questions: 8,
    },
    {
      id: 'technical',
      title: 'Technical Interview',
      description: 'Practice system design, coding concepts, and technical problem-solving',
      icon: Code,
      color: 'accent',
      questions: 8,
    },
    {
      id: 'behavioral',
      title: 'Behavioral Interview',
      description: 'Excel at STAR-method questions about past experiences and challenges',
      icon: Target,
      color: 'warning',
      questions: 8,
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome to <span className="gradient-text">InterviewAI</span>
        </h1>
        <p className="text-secondary-400 max-w-2xl">
          Practice mock interviews with clear, transcript-based feedback. Signed-in users can also
          enable Gemini for tailored questions and AI-generated evaluation.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Total Sessions"
          value={sessionStats.totalSessions}
          color="primary"
          delay={0}
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${sessionStats.averageScore}%`}
          color="accent"
          delay={0.1}
        />
        <StatCard
          icon={Clock}
          label="Avg. Duration"
          value={`${Math.floor(sessionStats.averageDuration / 60)}m`}
          color="warning"
          delay={0.2}
        />
        <StatCard
          icon={Award}
          label="Improvement"
          value={`${sessionStats.improvementRate > 0 ? '+' : ''}${sessionStats.improvementRate}%`}
          color={sessionStats.improvementRate >= 0 ? 'success' : 'error'}
          delay={0.3}
        />
      </div>

      <div className="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Next practice focus</h2>
          <p className="text-sm text-secondary-400 mt-1">
            {focusSkill
              ? `Your current lowest transcript-based area is ${focusSkill.label} (${Math.round(focusSkill.value)}%). Focus on this in your next answer.`
              : 'Complete an interview to get a personalized skill focus based on your feedback.'}
          </p>
          <p className="text-xs text-secondary-500 mt-1">Based on rule-based transcript feedback, not an AI assessment.</p>
        </div>
        <button onClick={() => onNavigate('interview')} className="btn-secondary whitespace-nowrap">
          Practice now
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StreakDisplay />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <h2 className="text-xl font-semibold mb-4">Choose Interview Type</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {categoryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => onNavigate('interview')}
                className="category-card text-left group"
              >
                <div className={`w-12 h-12 rounded-xl bg-${card.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${card.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-secondary-400 text-sm mb-4">{card.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary-500">{card.questions} questions</span>
                  <ChevronRight className="w-5 h-5 text-secondary-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="chart-container"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Performance Trend</h3>
            <span className="text-sm text-secondary-400">Last 7 sessions</span>
          </div>
          {performanceTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceTrend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-secondary-400">
              <div className="text-center">
                <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Complete interviews to see your trend</p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="chart-container"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Category Breakdown</h3>
            <span className="text-sm text-secondary-400">By score average</span>
          </div>
          {sessionHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={categoryData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" stroke="#64748b" fontSize={12} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-secondary-400">
              <div className="text-center">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Practice to see category scores</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        <div className="chart-container lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Sessions by Category</h3>
          {sessionHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sessionsByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {sessionsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-secondary-400">
              <p className="text-center text-sm">No sessions yet</p>
            </div>
          )}
        </div>

        <div className="chart-container lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Sessions</h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {sessionStats.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {sessionStats.recentSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary-800/30 hover:bg-secondary-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      session.category === 'hr' ? 'bg-primary-500/20' :
                      session.category === 'technical' ? 'bg-accent-500/20' : 'bg-warning-500/20'
                    }`}>
                      {session.category === 'hr' ? (
                        <Users className="w-5 h-5 text-primary-400" />
                      ) : session.category === 'technical' ? (
                        <Code className="w-5 h-5 text-accent-400" />
                      ) : (
                        <Target className="w-5 h-5 text-warning-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{session.category} Interview</p>
                      <p className="text-sm text-secondary-400">
                        {format(new Date(session.startedAt), 'MMM dd, yyyy - h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      session.overallScore >= 85 ? 'text-success-400' :
                      session.overallScore >= 70 ? 'text-primary-400' :
                      session.overallScore >= 55 ? 'text-warning-400' : 'text-error-400'
                    }`}>
                      {session.overallScore}%
                    </div>
                    <p className="text-xs text-secondary-500">
                      {session.answers.length} questions
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-secondary-400">
              <div className="text-center">
                <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Start your first interview</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card"
    >
      <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}
