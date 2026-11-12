import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import { RentAgreement, Property } from '../../types';

interface AgreementViewerModalProps {
  isOpen: boolean;
  agreement: RentAgreement;
  property?: Property | null;
  onClose: () => void;
  onOpenEdit?: () => void;
}

export const AgreementViewerModal: React.FC<AgreementViewerModalProps> = ({
  isOpen,
  agreement,
  property,
  onClose,
  onOpenEdit
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentPdfUrl = agreement.signedPdfBase64 || agreement.pdfBase64;
  const isCompleted = agreement.status === 'completed';
  const tenantViewUrl = `${window.location.origin}/?viewAgreement=${agreement.signingToken}`;

  const handleDownload = () => {
    if (!currentPdfUrl) return;
    const link = document.createElement('a');
    link.href = currentPdfUrl;
    link.download = agreement.signedPdfBase64
      ? `Executed_Rent_Agreement_${agreement.tenantName.replace(/\s+/g, '_')}.pdf`
      : agreement.pdfFileName || 'Rent_Agreement.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!currentPdfUrl) return;
    const printWindow = window.open(currentPdfUrl);
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tenantViewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const propName = property?.name || agreement.propertyName;
    const msg = `नमस्ते ${agreement.tenantName} जी, ${propName} के लिए आपका रेंट एग्रीमेंट (किरायानामा) देखने के लिए नीचे दिए लिंक पर क्लिक करें:\n👉 ${tenantViewUrl}\nइसे आप कभी भी खोलकर देख व डाउनलोड कर सकते हैं।`;
    const cleaned = agreement.tenantPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleaned.startsWith('91') ? cleaned : '91' + cleaned}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  Rent Agreement · Room {agreement.roomNumber} ({agreement.tenantName})
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isCompleted 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {isCompleted ? '✓ Fully Signed' : 'Signatures Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {agreement.propertyName} · Rent: ₹{Number(agreement.monthlyRent).toLocaleString('en-IN')}/mo · Deposit: ₹{Number(agreement.depositAmount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenEdit && (
              <button
                onClick={onOpenEdit}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              >
                Manage / Re-sign
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          
          {/* Signatures status pill */}
          <div className="flex items-center gap-3 text-slate-600 text-[11px]">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${agreement.ownerSignature ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <b>Landlord:</b> {agreement.ownerSignature ? 'Signed' : 'Pending'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${agreement.tenantSignature ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <b>Tenant:</b> {agreement.tenantSignature ? 'Signed' : 'Pending'}
            </span>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition shadow-2xs cursor-pointer"
              title="Download PDF file"
            >
              <Download size={13} />
              <span>Download</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition shadow-2xs cursor-pointer"
              title="Print PDF directly"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-2xs cursor-pointer"
              title="Send agreement view link on WhatsApp"
            >
              <Share2 size={13} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition shadow-2xs cursor-pointer"
              title="Copy shareable link for tenant"
            >
              {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>

        </div>

        {/* PDF Document Reader (Full Height) */}
        <div className="flex-1 bg-slate-200 p-2 sm:p-4 overflow-hidden">
          {currentPdfUrl ? (
            <div className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-md border border-slate-300">
              <iframe
                src={`${currentPdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-none block"
                title="Agreement Document"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No document available to display.
            </div>
          )}
        </div>

        {/* Footer Audit Bar */}
        <div className="p-3 px-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-800 font-bold">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>RoomSaathi Legal OS</span>
            </span>
            <span className="font-mono text-slate-400">Token: {agreement.signingToken}</span>
          </div>

          <div className="text-slate-400">
            Created: {new Date(agreement.createdAt).toLocaleDateString('en-IN')}
          </div>
        </div>

      </div>
    </div>
  );
};
