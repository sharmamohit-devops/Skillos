# Multi-stage Docker build for Gap Analysis Application
# This allows judges to run the complete application with a single command

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
COPY frontend/bun.lock* ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Python Backend
FROM python:3.11-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY python-backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Copy backend code
COPY python-backend/ ./

# Create necessary directories
RUN mkdir -p data/raw data/processed logs

# Stage 3: Final stage with Nginx to serve frontend and proxy to backend
FROM nginx:alpine AS final

# Install Python and required packages in the final stage
RUN apk add --no-cache python3 py3-pip curl

# Copy Python backend
WORKDIR /app
COPY --from=backend /app ./backend/
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend /usr/local/bin /usr/local/bin

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create startup script
RUN cat > /start.sh << 'EOF'
#!/bin/sh
echo "Starting Gap Analysis Application..."

# Start Python backend in background
cd /app/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &

# Wait a moment for backend to start
sleep 5

# Start Nginx
nginx -g 'daemon off;'
EOF

RUN chmod +x /start.sh

# Expose ports
EXPOSE 80 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80 && curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["/start.sh"]