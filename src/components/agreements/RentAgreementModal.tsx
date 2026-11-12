import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Upload, 
  PenLine, 
  Share2, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  RotateCw
} from 'lucide-react';
import { Property, Tenant, RentAgreement } from '../../types';
import { SignaturePadModal } from './SignaturePadModal';
import { generateStandardAgreementPdf, embedSignaturesIntoPdf } from '../../services/pdfAgreementService';
import { generateUUID, fetchLiveSupabaseData } from '../../services/store';

interface RentAgreementModalProps {
  isOpen: boolean;
  tenant: Tenant;
  property: Property;
  existingAgreement?: RentAgreement;
  ownerName: string;
  ownerPhone: string;
  onSaveAgreement: (agreement: RentAgreement) => void;
  onClose: () => void;
}

export const RentAgreementModal: React.FC<RentAgreementModalProps> = ({
  isOpen,
  tenant,
  property,
  existingAgreement,
  ownerName,
  ownerPhone,
  onSaveAgreement,
  onClose
}) => {
  const [agreement, setAgreement] = useState<RentAgreement>(() => {
    if (existingAgreement) return existingAgreement;

    const signingToken = generateUUID();
    return {
      id: generateUUID(),
      propertyId: property.id,
      propertyName: property.name,
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      tenantPhone: tenant.phone,
      tenantAadhaar: tenant.idProofNumber,
      ownerName: ownerName || 'Property Landlord',
      ownerPhone: ownerPhone || '',
      roomNumber: tenant.roomNumber || '101',
      monthlyRent: tenant.monthlyRent || property.baseRent || 4000,
      depositAmount: tenant.depositPaid || property.deposit || 4000,
      startDate: tenant.checkInDate || new Date().toISOString().split('T')[0],
      durationMonths: 11,
      status: 'draft',
      signingToken,
      createdAt: new Date().toISOString()
    };
  });

  const [activeTab, setActiveTab] = useState<'create' | 'preview'>(() => {
    return existingAgreement?.signedPdfBase64 || existingAgreement?.pdfBase64 ? 'preview' : 'create';
  });
  const [showSignPad, setShowSignPad] = useState(false);
  const [showTenantSignPad, setShowTenantSignPad] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Sync state if parent passes updated existingAgreement with tenant signature
  useEffect(() => {
    if (existingAgreement) {
      if (existingAgreement.tenantSignature && !agreement.tenantSignature) {
        setAgreement(existingAgreement);
      }
    }
  }, [existingAgreement, agreement.tenantSignature]);

  const currentPdfUrl = agreement.signedPdfBase64 || agreement.pdfBase64 || existingAgreement?.signedPdfBase64 || existingAgreement?.pdfBase64;
  const hasTenantSignature = Boolean(agreement.tenantSignature || existingAgreement?.tenantSignature);
  const hasOwnerSignature = Boolean(agreement.ownerSignature || existingAgreement?.ownerSignature);
  const isCompleted = agreement.status === 'completed' || existingAgreement?.status === 'completed' || (hasTenantSignature && hasOwnerSignature);
  const isPendingTenant = !isCompleted && ((agreement.status === 'pending_tenant' || existingAgreement?.status === 'pending_tenant' || hasOwnerSignature) && !hasTenantSignature);

  // Real-time polling every 3 seconds while awaiting tenant signature so landlord sees instant completion
  useEffect(() => {
    if (isCompleted || !isOpen) return;

    const timer = setInterval(async () => {
      try {
        const live = await fetchLiveSupabaseData();
        if (live?.agreements && live.agreements.length > 0) {
          const matched = live.agreements.find(
            a => a.id === agreement.id ||
                 a.signingToken === agreement.signingToken ||
                 (a.tenantPhone && a.tenantPhone === tenant.phone) ||
                 (a.tenantName && a.tenantName.toLowerCase() === tenant.fullName.toLowerCase())
          );
          if (matched && (matched.tenantSignature || matched.status === 'completed')) {
            setAgreement(matched);
            onSaveAgreement(matched);
          }
        }
      } catch (e) {
        // Silent poll catch
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [agreement.id, agreement.signingToken, isCompleted, isOpen, tenant.phone, tenant.fullName, onSaveAgreement]);

  if (!isOpen) return null;

  // Generate Standard 11-Month Lease
  const handleGenerateStandardLease = async () => {
    setIsGenerating(true);
    try {
      const generatedDataUri = await generateStandardAgreementPdf(agreement);
      const updated: RentAgreement = {
        ...agreement,
        pdfBase64: generatedDataUri,
        pdfFileName: `Rental_Agreement_${tenant.fullName.replace(/\s+/g, '_')}.pdf`,
        status: agreement.ownerSignature ? 'pending_tenant' : 'pending_owner'
      };
      setAgreement(updated);
      onSaveAgreement(updated);
      setActiveTab('preview');
    } catch (e) {
      console.error('Failed to generate lease agreement', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Upload Custom PDF
  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Please select a valid PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = () => {
      const base64DataUri = reader.result as string;
      const updated: RentAgreement = {
        ...agreement,
        pdfBase64: base64DataUri,
        pdfFileName: file.name,
        status: agreement.ownerSignature ? 'pending_tenant' : 'pending_owner'
      };
      setAgreement(updated);
      onSaveAgreement(updated);
      setActiveTab('preview');
    };
    reader.readAsDataURL(file);
  };

  // Apply Owner Signature
  const handleSaveOwnerSignature = async (sigUri: string) => {
    setShowSignPad(false);
    const now = new Date().toISOString();

    let updatedPdf = agreement.pdfBase64;
    if (agreement.pdfBase64) {
      try {
        updatedPdf = await embedSignaturesIntoPdf(
          agreement.pdfBase64,
          sigUri,
          agreement.tenantSignature,
          { ...agreement, ownerSignedAt: now }
        );
      } catch (err) {
        console.error('Failed to embed owner signature into PDF', err);
      }
    }

    const nextStatus = agreement.tenantSignature ? 'completed' : 'pending_tenant';
    const updated: RentAgreement = {
      ...agreement,
      ownerSignature: sigUri,
      ownerSignedAt: now,
      signedPdfBase64: updatedPdf,
      status: nextStatus
    };

    setAgreement(updated);
    onSaveAgreement(updated);
  };

  // Apply Tenant Signature (In-Person signing on owner device)
  const handleSaveTenantSignature = async (sigUri: string) => {
    setShowTenantSignPad(false);
    const now = new Date().toISOString();

    let updatedPdf = agreement.signedPdfBase64 || agreement.pdfBase64;
    if (updatedPdf) {
      try {
        updatedPdf = await embedSignaturesIntoPdf(
          updatedPdf,
          agreement.ownerSignature,
          sigUri,
          { ...agreement, tenantSignedAt: now }
        );
      } catch (err) {
        console.error('Failed to embed tenant signature into PDF', err);
      }
    }

    const updated: RentAgreement = {
      ...agreement,
      tenantSignature: sigUri,
      tenantSignedAt: now,
      signedPdfBase64: updatedPdf,
      status: 'completed'
    };

    setAgreement(updated);
    onSaveAgreement(updated);
    setActiveTab('preview');
  };

  // Manually refresh status from cloud
  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const live = await fetchLiveSupabaseData();
      if (live?.agreements && live.agreements.length > 0) {
        const matched = live.agreements.find(
          a => a.id === agreement.id ||
               a.signingToken === agreement.signingToken ||
               (a.tenantPhone && a.tenantPhone === tenant.phone) ||
               (a.tenantName && a.tenantName.toLowerCase() === tenant.fullName.toLowerCase())
        );
        if (matched && (matched.tenantSignature || matched.status === 'completed')) {
          setAgreement(matched);
          onSaveAgreement(matched);
        }
      }
    } catch (e) {
      console.warn('Refresh agreement error', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // WhatsApp signing link
  const tenantSigningUrl = `${window.location.origin}/?signAgreement=${agreement.signingToken}`;

  const handleShareWhatsApp = () => {
    const message = `नमस्ते ${tenant.fullName} जी, ${property.name} के लिए आपका रेंट एग्रीमेंट (किरायानामा) तैयार है।\nकृपया नीचे दिए गए लिंक पर जाकर एग्रीमेंट रिव्यू करें और अपना डिजिटल हस्ताक्षर करें:\n👉 ${tenantSigningUrl}\nहस्ताक्षर करने के बाद आपको फाइनल कॉपी तुरंत डाउनलोड हो जाएगी।`;
    const cleaned = tenant.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleaned.startsWith('91') ? cleaned : '91' + cleaned}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tenantSigningUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadPdf = () => {
    if (!currentPdfUrl) return;
    const link = document.createElement('a');
    link.href = currentPdfUrl;
    link.download = agreement.signedPdfBase64 
      ? `Executed_Rent_Agreement_${tenant.fullName.replace(/\s+/g, '_')}.pdf`
      : agreement.pdfFileName || 'Rent_Agreement.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Rent Agreement & Digital Signatures
                  </h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : isPendingTenant
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : currentPdfUrl
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isCompleted ? '✓ Completed / हस्ताक्षरित' : isPendingTenant ? 'Awaiting Tenant Sign' : currentPdfUrl ? 'Awaiting Owner Sign' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Tenant: <b>{tenant.fullName}</b> · Room {tenant.roomNumber || '101'} · Rent: ₹{Number(tenant.monthlyRent).toLocaleString('en-IN')}/mo
                </p>
              </div>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition">
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-5 pt-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-2.5 px-3 border-b-2 transition ${
                activeTab === 'create'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Agreement Setup & Document
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              disabled={!currentPdfUrl}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : currentPdfUrl
                    ? 'border-transparent text-slate-500 hover:text-slate-800'
                    : 'border-transparent text-slate-300 cursor-not-allowed'
              }`}
            >
              <span>PDF Viewer & Signatures</span>
              {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {activeTab === 'create' && (
              <div className="space-y-6">
                
                {/* Status Alert Banner */}
                {isCompleted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-sm">Agreement Fully Executed!</div>
                        <div>Both Landlord and Tenant signatures have been verified and embedded.</div>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadPdf}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0"
                    >
                      <Download size={14} /> Download Final PDF
                    </button>
                  </div>
                ) : isPendingTenant ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-900">
                    <div className="flex items-center gap-2.5">
                      <Clock size={20} className="text-amber-600 shrink-0" />
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>Signed by Landlord · Awaiting Tenant Signature</span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Live Auto-Sync
                          </span>
                        </div>
                        <div>Share signing link or sign in-person directly with {tenant.fullName}.</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowTenantSignPad(true)}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                        title="Open digital signature pad for tenant right now"
                      >
                        <PenLine size={14} /> Sign as Tenant (In-Person)
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(tenantSigningUrl, '_blank')}
                        className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 shrink-0"
                        title="Open tenant signing view in new tab"
                      >
                        <ExternalLink size={14} /> Open Signing Page
                      </button>
                      <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
                      >
                        <Share2 size={14} /> WhatsApp Link
                      </button>
                      <button
                        type="button"
                        onClick={handleRefreshStatus}
                        className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold flex items-center shrink-0"
                        title="Refresh status from cloud"
                      >
                        <RotateCw size={14} className={isRefreshing ? 'animate-spin text-emerald-600' : ''} />
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Option Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Option 1: 1-Click Standard Agreement */}
                  <div className="bg-slate-50 hover:bg-emerald-50/50 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl p-5 transition flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Sparkles size={18} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Option 1: 1-Click Standard 11-Month Lease
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Instantly generates an official bilingual 11-month residential tenancy agreement formatted for Indian tenancy laws with rent, deposit, notice period, and sub-meter clauses.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateStandardLease}
                      disabled={isGenerating}
                      className="mt-4 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isGenerating ? (
                        <span>Generating Agreement...</span>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Generate Standard Agreement</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option 2: Upload Custom Agreement PDF */}
                  <div className="bg-slate-50 hover:bg-blue-50/50 border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-5 transition flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                        <Upload size={18} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Option 2: Upload Custom PDF Agreement
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Already have a scanned ₹100 stamp paper agreement or lawyer-drafted lease? Upload the PDF here to sign and collect the tenant's signature digitally.
                      </p>
                    </div>

                    <div className="mt-4">
                      <label className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer">
                        <Upload size={14} />
                        <span>Select PDF Document</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfFileUpload}
                          className="hidden"
                        />
                      </label>
                      {uploadError && (
                        <p className="text-[11px] text-rose-600 mt-1">{uploadError}</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Agreement Terms Review & Edit */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Agreement Terms & Tenancy Clauses
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1">Monthly Rent</label>
                      <input
                        type="number"
                        value={agreement.monthlyRent}
                        onChange={e => setAgreement(prev => ({ ...prev, monthlyRent: Number(e.target.value) }))}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">Security Deposit</label>
                      <input
                        type="number"
                        value={agreement.depositAmount}
                        onChange={e => setAgreement(prev => ({ ...prev, depositAmount: Number(e.target.value) }))}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={agreement.startDate}
                        onChange={e => setAgreement(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">Duration (Months)</label>
                      <input
                        type="number"
                        value={agreement.durationMonths}
                        onChange={e => setAgreement(prev => ({ ...prev, durationMonths: Number(e.target.value) }))}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-4">
                
                {/* Signing & Action Bar */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-3">
                    {/* Landlord sign status */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {hasOwnerSignature ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <Check size={14} className="stroke-[3]" /> Owner Signed
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1">
                          <AlertCircle size={14} /> Owner Sign Pending
                        </span>
                      )}
                    </div>

                    <span className="text-slate-300">|</span>

                    {/* Tenant sign status */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {hasTenantSignature ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <Check size={14} className="stroke-[3]" /> Tenant Signed
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock size={14} /> Tenant Sign Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Sign as Landlord */}
                    {!hasOwnerSignature && (
                      <button
                        onClick={() => setShowSignPad(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        <PenLine size={14} /> Sign as Landlord
                      </button>
                    )}

                    {/* In-Person Sign as Tenant */}
                    {hasOwnerSignature && !hasTenantSignature && (
                      <button
                        type="button"
                        onClick={() => setShowTenantSignPad(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                        title="Tenant signs directly on this device"
                      >
                        <PenLine size={13} /> Sign as Tenant (In-Person)
                      </button>
                    )}

                    {/* Open Tenant Signing Page */}
                    {hasOwnerSignature && !hasTenantSignature && (
                      <button
                        type="button"
                        onClick={() => window.open(tenantSigningUrl, '_blank')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
                        title="Open tenant digital signing page in new tab"
                      >
                        <ExternalLink size={13} /> Open Signing Page
                      </button>
                    )}

                    {/* WhatsApp share */}
                    {hasOwnerSignature && !isCompleted && (
                      <button
                        onClick={handleShareWhatsApp}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        <Share2 size={14} /> WhatsApp Tenant
                      </button>
                    )}

                    {/* Refresh status */}
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={handleRefreshStatus}
                        className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl transition"
                        title="Check if tenant signed"
                      >
                        <RotateCw size={13} className={isRefreshing ? 'animate-spin text-emerald-600' : ''} />
                      </button>
                    )}

                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
                      title="Copy public signing link for tenant"
                    >
                      {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedLink ? 'Copied Link!' : 'Copy Signing Link'}</span>
                    </button>

                    {/* Download */}
                    {currentPdfUrl && (
                      <button
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
                        title="Download PDF"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    )}
                  </div>

                </div>

                {/* PDF Viewer Frame */}
                {currentPdfUrl ? (
                  <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-100 shadow-inner h-[520px]">
                    <iframe
                      src={`${currentPdfUrl}#toolbar=0&navpanes=0`}
                      className="w-full h-full border-none"
                      title="Agreement PDF Preview"
                    />
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No PDF document loaded yet. Please generate or upload an agreement in Setup.
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400">
                Token: {agreement.signingToken.slice(0, 13)}...
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition shadow-2xs"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      {/* Signature Pad Modal for Landlord */}
      {showSignPad && (
        <SignaturePadModal
          isOpen={showSignPad}
          title="Sign Agreement as Landlord (मकान मालिक हस्ताक्षर)"
          signatoryName={agreement.ownerName || 'Property Landlord'}
          role="owner"
          onSave={handleSaveOwnerSignature}
          onClose={() => setShowSignPad(false)}
        />
      )}

      {/* Signature Pad Modal for Tenant (In-Person Signing) */}
      {showTenantSignPad && (
        <SignaturePadModal
          isOpen={showTenantSignPad}
          title={`Sign Agreement as Tenant (${tenant.fullName})`}
          signatoryName={tenant.fullName}
          role="tenant"
          onSave={handleSaveTenantSignature}
          onClose={() => setShowTenantSignPad(false)}
        />
      )}
    </>
  );
};
