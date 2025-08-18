#!/bin/bash

# Farm Website Development Server Startup Script
# This script starts both backend and frontend servers with hot reloading

echo "🌾 Starting Adonai Farm Development Environment"
echo "=============================================="

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Development servers stopped"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Check if ports are already in use
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 4000 is already in use. Stopping existing process..."
    kill $(lsof -t -i:4000) 2>/dev/null
    sleep 2
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5173 is already in use. Stopping existing process..."
    kill $(lsof -t -i:5173) 2>/dev/null
    sleep 2
fi

# Start backend server with hot reloading
echo "🚀 Starting backend server on http://localhost:4000"
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:4000/api/public/images > /dev/null; then
    echo "❌ Backend failed to start properly"
    exit 1
fi

echo "✅ Backend server running (PID: $BACKEND_PID)"

# Start frontend server with hot reloading
echo "🚀 Starting frontend server on http://localhost:5173"
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "❌ Frontend failed to start properly"
    exit 1
fi

echo "✅ Frontend server running (PID: $FRONTEND_PID)"
echo ""
echo "🎉 Development environment is ready!"
echo "=================================="
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:4000"
echo "📊 API Test: http://localhost:4000/api/public/images"
echo ""
echo "🔥 Hot reloading is enabled for both servers"
echo "📝 Edit files in frontend/src/ or backend/ to see changes"
echo ""
echo "Press Ctrl+C to stop all servers"

# Keep script running and wait for user to stop
wait $BACKEND_PID $FRONTEND_PID