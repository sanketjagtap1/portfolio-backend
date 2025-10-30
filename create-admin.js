const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@portfolio.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log('📧 Email: admin@portfolio.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role:', existingAdmin.role);
      console.log('🆔 User ID:', existingAdmin.id);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await prisma.user.create({
        data: {
          email: 'admin@portfolio.com',
          password: hashedPassword,
          name: 'Portfolio Admin',
          role: 'admin'
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@portfolio.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: admin');
      console.log('🆔 User ID:', admin.id);
    }
    
    console.log('\n🚀 Login Details:');
    console.log('URL: http://localhost:4200/admin/login');
    console.log('Email: admin@portfolio.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
