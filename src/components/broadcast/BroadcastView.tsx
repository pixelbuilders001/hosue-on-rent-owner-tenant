import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  Share2, 
  Droplet, 
  IndianRupee, 
  Wifi, 
  DoorClosed, 
  Sparkles, 
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { Property, Tenant, Room, OwnerProfile, Language } from '../../types';

interface BroadcastViewProps {
  property: Property;
  tenants: Tenant[];
  rooms: Room[];
  profile: OwnerProfile;
  language: Language;
}

interface TemplateOption {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bg: string;
  template: (vars: { tenantName: string; roomNumber: string; propertyName: string; upiId: string; rent: number }) => string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'water_tank',
    title: 'Water Tank Cleaning',
    subtitle: 'पानी टंकी सफाई सूचना',
    icon: Droplet,
    color: 'text-cyan-700',
    bg: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
    template: ({ tenantName, propertyName }) =>
      `*सूचना: पानी टंकी की सफाई (Water Tank Cleaning)*\n\n` +
      `नमस्ते ${tenantName || 'साथी'} जी,\n` +
      `${propertyName} में कल सुबह 10:00 बजे से दोपहर 1:00 बजे तक मुख्य पानी की टंकी की सफाई एवं ब्लीचिंग का कार्य होगा।\n\n` +
      `⚠️ इस दौरान जलापूर्ति बंद रहेगी। कृपया अपनी दैनिक आवश्यकता अनुसार पानी पहले से स्टोर कर लें।\n` +
      `सहयोग के लिए धन्यवाद!\n— ${propertyName} प्रबंधन`
  },
  {
    id: 'rent_reminder',
    title: 'Friendly Rent Due Reminder',
    subtitle: 'किराया भुगतान अनुस्मारक',
    icon: IndianRupee,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    template: ({ tenantName, roomNumber, propertyName, upiId, rent }) =>
      `*किराया अनुस्मारक (Monthly Rent Reminder)*\n\n` +
      `नमस्ते ${tenantName} जी,\n` +
      `${propertyName} (कमरा: ${roomNumber}) का इस महीने का किराया (₹${rent.toLocaleString('en-IN')}) देय है।\n\n` +
      `📲 कृपया आज ही इस UPI ID पर भुगतान कर स्क्रीनशॉट साझा करें:\n` +
      `*UPI ID:* ${upiId || '9835044219@upi'}\n\n` +
      `यदि आपने पहले ही भुगतान कर दिया है तो कृपया इस संदेश को अनदेखा करें। धन्यवाद!`
  },
  {
    id: 'wifi_maintenance',
    title: 'WiFi Network Maintenance',
    subtitle: 'इंटरनेट मेंटेनेंस सूचना',
    icon: Wifi,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    template: ({ tenantName, propertyName }) =>
      `*सूचना: वाई-फाई मेंटेनेंस (WiFi Maintenance)*\n\n` +
      `नमस्ते ${tenantName} जी,\n` +
      `${propertyName} में आज शाम 4:00 से 6:00 बजे के बीच हाई-स्पीड फाइबर इंटरनेट लाइन का मेंटेनेंस कार्य निर्धारित है।\n\n` +
      `इस दौरान इंटरनेट कनेक्शन कुछ समय के लिए बाधित हो सकता है। असुविधा के लिए हमें खेद है।`
  },
  {
    id: 'gate_timing',
    title: 'Main Gate Timing & Curfew',
    subtitle: 'गेट बंद होने का समय',
    icon: DoorClosed,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    template: ({ tenantName, propertyName }) =>
      `*सुरक्षा सूचना: मुख्य प्रवेश द्वार (Main Gate Rules)*\n\n` +
      `नमस्ते ${tenantName} जी,\n` +
      `${propertyName} में सभी निवासियों की सुरक्षा को ध्यान में रखते हुए मुख्य गेट रात्रि 10:30 बजे बंद कर दिया जाएगा।\n\n` +
      `किसी आपात स्थिति या कोचिंग/ड्यूटी से देर होने पर कृपया केयरटेकर को पहले से सूचित करें। धन्यवाद!`
  },
  {
    id: 'festival_greetings',
    title: 'Festival & Vacation Notice',
    subtitle: 'त्योहार व छुट्टी सूचना',
    icon: Sparkles,
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    template: ({ tenantName, propertyName }) =>
      `*हार्दिक शुभकामनाएं एवं अवकाश सूचना*\n\n` +
      `नमस्ते ${tenantName} जी,\n` +
      `त्योहारों की आपको और आपके पूरे परिवार को हार्दिक शुभकामनाएं!\n\n` +
      `🔒 यदि आप अवकाश पर घर जा रहे हैं, तो कृपया अपने रूम के सभी नल, लाइट, पंखे बंद कर अपने कमरे को ठीक से लॉक कर केयरटेकर को सूचित करके जाएं।\n` +
      `शुभ यात्रा! — ${propertyName}`
  },
  {
    id: 'custom',
    title: 'Custom Announcement',
    subtitle: 'कस्टम संदेश लिखें',
    icon: Edit3,
    color: 'text-slate-700',
    bg: 'bg-slate-50 border-slate-200 hover:bg-slate-100',
    template: ({ tenantName, propertyName }) =>
      `*महत्वपूर्ण सूचना (${propertyName})*\n\n` +
      `नमस्ते ${tenantName} जी,\n` +
      `कृपया ध्यान दें: [यहाँ अपना संदेश लिखें]...\n\n` +
      `धन्यवाद! — ${propertyName}`
  }
];

export const BroadcastView: React.FC<BroadcastViewProps> = ({
  property,
  tenants,
  rooms: _rooms,
  profile,
  language: _language
}) => {
  const activeTenants = tenants.filter(t => t.propertyId === property.id && t.status !== 'vacated');
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('water_tank');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>(() => activeTenants.map(t => t.id));
  const [sentTenantIds, setSentTenantIds] = useState<string[]>([]);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];

  const handleToggleTenant = (id: string) => {
    setSelectedTenantIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTenantIds.length === activeTenants.length) {
      setSelectedTenantIds([]);
    } else {
      setSelectedTenantIds(activeTenants.map(t => t.id));
    }
  };

  const buildMessageForTenant = (tenant: Tenant) => {
    if (selectedTemplateId === 'custom' && customMessage.trim()) {
      return customMessage
        .replace(/{tenant_name}/g, tenant.fullName)
        .replace(/{property_name}/g, property.name)
        .replace(/{room_number}/g, tenant.roomNumber || '101')
        .replace(/{rent_amount}/g, tenant.monthlyRent.toLocaleString('en-IN'))
        .replace(/{owner_upi}/g, profile.upiId || '9835044219@upi');
    }

    return selectedTemplate.template({
      tenantName: tenant.fullName,
      roomNumber: tenant.roomNumber || '101',
      propertyName: property.name,
      upiId: profile.upiId || '9835044219@upi',
      rent: tenant.monthlyRent
    });
  };

  const handleSendSingleTenant = (tenant: Tenant) => {
    const text = buildMessageForTenant(tenant);
    const cleaned = tenant.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleaned.startsWith('91') ? cleaned : '91' + cleaned}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    if (!sentTenantIds.includes(tenant.id)) {
      setSentTenantIds(prev => [...prev, tenant.id]);
    }
  };

  const handleCopyBroadcast = () => {
    const previewTenant = activeTenants.find(t => selectedTenantIds.includes(t.id)) || activeTenants[0];
    const text = previewTenant 
      ? buildMessageForTenant(previewTenant) 
      : selectedTemplate.template({
          tenantName: 'सभी निवासी',
          roomNumber: 'All',
          propertyName: property.name,
          upiId: profile.upiId,
          rent: 4000
        });

    navigator.clipboard.writeText(text);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 2500);
  };

  const sampleTenant = activeTenants[0] || {
    id: 'sample',
    propertyId: property.id,
    fullName: 'Rahul Sharma',
    roomNumber: '102',
    phone: '9835044219',
    monthlyRent: 4500,
    emergencyPhone: '',
    collegeOrWork: 'Student',
    idProofType: 'Aadhaar',
    idProofNumber: '1234',
    checkInDate: '2026-10-01',
    depositPaid: 4500,
    status: 'active',
    policeVerificationStatus: 'verified'
  };

  const previewMessage = buildMessageForTenant(sampleTenant);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>WhatsApp Notice Broadcast Desk</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              सूचना प्रसारण केंद्र
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Send instant water cleaning, rent reminder, gate timing, or holiday notices to all residents in 1 tap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyBroadcast}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {copiedBroadcast ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedBroadcast ? 'Copied Notice!' : 'Copy Notice Text'}</span>
          </button>
        </div>
      </div>

      {/* Template Selector Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Step 1: Choose Notice Template (विषय चुनें)
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {TEMPLATES.length} Pre-built Templates
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {TEMPLATES.map(tmpl => {
            const Icon = tmpl.icon;
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => {
                  setSelectedTemplateId(tmpl.id);
                  if (tmpl.id === 'custom' && !customMessage) {
                    setCustomMessage(
                      `*महत्वपूर्ण सूचना (${property.name})*\n\n` +
                      `नमस्ते {tenant_name} जी,\n` +
                      `कृपया ध्यान दें: [यहाँ अपना संदेश लिखें]...\n\n` +
                      `धन्यवाद! — ${property.name}`
                    );
                  }
                }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected 
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20' 
                    : `${tmpl.bg} border-slate-200`
                }`}
              >
                <div className={`p-2 rounded-xl bg-white w-fit shadow-xs ${tmpl.color}`}>
                  <Icon size={16} />
                </div>
                <div className="mt-2.5">
                  <div className="text-xs font-bold text-slate-900 leading-snug">{tmpl.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{tmpl.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Message Editor if Custom is Selected */}
        {selectedTemplateId === 'custom' && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Edit Custom Message (You can use: <code>{'{tenant_name}'}</code>, <code>{'{room_number}'}</code>, <code>{'{property_name}'}</code>)
            </label>
            <textarea
              rows={4}
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Main Two-Column Workflow: Tenants List (Left) + WhatsApp Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Select Residents & Send (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Step 2: Select Residents & Send (किरायेदार चुनें)
              </span>
              <span className="text-xs text-slate-600 mt-0.5">
                {selectedTenantIds.length} of {activeTenants.length} tenants selected
              </span>
            </div>

            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              {selectedTenantIds.length === activeTenants.length ? (
                <>
                  <CheckSquare size={14} className="text-emerald-700" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square size={14} className="text-slate-400" />
                  <span>Select All</span>
                </>
              )}
            </button>
          </div>

          {/* Tenants Checklist */}
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1 space-y-1">
            {activeTenants.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active residents found in this property.
              </div>
            ) : (
              activeTenants.map(tenant => {
                const isSelected = selectedTenantIds.includes(tenant.id);
                const isSent = sentTenantIds.includes(tenant.id);

                return (
                  <div
                    key={tenant.id}
                    className={`py-2.5 px-3 rounded-xl transition flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-slate-50/80 hover:bg-slate-100/80' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div 
                      onClick={() => handleToggleTenant(tenant.id)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <button type="button" className="text-emerald-700 cursor-pointer">
                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-300" />}
                      </button>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-2">
                          <span>{tenant.fullName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700 font-medium">
                            Room {tenant.roomNumber || '101'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Mob: {tenant.phone}</span>
                          <span>· Rent: ₹{tenant.monthlyRent.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSent && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 size={11} /> Sent
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSendSingleTenant(tenant)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Open WhatsApp chat with pre-filled message"
                      >
                        <Share2 size={13} />
                        <span>Send WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <span className="font-medium">
              💡 <b>Tip:</b> Tapping "Send WhatsApp" opens WhatsApp directly with the personalized message for that resident.
            </span>
          </div>

        </div>

        {/* Right Column: WhatsApp Live Preview (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live WhatsApp Mockup Preview
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Encrypted · wa.me
              </span>
            </div>

            {/* WhatsApp Phone Mockup Container */}
            <div className="rounded-2xl border border-emerald-700/20 overflow-hidden shadow-md">
              
              {/* WhatsApp Chat Header */}
              <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-xs">
                  RS
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold leading-tight truncate">{property.name} (Notice Desk)</div>
                  <div className="text-[10px] text-emerald-200">Online · RoomSaathi Landlord</div>
                </div>
              </div>

              {/* WhatsApp Message Bubble */}
              <div className="bg-[#efeae2] p-4 font-sans text-xs text-slate-800 space-y-2 whitespace-pre-wrap leading-relaxed min-h-[220px]">
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-xs border-l-4 border-emerald-600 max-w-[95%]">
                  {previewMessage}
                  <div className="text-[10px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1">
                    <span>12:05 PM</span>
                    <span className="text-sky-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            📢 <b>Zero Spam Guarantee:</b> Messages are sent from your own WhatsApp number directly to the tenant's phone. No third-party bot fees.
          </div>
        </div>

      </div>

    </div>
  );
};
