"""
PRIYA - HR Screener Agent
Experienced corporate HR professional
Focuses on cultural fit, career progression, soft skills
"""

from .base_agent import BaseAgent
from typing import Dict, Any, List
import re


class HRAgent(BaseAgent):
    """
    PRIYA - The HR Screener
    Persona: Warm but professional, reads between the lines
    Evaluates: Cultural fit, progression, soft skills, red flags
    """

    def __init__(self):
        super().__init__(
            name="PRIYA",
            role="HR Screener",
            persona="10 years in talent acquisition. Warm but professional.",
            color="green",
        )

        # Soft skill indicators
        self.soft_skill_keywords = {
            "leadership": [
                "led",
                "managed",
                "mentored",
                "coached",
                "directed",
                "supervised",
            ],
            "collaboration": [
                "collaborated",
                "partnered",
                "coordinated",
                "team",
                "cross-functional",
            ],
            "communication": [
                "presented",
                "communicated",
                "documented",
                "reported",
                "facilitated",
            ],
            "problem_solving": [
                "solved",
                "resolved",
                "improved",
                "optimized",
                "streamlined",
            ],
            "initiative": [
                "initiated",
                "launched",
                "pioneered",
                "established",
                "founded",
            ],
        }

    def evaluate(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """HR evaluation based on cultural fit and career progression"""
        resume_text = analysis_data.get("resume_text", "")
        skill_analysis = analysis_data.get("skill_analysis", {})
        candidate_profile = analysis_data.get("candidate_profile", {})

        # Calculate scores
        culture_fit_score = self._calculate_culture_fit(resume_text)
        progression_score = self._calculate_progression(resume_text, candidate_profile)
        soft_skill_score = self._calculate_soft_skills(resume_text)

        # Identify flags
        red_flags = self._identify_red_flags(resume_text, candidate_profile)
        green_flags = self._identify_green_flags(resume_text, skill_analysis)

        # Determine verdict
        verdict = self._determine_verdict(
            culture_fit_score, progression_score, soft_skill_score, red_flags
        )

        # Calculate confidence
        confidence = self._calculate_confidence(
            {
                "culture_fit": culture_fit_score,
                "progression": progression_score,
                "soft_skills": soft_skill_score,
            }
        )

        return {
            "agent": "hr",
            "name": self.name,
            "role": self.role,
            "verdict": verdict,
            "confidence": confidence,
            "culture_fit_score": culture_fit_score,
            "progression_score": progression_score,
            "soft_skill_score": soft_skill_score,
            "red_flags": red_flags,
            "green_flags": green_flags,
            "comment": self._generate_comment(verdict, red_flags, green_flags),
        }

    def _calculate_culture_fit(self, resume_text: str) -> int:
        """Assess cultural fit signals"""
        score = 50  # Base score
        text_lower = resume_text.lower()

        # Positive indicators
        positive_indicators = [
            "passion",
            "enthusiastic",
            "motivated",
            "driven",
            "dedicated",
            "innovative",
            "creative",
            "proactive",
            "adaptable",
            "flexible",
        ]

        for indicator in positive_indicators:
            if indicator in text_lower:
                score += 5

        # Team orientation
        team_words = ["team", "collaborate", "together", "group", "partnership"]
        team_mentions = sum(text_lower.count(word) for word in team_words)
        score += min(15, team_mentions * 3)

        # Professional tone
        if any(
            word in text_lower for word in ["professional", "excellence", "quality"]
        ):
            score += 5

        return min(100, score)

    def _calculate_progression(self, resume_text: str, profile: Dict[str, Any]) -> int:
        """Evaluate career progression logic"""
        score = 60  # Base score
        text_lower = resume_text.lower()

        # Check for promotions
        promotion_keywords = ["promoted", "advanced", "elevated", "senior", "lead"]
        if any(keyword in text_lower for keyword in promotion_keywords):
            score += 15

        # Check for increasing responsibility
        responsibility_keywords = [
            "managed",
            "led",
            "directed",
            "oversaw",
            "supervised",
        ]
        responsibility_count = sum(
            text_lower.count(word) for word in responsibility_keywords
        )
        score += min(15, responsibility_count * 3)

        # Check for skill growth
        if "learned" in text_lower or "acquired" in text_lower:
            score += 5

        # Check experience level
        experience = profile.get("experience", "")
        if "senior" in experience.lower() or "lead" in experience.lower():
            score += 5

        return min(100, score)

    def _calculate_soft_skills(self, resume_text: str) -> int:
        """Calculate soft skill indicators"""
        score = 0
        text_lower = resume_text.lower()

        for skill_category, keywords in self.soft_skill_keywords.items():
            category_score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    category_score += 5
            score += min(20, category_score)  # Max 20 per category

        return min(100, score)

    def _identify_red_flags(
        self, resume_text: str, profile: Dict[str, Any]
    ) -> List[str]:
        """Identify potential red flags"""
        flags = []
        text_lower = resume_text.lower()

        # Check for job hopping (multiple short tenures)
        if text_lower.count("months") > 2:
            flags.append("Multiple short tenures (< 1 year) - possible job hopping")

        # Check for employment gaps
        years = re.findall(r"\b(20\d{2})\b", resume_text)
        if len(years) > 2:
            years_int = sorted([int(y) for y in set(years)])
            for i in range(len(years_int) - 1):
                if years_int[i + 1] - years_int[i] > 2:
                    flags.append(
                        f"Potential employment gap around {years_int[i]}-{years_int[i+1]}"
                    )

        # Check for vague descriptions
        vague_words = ["various", "multiple", "several", "many"]
        vague_count = sum(text_lower.count(word) for word in vague_words)
        if vague_count > 5:
            flags.append("Vague job descriptions - lacks specificity")

        # Check for lack of achievements
        if self._count_quantified_achievements(resume_text) < 2:
            flags.append("Limited quantified achievements")

        return flags[:3]  # Top 3 red flags

    def _identify_green_flags(
        self, resume_text: str, skill_analysis: Dict[str, Any]
    ) -> List[str]:
        """Identify positive signals"""
        flags = []
        text_lower = resume_text.lower()

        # Strong leadership signals
        leadership_count = sum(
            text_lower.count(word) for word in ["led", "managed", "mentored"]
        )
        if leadership_count >= 3:
            flags.append("Strong leadership verbs throughout resume")

        # Clear career progression
        if "promoted" in text_lower or "advanced" in text_lower:
            flags.append("Clear career progression with promotions")

        # Quantified achievements
        achievement_count = self._count_quantified_achievements(resume_text)
        if achievement_count >= 5:
            flags.append(
                f"Strong results orientation - {achievement_count} quantified achievements"
            )

        # Diverse skill set
        matched_skills = skill_analysis.get("matched_skills", [])
        if len(matched_skills) > 7:
            flags.append(f"Diverse skill set - {len(matched_skills)} relevant skills")

        # Professional certifications
        if any(
            word in text_lower for word in ["certified", "certification", "licensed"]
        ):
            flags.append("Professional certifications present")

        return flags[:4]  # Top 4 green flags

    def _determine_verdict(
        self, culture_fit: int, progression: int, soft_skills: int, red_flags: List[str]
    ) -> str:
        """Determine HR verdict"""
        avg_score = (culture_fit + progression + soft_skills) / 3

        # Red flags can override
        if len(red_flags) >= 3:
            return "HOLD"

        if avg_score >= 75:
            return "SHORTLIST"
        elif avg_score >= 55:
            return "HOLD"
        else:
            return "REJECT"

    def _generate_comment(
        self, verdict: str, red_flags: List[str], green_flags: List[str]
    ) -> str:
        """Generate conversational HR comment"""
        if verdict == "SHORTLIST":
            comment = "Solid candidate with good cultural fit signals. "
            if green_flags:
                comment += f"{green_flags[0]}. "
            if red_flags:
                comment += f"Minor concern: {red_flags[0].lower()}, but overall trajectory is positive."
            else:
                comment += "No major red flags identified."

        elif verdict == "HOLD":
            comment = "Mixed signals on this candidate. "
            if red_flags:
                comment += f"{red_flags[0]}. "
            comment += (
                "Would recommend phone screen to clarify concerns before proceeding."
            )

        else:
            comment = "Not a strong fit at this time. "
            if red_flags:
                comment += f"Key concerns: {red_flags[0].lower()}. "
            comment += "Candidate may need more experience before being competitive."

        return comment
