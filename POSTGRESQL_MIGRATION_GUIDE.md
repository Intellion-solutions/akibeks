# PostgreSQL Migration Guide for AKIBEKS Engineering Solutions

This guide provides simple, clear instructions for setting up PostgreSQL and migrating your database schema.

## 🚀 Quick Setup (Recommended)

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

### 2. Create Database and User

```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE akibeks_db;

-- Create user
CREATE USER akibeks_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE akibeks_db TO akibeks_user;

-- Grant schema privileges
\c akibeks_db
GRANT ALL ON SCHEMA public TO akibeks_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO akibeks_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO akibeks_user;

-- Exit
\q
```

### 3. Configure Environment

Create a `.env` file in your project root:

```env
# Database Configuration
DATABASE_URL="postgresql://akibeks_user:your_secure_password@localhost:5432/akibeks_db"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=akibeks_db
DB_USER=akibeks_user
DB_PASS=your_secure_password

# Application Settings
NODE_ENV=development
PORT=3000
```

### 4. Run Database Migration

```bash
# Install dependencies
npm install

# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:migrate

# (Optional) Open Drizzle Studio to view your database
npm run db:studio
```

## 🏗️ Database Schema

The system will automatically create these tables:

- **users** - User accounts and authentication
- **projects** - Construction projects
- **services** - Company services
- **contact_submissions** - Contact form submissions
- **testimonials** - Client testimonials
- **seo_configurations** - SEO settings
- **sessions** - User sessions
- **activity_logs** - System activity tracking
- **error_logs** - Error tracking

## 🔧 Database Commands

```bash
# Generate new migration after schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema changes directly (development only)
npm run db:push

# Open database studio
npm run db:studio

# Check migration status
npm run db:check

# Drop all tables (BE CAREFUL!)
npm run db:drop
```

## 🐳 Docker Setup (Alternative)

If you prefer using Docker:

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: akibeks_db
      POSTGRES_USER: akibeks_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Run migrations
npm run db:migrate
```

## 🌐 Production Deployment

### For cPanel/Shared Hosting:

1. **Create PostgreSQL Database in cPanel**
   - Go to PostgreSQL Databases
   - Create database: `yourdomain_akibeks`
   - Create user: `yourdomain_akibeks_user`
   - Add user to database with all privileges

2. **Update Environment Variables**
   ```env
   DATABASE_URL="postgresql://yourdomain_akibeks_user:password@localhost:5432/yourdomain_akibeks"
   NODE_ENV=production
   ```

3. **Deploy and Migrate**
   ```bash
   # On your server
   npm install --production
   npm run db:migrate
   npm run build
   npm start
   ```

### For VPS/Dedicated Server:

1. **Install PostgreSQL**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **Secure PostgreSQL**
   ```bash
   sudo -u postgres psql
   ALTER USER postgres PASSWORD 'strong_password';
   \q
   ```

3. **Configure PostgreSQL**
   ```bash
   sudo nano /etc/postgresql/15/main/postgresql.conf
   # Set: listen_addresses = '*'
   
   sudo nano /etc/postgresql/15/main/pg_hba.conf
   # Add: host all all 0.0.0.0/0 md5
   
   sudo systemctl restart postgresql
   ```

4. **Setup Firewall**
   ```bash
   sudo ufw allow 5432/tcp
   ```

## 🔍 Troubleshooting

### Connection Issues

**Error: "Connection refused"**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql
```

**Error: "Authentication failed"**
```bash
# Reset user password
sudo -u postgres psql
ALTER USER akibeks_user PASSWORD 'new_password';
\q
```

### Permission Issues

**Error: "Permission denied for schema public"**
```sql
-- Connect as superuser and grant permissions
sudo -u postgres psql
\c akibeks_db
GRANT ALL ON SCHEMA public TO akibeks_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO akibeks_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO akibeks_user;
```

### Migration Issues

**Error: "Table already exists"**
```bash
# Reset migrations (development only)
npm run db:drop
npm run db:generate
npm run db:migrate
```

## 📋 Health Check

Test your database connection:

```bash
# Test connection
node -e "
const { checkDatabaseConnection } = require('./src/database/connection.ts');
checkDatabaseConnection().then(result => {
  console.log('Database connection:', result ? '✅ Success' : '❌ Failed');
  process.exit(result ? 0 : 1);
});
"
```

## 🔐 Security Best Practices

1. **Use strong passwords** (minimum 12 characters)
2. **Limit database access** to specific IP addresses
3. **Use SSL connections** in production
4. **Regular backups**:
   ```bash
   pg_dump -h localhost -U akibeks_user akibeks_db > backup.sql
   ```
5. **Monitor database logs** for suspicious activity

## 📞 Support

If you encounter issues:

1. Check the logs: `tail -f /var/log/postgresql/postgresql-15-main.log`
2. Verify environment variables are set correctly
3. Ensure PostgreSQL service is running
4. Check firewall settings
5. Verify user permissions

## 🎯 Next Steps

After successful migration:

1. **Test the application** thoroughly
2. **Setup monitoring** for database performance
3. **Configure automated backups**
4. **Document your specific configuration** for team members

Your PostgreSQL database is now ready for AKIBEKS Engineering Solutions! 🏗️