import React, { useState } from 'react';
import { Property, Room, Bed, Lead } from '../../types';
import { 
  X, 
  MapPin, 
  Bed as BedIcon, 
  ShieldCheck, 
  Check, 
  Share2, 
  Calendar, 
  Clock, 
  Utensils, 
  Wifi, 
  Zap, 
  Phone
} from 'lucide-react';

interface TenantRoomDetailModalProps {
  property: Property;
  rooms: Room[];
  beds: Bed[];
  onClose: () => void;
  onSubmitInquiry: (inquiry: Omit<Lead, 'id' | 'createdAt'>) => void;
}

export const TenantRoomDetailModal: React.FC<TenantRoomDetailModalProps> = ({
  property,
  rooms,
  beds,
  onClose,
  onSubmitInquiry
}) => {
  const [renterName, setRenterName] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [lookingFor, setLookingFor] = useState('2 Sharing Room');
  const [visitDate, setVisitDate] = useState('2026-10-21');
  const [visitTime, setVisitTime] = useState('04:30 PM');
  const [notes, setNotes] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const propRooms = rooms.filter(r => r.propertyId === property.id);
  const propBeds = beds.filter(b => b.propertyId === property.id);
  const availableBeds = propBeds.filter(b => b.status === 'available');

  const openWhatsApp = () => {
    const text = `नमस्ते, मुझे RoomSaathi पर आपकी प्रॉपर्टी "${property.name}" (${property.area}) पसंद आई। क्या मैं कमरा देखने आ सकता हूँ?`;
    const url = `https://wa.me/919835044219?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renterName || !renterPhone) return;

    onSubmitInquiry({
      propertyId: property.id,
      propertyName: property.name,
      renterName,
      renterPhone,
      budget: property.baseRent,
      lookingFor,
      destination: property.area,
      status: 'visit_scheduled',
      visitDate,
      visitTime,
      notes: notes || 'Student inquiry via RoomSaathi portal'
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Top Image Banner */}
        <div className="relative h-56 sm:h-64 bg-slate-100">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 px-2.5 py-0.5 rounded-full">
                {property.type}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" /> Owner Verified
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{property.name}</h2>
            <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
              <MapPin size={13} className="text-emerald-400 shrink-0" />
              <span>{property.address} ({property.landmark})</span>
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-16rem)] overflow-y-auto">
          
          {/* Transparent Cost Breakdown Box */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Zero Hidden Charges</span>
                <div className="text-lg font-black text-emerald-950 mt-0.5">
                  ₹{property.baseRent.toLocaleString('en-IN')}<span className="text-xs font-normal text-emerald-800">/bed/month</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold bg-white text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                  {availableBeds.length} Vacant Beds Left
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Deposit (Refundable):</span>
                <span className="font-bold text-slate-900">₹{property.deposit.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Electricity:</span>
                <span className="font-bold text-slate-900">
                  {property.electricityType === 'meter_unit' ? `₹${property.electricityRate}/unit sub-meter` : 'Included'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">WiFi / Maintenance:</span>
                <span className="font-bold text-slate-900">₹{(property.wifiCost + property.maintenance)}/mo</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Food / Mess:</span>
                <span className="font-bold text-slate-900">
                  {property.foodAvailable ? `Available (₹${property.foodCost})` : 'Self cooking'}
                </span>
              </div>
            </div>
          </div>

          {/* Available Beds & Rooms Overview */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Available Rooms & Beds</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {propRooms.map(rm => {
                const roomBeds = propBeds.filter(b => b.roomId === rm.id);
                const openCount = roomBeds.filter(b => b.status === 'available').length;
                return (
                  <div key={rm.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900">Room {rm.roomNumber} ({rm.roomType})</span>
                      <span className="font-semibold text-emerald-800">₹{rm.baseRent}/mo</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {roomBeds.map(b => (
                        <span
                          key={b.id}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            b.status === 'available'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-slate-200 text-slate-500 border-slate-300 line-through'
                          }`}
                        >
                          {b.bedLabel}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities & Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Included Amenities</h3>
              <div className="space-y-1.5">
                {property.amenities.map(am => (
                  <div key={am} className="flex items-center gap-2 text-slate-700">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2">House Rules</h3>
              <div className="space-y-1.5">
                {property.rules.map(rl => (
                  <div key={rl} className="flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{rl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Free Room Visit Form */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Schedule a Free Room Visit</h3>
                <p className="text-[11px] text-slate-500">Pick a time slot to see the room before booking.</p>
              </div>
              <button
                type="button"
                onClick={openWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Share2 size={13} />
                <span>Chat with Landlord</span>
              </button>
            </div>

            {submittedSuccess ? (
              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-center text-xs font-bold text-emerald-900 flex items-center justify-center gap-2">
                <Check size={16} /> Visit Scheduled! The owner has received your request and will contact you.
              </div>
            ) : (
              <form onSubmit={handleBookVisit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={renterName}
                      onChange={e => setRenterName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">WhatsApp Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9835012345"
                      value={renterPhone}
                      onChange={e => setRenterPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={e => setVisitDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Preferred Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 04:30 PM"
                      value={visitTime}
                      onChange={e => setVisitTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  Confirm Free Visit
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
