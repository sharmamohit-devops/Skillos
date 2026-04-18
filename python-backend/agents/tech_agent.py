"""
DR. CHEN - Technical Lead Agent
Senior Staff Engineer with 15 years experience
Focuses on technical depth, system design, code quality
"""

from .base_agent import BaseAgent
from typing import Dict, Any, List


class TechAgent(BaseAgent):
    """
    DR. CHEN - The Technical Lead
    Persona: Meticulous about depth, system design awareness
    Evaluates: Technical depth, stack coherence, complexity
    """
    
    def __init__(self):
        super().__init__(
            name="DR. CHEN",
            role="Technical Lead",
            persona="Senior Staff Engineer. Meticulous about technical depth.",
            color="purple"
        )
        
        # Advanced technical concepts
        self.advanced_concepts = [
            'architecture', 'design patterns', 'scalability', 'performance',
            'optimization', 'distributed systems', 'microservices',
            'system design', 'algorithms', 'data structures',
            'testing', 'tdd', 'ci/cd', 'code review',
            'refactoring', 'technical debt', 'documentation'
        ]
        
        # Depth indicators
        self.depth_keywords = {
            'advanced': ['architected', 'designed', 'optimized', 'scaled', 'performance tuning'],
            'intermediate': ['implemented', 'developed', 'built', 'integrated'],
            'basic': ['used', 'familiar with', 'exposure to', 'basic knowledge']
        }
    
    def evaluate(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Technical evaluation based on depth and complexity"""
        resume_text = analysis_data.get('resume_text', '')
        skill_analysis = analysis_data.get('skill_analysis', {})
        candidate_profile = analysis_data.get('candidate_profile', {})
        
        # Calculate scores
        depth_score = self._calculate_depth(resume_text, skill_analysis)
        stack_score = self._calculate_stack_coherence(skill_analysis)
        complexity_score = self._calculate_complexity(resume_text, candidate_profile)
        
        # Identify impressions and concerns
        impressed_by = self._identify_strengths(resume_text, skill_analysis)
        concerns = self._identify_technical_concerns(resume_text, skill_analysis)
        
        # Determine verdict
        verdict = self._determine_verdict(depth_score, stack_score, complexity_score)
        
        # Calculate confidence
        confidence = self._calculate_confidence({
            'depth': depth_score,
            'stack': stack_score,
            'complexity': complexity_score
        })
        
        return {
            "agent": "tech",
            "name": self.name,
            "role": self.role,
            "verdict": verdict,
            "confidence": confidence,
            "depth_score": depth_score,
            "stack_score": stack_score,
            "complexity_score": complexity_score,
            "impressed_by": impressed_by,
            "concerns": concerns,
            "technical_comment": self._generate_comment(verdict, impressed_by, concerns)
        }
    
    def _calculate_depth(self, resume_text: str, skill_analysis: Dict[str, Any]) -> int:
        """Calculate technical depth score"""
        score = 40  # Base score
        text_lower = resume_text.lower()
        
        # Check skill depth from analysis
        if 'skill_depth' in skill_analysis:
            skill_depth = skill_analysis['skill_depth']
            advanced_count = sum(1 for depth in skill_depth.values() if depth == 'advanced')
            intermediate_count = sum(1 for depth in skill_depth.values() if depth == 'intermediate')
            
            score += min(30, advanced_count * 10)
            score += min(15, intermediate_count * 3)
        
        # Check for advanced concepts
        advanced_count = sum(1 for concept in self.advanced_concepts if concept in text_lower)
        score += min(15, advanced_count * 2)
        
        return min(100, score)
    
    def _calculate_stack_coherence(self, skill_analysis: Dict[str, Any]) -> int:
        """Evaluate technology stack coherence and recency"""
        score = 50  # Base score
        matched_skills = [s.lower() for s in skill_analysis.get('matched_skills', [])]
        
        # Check for modern technologies
        modern_tech = {
            'frontend': ['react', 'vue', 'angular', 'typescript', 'next.js'],
            'backend': ['node.js', 'python', 'go', 'rust', 'fastapi'],
            'database': ['postgresql', 'mongodb', 'redis', 'elasticsearch'],
            'devops': ['docker', 'kubernetes', 'aws', 'terraform', 'github actions']
        }
        
        for category, techs in modern_tech.items():
            if any(tech in str(matched_skills) for tech in techs):
                score += 10
        
        # Check for complementary skills
        has_frontend = any(tech in str(matched_skills) for tech in modern_tech['frontend'])
        has_backend = any(tech in str(matched_skills) for tech in modern_tech['backend'])
        has_database = any(tech in str(matched_skills) for tech in modern_tech['database'])
        
        if has_frontend and has_backend and has_database:
            score += 10  # Bonus for full-stack coherence
        
        return min(100, score)
    
    def _calculate_complexity(self, resume_text: str, profile: Dict[str, Any]) -> int:
        """Evaluate technical project complexity"""
        score = 50  # Base score
        text_lower = resume_text.lower()
        
        # Check for system design mentions
        system_design_keywords = [
            'architecture', 'system design', 'scalability', 'distributed',
            'microservices', 'load balancing', 'caching', 'database design'
        ]
        design_count = sum(1 for keyword in system_design_keywords if keyword in text_lower)
        score += min(20, design_count * 5)
        
        # Check for performance work
        performance_keywords = ['optimized', 'performance', 'latency', 'throughput', 'efficiency']
        if any(keyword in text_lower for keyword in performance_keywords):
            score += 10
        
        # Check for testing
        testing_keywords = ['testing', 'unit test', 'integration test', 'tdd', 'test coverage']
        if any(keyword in text_lower for keyword in testing_keywords):
            score += 10
        
        # Check for code quality
        quality_keywords = ['code review', 'refactoring', 'documentation', 'best practices']
        if any(keyword in text_lower for keyword in quality_keywords):
            score += 10
        
        return min(100, score)
    
    def _identify_strengths(self, resume_text: str, skill_analysis: Dict[str, Any]) -> List[str]:
        """Identify technical strengths"""
        strengths = []
        text_lower = resume_text.lower()
        
        # System design awareness
        if any(word in text_lower for word in ['architecture', 'system design', 'scalability']):
            strengths.append("System design awareness evident in project descriptions")
        
        # Testing mentioned
        if any(word in text_lower for word in ['testing', 'unit test', 'tdd']):
            strengths.append("Testing and code quality practices mentioned")
        
        # Performance optimization
        if 'optimized' in text_lower or 'performance' in text_lower:
            strengths.append("Performance optimization experience")
        
        # Advanced skill depth
        if 'skill_depth' in skill_analysis:
            advanced_skills = [s for s, d in skill_analysis['skill_depth'].items() 
                             if d == 'advanced']
            if len(advanced_skills) >= 3:
                strengths.append(f"Advanced proficiency in {len(advanced_skills)} core technologies")
        
        # Modern stack
        matched_skills = skill_analysis.get('matched_skills', [])
        modern_count = sum(1 for skill in ['react', 'typescript', 'docker', 'kubernetes', 'aws'] 
                          if skill in str(matched_skills).lower())
        if modern_count >= 3:
            strengths.append("Modern technology stack experience")
        
        return strengths[:3]
    
    def _identify_technical_concerns(self, resume_text: str, 
                                    skill_analysis: Dict[str, Any]) -> List[str]:
        """Identify technical concerns"""
        concerns = []
        text_lower = resume_text.lower()
        
        # Shallow skill claims
        matched_skills = skill_analysis.get('matched_skills', [])
        if 'skill_depth' in skill_analysis:
            skill_depth = skill_analysis['skill_depth']
            
            # Check for claimed skills without depth
            for skill in matched_skills[:5]:  # Check top 5 skills
                if skill in skill_depth and skill_depth[skill] == 'beginner':
                    concerns.append(f"Claims '{skill}' but no evidence of depth - needs substantiation")
                    break
        
        # Missing testing
        if not any(word in text_lower for word in ['test', 'testing', 'tdd']):
            concerns.append("No mention of testing practices - code quality unclear")
        
        # No system design
        if not any(word in text_lower for word in ['architecture', 'design', 'scalability']):
            concerns.append("Limited system design experience mentioned")
        
        # Vague technical descriptions
        if text_lower.count('various') > 2 or text_lower.count('multiple') > 3:
            concerns.append("Vague technical descriptions - need specific implementation details")
        
        # Missing modern practices
        modern_practices = ['ci/cd', 'docker', 'kubernetes', 'microservices', 'api']
        missing_modern = sum(1 for practice in modern_practices 
                           if practice not in str(matched_skills).lower())
        if missing_modern >= 4:
            concerns.append("Limited exposure to modern development practices")
        
        return concerns[:3]
    
    def _determine_verdict(self, depth: int, stack: int, complexity: int) -> str:
        """Determine technical verdict"""
        avg_score = (depth + stack + complexity) / 3
        
        if avg_score >= 80 and depth >= 75:
            return "STRONG_YES"
        elif avg_score >= 65:
            return "YES"
        elif avg_score >= 50:
            return "NO"
        else:
            return "STRONG_NO"
    
    def _generate_comment(self, verdict: str, strengths: List[str], 
                         concerns: List[str]) -> str:
        """Generate technical comment"""
        if verdict == "STRONG_YES":
            comment = "Strong technical depth across the board. "
            if strengths:
                comment += f"{strengths[0]}. "
            comment += "Would be confident putting them on complex systems work immediately."
        
        elif verdict == "YES":
            comment = "Solid technical foundation. "
            if strengths:
                comment += f"{strengths[0]}. "
            if concerns:
                comment += f"Minor concern: {concerns[0].lower()}. "
            comment += "Should do well with proper onboarding."
        
        elif verdict == "NO":
            comment = "Technical depth is questionable. "
            if concerns:
                comment += f"{concerns[0]}. "
            comment += "Would need significant mentoring. Better suited for junior role."
        
        else:
            comment = "Insufficient technical depth for this level. "
            if concerns:
                comment += f"Key issue: {concerns[0].lower()}. "
            comment += "Not ready for this position."
        
        return comment
