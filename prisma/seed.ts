import { PrismaClient, EmploymentType, JobPostingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample companies
  const techCorp = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Tech Corp',
      website: 'https://techcorp.example.com',
      description: 'A leading technology company specializing in software development and cloud solutions.',
    },
  });

  const startupXYZ = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'StartupXYZ',
      website: 'https://startupxyz.example.com',
      description: 'An innovative startup focused on AI and machine learning applications.',
    },
  });

  console.log('✅ Created companies:', { techCorp, startupXYZ });

  // Create sample job postings
  const job1 = await prisma.jobPosting.upsert({
    where: { id: '10000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000001',
      companyId: techCorp.id,
      title: 'Senior Software Engineer',
      description: 'We are looking for an experienced software engineer to join our team. You will work on cutting-edge projects using modern technologies.',
      location: 'San Francisco, CA',
      employmentType: EmploymentType.FULL_TIME,
      status: JobPostingStatus.PUBLISHED,
    },
  });

  const job2 = await prisma.jobPosting.upsert({
    where: { id: '10000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000002',
      companyId: startupXYZ.id,
      title: 'Product Manager',
      description: 'Join our team as a Product Manager and help shape the future of our products. You will work closely with engineering and design teams.',
      location: 'Remote',
      employmentType: EmploymentType.FULL_TIME,
      status: JobPostingStatus.PUBLISHED,
    },
  });

  const job3 = await prisma.jobPosting.upsert({
    where: { id: '10000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000003',
      companyId: techCorp.id,
      title: 'Frontend Developer',
      description: 'We are seeking a talented Frontend Developer to build beautiful and responsive user interfaces.',
      location: 'New York, NY',
      employmentType: EmploymentType.FULL_TIME,
      status: JobPostingStatus.PUBLISHED,
    },
  });

  console.log('✅ Created job postings:', { job1, job2, job3 });

  // Create sample candidates
  const candidate1 = await prisma.candidate.upsert({
    where: { id: '20000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '20000000-0000-0000-0000-000000000001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0100',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
    },
  });

  const candidate2 = await prisma.candidate.upsert({
    where: { id: '20000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '20000000-0000-0000-0000-000000000002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0101',
      linkedinUrl: 'https://linkedin.com/in/janesmith',
    },
  });

  console.log('✅ Created candidates:', { candidate1, candidate2 });
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
