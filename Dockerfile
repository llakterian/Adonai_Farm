# Multi-stage build for Adonai Farm Management System
FROM node:18-alpine AS backend-build

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install --production

# Copy backend source
COPY backend/ ./

# Initialize database
RUN npm run migrate

# Frontend build stage
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Final production stage
FROM node:18-alpine

# Install sqlite3 for database
RUN apk add --no-cache sqlite

# Set working directory
WORKDIR /app

# Copy backend from backend-build stage
COPY --from=backend-build /app/backend ./backend

# Copy frontend build from frontend-build stage
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Install serve to serve frontend
RUN npm install -g serve

# Create startup script
RUN echo '#!/bin/sh' > start.sh && \
    echo 'cd /app/backend && npm start &' >> start.sh && \
    echo 'cd /app && serve -s frontend/dist -l 3000' >> start.sh && \
    chmod +x start.sh

# Expose ports
EXPOSE 3000 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start both services
CMD ["./start.sh"]