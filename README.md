# 🎯 Gap Analysis - AI-Powered Resume & Job Matching Platform

## 🚀 Quick Start for Judges

This application can be run with a single Docker command! No complex setup required.

### Prerequisites
- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)

### 🐳 Run with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sharmamohit-devops/Gap-Analysis.git
   cd Gap-Analysis
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:8000
   - **API Documentation:** http://localhost:8000/docs

### 🎯 What This Application Does

**Gap Analysis** is an AI-powered platform that:
- 📄 Analyzes resumes and job descriptions
- 🔍 Identifies skill gaps between candidates and job requirements
- 📊 Provides detailed matching scores and recommendations
- 🛣️ Generates personalized learning roadmaps
- 📈 Offers advanced analytics and insights

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Nginx Proxy    │    │ Python Backend  │
│   (Port 3000)   │◄──►│   (Port 80)     │◄──►│   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🛠️ Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui components
- React Query for state management
- Supabase integration

**Backend:**
- FastAPI (Python)
- Machine Learning models for analysis
- NLTK for text processing
- Pandas for data manipulation
- RESTful API design

**Infrastructure:**
- Docker containerization
- Nginx reverse proxy
- Multi-stage builds for optimization

### 📋 Features Demonstration

1. **Upload Resume:** Upload PDF/DOCX resume files
2. **Job Description Input:** Paste or type job requirements
3. **AI Analysis:** Get comprehensive skill gap analysis
4. **Visual Reports:** Interactive charts and scoring
5. **Learning Roadmap:** Personalized skill development path
6. **Export Results:** Download analysis as PDF

### 🔧 Development Setup (Optional)

If you want to run in development mode:

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd python-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 📊 API Endpoints

- `POST /analyze-resume` - Analyze resume against job description
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive API documentation

### 🐛 Troubleshooting

**If Docker build fails:**
```bash
docker system prune -a
docker-compose up --build --force-recreate
```

**If ports are busy:**
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:80"    # Frontend on port 3001
  - "8001:8000"  # Backend on port 8001
```

### 📝 Environment Variables

The application works out of the box, but you can customize:

```env
# Backend
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_database_url

# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
```

### 🏆 Judging Criteria Alignment

- **Innovation:** AI-powered skill gap analysis with ML models
- **Technical Excellence:** Modern tech stack, containerized deployment
- **User Experience:** Intuitive UI with real-time feedback
- **Scalability:** Microservices architecture, Docker deployment
- **Code Quality:** TypeScript, proper error handling, comprehensive testing

### 📞 Support

For any issues during evaluation, please check:
1. Docker is running
2. Ports 3000 and 8000 are available
3. Check logs: `docker-compose logs`

---

**Built with ❤️ for the AI Hackathon**

*This application demonstrates modern full-stack development with AI integration, containerized deployment, and production-ready architecture.*