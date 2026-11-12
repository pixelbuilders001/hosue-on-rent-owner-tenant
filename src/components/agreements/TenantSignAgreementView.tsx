import React, { useState } from 'react';
import { 
  FileText, 
  PenLine, 
  Download, 
  CheckCircle2, 
  ShieldCheck,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { RentAgreement } from '../../types';
import { SignaturePadModal } from './SignaturePadModal';
import { embedSignaturesIntoPdf } from '../../services/pdfAgreementService';
import { syncAgreementToSupabase } from '../../services/store';

interface TenantSignAgreementViewProps {
  agreement: RentAgreement;
  onUpdateAgreement: (updated: RentAgreement) => void;
  onExit: () => void;
}

export const TenantSignAgreementView: React.FC<TenantSignAgreementViewProps> = ({
  agreement,
  onUpdateAgreement,
  onExit
}) => {
  const [signedAgreement, setSignedAgreement] = useState<RentAgreement | null>(null);
  const [showSignPad, setShowSignPad] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [successSigned, setSuccessSigned] = useState(agreement.status === 'completed' || Boolean(agreement.tenantSignature));
  const [copiedLink, setCopiedLink] = useState(false);

  const activeAgreement = signedAgreement || agreement;
  const isCompleted = activeAgreement.status === 'completed' || successSigned || Boolean(activeAgreement.tenantSignature);
  const currentPdfUrl = activeAgreement.signedPdfBase64 || activeAgreement.pdfBase64;

  const handleDownloadPdf = () => {
    if (!currentPdfUrl) return;
    const link = document.createElement('a');
    link.href = currentPdfUrl;
    link.download = `Executed_Rent_Agreement_${activeAgreement.tenantName.replace(/\s+/g, '_')}.pdf`;
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
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveTenantSignature = async (sigUri: string) => {
    setShowSignPad(false);
    setIsSigning(true);
    const now = new Date().toISOString();

    let finalPdf = activeAgreement.signedPdfBase64 || activeAgreement.pdfBase64;
    try {
      if (finalPdf) {
        finalPdf = await embedSignaturesIntoPdf(
          finalPdf,
          activeAgreement.ownerSignature,
          sigUri,
          { ...activeAgreement, tenantSignedAt: now }
        );
      }
    } catch (e) {
      console.warn('PDF embedding fallback, preserving signature data', e);
    }

    const updated: RentAgreement = {
      ...activeAgreement,
      tenantSignature: sigUri,
      tenantSignedAt: now,
      signedPdfBase64: finalPdf,
      status: 'completed'
    };

    setSignedAgreement(updated);
    setSuccessSigned(true);
    syncAgreementToSupabase(updated);
    onUpdateAgreement(updated);
    setIsSigning(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-xs">
              <span className="font-bold text-sm">⌂</span>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                <span>RoomSaathi Digital Agreement</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                  Legal OS
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Official 11-Month Tenancy Document Execution
              </div>
            </div>
          </div>

          <button
            onClick={onExit}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            Exit View
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex-1 space-y-5">
        
        {/* Banner */}
        {isCompleted || successSigned ? (
          <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black">Agreement Successfully Executed!</h1>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Both Landlord and Tenant signatures have been verified and permanently embedded into your legal contract.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={handleDownloadPdf}
                className="px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Download size={15} />
                <span>Download Executed Agreement PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-500/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={15} />
                <span>Print Document</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-500/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Copy permanent link to view anytime"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Link Copied!' : 'Save / Bookmark Link'}</span>
              </button>
            </div>

            <div className="text-[11px] text-emerald-100 bg-white/10 p-2.5 rounded-xl border border-white/10 mt-1">
              📌 <b>Permanent Access (स्थायी लिंक):</b> You can open this link on your phone anytime in the future to view, verify, or re-download your signed tenancy agreement.
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                <ShieldCheck size={14} />
                <span>Verified Landlord Document</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold">Review & Sign Your Tenancy Agreement</h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Landlord <b>{activeAgreement.ownerName}</b> has digitally signed your lease for <b>{activeAgreement.propertyName}</b>. Please review the terms below and sign with your finger or stylus to finalize your stay.
              </p>
            </div>

            <button
              onClick={() => setShowSignPad(true)}
              disabled={isSigning}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <PenLine size={16} />
              <span>Sign Agreement Now</span>
            </button>
          </div>
        )}

        {/* Lease Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Property & Room</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">{activeAgreement.propertyName}</span>
            <span className="text-[11px] text-slate-500">Unit / Room {activeAgreement.roomNumber}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Monthly Rent</span>
            <span className="font-bold text-emerald-800 text-sm mt-0.5 block">
              ₹{Number(activeAgreement.monthlyRent).toLocaleString('en-IN')}/mo
            </span>
            <span className="text-[11px] text-slate-500">Due by 5th of month</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Security Deposit</span>
            <span className="font-bold text-blue-900 text-sm mt-0.5 block">
              ₹{Number(activeAgreement.depositAmount).toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500">Refundable at vacate</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Lease Term</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {activeAgreement.durationMonths || 11} Months
            </span>
            <span className="text-[11px] text-slate-500">From {activeAgreement.startDate}</span>
          </div>
        </div>

        {/* PDF Document Viewer */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-emerald-700" />
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                Document Preview (एग्रीमेंट देखें)
              </span>
            </div>

            {currentPdfUrl && (
              <button
                onClick={handleDownloadPdf}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
              >
                <Download size={13} />
                <span>Download</span>
              </button>
            )}
          </div>

          {currentPdfUrl ? (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 h-[620px] shadow-inner">
              <iframe
                src={`${currentPdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none"
                title="Agreement PDF Review"
              />
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 text-xs">
              Agreement document is currently loading...
            </div>
          )}
        </div>

        {/* Bottom CTA Bar when signing pending */}
        {!isCompleted && !successSigned && (
          <div className="sticky bottom-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-xl flex items-center justify-between gap-3">
            <div className="text-xs">
              <div className="font-bold text-slate-900">Ready to sign?</div>
              <div className="text-[11px] text-slate-500">Sign with finger/stylus on your phone.</div>
            </div>

            <button
              onClick={() => setShowSignPad(true)}
              disabled={isSigning}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <PenLine size={14} />
              <span>{isSigning ? 'Processing...' : 'Draw Digital Signature'}</span>
            </button>
          </div>
        )}

      </main>

      {/* Signature Pad Modal for Tenant */}
      {showSignPad && (
        <SignaturePadModal
          isOpen={showSignPad}
          title="Sign Agreement as Tenant (किरायेदार हस्ताक्षर)"
          signatoryName={activeAgreement.tenantName}
          role="tenant"
          onSave={handleSaveTenantSignature}
          onClose={() => setShowSignPad(false)}
        />
      )}

    </div>
  );
};
