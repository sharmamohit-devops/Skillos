"""
ALEX - Startup Hiring Manager Agent
Founder/CTO of a fast-moving startup
Focuses on execution, shipping, breadth, initiative
"""

from .base_agent import BaseAgent
from typing import Dict, Any, List
import re


class StartupAgent(BaseAgent):
    """
    ALEX - The Startup HM
    Persona: Fast-moving founder, values execution over credentials
    Evaluates: Shipped projects, breadth, startup tools, initiative
    """
    
    def __init__(self):
        super().__init__(
            name="ALEX",
            role="Startup Hiring Manager",
            persona="CTO of 30-person startup. Values shipping over talking.",
            color="amber"
        )
        
        # Startup-relevant tools
        self.startup_tools = [
            'docker', 'kubernetes', 'aws', 'gcp', 'azure',
            'ci/cd', 'jenkins', 'github actions', 'gitlab ci',
            'api', 'rest', 'graphql', 'microservices',
            'mongodb', 'postgresql', 'redis',
            'react', 'vue', 'angular', 'node.js'
        ]
        
        # Execution indicators
        self.execution_verbs = [
            'shipped', 'deployed', 'launched', 'built', 'created',
            'released', 'delivered', 'published', 'live'
        ]
    
    def evaluate(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Startup evaluation based on execution and breadth"""
        resume_text = analysis_data.get('resume_text', '')
        skill_analysis = analysis_data.get('skill_analysis', {})
        candidate_profile = analysis_data.get('candidate_profile', {})
        
        # Calculate scores
        execution_score = self._calculate_execution(resume_text, candidate_profile)
        breadth_score = self._calculate_breadth(skill_analysis)
        startup_fit_score = self._calculate_startup_fit(resume_text, skill_analysis)
        
        # Identify excitement and concerns
        excited_about = self._identify_excitement(resume_text, skill_analysis)
        concerns = self._identify_concerns(resume_text, skill_analysis)
        
        # Determine verdict
        verdict = self._determine_verdict(
            execution_score, breadth_score, startup_fit_score, concerns
        )
        
        # Calculate confidence
        confidence = self._calculate_confidence({
            'execution': execution_score,
            'breadth': breadth_score,
            'startup_fit': startup_fit_score
        })
        
        return {
            "agent": "startup",
            "name": self.name,
            "role": self.role,
            "verdict": verdict,
            "confidence": confidence,
            "execution_score": execution_score,
            "breadth_score": breadth_score,
            "startup_fit_score": startup_fit_score,
            "excited_about": excited_about,
            "concerns": concerns,
            "comment": self._generate_comment(verdict, excited_about, concerns)
        }
    
    def _calculate_execution(self, resume_text: str, profile: Dict[str, Any]) -> int:
        """Calculate execution/shipping score"""
        score = 40  # Base score
        text_lower = resume_text.lower()
        
        # Check for execution verbs
        execution_count = sum(text_lower.count(verb) for verb in self.execution_verbs)
        score += min(30, execution_count * 5)
        
        # Check for live URLs/links
        url_pattern = r'https?://|www\.|\.com|\.io|\.dev'
        if re.search(url_pattern, resume_text):
            score += 15
        
        # Check for user/impact numbers
        impact_patterns = [
            r'\d+[kKmM]?\s*(users|customers|downloads)',
            r'\d+%\s*(increase|improvement|growth)',
            r'\$\d+[kKmM]?\s*(revenue|savings)'
        ]
        for pattern in impact_patterns:
            if re.search(pattern, resume_text):
                score += 5
        
        # Check projects
        projects = profile.get('projects', [])
        if len(projects) > 2:
            score += 10
        
        return min(100, score)
    
    def _calculate_breadth(self, skill_analysis: Dict[str, Any]) -> int:
        """Calculate skill breadth (full-stack ability)"""
        matched_skills = skill_analysis.get('matched_skills', [])
        
        # Check for full-stack indicators
        has_frontend = any(skill in str(matched_skills).lower() 
                          for skill in ['react', 'vue', 'angular', 'javascript', 'html', 'css'])
        has_backend = any(skill in str(matched_skills).lower() 
                         for skill in ['python', 'java', 'node', 'api', 'django', 'flask'])
        has_database = any(skill in str(matched_skills).lower() 
                          for skill in ['sql', 'mongodb', 'postgresql', 'mysql', 'database'])
        has_devops = any(skill in str(matched_skills).lower() 
                        for skill in ['docker', 'kubernetes', 'aws', 'ci/cd', 'jenkins'])
        
        score = 40  # Base
        if has_frontend:
            score += 15
        if has_backend:
            score += 15
        if has_database:
            score += 15
        if has_devops:
            score += 15
        
        return min(100, score)
    
    def _calculate_startup_fit(self, resume_text: str, skill_analysis: Dict[str, Any]) -> int:
        """Calculate startup culture fit"""
        score = 50  # Base score
        text_lower = resume_text.lower()
        
        # Check for startup tools
        matched_skills = skill_analysis.get('matched_skills', [])
        startup_tool_count = sum(1 for tool in self.startup_tools 
                                if tool in str(matched_skills).lower())
        score += min(25, startup_tool_count * 5)
        
        # Check for initiative signals
        initiative_words = ['founded', 'started', 'initiated', 'pioneered', 'side project']
        if any(word in text_lower for word in initiative_words):
            score += 15
        
        # Check for fast learning
        learning_words = ['learned', 'self-taught', 'picked up', 'quickly']
        if any(word in text_lower for word in learning_words):
            score += 10
        
        return min(100, score)
    
    def _identify_excitement(self, resume_text: str, skill_analysis: Dict[str, Any]) -> List[str]:
        """Identify what excites the startup founder"""
        excited = []
        text_lower = resume_text.lower()
        
        # Personal projects
        if 'personal project' in text_lower or 'side project' in text_lower:
            excited.append("Personal projects show initiative and passion")
        
        # Full-stack exposure
        matched_skills = skill_analysis.get('matched_skills', [])
        if len(matched_skills) > 8:
            excited.append(f"Broad skill set - {len(matched_skills)} relevant technologies")
        
        # Modern stack
        modern_tech = ['react', 'vue', 'docker', 'kubernetes', 'aws', 'typescript']
        modern_count = sum(1 for tech in modern_tech if tech in str(matched_skills).lower())
        if modern_count >= 3:
            excited.append("Modern tech stack experience")
        
        # Execution evidence
        if any(verb in text_lower for verb in ['shipped', 'deployed', 'launched']):
            excited.append("Clear evidence of shipping products")
        
        # Fast learner
        if 'learned' in text_lower or 'self-taught' in text_lower:
            excited.append("Self-directed learning ability")
        
        return excited[:3]
    
    def _identify_concerns(self, resume_text: str, skill_analysis: Dict[str, Any]) -> List[str]:
        """Identify startup-specific concerns"""
        concerns = []
        text_lower = resume_text.lower()
        
        # No deployed projects
        if not any(verb in text_lower for verb in ['deployed', 'shipped', 'launched', 'live']):
            concerns.append("No deployed production projects mentioned")
        
        # Missing DevOps skills
        devops_skills = ['docker', 'kubernetes', 'aws', 'ci/cd']
        missing_devops = [skill for skill in devops_skills 
                         if skill not in str(skill_analysis.get('matched_skills', [])).lower()]
        if len(missing_devops) >= 3:
            concerns.append("Missing key DevOps skills for startup environment")
        
        # No live URLs
        if not re.search(r'https?://|www\.|\.com|\.io', resume_text):
            concerns.append("No live project URLs - want to see actual work")
        
        # Large company only
        if any(word in text_lower for word in ['enterprise', 'fortune 500', 'corporate']):
            if 'startup' not in text_lower:
                concerns.append("Only large company experience - startup pace may be challenging")
        
        # Narrow skill set
        matched_skills = skill_analysis.get('matched_skills', [])
        if len(matched_skills) < 5:
            concerns.append("Limited skill breadth - startups need generalists")
        
        return concerns[:3]
    
    def _determine_verdict(self, execution: int, breadth: int, 
                          startup_fit: int, concerns: List[str]) -> str:
        """Determine startup verdict"""
        avg_score = (execution + breadth + startup_fit) / 3
        
        # Concerns can be deal-breakers
        if len(concerns) >= 3:
            return "PASS"
        
        if avg_score >= 75 and execution >= 70:
            return "HIRE"
        elif avg_score >= 60:
            return "MAYBE"
        else:
            return "PASS"
    
    def _generate_comment(self, verdict: str, excited: List[str], 
                         concerns: List[str]) -> str:
        """Generate casual startup founder comment"""
        if verdict == "HIRE":
            comment = "This person can ship. "
            if excited:
                comment += f"{excited[0]}. "
            comment += "Let's bring them in for a technical chat."
        
        elif verdict == "MAYBE":
            comment = "Decent potential but need to see more. "
            if concerns:
                comment += f"{concerns[0]}. "
            if excited:
                comment += f"On the plus side: {excited[0].lower()}. "
            comment += "Worth a conversation to assess execution speed."
        
        else:
            comment = "Not quite there yet for our pace. "
            if concerns:
                comment += f"{concerns[0]}. "
            comment += "We need someone who's already shipping at startup velocity."
        
        return comment
