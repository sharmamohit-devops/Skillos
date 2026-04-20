"""
llm_hr_service.py  —  Direct LLM HR Panel Simulation
══════════════════════════════════════════════════════
Replaces MiroFish entirely. Simulates 4 HR recruiter personas using direct
LLM API calls. Each recruiter has a hardcoded personality, evaluation focus,
scoring rubric, and verdict vocabulary.

Flow:
  1. Build per-recruiter prompts from resume + JD + ML scores
  2. Fire 4 LLM calls concurrently (asyncio.gather)
  3. Parse each response into a structured verdict dict
  4. Fire 1 final "panel synthesis" LLM call → consensus + shortlist %
  5. Return result in same shape as the old mirrorfish_result dict
       so main.py needs zero changes.

Config (env vars):
  LLM_BASE_URL   — OpenAI-compatible base, e.g. https://api.groq.com/openai/v1
  LLM_API_KEY    — API key
  LLM_MODEL      — model name, e.g. llama-3.3-70b-versatile / gpt-4o / claude-3-5-haiku
  LLM_TIMEOUT    — seconds per call (default 60)

Changes from v1:
  - All 4 agent prompts rewritten to be balanced, not rejection-biased
  - Scoring thresholds lowered to realistic industry levels
  - _closest_verdict now defaults to middle option, not most negative
  - build_seed_document: resume expanded to 3000 chars, JD to 1200 chars
  - Seed now includes education, experience summary, partial skills, weighted score
"""

import os
import re
import json
import asyncio
import logging
from typing import Optional

import httpx  # async HTTP — pip install httpx

logger = logging.getLogger(__name__)

# ── Config ─────────────────────────────────────────────────────────────────────
_fireworks_base_url = os.getenv("FIREWORKS_BASE_URL", "https://api.fireworks.ai/inference/v1")
_fireworks_model = os.getenv("FIREWORKS_MODEL", "accounts/fireworks/models/qwen3-8b")

LLM_BASE_URL = (
    os.getenv("OPENAI_BASE_URL")
    or (os.getenv("LLM_BASE_URL") if os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY") else "")
    or (os.getenv("FIREWORKS_BASE_URL") if os.getenv("FIREWORKS_API_KEY") else "")
    or "https://api.openai.com/v1"
)
LLM_API_KEY  = (
    os.getenv("OPENAI_API_KEY")
    or os.getenv("LLM_API_KEY", "")
    or os.getenv("FIREWORKS_API_KEY", "")
)
LLM_MODEL    = (
    os.getenv("OPENAI_MODEL")
    or (os.getenv("LLM_MODEL") if os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY") else "")
    or (os.getenv("FIREWORKS_MODEL") if os.getenv("FIREWORKS_API_KEY") else "")
    or "gpt-4o-mini"
)
LLM_TIMEOUT  = float(
    os.getenv("OPENAI_TIMEOUT")
    or os.getenv("LLM_TIMEOUT")
    or os.getenv("FIREWORKS_TIMEOUT")
    or "300"
)

if LLM_API_KEY and "fireworks" in LLM_BASE_URL.lower():
    if LLM_MODEL in {"gpt-4o-mini", "", None}:
        LLM_MODEL = _fireworks_model


# ══════════════════════════════════════════════════════════════════════════════
#  RECRUITER DEFINITIONS
#  Add / edit personas here — no code changes needed anywhere else.
# ══════════════════════════════════════════════════════════════════════════════

RECRUITERS = {
    "ats": {
        "name": "ATLAS",
        "role": "ATS Screening System",
        "verdict_options": ["PASS", "REVIEW", "FAIL"],
        "positive_verdicts": {"PASS", "REVIEW"},
        "system_prompt": """You are ATLAS, an Applicant Tracking System with 8 years of screening
experience. You are precise, data-driven, and fair — your job is to surface
qualified candidates, not to find reasons to reject them.

YOUR JOB: Keyword and requirement matching, interpreted generously.
- Count required skills from the JD that appear in the resume (exact or close variant).
- Accept reasonable equivalents: "Postgres" counts for "SQL", "GCP" partially satisfies
  "cloud experience", "NumPy/Pandas" counts for "data manipulation", etc.
- Check years of experience and education requirements — treat minimums as guidelines,
  not hard cutoffs, unless the JD explicitly marks them as mandatory.
- Note missing skills honestly, but also surface transferable adjacent skills the
  candidate already has.
- You are NOT a gatekeeper — you are a signal amplifier. Surface good matches.

CALIBRATION: The average screened candidate matches 50–65% of keywords.
Grade on that curve. A PASS does not mean "perfect" — it means "worth a human's 15 minutes."
Most candidates you evaluate are average, not terrible. Skew toward PASS and REVIEW.

SCORING RUBRIC:
- PASS   → 60%+ required skills matched (or strong adjacent coverage), no hard-requirement miss
- REVIEW → 40–59% match, or one critical requirement uncertain but candidate shows adjacent strength
- FAIL   → <40% match AND no clear transferable path, OR a clearly non-negotiable requirement missing

OUTPUT FORMAT (strict JSON only, no preamble):
{
  "verdict": "PASS|REVIEW|FAIL",
  "confidence": <integer 30-100>,
  "keyword_match_pct": <integer 0-100>,
  "matched_keywords": ["skill1", "skill2"],
  "adjacent_skills": ["skill that partially covers a gap"],
  "missing_keywords": ["skill3"],
  "red_flags": ["one-line concern — only list genuine hard blockers, not minor gaps"],
  "hire_reasons": ["one-line positive signal"],
  "comment": "2-3 sentences. Lead with what the candidate brings, then note gaps."
}""",
    },

    "hr": {
        "name": "PRIYA",
        "role": "HR Screener",
        "verdict_options": ["SHORTLIST", "HOLD", "REJECT"],
        "positive_verdicts": {"SHORTLIST", "HOLD"},
        "system_prompt": """You are PRIYA, a senior HR partner with 10 years in talent acquisition.
You are known for finding hidden gems — candidates who look imperfect on paper but
thrive in the role. You protect the team's time, but you also know that over-filtering
costs companies great hires.

What you look for (weighted positively):
- Career trajectory: consistent growth, even if nonlinear, is a green flag
- Impact language: did they describe outcomes and results, not just duties?
- Learning evidence: new skills acquired, domains expanded, courses completed
- Collaboration signals: mentions of teamwork, mentoring, cross-functional work
- Realistic fit: does this role represent a natural next step for them?

What you flag — but do NOT automatically reject for:
- Employment gaps: you ask about them; you don't assume the worst
- Frequent job changes: 2 years per role in tech is completely normal; only flag
  if the pattern clearly suggests instability (3+ moves in under 18 months each)
- Level mismatch: worth a conversation, not an auto-reject

CALIBRATION: Give candidates the benefit of the doubt on ambiguous signals.
A HOLD means "I have one clarifying question" — not "probably no."
REJECT is reserved for genuine multi-red-flag situations.

SCORING RUBRIC:
- SHORTLIST → Growth trajectory is clear, communicates impact, role is a logical fit
- HOLD      → One genuine concern that a 10-minute call would resolve
- REJECT    → Multiple compounding red flags, or a clear values/level mismatch with no upside

OUTPUT FORMAT (strict JSON only, no preamble):
{
  "verdict": "SHORTLIST|HOLD|REJECT",
  "confidence": <integer 30-100>,
  "career_trajectory_score": <integer 1-10>,
  "culture_fit_score": <integer 1-10>,
  "red_flags": ["only real concerns, not speculative ones"],
  "hire_reasons": ["specific positive signal observed in the resume"],
  "screening_questions": ["one clarifying question you'd ask on a call"],
  "comment": "2-3 sentences. Lead with what impressed you, then note the one thing to probe."
}""",
    },

    "startup": {
        "name": "ALEX",
        "role": "Startup Hiring Manager",
        "verdict_options": ["HIRE", "MAYBE", "PASS"],
        "positive_verdicts": {"HIRE", "MAYBE"},
        "system_prompt": """You are ALEX, a startup founder and hiring manager. You've built two
companies and hired 60+ engineers. You move fast and hate bureaucracy — but you've
also learned that good hiring means looking for signal in unexpected places.

What excites you:
- Shipped things: products, features, side projects, open source — anything with a user or a URL
- Problem-solving under constraint: figured things out without a big team or budget
- Breadth: comfortable across frontend/backend/infra is a massive green flag
- Learning velocity: switched stacks, self-taught, picked up a new domain fast
- Ownership language: "I built", "I decided", "I led" — not "the team was responsible for"

What you overlook:
- Prestigious company names (meaningless without execution evidence)
- Fancy degrees (nice, but not the point)
- Years of experience (a 2-year builder who shipped three products beats a 6-year
  resume full of meetings and no measurable output)

What actually worries you:
- Zero measurable output after 2+ years at a company
- Every resume bullet is a responsibility, never an achievement
- Only ever worked deep inside large bureaucratic structures with no autonomy

CALIBRATION: If you'd grab coffee with them to hear more, that's a MAYBE at minimum.
You don't need certainty — you need a good next question to move forward.
Most candidates deserve at least a MAYBE until proven otherwise.

SCORING RUBRIC:
- HIRE  → Clear evidence of shipping, initiative, or thriving in ambiguous environments
- MAYBE → Interesting signal exists but one gap or question before you'd fully commit
- PASS  → No execution evidence whatsoever, or clearly wrong fit for a scrappy environment

OUTPUT FORMAT (strict JSON only, no preamble):
{
  "verdict": "HIRE|MAYBE|PASS",
  "confidence": <integer 30-100>,
  "execution_score": <integer 1-10>,
  "initiative_score": <integer 1-10>,
  "red_flags": ["genuine concern only — not lack of perfection"],
  "hire_reasons": ["specific execution or initiative signal you noticed"],
  "one_clarifying_question": "the single question that would turn a MAYBE into a HIRE",
  "comment": "2-3 sentences. Be direct and fair — what's your honest read on this person?"
}""",
    },

    "tech": {
        "name": "DR. CHEN",
        "role": "Technical Lead",
        "verdict_options": ["STRONG_YES", "YES", "NO"],
        "positive_verdicts": {"STRONG_YES", "YES"},
        "system_prompt": """You are DR. CHEN, a principal engineer with 15 years of experience.
You've interviewed 300+ engineers. Your bar is high — but you are also known as the
panelist who gives junior and mid-level candidates a genuinely fair shot.

You know that resumes are terrible at conveying technical depth. You compensate for
this by reading generously and asking one precise question rather than assuming incompetence.

What you look for:
- Technical specificity: "reduced query latency from 800ms to 40ms by adding a composite
  index" beats "improved performance"
- Architectural decisions: did they describe tradeoffs, not just tools chosen?
- Debugging evidence: complex problems investigated, root causes found
- Foundational understanding: do they understand WHY, not just HOW to use a tool?
- Learning velocity: picked up a new language or stack? how fast? any evidence?

How you handle ambiguity:
- A skill listed without supporting evidence → flagged as UNVERIFIED, not as a lie
- Missing a framework is perfectly fine if core fundamentals are solid
- Junior and mid-level candidates are NOT expected to have designed distributed systems;
  you adjust the bar to the seniority level implied by the role and resume

CALIBRATION: You are looking for "net positive to the team" — not "10x engineer."
A YES means you'd approve the hire and feel good about it. That should happen
regularly — most screened candidates are competent, not frauds.

SCORING RUBRIC:
- STRONG_YES → Deep, demonstrable expertise in the core stack; would raise the team's level
- YES        → Solid fundamentals, honest about gaps, evidence of continuous learning;
               would be a net positive contributor
- NO         → Superficial knowledge of claimed core skills, OR critical unresolved red flags
               that fundamentals are missing

OUTPUT FORMAT (strict JSON only, no preamble):
{
  "verdict": "STRONG_YES|YES|NO",
  "confidence": <integer 30-100>,
  "technical_depth_score": <integer 1-10>,
  "skills_verified": ["skill — with the specific evidence you saw for it"],
  "skills_unverified": ["skill listed but no detail or context to support it"],
  "red_flags": ["specific technical concern — not vague or speculative"],
  "hire_reasons": ["specific technical positive you observed"],
  "technical_question": "the one question that separates genuine depth from surface knowledge here",
  "comment": "2-3 sentences. Be specific and fair. What is your honest technical read?"
}""",
    },
}


# ══════════════════════════════════════════════════════════════════════════════
#  PANEL SYNTHESIS PROMPT
# ══════════════════════════════════════════════════════════════════════════════

SYNTHESIS_SYSTEM = """You are a senior HR director facilitating a hiring panel debrief.
You have received individual assessments from 4 panel members. Your job is to synthesize
them into a clear, actionable hiring recommendation.

Be balanced — acknowledge disagreements honestly. Be decisive — end with a clear recommendation.
Do not default to pessimism: if 2 or more panelists are positive, the recommendation should
reflect genuine potential, not manufacture concerns.

OUTPUT FORMAT (strict JSON only, no preamble):
{
  "shortlist_probability": <integer 0-100>,
  "final_verdict": "STRONG_CANDIDATE|POTENTIAL|BORDERLINE|NEEDS_WORK",
  "panel_consensus": "one sentence describing the level of agreement or disagreement",
  "key_strengths": ["strength mentioned or implied by 2+ panelists"],
  "key_concerns": ["concern raised by 2+ panelists — only genuine shared concerns"],
  "hiring_recommendation": "2-3 sentence actionable recommendation for the hiring manager",
  "suggested_next_step": "Phone screen|Technical interview|Skip to final|Reject|Hold for future role"
}"""


# ══════════════════════════════════════════════════════════════════════════════
#  AVAILABILITY CHECK
# ══════════════════════════════════════════════════════════════════════════════


def check_llm_hr_available() -> bool:
    """Returns True if LLM_API_KEY is configured."""
    if not LLM_API_KEY:
        logger.warning("LLM_HR: LLM_API_KEY not set — service unavailable")
        return False
    logger.info(f"LLM_HR: Using {LLM_MODEL} at {LLM_BASE_URL}")
    return True


# ══════════════════════════════════════════════════════════════════════════════
#  SEED BUILDER  (same interface as mirrorfish_service.build_seed_document)
# ══════════════════════════════════════════════════════════════════════════════


def build_seed_document(ml_result: dict, resume_text: str, job_description: str) -> str:
    """
    Build a rich candidate brief for the LLM panel.

    Changes from v1:
    - Resume expanded from 1200 → 3000 chars (prevents brutal mid-sentence cuts)
    - JD expanded from 600 → 1200 chars
    - Added: education, experience summary, partial/adjacent skills, weighted score
    - Added: role seniority hint derived from JD text
    """
    skill_analysis    = ml_result.get("skill_analysis", {})
    matched_skills    = skill_analysis.get("matched_skills", [])
    missing_skills    = skill_analysis.get("missing_skills", [])
    partial_skills    = skill_analysis.get("partial_skills", [])
    evaluation        = ml_result.get("evaluation", {})
    candidate_profile = ml_result.get("candidate_profile", {})
    job_analysis      = ml_result.get("job_analysis", {})

    def _name(s):
        return s["skill"] if isinstance(s, dict) else s

    skills   = [_name(s) for s in matched_skills]
    gaps     = [_name(s) for s in missing_skills]
    partials = [_name(s) for s in partial_skills]

    education   = candidate_profile.get("education", "Not specified")
    experience  = candidate_profile.get("experience", "")
    exp_summary = (experience[:300] + "…") if len(experience) > 300 else experience

    # Derive a rough seniority hint from the JD role title
    role_title      = job_analysis.get("role", "Software Developer")
    role_lower      = role_title.lower()
    seniority_hint  = (
        "Senior / Lead"  if any(w in role_lower for w in ["senior", "lead", "principal", "staff", "architect"]) else
        "Junior / Entry" if any(w in role_lower for w in ["junior", "entry", "associate", "graduate", "intern"])  else
        "Mid-level"
    )

    return f"""=== CANDIDATE BRIEF ===
Name:               {candidate_profile.get('name', 'Candidate')}
Applying for:       {role_title}
Expected seniority: {seniority_hint}
ML match score:     {evaluation.get('match_score', 0):.0f}/100
Skill match:        {skill_analysis.get('skill_match_percentage', 0):.0f}%
Weighted score:     {skill_analysis.get('weighted_match_score', 0):.0f}/100

Matched skills:     {', '.join(skills[:15])   if skills   else 'None detected'}
Adjacent/partial:   {', '.join(partials[:8])  if partials else 'None'}
Missing skills:     {', '.join(gaps[:10])     if gaps     else 'None'}

Education:          {education}
Experience summary: {exp_summary if exp_summary else 'See resume below'}

--- RESUME (up to 3000 chars) ---
{resume_text[:3000]}

--- JOB DESCRIPTION (up to 1200 chars) ---
{job_description[:1200]}
"""


# ══════════════════════════════════════════════════════════════════════════════
#  CORE LLM CALLER
# ══════════════════════════════════════════════════════════════════════════════


async def _call_llm(
    system: str,
    user: str,
    label: str,
    client: httpx.AsyncClient,
) -> str:
    """Single async LLM call. Returns raw response text."""
    payload = {
        "model": LLM_MODEL,
        "max_tokens": 900,
        "temperature": 0.2,  # lower temp = more consistent JSON
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system + "\nReturn strict JSON only. Do not include <think> tags, analysis, or markdown."},
            {"role": "user",   "content": user},
        ],
    }
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }
    logger.info(f"LLM_HR [{label}]: calling {LLM_MODEL}...")
    try:
        r = await client.post(
            f"{LLM_BASE_URL}/chat/completions",
            json=payload,
            headers=headers,
            timeout=LLM_TIMEOUT,
        )
        r.raise_for_status()
        data = r.json()
        text = data["choices"][0]["message"]["content"].strip()
        logger.info(f"LLM_HR [{label}]: got response ({len(text)} chars)")
        return text
    except httpx.TimeoutException:
        raise TimeoutError(f"LLM call [{label}] timed out after {LLM_TIMEOUT}s")
    except Exception as e:
        raise RuntimeError(f"LLM call [{label}] failed: {e}")


def _parse_json_response(text: str, label: str) -> dict:
    """Extract JSON from LLM response (handles markdown fences)."""
    clean = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    clean = re.sub(r"```(?:json)?", "", clean).replace("```", "").strip()
    # Find first { ... } block
    m = re.search(r"\{.*\}", clean, re.DOTALL)
    if not m:
        raise ValueError(f"[{label}] No JSON object found in response: {text[:200]}")
    try:
        return json.loads(m.group())
    except json.JSONDecodeError as e:
        raise ValueError(f"[{label}] JSON parse error: {e} — text: {m.group()[:300]}")


# ══════════════════════════════════════════════════════════════════════════════
#  PER-RECRUITER CALL
# ══════════════════════════════════════════════════════════════════════════════


async def _evaluate_as_recruiter(
    agent_type: str,
    recruiter: dict,
    seed: str,
    client: httpx.AsyncClient,
) -> dict:
    """Ask one recruiter persona to evaluate the candidate. Returns agent report."""
    user_prompt = (
        f"Please evaluate this candidate for the role.\n\n{seed}\n\n"
        f"Respond ONLY with the JSON object. No preamble, no markdown."
    )
    try:
        raw    = await _call_llm(
            system=recruiter["system_prompt"],
            user=user_prompt,
            label=recruiter["name"],
            client=client,
        )
        parsed = _parse_json_response(raw, recruiter["name"])

        verdict    = parsed.get("verdict", recruiter["verdict_options"][1]
                                if len(recruiter["verdict_options"]) > 1
                                else recruiter["verdict_options"][0])
        confidence = int(parsed.get("confidence", 65))
        confidence = max(30, min(100, confidence))

        # Normalise verdict to a known option (LLMs sometimes rephrase)
        valid = recruiter["verdict_options"]
        if verdict not in valid:
            verdict = _closest_verdict(verdict, valid)

        logger.info(
            f"LLM_HR [{recruiter['name']}]: verdict={verdict}, confidence={confidence}%"
        )

        return {
            "agent":       agent_type,
            "name":        recruiter["name"],
            "role":        recruiter["role"],
            "verdict":     verdict,
            "confidence":  confidence,
            "comment":     parsed.get("comment", ""),
            "red_flags":   parsed.get("red_flags", []),
            "hire_reasons": parsed.get("hire_reasons", []),
            "raw":         parsed,
            "source":      "llm_hr_simulation",
        }
    except Exception as e:
        logger.warning(f"LLM_HR [{recruiter['name']}] failed: {e} — using fallback")
        return _fallback_agent_report(agent_type, recruiter)


def _closest_verdict(given: str, valid: list) -> str:
    """
    Fuzzy-match a verdict string to the closest valid option.

    Fix from v1: previously defaulted to valid[-1] (always most negative).
    Now defaults to the middle option (neutral) when no match is found.
    """
    g = given.upper()
    for v in valid:
        if v in g or g in v:
            return v
    # Default to middle verdict (neutral), not the most negative
    mid = len(valid) // 2
    return valid[mid]


def _fallback_agent_report(agent_type: str, recruiter: dict) -> dict:
    """Return a neutral mid-tier verdict when the LLM call fails entirely."""
    mid_verdict = (
        recruiter["verdict_options"][1]
        if len(recruiter["verdict_options"]) > 1
        else recruiter["verdict_options"][0]
    )
    return {
        "agent":       agent_type,
        "name":        recruiter["name"],
        "role":        recruiter["role"],
        "verdict":     mid_verdict,
        "confidence":  60,
        "comment":     f"{recruiter['name']} evaluation unavailable (LLM call failed).",
        "red_flags":   [],
        "hire_reasons": [],
        "raw":         {},
        "source":      "llm_hr_fallback",
    }


# ══════════════════════════════════════════════════════════════════════════════
#  PANEL SYNTHESIS
# ══════════════════════════════════════════════════════════════════════════════


async def _synthesize_panel(
    agent_reports: dict,
    seed: str,
    client: httpx.AsyncClient,
) -> dict:
    """Ask the LLM to synthesize all 4 verdicts into a final recommendation."""
    summaries = []
    for agent_type, r in agent_reports.items():
        summaries.append(
            f"{r['name']} ({r['role']}): {r['verdict']} @ {r['confidence']}%\n"
            f"  Comment:    {r['comment']}\n"
            f"  Red flags:  {'; '.join(r.get('red_flags',   [])) or 'none'}\n"
            f"  Positives:  {'; '.join(r.get('hire_reasons', [])) or 'none'}"
        )

    user_prompt = (
        "=== PANEL ASSESSMENTS ===\n"
        + "\n\n".join(summaries)
        + f"\n\n=== ORIGINAL CANDIDATE BRIEF ===\n{seed[:500]}\n\n"
        "Synthesize these assessments into a final hiring recommendation. "
        "Respond ONLY with the JSON object. No preamble, no markdown."
    )

    try:
        raw    = await _call_llm(SYNTHESIS_SYSTEM, user_prompt, "PanelSynthesis", client)
        parsed = _parse_json_response(raw, "PanelSynthesis")

        shortlist_prob = int(parsed.get("shortlist_probability", 0))
        shortlist_prob = max(0, min(100, shortlist_prob))

        logger.info(
            f"LLM_HR [Panel]: verdict={parsed.get('final_verdict')}, "
            f"shortlist_probability={shortlist_prob}%"
        )
        return parsed
    except Exception as e:
        logger.warning(
            f"LLM_HR [PanelSynthesis] failed: {e} — using calculated fallback"
        )
        return _calculate_panel_fallback(agent_reports)


def _calculate_panel_fallback(agent_reports: dict) -> dict:
    """Fallback panel synthesis using simple vote counting."""
    positive_count = sum(
        1
        for agent_type, r in agent_reports.items()
        if r["verdict"] in RECRUITERS[agent_type]["positive_verdicts"]
    )
    confidences = [r["confidence"] for r in agent_reports.values()]
    avg_conf    = sum(confidences) // len(confidences) if confidences else 60

    if positive_count >= 3:
        verdict = "STRONG_CANDIDATE"
        prob    = min(int(avg_conf * 1.1), 95)
    elif positive_count == 2:
        verdict = "POTENTIAL"
        prob    = avg_conf
    elif positive_count == 1:
        verdict = "BORDERLINE"
        prob    = max(int(avg_conf * 0.7), 30)
    else:
        verdict = "NEEDS_WORK"
        prob    = max(int(avg_conf * 0.4), 15)

    return {
        "shortlist_probability": prob,
        "final_verdict":         verdict,
        "panel_consensus":       f"{positive_count} of 4 panelists recommended advancing",
        "key_strengths":         [],
        "key_concerns":          [],
        "hiring_recommendation": (
            f"Based on panel votes ({positive_count}/4 positive), candidate is {verdict}."
        ),
        "suggested_next_step": "Phone screen" if positive_count >= 2 else "Reject",
    }


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════


async def run_llm_hr_simulation(seed: str) -> dict:
    """
    Run all 4 recruiter evaluations concurrently, then synthesize.
    Returns a dict in the same shape as the old mirrorfish_result.
    """
    logger.info("LLM_HR: Starting panel simulation...")

    async with httpx.AsyncClient() as client:
        # ── Step 1: All 4 recruiters in parallel ──────────────────────────────
        tasks = {
            agent_type: _evaluate_as_recruiter(agent_type, recruiter, seed, client)
            for agent_type, recruiter in RECRUITERS.items()
        }
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)

        agent_reports: dict = {}
        for agent_type, result in zip(tasks.keys(), results):
            if isinstance(result, Exception):
                logger.warning(f"LLM_HR [{agent_type}] exception: {result}")
                agent_reports[agent_type] = _fallback_agent_report(
                    agent_type, RECRUITERS[agent_type]
                )
            else:
                agent_reports[agent_type] = result

        # ── Step 2: Panel synthesis ────────────────────────────────────────────
        synthesis = await _synthesize_panel(agent_reports, seed, client)

    shortlist_prob = synthesis.get("shortlist_probability", 0)
    logger.info(
        f"LLM_HR: Simulation complete — shortlist_probability={shortlist_prob}%"
    )

    return {
        "agent_reports": agent_reports,
        "mirrorfish_report": {          # key name kept for main.py compat
            "raw":                json.dumps(synthesis),
            "shortlist_probability": shortlist_prob,
            "simulation_id":      "llm_hr_direct",
            "project_id":         "llm_hr_direct",
            "graph_id":           "llm_hr_direct",
            "source":             "llm_hr_simulation",
            "synthesis":          synthesis,
        },
    }
