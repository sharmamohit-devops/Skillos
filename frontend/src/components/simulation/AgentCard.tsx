import { motion } from "framer-motion";
import { Bot, Users, Briefcase, Code, CheckCircle2, XCircle, AlertCircle, Star } from "lucide-react";

interface AgentReport {
  agent: string;
  name: string;
  role: string;
  verdict: string;
  confidence: number;
  comment: string;
  keyword_score?: number;
  format_score?: number;
  cultural_fit_score?: number;
  execution_score?: number;
  technical_score?: number;
  architecture_score?: number;
}

interface AgentCardProps {
  report: AgentReport;
  delay?: number;
}

const agentConfig = {
  ats: { 
    icon: Bot, 
    color: "blue",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-400"
  },
  hr: { 
    icon: Users, 
    color: "pink",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    textColor: "text-pink-400"
  },
  startup: { 
    icon: Briefcase, 
    color: "orange",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    textColor: "text-orange-400"
  },
  tech: { 
    icon: Code, 
    color: "green",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    textColor: "text-green-400"
  }
};

const verdictConfig = {
  PASS: { icon: CheckCircle2, color: "text-success", label: "PASS" },
  SHORTLIST: { icon: CheckCircle2, color: "text-success", label: "SHORTLIST" },
  HIRE: { icon: CheckCircle2, color: "text-success", label: "HIRE" },
  YES: { icon: CheckCircle2, color: "text-success", label: "YES" },
  STRONG_YES: { icon: CheckCircle2, color: "text-success", label: "STRONG YES" },
  REVIEW: { icon: AlertCircle, color: "text-warning", label: "REVIEW" },
  MAYBE: { icon: AlertCircle, color: "text-warning", label: "MAYBE" },
  FAIL: { icon: XCircle, color: "text-destructive", label: "FAIL" },
  NO: { icon: XCircle, color: "text-destructive", label: "NO" },
  REJECT: { icon: XCircle, color: "text-destructive", label: "REJECT" }
};

const AgentCard = ({ report, delay = 0 }: AgentCardProps) => {
  const config = agentConfig[report.agent as keyof typeof agentConfig];
  const verdict = verdictConfig[report.verdict as keyof typeof verdictConfig] || verdictConfig.REVIEW;
  const Icon = config?.icon || Bot;
  const VerdictIcon = verdict.icon;

  // Extract specific scores based on agent type
  const getSpecificScores = () => {
    switch (report.agent) {
      case 'ats':
        return [
          { label: "Keywords", value: report.keyword_score },
          { label: "Format", value: report.format_score }
        ];
      case 'hr':
        return [
          { label: "Cultural Fit", value: report.cultural_fit_score }
        ];
      case 'startup':
        return [
          { label: "Execution", value: report.execution_score }
        ];
      case 'tech':
        return [
          { label: "Technical", value: report.technical_score },
          { label: "Architecture", value: report.architecture_score }
        ];
      default:
        return [];
    }
  };

  const specificScores = getSpecificScores().filter(score => score.value !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-xl border ${config?.borderColor || 'border-border'} ${config?.bgColor || 'bg-card'} p-4 hover-lift shadow-card`}
    >
      {/* Agent Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg ${config?.bgColor || 'bg-muted'} border ${config?.borderColor || 'border-border'} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${config?.textColor || 'text-muted-foreground'}`} />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">
              {report.name}
            </h3>
            <p className="text-[10px] font-body text-muted-foreground">
              {report.role}
            </p>
          </div>
        </div>

        {/* Verdict Badge */}
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
          verdict.color === 'text-success' ? 'bg-success/10 border-success/20 text-success' :
          verdict.color === 'text-warning' ? 'bg-warning/10 border-warning/20 text-warning' :
          'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          <VerdictIcon className="h-2.5 w-2.5" />
          {verdict.label}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-body font-semibold text-foreground">Confidence</span>
          <span className="text-xs font-body text-muted-foreground">{report.confidence}%</span>
        </div>
        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              report.confidence >= 80 ? 'bg-success' :
              report.confidence >= 60 ? 'bg-warning' :
              'bg-destructive'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${report.confidence}%` }}
            transition={{ duration: 1, delay: delay + 0.2 }}
          />
        </div>
      </div>

      {/* Specific Scores */}
      {specificScores.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {specificScores.map((score, index) => (
            <div key={score.label} className="flex items-center justify-between">
              <span className="text-[10px] font-body text-muted-foreground">{score.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-body font-semibold text-foreground">{score.value}%</span>
                <div className="w-12 h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${config?.textColor?.replace('text-', 'bg-') || 'bg-primary'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score.value}%` }}
                    transition={{ duration: 0.8, delay: delay + 0.3 + (index * 0.1) }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment */}
      <div className="rounded-lg bg-background/50 border border-border p-2.5">
        <p className="text-xs font-body text-foreground leading-relaxed">
          {report.comment}
        </p>
      </div>

      {/* Agent Personality Indicator */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-2.5 w-2.5 ${
                i < Math.floor(report.confidence / 20) 
                  ? `${config?.textColor || 'text-primary'}` 
                  : 'text-muted-foreground/30'
              }`}
              fill="currentColor"
            />
          ))}
        </div>
        <span className="text-[10px] font-body text-muted-foreground">
          {report.agent.toUpperCase()} Analysis
        </span>
      </div>
    </motion.div>
  );
};

export default AgentCard;