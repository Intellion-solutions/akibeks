#!/usr/bin/env node

/**
 * AKIBEKS Engineering Solutions - Database Setup Script
 * This script helps set up the PostgreSQL database and run migrations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  AKIBEKS Engineering Solutions - Database Setup');
console.log('================================================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ No .env file found!');
  console.log('📝 Please create a .env file based on .env.example');
  console.log('   Copy .env.example to .env and update the database credentials\n');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\n📝 Please update your .env file with all required variables\n');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📊 Database: ${process.env.DB_NAME}`);
console.log(`🖥️  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
console.log(`👤 User: ${process.env.DB_USER}\n`);

// Function to run shell commands
function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'pipe' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.log(`❌ ${description} failed:`);
    console.log(error.stdout?.toString() || error.message);
    console.log('');
    return false;
  }
  return true;
}

// Test database connection
async function testConnection() {
  console.log('🔍 Testing database connection...');
  try {
    const { checkDatabaseConnection } = await import('../src/database/connection.js');
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      console.log('✅ Database connection successful\n');
      return true;
    } else {
      console.log('❌ Database connection failed\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Database connection test failed:');
    console.log(error.message);
    console.log('');
    return false;
  }
}

// Main setup process
async function setupDatabase() {
  console.log('🚀 Starting database setup process...\n');

  // Step 1: Install dependencies
  if (!runCommand('npm install', 'Installing dependencies')) {
    process.exit(1);
  }

  // Step 2: Test connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('💡 Please ensure:');
    console.log('   1. PostgreSQL is running');
    console.log('   2. Database credentials in .env are correct');
    console.log('   3. Database and user exist');
    console.log('   4. User has proper permissions\n');
    console.log('📖 See POSTGRESQL_MIGRATION_GUIDE.md for detailed instructions\n');
    process.exit(1);
  }

  // Step 3: Generate migrations
  if (!runCommand('npm run db:generate', 'Generating database migrations')) {
    process.exit(1);
  }

  // Step 4: Run migrations
  if (!runCommand('npm run db:migrate', 'Running database migrations')) {
    process.exit(1);
  }

  // Step 5: Final test
  console.log('🔍 Final verification...');
  const finalTest = await testConnection();
  
  if (finalTest) {
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Run "npm run dev" to start the development server');
    console.log('   2. Run "npm run db:studio" to explore your database');
    console.log('   3. Check the application at http://localhost:3000');
    console.log('');
    console.log('🏗️  AKIBEKS Engineering Solutions is ready to go!');
  } else {
    console.log('❌ Final verification failed. Please check the logs above.');
    process.exit(1);
  }
}

// Handle script arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node scripts/setup-database.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --test-only    Only test the database connection');
  console.log('');
  console.log('This script will:');
  console.log('  1. Install npm dependencies');
  console.log('  2. Test database connection');
  console.log('  3. Generate database migrations');
  console.log('  4. Apply migrations to database');
  console.log('  5. Verify setup completion');
  console.log('');
  process.exit(0);
}

if (args.includes('--test-only')) {
  testConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  setupDatabase().catch(error => {
    console.log('❌ Setup failed:', error.message);
    process.exit(1);
  });
}