import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  IndianRupee, 
  ShieldCheck, 
  Heart, 
  Share2, 
  SlidersHorizontal, 
  ArrowRight, 
  GraduationCap, 
  Building2, 
  Check, 
  Sparkles
} from 'lucide-react';
import { Property, Room, Bed, Language } from '../../types';

interface TenantExploreViewProps {
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  savedPropertyIds: string[];
  language: Language;
  onSelectProperty: (property: Property) => void;
  onToggleSave: (propertyId: string) => void;
}

export const TenantExploreView: React.FC<TenantExploreViewProps> = ({
  properties,
  rooms,
  beds,
  savedPropertyIds,
  language,
  onSelectProperty,
  onToggleSave
}) => {
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [maxBudget, setMaxBudget] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick destinations in Samastipur
  const destinations = ['All', 'Near ABC College', 'Station Road', 'Magadh Colony', 'Railway Junction'];

  // Filter properties
  const filteredProperties = properties.filter(p => {
    if (!p.isActive) return false;
    if (selectedDestination !== 'All' && !p.landmark.toLowerCase().includes(selectedDestination.toLowerCase()) && !p.area.toLowerCase().includes(selectedDestination.toLowerCase())) {
      return false;
    }
    if (maxBudget !== 'all' && p.baseRent > maxBudget) return false;
    if (selectedType !== 'All' && p.type !== selectedType) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.area.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const openWhatsAppDirect = (e: React.MouseEvent, prop: Property) => {
    e.stopPropagation();
    const text = `नमस्ते, मुझे RoomSaathi पर आपकी लिस्टिंग "${prop.name}" पसंद आई। क्या कमरा उपलब्ध है?`;
    window.open(`https://wa.me/919835044219?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Search Section */}
      <div className="bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            SAMASTIPUR, BIHAR · अपने बजट में, कॉलेज के पास
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find Your Room with <span className="text-emerald-300">100% Cost Transparency</span>
          </h1>

          <p className="text-emerald-100/80 text-xs sm:text-sm">
            Know the exact rent, sub-meter electricity, WiFi, and mess charges before visiting. Zero brokerage.
          </p>

          {/* Quick Destination Pills */}
          <div className="pt-2 flex flex-wrap gap-2">
            {destinations.map(dest => (
              <button
                key={dest}
                onClick={() => setSelectedDestination(dest)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedDestination === dest
                    ? 'bg-emerald-300 text-emerald-950 shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {dest === 'All' ? 'All Localities' : dest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Text search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by PG name, college, or street..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Budget filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold text-slate-600">
            <span className="text-slate-400 text-[11px] whitespace-nowrap hidden sm:inline">Budget:</span>
            {[
              { label: 'Any', value: 'all' },
              { label: 'Under ₹4.5k', value: 4500 },
              { label: 'Under ₹6k', value: 6000 },
              { label: 'Under ₹8k', value: 8000 }
            ].map(b => (
              <button
                key={b.label}
                onClick={() => setMaxBudget(b.value as any)}
                className={`px-2.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                  maxBudget === b.value
                    ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Properties Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <b>{filteredProperties.length}</b> verified rooms & PGs in Samastipur</span>
        <span className="text-emerald-700 font-semibold">Zero Brokerage Verified</span>
      </div>

      {/* Properties Cards Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-emerald-300 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Building2 size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No rooms found</h3>
          <p className="text-xs text-slate-500 mb-4">
            {properties.length === 0 
              ? "No rooms are listed yet in Samastipur. Check back soon or switch to Host mode to list your property!"
              : "Try adjusting your budget or destination filters to find available rooms."}
          </p>
          {(selectedDestination !== 'All' || maxBudget !== 'all' || selectedType !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDestination('All');
                setMaxBudget('all');
                setSelectedType('All');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map(prop => {
          const isSaved = savedPropertyIds.includes(prop.id);
          const propBeds = beds.filter(b => b.propertyId === prop.id);
          const vacantCount = propBeds.filter(b => b.status === 'available').length;
          const totalEstimatedMonthly = prop.baseRent + prop.wifiCost + prop.maintenance + (prop.foodIncluded ? 0 : 0);

          return (
            <div
              key={prop.id}
              onClick={() => onSelectProperty(prop)}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={prop.image}
                    alt={prop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                      {prop.type}
                    </span>
                    <span className="text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-800 px-2.5 py-0.5 rounded-full shadow-xs">
                      0 Brokerage
                    </span>
                  </div>

                  {/* Save Bookmark button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(prop.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full transition shadow-xs ${
                      isSaved ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-slate-600 hover:text-rose-600'
                    }`}
                  >
                    <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
                  </button>

                  {/* Bottom overlay: Location */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-xs font-semibold flex items-center gap-1">
                      <MapPin size={13} className="text-emerald-400 shrink-0" />
                      <span className="truncate">{prop.area} · Near {prop.landmark}</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition">
                      {prop.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{prop.address}</p>
                  </div>

                  {/* Transparent Cost Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Rent / bed:</span>
                      <span className="font-extrabold text-base text-slate-900">
                        ₹{prop.baseRent.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-slate-500">/mo</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Deposit:</span>
                      <span className="font-bold text-slate-700">₹{prop.deposit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Bed vacancy status & amenities */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      vacantCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {vacantCount > 0 ? `🟢 ${vacantCount} Beds Available` : '🔴 Fully Booked'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {prop.foodAvailable ? '🍲 Mess Available' : 'No Food'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => openWhatsAppDirect(e, prop)}
                  className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
                  title="WhatsApp Owner"
                >
                  <Share2 size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectProperty(prop)}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>View Beds & Schedule Visit</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          );
        })}
        </div>
      )}

    </div>
  );
};
