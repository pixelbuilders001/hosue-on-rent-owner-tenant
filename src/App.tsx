import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { OverviewView } from './components/dashboard/OverviewView';
import { RoomsBedsView } from './components/rooms/RoomsBedsView';
import { LeadsView } from './components/leads/LeadsView';
import { TenantsView } from './components/tenants/TenantsView';
import { BillingView } from './components/billing/BillingView';
import { ComplaintsView } from './components/complaints/ComplaintsView';
import { SettingsView } from './components/settings/SettingsView';
import { AddPropertyModal } from './components/common/AddPropertyModal';
import { AuthModal } from './components/auth/AuthModal';
import { ReceiptModal } from './components/billing/ReceiptModal';
import { TenantExploreView } from './components/tenant/TenantExploreView';
import { TenantRoomDetailModal } from './components/tenant/TenantRoomDetailModal';
import { TenantMyStayView } from './components/tenant/TenantMyStayView';
import { TenantInquiriesView } from './components/tenant/TenantInquiriesView';
import { Building2, Plus } from 'lucide-react';
import { 
  getInitialState, 
  saveState, 
  AppState,
  fetchLiveSupabaseData,
  syncBedStatusToSupabase,
  syncLeadToSupabase,
  syncComplaintToSupabase,
  syncPropertyToSupabase
} from './services/store';
import { supabase } from './services/supabase';
import { 
  Property, 
  Room, 
  Bed, 
  Tenant, 
  Lead, 
  RentRecord, 
  Complaint, 
  OwnerProfile, 
  TenantProfile, 
  Language, 
  UserRole 
} from './types';

export function App() {
  const [state, setState] = useState<AppState>(getInitialState);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [language, setLanguage] = useState<Language>('en');

  // Modals state
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedReceiptRecord, setSelectedReceiptRecord] = useState<RentRecord | null>(null);
  const [selectedTenantProperty, setSelectedTenantProperty] = useState<Property | null>(null);

  // Sync to localStorage on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Fetch live Supabase data on mount & bind auth state
  useEffect(() => {
    fetchLiveSupabaseData().then(liveData => {
      if (liveData) {
        setState(prev => ({
          ...prev,
          properties: liveData.properties && liveData.properties.length > 0 ? liveData.properties : prev.properties,
          rooms: liveData.rooms && liveData.rooms.length > 0 ? liveData.rooms : prev.rooms,
          beds: liveData.beds && liveData.beds.length > 0 ? liveData.beds : prev.beds,
          leads: liveData.leads && liveData.leads.length > 0 ? liveData.leads : prev.leads
        }));
      }
    });

    const client = supabase;
    if (client) {
      const syncUserProfile = async (userId: string) => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role');

        const { data: prof } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();

        let targetRole: UserRole | null = null;
        if (urlRole === 'owner' || urlRole === 'tenant') {
          targetRole = urlRole;
          await client.from('profiles').update({ role: targetRole }).eq('id', userId);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (prof?.role === 'owner' || prof?.role === 'tenant') {
          targetRole = prof.role as UserRole;
        }

        if (targetRole) {
          setState(prev => ({
            ...prev,
            currentRole: targetRole!,
            profile: targetRole === 'owner' ? {
              ...prev.profile,
              fullName: prof?.full_name || prev.profile.fullName,
              phone: prof?.phone || prev.profile.phone
            } : prev.profile,
            tenantProfile: targetRole === 'tenant' ? {
              ...prev.tenantProfile,
              fullName: prof?.full_name || prev.tenantProfile.fullName,
              phone: prof?.phone || prev.tenantProfile.phone
            } : prev.tenantProfile
          }));
          setCurrentTab(targetRole === 'owner' ? 'dashboard' : 'explore');
        } else {
          // If no role set yet, prompt the user with the role chooser modal
          setShowAuthModal(true);
        }
      };

      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          syncUserProfile(session.user.id);
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          syncUserProfile(session.user.id);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const activeProperty = state.properties.find(p => p.id === state.activePropertyId) || state.properties[0];

  // Notification counts
  const propLeads = activeProperty ? state.leads.filter(l => l.propertyId === activeProperty.id) : [];
  const propRents = activeProperty ? state.rentRecords.filter(r => r.propertyId === activeProperty.id) : [];
  const propComplaints = activeProperty ? state.complaints.filter(c => c.propertyId === activeProperty.id) : [];

  const leadsCount = propLeads.filter(l => l.status === 'new').length;
  const dueRentsCount = propRents.filter(r => r.status === 'overdue' || r.status === 'pending').length;
  const openComplaintsCount = propComplaints.filter(c => c.status !== 'resolved').length;
  const totalUnreadCount = leadsCount + openComplaintsCount;
  const savedCount = state.savedPropertyIds?.length || 0;

  // Role Switcher handler
  const handleSelectRole = (role: UserRole) => {
    setState(prev => ({ ...prev, currentRole: role }));
    if (role === 'owner') {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('explore');
    }
    const client = supabase;
    if (client) {
      client.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          client.from('profiles').update({ role }).eq('id', user.id).then();
        }
      });
    }
  };

  // Toggle bed status cycle: available -> occupied -> reserved -> available
  const handleToggleBedStatus = (bedId: string) => {
    const targetBed = state.beds.find(b => b.id === bedId);
    const nextStatus = targetBed?.status === 'available' ? 'occupied' : targetBed?.status === 'occupied' ? 'reserved' : 'available';
    syncBedStatusToSupabase(bedId, nextStatus);

    setState(prev => {
      const nextBeds = prev.beds.map(b => {
        if (b.id !== bedId) return b;
        return {
          ...b,
          status: nextStatus as Bed['status'],
          tenantName: nextStatus === 'available' ? undefined : b.tenantName
        };
      });

      const targetPropId = targetBed?.propertyId || activeProperty?.id;
      const avail = targetPropId ? nextBeds.filter(b => b.propertyId === targetPropId && b.status === 'available').length : 0;
      const nextProps = prev.properties.map(p => p.id === targetPropId ? { ...p, availableBeds: avail } : p);

      return {
        ...prev,
        beds: nextBeds,
        properties: nextProps
      };
    });
  };

  // Add Room with auto beds
  const handleAddRoom = (newRoom: Omit<Room, 'id'>, bedCount: number) => {
    setState(prev => {
      const roomId = `room-${Date.now()}`;
      const createdRoom: Room = { ...newRoom, id: roomId };

      const createdBeds: Bed[] = Array.from({ length: bedCount }, (_, i) => ({
        id: `bed-${roomId}-${i + 1}`,
        roomId,
        propertyId: newRoom.propertyId,
        bedLabel: bedCount === 1 ? 'Single Bed' : `Bed ${String.fromCharCode(65 + i)}`,
        status: 'available'
      }));

      const nextRooms = [...prev.rooms, createdRoom];
      const nextBeds = [...prev.beds, ...createdBeds];

      const nextProps = prev.properties.map(p => {
        if (p.id !== newRoom.propertyId) return p;
        return {
          ...p,
          totalBeds: p.totalBeds + bedCount,
          availableBeds: p.availableBeds + bedCount
        };
      });

      return {
        ...prev,
        rooms: nextRooms,
        beds: nextBeds,
        properties: nextProps
      };
    });
  };

  // Update Property details
  const handleUpdateProperty = (updated: Property) => {
    setState(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === updated.id ? updated : p)
    }));
  };

  // Update Lead status
  const handleUpdateLeadStatus = (leadId: string, status: Lead['status'], extra?: Partial<Lead>) => {
    setState(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === leadId ? { ...l, status, ...extra } : l)
    }));
  };

  // Convert Lead to Tenant
  const handleConvertLeadToTenant = (
    lead: Lead,
    roomId: string,
    bedId: string,
    rent: number,
    deposit: number
  ) => {
    setState(prev => {
      const targetRoom = prev.rooms.find(r => r.id === roomId);
      const targetBed = prev.beds.find(b => b.id === bedId);
      const tenantId = `tenant-${Date.now()}`;

      const newTenant: Tenant = {
        id: tenantId,
        propertyId: lead.propertyId,
        roomId,
        bedId,
        roomNumber: targetRoom?.roomNumber || '101',
        bedLabel: targetBed?.bedLabel || 'Bed A',
        fullName: lead.renterName,
        phone: lead.renterPhone,
        emergencyPhone: '',
        collegeOrWork: lead.lookingFor,
        idProofType: 'Aadhaar',
        idProofNumber: 'Submitted',
        checkInDate: new Date().toISOString().split('T')[0],
        monthlyRent: rent,
        depositPaid: deposit,
        status: 'active',
        policeVerificationStatus: 'submitted'
      };

      const nextBeds = prev.beds.map(b => b.id === bedId ? {
        ...b,
        status: 'occupied' as Bed['status'],
        tenantId,
        tenantName: lead.renterName
      } : b);

      const nextLeads = prev.leads.map(l => l.id === lead.id ? { ...l, status: 'booked' as Lead['status'] } : l);

      const newRent: RentRecord = {
        id: `rent-${Date.now()}`,
        tenantId,
        tenantName: lead.renterName,
        propertyId: lead.propertyId,
        propertyName: lead.propertyName,
        roomNumber: targetRoom?.roomNumber || '101',
        month: 'October 2026',
        baseRent: rent,
        wifiAmount: 150,
        foodAmount: 0,
        otherAmount: 0,
        totalAmount: rent + 150,
        status: 'pending',
        dueDate: '2026-10-05'
      };

      const nextProps = prev.properties.map(p => {
        if (p.id !== lead.propertyId) return p;
        return {
          ...p,
          availableBeds: Math.max(0, p.availableBeds - 1)
        };
      });

      return {
        ...prev,
        tenants: [...prev.tenants, newTenant],
        beds: nextBeds,
        leads: nextLeads,
        rentRecords: [...prev.rentRecords, newRent],
        properties: nextProps
      };
    });
  };

  // Add Walk-in inquiry or Tenant inquiry
  const handleAddNewLead = (newLead: Omit<Lead, 'id' | 'createdAt'>) => {
    syncLeadToSupabase(newLead);
    setState(prev => ({
      ...prev,
      leads: [
        {
          ...newLead,
          id: `lead-${Date.now()}`,
          createdAt: new Date().toISOString()
        },
        ...prev.leads
      ]
    }));
  };

  // Add Direct Tenant
  const handleAddTenant = (newTenant: Omit<Tenant, 'id'>) => {
    setState(prev => {
      const tenantId = `tenant-${Date.now()}`;
      const tenant: Tenant = { ...newTenant, id: tenantId };

      const nextBeds = prev.beds.map(b => b.id === newTenant.bedId ? {
        ...b,
        status: 'occupied' as Bed['status'],
        tenantId,
        tenantName: newTenant.fullName
      } : b);

      const rentRec: RentRecord = {
        id: `rent-${Date.now()}`,
        tenantId,
        tenantName: newTenant.fullName,
        propertyId: newTenant.propertyId,
        propertyName: prev.properties.find(p => p.id === newTenant.propertyId)?.name || activeProperty?.name || 'Property',
        roomNumber: newTenant.roomNumber,
        month: 'October 2026',
        baseRent: newTenant.monthlyRent,
        wifiAmount: 150,
        foodAmount: 0,
        otherAmount: 0,
        totalAmount: newTenant.monthlyRent + 150,
        status: 'pending',
        dueDate: '2026-10-05'
      };

      const nextProps = prev.properties.map(p => p.id === newTenant.propertyId ? {
        ...p,
        availableBeds: Math.max(0, p.availableBeds - 1)
      } : p);

      return {
        ...prev,
        tenants: [...prev.tenants, tenant],
        beds: nextBeds,
        rentRecords: [...prev.rentRecords, rentRec],
        properties: nextProps
      };
    });
  };

  // Vacate Tenant & free bed
  const handleVacateTenant = (tenantId: string, bedId?: string) => {
    setState(prev => {
      const nextTenants = prev.tenants.map(t => t.id === tenantId ? { ...t, status: 'vacated' as Tenant['status'] } : t);
      
      const nextBeds = prev.beds.map(b => {
        if (b.id === bedId || b.tenantId === tenantId) {
          return {
            ...b,
            status: 'available' as Bed['status'],
            tenantId: undefined,
            tenantName: undefined
          };
        }
        return b;
      });

      const targetTenant = prev.tenants.find(t => t.id === tenantId);
      const propId = targetTenant?.propertyId || activeProperty?.id;
      const nextProps = prev.properties.map(p => p.id === propId ? {
        ...p,
        availableBeds: p.availableBeds + 1
      } : p);

      return {
        ...prev,
        tenants: nextTenants,
        beds: nextBeds,
        properties: nextProps
      };
    });
  };

  // Record Rent
  const handleRecordRentPayment = (record: Omit<RentRecord, 'id'>) => {
    setState(prev => ({
      ...prev,
      rentRecords: [...prev.rentRecords, { ...record, id: `rent-${Date.now()}` }]
    }));
  };

  // Update Payment Status
  const handleUpdatePaymentStatus = (
    recordId: string, 
    status: RentRecord['status'], 
    method?: RentRecord['paymentMethod'], 
    ref?: string
  ) => {
    setState(prev => ({
      ...prev,
      rentRecords: prev.rentRecords.map(r => r.id === recordId ? {
        ...r,
        status,
        paymentMethod: method || r.paymentMethod,
        transactionRef: ref || r.transactionRef,
        paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : r.paidDate
      } : r)
    }));
  };

  // Complaints
  const handleUpdateComplaintStatus = (id: string, status: Complaint['status'], note?: string) => {
    setState(prev => ({
      ...prev,
      complaints: prev.complaints.map(c => c.id === id ? {
        ...c,
        status,
        adminNote: note || c.adminNote,
        resolvedAt: status === 'resolved' ? new Date().toISOString() : c.resolvedAt
      } : c)
    }));
  };

  const handleAddComplaint = (comp: Omit<Complaint, 'id' | 'createdAt'>) => {
    syncComplaintToSupabase(comp);
    setState(prev => ({
      ...prev,
      complaints: [
        {
          ...comp,
          id: `comp-${Date.now()}`,
          createdAt: new Date().toISOString()
        },
        ...prev.complaints
      ]
    }));
  };

  // Add Property
  const handleAddProperty = (prop: Omit<Property, 'id' | 'createdAt'>, initialRooms: number) => {
    const propId = `prop-${Date.now()}`;
    const newProperty: Property = {
      ...prop,
      id: propId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const newRooms: Room[] = Array.from({ length: initialRooms }, (_, i) => ({
      id: `room-${propId}-${i + 1}`,
      propertyId: propId,
      roomNumber: `${101 + i}`,
      floor: 1,
      roomType: '2 Sharing',
      totalBeds: 2,
      baseRent: prop.baseRent
    }));

    const newBeds: Bed[] = newRooms.flatMap(r => [
      { id: `bed-${r.id}-a`, roomId: r.id, propertyId: propId, bedLabel: 'Bed A', status: 'available' as Bed['status'] },
      { id: `bed-${r.id}-b`, roomId: r.id, propertyId: propId, bedLabel: 'Bed B', status: 'available' as Bed['status'] }
    ]);

    syncPropertyToSupabase(newProperty, newRooms, newBeds);

    setState(prev => ({
      ...prev,
      properties: [...prev.properties, newProperty],
      rooms: [...prev.rooms, ...newRooms],
      beds: [...prev.beds, ...newBeds],
      activePropertyId: propId
    }));
  };

  // Save / Bookmark toggle
  const handleToggleSave = (propId: string) => {
    setState(prev => {
      const exists = prev.savedPropertyIds.includes(propId);
      const next = exists ? prev.savedPropertyIds.filter(id => id !== propId) : [...prev.savedPropertyIds, propId];
      return { ...prev, savedPropertyIds: next };
    });
  };

  // Profile updates
  const handleUpdateProfile = (profile: OwnerProfile) => {
    setState(prev => ({ ...prev, profile }));
  };

  const handleUpdateTenantProfile = (tenantProfile: TenantProfile) => {
    setState(prev => ({ ...prev, tenantProfile }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16 lg:pb-0">
      
      {/* Top Navbar with Role Switcher */}
      <Navbar
        currentRole={state.currentRole}
        onSelectRole={handleSelectRole}
        profile={state.profile}
        tenantProfile={state.tenantProfile}
        properties={state.properties}
        activePropertyId={state.activePropertyId}
        onSelectProperty={id => setState(p => ({ ...p, activePropertyId: id }))}
        onOpenAddProperty={() => setShowAddPropertyModal(true)}
        language={language}
        onToggleLanguage={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
        unreadCount={totalUnreadCount}
        onOpenProfile={() => setShowAuthModal(true)}
      />

      {/* Main App Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Role-Aware Sidebar */}
        <Sidebar
          currentRole={state.currentRole}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          language={language}
          leadsCount={leadsCount}
          dueRentsCount={dueRentsCount}
          openComplaintsCount={openComplaintsCount}
          savedCount={savedCount}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          
          {/* OWNER VIEWS */}
          {state.currentRole === 'owner' && (
            <>
              {!activeProperty && currentTab !== 'settings' ? (
                <div className="bg-white rounded-2xl border border-dashed border-emerald-300 p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to RoomSaathi Host Portal</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    You haven't added any properties yet. List your PG, hostel, or flat to start managing rooms, tracking leads, onboarding tenants, and collecting rent automatically.
                  </p>
                  <button
                    onClick={() => setShowAddPropertyModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Plus size={18} />
                    Add Your First Property
                  </button>
                </div>
              ) : (
                <>
                  {currentTab === 'dashboard' && (
                    <OverviewView
                      property={activeProperty}
                      rooms={state.rooms}
                      beds={state.beds}
                      tenants={state.tenants}
                      leads={state.leads}
                      rentRecords={state.rentRecords}
                      complaints={state.complaints}
                      language={language}
                      onNavigateTab={setCurrentTab}
                      onToggleBedStatus={handleToggleBedStatus}
                      onOpenQuickRent={() => setCurrentTab('billing')}
                      onOpenMeterCalc={() => setCurrentTab('billing')}
                      onOpenAddProperty={() => setShowAddPropertyModal(true)}
                    />
                  )}

              {currentTab === 'rooms' && (
                <RoomsBedsView
                  property={activeProperty}
                  rooms={state.rooms}
                  beds={state.beds}
                  language={language}
                  onToggleBedStatus={handleToggleBedStatus}
                  onAddRoom={handleAddRoom}
                  onUpdateProperty={handleUpdateProperty}
                />
              )}

              {currentTab === 'leads' && (
                <LeadsView
                  property={activeProperty}
                  leads={state.leads}
                  beds={state.beds}
                  rooms={state.rooms}
                  language={language}
                  onUpdateLeadStatus={handleUpdateLeadStatus}
                  onConvertLeadToTenant={handleConvertLeadToTenant}
                  onAddNewLead={handleAddNewLead}
                />
              )}

              {currentTab === 'tenants' && (
                <TenantsView
                  property={activeProperty}
                  tenants={state.tenants}
                  rooms={state.rooms}
                  beds={state.beds}
                  language={language}
                  onAddTenant={handleAddTenant}
                  onVacateTenant={handleVacateTenant}
                />
              )}

              {currentTab === 'billing' && (
                <BillingView
                  property={activeProperty}
                  profile={state.profile}
                  rentRecords={state.rentRecords}
                  tenants={state.tenants}
                  rooms={state.rooms}
                  language={language}
                  onRecordRentPayment={handleRecordRentPayment}
                  onUpdatePaymentStatus={handleUpdatePaymentStatus}
                  onViewReceipt={setSelectedReceiptRecord}
                />
              )}

              {currentTab === 'complaints' && (
                <ComplaintsView
                  property={activeProperty}
                  complaints={state.complaints}
                  language={language}
                  onUpdateComplaintStatus={handleUpdateComplaintStatus}
                  onAddComplaint={handleAddComplaint}
                />
              )}
                </>
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  profile={state.profile}
                  language={language}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
            </>
          )}

          {/* TENANT VIEWS */}
          {state.currentRole === 'tenant' && (
            <>
              {currentTab === 'explore' && (
                <TenantExploreView
                  properties={state.properties}
                  rooms={state.rooms}
                  beds={state.beds}
                  savedPropertyIds={state.savedPropertyIds}
                  language={language}
                  onSelectProperty={setSelectedTenantProperty}
                  onToggleSave={handleToggleSave}
                />
              )}

              {currentTab === 'mystay' && (
                <TenantMyStayView
                  tenantProfile={state.tenantProfile}
                  property={activeProperty}
                  rentRecords={state.rentRecords}
                  complaints={state.complaints}
                  language={language}
                  onViewReceipt={setSelectedReceiptRecord}
                  onSubmitComplaint={handleAddComplaint}
                />
              )}

              {currentTab === 'myinquiries' && (
                <TenantInquiriesView
                  leads={state.leads}
                  properties={state.properties}
                  tenantPhone={state.tenantProfile.phone}
                />
              )}

              {currentTab === 'saved' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Saved Rooms & PGs (पसंदीदा)</h1>
                    <p className="text-xs text-slate-500 mt-1">Properties you have bookmarked for comparison.</p>
                  </div>
                  <TenantExploreView
                    properties={state.properties.filter(p => state.savedPropertyIds.includes(p.id))}
                    rooms={state.rooms}
                    beds={state.beds}
                    savedPropertyIds={state.savedPropertyIds}
                    language={language}
                    onSelectProperty={setSelectedTenantProperty}
                    onToggleSave={handleToggleSave}
                  />
                </div>
              )}

              {currentTab === 'complaints' && (
                <TenantMyStayView
                  tenantProfile={state.tenantProfile}
                  property={activeProperty}
                  rentRecords={state.rentRecords}
                  complaints={state.complaints}
                  language={language}
                  onViewReceipt={setSelectedReceiptRecord}
                  onSubmitComplaint={handleAddComplaint}
                />
              )}
            </>
          )}

        </main>

      </div>

      {/* MODALS */}
      {showAddPropertyModal && (
        <AddPropertyModal
          onClose={() => setShowAddPropertyModal(false)}
          onAddProperty={handleAddProperty}
        />
      )}

      {showAuthModal && (
        <AuthModal
          currentRole={state.currentRole}
          onSelectRole={handleSelectRole}
          profile={state.profile}
          tenantProfile={state.tenantProfile}
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onUpdateProfile={handleUpdateProfile}
          onUpdateTenantProfile={handleUpdateTenantProfile}
        />
      )}

      {selectedReceiptRecord && (
        <ReceiptModal
          record={selectedReceiptRecord}
          property={activeProperty}
          profile={state.profile}
          onClose={() => setSelectedReceiptRecord(null)}
        />
      )}

      {selectedTenantProperty && (
        <TenantRoomDetailModal
          property={selectedTenantProperty}
          rooms={state.rooms}
          beds={state.beds}
          onClose={() => setSelectedTenantProperty(null)}
          onSubmitInquiry={handleAddNewLead}
        />
      )}

    </div>
  );
}

export default App;
