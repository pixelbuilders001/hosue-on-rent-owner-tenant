import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  Share2, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Building,
  User,
  MapPin,
  Clock,
  Loader2
} from 'lucide-react';
import { Tenant, Property, OwnerProfile } from '../../types';
import { generatePoliceVerificationPdf } from '../../services/pdfPoliceVerificationService';

interface PoliceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  property: Property;
  profile: OwnerProfile;
  onUpdateStatus?: (status: Tenant['policeVerificationStatus']) => void;
}

export const PoliceVerificationModal: React.FC<PoliceVerificationModalProps> = ({
  isOpen,
  onClose,
  tenant,
  property,
  profile,
  onUpdateStatus
}) => {
  const [thanaName, setThanaName] = useState('Town Police Station (नगर थाना)');
  const [fatherName, setFatherName] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [referee1Name, setReferee1Name] = useState('Local Reference / Guardian 1');
  const [referee1Phone, setReferee1Phone] = useState(tenant.emergencyPhone || '');
  const [referee2Name, setReferee2Name] = useState('Local Reference 2');
  const [referee2Phone, setReferee2Phone] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const pdfDataUri = await generatePoliceVerificationPdf({
        tenant,
        property,
        profile,
        thanaName,
        fatherName,
        permanentAddress,
        referee1Name,
        referee1Phone,
        referee2Name,
        referee2Phone
      });

      const link = document.createElement('a');
      link.href = pdfDataUri;
      link.download = `Police_Verification_${tenant.fullName.replace(/\s+/g, '_')}_Room${tenant.roomNumber || '101'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onUpdateStatus && tenant.policeVerificationStatus === 'pending') {
        onUpdateStatus('submitted');
      }
    } catch (e) {
      console.error('Failed to generate Police Verification PDF:', e);
      alert('Error generating Police Verification PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = async () => {
    const text = `*RoomSaathi Police Verification Form*\n` +
      `--------------------------------\n` +
      `👤 Tenant: *${tenant.fullName}*\n` +
      `🏠 Room: *${tenant.roomNumber || '101'}* (${property.name})\n` +
      `👮 Jurisdiction Thana: *${thanaName}*\n` +
      `🆔 ID Proof: *${tenant.idProofType}* (${tenant.idProofNumber || 'Submitted'})\n` +
      `--------------------------------\n` +
      `Official Police Tenant Verification Proforma has been generated. Kindly verify details and submit to local police station with ID photocopies.`;

    const targetPhone = tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '';
    const url = targetPhone
      ? `https://wa.me/${targetPhone.startsWith('91') ? targetPhone : '91' + targetPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck size={12} /> Police Verification Proforma
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              tenant.policeVerificationStatus === 'verified'
                ? 'bg-emerald-500/30 text-emerald-200'
                : tenant.policeVerificationStatus === 'submitted'
                ? 'bg-amber-500/30 text-amber-200'
                : 'bg-red-500/30 text-red-200'
            }`}>
              Status: {tenant.policeVerificationStatus ? tenant.policeVerificationStatus.toUpperCase() : 'PENDING'}
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            Tenant Police Verification (किरायेदार पुलिस सत्यापन)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Pre-fills official Bihar/State Police proforma for Room {tenant.roomNumber || '101'} · {tenant.fullName}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Quick Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <Clock size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Under state municipal & security rules, property owners must submit tenant details to the nearest Police Station within 15 days of occupancy.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Building size={13} className="text-slate-500" />
                  Local Police Station (थाना नाम)
                </label>
                <input
                  type="text"
                  value={thanaName}
                  onChange={e => setThanaName(e.target.value)}
                  placeholder="e.g. Town Police Station, Samastipur"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User size={13} className="text-slate-500" />
                  Father's / Husband's Name (पिता/पति का नाम)
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={e => setFatherName(e.target.value)}
                  placeholder="e.g. Shri Rameshwar Prasad"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin size={13} className="text-slate-500" />
                Permanent / Native Address (स्थाई पता)
              </label>
              <textarea
                rows={2}
                value={permanentAddress}
                onChange={e => setPermanentAddress(e.target.value)}
                placeholder="e.g. Vill: Mohanpur, PO: Ujiyarpur, Dist: Samastipur, Bihar - 848132"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Local References / Guarantors (स्थानीय परिचित)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={referee1Name}
                    onChange={e => setReferee1Name(e.target.value)}
                    placeholder="Reference 1 Name"
                    className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    value={referee1Phone}
                    onChange={e => setReferee1Phone(e.target.value)}
                    placeholder="Ref 1 Phone"
                    className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300 mt-1"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={referee2Name}
                    onChange={e => setReferee2Name(e.target.value)}
                    placeholder="Reference 2 Name"
                    className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    value={referee2Phone}
                    onChange={e => setReferee2Phone(e.target.value)}
                    placeholder="Ref 2 Phone"
                    className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300 mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Status Toggles */}
          {onUpdateStatus && (
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-2xl text-xs">
              <span className="font-semibold text-slate-700">Update Verification Status:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onUpdateStatus('submitted')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    tenant.policeVerificationStatus === 'submitted'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Submitted to Thana
                </button>
                <button
                  onClick={() => onUpdateStatus('verified')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    tenant.policeVerificationStatus === 'verified'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Mark Verified
                </button>
              </div>
            </div>
          )}

          {/* Primary Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className={`flex-1 py-3 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-700/20 ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating Official PDF...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download Official Police PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 size={16} />
              <span>Share on WhatsApp</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
