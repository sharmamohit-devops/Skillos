# Simple all-in-one Docker setup
FROM node:18-slim

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY python-backend/requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Install NLTK data
RUN python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')" || true

# Copy and build frontend
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

COPY frontend/ ./
RUN npm run build

# Copy backend
WORKDIR /app
COPY python-backend/ ./backend/

# Create directories
RUN mkdir -p data logs

# Create start script
RUN echo '#!/bin/bash\n\
echo "🚀 Starting Gap Analysis Application..."\n\
echo "📁 Starting frontend server on port 3000..."\n\
cd /app/frontend && npm run preview -- --host 0.0.0.0 --port 3000 &\n\
echo "🐍 Starting backend server on port 8000..."\n\
cd /app/backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000\n\
' > /start.sh && chmod +x /start.sh

EXPOSE 3000 8000

CMD ["/start.sh"]