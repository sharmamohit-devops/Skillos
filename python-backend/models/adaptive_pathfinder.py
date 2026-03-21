import json
import numpy as np
from typing import List, Dict, Any, Tuple
import networkx as nx
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class AdaptivePathfinder:
    """
    Graph-based adaptive learning pathway generator using Knowledge Tracing
    and personalized curriculum sequencing algorithms
    """
    
    def __init__(self):
        self.skill_graph = self._build_skill_dependency_graph()
        self.learning_modules = self._load_learning_modules()
        self.time_estimator = self._load_time_estimator()
        
        logger.info("AdaptivePathfinder initialized with skill dependency graph")
    
    def _build_skill_dependency_graph(self) -> nx.DiGraph:
        """Build directed graph of skill dependencies"""
        G = nx.DiGraph()
        
        # Define skill dependencies based on domain knowledge
        dependencies = {
            # Web Development Path
            "html": [],
            "css": ["html"],
            "javascript": ["html", "css"],
            "typescript": ["javascript"],
            "react": ["javascript", "html", "css"],
            "angular": ["typescript", "html", "css"],
            "vue": ["javascript", "html", "css"],
            "node.js": ["javascript"],
            "express": ["node.js"],
            
            # Backend Development
            "python": [],
            "java": [],
            "sql": [],
            "django": ["python", "sql"],
            "flask": ["python"],
            "spring": ["java"],
            
            # Database
            "mysql": ["sql"],
            "postgresql": ["sql"],
            "mongodb": [],
            
            # Cloud & DevOps
            "docker": [],
            "kubernetes": ["docker"],
            "aws": [],
            "azure": [],
            "gcp": [],
            
            # Data Science
            "statistics": [],
            "machine learning": ["python", "statistics"],
            "deep learning": ["machine learning", "python"],
            "tensorflow": ["python", "machine learning"],
            "pytorch": ["python", "machine learning"],
            "pandas": ["python"],
            "numpy": ["python"],
            "scikit-learn": ["python", "machine learning"],
            
            # Version Control & Tools
            "git": [],
            "github": ["git"],
            "gitlab": ["git"],
            
            # Testing
            "unit testing": [],
            "integration testing": ["unit testing"],
            "test automation": ["unit testing"]
        }
        
        # Add nodes and edges
        for skill, prereqs in dependencies.items():
            G.add_node(skill)
            for prereq in prereqs:
                G.add_edge(prereq, skill)
        
        return G
    
    def _load_learning_modules(self) -> Dict[str, Dict[str, Any]]:
        """Load learning modules with metadata"""
        return {
            "html": {
                "title": "HTML Fundamentals",
                "description": "Learn HTML structure, elements, and semantic markup",
                "duration_hours": 8,
                "difficulty": "beginner",
                "resources": ["MDN HTML Guide", "HTML5 Tutorial", "Practice Projects"],
                "projects": ["Personal Portfolio Page", "Landing Page"]
            },
            "css": {
                "title": "CSS Styling & Layout",
                "description": "Master CSS selectors, flexbox, grid, and responsive design",
                "duration_hours": 12,
                "difficulty": "beginner",
                "resources": ["CSS Grid Guide", "Flexbox Tutorial", "Responsive Design"],
                "projects": ["Responsive Website", "CSS Art Project"]
            },
            "javascript": {
                "title": "JavaScript Programming",
                "description": "Learn JS fundamentals, DOM manipulation, and ES6+ features",
                "duration_hours": 20,
                "difficulty": "intermediate",
                "resources": ["JavaScript.info", "MDN JavaScript", "ES6 Features"],
                "projects": ["Interactive Calculator", "Todo App", "Weather App"]
            },
            "react": {
                "title": "React Development",
                "description": "Build modern web apps with React hooks and state management",
                "duration_hours": 25,
                "difficulty": "intermediate",
                "resources": ["React Docs", "React Hooks Guide", "State Management"],
                "projects": ["E-commerce App", "Social Media Dashboard", "Blog Platform"]
            },
            "python": {
                "title": "Python Programming",
                "description": "Learn Python syntax, data structures, and OOP concepts",
                "duration_hours": 18,
                "difficulty": "beginner",
                "resources": ["Python.org Tutorial", "Automate Boring Stuff", "Python OOP"],
                "projects": ["Data Analysis Script", "Web Scraper", "API Client"]
            },
            "machine learning": {
                "title": "Machine Learning Fundamentals",
                "description": "Understand ML algorithms, model training, and evaluation",
                "duration_hours": 30,
                "difficulty": "advanced",
                "resources": ["Scikit-learn Docs", "ML Course", "Kaggle Learn"],
                "projects": ["Prediction Model", "Classification System", "Recommendation Engine"]
            },
            "docker": {
                "title": "Docker Containerization",
                "description": "Learn containerization, Docker images, and orchestration",
                "duration_hours": 15,
                "difficulty": "intermediate",
                "resources": ["Docker Docs", "Container Tutorial", "Best Practices"],
                "projects": ["Containerized App", "Multi-service Setup", "CI/CD Pipeline"]
            },
            "sql": {
                "title": "SQL Database Management",
                "description": "Master SQL queries, database design, and optimization",
                "duration_hours": 16,
                "difficulty": "intermediate",
                "resources": ["SQL Tutorial", "Database Design", "Query Optimization"],
                "projects": ["Database Schema", "Analytics Dashboard", "Data Migration"]
            }
        }
    
    def _load_time_estimator(self) -> Dict[str, int]:
        """Load time estimation model based on skill complexity"""
        return {
            "beginner": 1.0,
            "intermediate": 1.5,
            "advanced": 2.0
        }
    
    def generate_roadmap_context(self, candidate_profile: Dict[str, Any], 
                               job_analysis: Dict[str, Any], 
                               gap_intelligence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate context for roadmap creation"""
        
        # Analyze learning preferences based on candidate background
        preferred_domains = self._infer_learning_domains(candidate_profile, gap_intelligence)
        
        # Determine project complexity based on experience
        complexity_level = self._determine_complexity_level(candidate_profile)
        
        # Suggest project types based on job requirements
        project_types = self._suggest_project_types(job_analysis, gap_intelligence)
        
        # Recommend toolchain based on missing skills
        toolchain = self._recommend_toolchain(gap_intelligence, job_analysis)
        
        return {
            "preferred_learning_domains": preferred_domains,
            "project_complexity_level": complexity_level,
            "suggested_project_types": project_types,
            "toolchain_recommendations": toolchain
        }
    
    def generate_pathway(self, candidate_profile: Dict[str, Any], 
                        job_analysis: Dict[str, Any], 
                        gap_intelligence: List[Dict[str, Any]], 
                        roadmap_context: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Generate adaptive learning pathway using graph-based algorithm
        Returns: (pathway, reasoning_trace)
        """
        reasoning_trace = []
        reasoning_trace.append("Starting adaptive pathway generation...")
        
        # Extract skills to learn
        skills_to_learn = [gap["skill"] for gap in gap_intelligence 
                          if gap["importance_level"] in ["High", "Medium"]]
        
        reasoning_trace.append(f"Identified {len(skills_to_learn)} priority skills to learn")
        
        # Apply topological sorting for dependency resolution
        learning_sequence = self._resolve_dependencies(skills_to_learn)
        reasoning_trace.append(f"Resolved dependencies, learning sequence: {learning_sequence}")
        
        # Generate learning modules
        pathway = []
        total_time = 0
        
        for i, skill in enumerate(learning_sequence):
            if skill in self.learning_modules:
                module = self._create_learning_module(
                    skill, gap_intelligence, roadmap_context, i + 1
                )
                pathway.append(module)
                total_time += module["estimated_hours"]
                
                reasoning_trace.append(
                    f"Added module {i+1}: {skill} ({module['estimated_hours']} hours)"
                )
        
        # Add capstone project
        capstone = self._create_capstone_project(job_analysis, roadmap_context, len(pathway) + 1)
        pathway.append(capstone)
        total_time += capstone["estimated_hours"]
        
        reasoning_trace.append(f"Added capstone project ({capstone['estimated_hours']} hours)")
        reasoning_trace.append(f"Total estimated learning time: {total_time} hours")
        
        return pathway, reasoning_trace
    
    def _resolve_dependencies(self, skills: List[str]) -> List[str]:
        """Resolve skill dependencies using topological sort"""
        subgraph = self.skill_graph.subgraph(
            [skill for skill in skills if skill in self.skill_graph.nodes()]
        )
        
        # Add missing prerequisite skills
        all_prereqs = set()
        for skill in skills:
            if skill in self.skill_graph:
                prereqs = nx.ancestors(self.skill_graph, skill)
                all_prereqs.update(prereqs)
        
        # Include important prerequisites
        extended_skills = list(set(skills) | all_prereqs)
        extended_subgraph = self.skill_graph.subgraph(extended_skills)
        
        try:
            return list(nx.topological_sort(extended_subgraph))
        except nx.NetworkXError:
            # Fallback if graph has cycles
            return skills
    
    def _create_learning_module(self, skill: str, gap_intelligence: List[Dict[str, Any]], 
                              roadmap_context: Dict[str, Any], sequence: int) -> Dict[str, Any]:
        """Create a learning module for a specific skill"""
        
        # Find gap info for this skill
        gap_info = next((gap for gap in gap_intelligence if gap["skill"] == skill), None)
        
        # Get base module info
        base_module = self.learning_modules.get(skill, {
            "title": f"Learn {skill.title()}",
            "description": f"Master {skill} fundamentals and practical applications",
            "duration_hours": 10,
            "difficulty": "intermediate",
            "resources": [f"{skill.title()} Documentation", "Online Tutorials"],
            "projects": [f"{skill.title()} Practice Project"]
        })
        
        # Adjust duration based on expected depth
        duration_multiplier = 1.0
        if gap_info:
            if gap_info["expected_depth"] == "advanced":
                duration_multiplier = 1.5
            elif gap_info["expected_depth"] == "basic":
                duration_multiplier = 0.7
        
        estimated_hours = int(base_module["duration_hours"] * duration_multiplier)
        
        # Calculate time commitment
        time_commitment = self._calculate_time_commitment(estimated_hours)
        
        return {
            "sequence": sequence,
            "skill": skill,
            "title": base_module["title"],
            "description": base_module["description"],
            "importance_level": gap_info["importance_level"] if gap_info else "Medium",
            "expected_depth": gap_info["expected_depth"] if gap_info else "intermediate",
            "estimated_hours": estimated_hours,
            "time_commitment": time_commitment,
            "difficulty": base_module["difficulty"],
            "prerequisites": gap_info["dependency_skills"] if gap_info else [],
            "learning_resources": base_module["resources"],
            "practice_projects": base_module["projects"],
            "assessment_criteria": self._generate_assessment_criteria(skill, gap_info),
            "status": "not_started"
        }
    
    def _create_capstone_project(self, job_analysis: Dict[str, Any], 
                               roadmap_context: Dict[str, Any], sequence: int) -> Dict[str, Any]:
        """Create a capstone project that integrates learned skills"""
        
        role = job_analysis.get("role", "Software Developer")
        project_types = roadmap_context.get("suggested_project_types", ["Web Application"])
        
        return {
            "sequence": sequence,
            "skill": "capstone_project",
            "title": f"{role} Capstone Project",
            "description": f"Build a comprehensive project that demonstrates skills for {role} role",
            "importance_level": "High",
            "expected_depth": "advanced",
            "estimated_hours": 40,
            "time_commitment": self._calculate_time_commitment(40),
            "difficulty": "advanced",
            "prerequisites": [],
            "learning_resources": [
                "Project Planning Guide",
                "Best Practices Documentation",
                "Code Review Checklist"
            ],
            "practice_projects": project_types[:2],
            "assessment_criteria": [
                "Code quality and organization",
                "Feature completeness",
                "User experience design",
                "Technical documentation",
                "Deployment and testing"
            ],
            "status": "not_started"
        }
    
    def _calculate_time_commitment(self, hours: int) -> Dict[str, Any]:
        """Calculate time commitment breakdown"""
        # Assume 10 hours per week study time
        weeks = max(1, hours // 10)
        hours_per_week = min(10, hours)
        
        return {
            "total_hours": hours,
            "estimated_weeks": weeks,
            "hours_per_week": hours_per_week,
            "daily_commitment": f"{hours_per_week // 5}-{hours_per_week // 3} hours/day"
        }
    
    def _generate_assessment_criteria(self, skill: str, gap_info: Dict[str, Any]) -> List[str]:
        """Generate assessment criteria for a skill"""
        base_criteria = [
            f"Demonstrate understanding of {skill} concepts",
            f"Complete hands-on {skill} exercises",
            f"Build a project using {skill}"
        ]
        
        if gap_info and gap_info["expected_depth"] == "advanced":
            base_criteria.extend([
                f"Optimize {skill} implementation for performance",
                f"Explain {skill} best practices and patterns"
            ])
        
        return base_criteria
    
    def _infer_learning_domains(self, candidate_profile: Dict[str, Any], 
                              gap_intelligence: List[Dict[str, Any]]) -> List[str]:
        """Infer preferred learning domains based on candidate background"""
        domains = set(candidate_profile.get("domains", []))
        
        # Add domains based on missing skills
        for gap in gap_intelligence:
            skill = gap["skill"].lower()
            if any(web_tech in skill for web_tech in ["html", "css", "javascript", "react"]):
                domains.add("Web Development")
            elif any(data_tech in skill for data_tech in ["python", "machine learning", "sql"]):
                domains.add("Data Science")
            elif any(cloud_tech in skill for cloud_tech in ["aws", "docker", "kubernetes"]):
                domains.add("Cloud Computing")
        
        return list(domains)
    
    def _determine_complexity_level(self, candidate_profile: Dict[str, Any]) -> str:
        """Determine appropriate project complexity level"""
        experience = candidate_profile.get("experience", "").lower()
        num_projects = len(candidate_profile.get("projects", []))
        
        if "senior" in experience or num_projects > 5:
            return "advanced"
        elif "mid" in experience or num_projects > 2:
            return "intermediate"
        else:
            return "beginner"
    
    def _suggest_project_types(self, job_analysis: Dict[str, Any], 
                             gap_intelligence: List[Dict[str, Any]]) -> List[str]:
        """Suggest project types based on job requirements"""
        role = job_analysis.get("role", "").lower()
        tech_stack = [tech.lower() for tech in job_analysis.get("tech_stack", [])]
        
        project_types = []
        
        if "frontend" in role or any(tech in tech_stack for tech in ["react", "angular", "vue"]):
            project_types.extend(["Single Page Application", "Responsive Website", "Interactive Dashboard"])
        
        if "backend" in role or any(tech in tech_stack for tech in ["python", "java", "node.js"]):
            project_types.extend(["REST API", "Microservice", "Database Application"])
        
        if "fullstack" in role or "full stack" in role:
            project_types.extend(["Full Stack Web Application", "E-commerce Platform", "Social Media App"])
        
        if "data" in role or any(tech in tech_stack for tech in ["python", "sql", "machine learning"]):
            project_types.extend(["Data Analysis Dashboard", "Prediction Model", "ETL Pipeline"])
        
        return project_types[:5] if project_types else ["Web Application", "API Service", "Data Project"]
    
    def _recommend_toolchain(self, gap_intelligence: List[Dict[str, Any]], 
                           job_analysis: Dict[str, Any]) -> List[str]:
        """Recommend development toolchain"""
        tools = set()
        
        # Add tools based on missing skills
        missing_skills = [gap["skill"].lower() for gap in gap_intelligence]
        
        if any(skill in missing_skills for skill in ["javascript", "react", "angular", "vue"]):
            tools.update(["VS Code", "Node.js", "npm/yarn", "Chrome DevTools"])
        
        if any(skill in missing_skills for skill in ["python", "django", "flask"]):
            tools.update(["PyCharm/VS Code", "pip", "virtual environment", "Jupyter Notebook"])
        
        if any(skill in missing_skills for skill in ["java", "spring"]):
            tools.update(["IntelliJ IDEA", "Maven/Gradle", "Spring Boot"])
        
        if any(skill in missing_skills for skill in ["docker", "kubernetes"]):
            tools.update(["Docker Desktop", "kubectl", "Minikube"])
        
        # Add version control (always recommended)
        tools.update(["Git", "GitHub/GitLab"])
        
        # Add testing tools
        tools.add("Testing Framework")
        
        return list(tools)[:8]  # Limit to 8 recommendations