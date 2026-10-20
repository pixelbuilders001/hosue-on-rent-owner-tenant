export type Language = 'en' | 'hi';
export type UserRole = 'owner' | 'tenant';

export interface OwnerProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string;
  upiId: string;
  role: 'owner';
  businessName: string;
  isKycVerified: boolean;
  city: string;
}

export interface TenantProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string;
  role: 'tenant';
  collegeOrWork: string;
  activePropertyId?: string;
  activeRoomNumber?: string;
  activeBedLabel?: string;
}

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  type: 'PG' | 'Hostel' | 'Room' | 'Flat';
  address: string;
  area: string;
  city: string;
  landmark: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  commuteMinutes?: number;
  stationDistanceKm?: number;
  busStandDistanceKm?: number;
  totalBeds: number;
  availableBeds: number;
  baseRent: number;
  deposit: number;
  brokerage: number;
  electricityType: 'included' | 'meter_unit' | 'fixed';
  electricityRate: number; // e.g. 9 for ₹9/unit
  wifiCost: number;
  maintenance: number;
  foodAvailable: boolean;
  foodIncluded: boolean;
  foodCost: number;
  rules: string[];
  amenities: string[];
  image: string;
  images?: string[];
  description?: string;
  ownerName?: string;
  isActive: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  roomType: 'Single' | '2 Sharing' | '3 Sharing' | '4 Sharing';
  totalBeds: number;
  baseRent: number;
  isActive?: boolean;
}

export interface Bed {
  id: string;
  roomId: string;
  propertyId: string;
  bedLabel: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  tenantId?: string;
  tenantName?: string;
}

export interface Tenant {
  id: string;
  propertyId: string;
  roomId: string;
  bedId?: string;
  roomNumber: string;
  bedLabel?: string;
  fullName: string;
  phone: string;
  emergencyPhone: string;
  email?: string;
  collegeOrWork: string;
  idProofType: 'Aadhaar' | 'College ID' | 'Voter ID' | 'Driving License';
  idProofNumber: string;
  checkInDate: string;
  monthlyRent: number;
  depositPaid: number;
  status: 'active' | 'notice' | 'vacated';
  policeVerificationStatus: 'pending' | 'submitted' | 'verified';
}

export interface Lead {
  id: string;
  propertyId: string;
  propertyName: string;
  renterName: string;
  renterPhone: string;
  budget: number;
  lookingFor: string;
  destination: string;
  status: 'new' | 'contacted' | 'visit_scheduled' | 'booked' | 'lost';
  visitDate?: string;
  visitTime?: string;
  notes?: string;
  createdAt: string;
}

export interface RentRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  month: string; // e.g. "October 2026"
  baseRent: number;
  prevReading?: number;
  currentReading?: number;
  electricityUnits?: number;
  electricityAmount?: number;
  wifiAmount: number;
  foodAmount: number;
  otherAmount: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'UPI' | 'Cash' | 'Bank Transfer';
  transactionRef?: string;
}

export interface Complaint {
  id: string;
  propertyId: string;
  propertyName: string;
  tenantName: string;
  roomNumber: string;
  category: 'Plumbing' | 'Electricity' | 'WiFi' | 'Cleaning' | 'Food' | 'Noise' | 'Other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
}
