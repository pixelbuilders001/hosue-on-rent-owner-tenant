import { OwnerProfile, Property, Room, Bed, Tenant, Lead, RentRecord, Complaint, RentAgreement } from '../types';

const STORAGE_KEY = 'roomsaathi_clean_v2';

export interface AppState {
  profile: OwnerProfile;
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  tenants: Tenant[];
  leads: Lead[];
  rentRecords: RentRecord[];
  complaints: Complaint[];
  agreements: RentAgreement[];
  activePropertyId: string;
}

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

export function getInitialState(): AppState {
  const defaultInitial: AppState = {
    profile: DEFAULT_PROFILE,
    properties: [],
    rooms: [],
    beds: [],
    tenants: [],
    leads: [],
    rentRecords: [],
    complaints: [],
    agreements: [],
    activePropertyId: ''
  };

  if (typeof window === 'undefined') {
    return defaultInitial;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleanProperties = (parsed.properties || []).filter((p: any) => p.ownerId !== 'owner-rajesh-01' && p.ownerId !== 'owner-default');
      return {
        ...defaultInitial,
        ...parsed,
        properties: cleanProperties
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
        category: p.category || (p.type === 'Flat' ? 'entire_house' : p.type === 'Room' ? 'private_room' : 'shared_pg'),
        bhkType: p.bhk_type || undefined,
        furnishingStatus: p.furnishing_status || undefined,
        preferredTenant: p.preferred_tenant || 'any',
        builtupSqft: p.builtup_sqft ? Number(p.builtup_sqft) : undefined,
        bathroomsCount: p.bathrooms_count ? Number(p.bathrooms_count) : undefined,
        balconiesCount: p.balconies_count ? Number(p.balconies_count) : undefined,
        floorNumber: p.floor_number ? Number(p.floor_number) : undefined,
        totalFloors: p.total_floors ? Number(p.total_floors) : undefined,
        parkingType: p.parking_type || undefined,
        ownerResidesHere: p.owner_resides_here ?? false,
        kitchenType: p.kitchen_type || undefined,
        privateEntrance: p.private_entrance ?? false,
        foodPreference: p.food_preference || 'no_restriction',
        address: p.address || p.area,
        area: p.area,
        city: p.city,
        landmark: p.landmark || '',
        pincode: p.pincode || '848101',
        latitude: p.latitude ? Number(p.latitude) : undefined,
        longitude: p.longitude ? Number(p.longitude) : undefined,
        distanceKm: p.distance_km ? Number(p.distance_km) : 1.0,
        commuteMinutes: p.commute_minutes ? Number(p.commute_minutes) : 5,
        stationDistanceKm: p.station_distance_km ? Number(p.station_distance_km) : undefined,
        busStandDistanceKm: p.bus_stand_distance_km ? Number(p.bus_stand_distance_km) : undefined,
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
        image: p.image || (p.images && p.images[0]) || '',
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
        description: p.description || '',
        ownerName: p.owner_name || '',
        isActive: p.is_active ?? true,
        verificationStatus: p.verification_status || 'pending',
        createdAt: p.created_at
      })),
      rooms: (roomsRes.data || []).map((r: any) => ({
        id: r.id,
        propertyId: r.property_id,
        roomNumber: r.room_number,
        floor: r.floor || 1,
        roomType: r.accommodation,
        totalBeds: r.total_beds || 2,
        baseRent: r.rent,
        attachedWashroom: r.attached_washroom ?? false,
        hasBalcony: r.has_balcony ?? false,
        isPrivateRoom: r.is_private_room ?? false,
        isActive: r.is_active ?? true
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
        policeVerificationStatus: t.police_verification_status,
        tenantCategory: t.tenant_category || 'student',
        familyMembersCount: t.family_members_count ? Number(t.family_members_count) : 1
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
      ...(() => {
        const complaintsList: any[] = [];
        const agreementsList: RentAgreement[] = [];
        (compRes.data || []).forEach((c: any) => {
          if (c.category === '__agreement_sync__') {
            try {
              const parsed = JSON.parse(c.description);
              if (parsed && (parsed.id || parsed.signingToken)) {
                agreementsList.push(parsed);
              }
            } catch (err) {
              console.warn('Failed to parse sync agreement JSON', err);
            }
          } else {
            complaintsList.push({
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
            });
          }
        });
        return {
          complaints: complaintsList,
          agreements: agreementsList
        };
      })()
    };

    return partial;
  } catch (err) {
    console.error('Error fetching live Supabase data', err);
    return null;
  }
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function syncPropertyToSupabase(
  prop: Property,
  rooms: Room[],
  beds: Bed[]
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error: propErr } = await supabase.from('properties').insert({
      id: prop.id,
      owner_id: prop.ownerId || null,
      name: prop.name,
      type: prop.type,
      city: prop.city,
      area: prop.area,
      address: prop.address || prop.area,
      landmark: prop.landmark || '',
      pincode: prop.pincode || '848101',
      latitude: prop.latitude ? Number(prop.latitude) : null,
      longitude: prop.longitude ? Number(prop.longitude) : null,
      distance_km: prop.distanceKm ? Number(prop.distanceKm) : 1.0,
      commute_minutes: prop.commuteMinutes ? Number(prop.commuteMinutes) : 5,
      station_distance_km: prop.stationDistanceKm ? Number(prop.stationDistanceKm) : null,
      bus_stand_distance_km: prop.busStandDistanceKm ? Number(prop.busStandDistanceKm) : null,
      rating: 5.0,
      review_count: 0,
      verified: prop.verificationStatus === 'verified',
      verification_level: prop.verificationStatus === 'verified' ? 'Gold' : 'Pending',
      verification_status: prop.verificationStatus || 'pending',
      rent: Number(prop.baseRent) || 0,
      deposit: Number(prop.deposit) || 0,
      brokerage: Number(prop.brokerage) || 0,
      electricity: Number(prop.electricityRate) || 0,
      electricity_type: prop.electricityType,
      electricity_rate: Number(prop.electricityRate) || 0,
      wifi_cost: Number(prop.wifiCost) || 0,
      maintenance: Number(prop.maintenance) || 0,
      food_cost: Number(prop.foodCost) || 0,
      food_available: Boolean(prop.foodAvailable),
      food_included: Boolean(prop.foodIncluded),
      wifi: prop.amenities.includes('WiFi') || prop.amenities.includes('High Speed WiFi'),
      electricity_included: prop.electricityType === 'included',
      available_beds: Number(prop.availableBeds) || 0,
      total_beds: Number(prop.totalBeds) || 0,
      accommodation: `${rooms[0]?.roomType || '2 Sharing'} Rooms`,
      amenities: prop.amenities || [],
      image: (prop.images && prop.images[0]) || prop.image || '',
      images: (prop.images && prop.images.length > 0) ? prop.images : (prop.image ? [prop.image] : []),
      color: '#176b58',
      description: prop.description || `${prop.name} located in ${prop.area}, ${prop.city}. ${prop.landmark || ''}`,
      owner_name: prop.ownerName || prop.name || 'RoomSaathi Landlord',
      category: prop.category || 'shared_pg',
      bhk_type: prop.bhkType || null,
      furnishing_status: prop.furnishingStatus || null,
      preferred_tenant: prop.preferredTenant || null,
      builtup_sqft: prop.builtupSqft ? Number(prop.builtupSqft) : null,
      bathrooms_count: prop.bathroomsCount ? Number(prop.bathroomsCount) : null,
      balconies_count: prop.balconiesCount ? Number(prop.balconiesCount) : null,
      floor_number: prop.floorNumber ? Number(prop.floorNumber) : null,
      total_floors: prop.totalFloors ? Number(prop.totalFloors) : null,
      parking_type: prop.parkingType || null,
      owner_resides_here: prop.ownerResidesHere ?? false,
      kitchen_type: prop.kitchenType || null,
      private_entrance: prop.privateEntrance ?? false,
      food_preference: prop.foodPreference || null,
      rules: prop.rules || [],
      updated_label: 'Just now',
      is_active: prop.isActive ?? true
    });

    if (propErr) {
      console.error('Error inserting property to Supabase:', propErr);
      return false;
    }

    if (rooms.length > 0) {
      const { error: roomsErr } = await supabase.from('rooms').insert(rooms.map(r => ({
        id: r.id,
        property_id: prop.id,
        room_number: r.roomNumber,
        accommodation: r.roomType,
        rent: Number(r.baseRent) || 0,
        floor: Number(r.floor) || 1,
        total_beds: Number(r.totalBeds) || 2,
        attached_washroom: r.attachedWashroom ?? false,
        has_balcony: r.hasBalcony ?? false,
        is_private_room: r.isPrivateRoom ?? false,
        is_active: r.isActive ?? true
      })));
      if (roomsErr) console.error('Error inserting rooms:', roomsErr);
    }

    if (beds.length > 0) {
      const { error: bedsErr } = await supabase.from('beds').insert(beds.map(b => ({
        id: b.id,
        room_id: b.roomId,
        property_id: prop.id,
        bed_label: b.bedLabel,
        status: b.status,
        tenant_id: null,
        tenant_name: b.tenantName || null
      })));
      if (bedsErr) console.error('Error inserting beds:', bedsErr);
    }

    return true;
  } catch (err) {
    console.error('Failed to sync new property to Supabase', err);
    return false;
  }
}

export async function syncUpdatePropertyToSupabase(prop: Property): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error: propErr } = await supabase.from('properties').update({
      name: prop.name,
      type: prop.type,
      category: prop.category || 'shared_pg',
      bhk_type: prop.bhkType || null,
      furnishing_status: prop.furnishingStatus || null,
      preferred_tenant: prop.preferredTenant || null,
      builtup_sqft: prop.builtupSqft ? Number(prop.builtupSqft) : null,
      bathrooms_count: prop.bathroomsCount ? Number(prop.bathroomsCount) : null,
      balconies_count: prop.balconiesCount ? Number(prop.balconiesCount) : null,
      floor_number: prop.floorNumber ? Number(prop.floorNumber) : null,
      total_floors: prop.totalFloors ? Number(prop.totalFloors) : null,
      parking_type: prop.parkingType || null,
      owner_resides_here: prop.ownerResidesHere ?? false,
      kitchen_type: prop.kitchenType || null,
      private_entrance: prop.privateEntrance ?? false,
      food_preference: prop.foodPreference || null,
      city: prop.city,
      area: prop.area,
      address: prop.address || prop.area,
      landmark: prop.landmark || '',
      pincode: prop.pincode || '848101',
      latitude: prop.latitude ? Number(prop.latitude) : null,
      longitude: prop.longitude ? Number(prop.longitude) : null,
      distance_km: prop.distanceKm ? Number(prop.distanceKm) : 1.0,
      commute_minutes: prop.commuteMinutes ? Number(prop.commuteMinutes) : 5,
      station_distance_km: prop.stationDistanceKm ? Number(prop.stationDistanceKm) : null,
      bus_stand_distance_km: prop.busStandDistanceKm ? Number(prop.busStandDistanceKm) : null,
      rent: Number(prop.baseRent) || 0,
      deposit: Number(prop.deposit) || 0,
      brokerage: Number(prop.brokerage) || 0,
      electricity: Number(prop.electricityRate) || 0,
      electricity_type: prop.electricityType,
      electricity_rate: Number(prop.electricityRate) || 0,
      wifi_cost: Number(prop.wifiCost) || 0,
      maintenance: Number(prop.maintenance) || 0,
      food_cost: Number(prop.foodCost) || 0,
      food_available: Boolean(prop.foodAvailable),
      food_included: Boolean(prop.foodIncluded),
      wifi: prop.amenities.includes('WiFi') || prop.amenities.includes('High Speed WiFi'),
      electricity_included: prop.electricityType === 'included',
      amenities: prop.amenities || [],
      image: (prop.images && prop.images[0]) || prop.image || '',
      images: (prop.images && prop.images.length > 0) ? prop.images : (prop.image ? [prop.image] : []),
      description: prop.description,
      owner_name: prop.ownerName || 'Host',
      rules: prop.rules || [],
      updated_label: 'Recently updated',
      is_active: prop.isActive ?? true,
      verification_status: prop.verificationStatus || 'pending'
    }).eq('id', prop.id);

    if (propErr) {
      console.error('Failed to update property in Supabase:', propErr);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to sync updated property to Supabase', err);
    return false;
  }
}

export async function syncPropertyStatusToSupabase(propertyId: string, isActive: boolean) {
  if (!supabase) return;
  try {
    await supabase.from('properties').update({ is_active: isActive }).eq('id', propertyId);
  } catch (e) {
    console.error('Failed to sync property status to Supabase', e);
  }
}

export async function syncRoomStatusToSupabase(roomId: string, isActive: boolean) {
  if (!supabase) return;
  try {
    await supabase.from('rooms').update({ is_active: isActive }).eq('id', roomId);
  } catch (e) {
    console.error('Failed to sync room status to Supabase', e);
  }
}

export async function syncRoomToSupabase(room: Room, beds: Bed[]) {
  if (!supabase) return;
  try {
    await supabase.from('rooms').insert({
      id: room.id,
      property_id: room.propertyId,
      room_number: room.roomNumber,
      accommodation: room.roomType,
      rent: Number(room.baseRent) || 0,
      floor: Number(room.floor) || 1,
      total_beds: Number(room.totalBeds) || 2,
      attached_washroom: room.attachedWashroom ?? false,
      has_balcony: room.hasBalcony ?? false,
      is_private_room: room.isPrivateRoom ?? false,
      is_active: room.isActive ?? true
    });

    if (beds.length > 0) {
      await supabase.from('beds').insert(beds.map(b => ({
        id: b.id,
        room_id: room.id,
        property_id: room.propertyId,
        bed_label: b.bedLabel,
        status: b.status,
        tenant_id: null,
        tenant_name: null
      })));
    }
  } catch (e) {
    console.error('Failed to sync room to Supabase', e);
  }
}

export async function syncTenantToSupabase(tenant: Tenant, rentRecord?: RentRecord) {
  if (!supabase) return;
  try {
    await supabase.from('tenants').insert({
      id: tenant.id,
      property_id: tenant.propertyId,
      room_id: tenant.roomId || null,
      bed_id: tenant.bedId || null,
      profile_id: null,
      room_number: tenant.roomNumber,
      bed_label: tenant.bedLabel || null,
      full_name: tenant.fullName,
      phone: tenant.phone,
      emergency_phone: tenant.emergencyPhone || null,
      email: tenant.email || null,
      college_or_work: tenant.collegeOrWork || null,
      id_proof_type: tenant.idProofType || 'Aadhaar',
      id_proof_number: tenant.idProofNumber || null,
      check_in_date: tenant.checkInDate,
      monthly_rent: Number(tenant.monthlyRent) || 0,
      deposit_paid: Number(tenant.depositPaid) || 0,
      status: tenant.status || 'active',
      police_verification_status: tenant.policeVerificationStatus || 'pending',
      tenant_category: tenant.tenantCategory || null,
      family_members_count: tenant.familyMembersCount ? Number(tenant.familyMembersCount) : null
    });

    if (tenant.bedId) {
      await supabase.from('beds').update({
        status: 'occupied',
        tenant_name: tenant.fullName
      }).eq('id', tenant.bedId);
    }

    if (rentRecord) {
      await supabase.from('rent_records').insert({
        id: rentRecord.id,
        tenant_id: tenant.id,
        tenant_name: rentRecord.tenantName,
        property_id: rentRecord.propertyId,
        property_name: rentRecord.propertyName,
        room_number: rentRecord.roomNumber,
        month: rentRecord.month,
        base_rent: Number(rentRecord.baseRent) || 0,
        wifi_amount: Number(rentRecord.wifiAmount) || 0,
        food_amount: Number(rentRecord.foodAmount) || 0,
        other_amount: Number(rentRecord.otherAmount) || 0,
        total_amount: Number(rentRecord.totalAmount) || 0,
        status: rentRecord.status,
        due_date: rentRecord.dueDate || null
      });
    }
  } catch (e) {
    console.error('Failed to sync tenant to Supabase', e);
  }
}

export async function syncVacateTenantToSupabase(tenantId: string, bedId?: string) {
  if (!supabase) return;
  try {
    await supabase.from('tenants').update({ status: 'vacated' }).eq('id', tenantId);
    if (bedId) {
      await supabase.from('beds').update({
        status: 'available',
        tenant_id: null,
        tenant_name: null
      }).eq('id', bedId);
    }
  } catch (e) {
    console.error('Failed to sync vacate to Supabase', e);
  }
}

export async function syncRentRecordToSupabase(record: RentRecord) {
  if (!supabase) return;
  try {
    await supabase.from('rent_records').insert({
      id: record.id,
      tenant_id: record.tenantId || null,
      tenant_name: record.tenantName,
      property_id: record.propertyId,
      property_name: record.propertyName,
      room_number: record.roomNumber,
      month: record.month,
      base_rent: Number(record.baseRent) || 0,
      prev_reading: record.prevReading != null ? Number(record.prevReading) : null,
      current_reading: record.currentReading != null ? Number(record.currentReading) : null,
      electricity_units: record.electricityUnits != null ? Number(record.electricityUnits) : null,
      electricity_amount: record.electricityAmount != null ? Number(record.electricityAmount) : null,
      wifi_amount: Number(record.wifiAmount) || 0,
      food_amount: Number(record.foodAmount) || 0,
      other_amount: Number(record.otherAmount) || 0,
      total_amount: Number(record.totalAmount) || 0,
      status: record.status,
      due_date: record.dueDate || null,
      paid_date: record.paidDate || null,
      payment_method: record.paymentMethod || null,
      transaction_ref: record.transactionRef || null
    });
  } catch (e) {
    console.error('Failed to sync rent record to Supabase', e);
  }
}

export async function syncRentStatusToSupabase(
  recordId: string,
  status: string,
  method?: string,
  ref?: string,
  paidDate?: string
) {
  if (!supabase) return;
  try {
    await supabase.from('rent_records').update({
      status,
      payment_method: method || null,
      transaction_ref: ref || null,
      paid_date: paidDate || null
    }).eq('id', recordId);
  } catch (e) {
    console.error('Failed to update rent status in Supabase', e);
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

export async function syncComplaintStatusToSupabase(complaintId: string, status: string, adminNote?: string) {
  if (!supabase) return;
  try {
    await supabase.from('complaints').update({
      status,
      admin_note: adminNote || '',
      resolved_at: status === 'resolved' ? new Date().toISOString() : null
    }).eq('id', complaintId);
  } catch (e) {
    console.error('Failed to update complaint in Supabase', e);
  }
}

export async function syncAgreementToSupabase(agreement: RentAgreement) {
  if (!supabase) return;
  try {
    // 1. Persist to Supabase cloud sync record (guaranteed table)
    const { data: existingSync } = await supabase
      .from('complaints')
      .select('id')
      .eq('category', '__agreement_sync__')
      .eq('title', agreement.id)
      .maybeSingle();

    if (existingSync) {
      await supabase.from('complaints').update({
        description: JSON.stringify(agreement),
        status: agreement.status === 'completed' || agreement.tenantSignature ? 'resolved' : 'pending'
      }).eq('id', existingSync.id);
    } else {
      await supabase.from('complaints').insert({
        property_id: agreement.propertyId,
        property_name: agreement.propertyName || 'Property',
        tenant_name: agreement.tenantName,
        room_number: agreement.roomNumber || '101',
        category: '__agreement_sync__',
        title: agreement.id,
        description: JSON.stringify(agreement),
        priority: 'low',
        status: agreement.status === 'completed' || agreement.tenantSignature ? 'resolved' : 'pending'
      });
    }

    // 2. Also attempt direct agreements table if available
    await supabase.from('agreements').upsert({
      id: agreement.id,
      property_id: agreement.propertyId,
      property_name: agreement.propertyName,
      tenant_id: agreement.tenantId,
      tenant_name: agreement.tenantName,
      tenant_phone: agreement.tenantPhone,
      tenant_aadhaar: agreement.tenantAadhaar || null,
      owner_name: agreement.ownerName,
      owner_phone: agreement.ownerPhone,
      room_number: agreement.roomNumber,
      monthly_rent: Number(agreement.monthlyRent) || 0,
      deposit_amount: Number(agreement.depositAmount) || 0,
      start_date: agreement.startDate,
      duration_months: Number(agreement.durationMonths) || 11,
      pdf_file_name: agreement.pdfFileName || 'rent_agreement.pdf',
      status: agreement.status,
      owner_signature: agreement.ownerSignature || null,
      owner_signed_at: agreement.ownerSignedAt || null,
      tenant_signature: agreement.tenantSignature || null,
      tenant_signed_at: agreement.tenantSignedAt || null,
      signing_token: agreement.signingToken,
      pdf_base64: agreement.pdfBase64 || null,
      signed_pdf_base64: agreement.signedPdfBase64 || null,
      created_at: agreement.createdAt
    });
  } catch (e) {
    console.warn('Agreement synced to local storage (Supabase cloud sync fallback)', e);
  }
}

export async function syncAgreementUpdateToSupabase(
  agreementId: string,
  updates: Partial<RentAgreement>
) {
  if (!supabase) return;
  try {
    const { data: existingSync } = await supabase
      .from('complaints')
      .select('id, description')
      .eq('category', '__agreement_sync__')
      .eq('title', agreementId)
      .maybeSingle();

    if (existingSync) {
      const prevData = JSON.parse(existingSync.description || '{}');
      const merged = { ...prevData, ...updates };
      await supabase.from('complaints').update({
        description: JSON.stringify(merged),
        status: merged.status === 'completed' || merged.tenantSignature ? 'resolved' : 'pending'
      }).eq('id', existingSync.id);
    }

    const payload: any = {};
    if (updates.status) payload.status = updates.status;
    if (updates.ownerSignature) payload.owner_signature = updates.ownerSignature;
    if (updates.ownerSignedAt) payload.owner_signed_at = updates.ownerSignedAt;
    if (updates.tenantSignature) payload.tenant_signature = updates.tenantSignature;
    if (updates.tenantSignedAt) payload.tenant_signed_at = updates.tenantSignedAt;
    if (updates.signedPdfBase64) payload.signed_pdf_base64 = updates.signedPdfBase64;
    if (updates.pdfBase64) payload.pdf_base64 = updates.pdfBase64;
    await supabase.from('agreements').update(payload).eq('id', agreementId);
  } catch (e) {
    console.warn('Agreement update saved locally (Supabase cloud sync fallback)', e);
  }
}


