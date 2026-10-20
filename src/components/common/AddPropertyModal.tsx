import React, { useState, useEffect } from 'react';
import { Property } from '../../types';
import { 
  X, 
  Building2, 
  Plus, 
  IndianRupee, 
  Lock, 
  MapPin, 
  Train, 
  Bus, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Wifi,
  Utensils,
  Zap,
  Trash2,
  Navigation
} from 'lucide-react';
import { calculateTransitDistances, getLiveDeviceCoordinates } from '../../services/distanceService';
import { uploadPropertyImage } from '../../services/storageService';

interface AddPropertyModalProps {
  onClose: () => void;
  onAddProperty: (prop: Omit<Property, 'id' | 'createdAt'>, initialRooms: number) => void;
  isAuthenticated: boolean;
  currentUserId: string;
  ownerName?: string;
  onRequireAuth?: () => void;
}

const DEFAULT_AMENITY_OPTIONS = [
  'High Speed WiFi',
  'RO Drinking Water',
  '24x7 Power Backup',
  'Daily Cleaning',
  'Attached Washroom',
  'Geyser (Hot Water)',
  'Air Cooler',
  'AC',
  'CCTV Security',
  'Bike Parking',
  'Food / Mess Facility',
  'Washing Machine',
  'Refrigerator',
  'Study Table & Chair',
  'Wardrobe / Almirah'
];

const DEFAULT_RULE_PRESETS = [
  'Gate closes at 10:30 PM',
  'Strictly no smoking or alcohol on premises',
  'Visitors allowed in common reception only',
  'Quiet hours between 11:00 PM and 6:00 AM',
  '30 days advance notice before vacating'
];

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  onClose,
  onAddProperty,
  isAuthenticated,
  currentUserId,
  ownerName,
  onRequireAuth
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'amenities' | 'media'>('basic');

  // Basic details
  const [name, setName] = useState('');
  const [type, setType] = useState<Property['type']>('PG');
  const [description, setDescription] = useState('');
  
  // Location
  const [city, setCity] = useState('Samastipur');
  const [area, setArea] = useState('Station Road');
  const [pincode, setPincode] = useState('848101');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  // Distances
  const [stationDistanceKm, setStationDistanceKm] = useState(1.0);
  const [busStandDistanceKm, setBusStandDistanceKm] = useState(1.2);
  const [primaryDistanceKm, setPrimaryDistanceKm] = useState(1.0);
  const [commuteMinutes, setCommuteMinutes] = useState(5);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Pricing & Utilities
  const [baseRent, setBaseRent] = useState(4000);
  const [deposit, setDeposit] = useState(4000);
  const [brokerage, setBrokerage] = useState(0);
  const [maintenance, setMaintenance] = useState(100);
  const [electricityType, setElectricityType] = useState<Property['electricityType']>('meter_unit');
  const [electricityRate, setElectricityRate] = useState(9);
  const [wifiCost, setWifiCost] = useState(150);
  const [foodAvailable, setFoodAvailable] = useState(false);
  const [foodIncluded, setFoodIncluded] = useState(false);
  const [foodCost, setFoodCost] = useState(2200);

  // Amenities & Rules
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'High Speed WiFi',
    'RO Drinking Water',
    '24x7 Power Backup',
    'Daily Cleaning'
  ]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [rules, setRules] = useState<string[]>([
    'Gate closes at 10:30 PM',
    'Strictly no smoking or alcohol on premises'
  ]);
  const [customRule, setCustomRule] = useState('');

  // Media & Storage
  const [image, setImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Rooms & Inventory
  const [initialRooms, setInitialRooms] = useState(4);
  const [initialRoomType, setInitialRoomType] = useState<'Single' | '2 Sharing' | '3 Sharing'>('2 Sharing');

  // Status & Moderation
  const [isActive, setIsActive] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<Property['verificationStatus']>('pending');

  // Auto-calculate distances when pincode or area changes
  useEffect(() => {
    const res = calculateTransitDistances({
      latitude,
      longitude,
      pincode,
      area
    });
    setStationDistanceKm(res.stationDistanceKm);
    setBusStandDistanceKm(res.busStandDistanceKm);
    setPrimaryDistanceKm(res.primaryDistanceKm);
    setCommuteMinutes(res.commuteMinutes);
  }, [pincode, area, latitude, longitude]);

  // Handle GPS location detection
  const handleDetectLocation = async () => {
    setIsCalculatingDistance(true);
    try {
      const coords = await getLiveDeviceCoordinates();
      if (coords) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        const res = calculateTransitDistances({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
        setStationDistanceKm(res.stationDistanceKm);
        setBusStandDistanceKm(res.busStandDistanceKm);
        setPrimaryDistanceKm(res.primaryDistanceKm);
        setCommuteMinutes(res.commuteMinutes);
      } else {
        alert("Could not detect exact GPS coordinates. Using Pincode and Area estimates.");
      }
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  // Handle File Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError('');

    try {
      const res = await uploadPropertyImage(file, name ? name.slice(0, 15) : 'property');
      if (res.success && res.publicUrl) {
        setImage(res.publicUrl);
      } else {
        setUploadError(res.error || 'Failed to upload photo. Please try again.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error uploading file.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Toggle Amenity
  const toggleAmenity = (item: string) => {
    setSelectedAmenities(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const handleAddCustomAmenity = () => {
    if (!customAmenity.trim()) return;
    if (!selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities(prev => [...prev, customAmenity.trim()]);
    }
    setCustomAmenity('');
  };

  // Toggle Rule
  const toggleRule = (rule: string) => {
    setRules(prev =>
      prev.includes(rule) ? prev.filter(r => r !== rule) : [...prev, rule]
    );
  };

  const handleAddCustomRule = () => {
    if (!customRule.trim()) return;
    if (!rules.includes(customRule.trim())) {
      setRules(prev => [...prev, customRule.trim()]);
    }
    setCustomRule('');
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !currentUserId) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (!name || !address) {
      setActiveTab('basic');
      alert("Please provide the Property Name and Address.");
      return;
    }

    const bedsPerRoom = initialRoomType === 'Single' ? 1 : initialRoomType === '2 Sharing' ? 2 : 3;
    const totalBeds = initialRooms * bedsPerRoom;

    onAddProperty({
      ownerId: currentUserId,
      name,
      type,
      address,
      area,
      city,
      landmark: landmark || 'Near College Road',
      pincode,
      latitude,
      longitude,
      distanceKm: primaryDistanceKm,
      commuteMinutes,
      stationDistanceKm,
      busStandDistanceKm,
      totalBeds,
      availableBeds: totalBeds,
      baseRent: Number(baseRent),
      deposit: Number(deposit),
      brokerage: Number(brokerage),
      electricityType,
      electricityRate: Number(electricityRate),
      wifiCost: Number(wifiCost),
      maintenance: Number(maintenance),
      foodAvailable,
      foodIncluded,
      foodCost: foodAvailable ? Number(foodCost) : 0,
      rules,
      amenities: selectedAmenities,
      image: image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
      description: description || `${name} located in ${area}, ${city}. ${landmark ? `Landmark: ${landmark}.` : ''} High speed WiFi, security, and comfortable student accommodation.`,
      ownerName: ownerName || 'RoomSaathi Landlord',
      isActive,
      verificationStatus
    }, Number(initialRooms));

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                Add New Property / Hostel
              </h3>
              <p className="text-[11px] text-slate-500">
                Configure listing details, image uploads, and transit distances
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Auth alert if guest */}
        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-amber-900 text-xs flex items-center justify-between mt-3 shrink-0">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-amber-700 shrink-0" />
              <span>Sign in required to publish your property on RoomSaathi.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onRequireAuth) onRequireAuth();
              }}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shrink-0"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 pt-3 pb-1 overflow-x-auto shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'basic'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Basic & Location
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'pricing'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Pricing & Utilities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('amenities')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'amenities'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Amenities & Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'media'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Photos & Rooms
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pt-3.5 pb-2 text-xs space-y-4">
          
          {/* TAB 1: BASIC & LOCATION */}
          {activeTab === 'basic' && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Property Name *</label>
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
                  <label className="block font-bold text-slate-800 mb-1">Property Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="PG">Boys / Girls PG</option>
                    <option value="Hostel">Student Hostel</option>
                    <option value="Room">Private Single Room</option>
                    <option value="Flat">Family / Bachelor Flat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Area / Locality</label>
                  <select
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Station Road">Station Road</option>
                    <option value="Magadh Colony">Magadh Colony</option>
                    <option value="Kashipur">Kashipur</option>
                    <option value="Mohanpur">Mohanpur</option>
                    <option value="Tajpur Road">Tajpur Road</option>
                    <option value="Hospital Road">Hospital Road</option>
                    <option value="Gudri Bazaar">Gudri Bazaar</option>
                    <option value="Musrigharari">Musrigharari</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">PIN Code</label>
                  <input
                    type="text"
                    placeholder="848101"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Street Address *</label>
                <input
                  type="text"
                  placeholder="e.g. House No. 24, Near Kali Mandir, Station Road"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Nearby Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Women's College Gate No. 2"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              {/* Automated Distance Calculator Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <Navigation size={14} className="text-emerald-700" />
                    <span>Transit Distances (Auto Calculated)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isCalculatingDistance}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-lg transition"
                  >
                    <MapPin size={12} />
                    <span>{isCalculatingDistance ? 'Detecting...' : 'Detect GPS Coords'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <Train size={13} className="text-blue-600" /> Railway Station
                      </span>
                      <span className="text-[10px] text-slate-400">Junction</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={stationDistanceKm}
                        onChange={e => setStationDistanceKm(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-sm font-bold rounded-lg border border-slate-300"
                      />
                      <span className="font-semibold text-slate-700">km</span>
                      <span className="text-[11px] text-slate-400">
                        (~{Math.round(stationDistanceKm * 4.5)} min)
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <Bus size={13} className="text-amber-600" /> Bus Stand
                      </span>
                      <span className="text-[10px] text-slate-400">Govt Depot</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={busStandDistanceKm}
                        onChange={e => setBusStandDistanceKm(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-sm font-bold rounded-lg border border-slate-300"
                      />
                      <span className="font-semibold text-slate-700">km</span>
                      <span className="text-[11px] text-slate-400">
                        (~{Math.round(busStandDistanceKm * 4.5)} min)
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  Calculated automatically based on PIN code / area coordinates. You can fine-tune if needed.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Property Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your rooms, study environment, walking distance to colleges, etc."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & UTILITIES */}
          {activeTab === 'pricing' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Monthly Base Rent (₹) *</label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="number"
                      value={baseRent}
                      onChange={e => setBaseRent(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 text-sm font-bold text-emerald-800 rounded-xl border border-slate-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Security Deposit (₹)</label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="number"
                      value={deposit}
                      onChange={e => setDeposit(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Brokerage Fee (₹)</label>
                  <input
                    type="number"
                    value={brokerage}
                    onChange={e => setBrokerage(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                  <span className="text-[10px] text-slate-400">Keep 0 for No Brokerage</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Maintenance / Cleaning (₹/mo)</label>
                  <input
                    type="number"
                    value={maintenance}
                    onChange={e => setMaintenance(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Electricity Configuration */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block font-bold text-slate-800 text-xs">⚡ Electricity Billing</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setElectricityType('meter_unit')}
                    className={`p-2 rounded-xl border text-center transition ${
                      electricityType === 'meter_unit'
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Meter Unit
                  </button>
                  <button
                    type="button"
                    onClick={() => setElectricityType('included')}
                    className={`p-2 rounded-xl border text-center transition ${
                      electricityType === 'included'
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Included in Rent
                  </button>
                  <button
                    type="button"
                    onClick={() => setElectricityType('fixed')}
                    className={`p-2 rounded-xl border text-center transition ${
                      electricityType === 'fixed'
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Fixed Charge
                  </button>
                </div>

                {electricityType === 'meter_unit' && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-slate-600">Rate:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={electricityRate}
                      onChange={e => setElectricityRate(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm font-bold rounded-lg border border-slate-300"
                    />
                    <span className="text-slate-600">₹ per unit</span>
                  </div>
                )}
              </div>

              {/* Wi-Fi & Food Utilities */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <label className="block font-bold text-slate-800 text-xs">📶 High Speed Wi-Fi</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={wifiCost}
                      onChange={e => setWifiCost(Number(e.target.value))}
                      className="w-24 px-2 py-1 text-sm rounded-lg border border-slate-300 font-bold"
                    />
                    <span className="text-slate-600">₹/mo (0 if free)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-xs">🍲 Food / Mess</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={foodAvailable}
                        onChange={e => setFoodAvailable(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span className="text-[11px] text-slate-600">Available</span>
                    </label>
                  </div>
                  {foodAvailable && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        value={foodCost}
                        onChange={e => setFoodCost(Number(e.target.value))}
                        className="w-24 px-2 py-1 text-sm rounded-lg border border-slate-300 font-bold"
                      />
                      <span className="text-slate-600">₹/mo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AMENITIES & RULES */}
          {activeTab === 'amenities' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Property Amenities ({selectedAmenities.length} selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEFAULT_AMENITY_OPTIONS.map(a => {
                    const isSelected = selectedAmenities.includes(a);
                    return (
                      <button
                        type="button"
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        className={`px-2.5 py-1.5 rounded-xl border text-left transition flex items-center justify-between text-[11px] ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate">{a}</span>
                        {isSelected && <Check size={12} className="text-emerald-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Amenity */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add custom amenity (e.g. Badminton Court)"
                    value={customAmenity}
                    onChange={e => setCustomAmenity(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800 mb-1.5">
                  House Rules ({rules.length} active)
                </label>
                <div className="space-y-1.5">
                  {DEFAULT_RULE_PRESETS.map(r => {
                    const isSelected = rules.includes(r);
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => toggleRule(r)}
                        className={`w-full p-2 rounded-xl border text-left transition flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-medium'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>✓ {r}</span>
                        {isSelected && <Check size={13} className="text-emerald-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Rule */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add custom rule (e.g. Non-veg cooking strictly prohibited)"
                    value={customRule}
                    onChange={e => setCustomRule(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRule}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHOTOS & ROOMS */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              
              {/* Photo Upload Box */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Property Photos (Supabase Cloud Storage)
                </label>

                {image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group h-44 bg-slate-100">
                    <img 
                      src={image} 
                      alt="Property Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-md"
                      >
                        <Trash2 size={13} /> Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-emerald-50/40 hover:bg-emerald-50/80">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                      <Upload size={22} />
                    </div>
                    <span className="font-bold text-slate-800 text-xs">
                      {isUploadingImage ? 'Uploading to Supabase Storage...' : 'Click to Upload Real Property Photo'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      JPG, PNG, WebP up to 5MB (stored in property-images bucket)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                )}

                {uploadError && (
                  <div className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle size={13} /> {uploadError}
                  </div>
                )}

                {/* Direct Image URL input fallback */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Or Image URL:</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Initial Rooms Configuration */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block font-bold text-slate-800 text-xs">
                  Initial Room & Bed Configuration
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Number of Initial Rooms</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={initialRooms}
                      onChange={e => setInitialRooms(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Room Sharing Type</label>
                    <select
                      value={initialRoomType}
                      onChange={e => setInitialRoomType(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Single">Single (1 Bed per room)</option>
                      <option value="2 Sharing">2 Sharing (2 Beds per room)</option>
                      <option value="3 Sharing">3 Sharing (3 Beds per room)</option>
                    </select>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  Auto-creates rooms (Room 101, 102...) with bed labels (Bed A, Bed B). You can add and configure more rooms anytime from the Rooms & Inventory tab.
                </p>
              </div>

              {/* Moderation / Active Status Toggle */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-700" />
                    <span>Listing Status: {isActive ? 'Live & Searchable' : 'Draft / Paused'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Admin verification review will inspect and verify your listing for high student trust.
                  </p>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">Active</span>
                </label>
              </div>

            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: Array<'basic' | 'pricing' | 'amenities' | 'media'> = ['basic', 'pricing', 'amenities', 'media'];
                    const idx = tabs.indexOf(activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1]);
                  }}
                  className="px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  Back
                </button>
              )}

              {activeTab !== 'media' ? (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: Array<'basic' | 'pricing' | 'amenities' | 'media'> = ['basic', 'pricing', 'amenities', 'media'];
                    const idx = tabs.indexOf(activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                  }}
                  className="px-4 py-2 font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-xs"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isAuthenticated || isUploadingImage}
                  className={`px-5 py-2 font-bold text-white rounded-xl shadow-xs transition flex items-center gap-1.5 ${
                    !isAuthenticated || isUploadingImage
                      ? 'bg-slate-400 cursor-not-allowed opacity-70'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  <Plus size={15} />
                  <span>{isAuthenticated ? 'Publish Property' : 'Sign In Required'}</span>
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
