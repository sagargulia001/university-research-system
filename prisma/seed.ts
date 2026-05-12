// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // ── Users ────────────────────────────────────────────────────────────────
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

  console.log('✅ Created users:', {
    faculty: faculty.email,
    hod: hod.email,
    dean: dean.email,
    vc: vc.email,
    admin: admin.email,
  });

  // ── Departments & Colleges ────────────────────────────────────────────────
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

  const engCollege = await prisma.college.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering' },
  });

  console.log('✅ Created departments & college:', {
    csDept: csDept.name,
    eeDept: eeDept.name,
    engCollege: engCollege.name,
  });

  // ── Papers ────────────────────────────────────────────────────────────────
  // Delete existing seeded papers to avoid duplicates on re-seed
  await prisma.paper.deleteMany({
    where: {
      uploadedById: { in: [faculty.id, hod.id, dean.id, vc.id] },
    },
  });

  const papers = [
    // Dr. John Smith (FACULTY) — 7 papers
    {
      title: 'Advanced Machine Learning Techniques for Real-Time Systems',
      authors: 'Dr. John Smith',
      abstract: 'This paper explores advanced machine learning techniques applied to real-time embedded systems, with a focus on latency reduction and accuracy trade-offs.',
      keywords: 'machine learning, real-time systems, embedded, latency',
      pdfUrl: '/uploads/papers/mock-paper-1.pdf',
      uploadedById: faculty.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 245,
      submittedDate: new Date('2024-01-15'),
    },
    {
      title: 'Deep Learning in Medical Image Segmentation',
      authors: 'Dr. John Smith, Dr. Sarah Johnson',
      abstract: 'A comprehensive study on applying convolutional neural networks for automated medical image segmentation with high precision.',
      keywords: 'deep learning, CNN, medical imaging, segmentation',
      pdfUrl: '/uploads/papers/mock-paper-2.pdf',
      uploadedById: faculty.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 312,
      submittedDate: new Date('2023-11-08'),
    },
    {
      title: 'Natural Language Processing for Low-Resource Languages',
      authors: 'Dr. John Smith',
      abstract: 'Investigates transfer learning strategies for NLP tasks in languages with limited annotated training data.',
      keywords: 'NLP, transfer learning, low-resource, linguistics',
      pdfUrl: '/uploads/papers/mock-paper-3.pdf',
      uploadedById: faculty.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 189,
      submittedDate: new Date('2023-09-22'),
    },
    {
      title: 'Federated Learning for Privacy-Preserving Data Analysis',
      authors: 'Dr. John Smith',
      abstract: 'Presents a federated learning framework that enables collaborative model training without sharing raw data.',
      keywords: 'federated learning, privacy, distributed systems',
      pdfUrl: '/uploads/papers/mock-paper-4.pdf',
      uploadedById: faculty.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 421,
      submittedDate: new Date('2024-03-10'),
    },
    {
      title: 'Graph Neural Networks for Social Network Analysis',
      authors: 'Dr. John Smith',
      abstract: 'A study on leveraging graph neural networks to detect communities and predict link formation in large-scale social networks.',
      keywords: 'GNN, social network, graph, community detection',
      pdfUrl: '/uploads/papers/mock-paper-5.pdf',
      uploadedById: faculty.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 156,
      submittedDate: new Date('2023-07-14'),
    },
    {
      title: 'Quantum Computing Algorithms for Optimization Problems',
      authors: 'Dr. John Smith',
      abstract: 'Explores the application of quantum annealing and variational quantum circuits to combinatorial optimization.',
      keywords: 'quantum computing, optimization, variational algorithms',
      pdfUrl: '/uploads/papers/mock-paper-6.pdf',
      uploadedById: faculty.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 98,
      submittedDate: new Date('2024-05-02'),
    },
    {
      title: 'Blockchain-Based Secure Data Sharing in Healthcare',
      authors: 'Dr. John Smith',
      abstract: 'Proposes a blockchain architecture for tamper-proof sharing of electronic health records across institutions.',
      keywords: 'blockchain, healthcare, data sharing, security',
      pdfUrl: '/uploads/papers/mock-paper-7.pdf',
      uploadedById: faculty.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 278,
      submittedDate: new Date('2023-12-19'),
    },

    // Dr. Sarah Johnson (HOD) — 6 papers
    {
      title: 'Explainable AI in Clinical Decision Support Systems',
      authors: 'Dr. Sarah Johnson',
      abstract: 'Develops explainability techniques for AI models used in clinical decision support, improving physician trust and model transparency.',
      keywords: 'explainable AI, XAI, clinical, decision support',
      pdfUrl: '/uploads/papers/mock-paper-8.pdf',
      uploadedById: hod.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 367,
      submittedDate: new Date('2024-02-28'),
    },
    {
      title: 'Adversarial Robustness in Deep Neural Networks',
      authors: 'Dr. Sarah Johnson, Dr. John Smith',
      abstract: 'Analyzes vulnerability of DNNs to adversarial inputs and proposes training strategies to improve robustness.',
      keywords: 'adversarial attacks, robustness, deep learning, security',
      pdfUrl: '/uploads/papers/mock-paper-9.pdf',
      uploadedById: hod.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 445,
      submittedDate: new Date('2023-08-11'),
    },
    {
      title: 'AutoML Systems for Non-Expert Users',
      authors: 'Dr. Sarah Johnson',
      abstract: 'Surveys automated machine learning pipelines designed to make ML accessible to users without deep technical expertise.',
      keywords: 'AutoML, automation, pipeline, usability',
      pdfUrl: '/uploads/papers/mock-paper-10.pdf',
      uploadedById: hod.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 234,
      submittedDate: new Date('2024-04-07'),
    },
    {
      title: 'Reinforcement Learning for Autonomous Drone Navigation',
      authors: 'Dr. Sarah Johnson',
      abstract: 'Applies deep reinforcement learning to train autonomous drones for obstacle avoidance in unstructured environments.',
      keywords: 'reinforcement learning, drones, autonomous, navigation',
      pdfUrl: '/uploads/papers/mock-paper-11.pdf',
      uploadedById: hod.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 512,
      submittedDate: new Date('2023-10-30'),
    },
    {
      title: 'Transformer Models for Code Generation',
      authors: 'Dr. Sarah Johnson',
      abstract: 'Evaluates the performance of large language models fine-tuned on programming tasks for automated code synthesis.',
      keywords: 'transformers, LLM, code generation, software engineering',
      pdfUrl: '/uploads/papers/mock-paper-12.pdf',
      uploadedById: hod.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 489,
      submittedDate: new Date('2024-01-03'),
    },
    {
      title: 'Edge Computing Architectures for IoT Applications',
      authors: 'Dr. Sarah Johnson',
      abstract: 'Investigates edge computing deployment patterns for latency-critical IoT workloads in smart city infrastructure.',
      keywords: 'edge computing, IoT, smart city, latency',
      pdfUrl: '/uploads/papers/mock-paper-13.pdf',
      uploadedById: hod.id,
      department: 'Computer Science',
      college: 'Engineering',
      downloads: 201,
      submittedDate: new Date('2023-06-18'),
    },

    // Prof. Michael Williams (DEAN) — 4 papers
    {
      title: 'Renewable Energy Integration in Smart Grid Systems',
      authors: 'Prof. Michael Williams',
      abstract: 'Studies the challenges and solutions for integrating high penetrations of renewable energy into modern smart grid architectures.',
      keywords: 'smart grid, renewable energy, integration, power systems',
      pdfUrl: '/uploads/papers/mock-paper-14.pdf',
      uploadedById: dean.id,
      department: 'Electrical Engineering',
      college: 'Engineering',
      downloads: 334,
      submittedDate: new Date('2023-11-25'),
    },
    {
      title: 'Power Electronics for Electric Vehicle Charging Infrastructure',
      authors: 'Prof. Michael Williams',
      abstract: 'Reviews power converter topologies and control strategies optimized for fast and ultra-fast EV charging stations.',
      keywords: 'power electronics, EV, charging, converters',
      pdfUrl: '/uploads/papers/mock-paper-15.pdf',
      uploadedById: dean.id,
      department: 'Electrical Engineering',
      college: 'Engineering',
      downloads: 267,
      submittedDate: new Date('2024-02-14'),
    },
    {
      title: 'FPGA-Based Hardware Accelerators for Deep Learning Inference',
      authors: 'Prof. Michael Williams',
      abstract: 'Presents a methodology for mapping deep neural network inference workloads onto reconfigurable FPGA hardware for energy efficiency.',
      keywords: 'FPGA, hardware accelerator, deep learning, inference',
      pdfUrl: '/uploads/papers/mock-paper-16.pdf',
      uploadedById: dean.id,
      department: 'Electrical Engineering',
      college: 'Engineering',
      downloads: 178,
      submittedDate: new Date('2023-08-29'),
    },
    {
      title: 'Signal Processing Techniques for Biomedical Wearables',
      authors: 'Prof. Michael Williams',
      abstract: 'Develops adaptive signal processing algorithms for accurate physiological monitoring using low-power wearable sensors.',
      keywords: 'signal processing, wearables, biomedical, physiological',
      pdfUrl: '/uploads/papers/mock-paper-17.pdf',
      uploadedById: dean.id,
      department: 'Electrical Engineering',
      college: 'Engineering',
      downloads: 143,
      submittedDate: new Date('2024-04-22'),
    },

    // Dr. Robert Brown (VC) — 4 papers
    {
      title: 'University Research Ecosystem: A Strategic Framework',
      authors: 'Dr. Robert Brown',
      abstract: 'Proposes a strategic framework for cultivating research excellence across multidisciplinary university departments.',
      keywords: 'higher education, research strategy, university, policy',
      pdfUrl: '/uploads/papers/mock-paper-18.pdf',
      uploadedById: vc.id,
      department: null,
      college: null,
      downloads: 89,
      submittedDate: new Date('2024-03-05'),
    },
    {
      title: 'Impact of Industry-Academia Collaboration on Innovation',
      authors: 'Dr. Robert Brown',
      abstract: 'Empirical study on how structured industry-academia partnerships influence research output and technology transfer rates.',
      keywords: 'industry-academia, collaboration, innovation, technology transfer',
      pdfUrl: '/uploads/papers/mock-paper-19.pdf',
      uploadedById: vc.id,
      department: null,
      college: null,
      downloads: 112,
      submittedDate: new Date('2023-10-15'),
    },
    {
      title: 'Sustainable Campus Infrastructure: Energy and Water Conservation',
      authors: 'Dr. Robert Brown',
      abstract: 'Examines sustainable infrastructure practices implemented at leading universities and their measurable environmental impact.',
      keywords: 'sustainability, campus, energy, water conservation',
      pdfUrl: '/uploads/papers/mock-paper-20.pdf',
      uploadedById: vc.id,
      department: null,
      college: null,
      downloads: 76,
      submittedDate: new Date('2023-05-20'),
    },
    {
      title: 'Digital Transformation in Higher Education Institutions',
      authors: 'Dr. Robert Brown',
      abstract: 'Analyzes digital transformation journeys of universities globally, identifying key success factors and common pitfalls.',
      keywords: 'digital transformation, higher education, EdTech, change management',
      pdfUrl: '/uploads/papers/mock-paper-21.pdf',
      uploadedById: vc.id,
      department: null,
      college: null,
      downloads: 134,
      submittedDate: new Date('2024-01-28'),
    },
  ];

  for (const paper of papers) {
    await prisma.paper.create({ data: paper });
  }

  console.log(`✅ Created ${papers.length} mock papers`);
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