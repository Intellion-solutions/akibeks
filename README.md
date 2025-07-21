# AKIBEKS Engineering Solutions

A modern, full-stack web application for engineering and construction services in Kenya. Built with React, TypeScript, Node.js, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### One-Command Setup
```bash
bash setup.sh
```

This will:
- Install all dependencies
- Create environment files
- Check system requirements

### Manual Setup
```bash
# 1. Install dependencies
npm run install:all

# 2. Setup environment variables
cp .env.example backend/.env
# Edit backend/.env with your database credentials

# 3. Setup database
npm run db:setup

# 4. Start development servers
npm run dev
```

## 📱 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Database Studio**: http://localhost:4983 (run `npm run db:studio`)
- **API Documentation**: http://localhost:3000/api

## 🏗️ Project Structure

```
akibeks-engineering-solutions/
├── frontend/                 # React Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities & API client
│   │   └── ...
│   └── package.json
│
├── backend/                  # Node.js Backend (Express + TypeScript)
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   └── ...
│   ├── database/            # Database schema & migrations
│   └── package.json
│
├── shared/                   # Shared code
│   ├── types/               # TypeScript types
│   ├── constants/           # App constants
│   └── schemas/             # Validation schemas
│
└── package.json             # Root workspace
```

## 🛠️ Development Commands

### Root Commands
```bash
npm run dev              # Start both frontend & backend
npm run build            # Build both applications
npm run start            # Start production server
npm run install:all      # Install all dependencies
npm run clean            # Clean all node_modules
npm run reset            # Clean + reinstall everything
```

### Frontend Commands
```bash
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Backend Commands
```bash
cd backend
npm run dev              # Start development server
npm run build            # Build TypeScript
npm start                # Start production server
```

### Database Commands
```bash
npm run db:setup         # Complete database setup
npm run db:generate      # Generate migrations
npm run db:migrate       # Apply migrations
npm run db:studio        # Open database studio
```

## 🌍 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/akibeks_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=akibeks_db
DB_USER=postgres
DB_PASS=your_password

# JWT
JWT_SECRET=your-super-secure-jwt-secret

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AKIBEKS Engineering Solutions
VITE_APP_URL=http://localhost:5173
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access** - Admin, employee, client, user roles
- **Input Validation** - Zod schema validation
- **Rate Limiting** - Protection against abuse
- **CORS Protection** - Cross-origin resource sharing
- **Helmet Security** - Security headers
- **Environment Separation** - Secure configuration management

## 🇰🇪 Kenya-Specific Features

- **Currency**: Kenyan Shilling (KES) formatting
- **Phone Numbers**: +254 format validation
- **KRA PIN**: Kenyan tax PIN validation
- **Timezone**: Africa/Nairobi support
- **VAT**: 16% VAT rate for Kenya
- **Localization**: English (Kenya) locale

## 📊 Key Features

### 🏢 **Core Business**
- Project management and tracking
- Service catalog and pricing
- Client relationship management
- Contact form handling
- Testimonial collection

### 📧 **Communication**
- SMTP email integration
- Contact notifications
- Quotation emails
- Welcome emails
- Template system

### 👥 **User Management**
- User registration and authentication
- Role-based permissions
- Activity logging
- Profile management

### 💻 **Technical**
- TypeScript throughout
- React with modern hooks
- Express.js REST API
- PostgreSQL database
- Drizzle ORM
- Zod validation
- Tailwind CSS

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Update database credentials
3. Configure SMTP settings
4. Set secure JWT secret

### Deployment Options
- **Traditional VPS**: Ubuntu server with PM2
- **Docker**: Container deployment
- **Cloud Platforms**: AWS, DigitalOcean, Railway
- **Database**: PostgreSQL on cloud provider

## 📚 API Documentation

The API provides comprehensive endpoints for:

- **Authentication**: `/api/auth/*`
- **Projects**: `/api/projects/*`
- **Services**: `/api/services/*`
- **Contact**: `/api/contact/*`
- **Testimonials**: `/api/testimonials/*`
- **File Upload**: `/api/upload/*`
- **Email**: `/api/email/*`

Visit `/api` endpoint for complete API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Build fails with import errors:**
```bash
npm run clean
npm run reset
```

**Database connection fails:**
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Run `npm run db:setup`

**SMTP emails not sending:**
1. Check SMTP credentials
2. Enable "Less secure apps" for Gmail
3. Use App Password for Gmail

**Port already in use:**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Support
- **Email**: dev@akibeks.co.ke
- **Documentation**: See `docs/` directory
- **Issues**: GitHub Issues

---

**Built with ❤️ for AKIBEKS Engineering Solutions**
