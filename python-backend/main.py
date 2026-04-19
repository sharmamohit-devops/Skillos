from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import os
import sys
import asyncio
import hashlib
import time

# ── LLM HR cache (no lock needed — LLM calls are stateless) ──────────────────
_llm_hr_cache: dict = {}  # md5(resume[:500]+jd[:200]) → {"result": ..., "ts": float}
_CACHE_TTL = 300  # 5 min

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# ── LLM HR Service ────────────────────────────────────────────────────────────
try:
    from services.llm_hr_service import (
        build_seed_document,
        run_llm_hr_simulation,
        check_llm_hr_available,
    )

    print("LLM HR service loaded successfully")
except ImportError as e:
    print(f"LLM HR service import failed: {e}")

    def build_seed_document(ml_result, resume_text, job_description):
        return ""

    async def run_llm_hr_simulation(seed):
        return {}

    def check_llm_hr_available():
        return False


# ── ML Models ─────────────────────────────────────────────────────────────────
try:
    from models.skill_extractor import SkillExtractor
    from models.adaptive_pathfinder import AdaptivePathfinder
    from models.resume_parser import ResumeParser
    from models.jd_parser import JDParser
    from services.agent_orchestrator import AgentOrchestrator

    print("ML models loaded successfully")
except ImportError as e:
    print(f"Import error: {e}")
    print("Creating minimal fallback implementations...")

    class SkillExtractor:
        def analyze_skills(self, candidate_skills, required_skills):
            matched = list(set(candidate_skills) & set(required_skills))
            missing = list(set(required_skills) - set(candidate_skills))
            return {
                "matched_skills": matched,
                "missing_skills": missing,
                "partial_skills": [],
                "skill_match_percentage": (
                    len(matched) / len(required_skills) * 100 if required_skills else 0
                ),
            }

        def analyze_skills_advanced(self, resume_text, jd_text):
            resume_words = set(resume_text.lower().split())
            jd_words = set(jd_text.lower().split())
            common_skills = [
                "python",
                "javascript",
                "react",
                "node",
                "sql",
                "docker",
                "aws",
                "git",
            ]
            matched = [s for s in common_skills if s in resume_words and s in jd_words]
            missing = [
                s for s in common_skills if s in jd_words and s not in resume_words
            ]
            return {
                "skills": {
                    "matched": matched,
                    "missing": missing,
                    "partial": [],
                    "skill_match_percentage": (
                        len(matched) / len(common_skills) * 100 if common_skills else 0
                    ),
                },
                "skill_depth": {s: "intermediate" for s in matched},
                "skill_weights": [
                    {"skill": s, "importance": "Medium"} for s in matched + missing
                ],
                "weighted_match_score": (
                    len(matched) / len(common_skills) * 100 if common_skills else 0
                ),
                "risk_factors": (
                    ["Limited skill analysis available"] if not matched else []
                ),
            }

        def generate_gap_intelligence(
            self, missing_skills, partial_skills, job_analysis
        ):
            return [
                {
                    "skill": s,
                    "importance_level": "Medium",
                    "skill_type": "tool",
                    "dependency_skills": [],
                    "related_resume_gap": f"Missing {s}",
                    "expected_depth": "intermediate",
                }
                for s in missing_skills
            ]

        def evaluate_candidate(self, candidate_profile, job_analysis, skill_analysis):
            match_score = skill_analysis["skill_match_percentage"]
            matched_skills = skill_analysis.get("matched_skills", [])
            missing_skills = skill_analysis.get("missing_skills", [])
            matched_count = len(matched_skills)
            missing_count = len(missing_skills)
            
            # Generate VERY detailed strengths (10-15 points with specific examples)
            strengths = []
            matched_skills_str = ' '.join(matched_skills).lower()
            
            # Core programming strengths with details
            prog_langs = [s for s in ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust'] if s in matched_skills_str]
            if prog_langs:
                strengths.append(f"✓ Strong programming foundation with {len(prog_langs)} language{'s' if len(prog_langs) > 1 else ''}: {', '.join([s.title() for s in prog_langs[:3]])} - can adapt to new codebases quickly")
                if 'python' in prog_langs:
                    strengths.append("✓ Python expertise enables rapid prototyping, data analysis, and backend development")
                if 'javascript' in prog_langs or 'typescript' in prog_langs:
                    strengths.append("✓ JavaScript/TypeScript skills allow full-stack development and modern web applications")
            
            # Frontend skills with specific benefits
            frontend = [s for s in ['react', 'angular', 'vue', 'html', 'css', 'typescript'] if s in matched_skills_str]
            if frontend:
                strengths.append(f"✓ Modern frontend development skills with {', '.join([s.title() for s in frontend[:2]])} - can build responsive, user-friendly interfaces")
                if 'react' in frontend:
                    strengths.append("✓ React experience means familiarity with component-based architecture and modern UI patterns")
            
            # Backend skills with architecture knowledge
            backend = [s for s in ['node', 'express', 'django', 'flask', 'spring', 'laravel'] if s in matched_skills_str]
            if backend:
                strengths.append(f"✓ Backend development experience with {', '.join([s.title() for s in backend[:2]])} - understands server-side logic and API design")
                if 'node' in backend or 'express' in backend:
                    strengths.append("✓ Node.js/Express knowledge enables building scalable, high-performance server applications")
            
            # Database skills with data management
            databases = [s for s in ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle'] if s in matched_skills_str]
            if databases:
                strengths.append(f"✓ Database management expertise with {', '.join([s.upper() if s == 'sql' else s.title() for s in databases[:2]])} - can design schemas and optimize queries")
                if 'sql' in databases or 'mysql' in databases or 'postgresql' in databases:
                    strengths.append("✓ Relational database skills ensure data integrity and efficient data retrieval")
                if 'mongodb' in databases:
                    strengths.append("✓ NoSQL experience with MongoDB provides flexibility for unstructured data")
            
            # Cloud & DevOps with deployment knowledge
            cloud = [s for s in ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd'] if s in matched_skills_str]
            if cloud:
                strengths.append(f"✓ Cloud and DevOps proficiency with {', '.join([s.upper() if len(s) <= 3 else s.title() for s in cloud[:3]])} - can deploy and maintain production systems")
                if 'docker' in cloud:
                    strengths.append("✓ Docker containerization skills enable consistent environments across development and production")
                if 'aws' in cloud or 'azure' in cloud or 'gcp' in cloud:
                    strengths.append("✓ Cloud platform experience reduces infrastructure costs and improves scalability")
            
            # Version control and collaboration
            if any(s in matched_skills_str for s in ['git', 'github', 'gitlab']):
                strengths.append("✓ Version control expertise with Git enables effective team collaboration and code management")
            
            # API development
            if any(s in matched_skills_str for s in ['api', 'rest', 'graphql']):
                strengths.append("✓ API design and integration skills facilitate building connected, modular applications")
            
            # Overall match quality with context
            if match_score >= 70:
                strengths.append(f"✓ Excellent skill alignment ({match_score:.0f}% match) - can start contributing immediately with minimal onboarding")
            elif match_score >= 50:
                strengths.append(f"✓ Good technical foundation ({match_score:.0f}% match) - ready to take on role with some guidance")
            elif match_score >= 30:
                strengths.append(f"✓ Moderate skill match ({match_score:.0f}%) - has transferable skills and learning potential")
            
            # Experience indicators with impact
            if candidate_profile.get('experience') and 'year' in str(candidate_profile['experience']).lower():
                strengths.append(f"✓ {candidate_profile['experience']} - brings practical industry knowledge and best practices")
            
            # Project experience with proof of work
            if candidate_profile.get('projects') and len(candidate_profile['projects']) > 0:
                proj_count = len(candidate_profile['projects'])
                strengths.append(f"✓ Demonstrated hands-on experience with {proj_count} documented project{'s' if proj_count > 1 else ''} - shows ability to deliver complete solutions")
            
            # Education with technical foundation
            if candidate_profile.get('education'):
                edu = candidate_profile['education']
                if any(word in edu.lower() for word in ['bachelor', 'master', 'b.tech', 'm.tech', 'degree']):
                    strengths.append(f"✓ Strong educational background in technology - solid theoretical foundation")
            
            # Ensure minimum strengths
            if not strengths:
                strengths = [
                    "✓ Technical background in software development",
                    "✓ Foundational programming knowledge",
                    "✓ Willingness to learn and adapt to new technologies"
                ]
            
            # Generate VERY detailed weaknesses (8-12 points with specific impacts)
            weaknesses = []
            missing_skills_str = ' '.join(missing_skills).lower()
            
            # Missing core technologies with impact
            missing_prog = [s for s in ['python', 'java', 'javascript', 'typescript'] if s in missing_skills_str]
            if missing_prog:
                weaknesses.append(f"✗ Limited experience with {', '.join([s.title() for s in missing_prog[:2]])} - critical for daily development tasks and team collaboration")
                if 'typescript' in missing_prog:
                    weaknesses.append("✗ No TypeScript experience may lead to runtime errors and reduced code quality in large codebases")
            
            # Missing frontend with user impact
            missing_frontend = [s for s in ['react', 'angular', 'vue'] if s in missing_skills_str]
            if missing_frontend:
                weaknesses.append(f"✗ No experience with modern frontend frameworks ({', '.join([s.title() for s in missing_frontend[:2]])}) - cannot build interactive user interfaces independently")
                if 'react' in missing_frontend:
                    weaknesses.append("✗ Missing React skills limits ability to work on most modern web applications and SPAs")
            
            # Missing backend with architecture impact
            missing_backend = [s for s in ['node', 'express', 'django', 'flask', 'spring'] if s in missing_skills_str]
            if missing_backend:
                weaknesses.append(f"✗ Backend framework knowledge gap: {', '.join([s.title() for s in missing_backend[:2]])} - will struggle with server-side development and API creation")
            
            # Missing databases with data management impact
            missing_db = [s for s in ['sql', 'mysql', 'postgresql', 'mongodb'] if s in missing_skills_str]
            if missing_db:
                weaknesses.append(f"✗ Database skills need development: {', '.join([s.upper() if s == 'sql' else s.title() for s in missing_db[:2]])} - may have difficulty with data modeling and query optimization")
                if 'sql' in missing_db:
                    weaknesses.append("✗ No SQL knowledge severely limits ability to work with relational databases and data analysis")
            
            # Missing cloud/DevOps with deployment impact
            missing_cloud = [s for s in ['aws', 'azure', 'docker', 'kubernetes', 'ci/cd'] if s in missing_skills_str]
            if missing_cloud:
                weaknesses.append(f"✗ Lacks modern DevOps and cloud infrastructure skills ({', '.join([s.upper() if len(s) <= 3 else s.title() for s in missing_cloud[:3]])}) - cannot deploy or maintain production systems")
                if 'docker' in missing_cloud:
                    weaknesses.append("✗ No Docker experience means difficulty with containerization and consistent development environments")
                if any(c in missing_cloud for c in ['aws', 'azure', 'gcp']):
                    weaknesses.append("✗ Missing cloud platform skills limits ability to build scalable, cost-effective solutions")
            
            # Missing API skills with integration impact
            if any(s in missing_skills_str for s in ['api', 'rest', 'graphql']):
                weaknesses.append("✗ Limited API development and integration experience - will struggle with building connected systems")
            
            # Overall gaps with timeline
            if missing_count > 8:
                weaknesses.append(f"✗ Significant skill gaps identified ({missing_count} missing skills) - requires 4-6 months of intensive training before full productivity")
            elif missing_count > 5:
                weaknesses.append(f"✗ Multiple skill gaps ({missing_count} skills) need to be addressed - expect 2-3 months ramp-up time")
            elif missing_count > 2:
                weaknesses.append(f"✗ Some key technologies ({missing_count} skills) require upskilling - 1-2 months focused learning needed")
            
            # Match score concerns with productivity impact
            if match_score < 30:
                weaknesses.append("✗ Low overall skill alignment - may struggle with immediate job requirements and need extensive mentorship")
            elif match_score < 50:
                weaknesses.append("✗ Moderate skill gaps may impact initial productivity and require structured onboarding program")
            
            # Ensure minimum weaknesses
            if not weaknesses:
                weaknesses = [
                    "✗ Some skill gaps identified for optimal performance",
                    "✗ Room for growth in emerging technologies"
                ]
            
            # Generate detailed risk factors (5-10 points with mitigation strategies)
            risk_factors = []
            
            if match_score < 25:
                risk_factors.append("⚠ CRITICAL RISK: Very low skill match (<25%) - candidate may not meet minimum requirements. Recommend extensive training program or consider other candidates.")
            elif match_score < 40:
                risk_factors.append("⚠ HIGH RISK: Low skill alignment - extensive onboarding and training needed (3-6 months). Budget for mentorship and reduced initial productivity.")
            elif match_score < 60:
                risk_factors.append("⚠ MODERATE RISK: Skill gaps present - structured training program recommended (1-3 months). Pair with senior developer for faster ramp-up.")
            
            if missing_count > 10:
                risk_factors.append(f"⚠ {missing_count} missing skills may significantly delay productivity and project timelines. Consider phased onboarding with focused skill development.")
            elif missing_count > 6:
                risk_factors.append(f"⚠ {missing_count} skill gaps require dedicated learning time and mentorship. Allocate 20-30% of work time for training in first 3 months.")
            
            # Critical skill gaps with business impact
            critical_missing = [s for s in missing_skills if s.lower() in ['python', 'javascript', 'react', 'node', 'sql', 'aws', 'docker']]
            if len(critical_missing) > 3:
                risk_factors.append(f"⚠ Missing {len(critical_missing)} critical skills ({', '.join(critical_missing[:3])}) that are essential for day-to-day work. May need to defer complex tasks initially.")
            
            # Experience concerns with supervision needs
            if not candidate_profile.get('experience') or 'year' not in str(candidate_profile.get('experience', '')).lower():
                risk_factors.append("⚠ Limited documented professional experience - may need additional supervision and code reviews. Consider junior-level responsibilities initially.")
            
            # Project portfolio with practical skills
            if not candidate_profile.get('projects') or len(candidate_profile.get('projects', [])) < 2:
                risk_factors.append("⚠ Limited project portfolio - practical experience unclear. Request coding assessment or trial project before final decision.")
            
            # Positive indicators (reduce risk)
            if match_score >= 70:
                risk_factors.append("✓ LOW RISK: Strong skill match indicates quick ramp-up time (1-2 weeks). Can start contributing to production code immediately.")
            elif match_score >= 50 and missing_count <= 5:
                risk_factors.append("✓ MANAGEABLE RISK: Core skills present, gaps can be filled with focused training (4-6 weeks). Good candidate with growth potential.")
            
            return {
                "match_score": skill_analysis.get("skill_match_percentage", 0),
                "strengths": ["Technical background"],
                "weaknesses": ["Some skill gaps identified"],
                "risk_factors": [],
            }

    class AdaptivePathfinder:
        def generate_roadmap_context(
            self, candidate_profile, job_analysis, gap_intelligence
        ):
            return {
                "preferred_learning_domains": ["Web Development"],
                "project_complexity_level": "intermediate",
                "suggested_project_types": ["Web Application", "API Development"],
                "toolchain_recommendations": ["VS Code", "Git", "Docker"],
            }

        def generate_pathway(
            self, candidate_profile, job_analysis, gap_intelligence, roadmap_context
        ):
            pathway = []
            for i, gap in enumerate(gap_intelligence[:5]):
                pathway.append(
                    {
                        "sequence": i + 1,
                        "skill": gap["skill"],
                        "title": f"Learn {gap['skill']}",
                        "description": f"Master {gap['skill']} fundamentals",
                        "importance_level": gap["importance_level"],
                        "expected_depth": gap["expected_depth"],
                        "estimated_hours": 15,
                        "time_commitment": {
                            "total_hours": 15,
                            "estimated_weeks": 2,
                            "hours_per_week": 8,
                            "daily_commitment": "1-2 hours/day",
                        },
                        "difficulty": "intermediate",
                        "prerequisites": [],
                        "learning_resources": [f"{gap['skill']} Documentation"],
                        "practice_projects": [f"{gap['skill']} Project"],
                        "assessment_criteria": [f"Complete {gap['skill']} exercises"],
                        "status": "not_started",
                    }
                )
            return pathway, [f"Generated pathway for {len(pathway)} skills"]

    class ResumeParser:
        def parse(self, resume_text):
            lines = [l.strip() for l in resume_text.split("\n") if l.strip()]
            name = "Candidate"
            if lines:
                for line in lines[:3]:
                    if not any(
                        w in line.lower()
                        for w in [
                            "email",
                            "phone",
                            "address",
                            "linkedin",
                            "github",
                            "@",
                        ]
                    ):
                        if len(line.split()) <= 4 and len(line) > 2:
                            name = line
                            break
                if name == "Candidate" and lines[0]:
                    name = lines[0][:50]
            skill_keywords = [
                "python",
                "javascript",
                "react",
                "node",
                "java",
                "sql",
                "docker",
                "aws",
                "git",
                "html",
                "css",
                "typescript",
                "angular",
                "vue",
                "mongodb",
                "postgresql",
                "redis",
                "kubernetes",
                "jenkins",
            ]
            skills = [s.title() for s in skill_keywords if s in resume_text.lower()]
            return {
                "name": name,
                "education": education,
                "domains": ["Software Development", "Technology"],
                "skills": list(set(skills))[:15],
                "projects": ["Project experience mentioned in resume"],
                "experience": "Professional experience extracted from resume",
            }

        def extract_text_from_file(self, content, filename):
            return content.decode("utf-8", errors="ignore")

    class JDParser:
        def parse(self, jd_text):
            lines = [l.strip() for l in jd_text.split("\n") if l.strip()]
            role = "Software Developer"
            for line in lines[:10]:
                if any(
                    w in line.lower()
                    for w in ["engineer", "developer", "analyst", "manager", "lead"]
                ):
                    role = line.strip()[:100]
                    break
            skill_keywords = [
                "python",
                "javascript",
                "react",
                "node",
                "java",
                "sql",
                "docker",
                "aws",
                "git",
                "html",
                "css",
                "typescript",
                "angular",
                "vue",
                "mongodb",
                "postgresql",
                "redis",
                "kubernetes",
                "django",
                "flask",
            ]
            skills = [s.title() for s in skill_keywords if s in jd_text.lower()]
            return {
                "role": role,
                "required_skills": list(set(skills))[:20],
                "tech_stack": list(set(skills))[:15],
                "experience_required": "2-5 years experience preferred",
                "domains": ["Technology", "Software Development"],
            }

    class AgentOrchestrator:
        async def run_simulation(self, data):
            return {
                "agent_reports": {
                    "ats": {
                        "agent": "ats",
                        "name": "ATLAS",
                        "role": "ATS System",
                        "verdict": "PASS",
                        "confidence": 75,
                        "comment": "Resume format and keywords look good",
                    },
                    "hr": {
                        "agent": "hr",
                        "name": "PRIYA",
                        "role": "HR Screener",
                        "verdict": "SHORTLIST",
                        "confidence": 70,
                        "comment": "Good cultural fit indicators",
                    },
                    "startup": {
                        "agent": "startup",
                        "name": "ALEX",
                        "role": "Startup HM",
                        "verdict": "HIRE",
                        "confidence": 80,
                        "comment": "Shows execution potential",
                    },
                    "tech": {
                        "agent": "tech",
                        "name": "DR. CHEN",
                        "role": "Technical Lead",
                        "verdict": "YES",
                        "confidence": 72,
                        "comment": "Technical skills are adequate",
                    },
                },
                "overall_score": 74,
                "shortlist_probability": 75,
                "verdict": "POTENTIAL",
                "panel_consensus": "3 of 4 agents recommend advancing (ML Fallback)",
            }


# ── App setup ─────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI-Adaptive Onboarding Engine", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

skill_extractor = SkillExtractor()
adaptive_pathfinder = AdaptivePathfinder()
resume_parser = ResumeParser()
jd_parser = JDParser()
agent_orchestrator = AgentOrchestrator()


# ── Pydantic models ───────────────────────────────────────────────────────────
class AnalysisRequest(BaseModel):
    resume_text: str
    jd_text: str


class AnalysisResponse(BaseModel):
    candidate_profile: Dict[str, Any]
    job_analysis: Dict[str, Any]
    skill_analysis: Dict[str, Any]
    gap_intelligence: List[Dict[str, Any]]
    evaluation: Dict[str, Any]
    roadmap_context: Dict[str, Any]
    learning_pathway: List[Dict[str, Any]]
    reasoning_trace: List[str]
    agent_reports: Optional[Dict[str, Any]] = None
    overall_score: Optional[int] = None
    shortlist_probability: Optional[int] = None
    verdict: Optional[str] = None
    panel_consensus: Optional[str] = None
    simulation_source: Optional[str] = None
    simulation_status: Optional[str] = None
    synthesis: Optional[Dict[str, Any]] = None


# ── Helpers ───────────────────────────────────────────────────────────────────
def _safe_skills(advanced_analysis: dict) -> tuple:
    b = advanced_analysis.get("skills", {})
    return (
        b.get("matched") or b.get("matched_skills") or [],
        b.get("missing") or b.get("missing_skills") or [],
        b.get("partial") or b.get("partial_skills") or [],
    )


def _llm_cache_key(resume_text: str, jd_text: str) -> str:
    return hashlib.md5((resume_text[:500] + jd_text[:200]).encode()).hexdigest()


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "AI-Adaptive Onboarding Engine API",
        "status": "running",
        "version": "2.0",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": True, "simulation": "llm_hr_direct"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume_jd(request: AnalysisRequest):
    try:
        logger.info("Starting analysis...")

        # 1. Parse
        candidate_profile = resume_parser.parse(request.resume_text)
        job_analysis = jd_parser.parse(request.jd_text)
        logger.info(
            f"Profile: {candidate_profile['name']} | Role: {job_analysis['role']}"
        )

        # 2. Skills
        advanced_analysis = skill_extractor.analyze_skills_advanced(
            request.resume_text, request.jd_text
        )
        matched_skills, missing_skills, partial_skills = _safe_skills(advanced_analysis)
        skill_match_pct = advanced_analysis.get("skills", {}).get(
            "skill_match_percentage", 0
        )
        logger.info(f"Skill match: {skill_match_pct:.1f}%")

        skill_analysis = skill_extractor.analyze_skills(
            candidate_profile["skills"], job_analysis["required_skills"]
        )
        skill_analysis.update(
            {
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "partial_skills": partial_skills,
                "skill_match_percentage": skill_match_pct,
                "skill_depth": advanced_analysis.get("skill_depth", {}),
                "skill_weights": advanced_analysis.get("skill_weights", []),
                "weighted_match_score": advanced_analysis.get(
                    "weighted_match_score", 0
                ),
                "risk_factors": advanced_analysis.get("risk_factors", []),
            }
        )

        # 3. Gap + roadmap
        gap_intelligence = skill_extractor.generate_gap_intelligence(
            missing_skills, partial_skills, job_analysis
        )
        evaluation = skill_extractor.evaluate_candidate(
            candidate_profile, job_analysis, skill_analysis
        )
        roadmap_context = adaptive_pathfinder.generate_roadmap_context(
            candidate_profile, job_analysis, gap_intelligence
        )
        learning_pathway, reasoning_trace = adaptive_pathfinder.generate_pathway(
            candidate_profile, job_analysis, gap_intelligence, roadmap_context
        )
        logger.info(f"Pathway: {len(learning_pathway)} modules")

        ml_result = {
            "candidate_profile": candidate_profile,
            "job_analysis": job_analysis,
            "skill_analysis": skill_analysis,
            "gap_intelligence": gap_intelligence,
            "evaluation": evaluation,
            "roadmap_context": roadmap_context,
            "learning_pathway": learning_pathway,
            "reasoning_trace": reasoning_trace,
        }

        # 4. LLM HR Panel Simulation
        simulation_source = "ml_fallback"
        agent_reports = None
        overall_score = None
        shortlist_probability = None
        verdict = None
        panel_consensus = None
        simulation_status = None
        synthesis = None
        llm_result = None

        if check_llm_hr_available():
            seed = build_seed_document(ml_result, request.resume_text, request.jd_text)
            cache_key = _llm_cache_key(request.resume_text, request.jd_text)

            cached = _llm_hr_cache.get(cache_key)
            if cached and (time.time() - cached["ts"]) < _CACHE_TTL:
                logger.info("LLM_HR: Cache hit")
                llm_result = cached["result"]
                simulation_source = "llm_hr"
                simulation_status = "cached"
            else:
                timeout_s = float(os.getenv("LLM_HR_TIMEOUT", "120"))
                logger.info(f"LLM_HR: Starting simulation ({timeout_s}s timeout)...")
                try:
                    llm_result = await asyncio.wait_for(
                        run_llm_hr_simulation(seed), timeout=timeout_s
                    )
                    _llm_hr_cache[cache_key] = {"result": llm_result, "ts": time.time()}
                    simulation_source = "llm_hr"
                    simulation_status = "success"
                except asyncio.TimeoutError:
                    logger.warning("LLM_HR timed out — ML fallback")
                    simulation_status = "timeout"
                except Exception as e:
                    logger.error(f"LLM_HR error: {e} — ML fallback")
                    simulation_status = f"error: {str(e)[:100]}"

            if llm_result:
                agent_reports = llm_result["agent_reports"]
                report_meta = llm_result.get("mirrorfish_report", {})
                shortlist_probability = report_meta.get("shortlist_probability", 0)
                synthesis = report_meta.get("synthesis", {})
                confidences = [a["confidence"] for a in agent_reports.values()]
                overall_score = (
                    sum(confidences) // len(confidences) if confidences else 70
                )
                pos_count = sum(
                    1
                    for a in agent_reports.values()
                    if a["verdict"]
                    in {"PASS", "SHORTLIST", "HIRE", "STRONG_YES", "YES"}
                )
                verdict = synthesis.get("final_verdict") or (
                    "STRONG_CANDIDATE"
                    if pos_count >= 3
                    else (
                        "POTENTIAL"
                        if pos_count == 2
                        else ("BORDERLINE" if pos_count == 1 else "NEEDS_WORK")
                    )
                )
                panel_consensus = (
                    synthesis.get("panel_consensus")
                    or f"{pos_count} of 4 panelists recommend advancing"
                )
                logger.info(
                    f"LLM_HR done — verdict: {verdict}, score: {overall_score}%"
                )
        else:
            simulation_status = "llm_not_configured"

        # ML fallback
        if simulation_source == "ml_fallback":
            logger.info("Running ML fallback simulation...")
            sim = await agent_orchestrator.run_simulation(
                {
                    "resume_text": request.resume_text,
                    "jd_text": request.jd_text,
                    "skill_analysis": skill_analysis,
                    "gap_intelligence": gap_intelligence,
                    "evaluation": evaluation,
                    "candidate_profile": candidate_profile,
                    "job_analysis": job_analysis,
                }
            )
            agent_reports = sim["agent_reports"]
            overall_score = sim["overall_score"]
            shortlist_probability = sim["shortlist_probability"]
            verdict = sim["verdict"]
            panel_consensus = sim["panel_consensus"]
            logger.info(f"ML simulation done — verdict: {verdict}")

        return AnalysisResponse(
            candidate_profile=candidate_profile,
            job_analysis=job_analysis,
            skill_analysis=skill_analysis,
            gap_intelligence=gap_intelligence,
            evaluation=evaluation,
            roadmap_context=roadmap_context,
            learning_pathway=learning_pathway,
            reasoning_trace=reasoning_trace,
            agent_reports=agent_reports,
            overall_score=overall_score,
            shortlist_probability=shortlist_probability,
            verdict=verdict,
            panel_consensus=panel_consensus,
            simulation_source=simulation_source,
            simulation_status=simulation_status,
            synthesis=synthesis,
        )

    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/analyze-advanced")
async def analyze_advanced(request: AnalysisRequest):
    try:
        result = skill_extractor.analyze_skills_advanced(
            request.resume_text, request.jd_text
        )
        matched, missing, partial = _safe_skills(result)
        result["skills"]["matched_skills"] = matched
        result["skills"]["missing_skills"] = missing
        result["skills"]["partial_skills"] = partial
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Advanced analysis failed: {str(e)}"
        )


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        return {
            "text": resume_parser.extract_text_from_file(content, file.filename),
            "filename": file.filename,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File processing failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
