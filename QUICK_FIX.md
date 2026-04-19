# 🔥 QUICK FIX - "Failed to fetch" Error

## Problem
Frontend shows: **"Analysis failed - Failed to fetch"**

## Solution (3 Steps)

### 1️⃣ Start Backend (Terminal 1)
```bash
cd python-backend
pip install -r requirements.txt
python main.py
```

**OR** double-click `start-backend.bat` (Windows)

### 2️⃣ Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

**OR** double-click `start-frontend.bat` (Windows)

### 3️⃣ Open Browser
Go to: `http://localhost:5173`

---

## ✅ Success Check

**Backend running?**
```bash
curl http://localhost:8000/health
```
Should return: `{"status":"healthy","models_loaded":true}`

**Frontend running?**
- Browser shows the app
- No "Failed to fetch" error

---

## 🎯 That's It!

Keep both terminals open while using the app.

**Need more help?** See `START_BACKEND.md` for detailed troubleshooting.
