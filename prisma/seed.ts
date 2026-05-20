const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestWithParameters(testData: any, parameters: any[]) {
  // 1. Upsert test
  const test = await prisma.test.upsert({
    where: { code: testData.code },
    update: {
      name: testData.name,
      shortName: testData.shortName,
      categoryId: testData.categoryId,
      price: testData.price,
      duration: testData.duration,
      sampleType: testData.sampleType,
      container: testData.container,
    },
    create: testData,
  });

  // 2. Clear existing parameters for this test to avoid duplicates on re-run
  const existingParams = await prisma.testParameter.findMany({
    where: { testId: test.id },
  });
  
  for (const p of existingParams) {
    // Delete reference ranges first
    await prisma.referenceRange.deleteMany({
      where: { parameterId: p.id },
    });
  }
  
  await prisma.testParameter.deleteMany({
    where: { testId: test.id },
  });

  // 3. Create parameters and reference ranges
  for (const param of parameters) {
    await prisma.testParameter.create({
      data: {
        testId: test.id,
        name: param.name,
        unit: param.unit,
        sortOrder: param.sortOrder,
        type: param.type || 'NUMERIC',
        isHeader: param.isHeader || false,
        refRanges: {
          create: param.refRanges || []
        }
      }
    });
  }

  console.log(`Seeded test: ${test.code} - ${test.name}`);
}

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lab.com' },
    update: {},
    create: {
      email: 'admin@lab.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log({ admin });

  const categories = [
    'Hematology', 'Biochemistry', 'Serology', 'Microbiology', 'Clinical Pathology', 'Immunology'
  ];

  const categoryMap: Record<string, number> = {};

  for (const cat of categories) {
    const c = await prisma.testCategory.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    });
    categoryMap[cat] = c.id;
  }

  // 1. CBC
  await seedTestWithParameters(
    {
      code: 'CBC001',
      name: 'Complete Blood Count',
      shortName: 'CBC',
      categoryId: categoryMap['Hematology'],
      price: 350.0,
      duration: 2,
      sampleType: 'Whole Blood',
      container: 'EDTA Tube (Purple)',
    },
    [
      { name: 'Hemoglobin (Hb)', unit: 'g/dL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: 'MALE', normalMin: 13.0, normalMax: 17.0, criticalMin: 7.0, criticalMax: 20.0 },
        { gender: 'FEMALE', normalMin: 12.0, normalMax: 15.0, criticalMin: 7.0, criticalMax: 20.0 }
      ]},
      { name: 'Total RBC Count', unit: 'mill/cumm', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: 'MALE', normalMin: 4.5, normalMax: 5.5, criticalMin: 3.0, criticalMax: 6.5 },
        { gender: 'FEMALE', normalMin: 3.8, normalMax: 4.8, criticalMin: 2.5, criticalMax: 5.8 }
      ]},
      { name: 'Total WBC Count', unit: '/cumm', sortOrder: 3, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 4000.0, normalMax: 10000.0, criticalMin: 1500.0, criticalMax: 30000.0 }
      ]},
      { name: 'Platelet Count', unit: 'lakhs/cumm', sortOrder: 4, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 1.5, normalMax: 4.0, criticalMin: 0.5, criticalMax: 10.0 }
      ]}
    ]
  );

  // 2. LFT
  await seedTestWithParameters(
    {
      code: 'LFT001',
      name: 'Liver Function Test',
      shortName: 'LFT',
      categoryId: categoryMap['Biochemistry'],
      price: 750.0,
      duration: 4,
      sampleType: 'Serum',
      container: 'SST Tube (Yellow)',
    },
    [
      { name: 'Total Bilirubin', unit: 'mg/dL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 0.1, normalMax: 1.2, criticalMin: null, criticalMax: 5.0 }
      ]},
      { name: 'Direct Bilirubin', unit: 'mg/dL', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 0.0, normalMax: 0.3, criticalMin: null, criticalMax: 1.5 }
      ]},
      { name: 'SGOT (AST)', unit: 'U/L', sortOrder: 3, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 5.0, normalMax: 40.0, criticalMin: null, criticalMax: 500.0 }
      ]},
      { name: 'SGPT (ALT)', unit: 'U/L', sortOrder: 4, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 7.0, normalMax: 56.0, criticalMin: null, criticalMax: 500.0 }
      ]},
      { name: 'Alkaline Phosphatase', unit: 'U/L', sortOrder: 5, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 44.0, normalMax: 147.0, criticalMin: null, criticalMax: 1000.0 }
      ]},
      { name: 'Total Protein', unit: 'g/dL', sortOrder: 6, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 6.0, normalMax: 8.3, criticalMin: null, criticalMax: null }
      ]},
      { name: 'Albumin', unit: 'g/dL', sortOrder: 7, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 3.5, normalMax: 5.5, criticalMin: null, criticalMax: null }
      ]}
    ]
  );

  // 3. RFT
  await seedTestWithParameters(
    {
      code: 'RFT001',
      name: 'Renal Function Test',
      shortName: 'RFT',
      categoryId: categoryMap['Biochemistry'],
      price: 650.0,
      duration: 4,
      sampleType: 'Serum',
      container: 'SST Tube (Yellow)',
    },
    [
      { name: 'Blood Urea', unit: 'mg/dL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 15.0, normalMax: 40.0, criticalMin: null, criticalMax: 100.0 }
      ]},
      { name: 'Serum Creatinine', unit: 'mg/dL', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: 'MALE', normalMin: 0.7, normalMax: 1.3, criticalMin: null, criticalMax: 5.0 },
        { gender: 'FEMALE', normalMin: 0.6, normalMax: 1.1, criticalMin: null, criticalMax: 4.5 }
      ]},
      { name: 'Uric Acid', unit: 'mg/dL', sortOrder: 3, type: 'NUMERIC', refRanges: [
        { gender: 'MALE', normalMin: 3.5, normalMax: 7.2, criticalMin: null, criticalMax: 12.0 },
        { gender: 'FEMALE', normalMin: 2.6, normalMax: 6.0, criticalMin: null, criticalMax: 10.0 }
      ]},
      { name: 'Sodium', unit: 'mEq/L', sortOrder: 4, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 136.0, normalMax: 145.0, criticalMin: 120.0, criticalMax: 160.0 }
      ]},
      { name: 'Potassium', unit: 'mEq/L', sortOrder: 5, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 3.5, normalMax: 5.1, criticalMin: 2.5, criticalMax: 6.5 }
      ]}
    ]
  );

  // 4. Lipid Profile
  await seedTestWithParameters(
    {
      code: 'LIPID001',
      name: 'Lipid Profile',
      shortName: 'LIPID',
      categoryId: categoryMap['Biochemistry'],
      price: 800.0,
      duration: 6,
      sampleType: 'Serum',
      container: 'SST Tube (Yellow)',
    },
    [
      { name: 'Total Cholesterol', unit: 'mg/dL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 100.0, normalMax: 200.0, criticalMin: null, criticalMax: 300.0 }
      ]},
      { name: 'Triglycerides', unit: 'mg/dL', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 50.0, normalMax: 150.0, criticalMin: null, criticalMax: 500.0 }
      ]},
      { name: 'HDL Cholesterol', unit: 'mg/dL', sortOrder: 3, type: 'NUMERIC', refRanges: [
        { gender: 'MALE', normalMin: 40.0, normalMax: 60.0, criticalMin: null, criticalMax: null },
        { gender: 'FEMALE', normalMin: 50.0, normalMax: 60.0, criticalMin: null, criticalMax: null }
      ]},
      { name: 'LDL Cholesterol', unit: 'mg/dL', sortOrder: 4, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 50.0, normalMax: 100.0, criticalMin: null, criticalMax: 190.0 }
      ]}
    ]
  );

  // 5. Thyroid Profile
  await seedTestWithParameters(
    {
      code: 'TFT001',
      name: 'Thyroid Profile (T3, T4, TSH)',
      shortName: 'TFT',
      categoryId: categoryMap['Biochemistry'],
      price: 700.0,
      duration: 6,
      sampleType: 'Serum',
      container: 'SST Tube (Yellow)',
    },
    [
      { name: 'Total T3', unit: 'ng/mL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 0.8, normalMax: 2.0, criticalMin: null, criticalMax: null }
      ]},
      { name: 'Total T4', unit: 'µg/dL', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 5.1, normalMax: 14.1, criticalMin: null, criticalMax: null }
      ]},
      { name: 'TSH', unit: 'µIU/mL', sortOrder: 3, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 0.27, normalMax: 4.2, criticalMin: null, criticalMax: 20.0 }
      ]}
    ]
  );

  // 6. Blood Sugar
  await seedTestWithParameters(
    {
      code: 'SUGAR001',
      name: 'Blood Sugar Fasting',
      shortName: 'BSF',
      categoryId: categoryMap['Biochemistry'],
      price: 100.0,
      duration: 1,
      sampleType: 'Plasma',
      container: 'Fluoride Tube (Grey)',
    },
    [
      { name: 'Fasting Blood Sugar', unit: 'mg/dL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 70.0, normalMax: 100.0, criticalMin: 50.0, criticalMax: 400.0 }
      ]}
    ]
  );

  // 7. HbA1c
  await seedTestWithParameters(
    {
      code: 'HBA1C01',
      name: 'HbA1c (Glycated Hemoglobin)',
      shortName: 'HbA1c',
      categoryId: categoryMap['Biochemistry'],
      price: 450.0,
      duration: 3,
      sampleType: 'Whole Blood',
      container: 'EDTA Tube (Purple)',
    },
    [
      { name: 'HbA1c', unit: '%', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 4.0, normalMax: 5.7, criticalMin: null, criticalMax: 10.0 }
      ]},
      { name: 'Estimated Average Glucose', unit: 'mg/dL', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 70.0, normalMax: 117.0, criticalMin: null, criticalMax: null }
      ]}
    ]
  );

  console.log('Seed executed successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
