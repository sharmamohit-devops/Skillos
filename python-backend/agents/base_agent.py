"""
Base Agent Class for SkillOS Virtual HR Simulation
All agents inherit from this base class
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Base class for all virtual HR agents"""

    def __init__(self, name: str, role: str, persona: str, color: str):
        self.name = name
        self.role = role
        self.persona = persona
        self.color = color
        logger.info(f"Initialized {self.name} - {self.role}")

    @abstractmethod
    def evaluate(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Each agent evaluates the candidate based on their criteria

        Args:
            analysis_data: Complete analysis from ML pipeline

        Returns:
            Agent's verdict and detailed report
        """
        pass

    def _calculate_confidence(self, scores: Dict[str, float]) -> int:
        """Calculate confidence score based on multiple metrics"""
        if not scores:
            return 50

        avg = sum(scores.values()) / len(scores)

        # Adjust confidence based on score variance
        variance = sum((score - avg) ** 2 for score in scores.values()) / len(scores)
        confidence_adjustment = max(0, 10 - variance)

        return int(min(100, avg + confidence_adjustment))

    def _extract_skills_by_importance(
        self, skill_analysis: Dict[str, Any], importance: str
    ) -> List[str]:
        """Extract skills filtered by importance level"""
        skills = []

        if "skill_weights" in skill_analysis:
            for weight in skill_analysis["skill_weights"]:
                if weight.get("importance") == importance:
                    skills.append(weight["skill"])

        return skills

    def _count_quantified_achievements(self, text: str) -> int:
        """Count quantified achievements in text"""
        import re

        # Patterns for quantified achievements
        patterns = [
            r"\d+%",  # Percentages
            r"\d+\+",  # Numbers with plus
            r"\d+[kKmM]",  # Thousands/Millions
            r"\$\d+",  # Dollar amounts
            r"\d+ (users|customers|projects|teams|people)",  # Counts
        ]

        count = 0
        for pattern in patterns:
            count += len(re.findall(pattern, text))

        return count

    def _check_section_completeness(self, text: str) -> Dict[str, bool]:
        """Check if resume has all required sections"""
        text_lower = text.lower()

        sections = {
            "experience": any(
                keyword in text_lower
                for keyword in ["experience", "work history", "employment"]
            ),
            "education": "education" in text_lower or "degree" in text_lower,
            "skills": "skill" in text_lower or "technologies" in text_lower,
            "projects": "project" in text_lower,
            "contact": any(
                keyword in text_lower for keyword in ["email", "phone", "linkedin", "@"]
            ),
        }

        return sections
