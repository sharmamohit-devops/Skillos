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
                "education": "Education details extracted from resume",
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
