import { motion } from "framer-motion";
import { Bot, Brain, Briefcase, Code, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { analyzeResumeWithGemini } from '@/lib/gemini';

interface SimulationLoaderProps {
  resumeText: string;
  jobDescription: string;
  onComplete: (result: any) => void;
}

const agents = [
  { id: "ats", name: "ATLAS", role: "ATS System", icon: Bot, color: "text-blue-400" },
  { id: "hr", name: "PRIYA", role: "HR Screener", icon: Users, color: "text-pink-400" },
  { id: "startup", name: "ALEX", role: "Startup HM", icon: Briefcase, color: "text-orange-400" },
  { id: "tech", name: "DR. CHEN", role: "Technical Lead", icon: Code, color: "text-green-400" }
];

// Mock data generator for demo when backend is not available
const generateMockAnalysis = (resumeText: string, jobDescription: string) => {
  // Extract basic info from resume text
  const resumeWords = resumeText.toLowerCase().split(/\s+/);
  const jdWords = jobDescription.toLowerCase().split(/\s+/);
  
  // Common skills to look for
  const allSkills = ['python', 'javascript', 'react', 'node', 'sql', 'docker', 'aws', 'git', 'html', 'css', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'redis', 'kubernetes', 'jenkins', 'linux', 'windows', 'azure', 'gcp'];
  
  const candidateSkills = allSkills.filter(skill => resumeWords.includes(skill));
  const requiredSkills = allSkills.filter(skill => jdWords.includes(skill));
  const matchedSkills = candidateSkills.filter(skill => requiredSkills.includes(skill));
  const missingSkills = requiredSkills.filter(skill => !candidateSkills.includes(skill));
  
  const skillMatchPct = requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 0;
  
  // Extract candidate name (first few words that look like a name)
  const nameMatch = resumeText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
  const candidateName = nameMatch ? nameMatch[1] : "Demo Candidate";
  
  // Extract job role
  const roleMatch = jobDescription.match(/(developer|engineer|analyst|manager|lead|architect|designer)/i);
  const jobRole = roleMatch ? `${roleMatch[1]} Position` : "Software Developer";
  
  return {
    candidate_profile: {
      name: candidateName,
      education: "Bachelor's degree in Computer Science",
      domains: ["Software Development", "Technology"],
      skills: candidateSkills.slice(0, 8),
      projects: ["E-commerce Platform", "Task Management App"],
      experience: "2-3 years of professional experience"
    },
    job_analysis: {
      role: jobRole,
      required_skills: requiredSkills.slice(0, 10),
      tech_stack: requiredSkills.slice(0, 6),
      experience_required: "2-5 years experience preferred",
      domains: ["Technology", "Software Development"]
    },
    skill_analysis: {
      matched_skills: matchedSkills,
      missing_skills: missingSkills.slice(0, 5),
      partial_skills: [],
      skill_match_percentage: skillMatchPct,
      skill_depth: Object.fromEntries(matchedSkills.map(skill => [skill, "intermediate"])),
      skill_weights: [...matchedSkills, ...missingSkills.slice(0, 3)].map(skill => ({
        skill,
        importance: matchedSkills.includes(skill) ? "High" : "Medium"
      })),
      weighted_match_score: skillMatchPct,
      risk_factors: missingSkills.length > 3 ? ["Multiple skill gaps identified"] : []
    },
    gap_intelligence: missingSkills.slice(0, 5).map(skill => ({
      skill,
      importance_level: "Medium" as const,
      skill_type: "tool" as const,
      dependency_skills: [],
      related_resume_gap: `Missing ${skill}`,
      expected_depth: "intermediate" as const
    })),
    evaluation: {
      match_score: skillMatchPct,
      strengths: [
        "Good technical foundation",
        matchedSkills.length > 2 ? "Strong skill alignment" : "Basic skill coverage"
      ],
      weaknesses: [
        missingSkills.length > 2 ? "Several skill gaps to address" : "Minor skill gaps",
        "Could benefit from more hands-on experience"
      ],
      risk_factors: missingSkills.length > 4 ? ["Significant skill gaps"] : []
    },
    roadmap_context: {
      preferred_learning_domains: ["Web Development", "Backend Development"],
      project_complexity_level: "intermediate",
      suggested_project_types: ["Full Stack Application", "API Development"],
      toolchain_recommendations: ["VS Code", "Git", "Docker", "Postman"]
    },
    learning_pathway: missingSkills.slice(0, 4).map((skill, index) => ({
      sequence: index + 1,
      skill,
      title: `Learn ${skill}`,
      description: `Master ${skill} fundamentals and best practices`,
      importance_level: "Medium" as const,
      expected_depth: "intermediate" as const,
      estimated_hours: 20 + (index * 5),
      time_commitment: {
        total_hours: 20 + (index * 5),
        estimated_weeks: 3,
        hours_per_week: 8,
        daily_commitment: "1-2 hours/day"
      },
      difficulty: "intermediate" as const,
      prerequisites: [],
      learning_resources: [`${skill} Official Documentation`, `${skill} Tutorial Series`],
      practice_projects: [`${skill} Practice Project`],
      assessment_criteria: [`Complete ${skill} exercises`, `Build a project using ${skill}`],
      status: "not_started" as const
    })),
    reasoning_trace: [
      `Analyzed ${candidateSkills.length} candidate skills`,
      `Found ${matchedSkills.length} matching skills`,
      `Identified ${missingSkills.length} skill gaps`,
      `Generated learning pathway for top ${Math.min(4, missingSkills.length)} priority skills`
    ],
    // Virtual HR Simulation Results
    agent_reports: {
      ats: {
        agent: "ats",
        name: "ATLAS",
        role: "ATS System",
        verdict: skillMatchPct >= 70 ? "PASS" : skillMatchPct >= 50 ? "REVIEW" : "FAIL",
        confidence: Math.min(95, Math.max(45, skillMatchPct + 10)),
        comment: skillMatchPct >= 70 
          ? `PROCESSING COMPLETE. Keyword density: ${skillMatchPct}%. Format compliance: 85%. APPROVED for human review.`
          : skillMatchPct >= 50
          ? `MARGINAL MATCH. Keyword density: ${skillMatchPct}%. Format compliance: 80%. Manual screening recommended.`
          : `INSUFFICIENT MATCH. Keyword density: ${skillMatchPct}%. Format compliance: 75%. Does not meet minimum requirements.`,
        keyword_score: skillMatchPct,
        format_score: 80
      },
      hr: {
        agent: "hr",
        name: "PRIYA",
        role: "HR Screener",
        verdict: skillMatchPct >= 65 ? "SHORTLIST" : skillMatchPct >= 45 ? "MAYBE" : "NO",
        confidence: Math.min(90, Math.max(50, skillMatchPct + 5)),
        comment: skillMatchPct >= 65
          ? "Strong technical profile with good growth potential. Cultural fit indicators are positive."
          : skillMatchPct >= 45
          ? "Decent technical foundation but needs skill development. Could be a good culture fit with training."
          : "Technical skills below requirements. Would need significant upskilling to succeed in this role.",
        culture_fit_score: Math.min(85, Math.max(60, skillMatchPct + 15))
      },
      startup: {
        agent: "startup",
        name: "ALEX",
        role: "Startup HM",
        verdict: skillMatchPct >= 60 ? "HIRE" : skillMatchPct >= 40 ? "MAYBE" : "NO",
        confidence: Math.min(88, Math.max(55, skillMatchPct + 8)),
        comment: skillMatchPct >= 60
          ? "Shows strong execution potential and adaptability. Good fit for our fast-paced environment."
          : skillMatchPct >= 40
          ? "Has potential but needs to demonstrate more hands-on experience. Could work with mentoring."
          : "Lacks the breadth of skills needed for a startup environment. Would struggle with our pace.",
        execution_score: Math.min(80, Math.max(45, skillMatchPct + 10))
      },
      tech: {
        agent: "tech",
        name: "DR. CHEN",
        role: "Technical Lead",
        verdict: skillMatchPct >= 75 ? "YES" : skillMatchPct >= 55 ? "MAYBE" : "NO",
        confidence: Math.min(92, Math.max(48, skillMatchPct + 12)),
        comment: skillMatchPct >= 75
          ? "Solid technical foundation with good depth in core technologies. Ready for complex projects."
          : skillMatchPct >= 55
          ? "Adequate technical skills but needs growth in some areas. Could handle intermediate tasks well."
          : "Technical skills need significant development. Would require extensive training and mentoring.",
        depth_score: Math.min(85, Math.max(40, skillMatchPct + 5)),
        stack_score: skillMatchPct
      }
    },
    overall_score: Math.round((skillMatchPct + 75) / 2), // Average with base score
    shortlist_probability: Math.min(85, Math.max(25, skillMatchPct + 10)),
    verdict: skillMatchPct >= 70 ? "STRONG_CANDIDATE" : skillMatchPct >= 50 ? "CANDIDATE" : "NEEDS_WORK",
    panel_consensus: `${skillMatchPct >= 60 ? 3 : skillMatchPct >= 40 ? 2 : 1} of 4 agents recommend advancing (Demo Mode)`,
    simulation_source: "demo_fallback",
    mirrorfish_status: "demo_mode"
  };
};

const SimulationLoader = ({ resumeText, jobDescription, onComplete }: SimulationLoaderProps) => {
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        // Simulate agent progression
        const agentInterval = setInterval(() => {
          setCurrentAgentIndex(prev => {
            if (prev < agents.length - 1) {
              return prev + 1;
            } else {
              clearInterval(agentInterval);
              return prev;
            }
          });
        }, 1500); // Each agent takes 1.5 seconds

        let result;
        
        try {
          // Trigger background scan and poll Firebase chunks
          result = await analyzeResumeWithGemini(resumeText, jobDescription);
        } catch (backendError) {
          console.warn("Backend not available or polling failed, using mock data:", backendError);
          // Fallback to mock data for demo
          result = generateMockAnalysis(resumeText, jobDescription);
        }
        
        // Wait for all agents to "complete" before showing results
        setTimeout(() => {
          setIsAnalyzing(false);
          localStorage.setItem('latest_analysis_result', JSON.stringify(result));
          onComplete(result);
        }, Math.max(2000, (agents.length * 1500) - (Date.now() - performance.now())));

      } catch (error) {
        console.error("Analysis error:", error);
        setIsAnalyzing(false);
        onComplete({ 
          error: error instanceof Error ? error.message : "Analysis failed. Please try again." 
        });
      }
    };

    runAnalysis();
  }, [resumeText, jobDescription, onComplete]);

  const currentAgent = agents[currentAgentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Virtual HR Room
          </h2>
          <p className="text-muted-foreground font-body text-sm">
            4 AI agents are evaluating your profile...
          </p>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            const isActive = currentAgentIndex === index && isAnalyzing;
            const isCompleted = currentAgentIndex > index;
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0.3, scale: 0.9 }}
                animate={{ 
                  opacity: isActive ? 1 : isCompleted ? 0.8 : 0.4,
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`relative p-4 rounded-2xl border transition-all ${
                  isActive 
                    ? "bg-primary/10 border-primary/30 shadow-lg" 
                    : isCompleted
                    ? "bg-success/10 border-success/30"
                    : "bg-muted/30 border-border"
                }`}
              >
                {/* Thinking animation for active agent */}
                {isActive && (
                  <motion.div
                    className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                  isActive ? "bg-primary/20" : isCompleted ? "bg-success/20" : "bg-muted/50"
                }`}>
                  <Icon className={`h-4 w-4 ${
                    isActive ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
                  }`} />
                </div>
                
                <h3 className="font-display text-sm font-bold text-foreground mb-1">
                  {agent.name}
                </h3>
                <p className="text-xs text-muted-foreground font-body">
                  {agent.role}
                </p>
                
                {/* Status indicator */}
                <div className="mt-2">
                  {isCompleted ? (
                    <div className="h-1 w-full bg-success/30 rounded-full">
                      <div className="h-full bg-success rounded-full" />
                    </div>
                  ) : isActive ? (
                    <div className="h-1 w-full bg-primary/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                      />
                    </div>
                  ) : (
                    <div className="h-1 w-full bg-muted/30 rounded-full" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Current Status */}
        <div className="text-center">
          {isAnalyzing ? (
            <motion.p
              key={currentAgent?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-body text-muted-foreground"
            >
              {currentAgent?.name} is analyzing your profile...
            </motion.p>
          ) : (
            <p className="text-sm font-body text-muted-foreground">
              Analysis complete! Preparing results...
            </p>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 bg-primary/30 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SimulationLoader;
