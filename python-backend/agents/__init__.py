"""
SkillOS Virtual HR Agents
4 AI recruiter personas that evaluate candidates
"""

from .base_agent import BaseAgent
from .ats_agent import ATSAgent
from .hr_agent import HRAgent
from .startup_agent import StartupAgent
from .tech_agent import TechAgent

__all__ = ["BaseAgent", "ATSAgent", "HRAgent", "StartupAgent", "TechAgent"]
