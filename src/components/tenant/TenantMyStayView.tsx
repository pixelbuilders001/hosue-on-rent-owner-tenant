import React, { useState } from 'react';
import { 
  Building2, 
  Bed as BedIcon, 
  Zap, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  QrCode, 
  Receipt, 
  Wrench, 
  Plus, 
  Share2, 
  ShieldCheck,
  Send
} from 'lucide-react';
import { Property, TenantProfile, RentRecord, Complaint, Language } from '../../types';

interface TenantMyStayViewProps {
  tenantProfile: TenantProfile;
  property?: Property | null;
  rentRecords: RentRecord[];
  complaints: Complaint[];
  language: Language;
  onViewReceipt: (record: RentRecord) => void;
  onSubmitComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt'>) => void;
}

export const TenantMyStayView: React.FC<TenantMyStayViewProps> = ({
  tenantProfile,
  property,
  rentRecords,
  complaints,
  language,
  onViewReceipt,
  onSubmitComplaint
}) => {
  const [complaintCategory, setComplaintCategory] = useState<Complaint['category']>('WiFi');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  if (!property) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-emerald-300 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Active Stay</h2>
        <p className="text-xs text-slate-500 mb-4">
          You are currently not checked into any room or PG. Explore rooms in Samastipur, schedule visits, and move in to manage your rent and maintenance requests here.
        </p>
      </div>
    );
  }

  // My rent records
  const myRents = rentRecords.filter(r => r.tenantName === tenantProfile.fullName || r.tenantId === tenantProfile.id);
  const currentRent = myRents[0] || null;

  const myComplaints = complaints.filter(c => c.tenantName === tenantProfile.fullName);

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintTitle) return;

    onSubmitComplaint({
      propertyId: property.id,
      propertyName: property.name,
      tenantName: tenantProfile.fullName,
      roomNumber: tenantProfile.activeRoomNumber || '101',
      category: complaintCategory,
      title: complaintTitle,
      description: complaintDesc || 'Tenant reported via RoomSaathi portal',
      priority: 'medium',
      status: 'open'
    });

    setComplaintTitle('');
    setComplaintDesc('');
    setComplaintSuccess(true);
    setTimeout(() => setComplaintSuccess(false), 3000);
  };

  const isPaid = currentRent?.status === 'paid';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {tenantProfile.avatarUrl ? (
            <img
              src={tenantProfile.avatarUrl}
              alt={tenantProfile.fullName}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-400/40"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl ring-2 ring-emerald-400/40">
              {tenantProfile.fullName.charAt(0).toUpperCase() || 'T'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{tenantProfile.fullName}</h1>
              <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full">
                Active Resident
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5">{tenantProfile.collegeOrWork}</p>
            <p className="text-xs text-emerald-200 font-semibold mt-1">
              📍 {property.name} · Room {tenantProfile.activeRoomNumber} ({tenantProfile.activeBedLabel})
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs">
          <span className="text-emerald-200 block text-[10px]">Landlord Contact</span>
          <span className="font-bold text-white text-sm">Rajesh Kumar Singh</span>
          <div className="text-[11px] text-emerald-100 mt-0.5">+91 98350 44219 (UPI Active)</div>
        </div>
      </div>

      {/* Current Month Rent & Electricity Bill */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        {currentRent ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {currentRent.month} Rent & Bill
                </div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  ₹{currentRent.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ${
                  isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                }`}>
                  {isPaid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{isPaid ? 'Payment Complete (जमा हुआ)' : 'Rent Due (बाकी है)'}</span>
                </span>

                {isPaid ? (
                  <button
                    onClick={() => onViewReceipt(currentRent)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs transition"
                  >
                    <Receipt size={14} />
                    <span>View Receipt</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUpiModal(true)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <QrCode size={14} />
                    <span>Pay via UPI</span>
                  </button>
                )}
              </div>
            </div>

            {/* Detailed Bill Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Room Rent:</span>
                <span className="font-bold text-slate-900 text-sm">₹{currentRent.baseRent.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Sub-meter Electricity:</span>
                <span className="font-bold text-slate-900 text-sm">
                  ₹{currentRent.electricityAmount || 0}
                  <span className="text-[11px] text-slate-400 font-normal"> ({currentRent.electricityUnits || 0} units @ ₹9)</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">WiFi & Maintenance:</span>
                <span className="font-bold text-slate-900 text-sm">₹{currentRent.wifiAmount || 0}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Clock className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-bold text-slate-800">No Rent Due</h3>
            <p className="text-xs text-slate-500 mt-1">There are no pending or active rent bills generated for your stay yet.</p>
          </div>
        )}
      </div>

      {/* Maintenance Request / Complaint Desk */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench size={18} className="text-emerald-700" />
            <span>Report Room Issue / Maintenance (शिकायत दर्ज करें)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            WiFi down, tap leak, or fan issues? Submit here and your landlord will be notified directly.
          </p>
        </div>

        {complaintSuccess && (
          <div className="p-3 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} /> Your complaint has been lodged with the landlord!
          </div>
        )}

        <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
              <select
                value={complaintCategory}
                onChange={e => setComplaintCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
              >
                <option>WiFi</option>
                <option>Plumbing</option>
                <option>Electricity</option>
                <option>Cleaning</option>
                <option>Food</option>
                <option>Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Issue Title</label>
              <input
                type="text"
                placeholder="e.g. Bathroom tap leaking or WiFi disconnected"
                value={complaintTitle}
                onChange={e => setComplaintTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Send size={13} />
            <span>Submit Maintenance Ticket</span>
          </button>
        </form>

        {/* Previous Complaint History */}
        {myComplaints.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              My Active Tickets
            </span>
            {myComplaints.map(comp => (
              <div key={comp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-900">{comp.title}</div>
                  <div className="text-[11px] text-slate-500">{comp.category} · {new Date(comp.createdAt).toLocaleDateString()}</div>
                  {comp.adminNote && (
                    <div className="text-[11px] text-emerald-800 font-medium mt-1">
                      Owner Response: {comp.adminNote}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  comp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {comp.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPI QR Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Scan to Pay Monthly Rent</h3>
            <div className="w-48 h-48 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-emerald-500 p-2">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=rajesh.singh@okaxis&pn=Rajesh%20Kumar&am=5055&cu=INR"
                alt="UPI QR Code"
                className="w-full h-full rounded-xl"
              />
            </div>
            <div>
              <div className="text-xs text-slate-400">Owner UPI ID</div>
              <div className="text-sm font-bold text-slate-900 font-mono">rajesh.singh@okaxis</div>
              <div className="text-base font-black text-emerald-800 mt-1">
                Amount: ₹{currentRent.totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Works with Google Pay, PhonePe, Paytm, or BHIM UPI.
            </p>
            <button
              onClick={() => setShowUpiModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
