import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Tenant, Property, OwnerProfile } from '../types';

export interface PoliceVerificationData {
  tenant: Tenant;
  property: Property;
  profile: OwnerProfile;
  thanaName?: string;
  fatherName?: string;
  permanentAddress?: string;
  referee1Name?: string;
  referee1Phone?: string;
  referee2Name?: string;
  referee2Phone?: string;
}

/**
 * Generates an official, standard Indian State Police Tenant Verification Form (किरायेदार सत्यापन प्रपत्र)
 */
export async function generatePoliceVerificationPdf(data: PoliceVerificationData): Promise<string> {
  const { 
    tenant, 
    property, 
    profile, 
    thanaName = 'Town Police Station (नगर थाना)', 
    fatherName = '', 
    permanentAddress = '',
    referee1Name = 'Local Guardian / Reference 1',
    referee1Phone = '',
    referee2Name = 'Local Guardian / Reference 2',
    referee2Phone = ''
  } = data;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Border & Margin styling
  page.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderColor: rgb(0.1, 0.2, 0.3),
    borderWidth: 1.5,
  });

  page.drawRectangle({
    x: 29,
    y: 29,
    width: width - 58,
    height: height - 58,
    borderColor: rgb(0.75, 0.8, 0.85),
    borderWidth: 0.5,
  });

  // Top Police Header Banner
  page.drawRectangle({
    x: 30,
    y: height - 105,
    width: width - 60,
    height: 72,
    color: rgb(0.12, 0.23, 0.38), // Police Navy Blue
  });

  page.drawText('TENANT VERIFICATION FORM / किरायेदार सत्यापन प्रपत्र', {
    x: 45,
    y: height - 58,
    size: 13,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('As per State Police Tenancy Rules · Information Proforma for Police Record', {
    x: 45,
    y: height - 74,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.85, 0.9, 0.98),
  });

  page.drawText(`Jurisdiction Thana / थाना: ${thanaName}`, {
    x: 45,
    y: height - 90,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 0.85, 0.4),
  });

  // Reference Code & Date
  const refCode = `PV-${(tenant.idProofNumber || tenant.id).slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
  page.drawText(`Form Ref: ${refCode}`, {
    x: width - 195,
    y: height - 58,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Date: ${new Date().toLocaleDateString('en-IN')}`, {
    x: width - 195,
    y: height - 72,
    size: 8,
    font: fontRegular,
    color: rgb(0.9, 0.95, 1),
  });

  // Photo Box (Top right inside body)
  page.drawRectangle({
    x: width - 125,
    y: height - 215,
    width: 85,
    height: 100,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 1,
    color: rgb(0.97, 0.97, 0.97),
  });
  page.drawText('AFFIX RECENT', {
    x: width - 118,
    y: height - 155,
    size: 7.5,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.5),
  });
  page.drawText('PASSPORT PHOTO', {
    x: width - 122,
    y: height - 168,
    size: 7.5,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.5),
  });
  page.drawText('(पासपोर्ट फोटो)', {
    x: width - 110,
    y: height - 180,
    size: 6.5,
    font: fontItalic,
    color: rgb(0.6, 0.6, 0.6),
  });

  let curY = height - 125;

  // Helper Section Header
  const drawSectionHeader = (title: string, hindiSubtitle: string) => {
    page.drawRectangle({
      x: 35,
      y: curY - 18,
      width: width - 70,
      height: 18,
      color: rgb(0.93, 0.95, 0.98),
    });
    page.drawText(`${title} · ${hindiSubtitle}`, {
      x: 42,
      y: curY - 14,
      size: 9,
      font: fontBold,
      color: rgb(0.12, 0.23, 0.38),
    });
    curY -= 26;
  };

  // Helper key-value field
  const drawField = (label: string, value: string, xPos: number, yPos: number, maxWidth: number = 220) => {
    page.drawText(`${label}: `, {
      x: xPos,
      y: yPos,
      size: 8,
      font: fontBold,
      color: rgb(0.3, 0.35, 0.4),
    });
    const labelWidth = fontBold.widthOfTextAtSize(`${label}: `, 8);
    const safeValue = value || 'N/A';
    page.drawText(safeValue.slice(0, Math.floor(maxWidth / 5)), {
      x: xPos + labelWidth,
      y: yPos,
      size: 8,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });
  };

  // 1. Landlord Details
  drawSectionHeader('1. PROPERTY & LANDLORD DETAILS', 'मकान मालिक एवं परिसर का विवरण');
  drawField('Owner Name (मालिक का नाम)', profile.fullName || property.ownerName || 'Property Owner', 45, curY);
  drawField('Contact Phone', profile.phone || 'N/A', 280, curY);
  curY -= 14;
  drawField('Property / House Name', property.name, 45, curY);
  drawField('Police Station (थाना)', thanaName, 280, curY);
  curY -= 14;
  drawField('Full Address', `${property.address || property.area}, ${property.city} - ${property.pincode || '848101'}`, 45, curY, 380);
  curY -= 22;

  // 2. Tenant Personal Details
  drawSectionHeader('2. TENANT PARTICULARS', 'किरायेदार का व्यक्तिगत विवरण');
  drawField('Full Name (किरायेदार का नाम)', tenant.fullName, 45, curY, 200);
  drawField("Father/Spouse Name (पिता/पति)", fatherName || '_______________________', 270, curY, 170);
  curY -= 14;
  drawField('Mobile Number', tenant.phone, 45, curY);
  drawField('Emergency/Guardian Phone', tenant.emergencyPhone || 'N/A', 270, curY);
  curY -= 14;
  drawField('Native / Permanent Address', permanentAddress || 'Vill/Town: ____________, Dist: ____________', 45, curY, 390);
  curY -= 14;
  drawField('Occupation / College', tenant.collegeOrWork || 'Student / Working', 45, curY);
  drawField('Tenant Category', tenant.tenantCategory ? tenant.tenantCategory.toUpperCase() : 'STUDENT / RESIDENT', 270, curY);
  curY -= 22;

  // 3. Identity Verification & Rental Terms
  drawSectionHeader('3. IDENTITY PROOF & TENANCY DETAILS', 'पहचान प्रमाण व किरायेदारी विवरण');
  drawField('ID Document Type', tenant.idProofType || 'Aadhaar Card', 45, curY);
  drawField('ID / Document Number', tenant.idProofNumber || 'Verified ID', 270, curY);
  curY -= 14;
  drawField('Allotted Room & Bed', `Room ${tenant.roomNumber || '101'} (Bed: ${tenant.bedLabel || 'A'})`, 45, curY);
  drawField('Check-in Date (प्रवेश तिथि)', tenant.checkInDate || new Date().toISOString().split('T')[0], 270, curY);
  curY -= 14;
  drawField('Agreed Monthly Rent', `Rs. ${tenant.monthlyRent.toLocaleString('en-IN')} / month`, 45, curY);
  drawField('Security Deposit Paid', `Rs. ${(tenant.depositPaid || 0).toLocaleString('en-IN')}`, 270, curY);
  curY -= 22;

  // 4. Two Local References
  drawSectionHeader('4. LOCAL REFERENCES / GUARANTORS', 'दो स्थानीय परिचितों का विवरण');
  drawField('1. Name & Address', referee1Name, 45, curY, 220);
  drawField('Phone Number', referee1Phone || tenant.emergencyPhone || '________________', 300, curY);
  curY -= 14;
  drawField('2. Name & Address', referee2Name, 45, curY, 220);
  drawField('Phone Number', referee2Phone || '________________', 300, curY);
  curY -= 22;

  // 5. Declaration
  drawSectionHeader('5. DECLARATION & ATTESTATION', 'सत्यनिष्ठा घोषणा');
  
  const declarationText = 
    'I hereby declare that all information given above is true and correct to the best of my knowledge and belief. ' +
    'I have never been convicted in any criminal court, nor is any criminal proceeding pending against me. ' +
    'If any detail is found false or misleading, I shall be solely liable for legal action under Indian law.';
  
  page.drawText(declarationText, {
    x: 45,
    y: curY - 2,
    size: 7.2,
    font: fontItalic,
    color: rgb(0.3, 0.35, 0.4),
    lineHeight: 10,
    maxWidth: width - 90,
  });
  curY -= 36;

  // Signatures Row
  page.drawRectangle({
    x: 35,
    y: 42,
    width: width - 70,
    height: 80,
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1,
    color: rgb(0.98, 0.99, 1),
  });

  // Tenant Signature Box
  page.drawLine({
    start: { x: 50, y: 80 },
    end: { x: 190, y: 80 },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });
  page.drawText('Signature of Tenant / किरायेदार', {
    x: 55,
    y: 65,
    size: 7.5,
    font: fontBold,
    color: rgb(0.2, 0.25, 0.3),
  });
  page.drawText(`Date: ${new Date().toLocaleDateString('en-IN')}`, {
    x: 55,
    y: 53,
    size: 6.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Owner Signature Box
  page.drawLine({
    start: { x: 230, y: 80 },
    end: { x: 370, y: 80 },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });
  page.drawText('Signature of Landlord / मकान मालिक', {
    x: 235,
    y: 65,
    size: 7.5,
    font: fontBold,
    color: rgb(0.2, 0.25, 0.3),
  });
  page.drawText(`Contact: ${profile.phone || property.ownerName || 'Verified'}`, {
    x: 235,
    y: 53,
    size: 6.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Police Station Seal Box
  page.drawRectangle({
    x: width - 170,
    y: 48,
    width: 120,
    height: 68,
    borderColor: rgb(0.7, 0.75, 0.8),
    borderWidth: 0.8,
    borderDashPhase: 2,
    borderDashArray: [3, 2],
  });
  page.drawText('POLICE STATION SEAL', {
    x: width - 162,
    y: 92,
    size: 6.8,
    font: fontBold,
    color: rgb(0.5, 0.55, 0.6),
  });
  page.drawText('(थाना मुहर एवं प्राप्ति हस्ताक्षर)', {
    x: width - 164,
    y: 80,
    size: 6.2,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.6),
  });
  page.drawText('Received on: ____________', {
    x: width - 164,
    y: 56,
    size: 6.2,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.6),
  });

  // Save to PDF Base64
  const pdfBytes = await pdfDoc.save();
  let binary = '';
  const len = pdfBytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(pdfBytes[i]);
  }
  return `data:application/pdf;base64,${btoa(binary)}`;
}
