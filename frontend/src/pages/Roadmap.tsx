import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Zap, AlertCircle, BookOpen, GraduationCap, Rocket,
  ExternalLink, Youtube, FileText, Search, Code2, Flag, Trophy,
  ChevronDown, Wrench, Layers, Sparkles, Clock, Calendar, CheckCircle2,
} from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import RealisticAnimatedRoad from "@/components/RealisticAnimatedRoad";
import { formatDuration, buildTimeline } from "@/lib/skillTimeEstimator";

const getResources = (skill: string) => {
  const e = encodeURIComponent(skill);
  return [
    { type: "YouTube", icon: <Youtube className="h-3.5 w-3.5" />, url: `https://www.youtube.com/results?search_query=${e}+tutorial`, color: "bg-red-500/10 text-red-400 border-red-500/20" },
    { type: "Google", icon: <Search className="h-3.5 w-3.5" />, url: `https://www.google.com/search?q=${e}+documentation`, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { type: "freeCodeCamp", icon: <Code2 className="h-3.5 w-3.5" />, url: `https://www.google.com/search?q=site:freecodecamp.org+${e}`, color: "bg-green-500/10 text-green-400 border-green-500/20" },
    { type: "Official Docs", icon: <FileText className="h-3.5 w-3.5" />, url: `https://www.google.com/search?q=${e}+official+docs`, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  ];
};

const priMeta = (level: string) => {
  if (level === "High")   return { border: "border-red-500/30",  badge: "bg-red-500/10 text-red-400 border-red-500/20",    dot: "bg-red-400",    icon: Zap,          glow: "hover:shadow-[0_4px_24px_rgba(239,68,68,0.15)]"  };
  if (level === "Medium") return { border: "border-amber-500/30", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400",  icon: AlertCircle,  glow: "hover:shadow-[0_4px_24px_rgba(245,158,11,0.15)]" };
  return                         { border: "border-blue-500/20",  badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",   dot: "bg-blue-400",   icon: BookOpen,     glow: "hover:shadow-[0_4px_24px_rgba(59,130,246,0.1)]"  };
};

const depthBadge = (d: string) =>
  d === "advanced"     ? "bg-red-500/10 text-red-400 border-red-500/20" :
  d === "intermediate" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                         "bg-green-500/10 text-green-400 border-green-500/20";

const depthLabel = (d: string) =>
  d === "advanced" ? "Advanced" : d === "intermediate" ? "Intermediate" : "Beginner";

const getAction = (gap: any) => {
  if (gap.description) return gap.description;
  if (gap.expected_depth === "advanced")     return `Build deep expertise in ${gap.skill}. Work on real projects and gain production-level experience.`;
  if (gap.expected_depth === "intermediate") return `Learn ${gap.skill} fundamentals, build small projects, and do hands-on practice.`;
  return `Get a basic overview of ${gap.skill} — read docs, follow a tutorial, and try it in a simple project.`;
};

/* ── Milestone Card ── */
const MilestoneCard = ({
  gap, index, hours, durationLabel, cumulativeWeeks, resources: customRes, practiceProjects,
}: {
  gap: any; index: number; hours: number; durationLabel: string; cumulativeWeeks: number;
  resources?: string[]; practiceProjects?: string[];
}) => {
  const [open, setOpen] = useState(false);
  const pri = priMeta(gap.importance_level);
  const Icon = pri.icon;
  const resources =
    customRes && customRes.length > 0
      ? customRes.map((r: string) => ({ type: "Resource", icon: <BookOpen className="h-3.5 w-3.5" />, url: r, color: "bg-primary/10 text-primary border-primary/20" }))
      : getResources(gap.skill || gap.title);

  const allProjects = practiceProjects || gap.practice_projects || [];

  return (
    <motion.div
      layout
      className={`w-full rounded-2xl border-2 ${pri.border} bg-card cursor-pointer transition-all duration-300 ${pri.glow} group`}
      onClick={() => setOpen(!open)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Card Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${pri.badge}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground truncate">
                {gap.skill || gap.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pri.badge}`}>
                  {gap.importance_level} Priority
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${depthBadge(gap.expected_depth)}`}>
                  {depthLabel(gap.expected_depth)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground font-display">{hours}h</p>
              <p className="text-[11px] text-muted-foreground font-body">{durationLabel}</p>
            </div>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-4 border-t border-border space-y-4">
              {/* Time info */}
              <div className="flex items-center gap-3 rounded-xl bg-accent/5 border border-accent/10 px-4 py-3">
                <Calendar className="h-4 w-4 text-accent shrink-0" />
                <p className="text-sm font-body text-foreground">
                  <span className="font-semibold">{hours} hours</span> · <span className="font-semibold">{durationLabel}</span>
                  <span className="text-muted-foreground"> · Complete by week {cumulativeWeeks}</span>
                </p>
              </div>

              {/* Meta tags */}
              <div className="flex flex-wrap gap-2">
                {gap.skill_type && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted border border-border px-3 py-1.5 text-xs font-body text-foreground">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" /> {gap.skill_type}
                  </span>
                )}
                {gap.related_resume_gap && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted border border-border px-3 py-1.5 text-xs font-body text-foreground">
                    Gap: {gap.related_resume_gap}
                  </span>
                )}
                {(gap.dependency_skills || gap.prerequisites || []).length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/8 border border-primary/15 px-3 py-1.5 text-xs font-body text-primary">
                    Prerequisites: {(gap.dependency_skills || gap.prerequisites || []).join(", ")}
                  </span>
                )}
              </div>

              {/* Learning strategy */}
              <div className="rounded-xl bg-accent/5 border border-accent/15 p-4">
                <p className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
                  <Rocket className="h-4 w-4" /> Learning Strategy
                </p>
                <p className="text-sm font-body text-muted-foreground leading-relaxed">{getAction(gap)}</p>
              </div>

              {/* Resources */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2.5">Learning Resources</p>
                <div className="grid grid-cols-2 gap-2">
                  {resources.map((r: any, idx: number) => (
                    <a
                      key={idx} href={r.url} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-body font-medium hover:opacity-80 transition-all group/link ${r.color}`}
                    >
                      <span className="shrink-0">{r.icon}</span>
                      <span className="truncate">{r.type}</span>
                      <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Practice Projects */}
              {allProjects.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2.5">Practice Projects</p>
                  <div className="space-y-2">
                    {allProjects.map((p: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-success/5 border border-success/10 px-3 py-2.5 text-sm font-body text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ════════════════════ PAGE ════════════════════ */
const Roadmap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.result as AnalysisResult | undefined;
  const initialHours = (location.state?.weeklyHours as number) ?? 20;
  const [weeklyHours] = useState(initialHours);
  const roadRef = useRef<HTMLDivElement>(null);

  if (!data) {
    return (
      <div className="min-h-screen bg-background dot-pattern flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-5">
          <div className="h-20 w-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
            <Rocket className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">No roadmap data</h1>
          <p className="text-muted-foreground font-body text-lg">Run an analysis first to see your roadmap.</p>
          <Button onClick={() => navigate("/")} className="rounded-2xl px-6 bg-gradient-to-r from-primary to-purple-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  /* ── Build learning pathway from Python backend ── */
  // Use learning_pathway from Python backend if available
  const hasLearningPathway = data.learning_pathway && data.learning_pathway.length > 0;
  
  // Transform Python backend learning_pathway to match expected format
  const milestones = hasLearningPathway 
    ? data.learning_pathway.map((step: any, index: number) => ({
        skill: step.skill || step.module || step.phase || `Step ${index + 1}`,
        title: step.title || step.module || step.phase || `Learning Module ${index + 1}`,
        importance_level: step.importance_level || (index < 3 ? "High" : index < 6 ? "Medium" : "Low"),
        skill_type: step.skill_type || "tool",
        expected_depth: step.expected_depth || "intermediate",
        duration_days: Math.ceil((step.estimated_hours || 14) / 2),
        estimated_hours: step.estimated_hours || 14,
        time_commitment: step.time_commitment || { estimated_weeks: Math.ceil((step.estimated_hours || 14) / (weeklyHours || 20)) },
        resources: step.learning_resources || [],
        practice_projects: step.practice_projects || [],
        milestones: step.milestones || [],
        assessment_criteria: step.assessment_criteria || [],
        skills: [step.skill] || step.skills || [],
        verification_method: step.verification_method || "Practice project",
        description: step.description || `Learn ${step.skill || "required skills"} through hands-on practice`,
        difficulty: step.difficulty || "intermediate",
        prerequisites: step.prerequisites || [],
        career_impact: step.career_impact || "",
        related_resume_gap: step.related_resume_gap || "",
        dependency_skills: step.dependency_skills || step.prerequisites || []
      }))
    : data.gap_intelligence.map((gap: any) => ({
        skill: gap.skill,
        title: gap.skill,
        importance_level: gap.importance_level || gap.priority || "Medium",
        skill_type: gap.skill_type || "core",
        expected_depth: gap.expected_depth || "intermediate",
        duration_days: 7,
        estimated_hours: gap.estimated_hours || 14,
        time_commitment: { estimated_weeks: Math.ceil((gap.estimated_hours || 14) / (weeklyHours || 20)) },
        resources: gap.learning_resource ? [gap.learning_resource] : [],
        practice_projects: [],
        skills: [gap.skill],
        description: gap.learning_resource || `Learn ${gap.skill}`,
        related_resume_gap: gap.related_resume_gap || "",
        dependency_skills: gap.dependency_skills || []
      }));

  /* ── Build timeline ── */
  const timeline = (() => {
    let cum = 0;
    const items = milestones.map((s: any) => {
      const weeks = s.time_commitment?.estimated_weeks || Math.ceil((s.duration_days || 7) / 7);
      cum += weeks;
      return { 
        hours: s.estimated_hours || s.duration_days * 2 || 14, 
        weeks: weeks, 
        durationLabel: `~${weeks}w`, 
        cumulativeWeeks: cum 
      };
    });
    return { 
      items, 
      totalHours: items.reduce((a: number, i: any) => a + i.hours, 0), 
      totalWeeks: cum 
    };
  })();

  // For stats display
  const sortedGaps = milestones;

  return (
    <div className="min-h-screen bg-background dot-pattern">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">

        {/* ── HEADER ── */}
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center space-y-6 relative">
          <Sparkles className="absolute top-0 right-1/4 h-6 w-6 text-warning/40 sparkle" />
          <Sparkles className="absolute bottom-0 left-1/3 h-5 w-5 text-accent/30 sparkle sparkle-delay-2" />

          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="h-20 w-20 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center mx-auto shadow-glow">
            <Rocket className="h-10 w-10 text-accent" />
          </motion.div>

          <div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Your Learning <span className="font-display italic text-gradient-purple">Roadmap</span>
            </h1>
            <p className="text-muted-foreground font-body text-base sm:text-lg mt-3 max-w-xl mx-auto">
              <span className="font-semibold text-foreground">{data.candidate_profile.name}</span>'s personalized path to{" "}
              <span className="font-display italic text-foreground">{data.job_analysis.role}</span>
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-body text-muted-foreground">
            <span className="flex items-center gap-2"><Flag className="h-4 w-4 text-accent" /> {sortedGaps.length} Skills</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-info" /> {timeline.totalHours}h Total</span>
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-warning" /> {formatDuration(timeline.totalWeeks)}</span>
            <span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-success" /> Free Resources</span>
          </div>
          <p className="text-muted-foreground font-body text-xs">Tap any milestone to expand details &amp; resources</p>
        </motion.section>

        {/* Rainbow divider */}
        <div className="rainbow-bar" />

        {/* ── WINDING ROAD ── */}
        <div className="relative overflow-hidden" ref={roadRef}>
          <RealisticAnimatedRoad containerRef={roadRef} milestoneCount={milestones.length} />

          {/* Start */}
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
            className="flex justify-center mb-16 relative z-20">
            <div className="flex items-center gap-3 rounded-full bg-success/10 border-2 border-success/30 px-8 py-4 shadow-glow-success">
              <div className="h-4 w-4 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-display font-bold text-success tracking-widest uppercase">Start Your Journey</span>
            </div>
          </motion.div>

          {/* Milestone Cards — alternating left/right */}
          <div className="milestone-container relative z-20 space-y-16">
            {milestones.map((gap: any, i: number) => (
              <motion.div
                key={`${gap.skill || gap.title}-${i}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -80 : 80 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 + 1, duration: 0.55, ease: "easeOut" }}
                className={`flex items-center gap-6 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
              >
                {/* Step number bubble */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-glow border-4 border-background">
                    <span className="text-white font-bold text-base font-display">{i + 1}</span>
                  </div>
                  {/* Connector line to card */}
                  <div className={`absolute top-7 ${i % 2 === 0 ? "left-14" : "right-14"} w-10 h-0.5 bg-gradient-to-r from-primary/50 to-transparent`} />
                </div>

                {/* Card */}
                <div className="flex-1 max-w-md">
                  <MilestoneCard
                    gap={gap}
                    index={i}
                    hours={timeline.items[i]?.hours ?? 0}
                    durationLabel={timeline.items[i]?.durationLabel ?? ""}
                    cumulativeWeeks={timeline.items[i]?.cumulativeWeeks ?? 0}
                    resources={gap.learning_resources}
                    practiceProjects={gap.practice_projects}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FINISH ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
          className="flex justify-center relative z-30">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 rounded-full bg-accent/10 border-2 border-accent/30 px-8 py-3" style={{ boxShadow: "var(--shadow-glow)" }}>
              <Trophy className="h-5 w-5 text-accent" />
              <span className="text-sm font-display font-bold text-accent tracking-widest uppercase">Goal Reached!</span>
            </div>
            <p className="text-sm font-body text-muted-foreground text-center">
              You're ready for <span className="font-display italic font-bold text-foreground">{data.job_analysis.role}</span>
              <span className="text-accent font-semibold"> — in {formatDuration(timeline.totalWeeks)}</span>
            </p>
          </div>
        </motion.div>

        {/* ── TOOLS, DOMAINS, PROJECTS ── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Tools */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card border border-border p-5 shadow-card hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <Wrench className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-foreground">Recommended Tools</h2>
                <p className="text-xs font-body text-muted-foreground">Essential for this role</p>
              </div>
            </div>
            <div className="space-y-2">
              {data.roadmap_context.toolchain_recommendations.map((tool, i) => (
                <div key={tool} className="flex items-center gap-3 rounded-xl bg-background border border-border px-3 py-2.5 hover:border-primary/20 transition-colors">
                  <span className="h-6 w-6 rounded-lg bg-accent/8 text-accent flex items-center justify-center text-xs font-bold font-display shrink-0">{i + 1}</span>
                  <span className="text-sm font-body text-foreground">{tool}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Focus Areas */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl bg-card border border-border p-5 shadow-card hover:border-info/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-info/8 border border-info/15 flex items-center justify-center">
                <Layers className="h-5 w-5 text-info" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-foreground">Focus Areas</h2>
                <p className="text-xs font-body text-muted-foreground">Key domains to learn</p>
              </div>
            </div>
            <div className="space-y-2">
              {data.roadmap_context.preferred_learning_domains.map((d, i) => (
                <div key={d} className="flex items-center gap-3 rounded-xl bg-background border border-border px-3 py-2.5 hover:border-info/20 transition-colors">
                  <span className="h-6 w-6 rounded-lg bg-info/8 text-info flex items-center justify-center text-xs font-bold font-display shrink-0">{i + 1}</span>
                  <span className="text-sm font-body text-foreground">{d}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Practice Projects */}
          {data.roadmap_context.suggested_project_types.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl bg-card border border-border p-5 shadow-card hover:border-success/30 transition-colors sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-success/8 border border-success/15 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">Practice Projects</h2>
                  <p className="text-xs font-body text-muted-foreground">Hands-on opportunities</p>
                </div>
              </div>
              <div className="space-y-2">
                {data.roadmap_context.suggested_project_types.map((p, i) => (
                  <div key={p} className="flex items-start gap-3 rounded-xl bg-background border border-border px-3 py-2.5 hover:border-success/20 transition-colors">
                    <span className="h-6 w-6 rounded-lg bg-success/8 text-success flex items-center justify-center text-xs font-bold font-display shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm font-body text-foreground leading-relaxed">{p}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Roadmap;
