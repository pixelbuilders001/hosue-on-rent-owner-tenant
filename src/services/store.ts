import { OwnerProfile, TenantProfile, Property, Room, Bed, Tenant, Lead, RentRecord, Complaint, UserRole } from '../types';

const STORAGE_KEY = 'roomsaathi_app_v2';

export interface AppState {
  currentRole: UserRole;
  profile: OwnerProfile;
  tenantProfile: TenantProfile;
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  tenants: Tenant[];
  leads: Lead[];
  rentRecords: RentRecord[];
  complaints: Complaint[];
  activePropertyId: string;
  savedPropertyIds: string[];
}

const DEFAULT_TENANT_PROFILE: TenantProfile = {
  id: 't-1',
  fullName: 'Amit Verma',
  phone: '+91 97091 12345',
  email: 'amit.verma@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  role: 'tenant',
  collegeOrWork: 'ABC College (B.Sc 2nd Year)',
  activePropertyId: 'prop-shanti-01',
  activeRoomNumber: '101',
  activeBedLabel: 'Bed A'
};

const DEFAULT_PROFILE: OwnerProfile = {
  id: 'owner-rajesh-01',
  fullName: 'Rajesh Kumar Singh',
  phone: '+91 98350 44219',
  email: 'rajesh.singh@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  upiId: 'rajesh.singh@okaxis',
  role: 'owner',
  businessName: 'Shanti Niwas Stays & PG',
  isKycVerified: true,
  city: 'Samastipur, Bihar'
};

const DEFAULT_PROPERTIES: Property[] = [
  {
    id: 'prop-shanti-01',
    ownerId: 'owner-rajesh-01',
    name: 'Shanti Niwas Boys PG & Hostel',
    type: 'PG',
    address: 'Near ABC College, Station Road',
    area: 'Station Road',
    city: 'Samastipur',
    landmark: 'Behind SBI Main Branch, 200m from ABC College',
    totalBeds: 16,
    availableBeds: 4,
    baseRent: 4200,
    deposit: 4000,
    brokerage: 0,
    electricityType: 'meter_unit',
    electricityRate: 9, // ₹9/unit
    wifiCost: 150,
    maintenance: 100,
    foodAvailable: true,
    foodIncluded: false,
    foodCost: 2200,
    rules: ['Gate closes at 10:30 PM', 'No smoking/alcohol in premises', 'Guest visits in lobby only'],
    amenities: ['High Speed WiFi', 'RO Drinking Water', 'Inverter Power Backup', 'Daily Cleaning', 'CCTV Security'],
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-08-10'
  },
  {
    id: 'prop-maa-tara-02',
    ownerId: 'owner-rajesh-01',
    name: 'Maa Tara Girls PG & Residency',
    type: 'PG',
    address: 'Magadh Colony, Near Women College Road',
    area: 'Magadh Colony',
    city: 'Samastipur',
    landmark: 'Opposite Saraswati Vidya Mandir',
    totalBeds: 12,
    availableBeds: 2,
    baseRent: 4800,
    deposit: 4500,
    brokerage: 0,
    electricityType: 'included',
    electricityRate: 0,
    wifiCost: 0,
    maintenance: 0,
    foodAvailable: true,
    foodIncluded: true,
    foodCost: 2500,
    rules: ['Strict 9:00 PM curfew', 'Female visitors only', 'Quiet hours after 10 PM'],
    amenities: ['WiFi', 'Purified RO Water', 'Attached Washroom', '24x7 Female Warden', 'CCTV Surveillance'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-09-01'
  }
];

const DEFAULT_ROOMS: Room[] = [
  { id: 'room-101', propertyId: 'prop-shanti-01', roomNumber: '101', floor: 1, roomType: '2 Sharing', totalBeds: 2, baseRent: 4500 },
  { id: 'room-102', propertyId: 'prop-shanti-01', roomNumber: '102', floor: 1, roomType: '3 Sharing', totalBeds: 3, baseRent: 4000 },
  { id: 'room-103', propertyId: 'prop-shanti-01', roomNumber: '103', floor: 1, roomType: 'Single', totalBeds: 1, baseRent: 6500 },
  { id: 'room-201', propertyId: 'prop-shanti-01', roomNumber: '201', floor: 2, roomType: '2 Sharing', totalBeds: 2, baseRent: 4500 },
  { id: 'room-202', propertyId: 'prop-shanti-01', roomNumber: '202', floor: 2, roomType: '4 Sharing', totalBeds: 4, baseRent: 3500 },
  { id: 'room-203', propertyId: 'prop-shanti-01', roomNumber: '203', floor: 2, roomType: '4 Sharing', totalBeds: 4, baseRent: 3500 },
  
  // Maa Tara Rooms
  { id: 'room-mt-101', propertyId: 'prop-maa-tara-02', roomNumber: 'G-01', floor: 0, roomType: '2 Sharing', totalBeds: 2, baseRent: 5000 },
  { id: 'room-mt-102', propertyId: 'prop-maa-tara-02', roomNumber: 'G-02', floor: 0, roomType: '2 Sharing', totalBeds: 2, baseRent: 5000 },
  { id: 'room-mt-201', propertyId: 'prop-maa-tara-02', roomNumber: 'F-01', floor: 1, roomType: '2 Sharing', totalBeds: 2, baseRent: 4800 }
];

const DEFAULT_BEDS: Bed[] = [
  { id: 'bed-101-a', roomId: 'room-101', propertyId: 'prop-shanti-01', bedLabel: 'Bed A', status: 'occupied', tenantId: 't-1', tenantName: 'Amit Verma' },
  { id: 'bed-101-b', roomId: 'room-101', propertyId: 'prop-shanti-01', bedLabel: 'Bed B', status: 'available' },
  { id: 'bed-102-a', roomId: 'room-102', propertyId: 'prop-shanti-01', bedLabel: 'Bed A', status: 'occupied', tenantId: 't-2', tenantName: 'Rohan Jha' },
  { id: 'bed-102-b', roomId: 'room-102', propertyId: 'prop-shanti-01', bedLabel: 'Bed B', status: 'occupied', tenantId: 't-3', tenantName: 'Vikram Thakur' },
  { id: 'bed-102-c', roomId: 'room-102', propertyId: 'prop-shanti-01', bedLabel: 'Bed C', status: 'available' },
  { id: 'bed-103-a', roomId: 'room-103', propertyId: 'prop-shanti-01', bedLabel: 'Single Bed', status: 'occupied', tenantId: 't-4', tenantName: 'Praveen Sharma' },
  { id: 'bed-201-a', roomId: 'room-201', propertyId: 'prop-shanti-01', bedLabel: 'Bed A', status: 'reserved' },
  { id: 'bed-201-b', roomId: 'room-201', propertyId: 'prop-shanti-01', bedLabel: 'Bed B', status: 'available' },
  { id: 'bed-202-a', roomId: 'room-202', propertyId: 'prop-shanti-01', bedLabel: 'Bed A', status: 'occupied', tenantId: 't-5', tenantName: 'Deepak Roy' },
  { id: 'bed-202-b', roomId: 'room-202', propertyId: 'prop-shanti-01', bedLabel: 'Bed B', status: 'occupied', tenantId: 't-6', tenantName: 'Suman Kumar' },
  { id: 'bed-202-c', roomId: 'room-202', propertyId: 'prop-shanti-01', bedLabel: 'Bed C', status: 'available' },
  { id: 'bed-202-d', roomId: 'room-202', propertyId: 'prop-shanti-01', bedLabel: 'Bed D', status: 'maintenance' },

  // Maa Tara Beds
  { id: 'bed-mt-101-a', roomId: 'room-mt-101', propertyId: 'prop-maa-tara-02', bedLabel: 'Bed A', status: 'occupied', tenantId: 't-7', tenantName: 'Pooja Kumari' },
  { id: 'bed-mt-101-b', roomId: 'room-mt-101', propertyId: 'prop-maa-tara-02', bedLabel: 'Bed B', status: 'occupied', tenantId: 't-8', tenantName: 'Anjali Mishra' },
  { id: 'bed-mt-102-a', roomId: 'room-mt-102', propertyId: 'prop-maa-tara-02', bedLabel: 'Bed A', status: 'available' },
  { id: 'bed-mt-102-b', roomId: 'room-mt-102', propertyId: 'prop-maa-tara-02', bedLabel: 'Bed B', status: 'occupied', tenantId: 't-9', tenantName: 'Kavita Rani' }
];

const DEFAULT_TENANTS: Tenant[] = [
  {
    id: 't-1',
    propertyId: 'prop-shanti-01',
    roomId: 'room-101',
    bedId: 'bed-101-a',
    roomNumber: '101',
    bedLabel: 'Bed A',
    fullName: 'Amit Verma',
    phone: '+91 97091 12345',
    emergencyPhone: '+91 94312 98765',
    collegeOrWork: 'ABC College (B.Sc 2nd Year)',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-4912',
    checkInDate: '2026-07-01',
    monthlyRent: 4500,
    depositPaid: 4500,
    status: 'active',
    policeVerificationStatus: 'verified'
  },
  {
    id: 't-2',
    propertyId: 'prop-shanti-01',
    roomId: 'room-102',
    bedId: 'bed-102-a',
    roomNumber: '102',
    bedLabel: 'Bed A',
    fullName: 'Rohan Jha',
    phone: '+91 91234 56789',
    emergencyPhone: '+91 98765 43210',
    collegeOrWork: 'Samastipur College (BA)',
    idProofType: 'College ID',
    idProofNumber: 'SC-2024-88',
    checkInDate: '2026-08-15',
    monthlyRent: 4000,
    depositPaid: 4000,
    status: 'active',
    policeVerificationStatus: 'submitted'
  },
  {
    id: 't-3',
    propertyId: 'prop-shanti-01',
    roomId: 'room-102',
    bedId: 'bed-102-b',
    roomNumber: '102',
    bedLabel: 'Bed B',
    fullName: 'Vikram Thakur',
    phone: '+91 99341 87654',
    emergencyPhone: '+91 94300 11223',
    collegeOrWork: 'Railway Coaching Aspirant',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-7182',
    checkInDate: '2026-09-01',
    monthlyRent: 4000,
    depositPaid: 4000,
    status: 'active',
    policeVerificationStatus: 'verified'
  },
  {
    id: 't-4',
    propertyId: 'prop-shanti-01',
    roomId: 'room-103',
    bedId: 'bed-103-a',
    roomNumber: '103',
    bedLabel: 'Single Bed',
    fullName: 'Praveen Sharma',
    phone: '+91 98112 33445',
    emergencyPhone: '+91 98112 99887',
    collegeOrWork: 'HDFC Bank Employee',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-1983',
    checkInDate: '2026-06-10',
    monthlyRent: 6500,
    depositPaid: 6500,
    status: 'active',
    policeVerificationStatus: 'verified'
  }
];

const DEFAULT_LEADS: Lead[] = [
  {
    id: 'lead-01',
    propertyId: 'prop-shanti-01',
    propertyName: 'Shanti Niwas Boys PG',
    renterName: 'Manish Pandey',
    renterPhone: '+91 98351 09876',
    budget: 4500,
    lookingFor: '2 Sharing room near ABC College',
    destination: 'ABC College, Samastipur',
    status: 'new',
    notes: 'Needs room from 1st of next month with food',
    createdAt: '2026-10-18T14:30:00Z'
  },
  {
    id: 'lead-02',
    propertyId: 'prop-shanti-01',
    propertyName: 'Shanti Niwas Boys PG',
    renterName: 'Suraj Kumar',
    renterPhone: '+91 94318 65432',
    budget: 4000,
    lookingFor: 'Bed in 3 or 4 sharing',
    destination: 'Railway Junction',
    status: 'visit_scheduled',
    visitDate: '2026-10-20',
    visitTime: '04:30 PM',
    notes: 'Father is also accompanying to see the place',
    createdAt: '2026-10-17T09:15:00Z'
  },
  {
    id: 'lead-03',
    propertyId: 'prop-shanti-01',
    propertyName: 'Shanti Niwas Boys PG',
    renterName: 'Gaurav Kumar',
    renterPhone: '+91 91223 44556',
    budget: 6500,
    lookingFor: 'Private Single Room',
    destination: 'District Court',
    status: 'contacted',
    notes: 'Discussed rent over call; he wants single room with attached bath',
    createdAt: '2026-10-16T11:00:00Z'
  }
];

const DEFAULT_RENT_RECORDS: RentRecord[] = [
  {
    id: 'rent-oct-t1',
    tenantId: 't-1',
    tenantName: 'Amit Verma',
    propertyId: 'prop-shanti-01',
    propertyName: 'Shanti Niwas Boys PG',
    roomNumber: '101',
    month: 'October 2026',
    baseRent: 4500,
    prevReading: 1240,
    currentReading: 1285,
    electricityUnits: 45,
    electricityAmount: 405, // 45 * ₹9
    wifiAmount: 150,
    foodAmount: 0,
    otherAmount: 0,
    totalAmount: 5055,
    status: 'paid',
    dueDate: '2026-10-05',
    paidDate: '2026-10-04',
    paymentMethod: 'UPI',
    transactionRef: 'UPI-AXIS-99882341'
  },
  {
    id: 'rent-oct-t2',
    tenantId: 't-2',
    tenantName: 'Rohan Jha',
    propertyId: 'prop-shanti-01',
    propertyName: 'Shanti Niwas Boys PG',
    roomNumber: '102',
    month: 'October 2026',
    baseRent: 4000,
    prevReading: 890,
    currentReading: 932,
    electricityUnits: 42,
    electricityAmount: 378,
    wifiAmount: 150,
    foodAmount: 2200,
    otherAmount: 0,
    totalAmount: 6728,
    status: 'pending',
    dueDate: '2026-10-05'
  },
  {
    id: 'rent-oct-t3',
    tenantId: 't-3',
    tenantName: 'Vikram Thakur',
    propertyId: 'prop-shanti-01',
    propertyName: 'Shanti Niwas Boys PG',
    roomNumber: '102',
    month: 'October 2026',
    baseRent: 4000,
    prevReading: 890,
    currentReading: 932,
    electricityUnits: 42,
    electricityAmount: 378,
    wifiAmount: 150,
    foodAmount: 0,
    otherAmount: 0,
    totalAmount: 4528,
    status: 'overdue',
    dueDate: '2026-10-05'
  },
  {
    id: 'rent-oct-t4',
    tenantId: 't-4',
    tenantName: 'Praveen Sharma',
    propertyId: 'prop-shanti-01',
    propertyName: 'Shanti Niwas Boys PG',
    roomNumber: '103',
    month: 'October 2026',
    baseRent: 6500,
    prevReading: 410,
    currentReading: 468,
    electricityUnits: 58,
    electricityAmount: 522,
    wifiAmount: 150,
    foodAmount: 0,
    otherAmount: 0,
    totalAmount: 7172,
    status: 'paid',
    dueDate: '2026-10-05',
    paidDate: '2026-10-03',
    paymentMethod: 'Bank Transfer',
    transactionRef: 'NEFT-HDFC-001928'
  }
];

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-01',
    propertyId: 'prop-shanti-01',
    propertyName: 'Shanti Niwas Boys PG',
    tenantName: 'Amit Verma',
    roomNumber: '101',
    category: 'WiFi',
    title: 'WiFi speed very slow on 1st floor',
    description: 'Router is showing red light intermittently since yesterday evening.',
    priority: 'medium',
    status: 'open',
    createdAt: '2026-10-18T10:00:00Z'
  },
  {
    id: 'comp-02',
    propertyId: 'prop-shanti-01',
    propertyName: 'Shanti Niwas Boys PG',
    tenantName: 'Vikram Thakur',
    roomNumber: '102',
    category: 'Plumbing',
    title: 'Bathroom tap leaking continuously',
    description: 'Water leaking under the washbasin tap.',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-10-17T15:30:00Z',
    adminNote: 'Plumber informed, visiting today at 5 PM'
  }
];

export function getInitialState(): AppState {
  const defaultInitial: AppState = {
    currentRole: 'owner',
    profile: DEFAULT_PROFILE,
    tenantProfile: DEFAULT_TENANT_PROFILE,
    properties: DEFAULT_PROPERTIES,
    rooms: DEFAULT_ROOMS,
    beds: DEFAULT_BEDS,
    tenants: DEFAULT_TENANTS,
    leads: DEFAULT_LEADS,
    rentRecords: DEFAULT_RENT_RECORDS,
    complaints: DEFAULT_COMPLAINTS,
    activePropertyId: DEFAULT_PROPERTIES[0].id,
    savedPropertyIds: ['prop-shanti-01']
  };

  if (typeof window === 'undefined') {
    return defaultInitial;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultInitial,
        ...parsed
      };
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }

  saveState(defaultInitial);
  return defaultInitial;
}

export function saveState(state: AppState): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }
}

import { supabase } from './supabase';

export async function fetchLiveSupabaseData(): Promise<Partial<AppState> | null> {
  if (!supabase) return null;
  try {
    const [propsRes, roomsRes, bedsRes, leadsRes, tenantsRes, rentsRes, compRes] = await Promise.all([
      supabase.from('properties').select('*').eq('is_active', true),
      supabase.from('rooms').select('*'),
      supabase.from('beds').select('*'),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('tenants').select('*').order('created_at', { ascending: false }),
      supabase.from('rent_records').select('*').order('created_at', { ascending: false }),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }),
    ]);

    const partial: Partial<AppState> = {};

    if (propsRes.data && propsRes.data.length > 0) {
      partial.properties = propsRes.data.map((p: any) => ({
        id: p.id,
        ownerId: p.owner_id || 'owner-rajesh-01',
        name: p.name,
        type: p.type,
        address: p.address || p.area,
        area: p.area,
        city: p.city,
        landmark: p.landmark || '',
        totalBeds: p.total_beds,
        availableBeds: p.available_beds,
        baseRent: p.rent,
        deposit: p.deposit,
        brokerage: p.brokerage,
        electricityType: p.electricity_type || 'meter_unit',
        electricityRate: Number(p.electricity_rate || 9),
        wifiCost: p.wifi_cost,
        maintenance: p.maintenance,
        foodAvailable: p.food_available,
        foodIncluded: p.food_included,
        foodCost: p.food_cost,
        rules: p.rules || [],
        amenities: p.amenities || [],
        image: p.image || '',
        isActive: p.is_active,
        createdAt: p.created_at
      }));
    }

    if (roomsRes.data && roomsRes.data.length > 0) {
      partial.rooms = roomsRes.data.map((r: any) => ({
        id: r.id,
        propertyId: r.property_id,
        roomNumber: r.room_number,
        floor: r.floor || 1,
        roomType: r.accommodation,
        totalBeds: r.total_beds || 2,
        baseRent: r.rent
      }));
    }

    if (bedsRes.data && bedsRes.data.length > 0) {
      partial.beds = bedsRes.data.map((b: any) => ({
        id: b.id,
        roomId: b.room_id,
        propertyId: b.property_id,
        bedLabel: b.bed_label,
        status: b.status,
        tenantId: b.tenant_id,
        tenantName: b.tenant_name
      }));
    }

    if (leadsRes.data && leadsRes.data.length > 0) {
      partial.leads = leadsRes.data.map((l: any) => ({
        id: l.id,
        propertyId: l.property_id,
        propertyName: 'RoomSaathi Property',
        renterName: l.renter_name,
        renterPhone: l.renter_phone,
        budget: l.budget,
        lookingFor: l.looking_for,
        destination: l.destination,
        status: l.status,
        visitDate: l.visit_date,
        visitTime: l.visit_time,
        notes: l.notes,
        createdAt: l.created_at
      }));
    }

    return partial;
  } catch (err) {
    console.error('Error fetching live Supabase data', err);
    return null;
  }
}

export async function syncLeadToSupabase(lead: Omit<Lead, 'id' | 'createdAt'>) {
  if (!supabase) return;
  try {
    await supabase.from('leads').insert({
      property_id: lead.propertyId,
      renter_name: lead.renterName,
      renter_phone: lead.renterPhone,
      budget: lead.budget,
      looking_for: lead.lookingFor,
      destination: lead.destination,
      status: lead.status,
      visit_date: lead.visitDate || '',
      visit_time: lead.visitTime || '',
      notes: lead.notes || ''
    });
  } catch (e) {
    console.error('Failed to sync lead to Supabase', e);
  }
}

export async function syncBedStatusToSupabase(bedId: string, status: string, tenantName?: string) {
  if (!supabase) return;
  try {
    await supabase.from('beds').update({
      status,
      tenant_name: tenantName || null
    }).eq('id', bedId);
  } catch (e) {
    console.error('Failed to sync bed status to Supabase', e);
  }
}

export async function syncComplaintToSupabase(comp: Omit<Complaint, 'id' | 'createdAt'>) {
  if (!supabase) return;
  try {
    await supabase.from('complaints').insert({
      property_id: comp.propertyId,
      property_name: comp.propertyName,
      tenant_name: comp.tenantName,
      room_number: comp.roomNumber,
      category: comp.category,
      title: comp.title,
      description: comp.description,
      priority: comp.priority,
      status: comp.status,
      admin_note: comp.adminNote || ''
    });
  } catch (e) {
    console.error('Failed to sync complaint to Supabase', e);
  }
}

