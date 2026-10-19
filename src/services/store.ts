import { OwnerProfile, TenantProfile, Property, Room, Bed, Tenant, Lead, RentRecord, Complaint, UserRole } from '../types';

const STORAGE_KEY = 'roomsaathi_clean_v2';

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
  id: 'tenant-default',
  fullName: 'User / Tenant',
  phone: '',
  email: '',
  avatarUrl: '',
  role: 'tenant',
  collegeOrWork: ''
};

const DEFAULT_PROFILE: OwnerProfile = {
  id: 'owner-default',
  fullName: 'Property Owner',
  phone: '',
  email: '',
  avatarUrl: '',
  upiId: '',
  role: 'owner',
  businessName: '',
  isKycVerified: false,
  city: 'Samastipur, Bihar'
};

const DEFAULT_PROPERTIES: Property[] = [];

const DEFAULT_ROOMS: Room[] = [];
const DEFAULT_BEDS: Bed[] = [];

const DEFAULT_TENANTS: Tenant[] = [];
const DEFAULT_LEADS: Lead[] = [];

const DEFAULT_RENT_RECORDS: RentRecord[] = [];

const DEFAULT_COMPLAINTS: Complaint[] = [];

export function getInitialState(): AppState {
  const defaultInitial: AppState = {
    currentRole: 'owner',
    profile: DEFAULT_PROFILE,
    tenantProfile: DEFAULT_TENANT_PROFILE,
    properties: [],
    rooms: [],
    beds: [],
    tenants: [],
    leads: [],
    rentRecords: [],
    complaints: [],
    activePropertyId: '',
    savedPropertyIds: []
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

    const partial: Partial<AppState> = {
      properties: (propsRes.data || []).map((p: any) => ({
        id: p.id,
        ownerId: p.owner_id || 'owner-default',
        name: p.name,
        type: p.type,
        address: p.address || p.area,
        area: p.area,
        city: p.city,
        landmark: p.landmark || '',
        totalBeds: p.total_beds || 0,
        availableBeds: p.available_beds || 0,
        baseRent: p.rent,
        deposit: p.deposit || 0,
        brokerage: p.brokerage || 0,
        electricityType: p.electricity_type || 'meter_unit',
        electricityRate: Number(p.electricity_rate || 9),
        wifiCost: p.wifi_cost || 0,
        maintenance: p.maintenance || 0,
        foodAvailable: p.food_available || false,
        foodIncluded: p.food_included || false,
        foodCost: p.food_cost || 0,
        rules: p.rules || [],
        amenities: p.amenities || [],
        image: p.image || '',
        isActive: p.is_active,
        createdAt: p.created_at
      })),
      rooms: (roomsRes.data || []).map((r: any) => ({
        id: r.id,
        propertyId: r.property_id,
        roomNumber: r.room_number,
        floor: r.floor || 1,
        roomType: r.accommodation,
        totalBeds: r.total_beds || 2,
        baseRent: r.rent
      })),
      beds: (bedsRes.data || []).map((b: any) => ({
        id: b.id,
        roomId: b.room_id,
        propertyId: b.property_id,
        bedLabel: b.bed_label,
        status: b.status,
        tenantId: b.tenant_id,
        tenantName: b.tenant_name
      })),
      leads: (leadsRes.data || []).map((l: any) => ({
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
      })),
      tenants: (tenantsRes.data || []).map((t: any) => ({
        id: t.id,
        propertyId: t.property_id,
        roomId: t.room_id,
        bedId: t.bed_id,
        roomNumber: t.room_number,
        bedLabel: t.bed_label,
        fullName: t.full_name,
        phone: t.phone,
        emergencyPhone: t.emergency_phone || '',
        collegeOrWork: t.college_or_work || '',
        idProofType: t.id_proof_type || 'Aadhaar',
        idProofNumber: t.id_proof_number || '',
        checkInDate: t.check_in_date,
        monthlyRent: t.monthly_rent,
        depositPaid: t.deposit_paid,
        status: t.status,
        policeVerificationStatus: t.police_verification_status
      })),
      rentRecords: (rentsRes.data || []).map((r: any) => ({
        id: r.id,
        tenantId: r.tenant_id,
        tenantName: r.tenant_name,
        propertyId: r.property_id,
        propertyName: r.property_name,
        roomNumber: r.room_number,
        month: r.month,
        baseRent: r.base_rent,
        prevReading: r.prev_reading,
        currentReading: r.current_reading,
        electricityUnits: r.electricity_units,
        electricityAmount: r.electricity_amount,
        wifiAmount: r.wifi_amount || 0,
        foodAmount: r.food_amount || 0,
        otherAmount: r.other_amount || 0,
        totalAmount: r.total_amount,
        status: r.status,
        dueDate: r.due_date,
        paidDate: r.paid_date,
        paymentMethod: r.payment_method,
        transactionRef: r.transaction_ref
      })),
      complaints: (compRes.data || []).map((c: any) => ({
        id: c.id,
        propertyId: c.property_id,
        propertyName: c.property_name,
        tenantName: c.tenant_name,
        roomNumber: c.room_number,
        category: c.category,
        title: c.title,
        description: c.description,
        priority: c.priority,
        status: c.status,
        createdAt: c.created_at,
        resolvedAt: c.resolved_at,
        adminNote: c.admin_note
      }))
    };

    return partial;
  } catch (err) {
    console.error('Error fetching live Supabase data', err);
    return null;
  }
}

export async function syncPropertyToSupabase(
  prop: Property,
  rooms: Room[],
  beds: Bed[]
) {
  if (!supabase) return;
  try {
    await supabase.from('properties').insert({
      id: prop.id,
      name: prop.name,
      type: prop.type,
      city: prop.city,
      area: prop.area,
      distance_km: 1.0,
      commute_minutes: 5,
      rating: 5.0,
      review_count: 0,
      verified: true,
      verification_level: 'Gold',
      rent: prop.baseRent,
      deposit: prop.deposit,
      brokerage: prop.brokerage,
      electricity: prop.electricityType === 'included' ? 'Included' : `₹${prop.electricityRate}/unit`,
      electricity_type: prop.electricityType,
      electricity_rate: prop.electricityRate,
      wifi_cost: prop.wifiCost,
      maintenance: prop.maintenance,
      food_cost: prop.foodCost,
      food_available: prop.foodAvailable,
      food_included: prop.foodIncluded,
      wifi: prop.amenities.includes('WiFi') || prop.amenities.includes('High Speed WiFi'),
      electricity_included: prop.electricityType === 'included',
      available_beds: prop.availableBeds,
      total_beds: prop.totalBeds,
      accommodation: `${rooms[0]?.roomType || '2 Sharing'} Rooms`,
      amenities: prop.amenities,
      image: prop.image,
      color: '#176b58',
      description: `${prop.name} located in ${prop.area}, ${prop.city}. ${prop.landmark}`,
      owner_name: 'RoomSaathi Landlord',
      rules: prop.rules,
      updated_label: 'Just now',
      is_active: true
    });

    if (rooms.length > 0) {
      await supabase.from('rooms').insert(rooms.map(r => ({
        id: r.id,
        property_id: prop.id,
        room_number: r.roomNumber,
        accommodation: r.roomType,
        rent: r.baseRent,
        floor: r.floor,
        total_beds: r.totalBeds
      })));
    }

    if (beds.length > 0) {
      await supabase.from('beds').insert(beds.map(b => ({
        id: b.id,
        room_id: b.roomId,
        property_id: prop.id,
        bed_label: b.bedLabel,
        status: b.status,
        tenant_id: b.tenantId || null,
        tenant_name: b.tenantName || null
      })));
    }
  } catch (err) {
    console.error('Failed to sync new property to Supabase', err);
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

