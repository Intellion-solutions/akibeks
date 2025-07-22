#!/bin/bash

echo "🏭 AKIBEKS Engineering Solutions - Production Deployment"
echo "======================================================="
echo ""

# Check for required environment variables
if [ -z "$DB_PASS" ]; then
    echo "❌ DB_PASS environment variable is required for production"
    echo "   Set it with: export DB_PASS=your_secure_password"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET environment variable is required for production"
    echo "   Set it with: export JWT_SECRET=your-super-secure-jwt-secret"
    exit 1
fi

echo "✅ Required environment variables found"
echo ""

# Choose deployment method
echo "Choose deployment method:"
echo "1) Docker Compose (Recommended)"
echo "2) Direct Build & Deploy"
echo "3) Build Only"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🐳 Docker Compose Deployment"
        echo "============================"
        echo ""
        
        # Create production environment file
        echo "📝 Creating production environment..."
        cat > .env << EOF
DB_PASS=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
SMTP_PORT=${SMTP_PORT:-587}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
EMAIL_FROM_NAME=${EMAIL_FROM_NAME:-AKIBEKS Engineering Solutions}
EMAIL_FROM_ADDRESS=${EMAIL_FROM_ADDRESS:-info@akibeks.co.ke}
EOF

        echo "🏗️  Building Docker containers..."
        docker-compose build
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🚀 Starting production services..."
            docker-compose up -d
            
            echo ""
            echo "✅ Production deployment complete!"
            echo ""
            echo "🌐 Application: http://localhost (or your domain)"
            echo "🔧 API: http://localhost:3000/api"
            echo "🗄️  Database: PostgreSQL on port 5432"
            echo ""
            echo "📊 Check status: docker-compose ps"
            echo "📜 View logs: docker-compose logs -f"
            echo "🛑 Stop: docker-compose down"
        else
            echo "❌ Docker build failed"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo "🏗️  Direct Build & Deploy"
        echo "========================"
        echo ""
        
        # Install dependencies
        echo "📦 Installing dependencies..."
        npm run install:all
        
        # Build applications
        echo "🏗️  Building applications..."
        npm run production:build
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "📝 Creating production environment files..."
            
            # Backend environment
            cat > backend/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:${DB_PASS}@localhost:5432/akibeks_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=akibeks_db
DB_USER=postgres
DB_PASS=${DB_PASS}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

# SMTP Configuration
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
SMTP_PORT=${SMTP_PORT:-587}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}

# Email Configuration
EMAIL_FROM_NAME=${EMAIL_FROM_NAME:-AKIBEKS Engineering Solutions}
EMAIL_FROM_ADDRESS=${EMAIL_FROM_ADDRESS:-info@akibeks.co.ke}

# Application Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=${FRONTEND_URL:-http://localhost}
EOF

            # Frontend environment
            cat > frontend/.env << EOF
VITE_API_URL=${BACKEND_URL:-http://localhost:3000/api}
VITE_APP_NAME=AKIBEKS Engineering Solutions
VITE_APP_URL=${FRONTEND_URL:-http://localhost}
EOF

            echo ""
            echo "🚀 Starting production server..."
            npm run production:start &
            
            echo ""
            echo "✅ Production deployment complete!"
            echo ""
            echo "🌐 Application: ${FRONTEND_URL:-http://localhost}"
            echo "🔧 API: ${BACKEND_URL:-http://localhost:3000/api}"
            echo ""
            echo "📊 Server running in background (PID: $!)"
            echo "🛑 Stop with: pkill -f 'npm run production:start'"
        else
            echo "❌ Build failed"
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo "🏗️  Build Only"
        echo "=============="
        echo ""
        
        # Install dependencies
        echo "📦 Installing dependencies..."
        npm run install:all
        
        # Build applications
        echo "🏗️  Building applications..."
        npm run production:build
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Build complete!"
            echo ""
            echo "📁 Frontend build: frontend/dist/"
            echo "📁 Backend build: backend/dist/"
            echo ""
            echo "📋 Next steps:"
            echo "1. Copy frontend/dist/ to your web server"
            echo "2. Copy backend/ to your application server"
            echo "3. Set up environment variables on your server"
            echo "4. Start the backend with: npm start"
        else
            echo "❌ Build failed"
            exit 1
        fi
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment script completed!"
echo ""
echo "📚 For more information, see README.md"