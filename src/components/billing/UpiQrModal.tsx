import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  CheckCircle2, 
  ShieldCheck,
  Edit2
} from 'lucide-react';

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantName: string;
  tenantPhone?: string;
  roomNumber: string;
  month: string;
  amount: number;
  defaultUpiId: string;
  ownerName: string;
  propertyName: string;
  onMarkAsPaid?: (method: 'UPI', transactionRef: string) => void;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  tenantName,
  tenantPhone,
  roomNumber,
  month,
  amount,
  defaultUpiId,
  ownerName,
  propertyName,
  onMarkAsPaid
}) => {
  const [upiId, setUpiId] = useState(defaultUpiId || '9835044219@upi');
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const payeeName = ownerName || propertyName || 'RoomSaathi Landlord';
  const cleanUpi = upiId.trim() || '9835044219@upi';
  const note = `Rent_${roomNumber || 'Unit'}_${month.replace(/\s+/g, '_')}`;

  // Standard NPCI UPI URI
  const upiIntentUri = `upi://pay?pa=${cleanUpi}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiIntentUri);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(cleanUpi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2200);
  };

  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 400;
    canvas.height = 400;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, 360, 360);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `UPI_QR_${roomNumber}_${month.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShareWhatsApp = () => {
    const text = `*RoomSaathi Rent Payment QR*\n` +
      `--------------------------------\n` +
      `👤 Tenant: *${tenantName}*\n` +
      `🏠 Room: *${roomNumber}* (${propertyName})\n` +
      `📅 Month: *${month}*\n` +
      `💰 Amount Due: *₹${amount.toLocaleString('en-IN')}*\n` +
      `🔑 UPI ID: *${cleanUpi}*\n` +
      `--------------------------------\n` +
      `📲 Click below to pay via GPay / PhonePe / Paytm:\n${upiIntentUri}\n\n` +
      `Kindly share payment screenshot after transfer. Thank you!`;

    const targetPhone = tenantPhone ? tenantPhone.replace(/[^0-9]/g, '') : '';
    const url = targetPhone
      ? `https://wa.me/${targetPhone.startsWith('91') ? targetPhone : '91' + targetPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  const handleConfirmPaid = () => {
    if (!onMarkAsPaid) return;
    const ref = transactionRef.trim() || `UPI-${Date.now().toString().slice(-6)}`;
    onMarkAsPaid('UPI', ref);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
              <ShieldCheck size={11} /> 0% Fee · Direct NPCI UPI
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            Scan & Pay Rent (UPI QR)
          </h2>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            {tenantName} · Room {roomNumber} · {month}
          </p>

          <div className="mt-4 flex items-baseline gap-1.5 bg-black/20 backdrop-blur-xs px-4 py-2.5 rounded-2xl w-fit">
            <span className="text-xs font-medium text-emerald-200">Amount Due:</span>
            <span className="text-2xl font-black text-white tracking-tight flex items-center">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center">
            <div 
              ref={qrRef}
              className="p-4 bg-white rounded-3xl border-2 border-emerald-500/30 shadow-md flex items-center justify-center relative group"
            >
              <QRCodeSVG
                value={upiIntentUri}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Supported Apps Chips */}
            <div className="flex items-center justify-center gap-2 mt-3 text-[11px] font-semibold text-slate-500">
              <span className="px-2 py-0.5 bg-slate-100 rounded-md">Google Pay</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-md">PhonePe</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-md">Paytm</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-md">BHIM</span>
            </div>
          </div>

          {/* UPI ID Info with edit toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Receiving UPI ID:</span>
              <button
                onClick={() => setIsEditingUpi(!isEditingUpi)}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Edit2 size={11} /> {isEditingUpi ? 'Done' : 'Change'}
              </button>
            </div>

            {isEditingUpi ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-500 rounded-lg focus:outline-hidden font-mono"
                />
                <button
                  onClick={() => setIsEditingUpi(false)}
                  className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-800 truncate">
                  {cleanUpi}
                </span>
                <button
                  onClick={handleCopyUpi}
                  className="p-1 text-slate-500 hover:text-emerald-700 transition cursor-pointer"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer text-center"
            >
              {copiedLink ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-slate-600" />}
              <span className="text-[10px] font-bold text-slate-700 mt-1">
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </span>
            </button>

            <button
              onClick={handleDownloadQr}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer text-center"
            >
              <Download size={16} className="text-slate-600" />
              <span className="text-[10px] font-bold text-slate-700 mt-1">Download QR</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer text-center"
            >
              <Share2 size={16} className="text-emerald-700" />
              <span className="text-[10px] font-bold text-emerald-800 mt-1">WhatsApp</span>
            </button>
          </div>

          {/* Fast Verification / Mark Paid Box */}
          {onMarkAsPaid && (
            <div className="border-t border-slate-100 pt-3">
              {!isMarkingPaid ? (
                <button
                  onClick={() => setIsMarkingPaid(true)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 size={15} />
                  <span>Mark as Paid (Received)</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Enter UTR / Transaction Ref (Optional):
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    placeholder="e.g. UPI-2481029148"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmPaid}
                      className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Confirm Paid
                    </button>
                    <button
                      onClick={() => setIsMarkingPaid(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
