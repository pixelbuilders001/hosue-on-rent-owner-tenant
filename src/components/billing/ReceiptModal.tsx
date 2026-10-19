import React from 'react';
import { RentRecord, OwnerProfile, Property } from '../../types';
import { X, Printer, Share2, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  record: RentRecord | null;
  property: Property;
  profile: OwnerProfile;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  record,
  property,
  profile,
  onClose
}) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `*किराया रसीद (RENT RECEIPT)*\n` +
      `रसीद संख्या: ${record.id.toUpperCase()}\n` +
      `प्रॉपर्टी: ${property.name}\n` +
      `किरायेदार: ${record.tenantName} (कमरा ${record.roomNumber})\n` +
      `महीना: ${record.month}\n` +
      `भुगतान राशि: ₹${record.totalAmount.toLocaleString('en-IN')}\n` +
      `भुगतान माध्यम: ${record.paymentMethod || 'UPI'}\n` +
      `तारीख: ${record.paidDate || 'आज'}\n` +
      `स्थिति: पूर्ण भुगतान प्राप्त (PAID)\n` +
      `मालिक: ${profile.fullName} (${profile.phone})`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Rent Receipt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              title="Print Receipt"
            >
              <Printer size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="my-4 p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-slate-200 space-y-4">
          
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-black text-slate-900 tracking-tight">{property.name}</div>
              <div className="text-[11px] text-slate-500">{property.address}, {property.city}</div>
              <div className="text-[11px] text-slate-500">Contact: {profile.phone}</div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
                <CheckCircle2 size={12} /> PAID
              </span>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">#{record.id.slice(0, 10).toUpperCase()}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-200/80">
            <div>
              <span className="text-slate-400 block text-[10px]">Resident Name:</span>
              <span className="font-bold text-slate-900">{record.tenantName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Room & Bed:</span>
              <span className="font-bold text-slate-900">Room {record.roomNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Billing Period:</span>
              <span className="font-bold text-slate-900">{record.month}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Payment Date:</span>
              <span className="font-bold text-slate-900">{record.paidDate || 'Paid'}</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Monthly Room Rent</span>
              <span>₹{record.baseRent.toLocaleString('en-IN')}</span>
            </div>
            {record.electricityUnits ? (
              <div className="flex justify-between text-slate-600">
                <span>Electricity ({record.electricityUnits} Units)</span>
                <span>₹{record.electricityAmount?.toLocaleString('en-IN')}</span>
              </div>
            ) : null}
            {record.wifiAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>WiFi & Maintenance</span>
                <span>₹{record.wifiAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
              <span>Total Received</span>
              <span className="text-emerald-800">₹{record.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
            <span>Method: {record.paymentMethod || 'UPI'} {record.transactionRef && `(${record.transactionRef})`}</span>
            <span>Authorized by {profile.fullName}</span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Share2 size={14} />
            <span>Share Receipt on WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
