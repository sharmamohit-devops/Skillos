import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowLeft, Zap, AlertCircle, BookOpen, GraduationCap, Rocket,
  ExternalLink, Youtube, FileText, Search, Code2, Flag, MapPin, Trophy,
  ChevronDown, Wrench, Layers, ChevronRight, Sparkles, CircleDot, Clock, Calendar,
} from "lucide-react";
import type { AnalysisResult, GapIntelligence } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import RealisticAnimatedRoad from "@/components/RealisticAnimatedRoad";
import { estimateSkillHours, estimateSkillWeeks, formatDuration, buildTimeline } from "@/lib/skillTimeEstimator";

/* ── Resources ── */
const getResources = (skill: string) => {
  const e = encodeURIComponent(skill);
  return [
    { type: "YouTube", icon: <Youtube className="h-4 w-4" />, url: `https://www.youtube.com/results?search_query=${e}+tutorial+for+beginners`, color: "bg-destructive/10 text-destructive" },
    { type: "Google", icon: <Search className="h-4 w-4" />, url: `https://www.google.com/search?q=${e}+official+documentation+guide`, color: "bg-info/10 text-info" },
    { type: "freeCodeCamp", icon: <Code2 className="h-4 w-4" />, url: `https://www.google.com/search?q=site:freecodecamp.org+${e}`, color: "bg-success/10 text-success" },
    { type: "Docs", icon: <FileText className="h-4 w-4" />, url: `https://www.google.com/search?q=${e}+official+docs`, color: "bg-warning/10 text-warning" },
  ];
};

const priorityMeta = (level: string) =>
  level === "High"
    ? { bg: "bg-destructive/8", text: "text-destructive", border: "border-destructive/25", dot: "bg-destructive", glow: "shadow-[0_0_16px_hsl(0_72%_55%/0.35)]", icon: Zap }
    : level === "Medium"
    ? { bg: "bg-warning/8", text: "text-warning", border: "border-warning/25", dot: "bg-warning", glow: "shadow-[0_0_16px_hsl(38_90%_55%/0.35)]", icon: AlertCircle }
    : { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", dot: "bg-muted-foreground", glow: "", icon: BookOpen };

const depthMeta = (d: string) =>
  d === "advanced" ? { label: "Advanced", bg: "bg-destructive/8", text: "text-destructive" }
    : d === "intermediate" ? { label: "Intermediate", bg: "bg-warning/8", text: "text-warning" }
    : { label: "Beginner", bg: "bg-success/8", text: "text-success" };

const getActionText = (gap: GapIntelligence) => {
  if (gap.expected_depth === "advanced")
    return `Build deep expertise in ${gap.skill}. Work on real projects and gain production-level experience.`;
  if (gap.expected_depth === "intermediate") {
    const deps = gap.dependency_skills.length > 0 ? `Integrate with ${gap.dependency_skills.join(" & ")}` : "Do hands-on practice";
    return `Learn ${gap.skill} fundamentals, build small projects, and ${deps.toLowerCase()}.`;
  }
  return `Get a basic overview of ${gap.skill} — read docs, follow a tutorial, and try it in a simple project.`;
};

/* ── Animated Road ── */
const AnimatedRoad = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) => {
  const [h, setH] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        // Calculate height more precisely to avoid overflow
        const milestoneSection = containerRef.current.querySelector('.space-y-8');
        if (milestoneSection) {
          setH(milestoneSection.scrollHeight + 200); // Add some padding
        } else {
          setH(containerRef.current.scrollHeight - 100); // Reduce height to prevent overflow
        }
      }
    };
    const ro = new ResizeObserver(() => update());
    ro.observe(containerRef.current);
    update();
    const timer = setTimeout(update, 1500);
    return () => { ro.disconnect(); clearTimeout(timer); };
  }, [containerRef]);

  const w = 160;
  const segs = Math.max(3, Math.ceil(h / 180));
  const segH = h / segs;
  let path = `M 80 0`;
  for (let i = 0; i < segs; i++) {
    const y1 = i * segH;
    const y2 = (i + 1) * segH;
    const midY = (y1 + y2) / 2;
    // Reduce curve amplitude to prevent overlap
    const cx = i % 2 === 0 ? 120 : 40; // Reduced from 140/20 to 120/40
    path += ` Q ${cx} ${midY} 80 ${y2}`;
  }

  return (
    <svg
      className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none hidden md:block"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      style={{ 
        filter: "drop-shadow(0 2px 8px hsl(var(--border) / 0.5))",
        maxHeight: '100%' // Ensure it doesn't exceed container height
      }}
    >
      <motion.path d={path} stroke="hsl(var(--border))" strokeWidth="44" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, ease: "easeInOut" }} />
      <motion.path d={path} stroke="hsl(var(--muted))" strokeWidth="34" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, ease: "easeInOut" }} />
      <motion.path d={path} stroke="hsl(var(--card))" strokeWidth="24" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, ease: "easeInOut", delay: 0.1 }} />
      <motion.path d={path} stroke="hsl(var(--warning))" strokeWidth="3" strokeLinecap="round" strokeDasharray="14 10" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }} />
    </svg>
  );
};

/* ── Milestone Card ── */
const MilestoneCard = ({ gap, index, total, hours, weeks, durationLabel, cumulativeWeeks }: {
  gap: GapIntelligence; index: number; total: number;
  hours: number; weeks: number; durationLabel: string; cumulativeWeeks: number;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const pri = priorityMeta(gap.importance_level);
  const depth = depthMeta(gap.expected_depth);
  const resources = getResources(gap.skill);
  const Icon = pri.icon;

  return (
    <div ref={ref} className="w-full">
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className={`rounded-2xl border-2 ${pri.border} bg-card cursor-pointer transition-all hover:shadow-xl group shadow-card focus-ring`}
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={`${gap.skill} learning milestone. ${gap.importance_level} priority, ${depth.label} level. Click to expand details.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${pri.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${pri.text}`} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground truncate">{gap.skill}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs sm:text-sm font-semibold font-body ${pri.text}`}>{gap.importance_level} Priority</span>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className={`text-xs sm:text-sm font-semibold font-body ${depth.text}`}>{depth.label}</span>
                </div>
              </div>
            </div>
            {/* Time badge + chevron */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 rounded-lg bg-accent/8 border border-accent/15 px-3 py-2">
                <Clock className="h-4 w-4 text-accent" />
                <div className="text-center">
                  <div className="text-sm font-body font-semibold text-accent">{hours}h</div>
                  <div className="text-xs font-body text-muted-foreground">{durationLabel}</div>
                </div>
              </div>
              <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Expandable */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4 border-t border-border pt-4">
                {/* Time breakdown */}
                <div className="flex items-center gap-3 rounded-xl bg-accent/5 border border-accent/10 px-4 py-3">
                  <Calendar className="h-5 w-5 text-accent shrink-0" />
                  <div className="text-sm font-body text-foreground">
                    <span className="font-semibold">{hours} hours</span> of learning · <span className="font-semibold">{durationLabel}</span>
                    <span className="text-muted-foreground"> · Complete by week {cumulativeWeeks}</span>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-body font-medium text-foreground">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" /> {gap.skill_type}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-body font-medium text-foreground">
                    Gap: {gap.related_resume_gap}
                  </span>
                  {gap.dependency_skills.length > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-accent/8 border border-accent/15 px-3 py-1.5 text-sm font-body font-medium text-accent">
                      Prerequisites: {gap.dependency_skills.join(", ")}
                    </span>
                  )}
                </div>

                {/* Action */}
                <div className="rounded-xl bg-accent/5 border border-accent/15 p-4">
                  <p className="text-sm font-display font-semibold text-accent mb-2 flex items-center gap-2">
                    <Rocket className="h-4 w-4" /> Learning Strategy
                  </p>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">{getActionText(gap)}</p>
                </div>

                {/* Resources */}
                <div>
                  <p className="text-sm font-display font-semibold text-foreground mb-3">Free Learning Resources</p>
                  <div className="grid grid-cols-2 gap-2">
                    {resources.map(r => (
                      <a key={r.type} href={r.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                        className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-body font-medium text-foreground hover:border-accent/30 hover:bg-accent/5 transition-all group/link"
                      >
                        <span className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${r.color}`}>{r.icon}</span>
                        <span className="truncate">{r.type}</span>
                        <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* ═══════════════════ PAGE ═══════════════════ */
const Roadmap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.result as AnalysisResult | undefined;
  const initialHours = (location.state?.weeklyHours as number) ?? 20;
  const roadRef = useRef<HTMLDivElement>(null);
  const [weeklyHours, setWeeklyHours] = useState(initialHours);

  if (!data) {
    return (
      <div className="min-h-screen bg-background dot-pattern flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-5">
          <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
            <Rocket className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">No roadmap data</h1>
          <p className="text-muted-foreground font-body text-lg">Run an analysis first to see your roadmap.</p>
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

  // Combine all missing + partial skills for roadmap
  const allGaps = [...data.gap_intelligence];
  const gapSkills = new Set(allGaps.map(g => g.skill.toLowerCase()));
  data.skill_analysis.missing_skills.forEach(skill => {
    if (!gapSkills.has(skill.toLowerCase())) {
      allGaps.push({
        skill,
        importance_level: "High",
        skill_type: "core",
        dependency_skills: [],
        related_resume_gap: "Not found in resume",
        expected_depth: "intermediate",
      });
    }
  });
  data.skill_analysis.partial_skills.forEach(skill => {
    if (!gapSkills.has(skill.toLowerCase())) {
      allGaps.push({
        skill,
        importance_level: "Medium",
        skill_type: "core",
        dependency_skills: [],
        related_resume_gap: "Partially present",
        expected_depth: "intermediate",
      });
    }
  });

  const sortedGaps = allGaps.sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return (order[a.importance_level] ?? 3) - (order[b.importance_level] ?? 3);
  });

  const timeline = buildTimeline(sortedGaps, weeklyHours);

  return (
    <div className="min-h-screen bg-background dot-pattern">
      {/* Enhanced Navbar */}
      <EnhancedNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* ── HEADER ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 relative"
        >
          <Sparkles className="absolute top-0 right-1/4 h-6 w-6 text-warning/40 sparkle" />
          <Sparkles className="absolute bottom-0 left-1/3 h-5 w-5 text-accent/30 sparkle sparkle-delay-2" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="h-20 w-20 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center mx-auto"
          >
            <Rocket className="h-10 w-10 text-accent" />
          </motion.div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Your Learning <span className="font-display italic text-gradient-purple">Roadmap</span>
          </h1>
          <p className="text-muted-foreground font-body text-base sm:text-lg max-w-xl mx-auto">
            <span className="font-semibold text-foreground">{data.candidate_profile.name}</span>'s personalized path to becoming a <span className="font-display italic text-foreground">{data.job_analysis.role}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-body text-muted-foreground">
            <span className="flex items-center gap-2"><Flag className="h-4 w-4 text-accent" /> {sortedGaps.length} Skills</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-info" /> {timeline.totalHours}h Total</span>
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-warning" /> {formatDuration(timeline.totalWeeks)}</span>
            <span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-success" /> Free Resources</span>
          </div>
          <p className="text-muted-foreground font-body text-xs sm:text-sm">Tap any milestone to expand details & resources</p>
        </motion.section>

        {/* Rainbow divider */}
        <div className="rainbow-bar" />

        {/* ── THE ROAD ── */}
        <div className="relative overflow-hidden" ref={roadRef}>
          <RealisticAnimatedRoad containerRef={roadRef} milestoneCount={sortedGaps.length} />

          {/* START */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex justify-center mb-16 relative z-20"
          >
            <div className="flex items-center gap-3 rounded-full bg-success/10 border-2 border-success/30 px-8 py-4 shadow-glow-success" role="status" aria-label="Starting point of learning roadmap">
              <div className="h-4 w-4 rounded-full bg-success animate-pulse" aria-hidden="true" />
              <span className="text-sm font-display font-bold text-success tracking-widest uppercase">Start Your Journey</span>
            </div>
          </motion.div>

          {/* Horizontal Milestone Cards */}
          <div className="milestone-container relative z-20 space-y-16">
            {sortedGaps.map((gap, i) => (
              <motion.div
                key={`${gap.skill}-${i}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 + 1, duration: 0.6, ease: "easeOut" }}
                className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Milestone Number */}
                <div className="flex-shrink-0 relative">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-white font-bold text-lg">{i + 1}</span>
                  </div>
                  {/* Connecting line to road */}
                  <div className={`absolute top-8 w-12 h-0.5 bg-gradient-to-r from-primary to-purple-600 ${i % 2 === 0 ? 'left-16' : 'right-16'}`} />
                </div>

                {/* Milestone Card */}
                <div className="flex-1 max-w-md">
                  <MilestoneCard
                    gap={gap}
                    index={i}
                    total={sortedGaps.length}
                    hours={timeline.items[i]?.hours ?? 0}
                    weeks={timeline.items[i]?.weeks ?? 0}
                    durationLabel={timeline.items[i]?.durationLabel ?? ""}
                    cumulativeWeeks={timeline.items[i]?.cumulativeWeeks ?? 0}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FINISH (outside road container) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="flex justify-center relative z-30"
        >
          <div className="flex flex-col items-center gap-4 rounded-3xl px-10 py-6">
            <div className="flex items-center gap-3 rounded-full bg-accent/10 border-2 border-accent/30 px-8 py-3" style={{ boxShadow: "var(--shadow-glow)" }}>
              <Trophy className="h-5 w-5 text-accent" />
              <span className="text-sm font-display font-bold text-accent tracking-widest uppercase">Goal Reached!</span>
            </div>
            <p className="text-base font-body text-muted-foreground text-center">
              You're ready for <span className="font-display italic font-bold text-foreground">{data.job_analysis.role}</span>
              <span className="text-accent font-semibold"> — in {formatDuration(timeline.totalWeeks)}</span>
            </p>
          </div>
        </motion.div>

        {/* ── TOOLS & DOMAINS ── */}
        <div className="space-y-6">
          {/* Recommended Tools Card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card border border-border p-5 sm:p-6 hover-lift shadow-card">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted flex items-center justify-center"><Wrench className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" /></div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">Recommended Tools</h2>
                <p className="text-sm sm:text-base font-body text-muted-foreground">Essential for this role</p>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-2.5">
              {data.roadmap_context.toolchain_recommendations.map((tool, i) => (
                <div key={tool} className="flex items-center gap-3 rounded-xl bg-background border border-border px-3.5 sm:px-4 py-2.5 sm:py-3 hover:border-accent/20 transition-colors">
                  <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-accent/8 text-accent flex items-center justify-center text-xs sm:text-sm font-bold font-display shrink-0">{i + 1}</span>
                  <span className="text-sm sm:text-base font-body text-foreground">{tool}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Focus Areas Card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl bg-card border border-border p-5 sm:p-6 hover-lift shadow-card">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-info/8 border border-info/15 flex items-center justify-center"><Layers className="h-5 w-5 sm:h-6 sm:w-6 text-info" /></div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">Focus Areas</h2>
                <p className="text-sm sm:text-base font-body text-muted-foreground">Key domains to learn</p>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-2.5">
              {data.roadmap_context.preferred_learning_domains.map((d, i) => (
                <div key={d} className="flex items-center gap-3 rounded-xl bg-background border border-border px-3.5 sm:px-4 py-2.5 sm:py-3 hover:border-info/20 transition-colors">
                  <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-info/8 text-info flex items-center justify-center text-xs sm:text-sm font-bold font-display shrink-0">{i + 1}</span>
                  <span className="text-sm sm:text-base font-body text-foreground">{d}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Practice Projects Card */}
          {data.roadmap_context.suggested_project_types.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-card border border-border p-5 sm:p-6 hover-lift shadow-card">
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-success/8 border border-success/15 flex items-center justify-center"><Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-success" /></div>
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">Practice Projects</h2>
                  <p className="text-sm sm:text-base font-body text-muted-foreground">Hands-on learning opportunities</p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-2.5">
                {data.roadmap_context.suggested_project_types.map((p, i) => (
                  <div key={p} className="flex items-start gap-3 rounded-xl bg-background border border-border px-3.5 sm:px-4 py-2.5 sm:py-3 hover:border-success/20 transition-colors">
                    <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-success/8 text-success flex items-center justify-center text-xs sm:text-sm font-bold font-display shrink-0">{i + 1}</span>
                    <span className="text-sm sm:text-base font-body text-foreground leading-relaxed">{p}</span>
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
