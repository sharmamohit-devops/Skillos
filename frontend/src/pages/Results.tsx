import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, TrendingDown, ShieldAlert, Target, Sparkles, Award,
  Users, Briefcase, Star, Zap, BarChart3,
} from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";
import ScoreRing from "@/components/ScoreRing";
import ExportPdfButton from "@/components/results/ExportPdfButton";
import AdvancedAnalysis from "@/components/AdvancedAnalysis";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d, ease: "easeOut" as const },
});

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const data = location.state?.result as AnalysisResult | undefined;
  const weeklyHours = (location.state?.weeklyHours as number) ?? 20;

  if (!data) {
    return (
      <div className="min-h-screen bg-background dot-pattern flex items-center justify-center px-6">
        <motion.div {...fade()} className="text-center space-y-5">
          <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
            <Target className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">No analysis found</h1>
          <p className="text-muted-foreground font-body max-w-sm mx-auto">Upload your resume and job description first to see the analysis.</p>
          <Button 
            onClick={() => navigate("/")} 
            className="rounded-2xl shimmer-btn text-primary-foreground px-6 focus-ring bg-gradient-to-r from-primary to-purple-600"
            aria-label="Go back to home page"
          >
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

  const verdictInfo = score >= 70
    ? { label: "Strong Match", emoji: "🎯", color: "text-success", bg: "bg-success/10", border: "border-success/20" }
    : score >= 45
    ? { label: "Partial Match", emoji: "⚡", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" }
    : { label: "Needs Work", emoji: "🔧", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" };

  return (
    <div className="min-h-screen bg-background dot-pattern">
      {/* Enhanced Navbar */}
      <EnhancedNavbar />

      <main id="analysis-report" className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ══════ HERO ══════ */}
        <motion.section {...fade(0)}>
          <div className="text-center space-y-6 relative">
            {/* Sparkles */}
            <Sparkles className="absolute top-0 right-1/4 h-5 w-5 text-warning/40 sparkle" />
            <Sparkles className="absolute bottom-4 left-1/3 h-4 w-4 text-accent/30 sparkle sparkle-delay-2" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 rounded-full bg-accent/8 border border-accent/15 px-4 py-1.5 text-xs font-body text-accent"
            >
              <Sparkles className="h-3.5 w-3.5" /> AI-Powered Analysis
            </motion.div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              {data.candidate_profile.name || "Candidate"}
            </h1>
            <p className="text-muted-foreground font-body text-base">
              applying for <span className="font-display italic text-foreground">{data.job_analysis.role}</span>
            </p>

            {/* Verdict badge */}
            <motion.div {...fade(0.15)} className="flex justify-center">
              <div className={`inline-flex items-center gap-2 rounded-full ${verdictInfo.bg} border ${verdictInfo.border} px-5 py-2`} role="status" aria-label={`Match assessment: ${verdictInfo.label}`}>
                <span className="text-lg" aria-hidden="true">{verdictInfo.emoji}</span>
                <span className={`text-sm font-display font-bold ${verdictInfo.color}`}>{verdictInfo.label}</span>
              </div>
            </motion.div>

            {/* Score rings */}
            <motion.div {...fade(0.2)} className="flex items-center justify-center gap-8 pt-2">
              <ScoreRing score={score} label="Overall" size={110} />
              <ScoreRing score={skillPct} label="Skills" size={110} />
            </motion.div>

            {/* Stats row */}
            <motion.div {...fade(0.25)} className="flex items-center justify-center">
              <div className="inline-flex items-center rounded-2xl bg-card border border-border divide-x divide-border shadow-card" role="group" aria-label="Skill statistics summary">
                <QuickStat icon={<CheckCircle2 className="h-4 w-4 text-success" />} value={matched} label="Matched" />
                <QuickStat icon={<AlertCircle className="h-4 w-4 text-warning" />} value={partial} label="Partial" />
                <QuickStat icon={<XCircle className="h-4 w-4 text-destructive" />} value={missing} label="Missing" />
                <QuickStat icon={<Target className="h-4 w-4 text-accent" />} value={totalRequired} label="Required" />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Rainbow divider */}
        <div className="rainbow-bar" />

        {/* ══════ PROFILE vs JOB ══════ */}
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <motion.div {...fade(0.08)} className="rounded-2xl bg-card border border-border p-6 hover-lift shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Your Profile</h2>
                <p className="text-xs font-body text-muted-foreground">What you bring</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">Your Skills</p>
                <div className="flex flex-wrap gap-2">
                  {data.candidate_profile.skills.map(s => (
                    <span key={s} className="rounded-lg bg-muted/60 border border-border px-2.5 py-1 text-xs font-body text-foreground">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...fade(0.1)} className="rounded-2xl bg-card border border-border p-6 hover-lift shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-warning/8 border border-warning/15 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Job Requirements</h2>
                <p className="text-xs font-body text-muted-foreground">What they want</p>
              </div>
            </div>
            <div className="space-y-4">
              <InfoRow icon={<Award className="h-4 w-4 text-muted-foreground" />} label="Role" value={data.job_analysis.role} />
              <InfoRow icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} label="Experience" value={data.job_analysis.experience_required} />
              <div>
                <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {data.job_analysis.required_skills.map(s => {
                    const isMatch = data.skill_analysis.matched_skills.includes(s);
                    const isPart = data.skill_analysis.partial_skills.includes(s);
                    return (
                      <span key={s} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-body font-medium transition-all ${
                        isMatch ? "bg-success/8 border-success/20 text-success" : isPart ? "bg-warning/8 border-warning/20 text-warning" : "bg-destructive/8 border-destructive/20 text-destructive"
                      }`}>
                        {isMatch ? <CheckCircle2 className="h-3 w-3" /> : isPart ? <AlertCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══════ SKILL BARS ══════ */}
        <motion.section {...fade(0.12)} className="rounded-2xl bg-card border border-border p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-info/8 border border-info/15 flex items-center justify-center">
              <Zap className="h-5 w-5 text-info" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Skill Match Breakdown</h2>
              <p className="text-xs font-body text-muted-foreground">How your skills align with requirements</p>
            </div>
          </div>
          <div className="space-y-4">
            <ProgressBar label="Matched" count={matched} total={totalRequired} color="bg-success" trackColor="bg-success/10" />
            <ProgressBar label="Partial" count={partial} total={totalRequired} color="bg-warning" trackColor="bg-warning/10" />
            <ProgressBar label="Missing" count={missing} total={totalRequired} color="bg-destructive" trackColor="bg-destructive/10" />
          </div>
        </motion.section>

        {/* ══════ STRENGTHS & WEAKNESSES ══════ */}
        <motion.section {...fade(0.13)} className="space-y-6">
          {/* Strengths Card */}
          <motion.div {...fade(0.14)} className="rounded-2xl bg-card border border-border p-6 hover-lift shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-success/8 border border-success/15 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Strengths</h2>
                <p className="text-xs font-body text-muted-foreground">What sets you apart</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {data.evaluation.strengths.map((s, i) => (
                <motion.li key={i} {...fade(0.16 + i * 0.03)} className="flex items-start gap-3 rounded-xl bg-success/5 border border-success/10 px-4 py-3 text-sm font-body text-foreground leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" />
                  {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Weaknesses Card */}
          <motion.div {...fade(0.16)} className="rounded-2xl bg-card border border-border p-6 hover-lift shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-destructive/8 border border-destructive/15 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Weaknesses & Risks</h2>
                <p className="text-xs font-body text-muted-foreground">Areas to improve</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {data.evaluation.weaknesses.map((s, i) => (
                <motion.li key={`w-${i}`} {...fade(0.18 + i * 0.03)} className="flex items-start gap-3 rounded-xl bg-warning/5 border border-warning/10 px-4 py-3 text-sm font-body text-foreground leading-relaxed">
                  <TrendingDown className="h-4 w-4 mt-0.5 text-warning shrink-0" />
                  {s}
                </motion.li>
              ))}
              {data.evaluation.risk_factors.map((s, i) => (
                <motion.li key={`r-${i}`} {...fade(0.2 + i * 0.03)} className="flex items-start gap-3 rounded-xl bg-destructive/5 border border-destructive/10 px-4 py-3 text-sm font-body text-foreground leading-relaxed">
                  <XCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                  {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Advanced Analysis (if available) */}
          {(data.skill_analysis.skill_depth || data.skill_analysis.skill_weights || data.skill_analysis.risk_factors) && (
            <motion.div {...fade(0.18)} className="rounded-2xl bg-card border border-border p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
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
        </motion.section>

        {/* ══════ CTA: ROADMAP ══════ */}
        <motion.section {...fade(0.2)} className="relative overflow-hidden rounded-3xl border border-accent/20 bg-card shadow-elevated">
          <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-primary to-purple-600" />
          <Sparkles className="absolute top-6 right-8 h-5 w-5 text-accent/20 sparkle" />
          <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0">
              <Target className="h-8 w-8 text-accent" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Your Learning Roadmap
              </h2>
              <p className="text-sm text-muted-foreground font-body mt-2 max-w-md">
                {missing + partial} skills to master — step-by-step journey with free resources, YouTube tutorials, docs, and practice projects.
              </p>
            </div>
            <button
              onClick={() => navigate("/roadmap", { state: { result: data, weeklyHours } })}
              className="group relative inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-body text-sm font-semibold text-primary-foreground overflow-hidden shrink-0 transition-all hover:shadow-lg active:scale-[0.97] bg-gradient-to-r from-primary to-purple-600 shadow-glow focus-ring"
              aria-label="Navigate to personalized learning roadmap"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Roadmap
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

/* ── Helpers ── */
const QuickStat = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="flex items-center gap-2.5 px-5 py-3" role="group" aria-label={`${label}: ${value}`}>
    <div aria-hidden="true">{icon}</div>
    <div>
      <p className="text-lg font-display font-bold text-foreground leading-none">{value}</p>
      <p className="text-[10px] font-body text-muted-foreground mt-0.5">{label}</p>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 shrink-0">{icon}</div>
    <div>
      <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-body text-foreground leading-relaxed mt-0.5">{value}</p>
    </div>
  </div>
);

const ProgressBar = ({ label, count, total, color, trackColor }: { label: string; count: number; total: number; color: string; trackColor: string }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-body font-semibold text-foreground">{label}</span>
        <span className="text-xs font-body text-muted-foreground">{count}/{total} ({pct}%)</span>
      </div>
      <div className={`h-2.5 rounded-full ${trackColor} overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
};

export default Results;
