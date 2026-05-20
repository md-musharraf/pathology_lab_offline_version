# 🏥 PATHOLOGY LABORATORY INFORMATION SYSTEM (LIS)
## Complete Production-Ready Build Prompt — v3.0 FINAL

> **Target:** India-focused, fully offline-capable, NABL-ready, desktop-first  
> **Scale:** Small single-lab to multi-branch diagnostic chains  
> **Standard:** Professional ERP/LIS quality used by leading diagnostic centers  

---

## ❌ WHAT WAS MISSING FROM YOUR PREVIOUS PROMPT (Gap Analysis)

Before the full prompt, here are **23 critical missing features** identified through research on real Indian LIS systems (PrimeDoc, Flabs, ATMSoftek, CrelioHealth, Qmarks):

| # | Missing Feature | Why Critical |
|---|----------------|-------------|
| 1 | Home Sample Collection module | Very common in Indian labs — phlebotomist assigns, GPS tracked |
| 2 | Outsource/Reference Lab management | Many tests sent to bigger labs |
| 3 | Corporate/Company billing accounts | B2B — hospitals, companies send bulk patients |
| 4 | Quality Control (QC) module | Mandatory for NABL/ISO 15189 accreditation |
| 5 | NABL compliance documentation | Required by most labs in India |
| 6 | SMS notification gateway | Report ready alerts to patient/doctor |
| 7 | Patient QR self-download portal | Patient scans bill QR → downloads report |
| 8 | Specimen rejection workflow | Improper sample → reject with reason |
| 9 | Result amendment with audit trail | Correcting mistakes with full history |
| 10 | Cumulative patient reports | Compare current vs previous test results |
| 11 | Bill cancellation + refund workflow | Cancellation with reason, refund tracking |
| 12 | Day-end cash closing register | Daily cash reconciliation |
| 13 | Health package / checkup plans | Bundled tests sold as packages |
| 14 | Referral commission auto-report | Doctor-wise commission statement |
| 15 | Bulk operations | Bulk approve, bulk share, bulk print |
| 16 | Microbiology C&S report format | Culture + Sensitivity special report format |
| 17 | Histopathology/Cytology report | Free-text narrative report type |
| 18 | TAT monitoring + breach alerts | Turnaround time alerts per test |
| 19 | Critical value notification workflow | Mandatory alert when critical result entered |
| 20 | Electron-builder packaging config | App won't install without this |
| 21 | Analyzer/Machine integration (ASTM) | Auto-import results from CBC machines |
| 22 | Expenditure management | Track reagent costs, lab expenses |
| 23 | PC-PNDT compliance | Indian law — gender-related test restrictions |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## TECH STACK (MANDATORY — DO NOT DEVIATE)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Desktop Shell:      Electron 28+ (contextBridge + ipcMain/ipcRenderer)
Frontend:           Next.js 14 (App Router) + React 18 + TypeScript (strict)
Styling:            Tailwind CSS 3.4 + shadcn/ui
Animations:         Framer Motion 11
State Management:   Zustand 4 (global) + TanStack Query v5 (server state)
ORM:                Prisma 5 with better-sqlite3 (synchronous Electron access)
Database:           SQLite (file-based, local)
PDF Generation:     pdf-lib 1.17 (generate) + @react-pdf/renderer (preview)
Barcodes:           bwip-js (barcode) + qrcode (QR generation)
Charts:             Recharts 2.x
Auth:               NextAuth.js v4 (credentials provider, local only)
Forms:              React Hook Form + Zod validation
Print:              Electron native print API + escpos (thermal 80mm)
Tables:             TanStack Table v8 (virtualized, sortable, filterable)
Encryption:         crypto-js AES-256 for backup ZIPs
Password Hashing:   bcryptjs (rounds: 12)
Packaging:          electron-builder (NSIS installer for Windows)
Auto-Update:        electron-updater
SMS Gateway:        MSG91 / Fast2SMS API (offline-queued, sends when online)
Email:              nodemailer (SMTP config in settings)
Notifications:      electron-notification (OS-level alerts)
Excel Export:       exceljs
Fonts:              Inter (UI) + JetBrains Mono (IDs/codes) via next/font
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ARCHITECTURE RULES (NON-NEGOTIABLE)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
electron/
  main/
    index.ts          ← Electron entry, creates BrowserWindow
    ipc/
      patients.ts     ← IPC handlers for patient module
      billing.ts
      results.ts
      reports.ts
      ... (one file per module)
    db.ts             ← Prisma client singleton
    services/
      backup.ts
      pdf.ts
      sms.ts
      email.ts
      analyzer.ts     ← Machine integration
  preload/
    index.ts          ← contextBridge exposure

renderer/ (Next.js)
  app/
    (auth)/login/
    (dashboard)/
    patients/
    samples/
    results/
    reports/
    billing/
    tests/
    inventory/
    home-collection/
    outsource/
    corporate/
    quality-control/
    analytics/
    settings/
    staff/
    doctors/
    backup/
    audit-log/
  components/
    ui/               ← shadcn/ui components
    lab/              ← custom lab components
  lib/
    db.ts             ← IPC abstraction (calls Electron bridge)
    result-interpreter.ts
    report-generator.ts
    barcode-generator.ts
    validators/
  shared/
    types.ts          ← ALL shared TypeScript types
    ipc-channels.ts   ← typed IPC channel constants
    constants.ts
```

**Rules:**
- ZERO direct SQLite access from renderer — always IPC
- All IPC channels named: `module:action` (e.g., `patients:create`, `billing:getById`)
- SaaS-ready: `/lib/db.ts` abstracts all IPC calls (swap for HTTP later)
- TypeScript strict mode — ZERO `any` types
- Every form: React Hook Form + Zod
- Every table: TanStack Table (virtualized for 10k+ rows)
- All Prisma models: `createdAt`, `updatedAt`, `deletedAt` (soft delete)
- Barrel exports from every `/components/` subdirectory
- Environment: `.env.local` for renderer, `electron.env` for main process

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## COMPLETE PRISMA DATABASE SCHEMA
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ─── LAB SETTINGS ───────────────────────────────────────

model LabSettings {
  id                Int      @id @default(autoincrement())
  labName           String
  logo              Bytes?
  address           String
  city              String?
  state             String?
  pincode           String?
  mobile            String
  altMobile         String?
  email             String?
  website           String?
  gstNumber         String?
  registrationNo    String?
  nablNumber        String?         // NABL accreditation number
  iso15189          Boolean  @default(false)
  reportFooter      String?
  reportDisclaimer  String?
  doctorName        String?
  doctorQualification String?
  signature         Bytes?
  stamp             Bytes?
  printHeader       String?
  reportLayout      String   @default("STANDARD") // STANDARD | COMPACT | DETAILED
  currency          String   @default("INR")
  timezone          String   @default("Asia/Kolkata")
  dateFormat        String   @default("DD/MM/YYYY")
  smtpHost          String?
  smtpPort          Int?
  smtpUser          String?
  smtpPass          String?
  smsApiKey         String?
  smsProvider       String?  // MSG91 | FAST2SMS | TEXTLOCAL
  smsSenderId       String?
  whatsappNumber    String?
  autoBackup        Boolean  @default(true)
  backupTime        String   @default("02:00")
  backupPath        String?
  taxPercent        Float    @default(0)
  taxName           String   @default("GST")
  pcpndtEnabled     Boolean  @default(false) // PC-PNDT compliance
  pcpndtRegNo       String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// ─── USERS & AUTH ────────────────────────────────────────

model User {
  id           Int       @id @default(autoincrement())
  name         String
  email        String    @unique
  password     String
  role         Role      @default(RECEPTIONIST)
  isActive     Boolean   @default(true)
  lastLogin    DateTime?
  avatar       Bytes?
  mobile       String?
  pin          String?   // 4-digit PIN for quick session unlock
  permissions  String?   // JSON: fine-grained permission overrides
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?
  activityLogs ActivityLog[]
  patients     Patient[]
}

enum Role {
  SUPER_ADMIN
  ADMIN
  DOCTOR
  SENIOR_TECHNICIAN
  TECHNICIAN
  RECEPTIONIST
  ACCOUNTANT
  PHLEBOTOMIST
}

// ─── PATIENTS ────────────────────────────────────────────

model Patient {
  id               String    @id  // LAB-2024-00001
  name             String
  age              Int
  ageUnit          AgeUnit   @default(YEARS)
  dob              DateTime?
  gender           Gender
  mobile           String
  altMobile        String?
  email            String?
  address          String?
  city             String?
  pincode          String?
  bloodGroup       String?
  emergencyContact String?
  emergencyPhone   String?
  referredDoctor   String?
  referredDoctorId Int?
  doctor           Doctor?   @relation(fields: [referredDoctorId], references: [id])
  corporateId      Int?
  corporate        Corporate? @relation(fields: [corporateId], references: [id])
  isEmergency      Boolean   @default(false)
  patientType      PatientType @default(WALKIN)
  notes            String?
  consentGiven     Boolean   @default(false)
  createdBy        Int
  user             User      @relation(fields: [createdBy], references: [id])
  registeredAt     DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  deletedAt        DateTime?
  orders           TestOrder[]
  bills            Bill[]
  homeCollections  HomeCollection[]
}

enum Gender { MALE FEMALE OTHER }
enum AgeUnit { YEARS MONTHS DAYS }
enum PatientType { WALKIN CORPORATE HOME_COLLECTION REFERRED EMERGENCY }

// ─── DOCTORS ─────────────────────────────────────────────

model Doctor {
  id                 Int      @id @default(autoincrement())
  name               String
  qualification      String?
  specialization     String?
  hospital           String?
  mobile             String?
  email              String?
  address            String?
  commissionType     CommissionType @default(FLAT)
  commissionValue    Float    @default(0)
  isActive           Boolean  @default(true)
  portalAccess       Boolean  @default(false)
  portalPassword     String?  // hashed, for doctor portal
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  deletedAt          DateTime?
  patients           Patient[]
  commissions        DoctorCommission[]
}

enum CommissionType { FLAT PERCENT PER_TEST }

model DoctorCommission {
  id        Int      @id @default(autoincrement())
  doctorId  Int
  doctor    Doctor   @relation(fields: [doctorId], references: [id])
  billId    Int
  amount    Float
  status    CommissionStatus @default(PENDING)
  paidAt    DateTime?
  createdAt DateTime @default(now())
}

enum CommissionStatus { PENDING PAID CANCELLED }

// ─── CORPORATE ACCOUNTS ───────────────────────────────────

model Corporate {
  id            Int      @id @default(autoincrement())
  name          String
  contactPerson String?
  mobile        String?
  email         String?
  address       String?
  gstNumber     String?
  creditLimit   Float    @default(0)
  creditDays    Int      @default(30)
  discountType  DiscountType @default(FLAT)
  discountValue Float    @default(0)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  patients      Patient[]
  bills         Bill[]
}

// ─── TEST CATALOG ─────────────────────────────────────────

model TestCategory {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  code        String  @unique
  description String?
  color       String? // hex for UI color coding
  icon        String? // icon name
  sortOrder   Int     @default(0)
  isActive    Boolean @default(true)
  tests       Test[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Test {
  id               Int           @id @default(autoincrement())
  code             String        @unique
  name             String
  shortName        String?
  loincCode        String?       // LOINC standard code
  categoryId       Int
  category         TestCategory  @relation(fields: [categoryId], references: [id])
  price            Float
  costPrice        Float?        // for margin tracking
  duration         Int           // TAT in hours
  tatUnit          String        @default("HOURS") // HOURS | DAYS
  sampleType       String
  container        String?
  containerColor   String?       // tube color: RED | PURPLE | GREEN etc.
  volume           String?
  instructions     String?       // patient preparation instructions
  methodology      String?
  reportType       ReportType    @default(TABULAR)
  isActive         Boolean       @default(true)
  isPanel          Boolean       @default(false)
  panelTests       String?       // JSON array of test IDs
  outsourceable    Boolean       @default(false)
  outsourceLabId   Int?
  outsourceLab     OutsourceLab? @relation(fields: [outsourceLabId], references: [id])
  parameters       TestParameter[]
  packages         PackageTest[]
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  deletedAt        DateTime?
  orderItems       TestOrderItem[]
}

enum ReportType {
  TABULAR          // standard table: param | result | range | status
  NARRATIVE        // histopathology: free text report
  CULTURE_SENSITIVITY // microbiology C&S
  URINE_MICROSCOPY // urine with micro section
  PANEL            // grouped sub-tests
}

model TestParameter {
  id              Int       @id @default(autoincrement())
  testId          Int
  test            Test      @relation(fields: [testId], references: [id])
  name            String
  shortName       String?
  unit            String?
  sortOrder       Int       @default(0)
  type            ParameterType @default(NUMERIC)
  options         String?   // JSON array for DROPDOWN
  formula         String?   // for CALCULATED fields e.g. "LDL = Cholesterol - HDL - TG/5"
  isHeader        Boolean   @default(false)
  isMandatory     Boolean   @default(true)
  decimalPlaces   Int       @default(2)
  refRanges       ReferenceRange[]
  results         TestResult[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum ParameterType { NUMERIC TEXT DROPDOWN CALCULATED OBSERVATION POSITIVE_NEGATIVE REACTIVE_NON_REACTIVE }

model ReferenceRange {
  id              Int      @id @default(autoincrement())
  parameterId     Int
  parameter       TestParameter @relation(fields: [parameterId], references: [id])
  gender          Gender?
  ageMin          Int?     // in days
  ageMax          Int?
  normalMin       Float?
  normalMax       Float?
  criticalMin     Float?
  criticalMax     Float?
  panicMin        Float?   // extreme panic values
  panicMax        Float?
  textNormal      String?  // comma-separated for text type
  unit            String?
  interpretation  String?
  source          String?  // reference source e.g. "WHO 2023"
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// ─── PACKAGES / HEALTH CHECKUPS ───────────────────────────

model Package {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Float
  isActive    Boolean  @default(true)
  validDays   Int?     // validity of package
  tests       PackageTest[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PackageTest {
  id        Int  @id @default(autoincrement())
  packageId Int
  package   Package @relation(fields: [packageId], references: [id])
  testId    Int
  test      Test    @relation(fields: [testId], references: [id])
}

// ─── TEST ORDERS ──────────────────────────────────────────

model TestOrder {
  id             Int           @id @default(autoincrement())
  orderNo        String        @unique  // LAB-ORD-20240101-0001
  patientId      String
  patient        Patient       @relation(fields: [patientId], references: [id])
  billId         Int?
  bill           Bill?         @relation(fields: [billId], references: [id])
  collectedAt    DateTime?
  collectedBy    Int?          // User ID of phlebotomist
  expectedAt     DateTime?
  deliveredAt    DateTime?
  priority       Priority      @default(ROUTINE)
  status         OrderStatus   @default(PENDING)
  barcodeData    String?
  qrData         String?
  qrDownloadToken String?      // unique token for patient self-download
  note           String?
  tatBreached    Boolean       @default(false)
  tatBreachAlertSent Boolean   @default(false)
  specimenRejected Boolean     @default(false)
  rejectionReason String?
  rejectedBy     Int?
  isOutsourced   Boolean       @default(false)
  outsourceLabId Int?
  outsourceLab   OutsourceLab? @relation(fields: [outsourceLabId], references: [id])
  outsourceStatus String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  items          TestOrderItem[]
  report         Report?
  notifications  Notification[]
  homeCollection HomeCollection?
}

enum Priority { ROUTINE URGENT EMERGENCY CRITICAL_URGENT }

enum OrderStatus {
  PENDING
  SAMPLE_COLLECTED
  SPECIMEN_REJECTED
  PROCESSING
  RESULT_ENTERED
  VERIFIED
  APPROVED
  DELIVERED
  OUTSOURCED
  CANCELLED
}

model TestOrderItem {
  id            Int         @id @default(autoincrement())
  orderId       Int
  order         TestOrder   @relation(fields: [orderId], references: [id])
  testId        Int
  test          Test        @relation(fields: [testId], references: [id])
  results       TestResult[]
  status        ItemStatus  @default(PENDING)
  enteredBy     Int?
  enteredAt     DateTime?
  verifiedBy    Int?
  verifiedAt    DateTime?
  reportType    ReportType  @default(TABULAR)
  narrativeReport String?   // for histopathology free-text
  grossDescription String?  // histopathology gross
  microscopicDesc String?   // histopathology microscopic
  impression     String?    // histopathology impression
  organism       String?    // culture: organism name
  sensitivity    String?    // culture: sensitivity JSON
  resistance     String?    // culture: resistance JSON
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum ItemStatus { PENDING PROCESSING RESULT_ENTERED VERIFIED AMENDMENT_REQUESTED }

model TestResult {
  id              Int            @id @default(autoincrement())
  orderItemId     Int
  orderItem       TestOrderItem  @relation(fields: [orderItemId], references: [id])
  parameterId     Int
  parameter       TestParameter  @relation(fields: [parameterId], references: [id])
  numericValue    Float?
  textValue       String?
  status          ResultStatus
  flag            String?        // ↑ ↓ ↑↑ ↓↓ null
  isCritical      Boolean        @default(false)
  isPanic         Boolean        @default(false)
  isAbnormal      Boolean        @default(false)
  criticalAcknowledgedBy Int?
  criticalAcknowledgedAt DateTime?
  note            String?
  isAmended       Boolean        @default(false)
  amendmentReason String?
  originalValue   String?        // stores original before amendment
  enteredAt       DateTime       @default(now())
  enteredBy       Int
  version         Int            @default(1)
}

enum ResultStatus { LOW NORMAL HIGH CRITICAL PANIC PENDING TEXT_POSITIVE TEXT_NEGATIVE TEXT_REACTIVE TEXT_NON_REACTIVE }

// ─── BILLING ──────────────────────────────────────────────

model Bill {
  id               Int           @id @default(autoincrement())
  billNo           String        @unique
  patientId        String
  patient          Patient       @relation(fields: [patientId], references: [id])
  corporateId      Int?
  corporate        Corporate?    @relation(fields: [corporateId], references: [id])
  subtotal         Float
  discountType     DiscountType  @default(FLAT)
  discountValue    Float         @default(0)
  discountAmount   Float         @default(0)
  discountReason   String?
  taxPercent       Float         @default(0)
  taxAmount        Float         @default(0)
  totalAmount      Float
  paidAmount       Float         @default(0)
  dueAmount        Float         @default(0)
  advanceAmount    Float         @default(0)
  paymentStatus    PaymentStatus @default(UNPAID)
  isCancelled      Boolean       @default(false)
  cancelledAt      DateTime?
  cancelledBy      Int?
  cancellationReason String?
  refundAmount     Float?
  refundAt         DateTime?
  referralCommission Float?
  commissionPaid   Boolean       @default(false)
  notes            String?
  createdBy        Int
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  orders           TestOrder[]
  payments         Payment[]
  billItems        BillItem[]
}

model BillItem {
  id        Int    @id @default(autoincrement())
  billId    Int
  bill      Bill   @relation(fields: [billId], references: [id])
  testId    Int?
  packageId Int?
  name      String
  quantity  Int    @default(1)
  unitPrice Float
  discount  Float  @default(0)
  total     Float
}

model Payment {
  id          Int      @id @default(autoincrement())
  billId      Int
  bill        Bill     @relation(fields: [billId], references: [id])
  amount      Float
  method      PaymentMethod
  reference   String?  // UPI txn ID, cheque no, etc.
  bankName    String?
  paidAt      DateTime @default(now())
  receivedBy  Int
  isRefund    Boolean  @default(false)
  note        String?
}

model DayClosure {
  id            Int      @id @default(autoincrement())
  date          DateTime @unique
  openingCash   Float    @default(0)
  totalCash     Float    @default(0)
  totalUPI      Float    @default(0)
  totalCard     Float    @default(0)
  totalCredit   Float    @default(0)
  totalRevenue  Float    @default(0)
  totalRefunds  Float    @default(0)
  patientCount  Int      @default(0)
  closedBy      Int
  notes         String?
  closedAt      DateTime @default(now())
}

enum DiscountType { FLAT PERCENT }
enum PaymentMethod { CASH UPI CARD NETBANKING CHEQUE CREDIT ADVANCE INSURANCE }
enum PaymentStatus { UNPAID PARTIAL PAID CORPORATE_CREDIT CANCELLED }

// ─── REPORTS ──────────────────────────────────────────────

model Report {
  id              Int       @id @default(autoincrement())
  orderId         Int       @unique
  order           TestOrder @relation(fields: [orderId], references: [id])
  pdfData         Bytes?
  pdfPath         String?
  printCount      Int       @default(0)
  approvedBy      Int?
  approvedAt      DateTime?
  deliveredAt     DateTime?
  deliveryMethods String?   // JSON array of DeliveryMethod
  isAmended       Boolean   @default(false)
  amendVersion    Int       @default(1)
  amendReason     String?
  amendments      ReportAmendment[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model ReportAmendment {
  id          Int      @id @default(autoincrement())
  reportId    Int
  report      Report   @relation(fields: [reportId], references: [id])
  version     Int
  pdfData     Bytes?
  reason      String
  amendedBy   Int
  amendedAt   DateTime @default(now())
}

enum DeliveryMethod { PRINT WHATSAPP SMS EMAIL DOWNLOAD PORTAL }

// ─── HOME SAMPLE COLLECTION ───────────────────────────────

model HomeCollection {
  id              Int       @id @default(autoincrement())
  patientId       String
  patient         Patient   @relation(fields: [patientId], references: [id])
  orderId         Int?      @unique
  order           TestOrder? @relation(fields: [orderId], references: [id])
  address         String
  scheduledAt     DateTime
  phlebotomistId  Int?
  phlebotomist    Staff?    @relation(fields: [phlebotomistId], references: [id])
  status          HomeCollectionStatus @default(SCHEDULED)
  collectedAt     DateTime?
  deliveryCharge  Float     @default(0)
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum HomeCollectionStatus { SCHEDULED ASSIGNED COLLECTED CANCELLED }

// ─── OUTSOURCE / REFERENCE LABS ──────────────────────────

model OutsourceLab {
  id          Int      @id @default(autoincrement())
  name        String
  mobile      String?
  email       String?
  address     String?
  isActive    Boolean  @default(true)
  tests       Test[]
  orders      TestOrder[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ─── QUALITY CONTROL ──────────────────────────────────────

model QCRecord {
  id            Int      @id @default(autoincrement())
  testId        Int
  parameterId   Int
  batchNo       String?
  controlLevel  String   // LOW | NORMAL | HIGH
  expectedValue Float
  measuredValue Float
  deviation     Float
  percentCV     Float?
  status        QCStatus
  instrument    String?
  performedBy   Int
  performedAt   DateTime @default(now())
  notes         String?
  createdAt     DateTime @default(now())
}

enum QCStatus { PASS FAIL WARNING }

// ─── STAFF ────────────────────────────────────────────────

model Staff {
  id           Int      @id @default(autoincrement())
  name         String
  role         Role
  mobile       String?
  email        String?
  salary       Float?
  joinedAt     DateTime?
  isActive     Boolean  @default(true)
  attendance   Attendance[]
  homeCollections HomeCollection[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?
}

model Attendance {
  id        Int      @id @default(autoincrement())
  staffId   Int
  staff     Staff    @relation(fields: [staffId], references: [id])
  date      DateTime
  status    AttendanceStatus
  inTime    String?
  outTime   String?
  note      String?
  createdAt DateTime @default(now())
}

enum AttendanceStatus { PRESENT ABSENT HALFDAY LEAVE HOLIDAY }

// ─── INVENTORY ────────────────────────────────────────────

model InventoryItem {
  id            Int      @id @default(autoincrement())
  name          String
  category      String   // REAGENT | TUBE | CHEMICAL | KIT | CONSUMABLE | EQUIPMENT
  unit          String
  currentStock  Float
  minStock      Float
  maxStock      Float?
  expiryDate    DateTime?
  supplierId    Int?
  supplier      Supplier? @relation(fields: [supplierId], references: [id])
  batchNumber   String?
  purchasePrice Float?
  sellingPrice  Float?
  isActive      Boolean  @default(true)
  alertSent     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  transactions  InventoryTransaction[]
}

model Supplier {
  id        Int      @id @default(autoincrement())
  name      String
  mobile    String?
  email     String?
  address   String?
  gst       String?
  items     InventoryItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model InventoryTransaction {
  id         Int      @id @default(autoincrement())
  itemId     Int
  item       InventoryItem @relation(fields: [itemId], references: [id])
  type       TxType
  quantity   Float
  unitPrice  Float?
  totalPrice Float?
  note       String?
  invoice    String?
  createdAt  DateTime @default(now())
  createdBy  Int
}

enum TxType { IN OUT ADJUST EXPIRED RETURN }

// ─── EXPENDITURE ──────────────────────────────────────────

model Expenditure {
  id          Int      @id @default(autoincrement())
  category    String   // SALARY | REAGENT | RENT | EQUIPMENT | MISC
  description String
  amount      Float
  paidTo      String?
  paymentMethod PaymentMethod @default(CASH)
  reference   String?
  expenseDate DateTime
  createdBy   Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ─── NOTIFICATIONS ────────────────────────────────────────

model Notification {
  id          Int      @id @default(autoincrement())
  orderId     Int?
  order       TestOrder? @relation(fields: [orderId], references: [id])
  type        NotificationType
  recipient   String   // mobile or email
  channel     String   // SMS | WHATSAPP | EMAIL
  message     String
  status      NotifStatus @default(PENDING)
  sentAt      DateTime?
  error       String?
  createdAt   DateTime @default(now())
}

enum NotificationType { REGISTRATION SAMPLE_COLLECTED REPORT_READY CRITICAL_ALERT PAYMENT_DUE CUSTOM }
enum NotifStatus { PENDING SENT FAILED QUEUED }

// ─── LOGS ─────────────────────────────────────────────────

model ActivityLog {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  action    String
  module    String
  entityId  String?
  details   String?
  ip        String?
  createdAt DateTime @default(now())
}

model BackupLog {
  id         Int      @id @default(autoincrement())
  filename   String
  sizeBytes  Int
  type       BackupType
  status     String
  path       String?
  createdAt  DateTime @default(now())
  createdBy  Int
}

enum BackupType { MANUAL AUTO SCHEDULED CLOUD }
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SEED DATA (COMPLETE — MUST IMPLEMENT)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement `prisma/seed.ts` with:

### Users
```
admin@lab.com / Admin@123 / Role: SUPER_ADMIN
tech@lab.com / Tech@123 / Role: TECHNICIAN
reception@lab.com / Reception@123 / Role: RECEPTIONIST
```

### Test Categories (with codes and colors)
```
HEM  - Hematology           (#EF4444)
BIO  - Biochemistry         (#3B82F6)
SER  - Serology             (#8B5CF6)
HOR  - Hormones             (#EC4899)
URI  - Urine Analysis       (#F59E0B)
STL  - Stool Analysis       (#78716C)
MIC  - Microbiology         (#10B981)
HIS  - Histopathology       (#6366F1)
CYT  - Cytology             (#14B8A6)
MOL  - Molecular            (#F97316)
```

### Complete Test Library (ALL with parameters + reference ranges)

#### 1. CBC — Complete Blood Count (HEM001)
Parameters: Hemoglobin, RBC Count, WBC Count, Platelet Count, Hematocrit (PCV),
MCV, MCH, MCHC, RDW, Neutrophils%, Lymphocytes%, Monocytes%, Eosinophils%,
Basophils%, Absolute Neutrophil Count

Reference ranges: Gender-specific + pediatric age-group ranges

#### 2. ESR (HEM002)
Parameters: ESR (Westergren method) — Male: 0-15, Female: 0-20 mm/hr

#### 3. Peripheral Smear (HEM003) — NARRATIVE report type

#### 4. Liver Function Test — LFT (BIO001)
Parameters: Total Bilirubin, Direct Bilirubin, Indirect Bilirubin (CALCULATED),
SGOT/AST, SGPT/ALT, Alkaline Phosphatase, GGT, Total Protein, Albumin,
Globulin (CALCULATED), A:G Ratio (CALCULATED)

#### 5. Kidney Function Test — KFT (BIO002)
Parameters: Serum Creatinine, Blood Urea, Uric Acid, eGFR (CALCULATED),
Urea:Creatinine Ratio (CALCULATED), BUN

#### 6. Lipid Profile (BIO003)
Parameters: Total Cholesterol, HDL Cholesterol, LDL Cholesterol (CALCULATED via
Friedewald), VLDL (CALCULATED), Triglycerides, Non-HDL Cholesterol (CALCULATED),
TC:HDL Ratio (CALCULATED)

#### 7. Diabetes Panel (BIO004)
Parameters: Fasting Blood Sugar, Post-Prandial Blood Sugar, Random Blood Sugar, HbA1c,
Estimated Average Glucose (eAG — CALCULATED from HbA1c)

#### 8. Thyroid Profile (BIO005)
Parameters: T3 (Triiodothyronine), T4 (Thyroxine), TSH — with trimester-specific ranges
for pregnant women

#### 9. Iron Studies (BIO006)
Parameters: Serum Iron, TIBC, Transferrin Saturation (CALCULATED), Serum Ferritin

#### 10. Electrolytes (BIO007)
Parameters: Sodium, Potassium, Chloride, Bicarbonate, Anion Gap (CALCULATED),
Calcium, Phosphorus, Magnesium

#### 11. Cardiac Profile (BIO008)
Parameters: Troponin I, CK-MB, LDH, CPK Total, NT-proBNP, hs-CRP

#### 12. Coagulation Profile (BIO009)
Parameters: PT, INR (CALCULATED), APTT, Thrombin Time, Fibrinogen, D-Dimer

#### 13. Vitamins (BIO010)
Parameters: Vitamin D (25-OH), Vitamin B12, Folate/Folic Acid

#### 14. Hormone Panel — Fertility (HOR001)
Parameters: FSH, LH, Prolactin, Estradiol (E2), Progesterone, AMH —
gender+phase-specific ranges

#### 15. Thyroid Extended (HOR002)
Parameters: Free T3 (fT3), Free T4 (fT4), Anti-TPO, Anti-Thyroglobulin

#### 16. Hormone Panel — Male (HOR003)
Parameters: Total Testosterone, Free Testosterone, DHEA-S, PSA (Total),
PSA (Free), F/T PSA Ratio (CALCULATED)

#### 17. Cortisol (HOR004)
Parameters: Morning Cortisol, Evening Cortisol

#### 18. Urine Routine & Microscopy (URI001)
Parameters: Color, Appearance, pH, Specific Gravity, Protein, Glucose, Ketone,
Bilirubin, Urobilinogen, Blood, Nitrite, Leukocyte Esterase,
RBC/HPF, WBC/HPF, Epithelial Cells, Casts (type), Crystals, Bacteria, Yeast

#### 19. Urine Microalbumin (URI002)

#### 20. Stool Analysis (STL001)
Parameters: Color, Consistency, Mucus, Blood, Pus Cells, RBC, WBC,
Ova/Parasites, Cysts, Occult Blood

#### 21. Serology Panel (SER001)
Parameters (REACTIVE/NON-REACTIVE or POSITIVE/NEGATIVE type):
HIV 1 & 2 (Combo), HBsAg, Anti-HCV, VDRL, Dengue NS1 Antigen,
Dengue IgM, Dengue IgG, Malaria Antigen (PF/PV), Widal (TO, TH, AO, AH titres),
Typhidot IgM/IgG

#### 22. CRP & Inflammatory Markers (SER002)
Parameters: CRP (Quantitative), RA Factor, ASO Titre

#### 23. ANA Panel (SER003)
Parameters: ANA (Screening), Anti-dsDNA, ANCA, C3, C4

#### 24. Microbiology — C&S (MIC001) — CULTURE_SENSITIVITY report type
Fields: Specimen Type, Culture Result, Organism Identified,
Colony Count, Antibiotic Sensitivity/Resistance table

#### 25. Blood Group & Rh Typing (HEM010)
Parameters: ABO Group (DROPDOWN), Rh Type (DROPDOWN: Positive/Negative)

#### 26. Pregnancy Panel (HOR010)
Parameters: Beta-hCG, Progesterone, AFP (maternal serum)

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RESULT INTERPRETATION ENGINE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**File: `/lib/result-interpreter.ts`**

```typescript
export interface InterpretationResult {
  status: ResultStatus;
  flag: '↑↑' | '↓↓' | '↑' | '↓' | '!!' | null;
  isCritical: boolean;
  isPanic: boolean;
  isAbnormal: boolean;
  colorClass: string;       // Tailwind text color
  bgColorClass: string;     // Tailwind bg color
  borderClass: string;
  badgeVariant: string;
  label: string;
  shouldAlert: boolean;     // trigger critical notification
}

export function interpretResult(
  value: number | string | null,
  paramType: ParameterType,
  range: ReferenceRange | null,
  patientAgeInDays: number,
  patientGender: Gender
): InterpretationResult

// Rules (in priority order):
// 1. value === null → PENDING
// 2. Text/Dropdown types → compare against textNormal (comma-sep list)
//    → POSITIVE/REACTIVE = abnormal flag
// 3. Numeric:
//    value < panicMin OR value > panicMax → PANIC (!!) → shouldAlert = true
//    value < criticalMin OR value > criticalMax → CRITICAL (↑↑/↓↓) → shouldAlert = true
//    value < normalMin → LOW (↓)
//    value > normalMax → HIGH (↑)
//    else → NORMAL
// 4. Age matching: find range where ageMin <= patientAgeInDays <= ageMax
// 5. Gender matching: prefer gender-specific range over null-gender range
// 6. Formula params: evaluate formula string safely using mathjs

// Visual map:
// PANIC    → bg-red-200 text-red-950 border-red-700 animate-ping "PANIC !!"
// CRITICAL → bg-red-100 text-red-800 border-red-500 animate-pulse "CRITICAL ↑↑/↓↓"
// HIGH     → bg-orange-100 text-orange-700 border-orange-400 "HIGH ↑"
// LOW      → bg-blue-100 text-blue-700 border-blue-400 "LOW ↓"
// NORMAL   → bg-green-100 text-green-700 border-green-400 "NORMAL ✓"
// PENDING  → bg-gray-100 text-gray-400 border-gray-200 "PENDING"
```

**Critical value workflow:**
When `shouldAlert = true`:
1. Save `TestResult.isCritical = true`
2. Show full-screen modal alert to technician: "CRITICAL VALUE DETECTED"
   - Requires entering Doctor's name who was notified
   - Requires entering time of notification
   - Sets `criticalAcknowledgedBy` and `criticalAcknowledgedAt`
3. Queue SMS/WhatsApp notification to referring doctor
4. Add red banner on dashboard
5. Log to ActivityLog

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## COMPLETE PATIENT WORKFLOW
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
STEP 1: REGISTRATION
  Receptionist registers patient:
  - Auto ID: LAB-YYYY-NNNNN (sequence per year, resets Jan 1)
  - Name, Age, Gender, Mobile, Address
  - Referred Doctor (with commission auto-linked)
  - Corporate account selection (if applicable)
  - Patient type: Walk-in / Corporate / Home Collection / Emergency
  - Test selection (search + category browse + package selection)
  - Set priority: Routine / Urgent / Emergency
  - Consent acknowledgment checkbox
  ↓
STEP 2: BILLING
  Auto-calculated from test prices:
  - Apply discount (flat/%) with reason field
  - Apply corporate discount if linked
  - Add GST
  - Select payment method
  - Split payment allowed (partial cash + partial UPI)
  - Mark as due with due date
  - Generate thermal 80mm receipt OR A4 invoice PDF
  - GST invoice with proper format (GSTIN, HSN codes)
  - QR code on bill → patient scans to download report later
  ↓
STEP 3: SAMPLE COLLECTION
  Either at lab or home collection:
  - Print barcode label (test-wise or order-wise)
  - Print QR label with patient info
  - Mark sample collected + timestamp
  - Record phlebotomist name
  - Specimen adequacy check: Accept / Reject
  - If rejected: select rejection reason → notify receptionist
    (Reasons: Hemolyzed, Clotted, Insufficient Volume, Wrong Container,
     Unlabeled, Lipemic, Temperature Issue)
  - TAT clock starts from sample collection time
  ↓
STEP 4: RESULT ENTRY (Technician)
  - Scan barcode OR search patient
  - Shows pending tests for this patient
  - Enter results parameter by parameter
  - REAL-TIME interpretation as you type (< 50ms response)
  - Critical value: full-screen alert → mandatory acknowledgment
  - Calculated fields: auto-compute (formula engine)
  - Save draft (partial entry allowed)
  - Tabs for different test categories
  - Previous result shown alongside (if repeat test)
  ↓
STEP 5: VERIFICATION (Senior Technician)
  - Review all entered results
  - Check all critical flags
  - Compare with previous results (if available)
  - Add technician comments
  - Mark as verified
  ↓
STEP 6: APPROVAL (Doctor / Admin)
  - Final review
  - Add doctor comments / clinical correlation
  - Attach digital signature
  - Approve → Report LOCKED (no edits)
  - If amendment needed post-approval:
    - Request amendment → enter reason
    - Unlock for correction
    - Creates new report version with amendment history
  ↓
STEP 7: DELIVERY
  - PDF auto-generated on approval
  - Print A4 (Electron print API)
  - WhatsApp: wa.me/91XXXXXXXXXX?text=... + PDF download link
  - SMS: "Your report is ready. Download: https://lab.local/r/TOKEN"
  - Email: nodemailer with PDF attachment
  - Patient portal: QR on bill → download report with DOB verification
  - Mark as delivered
  - Update order status → DELIVERED
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PDF REPORT DESIGN (EXACT LAYOUT)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Library:** pdf-lib (generation) + `@react-pdf/renderer` (in-app preview)

### Report Layout — TABULAR (standard):

```
┌──────────────────────────────────────────────────────────┐
│ [LAB LOGO]    LAB NAME (large bold)    [QR CODE]         │
│ Address | Phone | Email | Website                        │
│ NABL No: XXXXX | GST: XXXXXXXXX | Reg: XXXXXXX          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ LABORATORY REPORT                    [URGENT] badge      │
├────────────────────────┬─────────────────────────────────┤
│ Patient: FULL NAME     │ Patient ID: LAB-2024-00001       │
│ Age/Gender: 35Y / Male │ Order No:  LAB-ORD-20240101-001 │
│ Ref Doctor: Dr. XXXXX  │ Collected: 01/01/2024 08:30 AM  │
│ Mobile: XXXXXXXXXX     │ Reported:  01/01/2024 10:00 AM  │
├────────────────────────┴─────────────────────────────────┤
│ ▐▌▌▐▌▐▐▌▌▐▌▌▐ [BARCODE] LAB-ORD-20240101-001           │
├──────────────────────────────────────────────────────────┤
│ ░░░ HEMATOLOGY ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├────────────┬──────────┬──────────┬─────────────┬─────────┤
│ PARAMETER  │  RESULT  │   UNIT   │  REF RANGE  │ STATUS  │
├────────────┼──────────┼──────────┼─────────────┼─────────┤
│ Hemoglobin │ [RED]7.2 │  g/dL    │  13.0-17.0  │[LOW ↓]  │
│ WBC Count  │ [GRN]8.5 │ 10³/µL   │   4.0-11.0  │[NORMAL] │
│ Platelet   │[ORG]450  │ 10³/µL   │ 150.0-400.0 │[HIGH ↑] │
│ ──────── DIFFERENTIAL COUNT ─────────────────────────── │
│ Neutrophils│ [GRN]62  │    %     │   40-75     │[NORMAL] │
├────────────────────────────────────────────────────────  │
│ ⚠ SUMMARY: 2 ABNORMAL | 0 CRITICAL                      │
│ • Hemoglobin: LOW — Possible anemia. Further evaluation  │
│   recommended.                                           │
│ • Platelet Count: MILDLY ELEVATED                        │
├──────────────────────────────────────────────────────────┤
│        [DIGITAL SIGNATURE IMAGE]                         │
│        Dr. XXXXXXXXX                                     │
│        MD Pathology | Reg No: XXXXXX                     │
├──────────────────────────────────────────────────────────┤
│ * This report is valid only with lab seal and signature. │
│ * Results should be correlated clinically.               │
│ * Report generated on: 01/01/2024 10:00 AM               │
│                               Page 1 of 1                │
└──────────────────────────────────────────────────────────┘
```

### Report Types:
1. **TABULAR** — standard parameter table (most tests)
2. **NARRATIVE** — Histopathology: Gross → Microscopic → Impression (rich text)
3. **CULTURE_SENSITIVITY** — Organism | Antibiotic sensitivity table with R/S/I
4. **URINE_MICROSCOPY** — Physical + Chemical + Microscopy in 3 sections
5. **CUMULATIVE** — Side-by-side comparison of multiple visits (max 5)

### PDF features:
- Colored result text (green/orange/red)
- Colored status badge cells
- Critical rows: bold + red + ⚠ icon
- Lab logo (PNG blob from LabSettings)
- Doctor signature image
- Lab stamp image
- QR code (order download token)
- Barcode (order number)
- Watermark "AMENDED" on amended reports
- Auto page-break for long reports
- Page X of Y footer
- Store as: `Report.pdfData` Blob + `/reports/LAB-ORD-XXXX.pdf` file

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ALL MODULE PAGES (COMPLETE LIST)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
/login                       Auth page + session lock overlay (PIN entry)
/dashboard                   KPI cards + charts + pipeline + alerts

/patients                    List: search, filter by status/date/doctor
/patients/new                Registration form + test selector + package picker
/patients/[id]               Patient profile, order timeline, cumulative report
/patients/[id]/history       All previous reports side-by-side comparison

/samples                     Queue: pending collections, barcode print, reject
/samples/home-collection     Scheduled home collections, assign phlebotomist

/results                     Pending results queue (sorted by TAT breach risk)
/results/[orderId]           Result entry form with real-time interpreter
/results/[orderId]/view      Read-only verified result view

/reports                     All reports: pending/approved/delivered filter
/reports/[orderId]           PDF preview, approve, deliver, amend
/reports/[orderId]/amend     Amendment form with reason

/billing                     Bill list, filter by status/date/doctor/corporate
/billing/new                 Create bill (linked from patient registration)
/billing/[billId]            Bill detail, add payment, cancel, refund
/billing/day-closure         Day-end cash closing register
/billing/corporate           Corporate account statements and dues

/tests                       Test catalog list with category filter
/tests/new                   Add test wizard (basic → parameters → ranges)
/tests/[id]/edit             Edit test with parameter builder
/tests/[id]/parameters       Manage parameters and reference ranges
/packages                    Health package management

/inventory                   Stock list + expiry alerts + low stock
/inventory/new               Add item
/inventory/transactions      In/out log with date filter
/inventory/suppliers         Supplier management
/inventory/expiry-alerts     Items expiring in 30/60/90 days

/outsource                   External lab management, pending outsourced tests
/quality-control             QC record entry, Levey-Jennings chart

/doctors                     Referred doctor list
/doctors/[id]                Doctor profile, patient list, commission report
/doctors/commissions         Commission payments tracker

/corporate                   Corporate account list
/corporate/[id]              Account detail, patient list, outstanding bill

/staff                       Staff list
/staff/[id]                  Staff profile + attendance + salary
/staff/attendance            Monthly attendance sheet with bulk entry

/analytics                   Full analytics dashboard with date picker
/analytics/revenue           Revenue trends, GST summary
/analytics/tests             Test frequency, TAT analysis
/analytics/doctors           Doctor referral stats
/analytics/patients          Demographics, repeat patients

/expenditure                 Expense tracking
/expenditure/new             Add expense

/settings                    Lab profile + branding
/settings/users              User management
/settings/notifications      SMS/Email/WhatsApp configuration + test send
/settings/report-template    Report layout customization + preview
/settings/tax                GST / tax configuration
/settings/pcpndt             PC-PNDT registration and compliance log

/backup                      Backup & restore with history
/audit-log                   Activity log viewer with filter

/help                        Keyboard shortcuts + FAQ modal (F1)
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## UI/UX DESIGN SYSTEM
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Color Palette
```css
:root {
  /* Brand */
  --primary:      #1D4ED8;   /* Blue-700 */
  --primary-light:#DBEAFE;   /* Blue-100 */
  --secondary:    #0EA5E9;   /* Sky-500 */
  --accent:       #10B981;   /* Emerald-500 */

  /* Medical Status */
  --critical:     #7F1D1D;   /* Red-950 — blinking */
  --panic:        #450A0A;   /* deepest red — pulsing */
  --high:         #F97316;   /* Orange-500 */
  --low:          #3B82F6;   /* Blue-500 */
  --normal:       #10B981;   /* Emerald-500 */
  --pending:      #94A3B8;   /* Slate-400 */

  /* Surface */
  --surface:      #F8FAFC;
  --card:         #FFFFFF;
  --sidebar-bg:   #1E293B;   /* Slate-800 */
  --sidebar-text: #94A3B8;
  --sidebar-active: #1D4ED8;
  --border:       #E2E8F0;

  /* Typography */
  --text-primary:   #0F172A; /* Slate-900 */
  --text-secondary: #64748B; /* Slate-500 */
  --text-muted:     #94A3B8; /* Slate-400 */
}
```

### Typography
```
Display font:  'DM Sans' or 'Outfit' (medical-clean aesthetic)
Body font:     'Inter' or 'Plus Jakarta Sans'
Code/IDs:      'JetBrains Mono'
All via next/font/google
```

### Component Specs
```
Sidebar:
  Width: 240px (expanded) / 68px (collapsed)
  Items: icon + label + badge (notification count)
  Sections: patient flow, lab ops, admin, system
  Bottom: user avatar + role + logout + theme toggle

Top Header:
  Height: 56px
  Left: breadcrumbs (Home > Patients > New)
  Right: notifications bell + user menu + theme toggle + quick actions

Tables (TanStack Table):
  Sticky header
  Row hover: bg-slate-50
  Row click: select / navigate to detail
  Bulk select: checkbox column
  Column visibility toggle
  Export: CSV / Excel / Print

Cards:
  border-radius: 12px
  box-shadow: 0 1px 3px rgba(0,0,0,0.08)
  padding: 20px 24px
  hover: shadow-md transition

Forms:
  Label: 12px uppercase tracking-wider text-slate-500
  Input: border-slate-200 rounded-lg h-10 focus:ring-2 focus:ring-blue-500
  Error: text-red-500 text-xs mt-1
  Required: * after label

Status Badges:
  <StatusBadge status="NORMAL" />  → green pill
  <StatusBadge status="HIGH" />    → orange pill
  <StatusBadge status="CRITICAL" /> → dark red pulsing pill

Priority Badges:
  ROUTINE:        gray badge
  URGENT:         orange badge
  EMERGENCY:      red + animate-pulse

Order Status Pipeline:
  Horizontal stepper with icons for each status
  Completed: filled blue circle
  Current: pulsing blue ring
  Pending: gray empty circle
```

### Animations (Framer Motion)
```javascript
// Page transition
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } }
}

// Card mount
const cardVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } }
}

// KPI counter: animate number from 0 to value on mount
// Skeleton: shimmer left-to-right gradient animation
// Toast: slide in from bottom-right
// Critical badge: animate-pulse CSS
// Panic badge: animate-ping + pulse combined
```

### Dark Mode
```
next-themes with system default
Dark surface:   #0F172A (Slate-950)
Dark card:      #1E293B (Slate-800)
Dark border:    #334155 (Slate-700)
Medical status colors remain same in both modes
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## DASHBOARD (FULL SPEC)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
ROW 1 — Alert Banners (conditional):
  🔴 CRITICAL: [3] results pending acknowledgment [View Now →]
  🟠 TAT BREACH: [5] orders overdue [View →]
  🟡 LOW STOCK: [2] items below minimum [View →]

ROW 2 — KPI Cards (animated counter, click to navigate):
  Today's Patients | Pending Results | Revenue Today | Critical Cases
  Monthly Revenue  | Due Collection  | Reports Delivered | Tests Done Today

ROW 3 — Status Pipeline (clickable counts):
  Registered(12) → Collected(9) → Processing(6) → Approved(4) → Delivered(3)

ROW 4 — Charts:
  Left (60%):  Area chart — 30-day patient + revenue dual-axis
  Right (40%): Donut chart — Test category distribution today

ROW 5 — Charts:
  Left (50%):  Horizontal bar — Top 10 tests this month
  Right (50%): Bar chart — Revenue by payment method (Cash/UPI/Card/Credit)

ROW 6 — Tables:
  Left:  Recent patients (ID, Name, Tests, Status, Action buttons)
  Right: Due payments (Patient, Amount, Days Overdue, [Collect] button)

ROW 7 — Alerts list:
  Reports ready for delivery with [Print] [WhatsApp] quick buttons
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BILLING SYSTEM (DETAILED)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Bill Creation Flow:
```
1. Tests auto-loaded from patient registration
2. Add more tests if needed (search or browse)
3. Select package if applicable (replaces individual test prices)
4. Discount:
   - Flat: enter ₹ amount (reason required if > 20%)
   - Percent: enter % (auto-calculate ₹ amount)
   - Doctor-level default discount (set in Doctor profile)
   - Corporate-level default discount (set in Corporate profile)
5. GST: auto-apply from LabSettings.taxPercent
6. Referral commission: auto-calculate from Doctor.commissionValue
7. Total display: Subtotal → Discount → GST → Grand Total
8. Payment:
   - Can split across multiple methods
   - Can collect partial (rest marked as due with due date)
   - Advance payment from previous credit
9. On save:
   - Generate BillNo (BILL-YYYY-NNNNN)
   - Create BillItems for each test
   - Link to TestOrder
   - Calculate DoctorCommission record
   - Print 80mm thermal receipt OR A4 PDF invoice
10. Corporate billing:
    - Due date = today + Corporate.creditDays
    - Monthly statement generation per corporate
```

### Day-End Closure:
```
- Summary of day's collections: Cash, UPI, Card, Credit, Advance
- Total revenue, total refunds, net collection
- Patient count, test count
- Outstanding dues created today
- Lock the day (optional — prevent edits to past bills)
- Print closing report
```

### GST Invoice Format (India Compliant):
```
- GSTIN of lab
- Invoice No and Date
- Patient name and GSTIN (if corporate)
- HSN code: 999315 (medical diagnostic services)
- CGST + SGST or IGST
- Total in words (rupees)
- QR code for e-invoice (future NIC integration)
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## NOTIFICATION SYSTEM
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Notification triggers and channels:**

| Event | SMS | WhatsApp | Email | In-App |
|-------|-----|----------|-------|--------|
| Patient registered | ✓ | ✓ | — | ✓ |
| Sample collected | ✓ | — | — | ✓ |
| Report ready | ✓ | ✓ | ✓ | ✓ |
| Critical value | ✓ | ✓ | ✓ | ✓🔴 |
| Payment due reminder | ✓ | ✓ | ✓ | ✓ |
| TAT breach | — | — | — | ✓🟠 |
| Low inventory | — | — | — | ✓🟡 |

**SMS Templates (Fast2SMS / MSG91):**
```
Registration: "Dear {name}, your registration at {labName} is confirmed.
  Patient ID: {patientId}. For queries: {mobile}"

Report Ready: "Dear {name}, your lab report is ready.
  Patient ID: {patientId}. Download: {downloadLink} or visit lab.
  - {labName}"

Critical Alert (to doctor): "⚠ CRITICAL RESULT — Patient: {patientName} ({patientId})
  Test: {testName} Value: {value} {unit} (Critical).
  Please take immediate action. — {labName}"
```

**Offline queue:** If SMS/WhatsApp fails (no internet), save to `Notification.status = QUEUED`
and retry when internet is detected.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## QUALITY CONTROL (QC) MODULE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**For NABL/ISO 15189 compliance:**

```
Daily QC Entry:
- Select test + parameter + instrument
- Select control level (LOW / NORMAL / HIGH control serum)
- Enter expected (target) value + SD from QC kit insert
- Enter measured value
- Auto-calculate: deviation, % CV, Z-score
- Status: PASS (within 2 SD) / WARNING (2-3 SD) / FAIL (>3 SD)
- Westgard rules check: 1₂s, 1₃s, 2₂s, R₄s, 4₁s, 10ₓ violations flagged
- If FAIL: block result entry for that test until QC passes

Levey-Jennings Chart:
- Plot QC values over time with ±1SD, ±2SD, ±3SD lines
- Date range selection
- Export as PDF for NABL audit

Monthly QC Summary:
- Per test, per instrument
- Mean, SD, CV%
- Pass/Fail count
- Trend analysis
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ANALYZER INTEGRATION (ASTM/HL7)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
/electron/main/services/analyzer.ts

- Listen on serial port (COM port) OR local TCP/IP socket
- Parse ASTM E1381 / LIS02-A2 messages from CBC analyzers
  (Sysmex, Mindray, Horiba, Beckman Coulter)
- Also support HL7 v2.x message parsing
- Map instrument parameter IDs to Test.code + TestParameter.shortName
- Auto-populate TestResult with values from analyzer
- Flag: "Machine-imported" vs "Manually entered"
- Require technician to verify machine-imported results before saving
- Support instruments: Sysmex XN/XP, Mindray BC-5000, Horiba Yumizen

Configuration UI in Settings:
- COM port selection
- Baud rate (typically 9600 or 19200)
- Parity, data bits, stop bits
- Test button connection
- Instrument type dropdown
- Parameter mapping table (instrument code → lab parameter)
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PC-PNDT COMPLIANCE (INDIAN LAW)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
/settings/pcpndt

Pre-Conception & Pre-Natal Diagnostic Techniques Act compliance:

- Lab registration number (Form A)
- Tests requiring Form F documentation:
  - Ultrasonography (if applicable)
  - Amniocentesis
  - Chorionic villus sampling
  - Foetal sex determination (BLOCKED — cannot generate report)

Rules:
- If test tagged as PC-PNDT restricted → require Form F data entry:
  * Patient name, address, husband's name
  * Reason for test (dropdown: medical reasons only)
  * Referring doctor's registration number
  * Declaration signature
- Foetal sex result: SYSTEM BLOCKS display/print
- Monthly PC-PNDT register auto-generated (Form F log)
- Export Form F records as PDF for submission to authorities
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ANALYTICS MODULE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Date range picker on ALL reports. Export: Excel + PDF + CSV**

### Revenue Analytics
```
- Daily/Weekly/Monthly/Yearly revenue trend (line chart)
- Revenue by payment method (stacked bar)
- Revenue by test category (pie/donut)
- Revenue by referring doctor (horizontal bar)
- GST collected summary (for filing)
- Corporate vs walk-in revenue split
- Due collection aging: 0-30 | 30-60 | 60-90 | 90+ days
- Profit margin (if costPrice set): revenue vs reagent cost
```

### Patient Analytics
```
- Daily patient count trend
- New vs repeat patients (monthly)
- Patient demographics: age groups, gender split
- City/area distribution
- Referral source breakdown
```

### Test Analytics
```
- Top 20 most ordered tests
- Test frequency by category
- TAT compliance: orders within TAT vs breached
- Average TAT per test
- Critical result frequency by test
- Test rejection rate (specimen rejections)
```

### Quality Analytics
```
- QC pass/fail rate per instrument
- Critical value frequency
- Amendment rate (how often reports are corrected)
- TAT breach rate
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BACKUP & SECURITY SYSTEM
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Backup
```
Auto backup:
- Time: configurable (default 2:00 AM)
- Location: /backups/ in app data directory
- Contents: SQLite DB file + /reports/ PDF folder
- Format: AES-256 encrypted ZIP
- Password: set in LabSettings
- Retention: keep last 30 daily backups (auto-delete older)
- On failure: OS notification + dashboard warning

Manual backup:
- Button in /backup page
- Save to any location via Electron file dialog
- Progress indicator
- Success notification with file size

Restore:
- Select backup ZIP file
- Enter decryption password
- Preview backup date and size
- Confirmation dialog (irreversible)
- Replace DB → restart app

Cloud backup (optional):
- Configure S3 bucket or Dropbox
- Upload after each auto-backup when internet available
- Show last cloud sync time
```

### Security
```
- Passwords: bcrypt rounds 12
- Sessions: JWT in memory (never localStorage/disk)
- Role-based guards: every page + every IPC handler
- Auto lock: 15 min idle → PIN entry screen
- Quick PIN: 4-digit PIN for fast unlock (vs full password)
- Failed login: lock account after 5 attempts (10 min)
- All DB writes: logged to ActivityLog with userId + timestamp
- Audit log: searchable, filterable, non-deletable
- Report approval: irreversible (locked to creator+approver)
- Critical actions (delete, cancel, amend): require password re-entry
- Sensitive logs: no patient data in console.log (production build)
- DB file: stored in OS app data directory (not Documents)
- Electron: contextIsolation=true, nodeIntegration=false, sandbox=true
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ELECTRON PACKAGING (electron-builder)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```json
// electron-builder.json
{
  "appId": "com.yourlab.lis",
  "productName": "Lab Manager Pro",
  "directories": {
    "output": "dist"
  },
  "files": [
    "dist-electron",
    "out",
    "prisma",
    "node_modules/.prisma"
  ],
  "win": {
    "target": "nsis",
    "icon": "public/icon.ico",
    "requestedExecutionLevel": "asInvoker"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "installerIcon": "public/installer.ico",
    "license": "LICENSE.txt"
  },
  "mac": {
    "target": "dmg",
    "icon": "public/icon.icns",
    "category": "public.app-category.medical"
  },
  "linux": {
    "target": "AppImage",
    "category": "Science"
  },
  "publish": {
    "provider": "github",
    "owner": "yourusername",
    "repo": "lab-manager-pro"
  },
  "extraResources": [
    {
      "from": "prisma",
      "to": "prisma"
    }
  ]
}
```

**On first run:**
- Check if DB exists → if not, run `prisma migrate deploy` + `prisma db seed`
- Show onboarding wizard: Lab name, logo, admin password setup
- Generate unique lab ID for licensing

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## KEYBOARD SHORTCUTS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Ctrl+N       → New patient registration
Ctrl+B       → New bill
Ctrl+R       → New result entry
Ctrl+S       → Save current form
Ctrl+P       → Print current view/report
Ctrl+F       → Focus global search bar
Ctrl+L       → Lock session immediately
Ctrl+D       → Go to Dashboard
Ctrl+K       → Command palette (search all actions)
F1           → Show keyboard shortcuts help
F5           → Refresh current page data
Esc          → Close modal / cancel edit
Tab          → Next form field
Shift+Tab    → Previous form field
Enter        → Confirm/submit in modals
Alt+1..9     → Navigate sidebar items 1-9
Ctrl+Z       → Undo last form change
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PERFORMANCE TARGETS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Electron cold start:      < 4 seconds
Page navigation:          < 150ms
Result interpretation:    < 30ms (synchronous in-memory)
PDF generation (5 tests): < 3 seconds
PDF generation (20+ tests):< 8 seconds
Search (10,000 patients): < 200ms (SQLite FTS5 index)
Dashboard load:           Charts load independently with skeleton
Table render (1000 rows): < 100ms (TanStack virtual)
Barcode generation:       < 100ms
SMS queuing:              < 50ms (queued, not blocking)
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## QUALITY REQUIREMENTS (EVERY FEATURE)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Forms:
  ✓ Loading state (spinner on submit button)
  ✓ Success toast (green, auto-dismiss 4s)
  ✓ Error toast (red, with retry button)
  ✓ Zod validation (client-side instant feedback)
  ✓ Required field indicators (*)
  ✓ Disabled submit until valid

Tables:
  ✓ Empty state: illustration + helpful message + CTA button
  ✓ Loading state: skeleton rows (5 rows animated shimmer)
  ✓ Error state: retry button
  ✓ Pagination with page size selector (10/25/50/100)
  ✓ Bulk select + bulk actions (delete, approve, export)

Destructive actions:
  ✓ AlertDialog: "Are you sure?" with item name
  ✓ Password re-entry for: delete, cancel bill, amend report

IDs and codes:
  ✓ Copy-to-clipboard button on all IDs
  ✓ Monospace font for patient IDs, order numbers
  ✓ Auto-generate: sequential, year-prefixed, padded

Numbers (India):
  ✓ Currency: ₹ symbol, Indian locale (1,00,000 not 100,000)
  ✓ Dates: DD/MM/YYYY everywhere
  ✓ Mobile: 10-digit validation (starts with 6-9)
  ✓ GST: 15-char GSTIN format validation

TypeScript:
  ✓ Strict mode: no 'any' types
  ✓ All IPC channels in shared/ipc-channels.ts
  ✓ All shared types in shared/types.ts
  ✓ Zod schemas co-located with forms

Testing:
  ✓ Jest: result interpreter unit tests (100% coverage)
  ✓ Jest: billing calculation tests
  ✓ Jest: formula evaluation tests

Accessibility:
  ✓ Keyboard navigable (Tab order optimized for lab staff)
  ✓ Focus rings visible
  ✓ Screen reader labels on icon buttons
  ✓ High contrast status indicators (color + text + icon)
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## DEVELOPMENT PHASE ORDER
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
PHASE 1 — Foundation (Week 1-2)
  □ Electron + Next.js boilerplate + IPC bridge setup
  □ electron-builder config + packaging
  □ Prisma schema + SQLite setup
  □ All models migrated
  □ Seed data (admin user + test catalog)
  □ Auth system (login, roles, session, auto-lock)
  □ Sidebar layout + routing + dark mode

PHASE 2 — Core Workflow (Week 3-4)
  □ Lab Settings page (branding, logo, signature)
  □ Patient registration + auto ID
  □ Test selector (search + category + package)
  □ Billing: create, payment, thermal print, GST invoice
  □ Sample collection: barcode/QR print, accept/reject
  □ Result entry: form + real-time interpreter
  □ Critical value acknowledgment workflow

PHASE 3 — Reports (Week 5)
  □ PDF generation (all report types)
  □ Report preview in-app
  □ Approval + lock workflow
  □ Report amendment with history
  □ Print + WhatsApp delivery
  □ QR-based patient self-download

PHASE 4 — Management (Week 6)
  □ Dashboard with all KPI + charts + alerts
  □ Inventory: stock, transactions, expiry alerts
  □ Doctor management + commissions
  □ Corporate accounts + billing
  □ Home collection module
  □ Staff + attendance

PHASE 5 — Advanced (Week 7-8)
  □ Analytics module (all charts + export)
  □ Notification system (SMS/WhatsApp/Email)
  □ QC module + Levey-Jennings chart
  □ Outsource lab management
  □ Backup/restore with encryption
  □ Audit log viewer
  □ PC-PNDT compliance
  □ Expenditure tracking
  □ Day-end closure
  □ Keyboard shortcuts + command palette
  □ Analyzer integration (ASTM serial port)
  □ Jest unit tests (interpreter + billing)
```

---

*This is the complete, production-ready specification for a pathology LIS that matches and exceeds the features of PrimeDoc, Flabs, ATMSoftek, and CrelioHealth — built for offline-first Indian diagnostic centers.*
