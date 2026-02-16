// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const hashedPassword = await bcrypt.hash('password', 10);

  // Create test users
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@university.edu' },
    update: {},
    create: {
      email: 'faculty@university.edu',
      name: 'Dr. John Smith',
      password: hashedPassword,
      role: 'FACULTY',
      department: 'Computer Science',
      college: 'Engineering',
    },
  });

  const hod = await prisma.user.upsert({
    where: { email: 'hod@university.edu' },
    update: {},
    create: {
      email: 'hod@university.edu',
      name: 'Dr. Sarah Johnson',
      password: hashedPassword,
      role: 'HOD',
      department: 'Computer Science',
      college: 'Engineering',
    },
  });

  const dean = await prisma.user.upsert({
    where: { email: 'dean@university.edu' },
    update: {},
    create: {
      email: 'dean@university.edu',
      name: 'Prof. Michael Williams',
      password: hashedPassword,
      role: 'DEAN',
      college: 'Engineering',
    },
  });

  const vc = await prisma.user.upsert({
    where: { email: 'vc@university.edu' },
    update: {},
    create: {
      email: 'vc@university.edu',
      name: 'Dr. Robert Brown',
      password: hashedPassword,
      role: 'VC',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created users:', { faculty, hod, dean, vc, admin });

  // Create departments
  const csDept = await prisma.department.upsert({
    where: { name: 'Computer Science' },
    update: {},
    create: { name: 'Computer Science' },
  });

  const eeDept = await prisma.department.upsert({
    where: { name: 'Electrical Engineering' },
    update: {},
    create: { name: 'Electrical Engineering' },
  });

  console.log('✅ Created departments:', { csDept, eeDept });

  // Create colleges
  const engCollege = await prisma.college.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering' },
  });

  console.log('✅ Created college:', engCollege);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });