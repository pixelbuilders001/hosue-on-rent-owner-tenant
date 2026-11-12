import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { RentAgreement } from '../types';

/**
 * Converts a Data URI (e.g. data:application/pdf;base64,... or data:image/png;base64,...) to Uint8Array
 */
export function dataUriToUint8Array(dataUri: string): Uint8Array {
  const base64 = dataUri.split(',')[1] || dataUri;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts Uint8Array to Data URI
 */
export function uint8ArrayToDataUri(bytes: Uint8Array, mimeType: string = 'application/pdf'): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Generates an official standard 11-Month Residential Tenancy Agreement as a clean PDF
 */
export async function generateStandardAgreementPdf(agreement: RentAgreement): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  
  // Standard A4: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Outer decorative border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.08, 0.42, 0.35), // Emerald 800
    borderWidth: 1.5,
  });

  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: rgb(0.85, 0.88, 0.9),
    borderWidth: 0.5,
  });

  // Top Header Banner
  page.drawRectangle({
    x: 35,
    y: height - 100,
    width: width - 70,
    height: 64,
    color: rgb(0.06, 0.35, 0.28), // Deep Emerald
  });

  page.drawText('RESIDENTIAL TENANCY LEASE AGREEMENT', {
    x: 55,
    y: height - 62,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('RoomSaathi Legal OS · 11-Month Standard Tenancy Contract', {
    x: 55,
    y: height - 80,
    size: 9,
    font: fontRegular,
    color: rgb(0.8, 0.95, 0.9),
  });

  page.drawText(`Agreement ID: ${agreement.id.slice(0, 10).toUpperCase()}`, {
    x: width - 215,
    y: height - 62,
    size: 8,
    font: fontBold,
    color: rgb(0.9, 1, 0.9),
  });

  page.drawText(`Date: ${new Date(agreement.createdAt || Date.now()).toLocaleDateString('en-IN')}`, {
    x: width - 215,
    y: height - 76,
    size: 8,
    font: fontRegular,
    color: rgb(0.85, 0.95, 0.9),
  });

  let currentY = height - 125;
  const leftMargin = 50;
  const contentWidth = width - 100;

  // Introduction text
  page.drawText('THIS RESIDENTIAL LEASE AGREEMENT is made and entered into on this day between:', {
    x: leftMargin,
    y: currentY,
    size: 9.5,
    font: fontItalic,
    color: rgb(0.2, 0.25, 0.3),
  });

  currentY -= 25;

  // Party 1: Landlord Box
  page.drawRectangle({
    x: leftMargin,
    y: currentY - 55,
    width: contentWidth,
    height: 55,
    color: rgb(0.96, 0.98, 0.97),
    borderColor: rgb(0.8, 0.9, 0.85),
    borderWidth: 0.8,
  });

  page.drawText('1. FIRST PARTY (LANDLORD / OWNER / LICENSOR):', {
    x: leftMargin + 10,
    y: currentY - 14,
    size: 9,
    font: fontBold,
    color: rgb(0.08, 0.42, 0.35),
  });

  page.drawText(`Name: ${agreement.ownerName || 'Property Landlord'}`, {
    x: leftMargin + 10,
    y: currentY - 28,
    size: 9,
    font: fontRegular,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`Mobile: ${agreement.ownerPhone || 'N/A'}`, {
    x: leftMargin + 260,
    y: currentY - 28,
    size: 9,
    font: fontRegular,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`Property: ${agreement.propertyName}`, {
    x: leftMargin + 10,
    y: currentY - 44,
    size: 9,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  currentY -= 75;

  // Party 2: Tenant Box
  page.drawRectangle({
    x: leftMargin,
    y: currentY - 55,
    width: contentWidth,
    height: 55,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.8, 0.85, 0.95),
    borderWidth: 0.8,
  });

  page.drawText('2. SECOND PARTY (TENANT / RESIDENT / LICENSEE):', {
    x: leftMargin + 10,
    y: currentY - 14,
    size: 9,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.55),
  });

  page.drawText(`Name: ${agreement.tenantName}`, {
    x: leftMargin + 10,
    y: currentY - 28,
    size: 9,
    font: fontRegular,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`Mobile / WhatsApp: ${agreement.tenantPhone}`, {
    x: leftMargin + 260,
    y: currentY - 28,
    size: 9,
    font: fontRegular,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`Room / Unit: Room ${agreement.roomNumber}`, {
    x: leftMargin + 10,
    y: currentY - 44,
    size: 9,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Aadhaar / ID Verification: ${agreement.tenantAadhaar || 'Verified on Check-in'}`, {
    x: leftMargin + 260,
    y: currentY - 44,
    size: 9,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  currentY -= 80;

  // Key Terms Grid
  page.drawRectangle({
    x: leftMargin,
    y: currentY - 48,
    width: contentWidth,
    height: 48,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.8,
  });

  page.drawText('MONTHLY RENT', { x: leftMargin + 15, y: currentY - 16, size: 7.5, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`INR ${Number(agreement.monthlyRent).toLocaleString('en-IN')}/month`, { x: leftMargin + 15, y: currentY - 34, size: 11, font: fontBold, color: rgb(0.08, 0.42, 0.35) });

  page.drawText('SECURITY DEPOSIT', { x: leftMargin + 140, y: currentY - 16, size: 7.5, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`INR ${Number(agreement.depositAmount).toLocaleString('en-IN')}`, { x: leftMargin + 140, y: currentY - 34, size: 11, font: fontBold, color: rgb(0.15, 0.25, 0.55) });

  page.drawText('TENANCY START DATE', { x: leftMargin + 270, y: currentY - 16, size: 7.5, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`${agreement.startDate || new Date().toISOString().split('T')[0]}`, { x: leftMargin + 270, y: currentY - 34, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });

  page.drawText('DURATION', { x: leftMargin + 395, y: currentY - 16, size: 7.5, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`${agreement.durationMonths || 11} Months (Renewable)`, { x: leftMargin + 395, y: currentY - 34, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });

  currentY -= 70;

  // Terms & Conditions list
  page.drawText('TERMS & CONDITIONS (नियम एवं शर्तें):', {
    x: leftMargin,
    y: currentY,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentY -= 15;

  const clauses = [
    '1. RENT PAYMENT: The Tenant agrees to pay the monthly rent on or before the 5th day of every calendar month through UPI/Online.',
    '2. ELECTRICITY & UTILITIES: Sub-meter units consumed by the room shall be calculated monthly at the agreed unit rate and paid along with rent.',
    '3. SECURITY DEPOSIT: The security deposit is non-interest bearing and refundable upon vacating after deducting unpaid rent and damage charges.',
    '4. NOTICE PERIOD: Either party may terminate this agreement by giving thirty (30) days prior written notice on WhatsApp/in person.',
    '5. ROOM CONDITION AUDIT: Check-in room and bed photos recorded on RoomSaathi shall be compared upon vacating to verify deposit refund.',
    '6. PROHIBITED ACTIVITIES: Subletting, illegal activities, and causing disturbance to fellow residents are strictly prohibited.',
    '7. PEACEFUL POSSESSION: The Landlord ensures peaceful possession of the premises to the Tenant during the subsistence of this lease.'
  ];

  for (const clause of clauses) {
    page.drawText(clause, {
      x: leftMargin,
      y: currentY,
      size: 8,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.25),
      lineHeight: 11,
      maxWidth: contentWidth,
    });
    currentY -= 19;
  }

  currentY -= 15;

  // Signatures Section Frame
  const sigBoxY = currentY - 110;
  page.drawRectangle({
    x: leftMargin,
    y: sigBoxY,
    width: contentWidth,
    height: 110,
    color: rgb(0.99, 0.99, 0.99),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.8,
  });

  page.drawText('DIGITAL EXECUTION & SIGNATURES (डिजिटल हस्ताक्षर):', {
    x: leftMargin + 10,
    y: sigBoxY + 95,
    size: 8.5,
    font: fontBold,
    color: rgb(0.08, 0.42, 0.35),
  });

  // Owner Signature Column
  page.drawText('FIRST PARTY / LANDLORD', {
    x: leftMargin + 20,
    y: sigBoxY + 80,
    size: 8,
    font: fontBold,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawLine({
    start: { x: leftMargin + 20, y: sigBoxY + 30 },
    end: { x: leftMargin + 210, y: sigBoxY + 30 },
    color: rgb(0.6, 0.6, 0.6),
    thickness: 0.8,
  });

  page.drawText(`${agreement.ownerName || 'Property Landlord'}`, {
    x: leftMargin + 20,
    y: sigBoxY + 16,
    size: 8,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Tenant Signature Column
  page.drawText('SECOND PARTY / TENANT', {
    x: leftMargin + 260,
    y: sigBoxY + 80,
    size: 8,
    font: fontBold,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawLine({
    start: { x: leftMargin + 260, y: sigBoxY + 30 },
    end: { x: leftMargin + 450, y: sigBoxY + 30 },
    color: rgb(0.6, 0.6, 0.6),
    thickness: 0.8,
  });

  page.drawText(`${agreement.tenantName}`, {
    x: leftMargin + 260,
    y: sigBoxY + 16,
    size: 8,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Footer audit text
  page.drawText(`Digitally tracked & generated via RoomSaathi Legal OS · Token: ${agreement.signingToken}`, {
    x: leftMargin,
    y: 42,
    size: 7,
    font: fontItalic,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return uint8ArrayToDataUri(pdfBytes);
}

/**
 * Embeds owner and tenant signatures onto the last page of any PDF agreement
 */
export async function embedSignaturesIntoPdf(
  pdfData: string | Uint8Array,
  ownerSignatureDataUri?: string,
  tenantSignatureDataUri?: string,
  agreement?: RentAgreement
): Promise<string> {
  let pdfBytes: Uint8Array;
  if (typeof pdfData === 'string') {
    pdfBytes = dataUriToUint8Array(pdfData);
  } else {
    pdfBytes = pdfData;
  }

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width } = lastPage.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const leftMargin = 50;

  // Embed Owner Signature
  if (ownerSignatureDataUri) {
    try {
      const ownerPngBytes = dataUriToUint8Array(ownerSignatureDataUri);
      const ownerPngImage = await pdfDoc.embedPng(ownerPngBytes);
      
      // Draw signature on landlord box (x: 70, y: 115)
      lastPage.drawImage(ownerPngImage, {
        x: leftMargin + 25,
        y: 115,
        width: 140,
        height: 45,
      });

      lastPage.drawText(`Digitally Signed by Owner: ${new Date(agreement?.ownerSignedAt || Date.now()).toLocaleString('en-IN')}`, {
        x: leftMargin + 20,
        y: 98,
        size: 6.5,
        font: fontRegular,
        color: rgb(0.1, 0.5, 0.2),
      });
    } catch (e) {
      console.error('Failed to embed owner signature', e);
    }
  }

  // Embed Tenant Signature
  if (tenantSignatureDataUri) {
    try {
      const tenantPngBytes = dataUriToUint8Array(tenantSignatureDataUri);
      const tenantPngImage = await pdfDoc.embedPng(tenantPngBytes);
      
      // Draw signature on tenant box (x: 310, y: 115)
      lastPage.drawImage(tenantPngImage, {
        x: leftMargin + 265,
        y: 115,
        width: 140,
        height: 45,
      });

      lastPage.drawText(`Digitally Signed by Tenant: ${new Date(agreement?.tenantSignedAt || Date.now()).toLocaleString('en-IN')}`, {
        x: leftMargin + 260,
        y: 98,
        size: 6.5,
        font: fontRegular,
        color: rgb(0.1, 0.4, 0.7),
      });

      // Digital verification stamp badge
      lastPage.drawRectangle({
        x: width - 165,
        y: 40,
        width: 115,
        height: 22,
        color: rgb(0.9, 0.98, 0.92),
        borderColor: rgb(0.2, 0.65, 0.3),
        borderWidth: 0.8,
      });

      lastPage.drawText('VERIFIED DIGITAL CONTRACT', {
        x: width - 160,
        y: 48,
        size: 6.5,
        font: fontBold,
        color: rgb(0.1, 0.5, 0.2),
      });
    } catch (e) {
      console.error('Failed to embed tenant signature', e);
    }
  }

  const outputBytes = await pdfDoc.save();
  return uint8ArrayToDataUri(outputBytes);
}
