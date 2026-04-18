# 🎯 SkillOS - Virtual HR Simulation Platform

> **AI Hackathon Project** - Virtual HR panel with 4 specialized AI agents for resume analysis

## 📁 Project Structure

```
SkillOS/
├── frontend/              # React + TypeScript (15,000+ lines)
│   ├── src/
│   │   ├── components/   # 80+ React components
│   │   ├── pages/        # 10+ main pages including Virtual HR
│   │   ├── lib/          # Utilities & text extraction
│   │   └── types/        # TypeScript interfaces
│   └── package.json      # 80+ dependencies
│
├── python-backend/       # FastAPI + ML (5,000+ lines)
│   ├── agents/          # 4 Virtual HR AI agents
│   │   ├── ats_agent.py        # ATLAS - ATS System
│   │   ├── hr_agent.py         # PRIYA - HR Screener  
│   │   ├── startup_agent.py    # ALEX - Startup HM
│   │   └── tech_agent.py       # DR. CHEN - Technical Lead
│   ├── models/          # ML models & analysis
│   │   ├── skill_extractor.py      # 774 lines
│   │   ├── adaptive_pathfinder.py  # 500+ lines
│   │   ├── resume_parser.py
│   │   └── jd_parser.py
│   ├── services/        # Agent orchestration
│   │   └── agent_orchestrator.py
│   ├── data/            # Training datasets
│   └── main.py          # FastAPI app (300+ lines)
│
├── docker-compose.yml   # Container orchestration
├── Dockerfile          # Multi-stage build
└── README.md           # This file
```

---

## 🚀 Quick Start for Judges

### Option 1: Docker Setup (Recommended)
```bash
git clone https://github.com/sharmamohit-devops/SkillOS.git
cd SkillOS
docker-compose up --build
```

### Option 2: Manual Setup
```bash
# Backend Setup
cd python-backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend Setup (New Terminal)
cd frontend
npm install
npm run dev
```

### 🌐 Access Points
- **Frontend:** http://localhost:3000 (Docker) or http://localhost:5173 (Manual)
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## 🎯 What is SkillOS?

**SkillOS** is a Virtual HR Simulation Platform that revolutionizes resume evaluation through 4 specialized AI agents, each providing unique professional perspectives on candidate assessment.

### 🤖 Virtual HR Panel

#### Meet Your AI Agents:
- **🤖 ATLAS** - ATS System Agent (Resume format & keyword screening)
- **👩‍💼 PRIYA** - HR Screener Agent (Cultural fit & experience evaluation)  
- **🚀 ALEX** - Startup Hiring Manager (Execution potential & adaptability)
- **👨‍💻 DR. CHEN** - Technical Lead (Technical skills & depth assessment)

### 🔍 Core Features

#### 1. **Virtual HR Comments** (Resume-Only Analysis)
- 📄 Upload resume and get instant feedback from 4 AI agents
- 🤖 Each agent provides specialized perspective
- 📊 No job description needed - general resume review
- 🎯 Comprehensive feedback on resume quality

#### 2. **Resume-JD Match Analysis** 
- 📝 Upload resume + job description for detailed matching
- 🔍 Skill gap analysis and compatibility scoring
- 📈 Personalized learning roadmap generation
- ⏱️ Time commitment planning for skill development

#### 3. **Virtual HR Simulation**
- 🎭 4 distinct AI agent personalities
- 💬 Realistic HR panel discussion simulation
- 🎯 Multi-perspective candidate evaluation
- 📊 Consensus-based final verdict

#### 4. **Intelligent Gap Analysis**
- 🧠 AI-powered skill gap identification
- 📊 Visual gap analysis with interactive charts
- 🎯 Priority-based skill recommendations
- 📈 Match percentage calculation

#### 5. **Personalized Learning Roadmap**
- 🛣️ Animated roadmap visualization
- 📚 Skill-specific learning resources
- ⏱️ Time commitment estimates
- 🎯 Milestone tracking system

#### 6. **Advanced Analytics**
- 📊 Interactive charts and visualizations
- 📈 Progress tracking
- 📋 Exportable PDF reports
- 🎯 Performance insights

---

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** + **shadcn/ui** for modern UI
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **React Query** for state management

### Backend Stack
- **FastAPI** (Python) for high-performance API
- **Machine Learning** models for skill analysis
- **NLTK** for natural language processing
- **Pandas** for data manipulation
- **Scikit-learn** for ML algorithms

### Infrastructure
- **Docker** containerization
- **Nginx** reverse proxy
- **Multi-stage builds** for optimization
- **Health checks** and monitoring

---

## 🎨 Key Innovations

### 1. **Virtual HR Agent System**
```python
# 4 specialized AI agents with unique personalities
agents = {
    "ATLAS": ATSAgent(),      # Resume format & ATS compatibility
    "PRIYA": HRAgent(),       # Cultural fit & soft skills
    "ALEX": StartupAgent(),   # Adaptability & execution
    "DR_CHEN": TechAgent()    # Technical depth & expertise
}
```

### 2. **AI-Powered Analysis Engine**
```python
# Advanced NLP for skill extraction
skills = extract_skills_with_ml(resume_text)
requirements = parse_job_requirements(jd_text)
gap_analysis = calculate_skill_gaps(skills, requirements)
```

### 3. **Interactive Roadmap Visualization**
- Curved road animations with realistic physics
- Car following path with banking effects
- Milestone markers with progress tracking
- Landscape elements for immersion

### 4. **Smart File Validation**
- Multi-layer validation (extension + MIME type)
- File size limits and security checks
- User-friendly error messages
- Visual feedback system

### 5. **Responsive Design**
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Progressive enhancement

---

## 📊 Demo Workflow

### Step 1: Choose Analysis Type
```
Virtual HR Comments → Resume only → 4 agent feedback
Resume-JD Match → Resume + JD → Gap analysis + roadmap
```

### Step 2: Upload Files
```
User uploads PDF/DOCX → AI extracts text → Skills identified
```

### Step 3: Add Job Description (if Resume-JD Match)
```
Paste JD text → Requirements parsed → Skills categorized
```

### Step 4: Virtual HR Simulation
```
4 AI agents analyze → Individual verdicts → Consensus building
```

### Step 5: Results & Roadmap
```
Visual dashboard → Learning path → Export report
```

---

## 🛠️ Development Features

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code consistency
- **Prettier** for formatting
- **Husky** for git hooks

### Testing
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **Testing Library** for component tests

### Performance
- **Code splitting** for faster loads
- **Lazy loading** for components
- **Image optimization**
- **Bundle analysis**

---

## 🔧 Configuration

### Environment Variables

**Backend (.env in python-backend/):**
```env
OPENAI_API_KEY=your_openai_key
DATABASE_URL=sqlite:///./data/app.db
```

**Frontend (.env in frontend/):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_API_URL=http://localhost:8000
```

---

## 📱 Screenshots & Demo

### Landing Page
- Modern hero section with animated elements
- Feature highlights with icons
- Call-to-action buttons

### Analysis Dashboard
- Interactive charts and graphs
- Skill gap visualization
- Progress indicators

### Learning Roadmap
- Animated road with curves
- Milestone markers
- Time estimates

---

## 🏆 Judging Criteria Alignment

### **Innovation & Creativity**
- ✅ Virtual HR simulation with 4 AI agent personalities
- ✅ Separated feature workflows (Virtual HR vs Resume-JD)
- ✅ Interactive roadmap visualization
- ✅ Smart file validation system
- ✅ Personalized learning paths

### **Technical Excellence**
- ✅ Modern tech stack (React 18, FastAPI)
- ✅ TypeScript for type safety
- ✅ Docker containerization
- ✅ Comprehensive testing

### **User Experience**
- ✅ Intuitive interface design
- ✅ Smooth animations and transitions
- ✅ Responsive mobile design
- ✅ Accessibility compliance

### **Scalability & Performance**
- ✅ Microservices architecture
- ✅ Optimized bundle sizes
- ✅ Efficient algorithms
- ✅ Caching strategies

### **Code Quality**
- ✅ Clean, maintainable code
- ✅ Proper error handling
- ✅ Documentation
- ✅ Best practices

---

## 🚀 Future Enhancements

- 🤖 More specialized AI agent roles (Legal, Finance, etc.)
- 🎥 Video interview simulation with agents
- 🔗 Integration with job portals and ATS systems
- 📱 Mobile app development
- 🌐 Multi-language support
- 📊 Advanced analytics dashboard
- 🎯 Industry-specific agent training

---

## 🤝 Contributing

This project was built for the AI Hackathon. For any questions or suggestions:

1. Check the API documentation at `/docs`
2. Review the code structure
3. Test the application thoroughly
4. Provide feedback for improvements

---

## 📄 License

This project is developed for educational and hackathon purposes.

---

## 🎉 Acknowledgments

- **AI Hackathon** organizers for the opportunity
- **Open source community** for amazing tools
- **Modern web technologies** that made this possible

---

**Built with ❤️ for the AI Hackathon 2024**

*Transforming career development through Virtual HR simulation*
