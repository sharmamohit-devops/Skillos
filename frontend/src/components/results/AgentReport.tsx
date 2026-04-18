import { motion } from 'framer-motion';
import { Bot, User, Zap, GraduationCap, CheckCircle2, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import type { AgentReport as AgentReportType } from '@/types/analysis';
import ScoreRing from '../ScoreRing';

const AGENT_CONFIG = {
  ats: {
    icon: Bot,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-500'
  },
  hr: {
    icon: User,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-500'
  },
  startup: {
    icon: Zap,
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-500'
  },
  tech: {
    icon: GraduationCap,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-500'
  }
};

interface AgentReportProps {
  agent: string;
  report: AgentReportType;
}

export default function AgentReport({ agent, report }: AgentReportProps) {
  const config = AGENT_CONFIG[agent as keyof typeof AGENT_CONFIG];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Agent Header */}
      <div className={`rounded-2xl ${config.bg} border ${config.border} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                {report.name}
              </h3>
              <p className="text-sm text-muted-foreground font-body">
                {report.role}
              </p>
            </div>
          </div>
          <ScoreRing score={report.confidence} label="Confidence" size={100} />
        </div>

        {/* Verdict */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-body">
            Verdict:
          </span>
          <span className={`text-lg font-bold ${config.text} font-display`}>
            {report.verdict}
          </span>
        </div>

        {/* Comment */}
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-sm text-foreground font-body leading-relaxed">
            "{report.comment || report.technical_comment}"
          </p>
        </div>
      </div>

      {/* Agent-specific metrics */}
      {agent === 'ats' && (
        <ATSMetrics report={report} config={config} />
      )}
      {agent === 'hr' && (
        <HRMetrics report={report} config={config} />
      )}
      {agent === 'startup' && (
        <StartupMetrics report={report} config={config} />
      )}
      {agent === 'tech' && (
        <TechMetrics report={report} config={config} />
      )}
    </motion.div>
  );
}

function ATSMetrics({ report, config }: { report: AgentReportType; config: any }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Scores */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <h4 className="font-semibold text-foreground font-body mb-4">Scores</h4>
        <div className="space-y-3">
          <MetricBar label="Keyword Match" value={report.keyword_score || 0} color={config.text} />
          <MetricBar label="Format Compliance" value={report.format_score || 0} color={config.text} />
        </div>
      </div>

      {/* Missing Keywords */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <h4 className="font-semibold text-foreground font-body mb-4">Missing Keywords</h4>
        <div className="flex flex-wrap gap-2">
          {report.missing_keywords?.map((keyword, i) => (
            <span key={i} className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-1 text-xs font-body text-destructive">
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Reasons */}
      <div className="col-span-2 grid grid-cols-2 gap-6">
        <ReasonsList
          title="Pass Reasons"
          items={report.pass_reasons || []}
          icon={CheckCircle2}
          color="text-success"
        />
        <ReasonsList
          title="Rejection Reasons"
          items={report.rejection_reasons || []}
          icon={XCircle}
          color="text-destructive"
        />
      </div>
    </div>
  );
}

function HRMetrics({ report, config }: { report: AgentReportType; config: any }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Scores */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <h4 className="font-semibold text-foreground font-body mb-4">Assessment Scores</h4>
        <div className="space-y-3">
          <MetricBar label="Cultural Fit" value={report.culture_fit_score || 0} color={config.text} />
          <MetricBar label="Career Progression" value={report.progression_score || 0} color={config.text} />
          <MetricBar label="Soft Skills" value={report.soft_skill_score || 0} color={config.text} />
        </div>
      </div>

      {/* Flags */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h4 className="font-semibold text-foreground font-body mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            Green Flags
          </h4>
          <ul className="space-y-2">
            {report.green_flags?.map((flag, i) => (
              <li key={i} className="text-sm text-foreground font-body flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <h4 className="font-semibold text-foreground font-body mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Red Flags
          </h4>
          <ul className="space-y-2">
            {report.red_flags?.map((flag, i) => (
              <li key={i} className="text-sm text-foreground font-body flex items-start gap-2">
                <XCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StartupMetrics({ report, config }: { report: AgentReportType; config: any }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Scores */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <h4 className="font-semibold text-foreground font-body mb-4">Startup Fit</h4>
        <div className="space-y-3">
          <MetricBar label="Execution" value={report.execution_score || 0} color={config.text} />
          <MetricBar label="Skill Breadth" value={report.breadth_score || 0} color={config.text} />
          <MetricBar label="Startup Culture" value={report.startup_fit_score || 0} color={config.text} />
        </div>
      </div>

      {/* Excitement & Concerns */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h4 className="font-semibold text-foreground font-body mb-3">Excited About</h4>
          <ul className="space-y-2">
            {report.excited_about?.map((item, i) => (
              <li key={i} className="text-sm text-foreground font-body flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <h4 className="font-semibold text-foreground font-body mb-3">Concerns</h4>
          <ul className="space-y-2">
            {report.concerns?.map((item, i) => (
              <li key={i} className="text-sm text-foreground font-body flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TechMetrics({ report, config }: { report: AgentReportType; config: any }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Scores */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <h4 className="font-semibold text-foreground font-body mb-4">Technical Assessment</h4>
        <div className="space-y-3">
          <MetricBar label="Technical Depth" value={report.depth_score || 0} color={config.text} />
          <MetricBar label="Stack Coherence" value={report.stack_score || 0} color={config.text} />
          <MetricBar label="Complexity Handling" value={report.complexity_score || 0} color={config.text} />
        </div>
      </div>

      {/* Impressions & Concerns */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h4 className="font-semibold text-foreground font-body mb-3">Impressed By</h4>
          <ul className="space-y-2">
            {report.impressed_by?.map((item, i) => (
              <li key={i} className="text-sm text-foreground font-body flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <h4 className="font-semibold text-foreground font-body mb-3">Technical Concerns</h4>
          <ul className="space-y-2">
            {report.concerns?.map((item, i) => (
              <li key={i} className="text-sm text-foreground font-body flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-body font-semibold text-foreground">{label}</span>
        <span className="text-xs font-body text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

function ReasonsList({ title, items, icon: Icon, color }: { title: string; items: string[]; icon: any; color: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <h4 className="font-semibold text-foreground font-body mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-foreground font-body flex items-start gap-2">
            <Icon className={`w-4 h-4 ${color} mt-0.5 shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
