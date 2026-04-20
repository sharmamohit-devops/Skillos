import httpx
import os
import json
import logging
import re

logger = logging.getLogger(__name__)

legacy_base_url = os.getenv("LLM_BASE_URL", "")
legacy_model = os.getenv("LLM_MODEL", "")

LLM_BASE_URL = os.getenv("FIREWORKS_BASE_URL") or (
    legacy_base_url if "fireworks" in legacy_base_url.lower() else "https://api.fireworks.ai/inference/v1"
)
LLM_API_KEY = os.getenv("FIREWORKS_API_KEY", "")
LLM_MODEL = os.getenv("FIREWORKS_MODEL") or legacy_model or "accounts/fireworks/models/qwen3-8b"
LLM_TIMEOUT = float(os.getenv("FIREWORKS_TIMEOUT") or os.getenv("LLM_TIMEOUT", "60"))

if "fireworks" in LLM_BASE_URL.lower() and LLM_MODEL == "accounts/fireworks/models/llama-v3p1-70b-instruct":
    # This older default commonly returns 404 on the shared serverless endpoint because it
    # requires an on-demand deployment. Use a serverless-safe default instead.
    LLM_MODEL = "accounts/fireworks/models/qwen3-8b"

async def _call_llm(system_prompt: str, user_prompt: str, label: str) -> str:
    """Single async LLM call."""
    if not LLM_API_KEY:
        logger.warning(f"{label}: FIREWORKS_API_KEY not set!")
        raise ValueError("FIREWORKS_API_KEY missing")

    url = LLM_BASE_URL.rstrip("/")
    if not url.endswith("/chat/completions"):
        url = f"{url}/chat/completions"

    payload = {
        "model": LLM_MODEL,
        "max_tokens": 1000,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt + "\nReturn strict JSON only. Do not include <think> tags, analysis, or markdown."},
            {"role": "user", "content": user_prompt},
        ],
    }
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }
    
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(url, json=payload, headers=headers, timeout=LLM_TIMEOUT)
            r.raise_for_status()
            data = r.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.error(f"{label} LLM call failed: {e}")
            raise

def _loads_loose_json(text: str):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Common model mistake: trailing commas before } or ]
        normalized = re.sub(r",(\s*[}\]])", r"\1", text)
        return json.loads(normalized)


def _extract_json(text: str) -> dict | list:
    clean = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    clean = re.sub(r"```(?:json)?", "", clean).replace("```", "").strip()
    m = re.search(r"(\[.*\]|\{.*\})", clean, re.DOTALL)
    if m:
        candidate = m.group()
        try:
            return _loads_loose_json(candidate)
        except json.JSONDecodeError:
            # Try to salvage a suggestions array from a nearly-correct object.
            suggestions_match = re.search(r'"suggestions"\s*:\s*(\[[\s\S]*\])', candidate, re.DOTALL)
            if suggestions_match:
                return {"suggestions": _loads_loose_json(suggestions_match.group(1))}
            raise
    return _loads_loose_json(clean)


def _extract_resume_skills(resume_text: str) -> list[str]:
    common_skills = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL",
        "AWS", "Docker", "Kubernetes", "Git", "FastAPI", "MongoDB", "PostgreSQL"
    ]
    lower = resume_text.lower()
    found = [skill for skill in common_skills if skill.lower() in lower]
    return found or ["software development", "problem solving", "team collaboration"]


def _fallback_email(resume_text: str, company_name: str, hiring_manager: str) -> dict:
    skills = _extract_resume_skills(resume_text)[:3]
    skill_text = ", ".join(skills)
    return {
        "subject": f"Application for {company_name} - {skills[0]} Focus",
        "body": (
            f"Dear {hiring_manager},\n\n"
            f"I am writing to express my interest in opportunities at {company_name}. "
            f"My background includes {skill_text}, and I have hands-on experience building practical software solutions.\n\n"
            f"I would welcome the opportunity to contribute these skills to your team and discuss how my experience aligns with your needs.\n\n"
            f"Best regards,\n[Your Name]"
        ),
        "highlights": [
            f"Hands-on experience in {skills[0]}",
            f"Working knowledge of {skills[1] if len(skills) > 1 else skills[0]}",
            f"Practical delivery focus with {skills[2] if len(skills) > 2 else 'strong collaboration'}",
        ],
    }


def _fallback_job_suggestions(resume_text: str) -> list[dict]:
    skills = _extract_resume_skills(resume_text)
    primary = skills[0]
    return [
        {
            "id": "1",
            "title": f"{primary} Developer",
            "company": "TechCorp",
            "location": "Remote",
            "salary": "$90,000 - $120,000 per year",
            "postedDate": "Recently posted",
            "description": "Build and maintain production applications using modern engineering practices.",
            "skills": skills[:4],
            "matchScore": 85,
        },
        {
            "id": "2",
            "title": "Full Stack Engineer",
            "company": "Startup Labs",
            "location": "Hybrid",
            "salary": "$95,000 - $130,000 per year",
            "postedDate": "Recently posted",
            "description": "Work across frontend and backend systems to deliver product features quickly.",
            "skills": skills[:4],
            "matchScore": 80,
        },
        {
            "id": "3",
            "title": "Backend Engineer",
            "company": "CloudWorks",
            "location": "Remote",
            "salary": "$100,000 - $135,000 per year",
            "postedDate": "Recently posted",
            "description": "Develop APIs, services, and integrations for customer-facing platforms.",
            "skills": skills[:4],
            "matchScore": 78,
        },
    ]

async def generate_tailored_email(resume_text: str, jd_text: str, company_name: str = "Company", hiring_manager: str = "Hiring Manager") -> dict:
    prompt = f"""
You are an expert career coach and professional writer. Write a compelling, personalized job application email.

RESUME:
{resume_text[:2000]}

JOB DESCRIPTION:
{jd_text[:2000]}

COMPANY: {company_name}
HIRING MANAGER: {hiring_manager}

Write a professional email with:
1. A compelling subject line (max 60 characters)
2. A personalized body that opens with a strong hook, highlights 2-3 most relevant skills/experiences, shows enthusiasm, and includes a clear call to action. Keep it concise (150-250 words).
3. 3 key selling points/highlights that make this candidate a great fit.

Format the response ONLY as JSON:
{{
  "subject": "email subject",
  "body": "email body with proper paragraphs",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"]
}}
"""
    try:
        res = await _call_llm("You are an expert career coach.", prompt, "TailoredEmail")
        return _extract_json(res)
    except Exception as e:
        logger.error(f"TailoredEmail failed: {e}")
        return _fallback_email(resume_text, company_name, hiring_manager)

async def generate_job_suggestions(resume_text: str) -> list:
    prompt = f"""
You are an expert career advisor. Analyze the following resume and suggest 5 realistic job opportunities.

RESUME:
{resume_text[:3000]}

Based on the resume, provide 5 job suggestions in JSON format. Each job should include:
- Realistic job title matching experience
- Well-known company in relevant industry
- Location (Remote/On-site)
- Salary range appropriate for role
- Key skills from resume that match
- Match score (0-100)

Format ONLY as JSON object:
{{
  "suggestions": [
    {{
      "id": "1",
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location",
      "salary": "$X - $Y per year",
      "postedDate": "Posted X days ago",
      "description": "Brief job description (2-3 sentences)",
      "skills": ["skill1", "skill2"],
      "matchScore": 85
    }}
  ]
}}
"""
    try:
        res = await _call_llm("You are an expert career advisor.", prompt, "JobSuggestions")
        parsed = _extract_json(res)
        if isinstance(parsed, dict):
            return parsed.get("suggestions")
        return parsed
    except Exception as e:
        logger.error(f"JobSuggestions failed: {e}")
        return _fallback_job_suggestions(resume_text)
