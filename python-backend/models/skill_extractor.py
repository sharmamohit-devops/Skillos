import re
import json
import numpy as np
from typing import List, Dict, Any, Tuple
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import logging

logger = logging.getLogger(__name__)

class SkillExtractor:
    """
    Advanced skill extraction and matching using pre-trained models
    with skill depth detection, role-based weighting, and risk analysis
    """
    
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1, 3))
        
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
        
        self.stop_words = set(stopwords.words('english'))
        
        # Load skill taxonomy from training data
        self.skill_taxonomy = self._load_skill_taxonomy()
        self.skill_synonyms = self._load_skill_synonyms()
        
        # Advanced features
        self.depth_indicators = self._load_depth_indicators()
        self.action_verbs = self._load_action_verbs()
        self.core_domain_skills = self._load_core_domain_skills()
        
        logger.info("SkillExtractor initialized with advanced features")
    
    def _load_skill_taxonomy(self) -> Dict[str, List[str]]:
        """Load skill taxonomy based on O*NET and resume dataset analysis"""
        return {
            "programming_languages": [
                "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
                "php", "ruby", "swift", "kotlin", "scala", "r", "matlab", "sql"
            ],
            "web_technologies": [
                "html", "css", "react", "angular", "vue", "node.js", "express",
                "django", "flask", "spring", "laravel", "bootstrap", "tailwind"
            ],
            "databases": [
                "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
                "oracle", "sqlite", "cassandra", "dynamodb"
            ],
            "cloud_platforms": [
                "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
                "jenkins", "gitlab", "github actions"
            ],
            "data_science": [
                "machine learning", "deep learning", "tensorflow", "pytorch",
                "pandas", "numpy", "scikit-learn", "tableau", "power bi"
            ],
            "soft_skills": [
                "leadership", "communication", "teamwork", "problem solving",
                "project management", "agile", "scrum"
            ]
        }
    
    def _load_skill_synonyms(self) -> Dict[str, List[str]]:
        """Load skill synonyms mapping"""
        return {
            "javascript": ["js", "ecmascript", "es6", "es2015"],
            "python": ["py", "python3"],
            "machine learning": ["ml", "artificial intelligence", "ai"],
            "node.js": ["nodejs", "node"],
            "react": ["reactjs", "react.js"],
            "angular": ["angularjs", "angular.js"],
            "vue": ["vuejs", "vue.js"],
            "postgresql": ["postgres", "psql"],
            "mongodb": ["mongo"],
            "aws": ["amazon web services"],
            "gcp": ["google cloud platform", "google cloud"],
            "azure": ["microsoft azure"]
        }
    
    def _load_depth_indicators(self) -> Dict[str, List[str]]:
        """Load indicators for skill depth detection"""
        return {
            "advanced": [
                "architected", "designed", "optimized", "scaled", "deployed", "implemented",
                "led", "managed", "mentored", "production", "enterprise", "performance",
                "security", "integration", "microservices", "distributed", "real-time"
            ],
            "intermediate": [
                "developed", "built", "created", "worked", "used", "applied", "integrated",
                "configured", "customized", "maintained", "project", "application", "system"
            ],
            "beginner": [
                "familiar", "basic", "learning", "studied", "coursework", "tutorial",
                "introduction", "overview", "exposure", "knowledge"
            ]
        }
    
    def _load_action_verbs(self) -> Dict[str, int]:
        """Load action verbs with experience weights"""
        return {
            # Advanced level verbs (weight: 3)
            "architected": 3, "designed": 3, "led": 3, "managed": 3, "optimized": 3,
            "deployed": 3, "scaled": 3, "mentored": 3, "implemented": 3,
            
            # Intermediate level verbs (weight: 2)
            "developed": 2, "built": 2, "created": 2, "integrated": 2, "configured": 2,
            "maintained": 2, "worked": 2, "applied": 2, "customized": 2,
            
            # Beginner level verbs (weight: 1)
            "used": 1, "learned": 1, "studied": 1, "familiar": 1, "exposed": 1,
            "assisted": 1, "supported": 1, "participated": 1
        }
    
    def _load_core_domain_skills(self) -> Dict[str, List[str]]:
        """Load core skills by domain for role-based weighting"""
        return {
            "frontend": ["javascript", "react", "angular", "vue", "html", "css", "typescript"],
            "backend": ["python", "java", "node.js", "spring", "django", "flask", "api"],
            "fullstack": ["javascript", "python", "react", "node.js", "database", "api"],
            "data_science": ["python", "machine learning", "pandas", "numpy", "tensorflow", "sql"],
            "devops": ["docker", "kubernetes", "aws", "jenkins", "terraform", "linux"],
            "mobile": ["react native", "flutter", "swift", "kotlin", "android", "ios"],
            "qa": ["selenium", "testing", "automation", "cypress", "junit", "pytest"]
        }
    
    def extract_structured_skills(self, text: str) -> Dict[str, List[str]]:
        """Extract skills categorized by type"""
        text_lower = text.lower()
        
        structured_skills = {
            "technical_skills": [],
            "tools_and_technologies": [],
            "frameworks_libraries": [],
            "domain_skills": []
        }
        
        # Extract from skill taxonomy
        for category, skills in self.skill_taxonomy.items():
            for skill in skills:
                if skill.lower() in text_lower:
                    if category == "programming_languages":
                        structured_skills["technical_skills"].append(skill)
                    elif category in ["web_technologies", "databases", "cloud_platforms"]:
                        structured_skills["tools_and_technologies"].append(skill)
                    elif category == "data_science":
                        structured_skills["frameworks_libraries"].append(skill)
                    elif category == "soft_skills":
                        structured_skills["domain_skills"].append(skill)
        
        # Extract using patterns
        skill_patterns = [
            r'(?i)(?:skills?|technologies?)[:\s]*([^\n\r]+)',
            r'(?i)(?:programming languages?)[:\s]*([^\n\r]+)',
            r'(?i)(?:frameworks?|libraries)[:\s]*([^\n\r]+)',
            r'(?i)(?:tools?)[:\s]*([^\n\r]+)'
        ]
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                skills = [s.strip() for s in re.split(r'[,;|]', match) if len(s.strip()) > 2]
                structured_skills["technical_skills"].extend(skills[:5])  # Limit to avoid noise
        
        # Remove duplicates and clean
        for category in structured_skills:
            structured_skills[category] = list(set(structured_skills[category]))
            structured_skills[category] = [s for s in structured_skills[category] if len(s) > 2]
        
        return structured_skills
    
    def detect_skill_depth(self, resume_text: str, skills: List[str]) -> Dict[str, str]:
        """Detect skill depth based on resume context"""
        skill_depth = {}
        resume_lower = resume_text.lower()
        
        for skill in skills:
            skill_lower = skill.lower()
            depth_score = 0
            context_found = False
            
            # Find skill mentions in context
            skill_contexts = []
            sentences = re.split(r'[.!?]', resume_text)
            
            for sentence in sentences:
                if skill_lower in sentence.lower():
                    skill_contexts.append(sentence.lower())
                    context_found = True
            
            if not context_found:
                skill_depth[skill] = "beginner"
                continue
            
            # Analyze context for depth indicators
            context_text = " ".join(skill_contexts)
            
            # Check for advanced indicators
            advanced_count = sum(1 for indicator in self.depth_indicators["advanced"] 
                               if indicator in context_text)
            
            # Check for intermediate indicators
            intermediate_count = sum(1 for indicator in self.depth_indicators["intermediate"] 
                                   if indicator in context_text)
            
            # Check for beginner indicators
            beginner_count = sum(1 for indicator in self.depth_indicators["beginner"] 
                               if indicator in context_text)
            
            # Check for action verbs
            action_score = 0
            for verb, weight in self.action_verbs.items():
                if verb in context_text:
                    action_score += weight
            
            # Determine depth based on indicators and action verbs
            if advanced_count >= 2 or action_score >= 6:
                skill_depth[skill] = "advanced"
            elif intermediate_count >= 2 or action_score >= 3:
                skill_depth[skill] = "intermediate"
            else:
                skill_depth[skill] = "beginner"
        
        return skill_depth
    
    def calculate_role_based_weights(self, job_text: str, required_skills: List[str]) -> List[Dict[str, str]]:
        """Calculate role-based importance weights for skills"""
        job_lower = job_text.lower()
        skill_weights = []
        
        # Detect job domain
        detected_domain = self._detect_job_domain(job_text)
        core_skills = self.core_domain_skills.get(detected_domain, [])
        
        for skill in required_skills:
            skill_lower = skill.lower()
            importance = "Low"  # Default
            
            # Check if it's a core domain skill
            if any(core_skill in skill_lower for core_skill in core_skills):
                importance = "High"
            
            # Check frequency and context in JD
            skill_mentions = job_lower.count(skill_lower)
            
            # Check for importance keywords around skill
            importance_patterns = [
                rf'(?i)(?:required|must have|essential|critical|key|primary|core|main).*{re.escape(skill_lower)}',
                rf'(?i){re.escape(skill_lower)}.*(?:required|must have|essential|critical|key|primary|core|main)',
                rf'(?i)(?:strong|solid|deep|extensive|expert).*{re.escape(skill_lower)}',
                rf'(?i){re.escape(skill_lower)}.*(?:experience|expertise|proficiency|knowledge)'
            ]
            
            high_importance_found = any(re.search(pattern, job_text) for pattern in importance_patterns)
            
            if high_importance_found or skill_mentions >= 3:
                importance = "High"
            elif skill_mentions >= 2:
                importance = "Medium"
            
            # Check if mentioned in job title or early sections
            job_lines = job_text.split('\n')[:10]  # First 10 lines
            if any(skill_lower in line.lower() for line in job_lines):
                if importance == "Low":
                    importance = "Medium"
                elif importance == "Medium":
                    importance = "High"
            
            skill_weights.append({
                "skill": skill,
                "importance": importance
            })
        
        return skill_weights
    
    def _detect_job_domain(self, job_text: str) -> str:
        """Detect job domain from job description"""
        job_lower = job_text.lower()
        
        domain_keywords = {
            "frontend": ["frontend", "front-end", "ui", "ux", "react", "angular", "vue"],
            "backend": ["backend", "back-end", "api", "server", "database", "microservices"],
            "fullstack": ["fullstack", "full-stack", "full stack"],
            "data_science": ["data scientist", "machine learning", "ai", "analytics", "data analysis"],
            "devops": ["devops", "infrastructure", "deployment", "ci/cd", "kubernetes", "docker"],
            "mobile": ["mobile", "android", "ios", "react native", "flutter"],
            "qa": ["qa", "quality assurance", "testing", "automation", "test engineer"]
        }
        
        domain_scores = {}
        for domain, keywords in domain_keywords.items():
            score = sum(1 for keyword in keywords if keyword in job_lower)
            domain_scores[domain] = score
        
        return max(domain_scores, key=domain_scores.get) if domain_scores else "fullstack"
    
    def calculate_weighted_match_score(self, matched_skills: List[str], 
                                     skill_weights: List[Dict[str, str]]) -> float:
        """Calculate weighted match score based on skill importance"""
        if not skill_weights:
            return 0.0
        
        total_weight = 0
        matched_weight = 0
        
        weight_values = {"High": 3, "Medium": 2, "Low": 1}
        
        for skill_weight in skill_weights:
            skill = skill_weight["skill"]
            importance = skill_weight["importance"]
            weight = weight_values.get(importance, 1)
            
            total_weight += weight
            
            # Check if skill is matched (case-insensitive)
            if any(skill.lower() == matched.lower() for matched in matched_skills):
                matched_weight += weight
        
        return (matched_weight / total_weight * 100) if total_weight > 0 else 0.0
    
    def detect_risk_factors(self, resume_text: str, candidate_profile: Dict[str, Any], 
                          job_analysis: Dict[str, Any], skill_analysis: Dict[str, Any]) -> List[str]:
        """Detect risk factors in candidate profile"""
        risk_factors = []
        resume_lower = resume_text.lower()
        
        # Risk 1: Missing core domain projects
        projects = candidate_profile.get("projects", [])
        if len(projects) < 2:
            risk_factors.append("Limited project experience - only theoretical knowledge evident")
        
        # Risk 2: No implementation experience
        implementation_verbs = ["built", "developed", "created", "implemented", "deployed"]
        has_implementation = any(verb in resume_lower for verb in implementation_verbs)
        if not has_implementation:
            risk_factors.append("No clear implementation experience - mostly theoretical background")
        
        # Risk 3: Weak domain alignment
        job_domain = self._detect_job_domain(job_analysis.get("role", ""))
        candidate_domains = candidate_profile.get("domains", [])
        domain_match = any(domain.lower() in job_domain.lower() for domain in candidate_domains)
        if not domain_match:
            risk_factors.append("Weak domain alignment - candidate background doesn't match job domain")
        
        # Risk 4: Missing critical tools/technologies
        missing_skills = skill_analysis.get("missing_skills", [])
        critical_missing = [skill for skill in missing_skills 
                          if any(core in skill.lower() 
                                for core_list in self.core_domain_skills.values() 
                                for core in core_list)]
        if len(critical_missing) > 3:
            risk_factors.append(f"Missing {len(critical_missing)} critical technical skills")
        
        # Risk 5: Low skill match percentage
        skill_match_pct = skill_analysis.get("skill_match_percentage", 0)
        if skill_match_pct < 30:
            risk_factors.append("Very low skill match - significant reskilling required")
        
        # Risk 6: No recent experience
        if "2023" not in resume_text and "2024" not in resume_text and "2025" not in resume_text:
            risk_factors.append("No recent experience mentioned - skills may be outdated")
        
        return risk_factors
                
                # Check synonyms
                if skill in self.skill_synonyms:
                    for synonym in self.skill_synonyms[skill]:
                        if synonym.lower() in text_lower:
                            extracted_skills.add(skill)
        
        # Extract using regex patterns for common skill formats
        patterns = [
            r'\b[A-Z][a-z]+(?:\.[a-z]+)+\b',  # Framework patterns like React.js
            r'\b[A-Z]{2,}\b',  # Acronyms like AWS, API
            r'\b\w+(?:-\w+)+\b'  # Hyphenated skills
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if len(match) > 2 and match.lower() not in self.stop_words:
                    extracted_skills.add(match.lower())
        
        return list(extracted_skills)
    
    def calculate_skill_similarity(self, skill1: str, skill2: str) -> float:
        """Calculate semantic similarity between two skills"""
        try:
            embeddings = self.model.encode([skill1, skill2])
            similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            return float(similarity)
        except Exception as e:
            logger.warning(f"Similarity calculation failed for {skill1}, {skill2}: {e}")
            return 0.0
    
    def analyze_skills_advanced(self, resume_text: str, jd_text: str) -> Dict[str, Any]:
        """
        Advanced skill analysis with depth detection, role-based weighting, and risk factors
        Returns structured JSON as per the enhanced specification
        """
        # Step 1: Extract structured skills
        resume_skills = self.extract_structured_skills(resume_text)
        jd_skills = self.extract_structured_skills(jd_text)
        
        # Flatten skills for comparison
        candidate_skills = []
        for category in resume_skills.values():
            candidate_skills.extend(category)
        
        required_skills = []
        for category in jd_skills.values():
            required_skills.extend(category)
        
        # Remove duplicates
        candidate_skills = list(set(candidate_skills))
        required_skills = list(set(required_skills))
        
        # Step 2: Skill matching
        matched_skills = []
        partial_skills = []
        missing_skills = []
        
        for required_skill in required_skills:
            best_match = None
            best_similarity = 0.0
            
            # Exact match
            for candidate_skill in candidate_skills:
                if required_skill.lower() == candidate_skill.lower():
                    best_match = candidate_skill
                    best_similarity = 1.0
                    break
            
            # Synonym match
            if not best_match:
                for candidate_skill in candidate_skills:
                    if self._check_synonym_match(required_skill, candidate_skill):
                        best_match = candidate_skill
                        best_similarity = 0.9
                        break
            
            # Semantic similarity match
            if not best_match:
                for candidate_skill in candidate_skills:
                    similarity = self.calculate_skill_similarity(required_skill, candidate_skill)
                    if similarity > best_similarity and similarity >= 0.7:
                        best_match = candidate_skill
                        best_similarity = similarity
            
            # Categorize match
            if best_similarity >= 0.9:
                matched_skills.append(required_skill)
            elif best_similarity >= 0.7:
                partial_skills.append(required_skill)
            else:
                missing_skills.append(required_skill)
        
        # Calculate skill match percentage
        total_required = len(required_skills)
        skill_match_percentage = (len(matched_skills) / total_required * 100) if total_required > 0 else 0
        
        # Step 3: Skill depth detection
        skill_depth = self.detect_skill_depth(resume_text, candidate_skills)
        
        # Step 4: Role-based skill weighting
        skill_weights = self.calculate_role_based_weights(jd_text, required_skills)
        
        # Calculate weighted match score
        weighted_match_score = self.calculate_weighted_match_score(matched_skills, skill_weights)
        
        # Step 5: Risk factor detection
        candidate_profile = {"projects": [], "domains": [], "skills": candidate_skills}
        job_analysis = {"role": jd_text[:200]}  # First 200 chars for role detection
        skill_analysis = {
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "partial_skills": partial_skills,
            "skill_match_percentage": skill_match_percentage
        }
        
        risk_factors = self.detect_risk_factors(resume_text, candidate_profile, job_analysis, skill_analysis)
        
        # Step 6: Return structured JSON
        return {
            "skills": {
                "matched": matched_skills,
                "missing": missing_skills,
                "partial": partial_skills,
                "skill_match_percentage": round(skill_match_percentage, 1)
            },
            "skill_depth": skill_depth,
            "skill_weights": skill_weights,
            "weighted_match_score": round(weighted_match_score, 1),
            "risk_factors": risk_factors
        }
    
    def _check_synonym_match(self, skill1: str, skill2: str) -> bool:
        """Check if two skills are synonyms"""
        skill1_lower = skill1.lower()
        skill2_lower = skill2.lower()
        
        for main_skill, synonyms in self.skill_synonyms.items():
            if skill1_lower == main_skill or skill1_lower in synonyms:
                if skill2_lower == main_skill or skill2_lower in synonyms:
                    return True
        return False
    
    def analyze_skills(self, candidate_skills: List[str], required_skills: List[str]) -> Dict[str, Any]:
        """Analyze skill match between candidate and job requirements"""
        matched_skills = []
        missing_skills = []
        partial_skills = []
        
        # Normalize skills
        candidate_skills_norm = [skill.lower().strip() for skill in candidate_skills]
        required_skills_norm = [skill.lower().strip() for skill in required_skills]
        
        for req_skill in required_skills_norm:
            best_match = None
            best_similarity = 0.0
            
            for cand_skill in candidate_skills_norm:
                # Exact match
                if req_skill == cand_skill:
                    matched_skills.append(req_skill)
                    best_match = cand_skill
                    break
                
                # Synonym match
                if req_skill in self.skill_synonyms:
                    if cand_skill in [s.lower() for s in self.skill_synonyms[req_skill]]:
                        matched_skills.append(req_skill)
                        best_match = cand_skill
                        break
                
                # Semantic similarity
                similarity = self.calculate_skill_similarity(req_skill, cand_skill)
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = cand_skill
            
            if best_match is None:
                missing_skills.append(req_skill)
            elif best_match not in [s.lower() for s in matched_skills] and best_similarity > 0.7:
                partial_skills.append(req_skill)
            elif best_match is None or best_similarity < 0.5:
                missing_skills.append(req_skill)
        
        # Calculate match percentage
        total_required = len(required_skills_norm)
        matched_count = len(matched_skills) + (len(partial_skills) * 0.5)
        skill_match_percentage = (matched_count / total_required * 100) if total_required > 0 else 0
        
        return {
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "partial_skills": partial_skills,
            "skill_match_percentage": round(skill_match_percentage, 1)
        }
    
    def generate_gap_intelligence(self, missing_skills: List[str], partial_skills: List[str], 
                                job_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate detailed gap intelligence for each missing/partial skill"""
        gap_intelligence = []
        
        # Process missing skills
        for skill in missing_skills:
            gap_info = self._analyze_skill_gap(skill, "missing", job_analysis)
            gap_intelligence.append(gap_info)
        
        # Process partial skills
        for skill in partial_skills:
            gap_info = self._analyze_skill_gap(skill, "partial", job_analysis)
            gap_intelligence.append(gap_info)
        
        return gap_intelligence
    
    def _analyze_skill_gap(self, skill: str, gap_type: str, job_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze individual skill gap"""
        # Determine skill category
        skill_category = self._categorize_skill(skill)
        
        # Determine importance based on job requirements
        importance = self._determine_importance(skill, job_analysis)
        
        # Find dependencies
        dependencies = self._find_skill_dependencies(skill)
        
        # Determine expected depth
        expected_depth = self._determine_expected_depth(skill, job_analysis)
        
        return {
            "skill": skill,
            "importance_level": importance,
            "skill_type": skill_category,
            "dependency_skills": dependencies,
            "related_resume_gap": f"{'Missing' if gap_type == 'missing' else 'Partial knowledge of'} {skill}",
            "expected_depth": expected_depth
        }
    
    def _categorize_skill(self, skill: str) -> str:
        """Categorize skill type"""
        skill_lower = skill.lower()
        
        for category, skills in self.skill_taxonomy.items():
            if skill_lower in [s.lower() for s in skills]:
                if category == "programming_languages":
                    return "core"
                elif category in ["web_technologies", "databases", "cloud_platforms"]:
                    return "tool"
                elif category == "data_science":
                    return "framework"
                else:
                    return "concept"
        
        return "tool"  # default
    
    def _determine_importance(self, skill: str, job_analysis: Dict[str, Any]) -> str:
        """Determine skill importance based on job context"""
        skill_lower = skill.lower()
        
        # Check if skill appears in tech stack (high importance)
        tech_stack = [s.lower() for s in job_analysis.get("tech_stack", [])]
        if skill_lower in tech_stack:
            return "High"
        
        # Check if it's a core programming language
        if skill_lower in [s.lower() for s in self.skill_taxonomy["programming_languages"]]:
            return "High"
        
        # Check if it's a framework/tool
        if skill_lower in [s.lower() for s in self.skill_taxonomy["web_technologies"]]:
            return "Medium"
        
        return "Low"
    
    def _find_skill_dependencies(self, skill: str) -> List[str]:
        """Find prerequisite skills"""
        dependencies_map = {
            "react": ["javascript", "html", "css"],
            "angular": ["typescript", "javascript", "html", "css"],
            "vue": ["javascript", "html", "css"],
            "django": ["python"],
            "flask": ["python"],
            "spring": ["java"],
            "tensorflow": ["python", "machine learning"],
            "pytorch": ["python", "machine learning"],
            "kubernetes": ["docker"],
            "aws": ["cloud computing"],
            "azure": ["cloud computing"],
            "gcp": ["cloud computing"]
        }
        
        return dependencies_map.get(skill.lower(), [])
    
    def _determine_expected_depth(self, skill: str, job_analysis: Dict[str, Any]) -> str:
        """Determine expected skill depth based on job requirements"""
        experience_required = job_analysis.get("experience_required", "").lower()
        
        if "senior" in experience_required or "lead" in experience_required:
            return "advanced"
        elif "mid" in experience_required or "intermediate" in experience_required:
            return "intermediate"
        else:
            return "basic"
    
    def evaluate_candidate(self, candidate_profile: Dict[str, Any], 
                         job_analysis: Dict[str, Any], 
                         skill_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate overall candidate evaluation"""
        
        # Calculate match score based on multiple factors
        skill_score = skill_analysis["skill_match_percentage"]
        experience_score = self._calculate_experience_score(candidate_profile, job_analysis)
        domain_score = self._calculate_domain_score(candidate_profile, job_analysis)
        
        # Weighted average
        match_score = (skill_score * 0.5 + experience_score * 0.3 + domain_score * 0.2)
        
        # Generate strengths and weaknesses
        strengths = self._identify_strengths(candidate_profile, skill_analysis)
        weaknesses = self._identify_weaknesses(skill_analysis)
        risk_factors = self._identify_risk_factors(candidate_profile, job_analysis, skill_analysis)
        
        return {
            "match_score": round(match_score, 1),
            "strengths": strengths,
            "weaknesses": weaknesses,
            "risk_factors": risk_factors
        }
    
    def _calculate_experience_score(self, candidate_profile: Dict[str, Any], 
                                  job_analysis: Dict[str, Any]) -> float:
        """Calculate experience match score"""
        candidate_exp = candidate_profile.get("experience", "").lower()
        required_exp = job_analysis.get("experience_required", "").lower()
        
        # Simple heuristic - can be enhanced with more sophisticated parsing
        if "senior" in required_exp and "senior" in candidate_exp:
            return 90.0
        elif "mid" in required_exp and ("mid" in candidate_exp or "senior" in candidate_exp):
            return 85.0
        elif "junior" in required_exp:
            return 80.0
        else:
            return 60.0
    
    def _calculate_domain_score(self, candidate_profile: Dict[str, Any], 
                              job_analysis: Dict[str, Any]) -> float:
        """Calculate domain match score"""
        candidate_domains = [d.lower() for d in candidate_profile.get("domains", [])]
        job_domains = [d.lower() for d in job_analysis.get("domains", [])]
        
        if not job_domains:
            return 70.0
        
        matches = sum(1 for domain in job_domains if domain in candidate_domains)
        return (matches / len(job_domains)) * 100
    
    def _identify_strengths(self, candidate_profile: Dict[str, Any], 
                          skill_analysis: Dict[str, Any]) -> List[str]:
        """Identify candidate strengths"""
        strengths = []
        
        if skill_analysis["skill_match_percentage"] > 70:
            strengths.append("Strong technical skill alignment")
        
        if len(candidate_profile.get("projects", [])) > 3:
            strengths.append("Extensive project experience")
        
        if len(skill_analysis["matched_skills"]) > 5:
            strengths.append("Diverse technical skill set")
        
        return strengths
    
    def _identify_weaknesses(self, skill_analysis: Dict[str, Any]) -> List[str]:
        """Identify candidate weaknesses"""
        weaknesses = []
        
        if skill_analysis["skill_match_percentage"] < 50:
            weaknesses.append("Significant skill gaps in required technologies")
        
        if len(skill_analysis["missing_skills"]) > 5:
            weaknesses.append("Multiple missing critical skills")
        
        return weaknesses
    
    def _identify_risk_factors(self, candidate_profile: Dict[str, Any], 
                             job_analysis: Dict[str, Any], 
                             skill_analysis: Dict[str, Any]) -> List[str]:
        """Identify potential risk factors"""
        risks = []
        
        if skill_analysis["skill_match_percentage"] < 40:
            risks.append("Low skill match may require extensive training")
        
        if len(skill_analysis["missing_skills"]) > 7:
            risks.append("High number of missing skills may impact productivity")
        
        return risks