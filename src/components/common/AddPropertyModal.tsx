import React, { useState } from 'react';
import { Property } from '../../types';
import { X, Building2, Plus, IndianRupee } from 'lucide-react';

interface AddPropertyModalProps {
  onClose: () => void;
  onAddProperty: (prop: Omit<Property, 'id' | 'createdAt'>, initialRooms: number) => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  onClose,
  onAddProperty
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Property['type']>('PG');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Station Road');
  const [landmark, setLandmark] = useState('');
  const [baseRent, setBaseRent] = useState(4000);
  const [deposit, setDeposit] = useState(4000);
  const [electricityType, setElectricityType] = useState<Property['electricityType']>('meter_unit');
  const [electricityRate, setElectricityRate] = useState(9);
  const [foodAvailable, setFoodAvailable] = useState(false);
  const [foodCost, setFoodCost] = useState(2000);
  const [initialRooms, setInitialRooms] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    onAddProperty({
      ownerId: 'owner-rajesh-01',
      name,
      type,
      address,
      area,
      city: 'Samastipur',
      landmark: landmark || 'Near College Road',
      totalBeds: initialRooms * 2,
      availableBeds: initialRooms * 2,
      baseRent: Number(baseRent),
      deposit: Number(deposit),
      brokerage: 0,
      electricityType,
      electricityRate: Number(electricityRate),
      wifiCost: 150,
      maintenance: 100,
      foodAvailable,
      foodIncluded: false,
      foodCost: foodAvailable ? Number(foodCost) : 0,
      rules: ['Gate closes at 10:30 PM', 'No smoking/alcohol in premises'],
      amenities: ['WiFi', 'RO Water', 'Power Backup', 'Daily Cleaning'],
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
      isActive: true
    }, Number(initialRooms));

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="text-emerald-700" size={20} />
            <h3 className="font-bold text-slate-900 text-base">Add New Property / Hostel</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Property Name</label>
            <input
              type="text"
              placeholder="e.g. Balaji Student Residency"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
              >
                <option value="PG">Boys/Girls PG</option>
                <option value="Hostel">Student Hostel</option>
                <option value="Room">Private Room</option>
                <option value="Flat">Family / Bachelor Flat</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Area / Locality</label>
              <input
                type="text"
                placeholder="e.g. Station Road, Magadh Colony"
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Address & Nearby Landmark</label>
            <input
              type="text"
              placeholder="e.g. Lane No. 3, Near ABC College, Samastipur"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Monthly Rent (₹/bed)</label>
              <input
                type="number"
                value={baseRent}
                onChange={e => setBaseRent(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                value={deposit}
                onChange={e => setDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Electricity Calculation</label>
              <select
                value={electricityType}
                onChange={e => setElectricityType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
              >
                <option value="meter_unit">By Sub-Meter (₹/unit)</option>
                <option value="included">Included in Rent</option>
                <option value="fixed">Fixed Monthly Rate</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rate (₹/unit)</label>
              <input
                type="number"
                step={0.5}
                value={electricityRate}
                onChange={e => setElectricityRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                disabled={electricityType !== 'meter_unit'}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Rooms to Create</label>
            <input
              type="number"
              min={1}
              max={50}
              value={initialRooms}
              onChange={e => setInitialRooms(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Auto-creates rooms (Room 101, 102...) with 2 beds each. You can add more later.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
            >
              Create Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
