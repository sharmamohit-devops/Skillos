# 🚀 Quick Start Guide - Fix "Failed to fetch" Error

## ❌ Problem
Frontend shows: **"Analysis failed - Failed to fetch"**

## ✅ Solution
The Python backend is not running. You need to start it!

---

## 📋 Step-by-Step Fix

### Step 1: Install Python Dependencies

Open a terminal and run:

```bash
cd python-backend
pip install -r requirements.txt
```

**Wait for installation to complete** (may take 2-5 minutes)

### Step 2: Start the Backend Server

```bash
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal open!** The backend must stay running.

### Step 3: Test Backend is Working

Open a new terminal and run:

```bash
curl http://localhost:8000/health
```

You should see:
```json
{"status":"healthy","models_loaded":true}
```

### Step 4: Start Frontend (if not already running)

Open another terminal:

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

### Step 5: Test the Application

1. Open `http://localhost:5173` in your browser
2. Go to "Resume-JD Analysis"
3. Upload resume and JD
4. Click "Analyze & Generate Roadmap"
5. Should work now! ✅

---

## 🔧 Troubleshooting

### Issue: "pip: command not found"
**Solution**: Install Python first
- Windows: Download from https://python.org
- Mac: `brew install python3`
- Linux: `sudo apt install python3 python3-pip`

### Issue: "ModuleNotFoundError: No module named 'fastapi'"
**Solution**: Install dependencies
```bash
cd python-backend
pip install -r requirements.txt
```

### Issue: "Port 8000 is already in use"
**Solution**: Kill the existing process
- Windows: `netstat -ano | findstr :8000` then `taskkill /PID <PID> /F`
- Mac/Linux: `lsof -ti:8000 | xargs kill -9`

### Issue: Backend starts but frontend still shows "Failed to fetch"
**Solution**: Check CORS settings
1. Make sure backend shows: `INFO: Application startup complete`
2. Check browser console (F12) for CORS errors
3. Backend should have CORS middleware enabled (already configured in main.py)

---

## 📝 Quick Commands Reference

### Start Backend
```bash
cd python-backend
python main.py
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Check Backend Health
```bash
curl http://localhost:8000/health
```

### Check if Backend is Running
```bash
# Windows
netstat -ano | findstr :8000

# Mac/Linux
lsof -i:8000
```

---

## ✅ Success Indicators

**Backend is running correctly when you see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
SkillExtractor initialized with advanced features
Agent Orchestrator initialized with 4 agents
INFO:     Application startup complete.
```

**Frontend is working when:**
- No "Failed to fetch" error
- Analysis completes successfully
- Results page shows ML scores + 4 agent cards
- Roadmap page displays learning pathway

---

## 🎯 Common Mistakes

1. ❌ **Not starting the backend** - Frontend needs backend to be running!
2. ❌ **Wrong directory** - Make sure you're in `python-backend` folder
3. ❌ **Dependencies not installed** - Run `pip install -r requirements.txt` first
4. ❌ **Closing backend terminal** - Keep it open while using the app
5. ❌ **Wrong Python version** - Need Python 3.8 or higher

---

## 💡 Pro Tips

1. **Use two terminals**: One for backend, one for frontend
2. **Check backend logs**: Watch for errors in the backend terminal
3. **Test backend first**: Use `curl http://localhost:8000/health` before testing frontend
4. **Keep backend running**: Don't close the terminal while using the app

---

## 🚀 Full Startup Sequence

```bash
# Terminal 1 - Backend
cd python-backend
pip install -r requirements.txt  # First time only
python main.py                   # Keep running

# Terminal 2 - Frontend
cd frontend
npm install                      # First time only
npm run dev                      # Keep running

# Browser
# Open http://localhost:5173
```

---

## ✅ Verification Checklist

- [ ] Python installed (check: `python --version`)
- [ ] Dependencies installed (check: `pip list | grep fastapi`)
- [ ] Backend running (check: `curl http://localhost:8000/health`)
- [ ] Frontend running (check: browser shows app)
- [ ] No "Failed to fetch" error
- [ ] Analysis completes successfully

---

**Once both backend and frontend are running, the "Failed to fetch" error will be gone!** 🎉
