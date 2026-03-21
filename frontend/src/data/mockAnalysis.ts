import type { AnalysisResult } from "@/types/analysis";

export const mockAnalysisResult: AnalysisResult = {
  candidate_profile: {
    name: "Rahul Sharma",
    education: "B.Tech in Computer Science, IIT Delhi",
    domains: ["Web Development", "Machine Learning", "Cloud Computing"],
    skills: ["React", "TypeScript", "Python", "Node.js", "TailwindCSS", "Docker", "MongoDB", "Git", "REST APIs", "SQL"],
    projects: [
      "E-commerce Platform (React, Node.js, MongoDB)",
      "Sentiment Analysis Tool (Python, NLTK, Flask)",
      "Real-time Chat App (Socket.io, React, Express)"
    ],
    experience: "2 years as Frontend Developer at TechCorp"
  },
  job_analysis: {
    role: "Full Stack Developer",
    required_skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL", "CI/CD", "Redis", "Kubernetes"],
    tech_stack: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL"],
    experience_required: "3+ years",
    domains: ["Web Development", "Cloud Infrastructure", "DevOps"]
  },
  skill_analysis: {
    matched_skills: ["React", "TypeScript", "Node.js", "Docker", "Git", "REST APIs"],
    missing_skills: ["PostgreSQL", "AWS", "GraphQL", "CI/CD", "Redis", "Kubernetes"],
    partial_skills: ["SQL", "Cloud Computing", "Testing"],
    skill_match_percentage: 52
  },
  gap_intelligence: [
    {
      skill: "PostgreSQL",
      importance_level: "High",
      skill_type: "core",
      dependency_skills: ["SQL"],
      related_resume_gap: "experience",
      expected_depth: "advanced"
    },
    {
      skill: "AWS",
      importance_level: "High",
      skill_type: "tool",
      dependency_skills: ["Cloud Computing", "Docker"],
      related_resume_gap: "project",
      expected_depth: "intermediate"
    },
    {
      skill: "GraphQL",
      importance_level: "Medium",
      skill_type: "framework",
      dependency_skills: ["REST APIs", "Node.js"],
      related_resume_gap: "project",
      expected_depth: "intermediate"
    },
    {
      skill: "CI/CD",
      importance_level: "Medium",
      skill_type: "concept",
      dependency_skills: ["Git", "Docker"],
      related_resume_gap: "experience",
      expected_depth: "intermediate"
    },
    {
      skill: "Redis",
      importance_level: "Low",
      skill_type: "tool",
      dependency_skills: ["Database fundamentals"],
      related_resume_gap: "project",
      expected_depth: "basic"
    },
    {
      skill: "Kubernetes",
      importance_level: "Medium",
      skill_type: "tool",
      dependency_skills: ["Docker", "Cloud Computing"],
      related_resume_gap: "experience",
      expected_depth: "intermediate"
    }
  ],
  evaluation: {
    match_score: 58,
    strengths: [
      "Strong frontend skills with React and TypeScript",
      "Experience with containerization (Docker)",
      "Solid foundation in web development fundamentals",
      "Project experience demonstrates practical application"
    ],
    weaknesses: [
      "No experience with PostgreSQL or relational databases at scale",
      "Missing cloud platform (AWS) experience",
      "No GraphQL experience — only REST APIs",
      "Lacks CI/CD pipeline knowledge"
    ],
    risk_factors: [
      "1 year less experience than required",
      "No backend-heavy project experience",
      "Missing DevOps and infrastructure skills",
      "No evidence of system design knowledge"
    ]
  },
  roadmap_context: {
    preferred_learning_domains: ["Backend Development", "Cloud & DevOps", "Database Management"],
    project_complexity_level: "intermediate",
    suggested_project_types: ["REST-to-GraphQL migration", "CI/CD pipeline setup", "Cloud-deployed full-stack app", "Real-time dashboard with Redis"],
    toolchain_recommendations: ["AWS Free Tier", "PostgreSQL", "GitHub Actions", "Kubernetes (minikube)", "Apollo GraphQL"]
  }
};
