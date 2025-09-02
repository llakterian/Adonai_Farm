# Railway-optimized Dockerfile for Adonai Farm Management System
FROM node:18-alpine

# Install required system dependencies
RUN apk add --no-cache sqlite

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install root dependencies
RUN npm install

# Copy all source code
COPY . .

# Build frontend during Docker build
RUN cd frontend && npm install && npm run build

# Install backend dependencies
RUN cd backend && npm install --production

# Expose the port that Railway expects
EXPOSE 4000

# Use Railway's start command
CMD ["npm", "run", "railway:start"]