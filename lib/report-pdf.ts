// lib/report-pdf.ts
// PDF Report Generator for Lab Reports using pdf-lib

import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';

export interface ReportData {
  orderNo: string;
  patientName: string;
  patientId: string;
  age: string;
  gender: string;
  date: string;
  referredBy: string;
  tests: TestReportData[];
  labName: string;
  labAddress: string;
  labMobile: string;
  approvedBy: string;
}

export interface TestReportData {
  testName: string;
  parameters: ParameterResult[];
}

export interface ParameterResult {
  name: string;
  value: string;
  unit: string;
  refRange: string;
  flag: string | null;
  isHeader?: boolean;
}

const COLORS = {
  primary: rgb(0.13, 0.39, 0.68),
  headerBg: rgb(0.93, 0.95, 0.98),
  text: rgb(0.1, 0.1, 0.1),
  gray: rgb(0.45, 0.45, 0.45),
  lightGray: rgb(0.85, 0.85, 0.85),
  red: rgb(0.8, 0.1, 0.1),
  green: rgb(0.1, 0.55, 0.1),
  orange: rgb(0.85, 0.5, 0.0),
  white: rgb(1, 1, 1),
};

function drawLine(page: PDFPage, x1: number, y: number, x2: number, color = COLORS.lightGray, thickness = 0.5) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color });
}

export async function generateReportPDF(data: ReportData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const PAGE_W = 595.28; // A4
  const PAGE_H = 841.89;
  const MARGIN = 45;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  // ── Header ──
  page.drawRectangle({ x: 0, y: PAGE_H - 90, width: PAGE_W, height: 90, color: COLORS.primary });
  page.drawText(data.labName.toUpperCase(), { x: MARGIN, y: PAGE_H - 40, size: 18, font: fontBold, color: COLORS.white });
  page.drawText(data.labAddress, { x: MARGIN, y: PAGE_H - 58, size: 8, font, color: rgb(0.8, 0.85, 0.95) });
  page.drawText(`Phone: ${data.labMobile}`, { x: MARGIN, y: PAGE_H - 70, size: 8, font, color: rgb(0.8, 0.85, 0.95) });
  page.drawText('PATHOLOGY REPORT', { x: PAGE_W - MARGIN - fontBold.widthOfTextAtSize('PATHOLOGY REPORT', 12), y: PAGE_H - 42, size: 12, font: fontBold, color: COLORS.white });

  y = PAGE_H - 105;

  // ── Patient Info Box ──
  page.drawRectangle({ x: MARGIN, y: y - 65, width: CONTENT_W, height: 65, color: COLORS.headerBg, borderColor: COLORS.lightGray, borderWidth: 0.5 });

  const col1 = MARGIN + 10;
  const col2 = MARGIN + CONTENT_W / 2 + 10;
  let infoY = y - 15;

  const drawInfoRow = (label: string, value: string, x: number, rowY: number) => {
    page.drawText(label, { x, y: rowY, size: 8, font, color: COLORS.gray });
    page.drawText(value, { x: x + 75, y: rowY, size: 9, font: fontBold, color: COLORS.text });
  };

  drawInfoRow('Patient Name:', data.patientName, col1, infoY);
  drawInfoRow('Order No:', data.orderNo, col2, infoY);
  infoY -= 16;
  drawInfoRow('Patient ID:', data.patientId, col1, infoY);
  drawInfoRow('Date:', data.date, col2, infoY);
  infoY -= 16;
  drawInfoRow('Age / Gender:', `${data.age} / ${data.gender}`, col1, infoY);
  drawInfoRow('Referred By:', data.referredBy, col2, infoY);

  y = y - 80;

  // ── Test Results ──
  for (const test of data.tests) {
    // Check if we need a new page
    if (y < 150) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }

    // Test name header
    page.drawRectangle({ x: MARGIN, y: y - 18, width: CONTENT_W, height: 20, color: COLORS.primary });
    page.drawText(test.testName, { x: MARGIN + 8, y: y - 13, size: 10, font: fontBold, color: COLORS.white });
    y -= 26;

    // Column headers
    const colX = [MARGIN + 8, MARGIN + 220, MARGIN + 310, MARGIN + 380];
    page.drawRectangle({ x: MARGIN, y: y - 16, width: CONTENT_W, height: 18, color: COLORS.headerBg });
    const headers = ['Parameter', 'Result', 'Unit', 'Reference Range'];
    headers.forEach((h, i) => {
      page.drawText(h, { x: colX[i], y: y - 12, size: 7.5, font: fontBold, color: COLORS.gray });
    });
    y -= 22;

    // Parameter rows
    for (const param of test.parameters) {
      if (y < 80) {
        page = doc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }

      if (param.isHeader) {
        page.drawRectangle({ x: MARGIN, y: y - 14, width: CONTENT_W, height: 16, color: rgb(0.96, 0.96, 0.96) });
        page.drawText(param.name, { x: colX[0], y: y - 10, size: 8, font: fontBold, color: COLORS.text });
        y -= 20;
        continue;
      }

      // Parameter name
      page.drawText(param.name, { x: colX[0], y: y - 10, size: 8, font, color: COLORS.text });

      // Result value with flag coloring
      const flagColor = param.flag === '!!' ? COLORS.red : (param.flag === '↑' || param.flag === 'H') ? COLORS.orange : (param.flag === '↓' || param.flag === 'L') ? COLORS.primary : COLORS.text;
      const resultFont = param.flag ? fontBold : font;
      const displayFlag = param.flag === '↑' ? 'H' : param.flag === '↓' ? 'L' : param.flag || '';
      const resultText = displayFlag ? `${param.value} ${displayFlag}` : param.value;
      page.drawText(resultText, { x: colX[1], y: y - 10, size: 8.5, font: resultFont, color: flagColor });

      // Unit
      page.drawText(param.unit || '', { x: colX[2], y: y - 10, size: 8, font, color: COLORS.gray });

      // Ref range
      page.drawText(param.refRange || '', { x: colX[3], y: y - 10, size: 8, font, color: COLORS.gray });

      drawLine(page, MARGIN + 5, y - 16, MARGIN + CONTENT_W - 5);
      y -= 20;
    }

    y -= 10;
  }

  // ── Footer ──
  if (y < 120) {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  }

  y -= 15;
  drawLine(page, MARGIN, y, MARGIN + CONTENT_W, COLORS.primary, 1);
  y -= 20;

  page.drawText('Approved By:', { x: PAGE_W - MARGIN - 180, y, size: 8, font, color: COLORS.gray });
  y -= 14;
  page.drawText(data.approvedBy, { x: PAGE_W - MARGIN - 180, y, size: 10, font: fontBold, color: COLORS.text });
  y -= 12;
  page.drawText('Pathologist', { x: PAGE_W - MARGIN - 180, y, size: 8, font: fontItalic, color: COLORS.gray });

  y -= 25;
  drawLine(page, MARGIN, y, MARGIN + CONTENT_W);
  y -= 12;
  page.drawText('This is a computer-generated report. Results should be correlated clinically.', { x: MARGIN, y, size: 7, font: fontItalic, color: COLORS.gray });
  y -= 10;
  page.drawText(`Generated on: ${new Date().toLocaleString('en-IN')}`, { x: MARGIN, y, size: 7, font, color: COLORS.gray });

  return await doc.save();
}

// Build mock report data for demo
export function getMockReportData(report: any): ReportData {
  const testMap: Record<string, TestReportData> = {
    'CBC': {
      testName: 'Complete Blood Count (CBC)',
      parameters: [
        { name: 'COMPLETE BLOOD COUNT', value: '', unit: '', refRange: '', flag: null, isHeader: true },
        { name: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', refRange: '13.0 - 17.0', flag: null },
        { name: 'Total RBC Count', value: '5.1', unit: 'mill/cumm', refRange: '4.5 - 5.5', flag: null },
        { name: 'PCV / Hematocrit', value: '42', unit: '%', refRange: '40 - 50', flag: null },
        { name: 'MCV', value: '82.4', unit: 'fL', refRange: '83 - 101', flag: '↓' },
        { name: 'MCH', value: '27.8', unit: 'pg', refRange: '27 - 32', flag: null },
        { name: 'MCHC', value: '33.8', unit: 'g/dL', refRange: '31.5 - 34.5', flag: null },
        { name: 'Total WBC Count', value: '7800', unit: '/cumm', refRange: '4000 - 10000', flag: null },
        { name: 'DIFFERENTIAL COUNT', value: '', unit: '', refRange: '', flag: null, isHeader: true },
        { name: 'Neutrophils', value: '62', unit: '%', refRange: '40 - 70', flag: null },
        { name: 'Lymphocytes', value: '30', unit: '%', refRange: '20 - 40', flag: null },
        { name: 'Monocytes', value: '5', unit: '%', refRange: '2 - 8', flag: null },
        { name: 'Eosinophils', value: '2', unit: '%', refRange: '1 - 4', flag: null },
        { name: 'Basophils', value: '1', unit: '%', refRange: '0 - 1', flag: null },
        { name: 'Platelet Count', value: '2.8', unit: 'lakhs/cumm', refRange: '1.5 - 4.0', flag: null },
        { name: 'ESR', value: '12', unit: 'mm/hr', refRange: '0 - 15', flag: null },
      ],
    },
    'LFT': {
      testName: 'Liver Function Test (LFT)',
      parameters: [
        { name: 'Total Bilirubin', value: '0.9', unit: 'mg/dL', refRange: '0.1 - 1.2', flag: null },
        { name: 'Direct Bilirubin', value: '0.2', unit: 'mg/dL', refRange: '0.0 - 0.3', flag: null },
        { name: 'Indirect Bilirubin', value: '0.7', unit: 'mg/dL', refRange: '0.1 - 1.0', flag: null },
        { name: 'SGOT (AST)', value: '68', unit: 'U/L', refRange: '5 - 40', flag: '↑' },
        { name: 'SGPT (ALT)', value: '72', unit: 'U/L', refRange: '7 - 56', flag: '↑' },
        { name: 'Alkaline Phosphatase', value: '85', unit: 'U/L', refRange: '44 - 147', flag: null },
        { name: 'Total Protein', value: '7.2', unit: 'g/dL', refRange: '6.0 - 8.3', flag: null },
        { name: 'Albumin', value: '4.1', unit: 'g/dL', refRange: '3.5 - 5.5', flag: null },
        { name: 'Globulin', value: '3.1', unit: 'g/dL', refRange: '2.0 - 3.5', flag: null },
        { name: 'A/G Ratio', value: '1.3', unit: '', refRange: '1.1 - 2.5', flag: null },
      ],
    },
    'Thyroid Profile': {
      testName: 'Thyroid Function Test',
      parameters: [
        { name: 'T3 (Triiodothyronine)', value: '1.2', unit: 'ng/mL', refRange: '0.8 - 2.0', flag: null },
        { name: 'T4 (Thyroxine)', value: '8.5', unit: 'µg/dL', refRange: '5.1 - 14.1', flag: null },
        { name: 'TSH', value: '6.8', unit: 'µIU/mL', refRange: '0.27 - 4.2', flag: '↑' },
      ],
    },
    'RFT': {
      testName: 'Renal Function Test (RFT)',
      parameters: [
        { name: 'Blood Urea', value: '32', unit: 'mg/dL', refRange: '15 - 40', flag: null },
        { name: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', refRange: '0.7 - 1.3', flag: null },
        { name: 'Uric Acid', value: '5.8', unit: 'mg/dL', refRange: '3.4 - 7.0', flag: null },
        { name: 'BUN', value: '14.9', unit: 'mg/dL', refRange: '6 - 20', flag: null },
        { name: 'Sodium (Na+)', value: '140', unit: 'mEq/L', refRange: '136 - 145', flag: null },
        { name: 'Potassium (K+)', value: '4.2', unit: 'mEq/L', refRange: '3.5 - 5.1', flag: null },
        { name: 'Chloride (Cl-)', value: '102', unit: 'mEq/L', refRange: '98 - 106', flag: null },
      ],
    },
    'Lipid Profile': {
      testName: 'Lipid Profile',
      parameters: [
        { name: 'Total Cholesterol', value: '245', unit: 'mg/dL', refRange: '< 200', flag: '↑' },
        { name: 'Triglycerides', value: '180', unit: 'mg/dL', refRange: '< 150', flag: '↑' },
        { name: 'HDL Cholesterol', value: '42', unit: 'mg/dL', refRange: '> 40', flag: null },
        { name: 'LDL Cholesterol', value: '167', unit: 'mg/dL', refRange: '< 100', flag: '↑' },
        { name: 'VLDL Cholesterol', value: '36', unit: 'mg/dL', refRange: '< 30', flag: '↑' },
        { name: 'Total/HDL Ratio', value: '5.8', unit: '', refRange: '< 5.0', flag: '↑' },
      ],
    },
    'Blood Sugar': {
      testName: 'Blood Sugar',
      parameters: [
        { name: 'Blood Sugar (Fasting)', value: '128', unit: 'mg/dL', refRange: '70 - 100', flag: '↑' },
        { name: 'Blood Sugar (PP)', value: '185', unit: 'mg/dL', refRange: '< 140', flag: '↑' },
      ],
    },
    'HbA1c': {
      testName: 'HbA1c (Glycated Hemoglobin)',
      parameters: [
        { name: 'HbA1c', value: '7.2', unit: '%', refRange: '< 5.7 (Normal)', flag: '↑' },
        { name: 'Estimated Avg Glucose', value: '160', unit: 'mg/dL', refRange: '< 117', flag: '↑' },
      ],
    },
  };

  const patientAges: Record<string, string> = {
    'LAB-2024-00001': '45 Years',
    'LAB-2024-00002': '32 Years',
    'LAB-2024-00003': '28 Years',
    'LAB-2024-00004': '55 Years',
    'LAB-2024-00005': '60 Years',
  };

  const patientGenders: Record<string, string> = {
    'LAB-2024-00001': 'Male',
    'LAB-2024-00002': 'Female',
    'LAB-2024-00003': 'Male',
    'LAB-2024-00004': 'Female',
    'LAB-2024-00005': 'Male',
  };

  const testNames = report.tests.split(',').map((t: string) => t.trim());
  const tests: TestReportData[] = testNames.map((name: string) => testMap[name] || {
    testName: name,
    parameters: [{ name: 'Result', value: 'Normal', unit: '', refRange: '', flag: null }],
  });

  return {
    orderNo: report.orderNo,
    patientName: report.patientName,
    patientId: report.patientId,
    age: patientAges[report.patientId] || '35 Years',
    gender: patientGenders[report.patientId] || 'Male',
    date: report.date,
    referredBy: report.approvedBy || 'Self',
    tests,
    labName: 'Offline Lab LIS',
    labAddress: '123 Main Street, City, State - 400001',
    labMobile: '9876543210',
    approvedBy: report.approvedBy || 'Dr. Admin',
  };
}
