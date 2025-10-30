import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Create Prisma client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
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
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          email: 'admin@portfolio.com',
          password: hashedPassword,
          name: 'Admin',
          role: 'admin'
        }
      });
      
      console.log('✅ Default admin user created (email: admin@portfolio.com, password: admin123)');
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
