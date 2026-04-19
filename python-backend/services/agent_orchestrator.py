"""
Agent Orchestrator for SkillOS Virtual HR Simulation
Uses existing ML pipeline results and adds 4 agent personas on top
"""

import asyncio
from typing import Dict, Any
from agents.ats_agent import ATSAgent
from agents.hr_agent import HRAgent
from agents.startup_agent import StartupAgent
from agents.tech_agent import TechAgent
import logging

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    Orchestrates 4 virtual HR agents that evaluate candidates
    Uses existing ML analysis as input data
    """

    def __init__(self):
        self.agents = [ATSAgent(), HRAgent(), StartupAgent(), TechAgent()]
        logger.info("Agent Orchestrator initialized with 4 agents")

    async def run_simulation(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run all 4 agents in parallel using existing ML analysis

        Args:
            analysis_data: Complete analysis from existing ML pipeline

        Returns:
            Agent simulation results with verdicts and scores
        """
        logger.info("Starting virtual HR simulation with 4 agents")

        # Run all agents concurrently (simulates parallel evaluation)
        tasks = [
            asyncio.create_task(self._run_agent_with_delay(agent, analysis_data))
            for agent in self.agents
        ]

        agent_reports = await asyncio.gather(*tasks)

        # Calculate overall metrics from agent verdicts
        overall_metrics = self._calculate_overall_metrics(agent_reports)

        logger.info(
            f"Simulation complete - Overall score: {overall_metrics['overall_score']}"
        )

        return {
            "agent_reports": {report["agent"]: report for report in agent_reports},
            **overall_metrics,
        }

    async def _run_agent_with_delay(
        self, agent, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run individual agent with simulated thinking delay
        """
        # Simulate agent "thinking" time (0.1-0.3 seconds)
        await asyncio.sleep(0.1 + (hash(agent.name) % 3) * 0.1)

        try:
            result = agent.evaluate(data)
            logger.info(f"{agent.name} evaluation complete: {result['verdict']}")
            return result
        except Exception as e:
            logger.error(f"Agent {agent.name} evaluation failed: {e}")
            return self._get_fallback_result(agent)

    def _calculate_overall_metrics(self, agent_reports: list) -> Dict[str, Any]:
        """
        Calculate overall metrics from all agent verdicts
        """
        # Extract confidence scores
        confidences = [report["confidence"] for report in agent_reports]
        overall_score = sum(confidences) // len(confidences)

        # Calculate shortlist probability based on positive verdicts
        positive_verdicts = ["PASS", "SHORTLIST", "HIRE", "YES", "STRONG_YES"]

        positive_count = sum(
            1 for report in agent_reports if report["verdict"] in positive_verdicts
        )

        shortlist_probability = int((positive_count / len(agent_reports)) * 100)

        # Determine overall verdict
        verdict = self._determine_overall_verdict(positive_count, len(agent_reports))

        # Generate panel consensus
        panel_consensus = (
            f"{positive_count} of {len(agent_reports)} agents recommend advancing"
        )

        return {
            "overall_score": overall_score,
            "shortlist_probability": shortlist_probability,
            "verdict": verdict,
            "panel_consensus": panel_consensus,
            "agent_count": len(agent_reports),
            "positive_votes": positive_count,
        }

    def _determine_overall_verdict(self, positive_count: int, total_agents: int) -> str:
        """
        Determine overall verdict based on agent consensus
        """
        percentage = positive_count / total_agents

        if percentage >= 0.75:  # 3+ out of 4 agents
            return "STRONG_CANDIDATE"
        elif percentage >= 0.5:  # 2+ out of 4 agents
            return "CANDIDATE"
        elif percentage >= 0.25:  # 1+ out of 4 agents
            return "NEEDS_WORK"
        else:
            return "NOT_YET"

    def _get_fallback_result(self, agent) -> Dict[str, Any]:
        """
        Fallback result if agent evaluation fails
        """
        return {
            "agent": agent.name.lower().replace(" ", "_"),
            "name": agent.name,
            "role": agent.role,
            "verdict": "REVIEW",
            "confidence": 50,
            "comment": "Agent evaluation temporarily unavailable",
            "error": True,
        }
