#!/bin/bash

# Development Environment Status Check
echo "🌾 Adonai Farm Development Status Check"
echo "======================================="

# Check backend status
echo "🔧 Backend Status:"
if curl -s http://localhost:4000/api/public/images > /dev/null; then
    echo "  ✅ Backend is running on http://localhost:4000"
    echo "  📊 API responding correctly"
    
    # Test image API
    IMAGE_COUNT=$(curl -s http://localhost:4000/api/public/images | jq '.total' 2>/dev/null || echo "unknown")
    echo "  🖼️  Available images: $IMAGE_COUNT"
else
    echo "  ❌ Backend is not responding on http://localhost:4000"
fi

echo ""

# Check frontend status
echo "📱 Frontend Status:"
if curl -s http://localhost:5173 > /dev/null; then
    echo "  ✅ Frontend is running on http://localhost:5173"
    
    # Check if React is loading
    TITLE=$(curl -s http://localhost:5173 | grep -o '<title>.*</title>' | sed 's/<[^>]*>//g')
    echo "  📄 Page title: $TITLE"
else
    echo "  ❌ Frontend is not responding on http://localhost:5173"
fi

echo ""

# Check running processes
echo "🔄 Running Processes:"
BACKEND_PROC=$(ps aux | grep "nodemon index.js" | grep -v grep | wc -l)
FRONTEND_PROC=$(ps aux | grep "vite" | grep -v grep | wc -l)

if [ $BACKEND_PROC -gt 0 ]; then
    echo "  ✅ Backend process running (nodemon)"
else
    echo "  ❌ No backend process found"
fi

if [ $FRONTEND_PROC -gt 0 ]; then
    echo "  ✅ Frontend process running (vite)"
else
    echo "  ❌ No frontend process found"
fi

echo ""

# Check ports
echo "🌐 Port Status:"
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ✅ Port 4000 is in use (backend)"
else
    echo "  ❌ Port 4000 is not in use"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ✅ Port 5173 is in use (frontend)"
else
    echo "  ❌ Port 5173 is not in use"
fi

echo ""

# Overall status
if curl -s http://localhost:4000/api/public/images > /dev/null && curl -s http://localhost:5173 > /dev/null; then
    echo "🎉 Development environment is fully operational!"
    echo "   Visit http://localhost:5173 to see the farm website"
else
    echo "⚠️  Development environment has issues"
    echo "   Run ./start-dev.sh to start the servers"
fi