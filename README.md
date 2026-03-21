# 🎯 GapLens - AI-Powered Resume & Job Matching Platform

> **AI Hackathon Project** - Intelligent skill gap analysis and career roadmap generation

## 🚀 Quick Start for Judges

### Option 1: Docker Setup (Recommended)
```bash
git clone https://github.com/sharmamohit-devops/Gap-Analysis.git
cd Gap-Analysis
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

## 🎯 What is GapLens?

**GapLens** is an AI-powered platform that revolutionizes the job application process by providing intelligent analysis of the gap between candidate skills and job requirements.

### 🔍 Core Features

#### 1. **Smart Resume Analysis**
- 📄 Upload PDF/DOC/DOCX resume files
- 🤖 AI-powered text extraction and parsing
- 📊 Skill identification and categorization
- 🎯 Experience level assessment

#### 2. **Job Description Matching**
- 📝 Paste or upload job descriptions
- 🔍 Requirement extraction and analysis
- 🎯 Skill matching algorithms
- 📈 Compatibility scoring

#### 3. **Intelligent Gap Analysis**
- 🧠 AI-powered skill gap identification
- 📊 Visual gap analysis with interactive charts
- 🎯 Priority-based skill recommendations
- 📈 Match percentage calculation

#### 4. **Personalized Learning Roadmap**
- 🛣️ Animated roadmap visualization
- 📚 Skill-specific learning resources
- ⏱️ Time commitment estimates
- 🎯 Milestone tracking system

#### 5. **Advanced Analytics**
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

### 1. **AI-Powered Analysis Engine**
```python
# Advanced NLP for skill extraction
skills = extract_skills_with_ml(resume_text)
requirements = parse_job_requirements(jd_text)
gap_analysis = calculate_skill_gaps(skills, requirements)
```

### 2. **Interactive Roadmap Visualization**
- Curved road animations with realistic physics
- Car following path with banking effects
- Milestone markers with progress tracking
- Landscape elements for immersion

### 3. **Smart File Validation**
- Multi-layer validation (extension + MIME type)
- File size limits and security checks
- User-friendly error messages
- Visual feedback system

### 4. **Responsive Design**
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Progressive enhancement

---

## 📊 Demo Workflow

### Step 1: Upload Resume
```
User uploads PDF/DOCX → AI extracts text → Skills identified
```

### Step 2: Add Job Description
```
Paste JD text → Requirements parsed → Skills categorized
```

### Step 3: AI Analysis
```
ML algorithms compare → Gap analysis → Scoring calculation
```

### Step 4: Results & Roadmap
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
- ✅ AI-powered skill gap analysis
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

- 🤖 Advanced AI models for better accuracy
- 🔗 Integration with job portals
- 📱 Mobile app development
- 🌐 Multi-language support
- 📊 Advanced analytics dashboard

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

*Transforming career development through intelligent technology*