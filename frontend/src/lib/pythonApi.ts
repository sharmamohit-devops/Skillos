// Python Backend API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AnalysisRequest {
  resume_text: string;
  jd_text: string;
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
    skill_depth?: any;
    skill_weights?: any;
    weighted_match_score?: number;
    risk_factors?: string[];
  };
  gap_intelligence: Array<{
    skill: string;
    gap_type: string;
    priority: string;
    learning_resource: string;
    estimated_hours: number;
  }>;
  evaluation: {
    match_score: number;
    strengths: string[];
    weaknesses: string[];
    risk_factors: string[];
  };
  roadmap_context: {
    target_role: string;
    current_level: string;
    target_level: string;
    estimated_weeks: number;
  };
  learning_pathway: Array<{
    phase: string;
    module: string;
    skills: string[];
    resources: string[];
    duration_days: number;
    verification_method: string;
  }>;
  reasoning_trace: string[];
  agent_reports: {
    ats: { agent: string; name: string; role: string; verdict: string; confidence: number; comment: string };
    hr: { agent: string; name: string; role: string; verdict: string; confidence: number; comment: string };
    startup: { agent: string; name: string; role: string; verdict: string; confidence: number; comment: string };
    tech: { agent: string; name: string; role: string; verdict: string; confidence: number; comment: string };
  };
  overall_score: number;
  shortlist_probability: number;
  verdict: string;
  panel_consensus: string;
  simulation_source: string;
  mirrorfish_status?: string;
}

export async function analyzeResumeJD(request: AnalysisRequest): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  return await response.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

export interface EnrichProfileRequest {
  resume_text: string;
  github_url?: string;
  linkedin_url?: string;
}

export interface EnrichedProfile {
  resume_text: string;
  github_data?: {
    username: string;
    name: string;
    bio: string;
    public_repos: number;
    followers: number;
  };
  linkedin_data?: {
    url: string;
    note: string;
  };
  additional_skills: string[];
  projects: Array<{
    name: string;
    description: string;
    language: string;
    stars: number;
    url: string;
  }>;
  total_experience_years: number;
}

export async function enrichProfile(request: EnrichProfileRequest): Promise<EnrichedProfile> {
  const response = await fetch(`${API_BASE_URL}/enrich-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Profile enrichment failed: ${response.statusText}`);
  }

  return await response.json();
}
