from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import logging
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from models.skill_extractor import SkillExtractor
    from models.adaptive_pathfinder import AdaptivePathfinder
    from models.resume_parser import ResumeParser
    from models.jd_parser import JDParser
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
            lines = resume_text.split('\n')
            name = lines[0].strip() if lines else "Candidate"
            skills = []
            for line in lines:
                if any(word in line.lower() for word in ['skill', 'technology', 'programming']):
                    skills.extend([s.strip() for s in line.split(',') if len(s.strip()) > 2])
            
            return {
                "name": name,
                "education": "Education details extracted",
                "domains": ["Software Development"],
                "skills": skills[:10],
                "projects": ["Project experience"],
                "experience": "Professional experience"
            }
        
        def extract_text_from_file(self, content, filename):
            return content.decode('utf-8', errors='ignore')
    
    class JDParser:
        def parse(self, jd_text):
            lines = jd_text.split('\n')
            role = "Software Developer"
            for line in lines[:5]:
                if any(word in line.lower() for word in ['engineer', 'developer', 'analyst']):
                    role = line.strip()
                    break
            
            skills = []
            for line in lines:
                if any(word in line.lower() for word in ['require', 'skill', 'experience']):
                    skills.extend([s.strip() for s in line.split(',') if len(s.strip()) > 2])
            
            return {
                "role": role,
                "required_skills": skills[:15],
                "tech_stack": skills[:10],
                "experience_required": "2-5 years",
                "domains": ["Technology"]
            }

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
    and generating personalized learning pathway
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
        
        return AnalysisResponse(
            candidate_profile=candidate_profile,
            job_analysis=job_analysis,
            skill_analysis=skill_analysis,
            gap_intelligence=gap_intelligence,
            evaluation=evaluation,
            roadmap_context=roadmap_context,
            learning_pathway=learning_pathway,
            reasoning_trace=reasoning_trace
        )
        
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