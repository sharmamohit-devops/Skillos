export interface GapIntelligence {
  skill: string;
  importance_level: "High" | "Medium" | "Low";
  skill_type: "core" | "tool" | "framework" | "concept";
  dependency_skills: string[];
  related_resume_gap: string;
  expected_depth: "basic" | "intermediate" | "advanced";
}

export interface SkillWeight {
  skill: string;
  importance: "High" | "Medium" | "Low";
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
