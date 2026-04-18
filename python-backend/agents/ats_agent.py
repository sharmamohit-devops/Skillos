"""
ATLAS - ATS Bot Agent
Strict, no-nonsense automated tracking system
Focuses on keyword matching and format compliance
"""

from .base_agent import BaseAgent
from typing import Dict, Any, List
import re


class ATSAgent(BaseAgent):
    """
    ATLAS - The ATS Bot
    Persona: Cold, clinical, binary thinking
    Evaluates: Keywords, format, compliance
    """
    
    def __init__(self):
        super().__init__(
            name="ATLAS",
            role="ATS System",
            persona="Strict automated system. No empathy. Binary decisions.",
            color="blue"
        )
    
    def evaluate(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        ATS evaluation based on keyword matching and format
        """
        skill_analysis = analysis_data.get('skill_analysis', {})
        resume_text = analysis_data.get('resume_text', '')
        
        # Calculate scores
        keyword_score = self._calculate_keyword_score(skill_analysis)
        format_score = self._calculate_format_score(resume_text)
        
        # Extract missing keywords
        missing_keywords = self._get_missing_keywords(skill_analysis)
        
        # Determine verdict
        verdict = self._determine_verdict(keyword_score, format_score)
        
        # Calculate confidence
        confidence = self._calculate_confidence({
            'keyword': keyword_score,
            'format': format_score
        })
        
        # Generate reasons
        rejection_reasons = self._get_rejection_reasons(
            keyword_score, format_score, missing_keywords
        )
        pass_reasons = self._get_pass_reasons(
            keyword_score, format_score, skill_analysis
        )
        
        return {
            "agent": "ats",
            "name": self.name,
            "role": self.role,
            "verdict": verdict,
            "confidence": confidence,
            "keyword_score": keyword_score,
            "format_score": format_score,
            "missing_keywords": missing_keywords[:5],  # Top 5
            "rejection_reasons": rejection_reasons,
            "pass_reasons": pass_reasons,
            "comment": self._generate_comment(verdict, keyword_score, format_score)
        }
    
    def _calculate_keyword_score(self, skill_analysis: Dict[str, Any]) -> int:
        """Calculate keyword match percentage"""
        matched = len(skill_analysis.get('matched_skills', []))
        partial = len(skill_analysis.get('partial_skills', []))
        missing = len(skill_analysis.get('missing_skills', []))
        
        total = matched + partial + missing
        if total == 0:
            return 0
        
        # Matched = 100%, Partial = 50%, Missing = 0%
        score = ((matched * 1.0) + (partial * 0.5)) / total * 100
        
        return int(score)
    
    def _calculate_format_score(self, resume_text: str) -> int:
        """Check resume formatting compliance"""
        score = 60  # Base score
        
        # Check sections
        sections = self._check_section_completeness(resume_text)
        section_score = sum(sections.values()) / len(sections) * 30
        score += section_score
        
        # Check for action verbs
        action_verbs = ['developed', 'built', 'created', 'led', 'managed', 
                       'designed', 'implemented', 'achieved', 'improved']
        if any(verb in resume_text.lower() for verb in action_verbs):
            score += 5
        
        # Check for quantified achievements
        if self._count_quantified_achievements(resume_text) > 0:
            score += 5
        
        return min(100, int(score))
    
    def _get_missing_keywords(self, skill_analysis: Dict[str, Any]) -> List[str]:
        """Get list of missing high-importance keywords"""
        missing = []
        
        # Get missing skills
        missing_skills = skill_analysis.get('missing_skills', [])
        
        # Prioritize by importance
        if 'skill_weights' in skill_analysis:
            high_importance = self._extract_skills_by_importance(skill_analysis, 'High')
            missing = [skill for skill in missing_skills if skill in high_importance]
            
            # Add medium importance if needed
            if len(missing) < 5:
                medium_importance = self._extract_skills_by_importance(skill_analysis, 'Medium')
                missing.extend([skill for skill in missing_skills if skill in medium_importance])
        else:
            missing = missing_skills
        
        return missing[:10]
    
    def _determine_verdict(self, keyword_score: int, format_score: int) -> str:
        """Determine ATS verdict"""
        avg_score = (keyword_score + format_score) / 2
        
        if avg_score >= 75 and keyword_score >= 70:
            return "PASS"
        elif avg_score >= 50:
            return "REVIEW"
        else:
            return "FAIL"
    
    def _get_rejection_reasons(self, keyword_score: int, format_score: int, 
                              missing: List[str]) -> List[str]:
        """Generate rejection reasons"""
        reasons = []
        
        if keyword_score < 50:
            reasons.append(f"KEYWORD DENSITY INSUFFICIENT: {keyword_score}% match")
        
        if keyword_score < 70:
            reasons.append(f"Missing {len(missing)} high-importance keywords")
        
        if format_score < 70:
            reasons.append(f"FORMAT COMPLIANCE: {format_score}% - Below threshold")
        
        if len(missing) > 5:
            reasons.append(f"Critical skills gap: {', '.join(missing[:3])}...")
        
        if not reasons:
            reasons.append("Marginal scores - requires human review")
        
        return reasons
    
    def _get_pass_reasons(self, keyword_score: int, format_score: int, 
                         skill_analysis: Dict[str, Any]) -> List[str]:
        """Generate pass reasons"""
        reasons = []
        
        if keyword_score >= 70:
            reasons.append(f"Strong keyword match: {keyword_score}%")
        
        if format_score >= 80:
            reasons.append("Well-structured resume format")
        
        matched_count = len(skill_analysis.get('matched_skills', []))
        if matched_count > 5:
            reasons.append(f"Good skill coverage: {matched_count} matched skills")
        
        if 'skill_depth' in skill_analysis:
            advanced_skills = [s for s, d in skill_analysis['skill_depth'].items() 
                             if d == 'advanced']
            if len(advanced_skills) > 2:
                reasons.append(f"Advanced proficiency in {len(advanced_skills)} skills")
        
        return reasons
    
    def _generate_comment(self, verdict: str, keyword_score: int, 
                         format_score: int) -> str:
        """Generate ATS-style comment"""
        if verdict == "PASS":
            return f"PROCESSING COMPLETE. Keyword density: {keyword_score}%. Format compliance: {format_score}%. APPROVED for human review."
        elif verdict == "REVIEW":
            return f"MARGINAL MATCH. Keyword density: {keyword_score}%. Format compliance: {format_score}%. Manual screening recommended."
        else:
            return f"INSUFFICIENT MATCH. Keyword density: {keyword_score}%. Format compliance: {format_score}%. Does not meet minimum requirements."
