import type { GapIntelligence } from "@/types/analysis";

/**
 * Estimates learning hours for a skill based on its properties.
 * 
 * Base hours by depth:
 *   - basic: 12h
 *   - intermediate: 32h
 *   - advanced: 65h
 * 
 * Multiplier by skill_type:
 *   - core: 1.25x (foundational, takes longer)
 *   - framework: 1.15x
 *   - tool: 0.85x (focused, quicker)
 *   - concept: 0.7x (theoretical)
 * 
 * Dependency bonus: +4h per dependency skill (integration overhead)
 */

const BASE_HOURS: Record<string, number> = {
  basic: 12,
  intermediate: 32,
  advanced: 65,
};

const TYPE_MULTIPLIER: Record<string, number> = {
  core: 1.25,
  framework: 1.15,
  tool: 0.85,
  concept: 0.7,
};

export function estimateSkillHours(gap: GapIntelligence): number {
  const base = BASE_HOURS[gap.expected_depth] ?? 32;
  const mult = TYPE_MULTIPLIER[gap.skill_type] ?? 1;
  const depBonus = (gap.dependency_skills?.length ?? 0) * 4;
  return Math.round(base * mult + depBonus);
}

export function estimateSkillWeeks(hours: number, weeklyHours: number): number {
  if (weeklyHours <= 0) return 0;
  return Math.ceil(hours / weeklyHours);
}

export function formatDuration(weeks: number): string {
  if (weeks <= 1) return "~1 week";
  if (weeks <= 4) return `~${weeks} weeks`;
  const months = Math.round(weeks / 4.3);
  if (months <= 1) return "~1 month";
  return `~${months} months`;
}

export interface SkillTimeline {
  skill: string;
  hours: number;
  weeks: number;
  durationLabel: string;
  cumulativeWeeks: number;
}

export function buildTimeline(
  gaps: GapIntelligence[],
  weeklyHours: number
): { items: SkillTimeline[]; totalHours: number; totalWeeks: number } {
  let cumulative = 0;
  let totalHours = 0;
  const items = gaps.map((gap) => {
    const hours = estimateSkillHours(gap);
    const weeks = estimateSkillWeeks(hours, weeklyHours);
    cumulative += weeks;
    totalHours += hours;
    return {
      skill: gap.skill,
      hours,
      weeks,
      durationLabel: formatDuration(weeks),
      cumulativeWeeks: cumulative,
    };
  });
  return { items, totalHours, totalWeeks: cumulative };
}

export function getPaceLabel(weeklyHours: number): { emoji: string; label: string; description: string } {
  if (weeklyHours <= 10) return { emoji: "🐢", label: "Relaxed", description: "Gentle pace with plenty of rest" };
  if (weeklyHours <= 20) return { emoji: "⚖️", label: "Balanced", description: "Steady progress with work-life balance" };
  if (weeklyHours <= 35) return { emoji: "🚀", label: "Intensive", description: "Fast-track your skill development" };
  return { emoji: "🔥", label: "Full Immersion", description: "Maximum speed, full commitment" };
}
