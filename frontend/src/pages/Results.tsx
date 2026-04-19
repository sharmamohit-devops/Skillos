import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, TrendingDown, ShieldAlert, Target, Sparkles,
  Users, Briefcase, Zap, BarChart3, Brain, Trophy,
} from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";
import ScoreRing from "@/components/ScoreRing";
import ExportPdfButton from "@/components/results/ExportPdfButton";
import AdvancedAnalysis from "@/components/AdvancedAnalysis";
import AgentCard from "@/components/simulation/AgentCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d, ease: "easeOut" as const },
});

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const data = location.state?.result as AnalysisResult | undefined;
  const weeklyHours = (location.state?.weeklyHours as number) ?? 20;
  const resumeOnly = location.state?.resumeOnly === true; // Check if this is resume-only mode

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div {...fade()} className="text-center space-y-5">
          <div className="h-20 w-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
            <Target className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">No analysis found</h1>
          <p className="text-muted-foreground font-body max-w-sm mx-auto">Upload your resume and job description first to see the analysis.</p>
          <Button onClick={() => navigate("/")} className="rounded-2xl px-6 bg-gradient-to-r from-primary to-purple-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  const score = data.evaluation.match_score;
  const skillPct = data.skill_analysis.skill_match_percentage;
  const totalRequired = data.job_analysis.required_skills.length;
  const matched = data.skill_analysis.matched_skills.length;
  const partial = data.skill_analysis.partial_skills.length;
  const missing = data.skill_analysis.missing_skills.length;

  const verdictInfo =
    score >= 70
      ? { label: "Strong Match", emoji: "🎯", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" }
      : score >= 45
      ? { label: "Partial Match", emoji: "⚡", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" }
      : { label: "Needs Work", emoji: "🔧", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" };

  return (
    <div className="min-h-screen bg-background dot-pattern">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <main id="analysis-report" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ══ HERO ══ */}
        <motion.section {...fade(0)}>
          <div className="rounded-3xl overflow-hidden border border-border bg-card shadow-xl relative">
            {/* Top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-accent" />

            <div className="p-8 sm:p-10 text-center space-y-6 relative">
              <div className="absolute top-4 right-4">
                <ExportPdfButton targetId={"analysis-report"} />
              </div>
              <Sparkles className="absolute top-6 right-1/4 h-5 w-5 text-warning/30 animate-pulse" />
              <Sparkles className="absolute bottom-6 left-1/4 h-4 w-4 text-accent/20 animate-pulse" style={{ animationDelay: "1s" }} />

              {/* AI badge */}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-4 py-1.5 text-xs font-body text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI-Powered Analysis
                {data.simulation_source === "mirrorfish" && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-semibold">MirrorFish</span>
                )}
              </motion.div>

              {/* Name & role */}
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                  {data.candidate_profile.name || "Candidate"}
                </h1>
                <p className="text-muted-foreground font-body text-base mt-2">
                  applying for <span className="font-display italic font-semibold text-foreground">{data.job_analysis.role}</span>
                </p>
              </div>

              {/* Verdict */}
              <motion.div {...fade(0.15)} className="flex justify-center">
                <div className={`inline-flex items-center gap-2 rounded-full ${verdictInfo.bg} border ${verdictInfo.border} px-5 py-2.5`}>
                  <span className="text-lg">{verdictInfo.emoji}</span>
                  <span className={`text-sm font-display font-bold ${verdictInfo.color}`}>{verdictInfo.label}</span>
                </div>
              </motion.div>

              {/* Score rings */}
              <motion.div {...fade(0.2)} className="flex items-center justify-center gap-12 pt-2">
                <ScoreRing score={score} label="Overall" size={120} />
                <div className="h-16 w-px bg-border" />
                <ScoreRing score={skillPct} label="Skills" size={120} />
              </motion.div>

              {/* Stat chips */}
              <motion.div {...fade(0.25)} className="flex flex-wrap items-center justify-center gap-3">
                {[
                  { icon: <CheckCircle2 className="h-4 w-4" />, value: matched, label: "Matched", cls: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" },
                  { icon: <AlertCircle className="h-4 w-4" />, value: partial, label: "Partial", cls: "bg-amber-500/10 border-amber-500/25 text-amber-400" },
                  { icon: <XCircle className="h-4 w-4" />, value: missing, label: "Missing", cls: "bg-rose-500/10 border-rose-500/25 text-rose-400" },
                  { icon: <Target className="h-4 w-4" />, value: totalRequired, label: "Required", cls: "bg-primary/10 border-primary/25 text-primary" },
                ].map(s => (
                  <div key={s.label} className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 ${s.cls}`}>
                    {s.icon}
                    <div className="text-left">
                      <p className="text-lg font-display font-bold leading-none">{s.value}</p>
                      <p className="text-[10px] font-body mt-0.5 opacity-75">{s.label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ══ PROFILE vs JOB ══ */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Your Profile */}
          <motion.div {...fade(0.08)} className="rounded-2xl bg-card border border-border p-6 hover:border-accent/30 transition-colors shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Your Profile</h2>
                <p className="text-xs font-body text-muted-foreground">What you bring</p>
              </div>
            </div>

            {data.candidate_profile.experience && (
              <div className="mb-4 rounded-xl bg-background border border-border px-4 py-3">
                <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-1">Experience</p>
                <p className="text-sm font-body text-foreground">{data.candidate_profile.experience}</p>
              </div>
            )}

            <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-3">Your Skills</p>
            <div className="flex flex-wrap gap-2">
              {data.candidate_profile.skills?.map((s: string) => (
                <span key={s} className="rounded-lg bg-muted border border-border px-2.5 py-1 text-xs font-body text-foreground hover:border-accent/30 transition-colors">{s}</span>
              ))}
            </div>
          </motion.div>

          {/* Job Requirements */}
          {!resumeOnly && (
          <motion.div {...fade(0.1)} className="rounded-2xl bg-card border border-border p-6 hover:border-warning/30 transition-colors shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Job Requirements</h2>
                <p className="text-xs font-body text-muted-foreground">What they want</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="rounded-xl bg-background border border-border px-4 py-3">
                <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-1">Role</p>
                <p className="text-sm font-body text-foreground font-medium">{data.job_analysis?.role}</p>
              </div>
              <div className="rounded-xl bg-background border border-border px-4 py-3">
                <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-1">Experience Required</p>
                <p className="text-sm font-body text-foreground">{data.job_analysis?.experience_required}</p>
              </div>
            </div>

            <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-3">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {data.job_analysis?.required_skills?.map((s: string) => {
                const isMatch = data.skill_analysis?.matched_skills?.includes(s);
                const isPart = data.skill_analysis?.partial_skills?.includes(s);
                return (
                  <span key={s} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-body font-medium ${
                    isMatch ? "bg-emerald-500/8 border-emerald-500/25 text-emerald-400" :
                    isPart  ? "bg-amber-500/8 border-amber-500/25 text-amber-400" :
                              "bg-rose-500/8 border-rose-500/25 text-rose-400"
                  }`}>
                    {isMatch ? <CheckCircle2 className="h-3 w-3" /> : isPart ? <AlertCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {s}
                  </span>
                );
              })}
            </div>
          </motion.div>
          )}
        </div>

        {/* ══ SKILL BARS ══ */}
        {!resumeOnly && (
        <motion.section {...fade(0.12)} className="rounded-2xl bg-card border border-border p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-info" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Skill Match Breakdown</h2>
              <p className="text-xs font-body text-muted-foreground">How your skills align with requirements</p>
            </div>
          </div>
          <div className="space-y-5">
            <ProgressBar label="Matched" count={matched} total={totalRequired} color="bg-emerald-500" track="bg-emerald-500/10" />
            <ProgressBar label="Partial" count={partial} total={totalRequired} color="bg-amber-500" track="bg-amber-500/10" />
            <ProgressBar label="Missing" count={missing} total={totalRequired} color="bg-rose-500" track="bg-rose-500/10" />
          </div>
        </motion.section>
        )}

        {/* ══ STRENGTHS & WEAKNESSES ══ */}
        <div className="grid gap-5 lg:grid-cols-2">
          <motion.div {...fade(0.14)} className="rounded-2xl bg-card border border-emerald-500/20 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Strengths</h2>
                <p className="text-xs font-body text-muted-foreground">What sets you apart</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {data.evaluation.strengths.map((s, i) => (
                <motion.li key={i} {...fade(0.16 + i * 0.04)}
                  className="flex items-start gap-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 px-4 py-3 text-sm font-body text-foreground leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" /> {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fade(0.16)} className="rounded-2xl bg-card border border-rose-500/20 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Weaknesses &amp; Risks</h2>
                <p className="text-xs font-body text-muted-foreground">Areas to improve</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {data.evaluation.weaknesses.map((s, i) => (
                <motion.li key={`w-${i}`} {...fade(0.18 + i * 0.03)}
                  className="flex items-start gap-3 rounded-xl bg-amber-500/5 border border-amber-500/15 px-4 py-3 text-sm font-body text-foreground leading-relaxed">
                  <TrendingDown className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" /> {s}
                </motion.li>
              ))}
              {data.evaluation.risk_factors.map((s, i) => (
                <motion.li key={`r-${i}`} {...fade(0.2 + i * 0.03)}
                  className="flex items-start gap-3 rounded-xl bg-rose-500/5 border border-rose-500/15 px-4 py-3 text-sm font-body text-foreground leading-relaxed">
                  <XCircle className="h-4 w-4 mt-0.5 text-rose-400 shrink-0" /> {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ══ VIRTUAL HR ══ */}
        {data.agent_reports && (
          <motion.section {...fade(0.2)} className="space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs font-body text-primary">
                <Brain className="h-3.5 w-3.5" /> SkillOS Virtual HR Room
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">4 AI Agents Evaluated Your Profile</h2>
              <p className="text-muted-foreground font-body text-sm max-w-2xl mx-auto">
                Our virtual HR panel simulated a real hiring process. Each agent brings their unique perspective.
              </p>
              <div className="flex items-center justify-center gap-6 pt-2">
                <ScoreRing score={data.overall_score || 70} label="Panel Score" size={100} />
                <div className="text-left space-y-2">
                  <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold border ${
                    data.verdict === "STRONG_CANDIDATE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    data.verdict === "CANDIDATE"        ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                                         "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    {data.verdict === "STRONG_CANDIDATE" ? <CheckCircle2 className="h-4 w-4" /> :
                     data.verdict === "CANDIDATE"        ? <AlertCircle className="h-4 w-4" /> :
                                                          <XCircle className="h-4 w-4" />}
                    {data.verdict?.replace(/_/g, " ") || "CANDIDATE"}
                  </div>
                  <p className="text-xs text-muted-foreground font-body max-w-xs">{data.panel_consensus}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {Object.values(data.agent_reports).map((report: any, index) => (
                <AgentCard key={report.agent} report={report} delay={0.05 + index * 0.08} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Advanced Analysis */}
        {(data.skill_analysis.skill_depth || data.skill_analysis.skill_weights || data.skill_analysis.risk_factors) && (
          <motion.div {...fade(0.22)} className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Advanced Analysis</h2>
                <p className="text-xs font-body text-muted-foreground">Detailed skill insights</p>
              </div>
            </div>
            <AdvancedAnalysis data={data} />
          </motion.div>
        )}

        {/* ══ CTA ROADMAP ══ */}
        {!resumeOnly && (
        <motion.section {...fade(0.26)}>
          <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-card shadow-elevated">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-accent" />
            <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-primary to-purple-600 pointer-events-none" />
            <Sparkles className="absolute top-6 right-8 h-5 w-5 text-accent/20 sparkle" />
            <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <Trophy className="h-8 w-8 text-accent" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Your Learning Roadmap</h2>
                <p className="text-sm text-muted-foreground font-body mt-1.5 max-w-md">
                  <span className="font-semibold text-accent">{missing + partial} skills</span> to master — step-by-step journey with free resources, tutorials, docs &amp; practice projects.
                </p>
              </div>
              <button
                onClick={() => navigate("/roadmap", { state: { result: data, weeklyHours } })}
                className="group inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-body text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-purple-600 shadow-glow transition-all hover:shadow-xl hover:opacity-95 active:scale-[0.97] shrink-0 focus-ring"
              >
                Start Roadmap <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </motion.section>
        )}
      </main>
    </div>
  );
};

/* ── Helpers ── */
const ProgressBar = ({ label, count, total, color, track }: { label: string; count: number; total: number; color: string; track: string }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-body font-semibold text-foreground">{label}</span>
        <span className="text-xs font-body text-muted-foreground">
          {count}/{total} <span className="font-bold text-foreground">({pct}%)</span>
        </span>
      </div>
      <div className={`h-2.5 rounded-full ${track} overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        />
      </div>
    </div>
  );
};

export default Results;
