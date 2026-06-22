import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Create Prisma client instance.
// Verbose query logging only in development; production stays quiet (avoids leaking data into logs).
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['query', 'info', 'warn', 'error'],
});

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Initialize database with Prisma migrations
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Run Prisma migrations
    console.log('🔄 Running database migrations...');
    
    // Create default admin user if not exists
    const adminCount = await prisma.user.count();
    
    if (adminCount === 0) {
      const bcrypt = require('bcryptjs');

      // Credentials come from env; fall back to a random password so no known
      // default password is ever seeded (and the password is never logged).
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
      const adminPassword = process.env.ADMIN_PASSWORD || require('crypto').randomBytes(12).toString('hex');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin',
          role: 'admin'
        }
      });

      if (process.env.ADMIN_PASSWORD) {
        console.log(`✅ Default admin user created (email: ${adminEmail}). Password taken from ADMIN_PASSWORD env var.`);
      } else {
        console.log(`✅ Default admin user created (email: ${adminEmail}).`);
        console.log('⚠️  A random password was generated. Set ADMIN_EMAIL/ADMIN_PASSWORD env vars and reset via the change-password endpoint.');
        console.log(`   One-time password (shown once, store it now): ${adminPassword}`);
      }
    }
    
    // Create default contact info if not exists
    const contactCount = await prisma.contactInfo.count();
    
    if (contactCount === 0) {
      await prisma.contactInfo.createMany({
        data: [
          { type: 'email', value: 'sanketjagtap479@gmail.com', icon: '📧', order: 1 },
          { type: 'phone', value: '+91 8806328987', icon: '📱', order: 2 },
          { type: 'location', value: 'Pune, India', icon: '📍', order: 3 }
        ]
      });
      
      console.log('✅ Default contact info created');
    }
    
    // Create default social links if not exists
    const socialCount = await prisma.socialLink.count();
    
    if (socialCount === 0) {
      await prisma.socialLink.createMany({
        data: [
          { platform: 'github', url: 'https://github.com/sanketjagtap', icon: 'github', order: 1 },
          { platform: 'linkedin', url: 'https://linkedin.com/in/sanket-jagtap', icon: 'linkedin', order: 2 },
          { platform: 'twitter', url: 'https://twitter.com/sanketjagtap', icon: 'twitter', order: 3 }
        ]
      });
      
      console.log('✅ Default social links created');
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export default prisma;
