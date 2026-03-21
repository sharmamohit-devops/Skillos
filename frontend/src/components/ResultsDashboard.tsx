import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Download, Layers, Lightbulb, Shield, Sparkles, Target, Wrench } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";
import ScoreRing from "./ScoreRing";
import SkillBadge from "./SkillBadge";
import ResultSection from "./results/ResultSection";
import ResultsCharts from "./results/ResultsCharts";
import ExportPdfButton from "./results/ExportPdfButton";

const ResultsDashboard = ({ data }: { data: AnalysisResult }) => {
  const topMissing = useMemo(() => data.gap_intelligence.slice(0, 4), [data.gap_intelligence]);

  return (
    <motion.div
      id="analysis-report"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] border border-border p-8"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-primary-foreground/90">
              <Sparkles className="h-3.5 w-3.5" /> Premium Match Intelligence
            </div>
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              {data.candidate_profile.name || "Candidate"} × {data.job_analysis.role}
            </h2>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-primary-foreground/80 md:text-base">
              Resume, job requirements, missing skills, and roadmap ko ek premium decision snapshot mein convert kiya gaya hai.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {topMissing.map((gap) => (
                <span
                  key={gap.skill}
                  className="rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-2 text-xs font-body font-medium text-primary-foreground"
                >
                  Focus: {gap.skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <ScoreRing score={data.evaluation.match_score} label="Match Score" />
            <ScoreRing score={data.skill_analysis.skill_match_percentage} label="Skill Match" />
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-card p-5 md:flex-row md:items-center md:justify-between" style={{ boxShadow: "var(--shadow-card)" }}>
        <div>
          <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Downloadable Summary</p>
          <h3 className="font-display text-2xl text-foreground">Share-ready analysis report</h3>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Download className="h-4 w-4" />
          <ExportPdfButton targetId="analysis-report" />
        </div>
      </div>

      <ResultsCharts data={data} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ResultSection title="Skill Analysis" icon={Target} delay={0.1}>
          <div className="space-y-5">
            {data.skill_analysis.matched_skills.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-success">Matched</p>
                <div className="flex flex-wrap gap-2">
                  {data.skill_analysis.matched_skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} variant="matched" />
                  ))}
                </div>
              </div>
            )}
            {data.skill_analysis.partial_skills.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-warning">Partial</p>
                <div className="flex flex-wrap gap-2">
                  {data.skill_analysis.partial_skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} variant="partial" />
                  ))}
                </div>
              </div>
            )}
            {data.skill_analysis.missing_skills.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-destructive">Missing</p>
                <div className="flex flex-wrap gap-2">
                  {data.skill_analysis.missing_skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} variant="missing" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ResultSection>

        <ResultSection title="Evaluation" icon={Shield} delay={0.2}>
          <div className="space-y-5">
            {data.evaluation.strengths.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-success">Strengths</p>
                <ul className="space-y-2">
                  {data.evaluation.strengths.map((item, index) => (
                    <li key={index} className="rounded-2xl bg-success/5 px-4 py-3 text-sm text-card-foreground font-body">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.evaluation.weaknesses.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-warning">Weaknesses</p>
                <ul className="space-y-2">
                  {data.evaluation.weaknesses.map((item, index) => (
                    <li key={index} className="rounded-2xl bg-warning/10 px-4 py-3 text-sm text-card-foreground font-body">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.evaluation.risk_factors.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-destructive">Risk Factors</p>
                <ul className="space-y-2">
                  {data.evaluation.risk_factors.map((item, index) => (
                    <li key={index} className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-card-foreground font-body">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ResultSection>

        <ResultSection title="Gap Intelligence" icon={AlertTriangle} delay={0.3}>
          <div className="space-y-3">
            {data.gap_intelligence.map((gap, index) => (
              <motion.div
                key={`${gap.skill}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
                className="rounded-[1.4rem] border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-display text-base font-semibold text-foreground">{gap.skill}</h4>
                    <p className="mt-1 text-xs text-muted-foreground font-body">
                      {gap.skill_type} · {gap.expected_depth} depth · Gap in {gap.related_resume_gap}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-body font-semibold text-foreground">
                    {gap.importance_level}
                  </span>
                </div>
                {gap.dependency_skills.length > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground font-body">
                    Prerequisites: {gap.dependency_skills.join(", ")}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </ResultSection>

        <ResultSection title="Roadmap Context" icon={Lightbulb} delay={0.4}>
          <div className="space-y-5">
            <div className="rounded-[1.4rem] bg-accent/5 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Project Complexity</p>
              <p className="mt-2 font-display text-lg capitalize text-foreground">
                {data.roadmap_context.project_complexity_level}
              </p>
            </div>

            {data.roadmap_context.suggested_project_types.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Suggested Projects</p>
                <div className="flex flex-wrap gap-2">
                  {data.roadmap_context.suggested_project_types.map((item) => (
                    <span key={item} className="rounded-full bg-accent/10 px-3 py-2 text-xs font-body font-medium text-accent">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.roadmap_context.toolchain_recommendations.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Toolchain</p>
                <div className="flex flex-wrap gap-2">
                  {data.roadmap_context.toolchain_recommendations.map((tool) => (
                    <span key={tool} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-body font-medium text-foreground">
                      <Wrench className="h-3 w-3" /> {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.roadmap_context.preferred_learning_domains.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Learning Domains</p>
                <div className="flex flex-wrap gap-2">
                  {data.roadmap_context.preferred_learning_domains.map((domain) => (
                    <span key={domain} className="inline-flex items-center gap-2 rounded-full bg-info/10 px-3 py-2 text-xs font-body font-medium text-info">
                      <Layers className="h-3 w-3" /> {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ResultSection>
      </div>
    </motion.div>
  );
};

export default ResultsDashboard;
