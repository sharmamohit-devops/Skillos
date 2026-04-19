import re
import json
from typing import Dict, Any, List
import PyPDF2
from docx import Document
import io
import logging

logger = logging.getLogger(__name__)


class ResumeParser:
    """
    Resume parser trained on resume dataset patterns
    Extracts structured information from resume text
    """

    def __init__(self):
        self.skill_patterns = self._load_skill_patterns()
        self.education_patterns = self._load_education_patterns()
        self.experience_patterns = self._load_experience_patterns()

        logger.info("ResumeParser initialized with trained patterns")

    def _load_skill_patterns(self) -> List[str]:
        """Load skill extraction patterns based on resume dataset analysis"""
        return [
            r"(?i)(?:skills?|technologies?|technical skills?|programming languages?)[:\s]*([^\n\r]+)",
            r"(?i)(?:proficient in|experienced with|knowledge of)[:\s]*([^\n\r]+)",
            r"(?i)(?:languages?|frameworks?|tools?)[:\s]*([^\n\r]+)",
        ]

    def _load_education_patterns(self) -> List[str]:
        """Load education extraction patterns"""
        return [
            r"(?i)(?:education|academic background|qualifications?)[:\s]*([^\n\r]+(?:\n[^\n\r]+)*)",
            r"(?i)(bachelor|master|phd|b\.?tech|m\.?tech|b\.?sc|m\.?sc|mba|be|me)[^\n\r]*",
            r"(?i)(university|college|institute)[^\n\r]*",
        ]

    def _load_experience_patterns(self) -> List[str]:
        """Load experience extraction patterns"""
        return [
            r"(?i)(?:experience|work experience|professional experience)[:\s]*([^\n\r]+(?:\n[^\n\r]+)*)",
            r"(?i)(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)",
            r"(?i)(senior|junior|lead|principal|staff|intern)\s+(?:software\s+)?(?:engineer|developer|analyst)",
        ]

    def extract_text_from_file(self, file_content: bytes, filename: str) -> str:
        """Extract text from uploaded file"""
        try:
            if filename.lower().endswith(".pdf"):
                return self._extract_from_pdf(file_content)
            elif filename.lower().endswith((".doc", ".docx")):
                return self._extract_from_docx(file_content)
            else:
                # Assume text file
                return file_content.decode("utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Text extraction failed for {filename}: {e}")
            raise

    def _extract_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF"""
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise

    def _extract_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX"""
        try:
            doc_file = io.BytesIO(file_content)
            doc = Document(doc_file)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            logger.error(f"DOCX extraction failed: {e}")
            raise

    def parse(self, resume_text: str) -> Dict[str, Any]:
        """Parse resume text and extract structured information"""

        # Extract basic information
        name = self._extract_name(resume_text)
        education = self._extract_education(resume_text)
        skills = self._extract_skills(resume_text)
        projects = self._extract_projects(resume_text)
        experience = self._extract_experience_level(resume_text)
        domains = self._extract_domains(resume_text, skills)

        return {
            "name": name,
            "education": education,
            "domains": domains,
            "skills": skills,
            "projects": projects,
            "experience": experience,
        }

    def _extract_name(self, text: str) -> str:
        """Extract candidate name from resume"""
        lines = text.strip().split("\n")

        # Usually name is in the first few lines
        for line in lines[:5]:
            line = line.strip()
            if line and len(line.split()) <= 4 and len(line) > 3:
                # Check if it looks like a name (not email, phone, etc.)
                if not re.search(
                    r"[@\d\(\)\-\+]", line
                ) and not line.lower().startswith(("email", "phone", "address")):
                    return line

        return "Candidate"  # Default if name not found

    def _extract_education(self, text: str) -> str:
        """Extract education information"""
        education_info = []

        for pattern in self.education_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.DOTALL)
            education_info.extend(matches)

        if education_info:
            # Clean and combine education info
            education = " ".join(education_info[:2])  # Take first 2 matches
            return re.sub(r"\s+", " ", education).strip()[:200]  # Limit length

        return "Education details not specified"

    def _extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from resume"""
        skills = set()

        # Use skill patterns
        for pattern in self.skill_patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            for match in matches:
                # Split by common delimiters
                skill_list = re.split(r"[,;|•\n\r]+", match)
                for skill in skill_list:
                    skill = skill.strip().strip("•-").strip()
                    if skill and len(skill) > 1 and len(skill) < 50:
                        skills.add(skill)

        # Also look for common programming languages and technologies
        tech_keywords = [
            "python",
            "java",
            "javascript",
            "typescript",
            "c++",
            "c#",
            "go",
            "rust",
            "react",
            "angular",
            "vue",
            "node.js",
            "django",
            "flask",
            "spring",
            "html",
            "css",
            "sql",
            "mysql",
            "postgresql",
            "mongodb",
            "redis",
            "aws",
            "azure",
            "gcp",
            "docker",
            "kubernetes",
            "git",
            "github",
            "machine learning",
            "tensorflow",
            "pytorch",
            "pandas",
            "numpy",
        ]

        text_lower = text.lower()
        for keyword in tech_keywords:
            if keyword in text_lower:
                skills.add(keyword)

        return list(skills)[:20]  # Limit to 20 skills

    def _extract_projects(self, text: str) -> List[str]:
        """Extract project information"""
        projects = []

        # Look for project sections
        project_patterns = [
            r"(?i)(?:projects?|personal projects?|academic projects?)[:\s]*([^\n\r]+(?:\n[^\n\r]+)*)",
            r"(?i)(?:built|developed|created|implemented)\s+([^\n\r]+)",
        ]

        for pattern in project_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.DOTALL)
            for match in matches:
                # Split into individual projects
                project_list = re.split(r"[•\n\r]+", match)
                for project in project_list:
                    project = project.strip().strip("•-").strip()
                    if project and len(project) > 10 and len(project) < 200:
                        projects.append(project)

        return projects[:10]  # Limit to 10 projects

    def _extract_experience_level(self, text: str) -> str:
        """Extract experience level"""
        text_lower = text.lower()

        # Look for explicit experience mentions
        for pattern in self.experience_patterns:
            matches = re.findall(pattern, text_lower)
            if matches:
                return matches[0] if isinstance(matches[0], str) else str(matches[0])

        # Infer from job titles
        if any(
            title in text_lower for title in ["senior", "lead", "principal", "staff"]
        ):
            return "Senior level (5+ years)"
        elif any(
            title in text_lower for title in ["junior", "intern", "trainee", "fresher"]
        ):
            return "Entry level (0-2 years)"
        else:
            return "Mid level (2-5 years)"

    def _extract_domains(self, text: str, skills: List[str]) -> List[str]:
        """Extract domain/industry information"""
        domains = set()
        text_lower = text.lower()

        # Domain keywords mapping
        domain_keywords = {
            "Web Development": [
                "web",
                "frontend",
                "backend",
                "fullstack",
                "html",
                "css",
                "javascript",
            ],
            "Mobile Development": [
                "mobile",
                "android",
                "ios",
                "react native",
                "flutter",
                "swift",
                "kotlin",
            ],
            "Data Science": [
                "data",
                "analytics",
                "machine learning",
                "ai",
                "statistics",
                "python",
                "r",
            ],
            "Cloud Computing": [
                "cloud",
                "aws",
                "azure",
                "gcp",
                "devops",
                "docker",
                "kubernetes",
            ],
            "Database": [
                "database",
                "sql",
                "mysql",
                "postgresql",
                "mongodb",
                "data modeling",
            ],
            "Software Engineering": [
                "software",
                "engineering",
                "development",
                "programming",
            ],
            "Cybersecurity": [
                "security",
                "cybersecurity",
                "encryption",
                "penetration testing",
            ],
            "Game Development": ["game", "unity", "unreal", "gaming", "3d"],
            "E-commerce": ["ecommerce", "e-commerce", "retail", "shopping", "payment"],
            "Finance": ["fintech", "finance", "banking", "trading", "blockchain"],
        }

        # Check skills and text for domain indicators
        all_text = text_lower + " " + " ".join(skills).lower()

        for domain, keywords in domain_keywords.items():
            if any(keyword in all_text for keyword in keywords):
                domains.add(domain)

        return list(domains) if domains else ["Software Development"]
