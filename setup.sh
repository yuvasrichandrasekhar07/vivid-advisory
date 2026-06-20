#!/bin/bash
# Vivid Advisory — Quick Start Script
# Run this from the root folder: bash setup.sh

echo "=== Vivid Advisory Setup ==="

echo ""
echo "1. Installing backend dependencies..."
cd backend && npm install

echo ""
echo "2. Setting up environment file..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   Created .env from .env.example"
  echo "   ⚠  IMPORTANT: Edit backend/.env with your PostgreSQL credentials before running!"
fi

cd ..

echo ""
echo "3. Installing frontend dependencies..."
cd frontend && npm install

cd ..

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "📋 NEXT STEPS:"
echo "  1. Create PostgreSQL database: createdb vivid_advisory"
echo "  2. Run schema: psql vivid_advisory < backend/migrations/001_schema.sql"
echo "  3. Edit backend/.env with your DB credentials"
echo "  4. Start backend: cd backend && npm run dev"
echo "  5. Start frontend (new terminal): cd frontend && npm start"
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo "  Health check: http://localhost:5000/health"
