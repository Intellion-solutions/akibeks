#!/bin/bash

echo "🚀 AKIBEKS Engineering Solutions - Localhost Setup"
echo "=================================================="
echo ""

# Check if this is first time setup
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "📦 First time setup detected. Running full setup..."
    bash setup.sh
    if [ $? -ne 0 ]; then
        echo "❌ Setup failed. Please check the errors above."
        exit 1
    fi
else
    echo "✅ Dependencies already installed. Skipping setup."
fi

echo ""
echo "🔧 Starting localhost development environment..."
echo ""

# Check if PostgreSQL is running (optional check)
if command -v pg_isready &> /dev/null; then
    if ! pg_isready -q; then
        echo "⚠️  PostgreSQL doesn't seem to be running."
        echo "   Please start PostgreSQL service or use Docker:"
        echo "   - Ubuntu/Debian: sudo systemctl start postgresql"
        echo "   - macOS: brew services start postgresql"
        echo "   - Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15"
        echo ""
    else
        echo "✅ PostgreSQL is running"
    fi
fi

# Check if environment files exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cat > backend/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/akibeks_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=akibeks_db
DB_USER=postgres
DB_PASS=postgres

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-for-localhost-development

# SMTP Configuration (optional for localhost)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Configuration
EMAIL_FROM_NAME=AKIBEKS Engineering Solutions
EMAIL_FROM_ADDRESS=info@akibeks.co.ke

# Application Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
EOF
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend environment file..."
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AKIBEKS Engineering Solutions
VITE_APP_URL=http://localhost:5173
EOF
fi

echo ""
echo "🗄️  Setting up database..."
npm run db:setup

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
else
    echo ""
    echo "⚠️  Database setup had issues, but continuing..."
    echo "   You can run 'npm run db:setup' manually later."
fi

echo ""
echo "🌟 Starting development servers..."
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3000/api"
echo "🗄️  DB Studio: http://localhost:4983 (run 'npm run db:studio' in another terminal)"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start development servers
npm run dev