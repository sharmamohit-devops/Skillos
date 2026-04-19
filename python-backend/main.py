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
            # Comprehensive keyword matching with skill categories
            resume_lower = resume_text.lower()
            jd_lower = jd_text.lower()
            
            # Expanded skill database with categories
            skill_categories = {
                'Programming Languages': [
                    'python', 'javascript', 'java', 'typescript', 'c++', 'c#', 'go', 'rust',
                    'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl'
                ],
                'Frontend': [
                    'react', 'angular', 'vue', 'html', 'css', 'sass', 'less', 'tailwind',
                    'bootstrap', 'jquery', 'webpack', 'vite', 'next.js', 'nuxt', 'svelte'
                ],
                'Backend': [
                    'node', 'express', 'django', 'flask', 'spring', 'laravel', 'fastapi',
                    'nest.js', 'rails', 'asp.net', 'graphql', 'rest', 'api', 'microservices'
                ],
                'Databases': [
                    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'cassandra',
                    'dynamodb', 'elasticsearch', 'sqlite', 'mariadb', 'neo4j'
                ],
                'Cloud & DevOps': [
                    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd',
                    'terraform', 'ansible', 'gitlab', 'circleci', 'travis', 'helm', 'nginx'
                ],
                'Tools & Others': [
                    'git', 'github', 'linux', 'windows', 'agile', 'scrum', 'jira',
                    'confluence', 'postman', 'swagger', 'figma', 'sketch'
                ],
                'Data & AI': [
                    'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'keras',
                    'spark', 'hadoop', 'tableau', 'power bi', 'machine learning', 'deep learning'
                ]
            }
            
            matched = []
            missing = []
            partial = []
            skill_depth_map = {}
            skill_importance = {}
            
            # Analyze each skill category
            for category, skills in skill_categories.items():
                for skill in skills:
                    in_resume = skill in resume_lower
                    in_jd = skill in jd_lower
                    
                    if in_resume and in_jd:
                        matched.append(skill)
                        # Determine depth based on context
                        if any(word in resume_lower for word in [f'expert {skill}', f'advanced {skill}', f'senior {skill}']):
                            skill_depth_map[skill] = 'advanced'
                        elif any(word in resume_lower for word in [f'{skill} experience', f'worked with {skill}', f'proficient {skill}']):
                            skill_depth_map[skill] = 'intermediate'
                        else:
                            skill_depth_map[skill] = 'beginner'
                        
                        # Determine importance from JD
                        if any(word in jd_lower for word in [f'required {skill}', f'must have {skill}', f'essential {skill}']):
                            skill_importance[skill] = 'Critical'
                        elif any(word in jd_lower for word in [f'preferred {skill}', f'strong {skill}', f'experience with {skill}']):
                            skill_importance[skill] = 'High'
                        else:
                            skill_importance[skill] = 'Medium'
                    
                    elif in_jd and not in_resume:
                        missing.append(skill)
                        # Determine importance for missing skills
                        if any(word in jd_lower for word in [f'required {skill}', f'must have {skill}', f'essential {skill}']):
                            skill_importance[skill] = 'Critical'
                        elif any(word in jd_lower for word in [f'preferred {skill}', f'nice to have {skill}']):
                            skill_importance[skill] = 'Medium'
                        else:
                            skill_importance[skill] = 'High'
            
            # If no matches found, add default skills from JD
            if not matched and not missing:
                default_skills = ['python', 'javascript', 'react', 'node', 'sql', 'docker', 'aws', 'git']
                for skill in default_skills:
                    if skill in jd_lower:
                        missing.append(skill)
                        skill_importance[skill] = 'High'
            
            # Calculate match percentage
            total = len(matched) + len(missing)
            skill_match_pct = (len(matched) / total * 100) if total > 0 else 0
            
            # Create weighted skill list with importance
            skill_weights = []
            for skill in matched:
                skill_weights.append({
                    "skill": skill.title(),
                    "importance": skill_importance.get(skill, 'Medium'),
                    "status": "matched",
                    "depth": skill_depth_map.get(skill, 'intermediate')
                })
            
            for skill in missing:
                skill_weights.append({
                    "skill": skill.title(),
                    "importance": skill_importance.get(skill, 'High'),
                    "status": "missing",
                    "depth": "required"
                })
            
            # Sort by importance
            importance_order = {'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3}
            skill_weights.sort(key=lambda x: importance_order.get(x['importance'], 2))
            
            # Calculate weighted match score (critical skills have more weight)
            if skill_weights:
                total_weight = 0
                matched_weight = 0
                for sw in skill_weights:
                    weight = 3 if sw['importance'] == 'Critical' else 2 if sw['importance'] == 'High' else 1
                    total_weight += weight
                    if sw['status'] == 'matched':
                        matched_weight += weight
                weighted_match_score = (matched_weight / total_weight * 100) if total_weight > 0 else 0
            else:
                weighted_match_score = skill_match_pct
            
            # Generate detailed risk factors
            risk_factors = []
            critical_missing = [s for s in skill_weights if s['status'] == 'missing' and s['importance'] == 'Critical']
            high_missing = [s for s in skill_weights if s['status'] == 'missing' and s['importance'] == 'High']
            
            if critical_missing:
                risk_factors.append(f"⚠ Missing {len(critical_missing)} CRITICAL skills: {', '.join([s['skill'] for s in critical_missing[:3]])}")
            
            if len(high_missing) > 5:
                risk_factors.append(f"⚠ {len(high_missing)} high-priority skills need development")
            
            if skill_match_pct < 30:
                risk_factors.append("⚠ Low skill alignment - extensive training required (4-6 months)")
            elif skill_match_pct < 50:
                risk_factors.append("⚠ Moderate skill gaps - structured learning path needed (2-3 months)")
            
            if not risk_factors and skill_match_pct >= 70:
                risk_factors.append("✓ Strong skill match - minimal training required")
            
            return {
                "skills": {
                    "matched_skills": matched,
                    "missing_skills": missing,
                    "partial_skills": partial,
                    "skill_match_percentage": skill_match_pct
                },
                "skill_depth": skill_depth_map,
                "skill_weights": skill_weights,
                "weighted_match_score": weighted_match_score,
                "risk_factors": risk_factors,
                "skill_categories": {
                    "matched_by_category": self._categorize_skills(matched, skill_categories),
                    "missing_by_category": self._categorize_skills(missing, skill_categories)
                }
            }
        
        def _categorize_skills(self, skills, skill_categories):
            """Helper to categorize skills"""
            categorized = {}
            for category, category_skills in skill_categories.items():
                matched_in_category = [s for s in skills if s in category_skills]
                if matched_in_category:
                    categorized[category] = matched_in_category
            return categorized
        
        def generate_gap_intelligence(self, missing_skills, partial_skills, job_analysis):
            gaps = []
            
            # Add missing skills
            for skill in missing_skills:
                gaps.append({
                    "skill": skill, 
                    "importance_level": "High", 
                    "skill_type": "tool", 
                    "dependency_skills": [], 
                    "related_resume_gap": f"Missing {skill}", 
                    "expected_depth": "intermediate"
                })
            
            # Add partial skills
            for skill in partial_skills:
                gaps.append({
                    "skill": skill, 
                    "importance_level": "Medium", 
                    "skill_type": "tool", 
                    "dependency_skills": [], 
                    "related_resume_gap": f"Partial knowledge of {skill}", 
                    "expected_depth": "intermediate"
                })
            
            # If no gaps found, create some default ones from job analysis
            if not gaps and 'required_skills' in job_analysis:
                for skill in job_analysis['required_skills'][:10]:
                    gaps.append({
                        "skill": skill,
                        "importance_level": "Medium",
                        "skill_type": "tool",
                        "dependency_skills": [],
                        "related_resume_gap": f"Need to learn {skill}",
                        "expected_depth": "intermediate"
                    })
            
            return gaps
        
        def evaluate_candidate(self, candidate_profile, job_analysis, skill_analysis):
            match_score = skill_analysis["skill_match_percentage"]
            matched_skills = skill_analysis.get("matched_skills", [])
            missing_skills = skill_analysis.get("missing_skills", [])
            matched_count = len(matched_skills)
            missing_count = len(missing_skills)
            
            # Generate VERY detailed strengths (10-15 points with specific examples)
            strengths = []
            matched_skills_str = ' '.join(matched_skills).lower()
            
            # Core programming strengths with details
            prog_langs = [s for s in ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust'] if s in matched_skills_str]
            if prog_langs:
                strengths.append(f"✓ Strong programming foundation with {len(prog_langs)} language{'s' if len(prog_langs) > 1 else ''}: {', '.join([s.title() for s in prog_langs[:3]])} - can adapt to new codebases quickly")
                if 'python' in prog_langs:
                    strengths.append("✓ Python expertise enables rapid prototyping, data analysis, and backend development")
                if 'javascript' in prog_langs or 'typescript' in prog_langs:
                    strengths.append("✓ JavaScript/TypeScript skills allow full-stack development and modern web applications")
            
            # Frontend skills with specific benefits
            frontend = [s for s in ['react', 'angular', 'vue', 'html', 'css', 'typescript'] if s in matched_skills_str]
            if frontend:
                strengths.append(f"✓ Modern frontend development skills with {', '.join([s.title() for s in frontend[:2]])} - can build responsive, user-friendly interfaces")
                if 'react' in frontend:
                    strengths.append("✓ React experience means familiarity with component-based architecture and modern UI patterns")
            
            # Backend skills with architecture knowledge
            backend = [s for s in ['node', 'express', 'django', 'flask', 'spring', 'laravel'] if s in matched_skills_str]
            if backend:
                strengths.append(f"✓ Backend development experience with {', '.join([s.title() for s in backend[:2]])} - understands server-side logic and API design")
                if 'node' in backend or 'express' in backend:
                    strengths.append("✓ Node.js/Express knowledge enables building scalable, high-performance server applications")
            
            # Database skills with data management
            databases = [s for s in ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle'] if s in matched_skills_str]
            if databases:
                strengths.append(f"✓ Database management expertise with {', '.join([s.upper() if s == 'sql' else s.title() for s in databases[:2]])} - can design schemas and optimize queries")
                if 'sql' in databases or 'mysql' in databases or 'postgresql' in databases:
                    strengths.append("✓ Relational database skills ensure data integrity and efficient data retrieval")
                if 'mongodb' in databases:
                    strengths.append("✓ NoSQL experience with MongoDB provides flexibility for unstructured data")
            
            # Cloud & DevOps with deployment knowledge
            cloud = [s for s in ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd'] if s in matched_skills_str]
            if cloud:
                strengths.append(f"✓ Cloud and DevOps proficiency with {', '.join([s.upper() if len(s) <= 3 else s.title() for s in cloud[:3]])} - can deploy and maintain production systems")
                if 'docker' in cloud:
                    strengths.append("✓ Docker containerization skills enable consistent environments across development and production")
                if 'aws' in cloud or 'azure' in cloud or 'gcp' in cloud:
                    strengths.append("✓ Cloud platform experience reduces infrastructure costs and improves scalability")
            
            # Version control and collaboration
            if any(s in matched_skills_str for s in ['git', 'github', 'gitlab']):
                strengths.append("✓ Version control expertise with Git enables effective team collaboration and code management")
            
            # API development
            if any(s in matched_skills_str for s in ['api', 'rest', 'graphql']):
                strengths.append("✓ API design and integration skills facilitate building connected, modular applications")
            
            # Overall match quality with context
            if match_score >= 70:
                strengths.append(f"✓ Excellent skill alignment ({match_score:.0f}% match) - can start contributing immediately with minimal onboarding")
            elif match_score >= 50:
                strengths.append(f"✓ Good technical foundation ({match_score:.0f}% match) - ready to take on role with some guidance")
            elif match_score >= 30:
                strengths.append(f"✓ Moderate skill match ({match_score:.0f}%) - has transferable skills and learning potential")
            
            # Experience indicators with impact
            if candidate_profile.get('experience') and 'year' in str(candidate_profile['experience']).lower():
                strengths.append(f"✓ {candidate_profile['experience']} - brings practical industry knowledge and best practices")
            
            # Project experience with proof of work
            if candidate_profile.get('projects') and len(candidate_profile['projects']) > 0:
                proj_count = len(candidate_profile['projects'])
                strengths.append(f"✓ Demonstrated hands-on experience with {proj_count} documented project{'s' if proj_count > 1 else ''} - shows ability to deliver complete solutions")
            
            # Education with technical foundation
            if candidate_profile.get('education'):
                edu = candidate_profile['education']
                if any(word in edu.lower() for word in ['bachelor', 'master', 'b.tech', 'm.tech', 'degree']):
                    strengths.append(f"✓ Strong educational background in technology - solid theoretical foundation")
            
            # Ensure minimum strengths
            if not strengths:
                strengths = [
                    "✓ Technical background in software development",
                    "✓ Foundational programming knowledge",
                    "✓ Willingness to learn and adapt to new technologies"
                ]
            
            # Generate VERY detailed weaknesses (8-12 points with specific impacts)
            weaknesses = []
            missing_skills_str = ' '.join(missing_skills).lower()
            
            # Missing core technologies with impact
            missing_prog = [s for s in ['python', 'java', 'javascript', 'typescript'] if s in missing_skills_str]
            if missing_prog:
                weaknesses.append(f"✗ Limited experience with {', '.join([s.title() for s in missing_prog[:2]])} - critical for daily development tasks and team collaboration")
                if 'typescript' in missing_prog:
                    weaknesses.append("✗ No TypeScript experience may lead to runtime errors and reduced code quality in large codebases")
            
            # Missing frontend with user impact
            missing_frontend = [s for s in ['react', 'angular', 'vue'] if s in missing_skills_str]
            if missing_frontend:
                weaknesses.append(f"✗ No experience with modern frontend frameworks ({', '.join([s.title() for s in missing_frontend[:2]])}) - cannot build interactive user interfaces independently")
                if 'react' in missing_frontend:
                    weaknesses.append("✗ Missing React skills limits ability to work on most modern web applications and SPAs")
            
            # Missing backend with architecture impact
            missing_backend = [s for s in ['node', 'express', 'django', 'flask', 'spring'] if s in missing_skills_str]
            if missing_backend:
                weaknesses.append(f"✗ Backend framework knowledge gap: {', '.join([s.title() for s in missing_backend[:2]])} - will struggle with server-side development and API creation")
            
            # Missing databases with data management impact
            missing_db = [s for s in ['sql', 'mysql', 'postgresql', 'mongodb'] if s in missing_skills_str]
            if missing_db:
                weaknesses.append(f"✗ Database skills need development: {', '.join([s.upper() if s == 'sql' else s.title() for s in missing_db[:2]])} - may have difficulty with data modeling and query optimization")
                if 'sql' in missing_db:
                    weaknesses.append("✗ No SQL knowledge severely limits ability to work with relational databases and data analysis")
            
            # Missing cloud/DevOps with deployment impact
            missing_cloud = [s for s in ['aws', 'azure', 'docker', 'kubernetes', 'ci/cd'] if s in missing_skills_str]
            if missing_cloud:
                weaknesses.append(f"✗ Lacks modern DevOps and cloud infrastructure skills ({', '.join([s.upper() if len(s) <= 3 else s.title() for s in missing_cloud[:3]])}) - cannot deploy or maintain production systems")
                if 'docker' in missing_cloud:
                    weaknesses.append("✗ No Docker experience means difficulty with containerization and consistent development environments")
                if any(c in missing_cloud for c in ['aws', 'azure', 'gcp']):
                    weaknesses.append("✗ Missing cloud platform skills limits ability to build scalable, cost-effective solutions")
            
            # Missing API skills with integration impact
            if any(s in missing_skills_str for s in ['api', 'rest', 'graphql']):
                weaknesses.append("✗ Limited API development and integration experience - will struggle with building connected systems")
            
            # Overall gaps with timeline
            if missing_count > 8:
                weaknesses.append(f"✗ Significant skill gaps identified ({missing_count} missing skills) - requires 4-6 months of intensive training before full productivity")
            elif missing_count > 5:
                weaknesses.append(f"✗ Multiple skill gaps ({missing_count} skills) need to be addressed - expect 2-3 months ramp-up time")
            elif missing_count > 2:
                weaknesses.append(f"✗ Some key technologies ({missing_count} skills) require upskilling - 1-2 months focused learning needed")
            
            # Match score concerns with productivity impact
            if match_score < 30:
                weaknesses.append("✗ Low overall skill alignment - may struggle with immediate job requirements and need extensive mentorship")
            elif match_score < 50:
                weaknesses.append("✗ Moderate skill gaps may impact initial productivity and require structured onboarding program")
            
            # Ensure minimum weaknesses
            if not weaknesses:
                weaknesses = [
                    "✗ Some skill gaps identified for optimal performance",
                    "✗ Room for growth in emerging technologies"
                ]
            
            # Generate detailed risk factors (5-10 points with mitigation strategies)
            risk_factors = []
            
            if match_score < 25:
                risk_factors.append("⚠ CRITICAL RISK: Very low skill match (<25%) - candidate may not meet minimum requirements. Recommend extensive training program or consider other candidates.")
            elif match_score < 40:
                risk_factors.append("⚠ HIGH RISK: Low skill alignment - extensive onboarding and training needed (3-6 months). Budget for mentorship and reduced initial productivity.")
            elif match_score < 60:
                risk_factors.append("⚠ MODERATE RISK: Skill gaps present - structured training program recommended (1-3 months). Pair with senior developer for faster ramp-up.")
            
            if missing_count > 10:
                risk_factors.append(f"⚠ {missing_count} missing skills may significantly delay productivity and project timelines. Consider phased onboarding with focused skill development.")
            elif missing_count > 6:
                risk_factors.append(f"⚠ {missing_count} skill gaps require dedicated learning time and mentorship. Allocate 20-30% of work time for training in first 3 months.")
            
            # Critical skill gaps with business impact
            critical_missing = [s for s in missing_skills if s.lower() in ['python', 'javascript', 'react', 'node', 'sql', 'aws', 'docker']]
            if len(critical_missing) > 3:
                risk_factors.append(f"⚠ Missing {len(critical_missing)} critical skills ({', '.join(critical_missing[:3])}) that are essential for day-to-day work. May need to defer complex tasks initially.")
            
            # Experience concerns with supervision needs
            if not candidate_profile.get('experience') or 'year' not in str(candidate_profile.get('experience', '')).lower():
                risk_factors.append("⚠ Limited documented professional experience - may need additional supervision and code reviews. Consider junior-level responsibilities initially.")
            
            # Project portfolio with practical skills
            if not candidate_profile.get('projects') or len(candidate_profile.get('projects', [])) < 2:
                risk_factors.append("⚠ Limited project portfolio - practical experience unclear. Request coding assessment or trial project before final decision.")
            
            # Positive indicators (reduce risk)
            if match_score >= 70:
                risk_factors.append("✓ LOW RISK: Strong skill match indicates quick ramp-up time (1-2 weeks). Can start contributing to production code immediately.")
            elif match_score >= 50 and missing_count <= 5:
                risk_factors.append("✓ MANAGEABLE RISK: Core skills present, gaps can be filled with focused training (4-6 weeks). Good candidate with growth potential.")
            
            return {
                "match_score": round(match_score, 1),
                "strengths": strengths[:15],  # Up to 15 detailed strengths
                "weaknesses": weaknesses[:12],  # Up to 12 detailed weaknesses
                "risk_factors": risk_factors[:10]  # Up to 10 risk factors
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
            
            # If no gap intelligence, create pathway from missing skills
            if not gap_intelligence:
                missing_skills = []
                if 'required_skills' in job_analysis:
                    candidate_skills = set([s.lower() for s in candidate_profile.get('skills', [])])
                    for skill in job_analysis['required_skills'][:10]:
                        if skill.lower() not in candidate_skills:
                            missing_skills.append(skill)
                
                for skill in missing_skills:
                    gap_intelligence.append({
                        "skill": skill,
                        "importance_level": "High" if len(gap_intelligence) < 5 else "Medium",
                        "expected_depth": "intermediate"
                    })
            
            # Comprehensive skill-specific resources and projects
            skill_resources = {
                'python': {
                    'resources': [
                        'Python.org Official Tutorial - Complete beginner to advanced guide',
                        'Automate the Boring Stuff with Python - Practical automation projects',
                        'Real Python Tutorials - In-depth articles and video courses',
                        'Python Crash Course Book - Hands-on project-based learning',
                        'Codecademy Python Course - Interactive learning platform'
                    ],
                    'projects': [
                        'Build a Web Scraper with BeautifulSoup and Requests',
                        'Create a REST API with Flask/FastAPI',
                        'Data Analysis Dashboard with Pandas and Matplotlib',
                        'Automation Scripts for File Management',
                        'CLI Tool with argparse and rich library'
                    ],
                    'hours': 40,
                    'milestones': [
                        'Complete Python fundamentals (variables, loops, functions)',
                        'Master OOP concepts (classes, inheritance, polymorphism)',
                        'Build 3 portfolio projects',
                        'Contribute to open-source Python project'
                    ]
                },
                'javascript': {
                    'resources': [
                        'MDN Web Docs - Comprehensive JavaScript reference',
                        'JavaScript.info - Modern JavaScript tutorial',
                        'FreeCodeCamp JavaScript Course - Free interactive learning',
                        'Eloquent JavaScript Book - Deep dive into JS concepts',
                        'You Don\'t Know JS Book Series - Advanced JS patterns'
                    ],
                    'projects': [
                        'Interactive To-Do App with Local Storage',
                        'Weather Dashboard using OpenWeather API',
                        'Quiz Application with Timer and Score Tracking',
                        'Expense Tracker with Charts',
                        'Portfolio Website with Animations'
                    ],
                    'hours': 35,
                    'milestones': [
                        'Master ES6+ features (arrow functions, promises, async/await)',
                        'Understand DOM manipulation and event handling',
                        'Build 3 interactive web applications',
                        'Learn debugging with Chrome DevTools'
                    ]
                },
                'react': {
                    'resources': [
                        'React Official Docs - Best starting point',
                        'React Tutorial by Scrimba - Interactive video course',
                        'Full Stack Open - University of Helsinki course',
                        'Epic React by Kent C. Dodds - Advanced patterns',
                        'React Router and State Management guides'
                    ],
                    'projects': [
                        'E-commerce Product Catalog with Cart',
                        'Social Media Dashboard with Authentication',
                        'Movie Search App using TMDB API',
                        'Real-time Chat Application',
                        'Task Management Board (Trello clone)'
                    ],
                    'hours': 45,
                    'milestones': [
                        'Master React hooks (useState, useEffect, useContext)',
                        'Build reusable component library',
                        'Implement state management (Redux/Zustand)',
                        'Deploy production app to Vercel/Netlify'
                    ]
                },
                'node': {
                    'resources': [
                        'Node.js Official Docs - Core concepts and APIs',
                        'The Odin Project Node Course - Full-stack path',
                        'Node.js Best Practices - Production-ready patterns',
                        'Express.js Guide - Web framework mastery',
                        'Node.js Design Patterns Book'
                    ],
                    'projects': [
                        'RESTful API Server with Express and MongoDB',
                        'Real-time Chat App with Socket.io',
                        'Authentication System with JWT',
                        'File Upload Service with Multer',
                        'GraphQL API with Apollo Server'
                    ],
                    'hours': 40,
                    'milestones': [
                        'Build CRUD APIs with Express',
                        'Implement authentication and authorization',
                        'Master async programming and error handling',
                        'Deploy to production (AWS/Heroku)'
                    ]
                },
                'docker': {
                    'resources': [
                        'Docker Official Tutorial - Get started guide',
                        'Docker for Beginners - Hands-on labs',
                        'Play with Docker - Interactive playground',
                        'Docker Mastery Course - Complete containerization',
                        'Docker Compose Documentation'
                    ],
                    'projects': [
                        'Containerize a Full-Stack Web Application',
                        'Multi-container App with Docker Compose',
                        'CI/CD Pipeline with Docker',
                        'Microservices Architecture Setup',
                        'Development Environment with Docker'
                    ],
                    'hours': 25,
                    'milestones': [
                        'Create Dockerfiles for different applications',
                        'Master Docker Compose for multi-container apps',
                        'Optimize images for production',
                        'Implement container orchestration basics'
                    ]
                },
                'aws': {
                    'resources': [
                        'AWS Free Tier Tutorial - Hands-on practice',
                        'AWS Certified Cloud Practitioner Course',
                        'AWS Hands-on Labs - Practical exercises',
                        'A Cloud Guru AWS Courses',
                        'AWS Well-Architected Framework'
                    ],
                    'projects': [
                        'Deploy Web App on EC2 with Load Balancer',
                        'S3 Static Website with CloudFront CDN',
                        'Serverless API with Lambda and API Gateway',
                        'RDS Database Setup with Backup Strategy',
                        'CI/CD Pipeline with CodePipeline'
                    ],
                    'hours': 50,
                    'milestones': [
                        'Master core services (EC2, S3, RDS, Lambda)',
                        'Implement security best practices (IAM, VPC)',
                        'Build serverless application',
                        'Pass AWS Certified Cloud Practitioner exam'
                    ]
                },
                'sql': {
                    'resources': [
                        'SQLBolt Interactive Tutorial - Learn by doing',
                        'Mode SQL Tutorial - Analytics focused',
                        'PostgreSQL Tutorial - Advanced features',
                        'SQL for Data Analysis - Practical queries',
                        'Database Design Fundamentals'
                    ],
                    'projects': [
                        'Design E-commerce Database Schema',
                        'Complex Queries for Analytics Dashboard',
                        'Database Optimization and Indexing',
                        'Stored Procedures and Triggers',
                        'Data Migration Scripts'
                    ],
                    'hours': 30,
                    'milestones': [
                        'Master CRUD operations and JOINs',
                        'Write complex queries with subqueries and CTEs',
                        'Design normalized database schemas',
                        'Optimize query performance'
                    ]
                },
                'git': {
                    'resources': [
                        'Git Official Documentation - Complete reference',
                        'Learn Git Branching - Interactive visualization',
                        'GitHub Learning Lab - Hands-on courses',
                        'Pro Git Book - Deep dive into Git',
                        'Git Best Practices Guide'
                    ],
                    'projects': [
                        'Contribute to Open Source Projects',
                        'Team Collaboration Workflow Setup',
                        'Git Hooks for Automation',
                        'Branching Strategy Implementation',
                        'Code Review Process Setup'
                    ],
                    'hours': 20,
                    'milestones': [
                        'Master basic commands (commit, push, pull, merge)',
                        'Understand branching and merging strategies',
                        'Resolve merge conflicts confidently',
                        'Contribute to 3 open-source projects'
                    ]
                },
                'typescript': {
                    'resources': [
                        'TypeScript Official Handbook',
                        'TypeScript Deep Dive Book',
                        'Execute Program TypeScript Course',
                        'Total TypeScript by Matt Pocock',
                        'TypeScript Best Practices'
                    ],
                    'projects': [
                        'Type-safe REST API with Express',
                        'React App with TypeScript',
                        'CLI Tool with Type Safety',
                        'Library with Published Types',
                        'Full-stack TypeScript Application'
                    ],
                    'hours': 35,
                    'milestones': [
                        'Master type annotations and interfaces',
                        'Use generics and advanced types',
                        'Migrate JavaScript project to TypeScript',
                        'Build type-safe full-stack app'
                    ]
                },
                'mongodb': {
                    'resources': [
                        'MongoDB University - Free courses',
                        'MongoDB Official Documentation',
                        'MongoDB for Developers Course',
                        'NoSQL Database Design Patterns',
                        'Mongoose ODM Guide'
                    ],
                    'projects': [
                        'Blog Platform with MongoDB',
                        'Real-time Analytics Dashboard',
                        'User Management System',
                        'E-commerce Product Catalog',
                        'Social Media Backend'
                    ],
                    'hours': 30,
                    'milestones': [
                        'Master CRUD operations and queries',
                        'Design document schemas',
                        'Implement aggregation pipelines',
                        'Optimize database performance'
                    ]
                }
            }
            
            # Generate comprehensive pathway from gap intelligence
            for i, gap in enumerate(gap_intelligence[:12]):  # Up to 12 skills
                skill_lower = gap["skill"].lower()
                skill_data = skill_resources.get(skill_lower, {
                    'resources': [
                        f'{gap["skill"]} Official Documentation',
                        f'{gap["skill"]} Tutorial for Beginners',
                        f'Learn {gap["skill"]} - FreeCodeCamp',
                        f'{gap["skill"]} Crash Course - YouTube',
                        f'Practical {gap["skill"]} Projects'
                    ],
                    'projects': [
                        f'Build a Basic {gap["skill"]} Application',
                        f'{gap["skill"]} Portfolio Project',
                        f'Real-world {gap["skill"]} Implementation',
                        f'Advanced {gap["skill"]} Features'
                    ],
                    'hours': 30,
                    'milestones': [
                        f'Complete {gap["skill"]} fundamentals',
                        f'Build 2-3 {gap["skill"]} projects',
                        f'Pass {gap["skill"]} assessment',
                        f'Apply {gap["skill"]} in real project'
                    ]
                })
                
                estimated_hours = skill_data['hours']
                weeks = max(2, estimated_hours // 10)
                hours_per_week = estimated_hours // weeks
                
                pathway.append({
                    "sequence": i + 1,
                    "skill": gap["skill"],
                    "title": f"Master {gap['skill']}",
                    "description": f"Comprehensive learning path for {gap['skill']} - from fundamentals to production-ready skills. Build real-world projects and gain hands-on experience that employers value.",
                    "importance_level": gap.get("importance_level", "Medium"),
                    "expected_depth": gap.get("expected_depth", "intermediate"),
                    "estimated_hours": estimated_hours,
                    "time_commitment": {
                        "total_hours": estimated_hours,
                        "estimated_weeks": weeks,
                        "hours_per_week": hours_per_week,
                        "daily_commitment": f"{hours_per_week // 5}-{hours_per_week // 3} hours/day",
                        "flexible_schedule": f"Can be completed in {weeks}-{weeks*2} weeks depending on pace"
                    },
                    "difficulty": "beginner" if i < 2 else "intermediate" if i < 7 else "advanced",
                    "prerequisites": gap.get("dependency_skills", []),
                    "learning_resources": skill_data['resources'],
                    "practice_projects": skill_data['projects'],
                    "milestones": skill_data.get('milestones', [
                        f"Complete {gap['skill']} fundamentals course",
                        f"Build 2-3 projects using {gap['skill']}",
                        f"Pass {gap['skill']} assessment quiz",
                        f"Contribute to a {gap['skill']} project"
                    ]),
                    "assessment_criteria": [
                        f"✓ Understand core {gap['skill']} concepts",
                        f"✓ Build production-ready applications",
                        f"✓ Debug and troubleshoot effectively",
                        f"✓ Follow best practices and conventions",
                        f"✓ Explain concepts to others"
                    ],
                    "career_impact": f"Learning {gap['skill']} will significantly improve your job prospects and enable you to work on modern {gap.get('skill_type', 'technology')} projects.",
                    "status": "not_started",
                    "progress": 0
                })
            
            reasoning = [
                f"Generated comprehensive learning pathway for {len(pathway)} critical skills",
                f"Total estimated time: {sum(p['estimated_hours'] for p in pathway)} hours ({sum(p['estimated_hours'] for p in pathway)//40} weeks full-time)",
                f"Prioritized based on job requirements and skill importance",
                f"Included {sum(len(p['practice_projects']) for p in pathway)} hands-on projects",
                f"Structured progression from beginner to advanced topics"
            ]
            
            return pathway, reasoning
    
    class ResumeParser:
        def parse(self, resume_text):
            lines = [line.strip() for line in resume_text.split('\n') if line.strip()]
            
            # Better name extraction
            name = "Candidate"
            if lines:
                for line in lines[:5]:
                    if not any(word in line.lower() for word in ['email', 'phone', 'address', 'linkedin', 'github', '@', 'http']):
                        if 2 <= len(line.split()) <= 4 and len(line) > 2 and len(line) < 50:
                            name = line
                            break
                if name == "Candidate" and lines[0]:
                    name = lines[0][:50]
            
            # Extract skills comprehensively
            skills = []
            skill_keywords = [
                'python', 'javascript', 'react', 'node', 'java', 'sql', 'docker', 'aws', 'git', 
                'html', 'css', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'redis', 
                'kubernetes', 'jenkins', 'linux', 'windows', 'azure', 'gcp', 'django', 'flask',
                'express', 'spring', 'api', 'rest', 'graphql', 'microservices', 'ci/cd', 'devops',
                'mysql', 'oracle', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
                'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'tableau', 'power bi'
            ]
            
            resume_lower = resume_text.lower()
            for skill in skill_keywords:
                if skill in resume_lower:
                    skills.append(skill.title())
            
            # Extract from skill sections
            for line in lines:
                line_lower = line.lower()
                if any(word in line_lower for word in ['skill', 'technology', 'programming', 'languages', 'frameworks', 'tools']):
                    parts = [s.strip() for s in line.split(',') if 2 < len(s.strip()) < 20]
                    skills.extend(parts[:5])
            
            # Extract education
            education = "Education details extracted from resume"
            for line in lines:
                if any(word in line.lower() for word in ['university', 'college', 'degree', 'bachelor', 'master', 'b.tech', 'm.tech', 'bca', 'mca']):
                    education = line[:100]
                    break
            
            # Extract experience
            experience = "Professional experience extracted from resume"
            exp_years = 0
            for line in lines:
                if any(word in line.lower() for word in ['year', 'experience', 'worked', 'developer', 'engineer']):
                    import re
                    years = re.findall(r'(\d+)\s*(?:year|yr)', line.lower())
                    if years:
                        exp_years = max(exp_years, int(years[0]))
            if exp_years > 0:
                experience = f"{exp_years}+ years of professional experience"
            
            # Extract projects
            projects = []
            for i, line in enumerate(lines):
                if 'project' in line.lower() and i + 1 < len(lines):
                    projects.append(lines[i+1][:80])
            if not projects:
                projects = ["Project experience mentioned in resume"]
            
            return {
                "name": name,
                "education": education,
                "domains": ["Software Development", "Technology"],
                "skills": list(set(skills))[:20],
                "projects": projects[:3],
                "experience": experience
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
            skill_keywords = ['python', 'javascript', 'react', 'node', 'java', 'sql', 'docker', 'aws', 'git', 'html', 'css', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'redis', 'kubernetes', 'jenkins', 'linux', 'windows', 'azure', 'gcp', 'django', 'flask', 'express', 'spring', 'laravel', 'ruby', 'php', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin', 'api', 'rest', 'graphql', 'microservices', 'ci/cd', 'devops', 'agile', 'scrum']
            
            jd_lower = jd_text.lower()
            for skill in skill_keywords:
                if skill in jd_lower:
                    skills.append(skill.title())
            
            # If no skills found, add some common ones
            if not skills:
                skills = ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS']
            
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

class EnrichProfileRequest(BaseModel):
    resume_text: str
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

@app.post("/enrich-profile")
async def enrich_profile(request: EnrichProfileRequest):
    """
    Enrich resume analysis with GitHub and LinkedIn data
    Fetches repos, skills, and experience from external profiles
    """
    try:
        logger.info("Starting profile enrichment...")
        enriched_data = {
            "resume_text": request.resume_text,
            "github_data": None,
            "linkedin_data": None,
            "additional_skills": [],
            "projects": [],
            "total_experience_years": 0
        }
        
        # Fetch GitHub data
        if request.github_url:
            try:
                import re
                import urllib.request
                
                # Extract username from GitHub URL
                github_match = re.search(r'github\.com/([^/]+)', request.github_url)
                if github_match:
                    username = github_match.group(1)
                    logger.info(f"Fetching GitHub data for: {username}")
                    
                    # Fetch user data
                    try:
                        user_url = f"https://api.github.com/users/{username}"
                        req = urllib.request.Request(user_url, headers={'User-Agent': 'SkillOS-App'})
                        with urllib.request.urlopen(req, timeout=5) as response:
                            user_data = json.loads(response.read().decode())
                            
                            enriched_data["github_data"] = {
                                "username": user_data.get("login"),
                                "name": user_data.get("name"),
                                "bio": user_data.get("bio"),
                                "public_repos": user_data.get("public_repos", 0),
                                "followers": user_data.get("followers", 0),
                                "created_at": user_data.get("created_at")
                            }
                            
                            # Calculate years on GitHub
                            if user_data.get("created_at"):
                                from datetime import datetime
                                created = datetime.strptime(user_data["created_at"], "%Y-%m-%dT%H:%M:%SZ")
                                years = (datetime.now() - created).days // 365
                                enriched_data["total_experience_years"] = max(enriched_data["total_experience_years"], years)
                    except Exception as e:
                        logger.warning(f"Could not fetch GitHub user data: {e}")
                    
                    # Fetch repositories
                    try:
                        repos_url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=10"
                        req = urllib.request.Request(repos_url, headers={'User-Agent': 'SkillOS-App'})
                        with urllib.request.urlopen(req, timeout=5) as response:
                            repos = json.loads(response.read().decode())
                            
                            # Extract skills from repo languages
                            languages = set()
                            projects = []
                            
                            for repo in repos[:10]:
                                if repo.get("language"):
                                    languages.add(repo["language"])
                                
                                if not repo.get("fork"):  # Only original repos
                                    projects.append({
                                        "name": repo.get("name"),
                                        "description": repo.get("description", ""),
                                        "language": repo.get("language"),
                                        "stars": repo.get("stargazers_count", 0),
                                        "url": repo.get("html_url")
                                    })
                            
                            enriched_data["additional_skills"].extend(list(languages))
                            enriched_data["projects"] = projects
                            
                            logger.info(f"Found {len(languages)} languages and {len(projects)} projects on GitHub")
                    except Exception as e:
                        logger.warning(f"Could not fetch GitHub repos: {e}")
                        
            except Exception as e:
                logger.error(f"GitHub enrichment failed: {e}")
        
        # Fetch LinkedIn data (basic scraping - limited without API access)
        if request.linkedin_url:
            try:
                logger.info("LinkedIn URL provided - adding to profile")
                enriched_data["linkedin_data"] = {
                    "url": request.linkedin_url,
                    "note": "LinkedIn data requires authentication. Profile URL saved for reference."
                }
            except Exception as e:
                logger.error(f"LinkedIn enrichment failed: {e}")
        
        # Enhance resume text with GitHub data
        if enriched_data["github_data"] or enriched_data["projects"]:
            enhancement = "\n\n=== GITHUB PROFILE DATA ===\n"
            
            if enriched_data["github_data"]:
                gh = enriched_data["github_data"]
                enhancement += f"GitHub: {gh['username']}\n"
                enhancement += f"Public Repositories: {gh['public_repos']}\n"
                enhancement += f"Followers: {gh['followers']}\n"
                if gh.get('bio'):
                    enhancement += f"Bio: {gh['bio']}\n"
            
            if enriched_data["projects"]:
                enhancement += "\nGitHub Projects:\n"
                for proj in enriched_data["projects"][:5]:
                    enhancement += f"- {proj['name']}"
                    if proj.get('language'):
                        enhancement += f" ({proj['language']})"
                    if proj.get('description'):
                        enhancement += f": {proj['description'][:100]}"
                    enhancement += f" - {proj.get('stars', 0)} stars\n"
            
            if enriched_data["additional_skills"]:
                enhancement += f"\nGitHub Languages: {', '.join(enriched_data['additional_skills'])}\n"
            
            enriched_data["resume_text"] = request.resume_text + enhancement
        
        logger.info("Profile enrichment complete")
        return enriched_data
        
    except Exception as e:
        logger.error(f"Profile enrichment failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profile enrichment failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)