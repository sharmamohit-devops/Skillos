# 🎨 Visual System Flow - SkillOS

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                     (Frontend - React)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Upload Resume + JD
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API ENDPOINT: /analyze                       │
│                  (python-backend/main.py)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Process Request
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: ML PIPELINE                          │
│                  (Pure ML - NO Gemini API)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐                                          │
│  │ ResumeParser     │ → Extract: name, skills, experience      │
│  └──────────────────┘                                          │
│           ↓                                                     │
│  ┌──────────────────┐                                          │
│  │ JDParser         │ → Extract: role, requirements            │
│  └──────────────────┘                                          │
│           ↓                                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ SkillExtractor (6 Layers)                                │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Layer 1: Exact Match        → "python" = "python"       │  │
│  │ Layer 2: Synonym Match      → "js" = "javascript"       │  │
│  │ Layer 3: Semantic (ML)      → cosine_similarity > 0.7   │  │
│  │ Layer 4: Depth Detection    → beginner/inter/advanced   │  │
│  │ Layer 5: Role Weighting     → High/Medium/Low           │  │
│  │ Layer 6: Risk Analysis      → Identify red flags        │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ↓                                                     │
│  ┌──────────────────┐                                          │
│  │ Gap Intelligence │ → Missing skills + dependencies         │
│  └──────────────────┘                                          │
│           ↓                                                     │
│  ┌──────────────────┐                                          │
│  │ Evaluation       │ → Match score, strengths, weaknesses    │
│  └──────────────────┘                                          │
│           ↓                                                     │
│  ┌──────────────────┐                                          │
│  │ Pathfinder       │ → Learning roadmap with time estimates  │
│  └──────────────────┘                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 3. ML Result Object
                              ↓
                    ┌─────────────────────┐
                    │   ML RESULT DATA    │
                    ├─────────────────────┤
                    │ • candidate_profile │
                    │ • job_analysis      │
                    │ • skill_analysis    │
                    │ • gap_intelligence  │
                    │ • evaluation        │
                    │ • roadmap_context   │
                    │ • learning_pathway  │
                    └─────────────────────┘
                              │
                              │ 4. Pass to Agents
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 2: AGENT SIMULATION                       │
│              (Additional Layer on ML Results)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                  ┌──────────────────────┐                       │
│                  │ AgentOrchestrator    │                       │
│                  │ .run_simulation()    │                       │
│                  └──────────────────────┘                       │
│                           │                                     │
│         ┌─────────────────┼─────────────────┐                  │
│         │                 │                 │                  │
│         ↓                 ↓                 ↓                  │
│  ┌──────────┐      ┌──────────┐     ┌──────────┐             │
│  │  ATLAS   │      │  PRIYA   │     │   ALEX   │             │
│  │ ATS Bot  │      │ HR Screen│     │ Startup  │             │
│  ├──────────┤      ├──────────┤     ├──────────┤             │
│  │ Checks:  │      │ Checks:  │     │ Checks:  │             │
│  │ • Keywords│     │ • Culture│     │ • Shipped│             │
│  │ • Format │      │ • Progres│     │ • Breadth│             │
│  │ • ATS    │      │ • Soft   │     │ • Execut │             │
│  │   Score  │      │   Skills │     │   -ion   │             │
│  └──────────┘      └──────────┘     └──────────┘             │
│         │                 │                 │                  │
│         └─────────────────┼─────────────────┘                  │
│                           │                                     │
│                           ↓                                     │
│                  ┌──────────────┐                              │
│                  │  DR. CHEN    │                              │
│                  │ Tech Lead    │                              │
│                  ├──────────────┤                              │
│                  │ Checks:      │                              │
│                  │ • Depth      │                              │
│                  │ • Stack      │                              │
│                  │ • Complexity │                              │
│                  └──────────────┘                              │
│                           │                                     │
│                           │ All agents run in parallel         │
│                           ↓                                     │
│                  ┌──────────────────┐                          │
│                  │ Calculate:       │                          │
│                  │ • Overall Score  │                          │
│                  │ • Verdict        │                          │
│                  │ • Consensus      │                          │
│                  └──────────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 5. Agent Reports
                              ↓
                    ┌─────────────────────┐
                    │  AGENT REPORT DATA  │
                    ├─────────────────────┤
                    │ • agent_reports     │
                    │ • overall_score     │
                    │ • verdict           │
                    │ • panel_consensus   │
                    └─────────────────────┘
                              │
                              │ 6. Merge Results
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 3: MERGE & RETURN                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐         ┌────────────────┐                 │
│  │  ML Results    │    +    │ Agent Reports  │                 │
│  │  (Original)    │         │ (Additional)   │                 │
│  └────────────────┘         └────────────────┘                 │
│         │                            │                          │
│         └────────────┬───────────────┘                          │
│                      ↓                                          │
│            ┌──────────────────────┐                            │
│            │  COMPLETE RESPONSE   │                            │
│            ├──────────────────────┤                            │
│            │ ML Analysis:         │                            │
│            │ • Scores             │                            │
│            │ • Skills             │                            │
│            │ • Gaps               │                            │
│            │ • Roadmap            │                            │
│            │                      │                            │
│            │ Agent Simulation:    │                            │
│            │ • 4 Agent Reports    │                            │
│            │ • Panel Score        │                            │
│            │ • Verdict            │                            │
│            │ • Consensus          │                            │
│            └──────────────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 7. Return to Frontend
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY                             │
│                   (Results.tsx)                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              HERO SECTION                                │  │
│  │  • Candidate Name                                        │  │
│  │  • Job Role                                              │  │
│  │  • Overall Match Score (ML)                              │  │
│  │  • Skill Match % (ML)                                    │  │
│  │  • Matched/Partial/Missing counts (ML)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         PROFILE vs JOB REQUIREMENTS                      │  │
│  │  • Your Skills (ML)                                      │  │
│  │  • Required Skills (ML)                                  │  │
│  │  • Color-coded matches (ML)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         STRENGTHS & WEAKNESSES                           │  │
│  │  • Strengths list (ML)                                   │  │
│  │  • Weaknesses list (ML)                                  │  │
│  │  • Risk factors (ML)                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         VIRTUAL HR PANEL (NEW!)                          │  │
│  │  ┌────────────┐  ┌────────────┐                          │  │
│  │  │   ATLAS    │  │   PRIYA    │                          │  │
│  │  │ ATS: PASS  │  │ HR: SHORT  │                          │  │
│  │  │ Conf: 78%  │  │ Conf: 73%  │                          │  │
│  │  └────────────┘  └────────────┘                          │  │
│  │  ┌────────────┐  ┌────────────┐                          │  │
│  │  │    ALEX    │  │  DR. CHEN  │                          │  │
│  │  │ Start: HIRE│  │ Tech: YES  │                          │  │
│  │  │ Conf: 82%  │  │ Conf: 75%  │                          │  │
│  │  └────────────┘  └────────────┘                          │  │
│  │                                                            │  │
│  │  Panel Score: 77%                                         │  │
│  │  Verdict: STRONG_CANDIDATE                                │  │
│  │  Consensus: "3 of 4 agents recommend advancing"          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         LEARNING ROADMAP CTA                             │  │
│  │  • "X skills to master"                                  │  │
│  │  • [Start Roadmap] button                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 8. Click "Start Roadmap"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ROADMAP PAGE                                 │
│              (ResumeJDRoadmap.tsx)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         LEARNING PATHWAY (from ML)                       │  │
│  │                                                            │  │
│  │  Step 1: Learn React                                     │  │
│  │  • Duration: 25 hours                                    │  │
│  │  • Resources: [React Docs, Tutorials]                    │  │
│  │  • Projects: [E-commerce App]                            │  │
│  │                                                            │  │
│  │  Step 2: Learn Docker                                    │  │
│  │  • Duration: 15 hours                                    │  │
│  │  • Resources: [Docker Docs, Tutorials]                   │  │
│  │  • Projects: [Containerize App]                          │  │
│  │                                                            │  │
│  │  Step 3: Learn AWS                                       │  │
│  │  • Duration: 30 hours                                    │  │
│  │  • Resources: [AWS Docs, Courses]                        │  │
│  │  • Projects: [Deploy to Cloud]                           │  │
│  │                                                            │  │
│  │  ... (more steps)                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Takeaways

### 1. ML Pipeline (PRESERVED)
- ✅ Runs FIRST
- ✅ Uses pure ML (Sentence Transformers, NLTK)
- ✅ NO Gemini API
- ✅ Generates scores, gaps, roadmap

### 2. Agent System (ADDITIONAL)
- ✅ Runs AFTER ML pipeline
- ✅ Receives ML results as input
- ✅ 4 agents evaluate in parallel
- ✅ Generates agent reports

### 3. Data Merge (CORRECT)
- ✅ ML results + Agent reports
- ✅ Both sent to frontend
- ✅ Both displayed on Results page

### 4. Frontend Display (COMPLETE)
- ✅ Shows ML analysis
- ✅ Shows agent reports
- ✅ Shows learning roadmap

---

## 🎯 Agent Evaluation Criteria

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT PERSONAS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ATLAS (ATS Bot)                                           │
│  ├─ Keyword Match: 70%                                     │
│  ├─ Format Score: 85%                                      │
│  ├─ Missing Keywords: ["docker", "aws"]                   │
│  └─ Verdict: PASS / REVIEW / FAIL                         │
│                                                             │
│  PRIYA (HR Screener)                                       │
│  ├─ Culture Fit: 75%                                       │
│  ├─ Progression: 80%                                       │
│  ├─ Soft Skills: 70%                                       │
│  ├─ Red Flags: ["Job hopping"]                            │
│  ├─ Green Flags: ["Strong leadership"]                    │
│  └─ Verdict: SHORTLIST / HOLD / REJECT                    │
│                                                             │
│  ALEX (Startup HM)                                         │
│  ├─ Execution: 82%                                         │
│  ├─ Breadth: 75%                                           │
│  ├─ Startup Fit: 78%                                       │
│  ├─ Excited About: ["Shipped projects"]                   │
│  ├─ Concerns: ["Missing DevOps"]                          │
│  └─ Verdict: HIRE / MAYBE / PASS                          │
│                                                             │
│  DR. CHEN (Tech Lead)                                      │
│  ├─ Depth: 75%                                             │
│  ├─ Stack: 80%                                             │
│  ├─ Complexity: 70%                                        │
│  ├─ Impressed By: ["System design"]                       │
│  ├─ Concerns: ["No testing"]                              │
│  └─ Verdict: STRONG_YES / YES / NO / STRONG_NO            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ System Status

**EVERYTHING IS WORKING!** 🎉

- ✅ ML pipeline intact
- ✅ Agent system integrated
- ✅ Data flow correct
- ✅ Frontend displays both
- ✅ Roadmap shows properly
- ✅ NO Gemini API (pure ML)

**No code changes needed - ready for deployment!** 🚀
