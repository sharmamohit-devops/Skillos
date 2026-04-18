import { motion } from 'framer-motion';
import { Trophy, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import ScoreRing from '../ScoreRing';

interface OverallVerdictProps {
  verdict: string;
  overallScore: number;
  shortlistProbability: number;
  panelConsensus: string;
}

const VERDICT_CONFIG = {
  STRONG_CANDIDATE: {
    icon: Trophy,
    label: 'Strong Candidate',
    emoji: '🎯',
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    description: 'The panel is impressed with your profile'
  },
  POTENTIAL: {
    icon: TrendingUp,
    label: 'Potential Candidate',
    emoji: '⚡',
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/20',
    description: 'You show promise with some areas to improve'
  },
  NEEDS_WORK: {
    icon: AlertTriangle,
    label: 'Needs Improvement',
    emoji: '🔧',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    description: 'Significant skill gaps identified'
  },
  NOT_READY: {
    icon: AlertTriangle,
    label: 'Not Ready',
    emoji: '❌',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    description: 'Major reskilling required for this role'
  }
};

export default function OverallVerdict({
  verdict,
  overallScore,
  shortlistProbability,
  panelConsensus
}: OverallVerdictProps) {
  const config = VERDICT_CONFIG[verdict as keyof typeof VERDICT_CONFIG] || VERDICT_CONFIG.NEEDS_WORK;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-card border border-border p-8 shadow-elevated"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center`}>
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Virtual HR Panel Verdict
            </h2>
            <p className="text-sm text-muted-foreground font-body mt-1">
              4 AI recruiters reviewed your profile
            </p>
          </div>
        </div>
      </div>

      {/* Verdict Badge */}
      <div className="flex items-center justify-center mb-8">
        <div className={`inline-flex items-center gap-3 rounded-full ${config.bg} border ${config.border} px-6 py-3`}>
          <span className="text-2xl" aria-hidden="true">{config.emoji}</span>
          <div>
            <p className={`text-lg font-display font-bold ${config.color}`}>
              {config.label}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col items-center">
          <ScoreRing score={overallScore} label="Overall Score" size={120} />
          <p className="text-xs text-muted-foreground font-body mt-2 text-center">
            Average confidence across all agents
          </p>
        </div>
        <div className="flex flex-col items-center">
          <ScoreRing score={shortlistProbability} label="Shortlist %" size={120} />
          <p className="text-xs text-muted-foreground font-body mt-2 text-center">
            Probability of advancing to next round
          </p>
        </div>
      </div>

      {/* Panel Consensus */}
      <div className="rounded-2xl bg-muted/30 border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold font-body text-foreground">
            Panel Consensus
          </p>
        </div>
        <p className="text-sm text-muted-foreground font-body">
          {panelConsensus}
        </p>
      </div>
    </motion.div>
  );
}
