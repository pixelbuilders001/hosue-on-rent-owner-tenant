import React, { useState } from 'react';
import { 
  MessageSquare, 
  Phone, 
  Share2, 
  Calendar, 
  UserCheck, 
  Check, 
  X, 
  Filter, 
  Clock, 
  Plus, 
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Property, Lead, Bed, Room, Language } from '../../types';
import { t } from '../../services/i18n';

interface LeadsViewProps {
  property: Property;
  leads: Lead[];
  beds: Bed[];
  rooms: Room[];
  language: Language;
  onUpdateLeadStatus: (leadId: string, status: Lead['status'], extra?: Partial<Lead>) => void;
  onConvertLeadToTenant: (lead: Lead, roomId: string, bedId: string, rent: number, deposit: number) => void;
  onAddNewLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  property,
  leads,
  beds,
  rooms,
  language,
  onUpdateLeadStatus,
  onConvertLeadToTenant,
  onAddNewLead
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'contacted' | 'visit_scheduled' | 'booked'>('all');
  const [selectedLeadForVisit, setSelectedLeadForVisit] = useState<Lead | null>(null);
  const [visitDate, setVisitDate] = useState('2026-10-20');
  const [visitTime, setVisitTime] = useState('04:30 PM');

  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [tenantRent, setTenantRent] = useState(4000);
  const [tenantDeposit, setTenantDeposit] = useState(4000);

  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newRenterName, setNewRenterName] = useState('');
  const [newRenterPhone, setNewRenterPhone] = useState('');
  const [newBudget, setNewBudget] = useState(4000);
  const [newLookingFor, setNewLookingFor] = useState('2 Sharing');
  const [newNotes, setNewNotes] = useState('');

  const propLeads = leads.filter(l => l.propertyId === property.id);
  const filteredLeads = activeTab === 'all'
    ? propLeads
    : propLeads.filter(l => l.status === activeTab);

  const availableBeds = beds.filter(b => b.propertyId === property.id && b.status === 'available');

  const openWhatsApp = (phone: string, text: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleaned.startsWith('91') ? cleaned : '91' + cleaned}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForVisit) return;

    onUpdateLeadStatus(selectedLeadForVisit.id, 'visit_scheduled', {
      visitDate,
      visitTime
    });

    const message = `नमस्ते ${selectedLeadForVisit.renterName} जी, ${property.name} पर आपकी विज़िट ${visitDate} को ${visitTime} बजे तय हो गई है।\nलोकेशन: ${property.address} (${property.landmark})\nकोई भी समस्या हो तो कृपया कॉल करें।`;
    openWhatsApp(selectedLeadForVisit.renterPhone, message);

    setSelectedLeadForVisit(null);
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertLead || !selectedRoomId || !selectedBedId) return;

    onConvertLeadToTenant(
      convertLead,
      selectedRoomId,
      selectedBedId,
      Number(tenantRent),
      Number(tenantDeposit)
    );

    setConvertLead(null);
  };

  const handleManualLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRenterName || !newRenterPhone) return;

    onAddNewLead({
      propertyId: property.id,
      propertyName: property.name,
      renterName: newRenterName,
      renterPhone: newRenterPhone,
      budget: Number(newBudget),
      lookingFor: newLookingFor,
      destination: property.area,
      status: 'new',
      notes: newNotes
    });

    setNewRenterName('');
    setNewRenterPhone('');
    setNewNotes('');
    setShowAddLeadModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tenant Inquiries & Leads (CRM)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            WhatsApp-first lead pipeline: Chat, schedule physical room visits, and onboard tenants with 1 click.
          </p>
        </div>

        <button
          onClick={() => setShowAddLeadModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus size={16} />
          <span>Add Walk-in Inquiry</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold text-slate-600">
        {[
          { id: 'all', label: 'All Inquiries', count: propLeads.length },
          { id: 'new', label: 'New / Uncontacted', count: propLeads.filter(l => l.status === 'new').length },
          { id: 'contacted', label: 'Call Done', count: propLeads.filter(l => l.status === 'contacted').length },
          { id: 'visit_scheduled', label: 'Visit Scheduled', count: propLeads.filter(l => l.status === 'visit_scheduled').length },
          { id: 'booked', label: 'Booked / Completed', count: propLeads.filter(l => l.status === 'booked').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No inquiries in this tab</h3>
            <p className="text-xs text-slate-400 mt-1">Inquiries from the RoomSaathi public app will appear here automatically.</p>
          </div>
        ) : (
          filteredLeads.map(lead => {
            const isVisit = lead.status === 'visit_scheduled';
            return (
              <div 
                key={lead.id} 
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{lead.renterName}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' : lead.status === 'visit_scheduled' ? 'bg-amber-100 text-amber-800' : lead.status === 'booked' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">· {new Date(lead.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="font-semibold text-emerald-800">Budget: ₹{lead.budget.toLocaleString('en-IN')}/mo</span>
                    <span>Looking for: <b>{lead.lookingFor}</b></span>
                    {lead.destination && <span>Near: <b>{lead.destination}</b></span>}
                  </div>

                  {lead.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 mt-1 inline-block">
                      📝 {lead.notes}
                    </p>
                  )}

                  {isVisit && lead.visitDate && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 w-fit mt-1">
                      <Clock size={13} />
                      <span>Visit Scheduled: {lead.visitDate} at {lead.visitTime || '4:00 PM'}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                  <button
                    onClick={() => openWhatsApp(
                      lead.renterPhone,
                      `नमस्ते ${lead.renterName} जी, मुझे RoomSaathi पर ${property.name} के लिए आपकी पूछताछ मिली। क्या आप कमरा देखने आना चाहते हैं?`
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    <Share2 size={13} />
                    <span>WhatsApp</span>
                  </button>

                  <a
                    href={`tel:${lead.renterPhone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
                  >
                    <Phone size={13} />
                    <span>Call</span>
                  </a>

                  {lead.status !== 'visit_scheduled' && lead.status !== 'booked' && (
                    <button
                      onClick={() => setSelectedLeadForVisit(lead)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition"
                    >
                      <Calendar size={13} />
                      <span>Schedule Visit</span>
                    </button>
                  )}

                  {lead.status !== 'booked' && (
                    <button
                      onClick={() => {
                        setConvertLead(lead);
                        setTenantRent(lead.budget || 4000);
                        setTenantDeposit(lead.budget || 4000);
                        if (availableBeds.length > 0) {
                          setSelectedBedId(availableBeds[0].id);
                          setSelectedRoomId(availableBeds[0].roomId);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-semibold transition"
                      title="Move directly into active tenants"
                    >
                      <UserCheck size={13} />
                      <span>Make Tenant</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedLeadForVisit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Schedule Physical Visit</h3>
              <button onClick={() => setSelectedLeadForVisit(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleVisit} className="space-y-4 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                Scheduling visit for <b>{selectedLeadForVisit.renterName}</b> ({selectedLeadForVisit.renterPhone})
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={e => setVisitDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 04:30 PM"
                  value={visitTime}
                  onChange={e => setVisitTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed">
                📍 Once confirmed, a WhatsApp message will automatically open with property address & landmark directions for the student.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForVisit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  Confirm & Send on WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {convertLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Onboard as Active Tenant</h3>
              <button onClick={() => setConvertLead(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConvertSubmit} className="space-y-4 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                Tenant: <b>{convertLead.renterName}</b> ({convertLead.renterPhone})
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Available Bed</label>
                {availableBeds.length === 0 ? (
                  <div className="text-xs text-rose-600 font-semibold p-2 bg-rose-50 rounded-lg">
                    No vacant beds available! Please mark a bed as available in the Rooms tab first.
                  </div>
                ) : (
                  <select
                    value={selectedBedId}
                    onChange={e => {
                      const bed = availableBeds.find(b => b.id === e.target.value);
                      if (bed) {
                        setSelectedBedId(bed.id);
                        setSelectedRoomId(bed.roomId);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {availableBeds.map(b => {
                      const rm = rooms.find(r => r.id === b.roomId);
                      return (
                        <option key={b.id} value={b.id}>
                          Room {rm?.roomNumber || 'Unknown'} — {b.bedLabel}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={tenantRent}
                    onChange={e => setTenantRent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deposit Collected (₹)</label>
                  <input
                    type="number"
                    value={tenantDeposit}
                    onChange={e => setTenantDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConvertLead(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availableBeds.length === 0}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl shadow-xs"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Walk-in Inquiry</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualLeadSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Renter / Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Jha"
                  value={newRenterName}
                  onChange={e => setNewRenterName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9835012345"
                  value={newRenterPhone}
                  onChange={e => setNewRenterPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Budget (₹/mo)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={e => setNewBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Looking for</label>
                  <select
                    value={newLookingFor}
                    onChange={e => setNewLookingFor(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option>Single Room</option>
                    <option>2 Sharing</option>
                    <option>3 Sharing</option>
                    <option>4 Sharing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Needs room from next Monday with food facility"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
