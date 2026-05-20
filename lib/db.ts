// lib/db.ts
// Database abstraction layer that works both in Electron (via IPC) and in the browser (mock data)

const MOCK_PATIENTS = [
  {
    id: 'LAB-2024-00001',
    name: 'Rajesh Kumar',
    age: 45,
    ageUnit: 'YEARS',
    gender: 'MALE',
    mobile: '9876543210',
    email: 'rajesh@example.com',
    address: '123 MG Road, Mumbai',
    bloodGroup: 'B+',
    emergencyContact: null,
    isEmergency: false,
    referredDoctor: null,
    createdBy: 1,
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orders: [],
    bills: [],
  },
  {
    id: 'LAB-2024-00002',
    name: 'Priya Sharma',
    age: 32,
    ageUnit: 'YEARS',
    gender: 'FEMALE',
    mobile: '9123456789',
    email: 'priya@example.com',
    address: '456 Park Street, Delhi',
    bloodGroup: 'O+',
    emergencyContact: null,
    isEmergency: false,
    referredDoctor: null,
    createdBy: 1,
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orders: [],
    bills: [],
  },
  {
    id: 'LAB-2024-00003',
    name: 'Amit Patel',
    age: 28,
    ageUnit: 'YEARS',
    gender: 'MALE',
    mobile: '9988776655',
    email: null,
    address: '789 Station Road, Ahmedabad',
    bloodGroup: 'A+',
    emergencyContact: 'Sita Patel - 9988776644',
    isEmergency: true,
    referredDoctor: 'Dr. Mehta',
    createdBy: 1,
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orders: [],
    bills: [],
  },
];

const MOCK_TESTS: any[] = [
  {
    id: 1,
    code: 'CBC001',
    name: 'Complete Blood Count',
    shortName: 'CBC',
    price: 350,
    isActive: true,
    category: { name: 'Hematology' },
    parameters: [
      { id: 101, name: 'Hemoglobin (Hb)', unit: 'g/dL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: 'MALE', normalMin: 13.0, normalMax: 17.0, criticalMin: 7.0, criticalMax: 20.0 },
        { gender: 'FEMALE', normalMin: 12.0, normalMax: 15.0, criticalMin: 7.0, criticalMax: 20.0 }
      ]},
      { id: 102, name: 'Total RBC Count', unit: 'mill/cumm', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: 'MALE', normalMin: 4.5, normalMax: 5.5 },
        { gender: 'FEMALE', normalMin: 3.8, normalMax: 4.8 }
      ]},
      { id: 103, name: 'Total WBC Count', unit: '/cumm', sortOrder: 3, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 4000.0, normalMax: 10000.0 }
      ]},
      { id: 104, name: 'Platelet Count', unit: 'lakhs/cumm', sortOrder: 4, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 1.5, normalMax: 4.0 }
      ]}
    ]
  },
  {
    id: 2,
    code: 'LFT001',
    name: 'Liver Function Test',
    shortName: 'LFT',
    price: 750,
    isActive: true,
    category: { name: 'Biochemistry' },
    parameters: [
      { id: 201, name: 'Total Bilirubin', unit: 'mg/dL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 0.1, normalMax: 1.2 }
      ]},
      { id: 202, name: 'Direct Bilirubin', unit: 'mg/dL', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 0.0, normalMax: 0.3 }
      ]},
      { id: 203, name: 'SGOT (AST)', unit: 'U/L', sortOrder: 3, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 5.0, normalMax: 40.0 }
      ]},
      { id: 204, name: 'SGPT (ALT)', unit: 'U/L', sortOrder: 4, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 7.0, normalMax: 56.0 }
      ]},
      { id: 205, name: 'Alkaline Phosphatase', unit: 'U/L', sortOrder: 5, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 44.0, normalMax: 147.0 }
      ]},
      { id: 206, name: 'Total Protein', unit: 'g/dL', sortOrder: 6, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 6.0, normalMax: 8.3 }
      ]},
      { id: 207, name: 'Albumin', unit: 'g/dL', sortOrder: 7, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 3.5, normalMax: 5.5 }
      ]}
    ]
  },
  {
    id: 3,
    code: 'RFT001',
    name: 'Renal Function Test',
    shortName: 'RFT',
    price: 650,
    isActive: true,
    category: { name: 'Biochemistry' },
    parameters: [
      { id: 301, name: 'Blood Urea', unit: 'mg/dL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 15.0, normalMax: 40.0 }
      ]},
      { id: 302, name: 'Serum Creatinine', unit: 'mg/dL', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: 'MALE', normalMin: 0.7, normalMax: 1.3 },
        { gender: 'FEMALE', normalMin: 0.6, normalMax: 1.1 }
      ]},
      { id: 303, name: 'Uric Acid', unit: 'mg/dL', sortOrder: 3, type: 'NUMERIC', refRanges: [
        { gender: 'MALE', normalMin: 3.5, normalMax: 7.2 },
        { gender: 'FEMALE', normalMin: 2.6, normalMax: 6.0 }
      ]},
      { id: 304, name: 'Sodium', unit: 'mEq/L', sortOrder: 4, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 136.0, normalMax: 145.0 }
      ]},
      { id: 305, name: 'Potassium', unit: 'mEq/L', sortOrder: 5, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 3.5, normalMax: 5.1 }
      ]}
    ]
  },
  {
    id: 4,
    code: 'TFT001',
    name: 'Thyroid Function Test',
    shortName: 'TFT',
    price: 700,
    isActive: true,
    category: { name: 'Biochemistry' },
    parameters: [
      { id: 401, name: 'Total T3', unit: 'ng/mL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 0.8, normalMax: 2.0 }
      ]},
      { id: 402, name: 'Total T4', unit: 'µg/dL', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 5.1, normalMax: 14.1 }
      ]},
      { id: 403, name: 'TSH', unit: 'µIU/mL', sortOrder: 3, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 0.27, normalMax: 4.2 }
      ]}
    ]
  },
  {
    id: 5,
    code: 'LIPID001',
    name: 'Lipid Profile',
    shortName: 'LIPID',
    price: 800,
    isActive: true,
    category: { name: 'Biochemistry' },
    parameters: [
      { id: 501, name: 'Total Cholesterol', unit: 'mg/dL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 100.0, normalMax: 200.0 }
      ]},
      { id: 502, name: 'Triglycerides', unit: 'mg/dL', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 50.0, normalMax: 150.0 }
      ]},
      { id: 503, name: 'HDL Cholesterol', unit: 'mg/dL', sortOrder: 3, type: 'NUMERIC', refRanges: [
        { gender: 'MALE', normalMin: 40.0, normalMax: 60.0 },
        { gender: 'FEMALE', normalMin: 50.0, normalMax: 60.0 }
      ]},
      { id: 504, name: 'LDL Cholesterol', unit: 'mg/dL', sortOrder: 4, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 50.0, normalMax: 100.0 }
      ]}
    ]
  },
  {
    id: 6,
    code: 'SUGAR001',
    name: 'Blood Sugar Fasting',
    shortName: 'BSF',
    price: 100,
    isActive: true,
    category: { name: 'Biochemistry' },
    parameters: [
      { id: 601, name: 'Fasting Blood Sugar', unit: 'mg/dL', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 70.0, normalMax: 100.0 }
      ]}
    ]
  },
  {
    id: 7,
    code: 'HBA1C01',
    name: 'HbA1c (Glycated Hemoglobin)',
    shortName: 'HbA1c',
    price: 450,
    isActive: true,
    category: { name: 'Biochemistry' },
    parameters: [
      { id: 701, name: 'HbA1c', unit: '%', sortOrder: 1, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 4.0, normalMax: 5.7 }
      ]},
      { id: 702, name: 'Estimated Average Glucose', unit: 'mg/dL', sortOrder: 2, type: 'NUMERIC', refRanges: [
        { gender: null, normalMin: 70.0, normalMax: 117.0 }
      ]}
    ]
  },
];

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Ramesh Gupta', qualification: 'MBBS, MD', hospital: 'City Hospital', mobile: '9876543201', email: 'ramesh@cityhospital.com', commission: 10, isActive: true },
  { id: 2, name: 'Dr. Anjali Verma', qualification: 'MBBS, DM', hospital: 'Apollo Clinic', mobile: '9876543202', email: 'anjali@apollo.com', commission: 15, isActive: true },
  { id: 3, name: 'Dr. Suresh Reddy', qualification: 'MBBS', hospital: 'Reddy Nursing Home', mobile: '9876543203', email: '', commission: 12, isActive: true },
  { id: 4, name: 'Dr. Fatima Khan', qualification: 'MBBS, MD Pathology', hospital: 'Khan Diagnostics', mobile: '9876543204', email: 'fatima@khandiag.com', commission: 8, isActive: false },
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Hematology' },
  { id: 2, name: 'Biochemistry' },
  { id: 3, name: 'Serology' },
  { id: 4, name: 'Microbiology' },
  { id: 5, name: 'Clinical Pathology' },
  { id: 6, name: 'Immunology' },
];

function isElectron(): boolean {
  return typeof window !== 'undefined' && !!(window as any).electronAPI;
}

// Mock implementations for browser-only mode
async function mockQuery(model: string, action: string, args?: any): Promise<any> {
  console.warn(`[Mock DB] ${model}.${action}`, args);

  if (model === 'patient') {
    if (action === 'findMany') return MOCK_PATIENTS;
    if (action === 'findUnique') {
      const id = args?.where?.id;
      return MOCK_PATIENTS.find(p => p.id === id) || null;
    }
    if (action === 'count') return MOCK_PATIENTS.length;
    if (action === 'create') {
      const newPatient = { ...args.data, registeredAt: new Date().toISOString(), updatedAt: new Date().toISOString(), orders: [], bills: [] };
      MOCK_PATIENTS.push(newPatient);
      return newPatient;
    }
  }

  if (model === 'doctor') {
    if (action === 'findMany') return MOCK_DOCTORS;
    if (action === 'findUnique') {
      const id = args?.where?.id;
      return MOCK_DOCTORS.find(d => d.id === id) || null;
    }
    if (action === 'create') {
      const newDoc = { id: MOCK_DOCTORS.length + 1, ...args.data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      MOCK_DOCTORS.push(newDoc);
      return newDoc;
    }
    if (action === 'update') {
      const id = args?.where?.id;
      const index = MOCK_DOCTORS.findIndex(d => d.id === id);
      if (index !== -1) {
        MOCK_DOCTORS[index] = { ...MOCK_DOCTORS[index], ...args.data, updatedAt: new Date().toISOString() };
        return MOCK_DOCTORS[index];
      }
      return null;
    }
  }

  if (model === 'testCategory') {
    if (action === 'findMany') return MOCK_CATEGORIES;
  }
  
  if (model === 'test') {
    if (action === 'findMany') return MOCK_TESTS;
    if (action === 'findUnique') {
      return MOCK_TESTS.find(t => t.id === args?.where?.id) || null;
    }
    if (action === 'create') {
      const catId = args.data.categoryId;
      const cat = MOCK_CATEGORIES.find(c => c.id === catId) || { name: 'Unknown' };
      const newTest = { 
        id: MOCK_TESTS.length + 1, 
        ...args.data, 
        category: cat,
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      };
      MOCK_TESTS.push(newTest);
      return newTest;
    }
    if (action === 'update') {
      const id = args?.where?.id;
      const index = MOCK_TESTS.findIndex(t => t.id === id);
      if (index !== -1) {
        const catId = args.data.categoryId || MOCK_TESTS[index].categoryId;
        const cat = MOCK_CATEGORIES.find(c => c.id === catId) || MOCK_TESTS[index].category;
        MOCK_TESTS[index] = { 
          ...MOCK_TESTS[index], 
          ...args.data, 
          category: cat,
          updatedAt: new Date().toISOString() 
        };
        return MOCK_TESTS[index];
      }
      return null;
    }
  }

  if (model === 'bill') {
    if (action === 'count') return 0;
    if (action === 'create') return { id: Date.now(), ...args.data };
  }

  if (model === 'testOrder') {
    if (action === 'count') return 0;
    if (action === 'findMany') return [];
    if (action === 'findUnique') return null;
    if (action === 'create') return { id: Date.now(), ...args.data };
  }

  if (model === 'payment') {
    if (action === 'create') return { id: Date.now(), ...args.data };
  }

  if (model === 'testResult') {
    if (action === 'create') return { id: Date.now(), ...args.data };
    if (action === 'update') return { id: Date.now(), ...args.data };
  }

  if (model === 'testOrderItem') {
    if (action === 'update') return { id: Date.now(), ...args.data };
  }

  // Fallback
  if (action === 'findMany') return [];
  if (action === 'count') return 0;
  if (action === 'findUnique' || action === 'findFirst') return null;
  if (action === 'create' || action === 'update') return { id: Date.now(), ...args?.data };

  return null;
}

export const db = {
  // Generic query runner using IPC (Electron) or mock data (browser)
  query: async (model: string, action: string, args?: any) => {
    if (isElectron()) {
      try {
        const response = await (window as any).electronAPI.dbQuery({ model, action, args });
        if (response && response.success) {
          return response.data;
        } else {
          console.error(`DB Error: ${response?.error}`);
          throw new Error(response?.error || 'Unknown database error');
        }
      } catch (error) {
        console.error('IPC DB query failed:', error);
        throw error;
      }
    } else {
      // Running in browser without Electron — use mock data
      return mockQuery(model, action, args);
    }
  },
};
