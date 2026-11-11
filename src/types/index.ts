export type Language = 'en' | 'hi';
export type UserRole = 'owner';

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

export type PropertyCategory = 'entire_house' | 'private_room' | 'shared_pg';
export type BhkType = '1 RK' | '1 BHK' | '2 BHK' | '3 BHK' | '4+ BHK' | 'Independent House';
export type FurnishingStatus = 'unfurnished' | 'semi_furnished' | 'fully_furnished' | 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
export type PreferredTenant = 'family_only' | 'bachelors_allowed' | 'any' | 'girls_only' | 'boys_only' | 'Family' | 'Bachelors' | 'Family or Bachelors' | 'Female Only' | 'Any';
export type ParkingType = 'none' | 'bike_only' | 'car_only' | 'car_and_bike' | 'None' | 'Bike Only' | 'Car Only' | 'Bike & Car';
export type KitchenType = 'private_modular' | 'shared_with_owner' | 'no_cooking' | 'private_kitchenette' | 'none';
export type FoodPreference = 'veg_only' | 'no_restriction' | 'Vegetarian Only' | 'No Preference' | 'Veg Only' | 'Non-Veg Allowed';

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  type: 'PG' | 'Hostel' | 'Room' | 'Flat';
  category?: PropertyCategory;
  bhkType?: BhkType;
  furnishingStatus?: FurnishingStatus;
  preferredTenant?: PreferredTenant;
  builtupSqft?: number;
  bathroomsCount?: number;
  balconiesCount?: number;
  floorNumber?: number;
  totalFloors?: number;
  parkingType?: ParkingType;
  ownerResidesHere?: boolean;
  kitchenType?: KitchenType;
  privateEntrance?: boolean;
  foodPreference?: FoodPreference;
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
  attachedWashroom?: boolean;
  hasBalcony?: boolean;
  isPrivateRoom?: boolean;
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
  roomId?: string;
  bedId?: string;
  roomNumber?: string;
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
  tenantCategory?: 'family' | 'bachelor_individual' | 'student';
  familyMembersCount?: number;
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
