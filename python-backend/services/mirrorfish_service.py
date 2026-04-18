"""
MirrorFish Integration Service for SkillOS
Connects to MirrorFish simulation engine at localhost:5001
"""

import requests
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
import re
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

MIRRORFISH_BASE = os.getenv("MIRRORFISH_BASE_URL", "http://localhost:5001")
MIRRORFISH_NUM_ROUNDS = int(os.getenv("MIRRORFISH_NUM_ROUNDS", "15"))
MIRRORFISH_TIMEOUT = int(os.getenv("MIRRORFISH_TIMEOUT", "30"))
MIRRORFISH_API_KEY = os.getenv("MIRRORFISH_API_KEY", "")


def build_seed_document(ml_result: dict, resume_text: str, job_description: str) -> str:
    """
    Convert ML pipeline output into MirrorFish seed document.
    Seed has 3 blocks: CANDIDATE PROFILE, TARGET ROLE, PREDICTION QUERY
    """
    # Extract skills from ML result
    skill_analysis = ml_result.get("skill_analysis", {})
    matched_skills = skill_analysis.get("matched_skills", [])
    missing_skills = skill_analysis.get("missing_skills", [])
    
    # Handle both list of strings and list of dicts
    if matched_skills and isinstance(matched_skills[0], dict):
        skills = [s["skill"] for s in matched_skills]
    else:
        skills = matched_skills
    
    if missing_skills and isinstance(missing_skills[0], dict):
        gaps = [s["skill"] for s in missing_skills]
    else:
        gaps = missing_skills
    
    # Extract evaluation data
    evaluation = ml_result.get("evaluation", {})
    overall_score = evaluation.get("match_score", 0)
    risk_factors = evaluation.get("risk_factors", [])
    
    # Extract experience
    candidate_profile = ml_result.get("candidate_profile", {})
    experience = candidate_profile.get("experience", "Not specified")
    
    candidate_block = f"""=== CANDIDATE PROFILE ===
Experience: {experience}
Skills: {", ".join(skills) if skills else "Not detected"}
Skill Gaps Identified: {", ".join(gaps) if gaps else "None"}
Overall ML Score: {overall_score}/100
Risk Factors: {"; ".join(risk_factors) if risk_factors else "None"}
Resume Summary: {resume_text[:800]}
"""
    
    job_block = f"""=== TARGET ROLE ===
{job_description[:600]}
"""
    
    query_block = """=== PREDICTION QUERY ===
Simulate how different recruiter archetypes (ATS system, HR screener, 
startup hiring manager, technical lead) evaluate this candidate's profile.
Predict: (1) shortlist probability per recruiter type, 
(2) which parts of the resume cause drop-off and why, 
(3) specific improvements that would increase callback rate,
(4) overall hiring recommendation with confidence level.
"""
    
    return candidate_block + job_block + query_block


def run_mirrorfish_simulation(seed_text: str, num_rounds: int = None) -> dict:
    """
    Full MirrorFish pipeline with improved error handling and API structure.
    
    Runs synchronously — call this in a thread from async context.
    Total expected time: 60-120 seconds for 15 rounds.
    """
    if num_rounds is None:
        num_rounds = MIRRORFISH_NUM_ROUNDS
    
    logger.info(f"Starting MirrorFish simulation with {num_rounds} rounds")
    
    # Prepare headers with API key if available
    headers = {"Content-Type": "application/json"}
    if MIRRORFISH_API_KEY:
        headers["Authorization"] = f"Bearer {MIRRORFISH_API_KEY}"
    
    try:
        # Step 1: Check MirrorFish health
        logger.info("Checking MirrorFish health...")
        health_resp = requests.get(f"{MIRRORFISH_BASE}/health", headers=headers, timeout=10)
        if health_resp.status_code != 200:
            raise RuntimeError(f"MirrorFish health check failed: {health_resp.status_code}")
        
        # Step 2: Build knowledge graph
        logger.info("Building knowledge graph...")
        graph_resp = requests.post(
            f"{MIRRORFISH_BASE}/api/graph/build",
            json={"text": seed_text, "rounds": num_rounds},
            headers=headers,
            timeout=120
        )
        graph_resp.raise_for_status()
        
        graph_id = graph_resp.json().get("graph_id", "default")
        logger.info(f"Knowledge graph build initiated with ID: {graph_id}")
        
        # Step 3: Wait for graph completion
        for attempt in range(60):  # max 5 minutes
            time.sleep(5)
            try:
                status_resp = requests.get(
                    f"{MIRRORFISH_BASE}/api/graph/status/{graph_id}", 
                    headers=headers, 
                    timeout=10
                )
                status_data = status_resp.json()
                
                if status_data.get("status") == "complete":
                    logger.info("Knowledge graph build complete")
                    break
                elif status_data.get("status") == "error":
                    error_msg = status_data.get("error", "Unknown graph build error")
                    raise RuntimeError(f"MirrorFish graph build error: {error_msg}")
                    
            except requests.RequestException as e:
                logger.warning(f"Graph status check failed: {e}")
                
        else:
            raise TimeoutError("Graph build timed out after 5 minutes")
        
        # Step 4: Start simulation
        query = (
            "Simulate recruiter evaluation from 4 perspectives: "
            "ATS system (keyword matching), HR screener (culture fit), "
            "startup hiring manager (execution focus), technical lead (depth assessment). "
            "Predict shortlist probability and provide specific feedback."
        )
        
        logger.info("Starting simulation...")
        sim_resp = requests.post(
            f"{MIRRORFISH_BASE}/api/simulation/start",
            json={
                "graph_id": graph_id,
                "prediction_query": query, 
                "num_rounds": num_rounds,
                "agent_types": ["ats", "hr", "startup", "technical"]
            },
            headers=headers,
            timeout=30
        )
        sim_resp.raise_for_status()
        
        simulation_id = sim_resp.json().get("simulation_id", graph_id)
        logger.info(f"Simulation started with ID: {simulation_id}")
        
        # Step 5: Wait for simulation completion
        for attempt in range(60):  # max 10 minutes
            time.sleep(10)
            try:
                status_resp = requests.get(
                    f"{MIRRORFISH_BASE}/api/simulation/status/{simulation_id}", 
                    headers=headers, 
                    timeout=10
                )
                status_data = status_resp.json()
                
                if status_data.get("status") == "complete":
                    logger.info("Simulation complete")
                    break
                elif status_data.get("status") == "error":
                    error_msg = status_data.get("error", "Unknown simulation error")
                    raise RuntimeError(f"Simulation failed: {error_msg}")
                    
            except requests.RequestException as e:
                logger.warning(f"Simulation status check failed: {e}")
                
        else:
            raise TimeoutError("Simulation timed out after 10 minutes")
        
        # Step 6: Generate and fetch report
        logger.info("Generating report...")
        report_resp = requests.post(
            f"{MIRRORFISH_BASE}/api/report/generate/{simulation_id}",
            headers=headers,
            timeout=120
        )
        report_resp.raise_for_status()
        
        # Fetch the generated report
        logger.info("Fetching report...")
        result_resp = requests.get(
            f"{MIRRORFISH_BASE}/api/report/result/{simulation_id}",
            headers=headers,
            timeout=30
        )
        result_resp.raise_for_status()
        
        raw_report = result_resp.json()
        logger.info("Report fetched successfully")
        
        # Step 7: Parse into structured agent reports
        return parse_mirrorfish_report(raw_report)
        
    except requests.RequestException as e:
        logger.error(f"MirrorFish API request failed: {e}")
        raise RuntimeError(f"MirrorFish API request failed: {e}")
    except Exception as e:
        logger.error(f"MirrorFish simulation failed: {e}")
        raise


def parse_mirrorfish_report(raw_report: dict) -> dict:
    """
    Convert MirrorFish raw report into the 4-agent structure SkillOS expects.
    MirrorFish returns free-form text — we extract key signals from it.
    """
    # Handle different report formats
    if isinstance(raw_report, dict):
        report_text = raw_report.get("report", raw_report.get("content", raw_report.get("result", str(raw_report))))
    else:
        report_text = str(raw_report)
    
    logger.info("Parsing MirrorFish report...")
    
    # Extract overall metrics
    prob_match = re.search(r"(\d{1,3})%\s*(shortlist|probability|chance|likelihood)",
                          report_text, re.IGNORECASE)
    shortlist_prob = int(prob_match.group(1)) if prob_match else 65
    
    # Extract confidence scores
    confidence_matches = re.findall(r"confidence[:\s]*(\d{1,3})%?", report_text, re.IGNORECASE)
    avg_confidence = sum(int(c) for c in confidence_matches) // len(confidence_matches) if confidence_matches else 70
    
    return {
        "mirrorfish_report": {
            "raw": report_text,
            "shortlist_probability": shortlist_prob,
            "simulation_rounds": MIRRORFISH_NUM_ROUNDS,
            "source": "mirrorfish_oasis_simulation",
            "confidence": avg_confidence
        },
        # Map to the 4 agent structure SkillOS frontend expects
        "agent_reports": {
            "ats": extract_agent_verdict(report_text, "ATS", "ats"),
            "hr": extract_agent_verdict(report_text, "HR", "hr"),
            "startup": extract_agent_verdict(report_text, "startup", "startup"),
            "tech": extract_agent_verdict(report_text, "technical", "tech"),
        }
    }


def extract_agent_verdict(report_text: str, agent_keyword: str, agent_type: str) -> dict:
    """
    Extract each agent's section from the MirrorFish report text.
    Falls back to sensible defaults if section not found.
    """
    # Try to find agent section in report
    patterns = [
        rf"{agent_keyword}[^a-zA-Z]*([^.]*\.)",  # Find sentences with agent keyword
        rf"(?i){agent_keyword}.*?(?=ATS|HR|startup|technical|$)",  # Find section
        rf"(?i){agent_keyword}[:\-\s]+(.*?)(?=\n\n|\n[A-Z]|$)"  # Find content after keyword
    ]
    
    section = ""
    for pattern in patterns:
        match = re.search(pattern, report_text, re.IGNORECASE | re.DOTALL)
        if match:
            section = match.group(0)[:400]
            break
    
    if not section:
        section = report_text[:200]  # Fallback to beginning of report
    
    # Extract confidence/score numbers from section
    numbers = re.findall(r"\b(\d{1,3})%?\b", section)
    confidence = int(numbers[0]) if numbers and int(numbers[0]) <= 100 else 70
    
    # Verdict keywords mapping
    verdict_map = {
        "ats": {"positive": "PASS", "neutral": "REVIEW", "negative": "FAIL"},
        "hr": {"positive": "SHORTLIST", "neutral": "HOLD", "negative": "REJECT"},
        "startup": {"positive": "HIRE", "neutral": "MAYBE", "negative": "PASS"},
        "tech": {"positive": "STRONG_YES", "neutral": "YES", "negative": "NO"},
    }
    verdicts = verdict_map.get(agent_type, verdict_map["hr"])
    
    # Determine verdict based on keywords in section
    positive_signals = ["strong", "excellent", "recommend", "shortlist", "hire", "pass", "good", "impressive", "solid"]
    negative_signals = ["weak", "missing", "reject", "fail", "concern", "gap", "not recommend", "insufficient", "poor"]
    
    section_lower = section.lower()
    positive_count = sum(1 for word in positive_signals if word in section_lower)
    negative_count = sum(1 for word in negative_signals if word in section_lower)
    
    if positive_count > negative_count and confidence >= 60:
        verdict = verdicts["positive"]
    elif negative_count > positive_count or confidence < 40:
        verdict = verdicts["negative"]
    else:
        verdict = verdicts["neutral"]
    
    # Map to SkillOS agent structure
    agent_names = {
        "ats": "ATLAS",
        "hr": "PRIYA", 
        "startup": "ALEX",
        "tech": "DR. CHEN"
    }
    
    agent_roles = {
        "ats": "ATS System",
        "hr": "HR Screener",
        "startup": "Startup Hiring Manager",
        "tech": "Technical Lead"
    }
    
    return {
        "agent": agent_type,
        "name": agent_names.get(agent_type, agent_keyword),
        "role": agent_roles.get(agent_type, agent_keyword),
        "verdict": verdict,
        "confidence": confidence,
        "comment": section[:300].strip() if section.strip() else f"Evaluated by {agent_keyword} - {verdict}",
        "source": "mirrorfish_simulation",
    }


async def run_mirrorfish_async(seed_text: str) -> dict:
    """
    Run MirrorFish in a thread pool so it doesn't block the FastAPI event loop.
    """
    logger.info("Running MirrorFish simulation asynchronously...")
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        result = await loop.run_in_executor(
            pool, 
            run_mirrorfish_simulation, 
            seed_text
        )
    logger.info("MirrorFish simulation complete")
    return result


def check_mirrorfish_available() -> bool:
    """
    Check if MirrorFish is running and available
    """
    try:
        # Prepare headers with API key if available
        headers = {}
        if MIRRORFISH_API_KEY:
            headers["Authorization"] = f"Bearer {MIRRORFISH_API_KEY}"
        
        # Try multiple endpoints to check availability
        endpoints = ["/health", "/api/status", "/"]
        
        for endpoint in endpoints:
            try:
                resp = requests.get(f"{MIRRORFISH_BASE}{endpoint}", headers=headers, timeout=5)
                if resp.status_code in [200, 404]:  # 404 is OK, means server is running
                    logger.info(f"MirrorFish is available at {MIRRORFISH_BASE}")
                    return True
            except requests.RequestException:
                continue
        
        logger.warning(f"MirrorFish not available at {MIRRORFISH_BASE}")
        return False
        
    except Exception as e:
        logger.error(f"Error checking MirrorFish availability: {e}")
        return False


def keep_heartbeat(interval: int = 10):
    """
    Send periodic heartbeats to keep MirrorFish backend alive during long simulations.
    Call this in a background thread before starting simulation.
    """
    try:
        headers = {}
        if MIRRORFISH_API_KEY:
            headers["Authorization"] = f"Bearer {MIRRORFISH_API_KEY}"
        
        requests.get(f"{MIRRORFISH_BASE}/api/heartbeat", headers=headers, timeout=5)
    except Exception:
        pass  # Non-critical — heartbeat failure doesn't stop simulation
