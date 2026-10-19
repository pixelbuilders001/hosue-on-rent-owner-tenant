import React from 'react';
import { 
  Building2, 
  Users, 
  IndianRupee, 
  MessageSquare, 
  CalendarDays, 
  ArrowUpRight, 
  Plus, 
  Phone, 
  Share2, 
  AlertCircle, 
  Zap, 
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Property, Room, Bed, Tenant, Lead, RentRecord, Complaint, Language } from '../../types';
import { t } from '../../services/i18n';
import { TabType } from '../layout/Sidebar';

interface OverviewViewProps {
  property: Property;
  rooms: Room[];
  beds: Bed[];
  tenants: Tenant[];
  leads: Lead[];
  rentRecords: RentRecord[];
  complaints: Complaint[];
  language: Language;
  onNavigateTab: (tab: TabType) => void;
  onToggleBedStatus: (bedId: string) => void;
  onOpenQuickRent: () => void;
  onOpenMeterCalc: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  property,
  rooms,
  beds,
  tenants,
  leads,
  rentRecords,
  complaints,
  language,
  onNavigateTab,
  onToggleBedStatus,
  onOpenQuickRent,
  onOpenMeterCalc
}) => {
  // Filter items for the active property
  const propBeds = beds.filter(b => b.propertyId === property.id);
  const occupiedCount = propBeds.filter(b => b.status === 'occupied').length;
  const availableCount = propBeds.filter(b => b.status === 'available').length;
  const reservedCount = propBeds.filter(b => b.status === 'reserved').length;
  const totalBeds = propBeds.length || property.totalBeds;
  const occupancyPct = totalBeds > 0 ? Math.round((occupiedCount / totalBeds) * 100) : 0;

  const propRents = rentRecords.filter(r => r.propertyId === property.id);
  const collectedRent = propRents
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.totalAmount, 0);
  const pendingRent = propRents
    .filter(r => r.status === 'pending' || r.status === 'overdue')
    .reduce((sum, r) => sum + r.totalAmount, 0);
  const overdueCount = propRents.filter(r => r.status === 'overdue').length;

  const propLeads = leads.filter(l => l.propertyId === property.id);
  const newLeads = propLeads.filter(l => l.status === 'new');
  const scheduledVisits = propLeads.filter(l => l.status === 'visit_scheduled');

  const openComplaints = complaints.filter(c => c.propertyId === property.id && c.status !== 'resolved');

  // WhatsApp helper
  const openWhatsApp = (phone: string, text: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleaned.startsWith('91') ? cleaned : '91' + cleaned}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero Welcome */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl text-white p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {property.city} · {property.area}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {property.name}
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-xl">
              {property.address} ({property.landmark})
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <button
              onClick={onOpenMeterCalc}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-medium border border-emerald-600/60 shadow-sm transition"
            >
              <Zap size={16} className="text-amber-300" />
              <span>{t(language, 'calculateMeter')}</span>
            </button>
            <button
              onClick={onOpenQuickRent}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-semibold shadow-md transition"
            >
              <IndianRupee size={16} className="text-emerald-700" />
              <span>{t(language, 'recordRent')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Occupancy Card */}
        <div 
          onClick={() => onNavigateTab('rooms')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t(language, 'occupancyRate')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition">
              <Building2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{occupancyPct}%</span>
            <span className="text-xs text-slate-500 font-medium">({occupiedCount}/{totalBeds} beds)</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
            <div style={{ width: `${occupancyPct}%` }} className="bg-emerald-600 h-full rounded-full" />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-700 font-semibold">{availableCount} Beds Free</span>
            <span>{reservedCount > 0 ? `${reservedCount} Reserved` : '0 Reserved'}</span>
          </div>
        </div>

        {/* Collection Card */}
        <div 
          onClick={() => onNavigateTab('billing')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t(language, 'totalRevenue')}</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ₹{collectedRent.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
              ₹{pendingRent.toLocaleString('en-IN')} Pending
            </span>
            {overdueCount > 0 && (
              <span className="text-rose-600 font-semibold text-[11px] flex items-center gap-1">
                <AlertCircle size={12} /> {overdueCount} Overdue
              </span>
            )}
          </div>
        </div>

        {/* New Leads Card */}
        <div 
          onClick={() => onNavigateTab('leads')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t(language, 'newLeads')}</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{newLeads.length}</span>
            <span className="text-xs text-blue-700 font-medium">Active Inquiries</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">
            {newLeads[0] ? `Latest: ${newLeads[0].renterName}` : 'All inquiries addressed'}
          </p>
        </div>

        {/* Visits Card */}
        <div 
          onClick={() => onNavigateTab('leads')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t(language, 'scheduledVisits')}</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 transition">
              <CalendarDays size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{scheduledVisits.length}</span>
            <span className="text-xs text-indigo-700 font-medium">Scheduled</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">
            {scheduledVisits[0] ? `${scheduledVisits[0].visitTime || 'Today'} · ${scheduledVisits[0].renterName}` : 'No visits today'}
          </p>
        </div>

      </div>

      {/* Urgent Attention / Action Items */}
      {(overdueCount > 0 || openComplaints.length > 0 || scheduledVisits.length > 0) && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <span>Attention Needed Today ({overdueCount + openComplaints.length + scheduledVisits.length} Items)</span>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Overdue Rent item */}
            {overdueCount > 0 && (
              <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{overdueCount} Rent Payment Overdue</div>
                  <div className="text-[11px] text-slate-500">Send WhatsApp reminder to tenants</div>
                </div>
                <button
                  onClick={() => onNavigateTab('billing')}
                  className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                >
                  View
                </button>
              </div>
            )}

            {/* Visit item */}
            {scheduledVisits.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Visit: {scheduledVisits[0].renterName}</div>
                  <div className="text-[11px] text-slate-500">{scheduledVisits[0].visitTime || 'Today'} · Looking for {scheduledVisits[0].lookingFor}</div>
                </div>
                <button
                  onClick={() => openWhatsApp(
                    scheduledVisits[0].renterPhone, 
                    `नमस्ते ${scheduledVisits[0].renterName} जी, ${property.name} पर आपकी विज़िट का स्वागत है। लोकेशन: ${property.address} (${property.landmark})`
                  )}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1"
                >
                  <Share2 size={12} /> Map Link
                </button>
              </div>
            )}

            {/* Complaint item */}
            {openComplaints.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Room {openComplaints[0].roomNumber}: {openComplaints[0].title}</div>
                  <div className="text-[11px] text-slate-500">Reported by {openComplaints[0].tenantName}</div>
                </div>
                <button
                  onClick={() => onNavigateTab('complaints')}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Resolve
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Two Column Section: Live Bed Matrix & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Bed Availability Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Live Bed Matrix</span>
                <span className="text-xs font-normal text-slate-500">(1-Tap Status Switch)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tap any bed to quickly toggle between Available, Occupied, and Reserved
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('rooms')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Manage Rooms <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Bed Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs mb-4 pb-3 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available ({availableCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Occupied ({occupiedCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reserved ({reservedCount})
            </span>
          </div>

          {/* Rooms Grid */}
          <div className="space-y-3">
            {rooms.filter(r => r.propertyId === property.id).map(room => {
              const roomBeds = propBeds.filter(b => b.roomId === room.id);
              return (
                <div key={room.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Room {room.roomNumber}</span>
                      <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {room.roomType}
                      </span>
                      <span className="text-xs font-semibold text-emerald-800">
                        ₹{room.baseRent.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Floor {room.floor}</div>
                  </div>

                  {/* Beds in Room */}
                  <div className="flex flex-wrap gap-2">
                    {roomBeds.map(bed => {
                      const isOccupied = bed.status === 'occupied';
                      const isAvailable = bed.status === 'available';
                      const isReserved = bed.status === 'reserved';
                      return (
                        <button
                          key={bed.id}
                          onClick={() => onToggleBedStatus(bed.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                            isAvailable
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                              : isOccupied
                              ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                              : isReserved
                              ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                              : 'bg-slate-100 border-slate-300 text-slate-600'
                          }`}
                          title={`Click to change status (Currently: ${bed.status})`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAvailable ? 'bg-emerald-500' : isOccupied ? 'bg-blue-600' : isReserved ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{bed.bedLabel}</span>
                          {bed.tenantName && (
                            <span className="text-[10px] text-blue-700/80 font-normal">({bed.tenantName.split(' ')[0]})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Recent Inquiries / Leads */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Leads</h2>
              <p className="text-xs text-slate-500">Student & tenant inquiries</p>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              All Leads →
            </button>
          </div>

          <div className="space-y-3 mt-2 flex-1">
            {propLeads.slice(0, 4).map(lead => (
              <div key={lead.id} className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{lead.renterName}</div>
                    <div className="text-[11px] text-slate-500">{lead.lookingFor}</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    ₹{lead.budget.toLocaleString('en-IN')}
                  </span>
                </div>
                
                {lead.destination && (
                  <div className="text-[10px] text-slate-500 mt-1">📍 Near {lead.destination}</div>
                )}

                {/* Instant Actions */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    lead.status === 'new' ? 'bg-blue-100 text-blue-800' : lead.status === 'visit_scheduled' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {lead.status.replace('_', ' ')}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openWhatsApp(
                        lead.renterPhone,
                        `नमस्ते ${lead.renterName} जी, मुझे RoomSaathi पर ${property.name} के लिए आपकी पूछताछ मिली। क्या आप बात करने के लिए उपलब्ध हैं?`
                      )}
                      className="px-2 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1 shadow-xs"
                    >
                      <Share2 size={11} /> WhatsApp
                    </button>
                    <a
                      href={`tel:${lead.renterPhone}`}
                      className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                      title="Direct Call"
                    >
                      <Phone size={13} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('leads')}
            className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            View All Inquiries ({propLeads.length})
          </button>
        </div>

      </div>

    </div>
  );
};
