import React, { useState } from 'react';
import { 
  Plus, 
  DoorClosed, 
  Bed as BedIcon, 
  Settings2, 
  IndianRupee, 
  Check, 
  X, 
  Edit3, 
  Filter,
  Sparkles
} from 'lucide-react';
import { Property, Room, Bed, Language } from '../../types';
import { t } from '../../services/i18n';

interface RoomsBedsViewProps {
  property: Property;
  rooms: Room[];
  beds: Bed[];
  language: Language;
  onToggleBedStatus: (bedId: string) => void;
  onAddRoom: (room: Omit<Room, 'id'>, bedCount: number) => void;
  onUpdateProperty: (updated: Property) => void;
  onToggleRoomStatus?: (roomId: string) => void;
}

export const RoomsBedsView: React.FC<RoomsBedsViewProps> = ({
  property,
  rooms,
  beds,
  language,
  onToggleBedStatus,
  onAddRoom,
  onUpdateProperty,
  onToggleRoomStatus
}) => {
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditPricingModal, setShowEditPricingModal] = useState(false);

  // Filter state
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');

  const propRooms = rooms.filter(r => r.propertyId === property.id);
  const propBeds = beds.filter(b => b.propertyId === property.id);

  const filteredRooms = floorFilter === 'all' 
    ? propRooms 
    : propRooms.filter(r => r.floor === floorFilter);

  // Form states for Add Room
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [newRoomType, setNewRoomType] = useState<'Single' | '2 Sharing' | '3 Sharing' | '4 Sharing'>('2 Sharing');
  const [newRent, setNewRent] = useState(4000);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) return;
    const bedCount = newRoomType === 'Single' ? 1 : newRoomType === '2 Sharing' ? 2 : newRoomType === '3 Sharing' ? 3 : 4;
    onAddRoom({
      propertyId: property.id,
      roomNumber: newRoomNumber,
      floor: Number(newFloor),
      roomType: newRoomType,
      totalBeds: bedCount,
      baseRent: Number(newRent)
    }, bedCount);
    setNewRoomNumber('');
    setShowAddRoomModal(false);
  };

  // Unique floors
  const floors = Array.from(new Set(propRooms.map(r => r.floor))).sort();

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Rooms & Bed Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {propRooms.length} Rooms · {propBeds.length} Total Beds ({propBeds.filter(b => b.status === 'available').length} Available for booking)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Floor filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-700">
            <button
              onClick={() => setFloorFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition ${floorFilter === 'all' ? 'bg-white shadow-xs font-bold text-emerald-800' : 'hover:text-slate-900'}`}
            >
              All Floors
            </button>
            {floors.map(f => (
              <button
                key={f}
                onClick={() => setFloorFilter(f)}
                className={`px-2.5 py-1 rounded-lg transition ${floorFilter === f ? 'bg-white shadow-xs font-bold text-emerald-800' : 'hover:text-slate-900'}`}
              >
                F-{f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowEditPricingModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
          >
            <Settings2 size={15} />
            <span>Pricing & Rules</span>
          </button>

          <button
            onClick={() => setShowAddRoomModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus size={16} />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Bed Legend Bar */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">Quick status toggle:</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500" />
            <b>Available</b> (Shows on Search)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-600" />
            <b>Occupied</b> (Tenant Active)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500" />
            <b>Reserved</b> (Advance Received)
          </span>
        </div>
      </div>

      {/* Rooms and Beds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map(room => {
          const roomBeds = propBeds.filter(b => b.roomId === room.id);
          const roomAvailable = roomBeds.filter(b => b.status === 'available').length;

          return (
            <div key={room.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition flex flex-col justify-between">
              
              <div>
                {/* Room Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-slate-900">Room {room.roomNumber}</span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                        Floor {room.floor}
                      </span>
                      {onToggleRoomStatus && (
                        <button
                          type="button"
                          onClick={() => onToggleRoomStatus(room.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                            (room.isActive ?? true)
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Click to toggle room active/paused status in customer listing"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (room.isActive ?? true) ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                          {(room.isActive ?? true) ? 'Active' : 'Paused'}
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{room.roomType} Room</div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-800">
                      ₹{room.baseRent.toLocaleString('en-IN')}
                    </span>
                    <div className="text-[10px] text-slate-400">/bed/month</div>
                  </div>
                </div>

                {/* Beds inside Room */}
                <div className="mt-4 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Beds ({roomAvailable} of {roomBeds.length} Free)
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {roomBeds.map(bed => {
                      const isAvailable = bed.status === 'available';
                      const isOccupied = bed.status === 'occupied';
                      const isReserved = bed.status === 'reserved';

                      return (
                        <div
                          key={bed.id}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                            isAvailable
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : isOccupied
                              ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                              : isReserved
                              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BedIcon size={16} className={
                              isAvailable ? 'text-emerald-600' : isOccupied ? 'text-blue-600' : 'text-amber-600'
                            } />
                            <div>
                              <div className="text-xs font-bold leading-tight">{bed.bedLabel}</div>
                              <div className="text-[10px] text-slate-500">
                                {bed.tenantName ? `Tenant: ${bed.tenantName}` : isAvailable ? 'Open for booking' : 'Reserved for visit'}
                              </div>
                            </div>
                          </div>

                          {/* Quick Toggle Button */}
                          <button
                            onClick={() => onToggleBedStatus(bed.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs ${
                              isAvailable
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : isOccupied
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-amber-600 text-white hover:bg-amber-700'
                            }`}
                            title="Click to cycle status"
                          >
                            {bed.status.toUpperCase()}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Room Footer Status */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Total beds: {room.totalBeds}</span>
                <span className={roomAvailable > 0 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  {roomAvailable > 0 ? `${roomAvailable} Vacant` : 'Fully Occupied'}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Room</h3>
              <button onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. 104, 201, G-02"
                  value={newRoomNumber}
                  onChange={e => setNewRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Number</label>
                  <input
                    type="number"
                    min={0}
                    value={newFloor}
                    onChange={e => setNewFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type</label>
                  <select
                    value={newRoomType}
                    onChange={e => setNewRoomType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Single">Single (1 Bed)</option>
                    <option value="2 Sharing">2 Sharing (2 Beds)</option>
                    <option value="3 Sharing">3 Sharing (3 Beds)</option>
                    <option value="4 Sharing">4 Sharing (4 Beds)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent per Bed (₹)</label>
                <input
                  type="number"
                  step={100}
                  value={newRent}
                  onChange={e => setNewRent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition"
                >
                  Create Room & Beds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Property Pricing & Rules Modal */}
      {showEditPricingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Property Pricing & Rules</h3>
              <button onClick={() => setShowEditPricingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={property.deposit}
                  onChange={e => onUpdateProperty({ ...property, deposit: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Electricity Billing</label>
                  <select
                    value={property.electricityType}
                    onChange={e => onUpdateProperty({ ...property, electricityType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="meter_unit">By Sub-Meter (₹/unit)</option>
                    <option value="included">Included in Rent</option>
                    <option value="fixed">Fixed Monthly Rate</option>
                  </select>
                </div>
                {property.electricityType === 'meter_unit' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Rate per Unit (₹/kWh)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={property.electricityRate}
                      onChange={e => onUpdateProperty({ ...property, electricityRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food / Mess Option</label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={property.foodAvailable}
                      onChange={e => onUpdateProperty({ ...property, foodAvailable: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span>Mess / Food Facility Available</span>
                  </label>
                </div>
                {property.foodAvailable && (
                  <div className="mt-2">
                    <label className="block font-semibold text-slate-500 mb-1">Food Charges (₹/month)</label>
                    <input
                      type="number"
                      value={property.foodCost}
                      onChange={e => onUpdateProperty({ ...property, foodCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowEditPricingModal(false)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold transition"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
