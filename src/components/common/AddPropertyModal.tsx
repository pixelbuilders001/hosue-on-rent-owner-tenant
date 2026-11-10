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
  Navigation,
  Camera,
  CheckCircle2,
  Info,
  ChevronRight,
  ArrowRight,
  BedDouble
} from 'lucide-react';
import { calculateTransitDistances, getLiveDeviceCoordinates } from '../../services/distanceService';
import { uploadPropertyImage } from '../../services/storageService';
import { CameraCaptureModal } from './CameraCaptureModal';

interface AddPropertyModalProps {
  onClose: () => void;
  onAddProperty: (prop: Omit<Property, 'id' | 'createdAt'>, initialRooms: number) => void | Promise<void>;
  onUpdateProperty?: (updated: Property) => void | Promise<void>;
  initialProperty?: Property | null;
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

const COMMON_AMENITY_PRESETS = [
  'High Speed WiFi',
  'RO Drinking Water',
  '24x7 Power Backup',
  'Daily Cleaning',
  'Attached Washroom',
  'CCTV Security'
];

const SAMPLE_PROPERTY_PHOTOS = [
  {
    label: 'Modern PG Room',
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Hostel Shared Room',
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Study & Work Room',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
  }
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
  onUpdateProperty,
  initialProperty,
  isAuthenticated,
  currentUserId,
  ownerName,
  onRequireAuth
}) => {
  const isEditMode = Boolean(initialProperty);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'amenities' | 'media'>('basic');

  // Basic details
  const [name, setName] = useState(initialProperty?.name || '');
  const [type, setType] = useState<Property['type']>(initialProperty?.type || 'PG');
  const [description, setDescription] = useState(initialProperty?.description || '');
  
  // Location
  const [city, setCity] = useState(initialProperty?.city || 'Samastipur');
  const [area, setArea] = useState(initialProperty?.area || 'Station Road');
  const [pincode, setPincode] = useState(initialProperty?.pincode || '848101');
  const [address, setAddress] = useState(initialProperty?.address || '');
  const [landmark, setLandmark] = useState(initialProperty?.landmark || '');
  const [latitude, setLatitude] = useState<number | undefined>(initialProperty?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialProperty?.longitude);

  // Distances
  const [stationDistanceKm, setStationDistanceKm] = useState(initialProperty?.stationDistanceKm || 1.0);
  const [busStandDistanceKm, setBusStandDistanceKm] = useState(initialProperty?.busStandDistanceKm || 1.2);
  const [primaryDistanceKm, setPrimaryDistanceKm] = useState(initialProperty?.distanceKm || 1.0);
  const [commuteMinutes, setCommuteMinutes] = useState(initialProperty?.commuteMinutes || 5);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Pricing & Utilities
  const [baseRent, setBaseRent] = useState(initialProperty?.baseRent || 4000);
  const [deposit, setDeposit] = useState(initialProperty?.deposit || 4000);
  const [brokerage, setBrokerage] = useState(initialProperty?.brokerage || 0);
  const [maintenance, setMaintenance] = useState(initialProperty?.maintenance || 100);
  const [electricityType, setElectricityType] = useState<Property['electricityType']>(initialProperty?.electricityType || 'meter_unit');
  const [electricityRate, setElectricityRate] = useState(initialProperty?.electricityRate || 9);
  const [wifiCost, setWifiCost] = useState(initialProperty?.wifiCost || 150);
  const [foodAvailable, setFoodAvailable] = useState(initialProperty?.foodAvailable || false);
  const [foodIncluded, setFoodIncluded] = useState(initialProperty?.foodIncluded || false);
  const [foodCost, setFoodCost] = useState(initialProperty?.foodCost || 2200);

  // Amenities & Rules
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialProperty?.amenities || [
    'High Speed WiFi',
    'RO Drinking Water',
    '24x7 Power Backup',
    'Daily Cleaning'
  ]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [rules, setRules] = useState<string[]>(initialProperty?.rules || [
    'Gate closes at 10:30 PM',
    'Strictly no smoking or alcohol on premises'
  ]);
  const [customRule, setCustomRule] = useState('');

  // Media & Storage (Multi-Image: min 1, max 3)
  const [images, setImages] = useState<string[]>(() => {
    if (initialProperty?.images && initialProperty.images.length > 0) {
      return initialProperty.images.slice(0, 3);
    }
    if (initialProperty?.image) {
      return [initialProperty.image];
    }
    return [];
  });
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadSlotErrors, setUploadSlotErrors] = useState<{ [slot: number]: string }>({});
  const [cameraModalSlot, setCameraModalSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [formNotice, setFormNotice] = useState<{ type: 'error' | 'info' | 'success'; message: string } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<'saving' | 'success' | null>(null);
  const fileInputRef0 = React.useRef<HTMLInputElement>(null);
  const fileInputRef1 = React.useRef<HTMLInputElement>(null);
  const fileInputRef2 = React.useRef<HTMLInputElement>(null);

  // Backward compatibility alias for single cover image
  const image = images[0] || '';

  // Rooms & Inventory
  const [initialRooms, setInitialRooms] = useState(4);
  const [initialRoomType, setInitialRoomType] = useState<'Single' | '2 Sharing' | '3 Sharing'>('2 Sharing');

  // Status & Moderation
  const [isActive, setIsActive] = useState(initialProperty ? (initialProperty.isActive ?? true) : true);
  const [verificationStatus, setVerificationStatus] = useState<Property['verificationStatus']>(initialProperty?.verificationStatus || 'pending');

  // Populate on initialProperty change
  useEffect(() => {
    if (initialProperty) {
      setName(initialProperty.name || '');
      setType(initialProperty.type || 'PG');
      setDescription(initialProperty.description || '');
      setCity(initialProperty.city || 'Samastipur');
      setArea(initialProperty.area || 'Station Road');
      setPincode(initialProperty.pincode || '848101');
      setAddress(initialProperty.address || '');
      setLandmark(initialProperty.landmark || '');
      setLatitude(initialProperty.latitude);
      setLongitude(initialProperty.longitude);
      setStationDistanceKm(initialProperty.stationDistanceKm || 1.0);
      setBusStandDistanceKm(initialProperty.busStandDistanceKm || 1.2);
      setPrimaryDistanceKm(initialProperty.distanceKm || 1.0);
      setCommuteMinutes(initialProperty.commuteMinutes || 5);
      setBaseRent(initialProperty.baseRent || 4000);
      setDeposit(initialProperty.deposit || 4000);
      setBrokerage(initialProperty.brokerage || 0);
      setMaintenance(initialProperty.maintenance || 100);
      setElectricityType(initialProperty.electricityType || 'meter_unit');
      setElectricityRate(initialProperty.electricityRate || 9);
      setWifiCost(initialProperty.wifiCost || 150);
      setFoodAvailable(initialProperty.foodAvailable || false);
      setFoodIncluded(initialProperty.foodIncluded || false);
      setFoodCost(initialProperty.foodCost || 2200);
      setSelectedAmenities(initialProperty.amenities || []);
      setRules(initialProperty.rules || []);
      if (initialProperty.images && initialProperty.images.length > 0) {
        setImages(initialProperty.images.slice(0, 3));
      } else if (initialProperty.image) {
        setImages([initialProperty.image]);
      } else {
        setImages([]);
      }
      setIsActive(initialProperty.isActive ?? true);
      setVerificationStatus(initialProperty.verificationStatus || 'pending');
    }
  }, [initialProperty]);

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
    setGpsStatus(null);
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
        setGpsStatus('GPS coordinates detected successfully! Distances calibrated.');
      } else {
        setGpsStatus('Live GPS unavailable. Distances estimated from Area & PIN code.');
      }
    } catch {
      setGpsStatus('Location service blocked. Using default postal estimates.');
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  // Slot File Upload to Supabase Storage
  const handleSlotFileUpload = async (file: File, slotIndex: number) => {
    setUploadingSlot(slotIndex);
    setUploadSlotErrors(prev => ({ ...prev, [slotIndex]: '' }));

    try {
      const cleanPrefix = name ? name.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '') : 'prop';
      const res = await uploadPropertyImage(file, `${cleanPrefix}-photo${slotIndex + 1}`);
      if (res.success && res.publicUrl) {
        setImages(prev => {
          const next = [...prev];
          next[slotIndex] = res.publicUrl!;
          return next;
        });
        setValidationErrors(prev => {
          const next = { ...prev };
          delete next.photos;
          return next;
        });
        setFormNotice(null);
      } else {
        setUploadSlotErrors(prev => ({ ...prev, [slotIndex]: res.error || 'Failed to upload photo.' }));
      }
    } catch (err: any) {
      setUploadSlotErrors(prev => ({ ...prev, [slotIndex]: err?.message || 'Error uploading file.' }));
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSlotCameraCapture = (file: File, slotIndex: number) => {
    handleSlotFileUpload(file, slotIndex);
  };

  const handleSlotRemove = (slotIndex: number) => {
    setImages(prev => {
      const next = [...prev];
      next.splice(slotIndex, 1);
      return next;
    });
  };

  const handleSlotUrlChange = (url: string, slotIndex: number) => {
    setImages(prev => {
      const next = [...prev];
      next[slotIndex] = url;
      return next;
    });
    if (url.trim()) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.photos;
        return next;
      });
      setFormNotice(null);
    }
  };

  const handleApplySamplePhoto = (url: string, slotIndex: number = 0) => {
    setImages(prev => {
      const next = [...prev];
      next[slotIndex] = url;
      return next;
    });
    setValidationErrors(prev => {
      const next = { ...prev };
      delete next.photos;
      return next;
    });
    setFormNotice({
      type: 'success',
      message: 'Sample photo applied! You can replace it with your own photos anytime.'
    });
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

  // Step Navigation with Inline Validation
  const handleStepClick = (targetStep: 'basic' | 'pricing' | 'amenities' | 'media') => {
    const order: Array<'basic' | 'pricing' | 'amenities' | 'media'> = ['basic', 'pricing', 'amenities', 'media'];
    const currentIndex = order.indexOf(activeTab);
    const targetIndex = order.indexOf(targetStep);

    // Navigating backwards is always allowed
    if (targetIndex <= currentIndex) {
      setActiveTab(targetStep);
      setFormNotice(null);
      return;
    }

    // Jumping forward requires basic validation
    if (!name.trim() || !address.trim()) {
      setValidationErrors({
        name: !name.trim() ? 'Property Name is required' : '',
        address: !address.trim() ? 'Street Address is required' : ''
      });
      setFormNotice({
        type: 'error',
        message: 'Please fill in the required Property Name and Address before moving forward.'
      });
      setActiveTab('basic');
      return;
    }

    setValidationErrors({});
    setFormNotice(null);
    setActiveTab(targetStep);
  };

  const handleNextTab = () => {
    setFormNotice(null);
    if (activeTab === 'basic') {
      const errs: { [key: string]: string } = {};
      if (!name.trim()) errs.name = 'Property Name is required';
      if (!address.trim()) errs.address = 'Full Street Address is required';

      if (Object.keys(errs).length > 0) {
        setValidationErrors(errs);
        setFormNotice({
          type: 'error',
          message: 'Please complete the required fields in Step 1 to proceed.'
        });
        return;
      }
      setValidationErrors({});
      setActiveTab('pricing');
    } else if (activeTab === 'pricing') {
      if (!baseRent || baseRent <= 0) {
        setValidationErrors({ baseRent: 'Please enter a valid monthly rent amount' });
        setFormNotice({
          type: 'error',
          message: 'Monthly Base Rent must be greater than 0.'
        });
        return;
      }
      setValidationErrors({});
      setActiveTab('amenities');
    } else if (activeTab === 'amenities') {
      setValidationErrors({});
      setActiveTab('media');
    }
  };

  const handlePrevTab = () => {
    setFormNotice(null);
    if (activeTab === 'media') setActiveTab('amenities');
    else if (activeTab === 'amenities') setActiveTab('pricing');
    else if (activeTab === 'pricing') setActiveTab('basic');
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'TEXTAREA') {
        e.preventDefault(); // Stop accidental submit when pressing Enter in inputs
      }
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Never submit prematurely before the final step
    if (activeTab !== 'media') {
      handleNextTab();
      return;
    }

    if (!isAuthenticated || !currentUserId) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Property Name is required';
    if (!address.trim()) errs.address = 'Full Street Address is required';

    if (Object.keys(errs).length > 0) {
      setActiveTab('basic');
      setValidationErrors(errs);
      setFormNotice({
        type: 'error',
        message: 'Please complete the required Property Name and Address.'
      });
      return;
    }

    const validImages = images.filter(img => img && img.trim() !== '');
    if (validImages.length === 0) {
      // Stay on activeTab('media') without bouncing to basic
      setValidationErrors({ photos: 'Please upload or select at least 1 cover photo for your property.' });
      setFormNotice({
        type: 'error',
        message: 'At least 1 cover photo is required so students can view your listing.'
      });
      return;
    }

    const primaryImage = validImages[0];
    const finalImagesList = validImages.slice(0, 3);

    setIsSubmitting(true);
    setSubmitPhase('saving');

    try {
      if (isEditMode && initialProperty && onUpdateProperty) {
        await Promise.resolve(onUpdateProperty({
          ...initialProperty,
          name,
          type,
          address,
          area,
          city,
          landmark: landmark || initialProperty.landmark,
          pincode,
          latitude,
          longitude,
          distanceKm: primaryDistanceKm,
          commuteMinutes,
          stationDistanceKm,
          busStandDistanceKm,
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
          image: primaryImage,
          images: finalImagesList,
          description: description || initialProperty.description,
          isActive,
          verificationStatus
        }));
      } else {
        const bedsPerRoom = initialRoomType === 'Single' ? 1 : initialRoomType === '2 Sharing' ? 2 : 3;
        const totalBeds = initialRooms * bedsPerRoom;

        await Promise.resolve(onAddProperty({
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
          image: primaryImage,
          images: finalImagesList,
          description: description || `${name} located in ${area}, ${city}. ${landmark ? `Landmark: ${landmark}.` : ''} High speed WiFi, security, and comfortable student accommodation.`,
          ownerName: ownerName || 'RoomSaathi Landlord',
          isActive,
          verificationStatus
        }, Number(initialRooms)));
      }

      setSubmitPhase('success');
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitPhase(null);
        onClose();
      }, 900);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitPhase(null);
      setFormNotice({
        type: 'error',
        message: err?.message || 'Failed to save property. Please try again.'
      });
    }
  };

  // Reusable Multi-Photo Upload UI (1 to 3 slots)
  const slotLabels = [
    { title: 'Cover / Main Photo *', desc: 'Main photo displayed to prospective students (Required)' },
    { title: 'Room / Interior Photo', desc: 'Bedroom, furniture, or study area (Optional)' },
    { title: 'Washroom / Common Area', desc: 'Washroom, mess, or premises (Optional)' }
  ];

  const fileInputRefs = [fileInputRef0, fileInputRef1, fileInputRef2];

  const renderPhotoUploadSection = (title: string, subtitle?: string) => {
    const validCount = images.filter(img => img && img.trim() !== '').length;

    return (
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <div>
            <div className="flex items-center gap-2">
              <label className="block font-bold text-slate-800 text-xs">
                {title}
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                validCount >= 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {validCount} of 3 Photos {validCount >= 1 ? '✓' : '(Min 1 Required)'}
              </span>
            </div>
            {subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          {/* Quick Sample Photos Selector if no photos attached */}
          {validCount === 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-medium">Quick sample:</span>
              {SAMPLE_PROPERTY_PHOTOS.map((sample, idx) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => handleApplySamplePhoto(sample.url, 0)}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition shadow-2xs cursor-pointer"
                  title={`Use sample: ${sample.label}`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Missing Photos Inline Error */}
        {validationErrors.photos && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span>{validationErrors.photos}</span>
          </div>
        )}

        {/* 3 Photo Slots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map(slotIdx => {
            const slotImg = images[slotIdx];
            const slotMeta = slotLabels[slotIdx];
            const isUploading = uploadingSlot === slotIdx;
            const slotError = uploadSlotErrors[slotIdx];
            const isDragOver = dragOverSlot === slotIdx;

            return (
              <div 
                key={slotIdx}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverSlot(slotIdx);
                }}
                onDragLeave={() => setDragOverSlot(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverSlot(null);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleSlotFileUpload(file, slotIdx);
                }}
                className={`bg-white rounded-2xl border p-2.5 flex flex-col justify-between shadow-xs min-h-[185px] transition-all ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400'
                    : slotIdx === 0 && !slotImg && validationErrors.photos
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-800 truncate" title={slotMeta.title}>
                    {slotIdx + 1}. {slotMeta.title}
                  </span>
                  {slotImg ? (
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md shrink-0">
                      ✓ Attached
                    </span>
                  ) : slotIdx === 0 ? (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md shrink-0">
                      Required
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400 font-medium">
                      Optional
                    </span>
                  )}
                </div>

                {slotImg ? (
                  <div className="relative rounded-xl overflow-hidden group aspect-4/3 bg-slate-100 border border-slate-100">
                    <img 
                      src={slotImg} 
                      alt={`Property Photo ${slotIdx + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-2">
                      <button
                        type="button"
                        onClick={() => setCameraModalSlot(slotIdx)}
                        className="px-2 py-1 bg-white/95 hover:bg-white text-slate-900 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Retake photo using live camera"
                      >
                        <Camera size={11} /> Retake
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRefs[slotIdx]?.current?.click()}
                        className="px-2 py-1 bg-white/95 hover:bg-white text-slate-900 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Choose another file"
                      >
                        <Upload size={11} /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSlotRemove(slotIdx)}
                        className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer shadow-xs"
                        title="Remove photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-50 transition">
                    {isUploading ? (
                      <div className="py-4 text-center">
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                        <span className="text-[10px] font-semibold text-emerald-800">Uploading photo...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] text-slate-400 mb-2 leading-tight">
                          Drag & drop image here, or use options below
                        </p>
                        <div className="flex flex-col w-full gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCameraModalSlot(slotIdx)}
                            className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                          >
                            <Camera size={13} /> Take Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRefs[slotIdx]?.current?.click()}
                            className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Upload size={12} /> Choose File
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Per-slot hidden file input */}
                <input
                  ref={fileInputRefs[slotIdx]}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleSlotFileUpload(f, slotIdx);
                  }}
                  className="hidden"
                />

                {slotError && (
                  <div className="text-rose-600 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle size={11} /> {slotError}
                  </div>
                )}

                {/* Direct Image URL input */}
                <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                  <input
                    type="url"
                    placeholder="Or paste photo URL"
                    value={slotImg || ''}
                    onChange={e => handleSlotUrlChange(e.target.value, slotIdx)}
                    className="w-full px-2 py-1 text-[10px] rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const stepsList = [
    { id: 'basic' as const, num: 1, label: '1. Basic Details', fullTitle: 'Step 1 of 4: Basic Details & Location' },
    { id: 'pricing' as const, num: 2, label: '2. Pricing', fullTitle: 'Step 2 of 4: Pricing & Utilities' },
    { id: 'amenities' as const, num: 3, label: '3. Amenities', fullTitle: 'Step 3 of 4: Amenities & House Rules' },
    { id: 'media' as const, num: 4, label: '4. Photos & Rooms', fullTitle: 'Step 4 of 4: Photos, Rooms & Finish' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-6 max-h-[92vh] flex flex-col relative overflow-hidden">
        
        {/* Full Modal Submission Loader Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            {submitPhase === 'saving' ? (
              <div className="space-y-4 max-w-xs flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                    <Building2 size={32} className="animate-pulse" />
                  </div>
                  <div className="absolute -inset-2 border-3 border-emerald-600 border-t-transparent rounded-3xl animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900">
                    {isEditMode ? 'Updating Property...' : 'Publishing Property...'}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Setting up rooms, bed allocations, and calibrating transit distances...
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Syncing with RoomSaathi</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-xs flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 size={34} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900">
                    {isEditMode ? 'Changes Saved!' : 'Property Published!'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Your listing is live. Redirecting to your dashboard...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                {isEditMode ? 'Edit Property Details' : 'Add New Property / Hostel'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEditMode 
                  ? `Update information, amenities, rules, and pricing for ${initialProperty?.name}`
                  : 'Configure listing details, image uploads, and transit distances'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className={`text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer ${
              isSubmitting ? 'opacity-30 cursor-not-allowed' : ''
            }`}
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

        {/* Step Progress Bar & Tab Stepper */}
        <div className="pt-2.5 pb-1 shrink-0 border-b border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
            <span className="text-slate-800">
              {stepsList.find(s => s.id === activeTab)?.fullTitle}
            </span>
            <span className="text-emerald-700 font-extrabold">
              {activeTab === 'basic' && '25%'}
              {activeTab === 'pricing' && '50%'}
              {activeTab === 'amenities' && '75%'}
              {activeTab === 'media' && '100%'}
            </span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
              style={{
                width: 
                  activeTab === 'basic' ? '25%' :
                  activeTab === 'pricing' ? '50%' :
                  activeTab === 'amenities' ? '75%' : '100%'
              }}
            />
          </div>

          {/* Interactive Stepper Navigation buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {stepsList.map(step => {
              const isCurrent = activeTab === step.id;
              const isCompleted = 
                step.id === 'basic' ? Boolean(name.trim() && address.trim()) :
                step.id === 'pricing' ? Boolean(baseRent > 0) :
                step.id === 'amenities' ? (selectedAmenities.length > 0) :
                Boolean(images.filter(img => img && img.trim() !== '').length > 0);

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{step.label}</span>
                  {isCompleted && !isCurrent && (
                    <CheckCircle2 size={12} className="text-emerald-700 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="flex-1 overflow-y-auto pt-3.5 pb-2 text-xs space-y-4">
          
          {/* Global Inline Notice Banner */}
          {formNotice && (
            <div className={`p-3 rounded-2xl text-xs flex items-center justify-between border transition-all ${
              formNotice.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : formNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-center gap-2">
                {formNotice.type === 'error' ? (
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                ) : (
                  <Info size={15} className="shrink-0 text-emerald-600" />
                )}
                <span className="font-semibold">{formNotice.message}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setFormNotice(null)} 
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {/* TAB 1: BASIC & LOCATION */}
          {activeTab === 'basic' && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Property Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Balaji Student Residency"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-xl border transition ${
                    validationErrors.name
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400'
                      : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                  }`}
                  required
                />
                {validationErrors.name && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {validationErrors.name}
                  </p>
                )}
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
                <label className="block font-bold text-slate-800 mb-1">
                  Full Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. House No. 24, Near Kali Mandir, Station Road"
                  value={address}
                  onChange={e => {
                    setAddress(e.target.value);
                    if (validationErrors.address) setValidationErrors(prev => ({ ...prev, address: '' }));
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-xl border transition ${
                    validationErrors.address
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400'
                      : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                  }`}
                  required
                />
                {validationErrors.address && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {validationErrors.address}
                  </p>
                )}
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
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    <MapPin size={12} />
                    <span>{isCalculatingDistance ? 'Detecting...' : 'Detect GPS Coords'}</span>
                  </button>
                </div>

                {gpsStatus && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50/90 border border-emerald-200 rounded-lg px-2.5 py-1 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                    <span>{gpsStatus}</span>
                  </div>
                )}

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

              {/* Estimated Total Monthly Cost to Tenant Banner */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Estimated Total Monthly Cost to Tenant</span>
                  <p className="text-[10px] text-slate-500">Rent + Maintenance + Wi-Fi {foodAvailable ? '+ Food / Mess' : ''}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-800">
                    ₹{(Number(baseRent || 0) + Number(maintenance || 0) + Number(wifiCost || 0) + (foodAvailable ? Number(foodCost || 0) : 0)).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-medium">/ month</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AMENITIES & RULES */}
          {activeTab === 'amenities' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-800">
                    Property Amenities ({selectedAmenities.length} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAmenities(COMMON_AMENITY_PRESETS)}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      Select Common
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAmenities([])}
                      className="text-[10px] font-medium text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
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
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddCustomAmenity();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
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
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddCustomRule();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRule}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHOTOS, ROOMS & REVIEW */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              
              {/* Photo Upload & Verification */}
              {renderPhotoUploadSection(
                'Property Cover Photo & Media Preview',
                'Verify or update the photo displayed to prospective students and tenants'
              )}

              {/* Initial Rooms Configuration / Existing Inventory Note */}
              {isEditMode ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="font-bold text-slate-800 text-xs mb-1">Room & Bed Inventory</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This property currently has rooms and beds configured. To add new rooms, adjust floor allocations, or update individual bed vacancy status, use the <strong>Rooms & Beds</strong> tab directly.
                  </p>
                </div>
              ) : (
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
              )}

              {/* Pre-Publish Listing Summary Preview Card */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-[10px] font-extrabold uppercase tracking-wider">
                      {type}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-[320px]">
                      {name || 'Untitled Property'}
                    </h4>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400">
                    ₹{Number(baseRent || 0).toLocaleString('en-IN')}/mo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Location</span>
                    <span className="font-semibold text-white truncate block">{area}, {city}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Deposit</span>
                    <span className="font-semibold text-white">₹{Number(deposit || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Inventory</span>
                    <span className="font-semibold text-white">{isEditMode ? 'Existing Rooms' : `${initialRooms} Rooms (${initialRoomType})`}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Photos</span>
                    <span className={`font-semibold ${images.filter(img => img && img.trim() !== '').length > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {images.filter(img => img && img.trim() !== '').length} of 3 Attached {images.filter(img => img && img.trim() !== '').length > 0 ? '✓' : '(Min 1)'}
                    </span>
                  </div>
                </div>
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
              disabled={isSubmitting}
              className={`px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition text-xs cursor-pointer ${
                isSubmitting ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
              }`}
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={handlePrevTab}
                  disabled={isSubmitting}
                  className={`px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition text-xs cursor-pointer ${
                    isSubmitting ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                  }`}
                >
                  ← Back
                </button>
              )}

              {activeTab !== 'media' ? (
                <button
                  type="button"
                  onClick={handleNextTab}
                  disabled={isSubmitting}
                  className="px-4 py-2 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-xs text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    {activeTab === 'basic' && 'Next: Pricing & Utilities →'}
                    {activeTab === 'pricing' && 'Next: Amenities & Rules →'}
                    {activeTab === 'amenities' && 'Next: Rooms & Final Review (Step 4) →'}
                  </span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isAuthenticated || uploadingSlot !== null || isSubmitting}
                  className={`px-5 py-2 font-bold text-white rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer ${
                    !isAuthenticated || uploadingSlot !== null || isSubmitting
                      ? 'bg-emerald-800/80 cursor-not-allowed opacity-80'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isEditMode ? 'Saving Changes...' : 'Publishing Property...'}</span>
                    </>
                  ) : (
                    <>
                      {isEditMode ? <Check size={15} /> : <Plus size={15} />}
                      <span>
                        {!isAuthenticated
                          ? 'Sign In Required'
                          : uploadingSlot !== null
                          ? 'Uploading Photo...'
                          : isEditMode
                          ? 'Save Changes'
                          : 'Publish Property'}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </form>

      </div>

      {/* Live In-App Camera Viewfinder Modal */}
      {cameraModalSlot !== null && (
        <CameraCaptureModal
          isOpen={true}
          onClose={() => setCameraModalSlot(null)}
          onCapture={(file) => handleSlotCameraCapture(file, cameraModalSlot)}
          imageLabel={`Photo Slot ${cameraModalSlot + 1} (${slotLabels[cameraModalSlot]?.title || 'Property Photo'})`}
        />
      )}
    </div>
  );
};
