export interface GapIntelligence {
  skill: string;
  importance_level: "High" | "Medium" | "Low";
  skill_type: "core" | "tool" | "framework" | "concept";
  dependency_skills: string[];
  related_resume_gap: string;
  expected_depth: "basic" | "intermediate" | "advanced";
}

export interface PathwayStep {
  sequence: number;
  skill: string;
  title: string;
  description: string;
  importance_level: "High" | "Medium" | "Low";
  expected_depth: "basic" | "intermediate" | "advanced";
  estimated_hours: number;
  time_commitment: {
    total_hours: number;
    estimated_weeks: number;
    hours_per_week: number;
    daily_commitment: string;
  };
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  learning_resources: string[];
  practice_projects: string[];
  assessment_criteria: string[];
  status: "not_started" | "in_progress" | "completed";
}

export interface SkillWeight {
  skill: string;
  importance: "High" | "Medium" | "Low";
}

export interface AgentReport {
  agent: string;
  name: string;
  role: string;
  verdict: string;
  confidence: number;
  comment?: string;
  // ATS specific
  keyword_score?: number;
  format_score?: number;
  missing_keywords?: string[];
  rejection_reasons?: string[];
  pass_reasons?: string[];
  // HR specific
  culture_fit_score?: number;
  progression_score?: number;
  soft_skill_score?: number;
  red_flags?: string[];
  green_flags?: string[];
  // Startup specific
  execution_score?: number;
  breadth_score?: number;
  startup_fit_score?: number;
  excited_about?: string[];
  concerns?: string[];
  // Tech specific
  depth_score?: number;
  stack_score?: number;
  complexity_score?: number;
  impressed_by?: string[];
  technical_comment?: string;
}

export interface AnalysisResult {
  candidate_profile: {
    name: string;
    education: string;
    domains: string[];
    skills: string[];
    projects: string[];
    experience: string;
  };
  job_analysis: {
    role: string;
    required_skills: string[];
    tech_stack: string[];
    experience_required: string;
    domains: string[];
  };
  skill_analysis: {
    matched_skills: string[];
    missing_skills: string[];
    partial_skills: string[];
    skill_match_percentage: number;
    skill_depth?: Record<string, string>;
    skill_weights?: SkillWeight[];
    weighted_match_score?: number;
    risk_factors?: string[];
  };
  gap_intelligence: GapIntelligence[];
  evaluation: {
    match_score: number;
    strengths: string[];
    weaknesses: string[];
    risk_factors: string[];
  };
  roadmap_context: {
    preferred_learning_domains: string[];
    project_complexity_level: string;
    suggested_project_types: string[];
    toolchain_recommendations: string[];
  };
  // SkillOS Virtual HR Simulation
  agent_reports?: Record<string, AgentReport>;
  overall_score?: number;
  shortlist_probability?: number;
  verdict?: string;
  panel_consensus?: string;
  // MirrorFish metadata
  simulation_source?: string;
  mirrorfish_status?: string;
  // Python backend generated pathway
  learning_pathway?: PathwayStep[];
  reasoning_trace?: string[];
}

export interface AdvancedAnalysisResult {
  skills: {
    matched: string[];
    missing: string[];
    partial: string[];
    skill_match_percentage: number;
  };
  skill_depth: Record<string, string>;
  skill_weights: SkillWeight[];
  weighted_match_score: number;
  risk_factors: string[];
}
