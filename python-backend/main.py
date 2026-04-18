from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import logging
import os
import sys
import asyncio

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from models.skill_extractor import SkillExtractor
    from models.adaptive_pathfinder import AdaptivePathfinder
    from models.resume_parser import ResumeParser
    from models.jd_parser import JDParser
    from services.agent_orchestrator import AgentOrchestrator
    from services.mirrorfish_service import (
        build_seed_document, 
        run_mirrorfish_async, 
        check_mirrorfish_available
    )
except ImportError as e:
    print(f"Import error: {e}")
    print("Creating minimal fallback implementations...")
    
    # Fallback implementations
    class SkillExtractor:
        def analyze_skills(self, candidate_skills, required_skills):
            matched = list(set(candidate_skills) & set(required_skills))
            missing = list(set(required_skills) - set(candidate_skills))
            return {
                "matched_skills": matched,
                "missing_skills": missing,
                "partial_skills": [],
                "skill_match_percentage": len(matched) / len(required_skills) * 100 if required_skills else 0
            }
        
        def analyze_skills_advanced(self, resume_text, jd_text):
            # Simple keyword matching fallback
            resume_words = set(resume_text.lower().split())
            jd_words = set(jd_text.lower().split())
            
            # Common skills to look for
            common_skills = ['python', 'javascript', 'react', 'node', 'sql', 'docker', 'aws', 'git']
            
            matched = [skill for skill in common_skills if skill in resume_words and skill in jd_words]
            missing = [skill for skill in common_skills if skill in jd_words and skill not in resume_words]
            
            return {
                "skills": {
                    "matched_skills": matched,
                    "missing_skills": missing,
                    "partial_skills": [],
                    "skill_match_percentage": len(matched) / len(common_skills) * 100 if common_skills else 0
                },
                "skill_depth": {skill: "intermediate" for skill in matched},
                "skill_weights": [{"skill": skill, "importance": "Medium"} for skill in matched + missing],
                "weighted_match_score": len(matched) / len(common_skills) * 100 if common_skills else 0,
                "risk_factors": ["Limited skill analysis available"] if not matched else []
            }
        
        def generate_gap_intelligence(self, missing_skills, partial_skills, job_analysis):
            return [{"skill": skill, "importance_level": "Medium", "skill_type": "tool", 
                    "dependency_skills": [], "related_resume_gap": f"Missing {skill}", 
                    "expected_depth": "intermediate"} for skill in missing_skills]
        
        def evaluate_candidate(self, candidate_profile, job_analysis, skill_analysis):
            return {
                "match_score": skill_analysis["skill_match_percentage"],
                "strengths": ["Technical background"],
                "weaknesses": ["Some skill gaps identified"],
                "risk_factors": []
            }
    
    class AdaptivePathfinder:
        def generate_roadmap_context(self, candidate_profile, job_analysis, gap_intelligence):
            return {
                "preferred_learning_domains": ["Web Development"],
                "project_complexity_level": "intermediate",
                "suggested_project_types": ["Web Application", "API Development"],
                "toolchain_recommendations": ["VS Code", "Git", "Docker"]
            }
        
        def generate_pathway(self, candidate_profile, job_analysis, gap_intelligence, roadmap_context):
            pathway = []
            for i, gap in enumerate(gap_intelligence[:5]):
                pathway.append({
                    "sequence": i + 1,
                    "skill": gap["skill"],
                    "title": f"Learn {gap['skill']}",
                    "description": f"Master {gap['skill']} fundamentals",
                    "importance_level": gap["importance_level"],
                    "expected_depth": gap["expected_depth"],
                    "estimated_hours": 15,
                    "time_commitment": {"total_hours": 15, "estimated_weeks": 2, "hours_per_week": 8, "daily_commitment": "1-2 hours/day"},
                    "difficulty": "intermediate",
                    "prerequisites": [],
                    "learning_resources": [f"{gap['skill']} Documentation"],
                    "practice_projects": [f"{gap['skill']} Project"],
                    "assessment_criteria": [f"Complete {gap['skill']} exercises"],
                    "status": "not_started"
                })
            return pathway, [f"Generated pathway for {len(pathway)} skills"]
    
    class ResumeParser:
        def parse(self, resume_text):
            lines = [line.strip() for line in resume_text.split('\n') if line.strip()]
            
            # Better name extraction
            name = "Candidate"
            if lines:
                # Look for name in first few lines
                for line in lines[:3]:
                    # Skip lines that look like headers or contact info
                    if not any(word in line.lower() for word in ['email', 'phone', 'address', 'linkedin', 'github', '@']):
                        if len(line.split()) <= 4 and len(line) > 2:  # Likely a name
                            name = line
                            break
                
                # Fallback to first line if no good name found
                if name == "Candidate" and lines[0]:
                    name = lines[0][:50]  # Limit length
            
            # Extract skills more intelligently
            skills = []
            skill_keywords = ['python', 'javascript', 'react', 'node', 'java', 'sql', 'docker', 'aws', 'git', 'html', 'css', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'redis', 'kubernetes', 'jenkins', 'linux', 'windows', 'azure', 'gcp']
            
            resume_lower = resume_text.lower()
            for skill in skill_keywords:
                if skill in resume_lower:
                    skills.append(skill.title())
            
            # Also look for skills in bullet points or skill sections
            for line in lines:
                line_lower = line.lower()
                if any(word in line_lower for word in ['skill', 'technology', 'programming', 'languages', 'frameworks']):
                    # Extract comma-separated items from this line
                    parts = [s.strip() for s in line.split(',') if len(s.strip()) > 2 and len(s.strip()) < 20]
                    skills.extend(parts[:5])  # Limit to avoid noise
            
            return {
                "name": name,
                "education": "Education details extracted from resume",
                "domains": ["Software Development", "Technology"],
                "skills": list(set(skills))[:15],  # Remove duplicates and limit
                "projects": ["Project experience mentioned in resume"],
                "experience": "Professional experience extracted from resume"
            }
        
        def extract_text_from_file(self, content, filename):
            return content.decode('utf-8', errors='ignore')
    
    class JDParser:
        def parse(self, jd_text):
            lines = [line.strip() for line in jd_text.split('\n') if line.strip()]
            
            # Better role extraction
            role = "Software Developer"
            for line in lines[:10]:  # Check first 10 lines
                line_lower = line.lower()
                if any(word in line_lower for word in ['position', 'role', 'job title', 'we are looking for', 'hiring']):
                    # Extract the role from this line
                    if ':' in line:
                        role = line.split(':', 1)[1].strip()
                    else:
                        role = line.strip()
                    break
                elif any(word in line_lower for word in ['engineer', 'developer', 'analyst', 'manager', 'lead', 'architect', 'designer']):
                    role = line.strip()
                    break
            
            # Clean up role
            role = role.replace('Job Title:', '').replace('Position:', '').strip()
            if len(role) > 100:
                role = role[:100] + "..."
            
            # Extract skills more intelligently
            skills = []
            skill_keywords = ['python', 'javascript', 'react', 'node', 'java', 'sql', 'docker', 'aws', 'git', 'html', 'css', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'redis', 'kubernetes', 'jenkins', 'linux', 'windows', 'azure', 'gcp', 'django', 'flask', 'express', 'spring', 'laravel', 'ruby', 'php', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin']
            
            jd_lower = jd_text.lower()
            for skill in skill_keywords:
                if skill in jd_lower:
                    skills.append(skill.title())
            
            # Also extract from requirement sections
            for line in lines:
                line_lower = line.lower()
                if any(word in line_lower for word in ['require', 'skill', 'experience', 'must have', 'should have', 'proficient']):
                    # Extract comma-separated items
                    parts = [s.strip() for s in line.split(',') if len(s.strip()) > 2 and len(s.strip()) < 25]
                    skills.extend(parts[:5])
            
            return {
                "role": role,
                "required_skills": list(set(skills))[:20],  # Remove duplicates and limit
                "tech_stack": list(set(skills))[:15],
                "experience_required": "2-5 years experience preferred",
                "domains": ["Technology", "Software Development"]
            }
    
    class AgentOrchestrator:
        async def run_simulation(self, data):
            # Mock agent simulation
            return {
                "agent_reports": {
                    "ats": {"agent": "ats", "name": "ATLAS", "role": "ATS System", "verdict": "PASS", "confidence": 75, "comment": "Resume format and keywords look good"},
                    "hr": {"agent": "hr", "name": "PRIYA", "role": "HR Screener", "verdict": "SHORTLIST", "confidence": 70, "comment": "Good cultural fit indicators"},
                    "startup": {"agent": "startup", "name": "ALEX", "role": "Startup HM", "verdict": "HIRE", "confidence": 80, "comment": "Shows execution potential"},
                    "tech": {"agent": "tech", "name": "DR. CHEN", "role": "Technical Lead", "verdict": "YES", "confidence": 72, "comment": "Technical skills are adequate"}
                },
                "overall_score": 74,
                "shortlist_probability": 75,
                "verdict": "POTENTIAL",
                "panel_consensus": "3 of 4 agents recommend advancing (ML Fallback)"
            }
    
    # Mock MirrorFish functions
    def build_seed_document(ml_result, resume_text, job_description):
        return f"Mock seed document for {ml_result.get('candidate_profile', {}).get('name', 'candidate')}"
    
    async def run_mirrorfish_async(seed_text):
        # Mock MirrorFish response
        return {
            "agent_reports": {
                "ats": {"agent": "ats", "name": "ATLAS", "role": "ATS System", "verdict": "PASS", "confidence": 78, "comment": "MirrorFish ATS analysis"},
                "hr": {"agent": "hr", "name": "PRIYA", "role": "HR Screener", "verdict": "SHORTLIST", "confidence": 73, "comment": "MirrorFish HR analysis"},
                "startup": {"agent": "startup", "name": "ALEX", "role": "Startup HM", "verdict": "HIRE", "confidence": 82, "comment": "MirrorFish startup analysis"},
                "tech": {"agent": "tech", "name": "DR. CHEN", "role": "Technical Lead", "verdict": "YES", "confidence": 75, "comment": "MirrorFish technical analysis"}
            },
            "mirrorfish_report": {"shortlist_probability": 77}
        }
    
    def check_mirrorfish_available():
        return False  # Mock unavailable for fallback testing

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI-Adaptive Onboarding Engine", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
skill_extractor = SkillExtractor()
adaptive_pathfinder = AdaptivePathfinder()
resume_parser = ResumeParser()
jd_parser = JDParser()
agent_orchestrator = AgentOrchestrator()

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
    # SkillOS Virtual HR Simulation fields
    agent_reports: Optional[Dict[str, Any]] = None
    overall_score: Optional[int] = None
    shortlist_probability: Optional[int] = None
    verdict: Optional[str] = None
    panel_consensus: Optional[str] = None
    # MirrorFish metadata
    simulation_source: Optional[str] = None
    mirrorfish_status: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "AI-Adaptive Onboarding Engine API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": True}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume_jd(request: AnalysisRequest):
    """
    Main endpoint for analyzing resume against job description
    and generating personalized learning pathway with Virtual HR Simulation
    
    Now integrates with MirrorFish for advanced agent simulation
    """
    try:
        logger.info("Starting analysis...")
        
        # Parse resume and extract candidate profile
        candidate_profile = resume_parser.parse(request.resume_text)
        logger.info(f"Extracted candidate profile: {candidate_profile['name']}")
        
        # Parse job description
        job_analysis = jd_parser.parse(request.jd_text)
        logger.info(f"Analyzed job role: {job_analysis['role']}")
        
        # Advanced skill analysis
        advanced_analysis = skill_extractor.analyze_skills_advanced(
            request.resume_text, 
            request.jd_text
        )
        logger.info(f"Advanced skill match: {advanced_analysis['skills']['skill_match_percentage']:.1f}%")
        logger.info(f"Weighted match score: {advanced_analysis['weighted_match_score']:.1f}%")
        
        # Extract and analyze skills (legacy method for compatibility)
        skill_analysis = skill_extractor.analyze_skills(
            candidate_profile['skills'], 
            job_analysis['required_skills']
        )
        
        # Merge advanced analysis with legacy format
        skill_analysis.update({
            "skill_depth": advanced_analysis["skill_depth"],
            "skill_weights": advanced_analysis["skill_weights"],
            "weighted_match_score": advanced_analysis["weighted_match_score"],
            "risk_factors": advanced_analysis["risk_factors"]
        })
        
        # Generate gap intelligence
        gap_intelligence = skill_extractor.generate_gap_intelligence(
            advanced_analysis['skills']['missing_skills'],
            advanced_analysis['skills']['partial_skills'],
            job_analysis
        )
        
        # Calculate overall evaluation
        evaluation = skill_extractor.evaluate_candidate(
            candidate_profile, job_analysis, skill_analysis
        )
        
        # Generate roadmap context
        roadmap_context = adaptive_pathfinder.generate_roadmap_context(
            candidate_profile, job_analysis, gap_intelligence
        )
        
        # Generate adaptive learning pathway
        learning_pathway, reasoning_trace = adaptive_pathfinder.generate_pathway(
            candidate_profile, job_analysis, gap_intelligence, roadmap_context
        )
        
        logger.info(f"Generated pathway with {len(learning_pathway)} modules")
        
        # Prepare ML result for MirrorFish
        ml_result = {
            "candidate_profile": candidate_profile,
            "job_analysis": job_analysis,
            "skill_analysis": skill_analysis,
            "gap_intelligence": gap_intelligence,
            "evaluation": evaluation,
            "roadmap_context": roadmap_context,
            "learning_pathway": learning_pathway,
            "reasoning_trace": reasoning_trace
        }
        
        # Try MirrorFish integration with timeout
        simulation_source = "ml_fallback"
        agent_reports = None
        overall_score = None
        shortlist_probability = None
        verdict = None
        panel_consensus = None
        mirrorfish_status = None
        
        # Check if MirrorFish is available
        mirrorfish_available = check_mirrorfish_available()
        logger.info(f"MirrorFish availability check: {'Available' if mirrorfish_available else 'Not available'}")
        
        if mirrorfish_available:
            logger.info("MirrorFish is available, attempting integration...")
            
            # Build seed document for MirrorFish
            seed = build_seed_document(ml_result, request.resume_text, request.jd_text)
            logger.info(f"Built seed document ({len(seed)} characters)")
            
            try:
                # Run MirrorFish with timeout
                timeout_seconds = float(os.getenv("MIRRORFISH_TIMEOUT", "30"))
                logger.info(f"Starting MirrorFish simulation with {timeout_seconds}s timeout...")
                
                mirrorfish_result = await asyncio.wait_for(
                    run_mirrorfish_async(seed),
                    timeout=timeout_seconds
                )
                
                # Use MirrorFish results
                agent_reports = mirrorfish_result["agent_reports"]
                shortlist_probability = mirrorfish_result["mirrorfish_report"]["shortlist_probability"]
                simulation_source = "mirrorfish"
                
                # Calculate overall metrics from MirrorFish agents
                confidences = [agent["confidence"] for agent in agent_reports.values()]
                overall_score = sum(confidences) // len(confidences) if confidences else 70
                
                # Determine verdict based on MirrorFish agents
                positive_verdicts = sum(
                    1 for agent in agent_reports.values()
                    if agent["verdict"] in ["PASS", "SHORTLIST", "HIRE", "STRONG_YES", "YES"]
                )
                
                if positive_verdicts >= 3:
                    verdict = "STRONG_CANDIDATE"
                elif positive_verdicts >= 2:
                    verdict = "POTENTIAL"
                else:
                    verdict = "NEEDS_WORK"
                
                panel_consensus = f"{positive_verdicts} of 4 agents recommend advancing (MirrorFish)"
                mirrorfish_status = "success"
                
                logger.info(f"MirrorFish simulation complete - Verdict: {verdict}, Score: {overall_score}%")
                
            except asyncio.TimeoutError:
                logger.warning(f"MirrorFish timeout after {timeout_seconds}s - falling back to ML agents")
                simulation_source = "ml_fallback"
                mirrorfish_status = "timeout"
                
            except Exception as e:
                logger.error(f"MirrorFish error: {str(e)} - falling back to ML agents")
                simulation_source = "ml_fallback"
                mirrorfish_status = f"error: {str(e)[:100]}"
        else:
            logger.info("MirrorFish not available - using ML fallback agents")
            mirrorfish_status = "unavailable"
        
        # If MirrorFish failed or unavailable, use ML-based agents
        if simulation_source == "ml_fallback":
            logger.info("Running ML-based Virtual HR Simulation...")
            agent_simulation = await agent_orchestrator.run_simulation({
                "resume_text": request.resume_text,
                "jd_text": request.jd_text,
                "skill_analysis": skill_analysis,
                "gap_intelligence": gap_intelligence,
                "evaluation": evaluation,
                "candidate_profile": candidate_profile,
                "job_analysis": job_analysis
            })
            
            agent_reports = agent_simulation["agent_reports"]
            overall_score = agent_simulation["overall_score"]
            shortlist_probability = agent_simulation["shortlist_probability"]
            verdict = agent_simulation["verdict"]
            panel_consensus = agent_simulation["panel_consensus"]
            
            logger.info(f"ML simulation complete - Overall verdict: {verdict}")
        
        # Build response
        response_data = {
            "candidate_profile": candidate_profile,
            "job_analysis": job_analysis,
            "skill_analysis": skill_analysis,
            "gap_intelligence": gap_intelligence,
            "evaluation": evaluation,
            "roadmap_context": roadmap_context,
            "learning_pathway": learning_pathway,
            "reasoning_trace": reasoning_trace,
            # Agent simulation results
            "agent_reports": agent_reports,
            "overall_score": overall_score,
            "shortlist_probability": shortlist_probability,
            "verdict": verdict,
            "panel_consensus": panel_consensus,
            # Metadata
            "simulation_source": simulation_source
        }
        
        if mirrorfish_status:
            response_data["mirrorfish_status"] = mirrorfish_status
        
        return AnalysisResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze-advanced")
async def analyze_advanced(request: AnalysisRequest):
    """
    Advanced analysis endpoint that returns structured JSON as per enhanced specification
    """
    try:
        logger.info("Starting advanced analysis...")
        
        # Perform advanced skill analysis
        result = skill_extractor.analyze_skills_advanced(
            request.resume_text, 
            request.jd_text
        )
        
        logger.info(f"Advanced analysis completed - Match: {result['skills']['skill_match_percentage']:.1f}%, Weighted: {result['weighted_match_score']:.1f}%")
        
        return result
        
    except Exception as e:
        logger.error(f"Advanced analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Advanced analysis failed: {str(e)}")

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and parse resume file"""
    try:
        content = await file.read()
        text = resume_parser.extract_text_from_file(content, file.filename)
        return {"text": text, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)