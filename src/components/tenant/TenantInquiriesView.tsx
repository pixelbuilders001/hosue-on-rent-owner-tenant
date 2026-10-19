import React from 'react';
import { Lead, Property } from '../../types';
import { Clock, Phone, Share2, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';

interface TenantInquiriesViewProps {
  leads: Lead[];
  properties: Property[];
  tenantPhone: string;
}

export const TenantInquiriesView: React.FC<TenantInquiriesViewProps> = ({
  leads,
  properties,
  tenantPhone
}) => {
  // Leads matching tenant phone
  const cleanPhone = tenantPhone.replace(/\D/g, '');
  const myInquiries = leads.filter(l => {
    if (!cleanPhone) return false;
    const lPhone = l.renterPhone.replace(/\D/g, '');
    return lPhone.includes(cleanPhone) || cleanPhone.includes(lPhone);
  });

  const openWhatsApp = (phone: string, text: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleaned.startsWith('91') ? cleaned : '91' + cleaned}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          My Room Visits & Inquiries (मेरी पूछताछ व विज़िट)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track the status of properties you've inquired about and your scheduled room visits.
        </p>
      </div>

      <div className="space-y-4">
        {myInquiries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-700">No active inquiries</h3>
            <p className="mt-1">When you schedule a room visit or inquiry on RoomSaathi, it will be tracked here.</p>
          </div>
        ) : (
          myInquiries.map(inq => {
            const prop = properties.find(p => p.id === inq.propertyId);
            const isVisit = inq.status === 'visit_scheduled';

            return (
              <div
                key={inq.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{inq.propertyName}</span>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      isVisit ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {inq.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={13} className="text-emerald-600 shrink-0" />
                    <span>{prop ? `${prop.address} (${prop.landmark})` : inq.destination || 'Samastipur'}</span>
                  </div>

                  {isVisit && inq.visitDate && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 w-fit">
                      <Clock size={13} />
                      <span>Physical Visit: {inq.visitDate} at {inq.visitTime || '4:30 PM'}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-600">
                    Budget: <b>₹{inq.budget}/mo</b> · Looking for: <b>{inq.lookingFor}</b>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openWhatsApp(
                      '9835044219',
                      `नमस्ते, मैं RoomSaathi पर ${inq.propertyName} की विज़िट के बारे में पूछना चाहता हूँ।`
                    )}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <Share2 size={13} />
                    <span>WhatsApp Owner</span>
                  </button>

                  <a
                    href="tel:9835044219"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition text-xs font-bold"
                    title="Direct Call Landlord"
                  >
                    <Phone size={14} />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
