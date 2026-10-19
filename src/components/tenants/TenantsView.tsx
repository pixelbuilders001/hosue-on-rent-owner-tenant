import React, { useState } from 'react';
import { 
  Users, 
  Phone, 
  Share2, 
  Plus, 
  ShieldCheck, 
  LogOut, 
  Calendar, 
  Building2, 
  Search, 
  X, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Property, Tenant, Room, Bed, Language } from '../../types';
import { t } from '../../services/i18n';

interface TenantsViewProps {
  property: Property;
  tenants: Tenant[];
  rooms: Room[];
  beds: Bed[];
  language: Language;
  onAddTenant: (tenant: Omit<Tenant, 'id'>) => void;
  onVacateTenant: (tenantId: string, bedId?: string, refundAmount?: number) => void;
}

export const TenantsView: React.FC<TenantsViewProps> = ({
  property,
  tenants,
  rooms,
  beds,
  language,
  onAddTenant,
  onVacateTenant
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [vacateTarget, setVacateTarget] = useState<Tenant | null>(null);
  const [depositRefund, setDepositRefund] = useState(4000);
  const [deductions, setDeductions] = useState(0);

  // New Tenant Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [collegeOrWork, setCollegeOrWork] = useState('');
  const [idProofType, setIdProofType] = useState<Tenant['idProofType']>('Aadhaar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [monthlyRent, setMonthlyRent] = useState(4000);
  const [depositPaid, setDepositPaid] = useState(4000);
  const [selectedBedId, setSelectedBedId] = useState('');

  const propTenants = tenants.filter(t => t.propertyId === property.id && t.status !== 'vacated');
  const availableBeds = beds.filter(b => b.propertyId === property.id && b.status === 'available');

  const filteredTenants = propTenants.filter(t => 
    t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone.includes(searchQuery)
  );

  const openWhatsApp = (phoneNum: string, text: string) => {
    const cleaned = phoneNum.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleaned.startsWith('91') ? cleaned : '91' + cleaned}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !selectedBedId) return;

    const chosenBed = beds.find(b => b.id === selectedBedId);
    const chosenRoom = rooms.find(r => r.id === chosenBed?.roomId);

    onAddTenant({
      propertyId: property.id,
      roomId: chosenRoom?.id || '',
      bedId: chosenBed?.id,
      roomNumber: chosenRoom?.roomNumber || '101',
      bedLabel: chosenBed?.bedLabel || 'Bed A',
      fullName,
      phone,
      emergencyPhone,
      collegeOrWork,
      idProofType,
      idProofNumber,
      checkInDate: new Date().toISOString().split('T')[0],
      monthlyRent: Number(monthlyRent),
      depositPaid: Number(depositPaid),
      status: 'active',
      policeVerificationStatus: 'submitted'
    });

    setFullName('');
    setPhone('');
    setEmergencyPhone('');
    setCollegeOrWork('');
    setIdProofNumber('');
    setShowAddTenantModal(false);
  };

  const handleVacateConfirm = () => {
    if (!vacateTarget) return;
    const finalRefund = Math.max(0, (vacateTarget.depositPaid || 0) - deductions);
    onVacateTenant(vacateTarget.id, vacateTarget.bedId, finalRefund);
    setVacateTarget(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tenants & Digital Khata (किरायेदार रजिस्टर)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {propTenants.length} Active residents · Track emergency contacts, ID documents, and move-out settlements.
          </p>
        </div>

        <button
          onClick={() => {
            if (availableBeds.length > 0) {
              setSelectedBedId(availableBeds[0].id);
            }
            setShowAddTenantModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus size={16} />
          <span>Add New Tenant</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search tenant by name, room number, or mobile number..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Tenant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTenants.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No tenants found matching your search.
          </div>
        ) : (
          filteredTenants.map(tenant => (
            <div 
              key={tenant.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div>
                {/* Top: Name & Room Assignment */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {tenant.fullName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100">
                        Room {tenant.roomNumber} ({tenant.bedLabel || 'Bed'})
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-slate-900">
                    ₹{tenant.monthlyRent.toLocaleString('en-IN')}<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                  </span>
                </div>

                {/* Details list */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Occupation / College:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{tenant.collegeOrWork || 'Student'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mobile (WhatsApp):</span>
                    <span className="font-medium text-slate-800">{tenant.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Emergency / Parent:</span>
                    <span className="font-medium text-slate-800">{tenant.emergencyPhone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ID Verification:</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <ShieldCheck size={13} /> {tenant.idProofType} ({tenant.policeVerificationStatus})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Security Deposit:</span>
                    <span className="font-semibold text-slate-800">₹{tenant.depositPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Joined:</span>
                    <span>{tenant.checkInDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openWhatsApp(
                      tenant.phone,
                      `नमस्ते ${tenant.fullName} जी, मैं ${property.name} से बात कर रहा हूँ।`
                    )}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                    title="WhatsApp Tenant"
                  >
                    <Share2 size={14} />
                  </button>
                  <a
                    href={`tel:${tenant.phone}`}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    title="Direct Call"
                  >
                    <Phone size={14} />
                  </a>
                  {tenant.emergencyPhone && (
                    <a
                      href={`tel:${tenant.emergencyPhone}`}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition text-[11px] font-semibold"
                      title="Call Parent / Emergency"
                    >
                      Parent
                    </a>
                  )}
                </div>

                {/* Move Out / Vacate button */}
                <button
                  onClick={() => {
                    setVacateTarget(tenant);
                    setDepositRefund(tenant.depositPaid);
                    setDeductions(0);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition flex items-center gap-1"
                >
                  <LogOut size={13} />
                  <span>Vacate / Settle</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Vacate / Deposit Settlement Modal */}
      {vacateTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Vacate Tenant & Deposit Refund</h3>
              <button onClick={() => setVacateTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                Settling account for <b>{vacateTarget.fullName}</b> (Room {vacateTarget.roomNumber})
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600">Original Security Deposit:</span>
                <span className="font-bold text-slate-900">₹{vacateTarget.depositPaid.toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deductions (Damages, Pending Bills) ₹</label>
                <input
                  type="number"
                  min={0}
                  value={deductions}
                  onChange={e => setDeductions(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span className="font-bold text-emerald-900">Final Refund to Tenant:</span>
                <span className="text-base font-extrabold text-emerald-800">
                  ₹{Math.max(0, vacateTarget.depositPaid - deductions).toLocaleString('en-IN')}
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                * Confirming will mark this tenant as vacated and immediately free up Bed {vacateTarget.bedLabel} for new student inquiries.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVacateTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVacateConfirm}
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                >
                  Confirm Check-out & Free Bed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Tenant Modal */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Resident to Khata</h3>
              <button onClick={() => setShowAddTenantModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9835012345"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent / Emergency Contact</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9431200000"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">College or Workplace</label>
                <input
                  type="text"
                  placeholder="e.g. ABC College B.Sc 1st Year"
                  value={collegeOrWork}
                  onChange={e => setCollegeOrWork(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Vacant Bed</label>
                {availableBeds.length === 0 ? (
                  <div className="text-rose-600 font-semibold p-2 bg-rose-50 rounded-lg">
                    No vacant beds in this property! Add a bed or toggle a bed to available first.
                  </div>
                ) : (
                  <select
                    value={selectedBedId}
                    onChange={e => setSelectedBedId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                    required
                  >
                    {availableBeds.map(b => {
                      const rm = rooms.find(r => r.id === b.roomId);
                      return (
                        <option key={b.id} value={b.id}>
                          Room {rm?.roomNumber} — {b.bedLabel}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={e => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Security Deposit Paid (₹)</label>
                  <input
                    type="number"
                    value={depositPaid}
                    onChange={e => setDepositPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID Document Type</label>
                  <select
                    value={idProofType}
                    onChange={e => setIdProofType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option>Aadhaar</option>
                    <option>College ID</option>
                    <option>Voter ID</option>
                    <option>Driving License</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID Number (Last 4 digits or ID)</label>
                  <input
                    type="text"
                    placeholder="e.g. XXXX-4912"
                    value={idProofNumber}
                    onChange={e => setIdProofNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availableBeds.length === 0}
                  className="px-4 py-2 font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl shadow-xs"
                >
                  Save & Check-in Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
