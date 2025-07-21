#!/bin/bash

echo "🏗️  AKIBEKS Engineering Solutions - Setup Script"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Please install PostgreSQL."
    echo "   On Ubuntu/Debian: sudo apt install postgresql-client"
    echo "   On macOS: brew install postgresql"
    echo "   On Windows: Download from https://www.postgresql.org/download/"
    echo ""
fi

# Create .env files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Creating root .env file..."
    cp .env.example .env
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend .env file..."
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AKIBEKS Engineering Solutions
VITE_APP_URL=http://localhost:5173
EOF
fi

if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example backend/.env
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "Installing root dependencies..."
npm install

echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "Installing backend dependencies..."
cd backend && npm install && cd ..

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run 'npm run db:setup' to setup the database"
echo "3. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "📖 For more information, see README.md"