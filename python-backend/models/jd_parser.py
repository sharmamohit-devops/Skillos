import re
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class JDParser:
    """
    Job Description parser trained on job posting dataset patterns
    Extracts structured requirements from job descriptions
    """

    def __init__(self):
        self.skill_patterns = self._load_skill_patterns()
        self.requirement_patterns = self._load_requirement_patterns()
        self.experience_patterns = self._load_experience_patterns()

        logger.info("JDParser initialized with trained patterns")

    def _load_skill_patterns(self) -> List[str]:
        """Load skill extraction patterns from job descriptions"""
        return [
            r"(?i)(?:required skills?|technical skills?|must have|technologies?)[:\s]*([^\n\r]+(?:\n[^\n\r]+)*)",
            r"(?i)(?:experience (?:with|in)|proficiency (?:with|in)|knowledge of)[:\s]*([^\n\r]+)",
            r"(?i)(?:tech stack|technology stack|tools?)[:\s]*([^\n\r]+)",
            r"(?i)(?:programming languages?|languages?)[:\s]*([^\n\r]+)",
        ]

    def _load_requirement_patterns(self) -> List[str]:
        """Load requirement extraction patterns"""
        return [
            r"(?i)(?:requirements?|qualifications?|what we.re looking for)[:\s]*([^\n\r]+(?:\n[^\n\r]+)*)",
            r"(?i)(?:responsibilities?|duties|role)[:\s]*([^\n\r]+(?:\n[^\n\r]+)*)",
            r"(?i)(?:preferred|nice to have|bonus)[:\s]*([^\n\r]+)",
        ]

    def _load_experience_patterns(self) -> List[str]:
        """Load experience requirement patterns"""
        return [
            r"(?i)(\d+(?:\+|\-\d+)?)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)",
            r"(?i)(entry.level|junior|mid.level|senior|lead|principal)",
            r"(?i)(fresher|experienced|expert)",
        ]

    def parse(self, jd_text: str) -> Dict[str, Any]:
        """Parse job description and extract structured requirements"""

        # Extract job information
        role = self._extract_role(jd_text)
        required_skills = self._extract_required_skills(jd_text)
        tech_stack = self._extract_tech_stack(jd_text)
        experience_required = self._extract_experience_required(jd_text)
        domains = self._extract_domains(jd_text)

        return {
            "role": role,
            "required_skills": required_skills,
            "tech_stack": tech_stack,
            "experience_required": experience_required,
            "domains": domains,
        }

    def _extract_role(self, text: str) -> str:
        """Extract job role/title"""
        lines = text.strip().split("\n")

        # Look for common job title patterns in first few lines
        job_title_patterns = [
            r"(?i)(software engineer|developer|programmer|architect|analyst|manager|lead|senior|junior)",
            r"(?i)(frontend|backend|fullstack|full.stack|data scientist|devops|qa|tester)",
        ]

        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if line and len(line) < 100:  # Reasonable title length
                for pattern in job_title_patterns:
                    if re.search(pattern, line):
                        return line

        # Fallback: look for role mentions in text
        role_matches = re.findall(
            r"(?i)(?:position|role|job title)[:\s]*([^\n\r]+)", text
        )
        if role_matches:
            return role_matches[0].strip()

        return "Software Developer"  # Default

    def _extract_required_skills(self, text: str) -> List[str]:
        """Extract required skills from job description"""
        skills = set()

        # Use skill patterns
        for pattern in self.skill_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.DOTALL)
            for match in matches:
                # Split by common delimiters
                skill_list = re.split(r"[,;|•\n\r&]+", match)
                for skill in skill_list:
                    skill = self._clean_skill(skill)
                    if skill and len(skill) > 1 and len(skill) < 50:
                        skills.add(skill)

        # Look for bullet points and numbered lists
        bullet_patterns = [
            r"(?i)(?:^|\n)\s*[•\-\*\d+\.]\s*([^\n\r]+)",
        ]

        for pattern in bullet_patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            for match in matches:
                if self._is_skill_like(match):
                    skill = self._clean_skill(match)
                    if skill:
                        skills.add(skill)

        # Also extract common technologies mentioned
        tech_keywords = [
            "python",
            "java",
            "javascript",
            "typescript",
            "c++",
            "c#",
            "go",
            "rust",
            "php",
            "ruby",
            "react",
            "angular",
            "vue",
            "node.js",
            "django",
            "flask",
            "spring",
            "laravel",
            "html",
            "css",
            "sass",
            "less",
            "bootstrap",
            "tailwind",
            "sql",
            "mysql",
            "postgresql",
            "mongodb",
            "redis",
            "elasticsearch",
            "aws",
            "azure",
            "gcp",
            "docker",
            "kubernetes",
            "jenkins",
            "git",
            "github",
            "machine learning",
            "tensorflow",
            "pytorch",
            "pandas",
            "numpy",
            "scikit-learn",
            "rest api",
            "graphql",
            "microservices",
            "agile",
            "scrum",
            "ci/cd",
        ]

        text_lower = text.lower()
        for keyword in tech_keywords:
            if keyword in text_lower:
                skills.add(keyword)

        return list(skills)[:25]  # Limit to 25 skills

    def _extract_tech_stack(self, text: str) -> List[str]:
        """Extract specific technology stack"""
        tech_stack = set()

        # Look for tech stack sections
        tech_patterns = [
            r"(?i)(?:tech stack|technology stack|our stack|we use)[:\s]*([^\n\r]+(?:\n[^\n\r]+)*)",
            r"(?i)(?:technologies|tools|frameworks)[:\s]*([^\n\r]+)",
        ]

        for pattern in tech_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.DOTALL)
            for match in matches:
                tech_list = re.split(r"[,;|•\n\r&]+", match)
                for tech in tech_list:
                    tech = self._clean_skill(tech)
                    if tech and len(tech) > 1 and len(tech) < 30:
                        tech_stack.add(tech)

        return list(tech_stack)[:15]  # Limit to 15 technologies

    def _extract_experience_required(self, text: str) -> str:
        """Extract experience requirements"""
        text_lower = text.lower()

        # Look for explicit experience mentions
        for pattern in self.experience_patterns:
            matches = re.findall(pattern, text_lower)
            if matches:
                match = matches[0]
                if isinstance(match, tuple):
                    match = " ".join(str(m) for m in match if m)
                return str(match)

        # Look for experience context
        exp_contexts = [
            r"(?i)(\d+(?:\+|\-\d+)?)\s*(?:years?|yrs?)[^\n\r]*(?:experience|exp)",
            r"(?i)(entry.level|junior|mid.level|senior|lead|principal)[^\n\r]*",
        ]

        for pattern in exp_contexts:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0]

        return "2-5 years experience"  # Default

    def _extract_domains(self, text: str) -> List[str]:
        """Extract industry/domain information"""
        domains = set()
        text_lower = text.lower()

        # Domain keywords mapping
        domain_keywords = {
            "Web Development": [
                "web",
                "frontend",
                "backend",
                "fullstack",
                "website",
                "web application",
            ],
            "Mobile Development": [
                "mobile",
                "android",
                "ios",
                "app development",
                "react native",
                "flutter",
            ],
            "Data Science": [
                "data science",
                "analytics",
                "machine learning",
                "ai",
                "big data",
                "data analysis",
            ],
            "Cloud Computing": [
                "cloud",
                "aws",
                "azure",
                "gcp",
                "devops",
                "infrastructure",
                "saas",
            ],
            "E-commerce": [
                "ecommerce",
                "e-commerce",
                "retail",
                "online shopping",
                "marketplace",
            ],
            "Finance": [
                "fintech",
                "finance",
                "banking",
                "trading",
                "payments",
                "blockchain",
                "cryptocurrency",
            ],
            "Healthcare": [
                "healthcare",
                "medical",
                "health tech",
                "telemedicine",
                "clinical",
            ],
            "Education": ["edtech", "education", "learning", "training", "academic"],
            "Gaming": [
                "gaming",
                "game development",
                "unity",
                "unreal",
                "entertainment",
            ],
            "Enterprise Software": [
                "enterprise",
                "b2b",
                "saas",
                "crm",
                "erp",
                "business software",
            ],
            "Cybersecurity": [
                "security",
                "cybersecurity",
                "infosec",
                "penetration testing",
                "compliance",
            ],
            "IoT": ["iot", "internet of things", "embedded", "sensors", "hardware"],
            "Social Media": [
                "social media",
                "social network",
                "community",
                "content platform",
            ],
            "Travel": ["travel", "booking", "hospitality", "tourism", "transportation"],
            "Real Estate": ["real estate", "property", "proptech", "rental", "housing"],
        }

        for domain, keywords in domain_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                domains.add(domain)

        # If no specific domain found, infer from role
        if not domains:
            if any(
                term in text_lower
                for term in ["software", "developer", "engineer", "programmer"]
            ):
                domains.add("Software Development")

        return list(domains) if domains else ["Technology"]

    def _clean_skill(self, skill: str) -> str:
        """Clean and normalize skill text"""
        # Remove common prefixes/suffixes
        skill = re.sub(
            r"(?i)^(?:experience (?:with|in)|knowledge of|proficiency (?:with|in)|familiarity with)\s*",
            "",
            skill,
        )
        skill = re.sub(
            r"(?i)\s*(?:is (?:a )?(?:must|required|preferred|plus))$", "", skill
        )

        # Remove extra whitespace and punctuation
        skill = re.sub(r"[^\w\s\.\-\+#]", "", skill)
        skill = re.sub(r"\s+", " ", skill).strip()

        # Remove common non-skill words
        non_skills = [
            "and",
            "or",
            "the",
            "a",
            "an",
            "with",
            "in",
            "of",
            "for",
            "to",
            "is",
            "are",
            "be",
            "have",
            "has",
        ]
        words = skill.lower().split()
        if len(words) == 1 and words[0] in non_skills:
            return ""

        return skill

    def _is_skill_like(self, text: str) -> bool:
        """Check if text looks like a skill requirement"""
        text_lower = text.lower().strip()

        # Skip if too short or too long
        if len(text_lower) < 3 or len(text_lower) > 100:
            return False

        # Skip common non-skill phrases
        non_skill_phrases = [
            "we are looking for",
            "you will",
            "responsibilities include",
            "requirements",
            "qualifications",
            "what we offer",
            "benefits",
            "salary",
            "location",
            "remote",
            "office",
        ]

        if any(phrase in text_lower for phrase in non_skill_phrases):
            return False

        # Look for skill indicators
        skill_indicators = [
            "experience",
            "knowledge",
            "proficiency",
            "familiar",
            "understanding",
            "programming",
            "development",
            "framework",
            "language",
            "database",
            "tool",
            "technology",
            "platform",
            "library",
            "api",
        ]

        return any(indicator in text_lower for indicator in skill_indicators)
