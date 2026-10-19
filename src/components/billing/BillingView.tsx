import React, { useState } from 'react';
import { 
  Zap, 
  IndianRupee, 
  Share2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Receipt, 
  FileText, 
  Copy, 
  Check, 
  Calendar,
  Send
} from 'lucide-react';
import { Property, RentRecord, Tenant, Room, OwnerProfile, Language } from '../../types';
import { t } from '../../services/i18n';

interface BillingViewProps {
  property: Property;
  profile: OwnerProfile;
  rentRecords: RentRecord[];
  tenants: Tenant[];
  rooms: Room[];
  language: Language;
  onRecordRentPayment: (record: Omit<RentRecord, 'id'>) => void;
  onUpdatePaymentStatus: (recordId: string, status: RentRecord['status'], method?: RentRecord['paymentMethod'], ref?: string) => void;
  onViewReceipt: (record: RentRecord) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  property,
  profile,
  rentRecords,
  tenants,
  rooms,
  language,
  onRecordRentPayment,
  onUpdatePaymentStatus,
  onViewReceipt
}) => {
  const [activeTab, setActiveTab] = useState<'khata' | 'meter_calc'>('khata');
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  // Electricity Calculator State
  const [calcRoomNumber, setCalcRoomNumber] = useState('101');
  const [prevReading, setPrevReading] = useState(1240);
  const [currReading, setCurrReading] = useState(1285);
  const [unitRate, setUnitRate] = useState(property.electricityRate || 9);
  const [calcBaseRent, setCalcBaseRent] = useState(4500);
  const [calcWifi, setCalcWifi] = useState(property.wifiCost || 150);
  const [calcOther, setCalcOther] = useState(0);
  const [copiedBill, setCopiedBill] = useState(false);

  // Quick Pay Modal State
  const [payTarget, setPayTarget] = useState<RentRecord | null>(null);
  const [payMethod, setPayMethod] = useState<RentRecord['paymentMethod']>('UPI');
  const [transactionRef, setTransactionRef] = useState('');

  // New Bill Entry Modal
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [newBillTenantId, setNewBillTenantId] = useState('');
  const [newBillUnits, setNewBillUnits] = useState(0);
  const [newBillAmount, setNewBillAmount] = useState(4000);

  const propRecords = rentRecords.filter(r => r.propertyId === property.id && r.month === selectedMonth);
  const propTenants = tenants.filter(t => t.propertyId === property.id && t.status === 'active');

  const totalCollected = propRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const totalPending = propRecords
    .filter(r => r.status === 'pending' || r.status === 'overdue')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const overdueCount = propRecords.filter(r => r.status === 'overdue').length;

  // Meter calculations
  const consumedUnits = Math.max(0, currReading - prevReading);
  const electricityTotal = Math.round(consumedUnits * unitRate);
  const grandTotal = calcBaseRent + electricityTotal + calcWifi + calcOther;

  // WhatsApp bill text
  const generateBillText = () => {
    return `नमस्ते, ${property.name} से आपके कमरा (${calcRoomNumber}) का इस महीने का बिल विवरण:\n` +
      `--------------------------------\n` +
      `• मूल किराया (Rent): ₹${calcBaseRent.toLocaleString('en-IN')}\n` +
      `• बिजली रीडिंग: ${prevReading} से ${currReading} = ${consumedUnits} यूनिट × ₹${unitRate} = ₹${electricityTotal.toLocaleString('en-IN')}\n` +
      (calcWifi > 0 ? `• वाई-फाई / मेंटेनेंस: ₹${calcWifi}\n` : '') +
      `--------------------------------\n` +
      `★ कुल देय राशि (Total Due): ₹${grandTotal.toLocaleString('en-IN')}\n` +
      `कृपया इस UPI पर भेजें: ${profile.upiId || '9835044219@upi'}\n` +
      `धन्यवाद!`;
  };

  const openWhatsApp = (phone: string, text: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleaned.startsWith('91') ? cleaned : '91' + cleaned}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateBillText());
    setCopiedBill(true);
    setTimeout(() => setCopiedBill(false), 2500);
  };

  const handlePayConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTarget) return;

    onUpdatePaymentStatus(payTarget.id, 'paid', payMethod, transactionRef || 'DIRECT-VERIFIED');
    setPayTarget(null);
    setTransactionRef('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Rent Khata & Electricity Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sub-meter calculator, UPI rent collection ledger, and automated WhatsApp payment reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
            <button
              onClick={() => setActiveTab('khata')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'khata' ? 'bg-white shadow-xs font-bold text-emerald-800' : 'hover:text-slate-900'
              }`}
            >
              Rent Khata (रजिस्टर)
            </button>
            <button
              onClick={() => setActiveTab('meter_calc')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                activeTab === 'meter_calc' ? 'bg-white shadow-xs font-bold text-emerald-800' : 'hover:text-slate-900'
              }`}
            >
              <Zap size={14} className="text-amber-500" />
              <span>Meter Calculator</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'meter_calc' ? (
        /* Smart Electricity Sub-Meter Calculator View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form: Readings Input */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-3 border-b border-slate-100">
              <Zap size={20} className="text-amber-500" />
              <span>Electricity Sub-Meter Calculator (सब-मीटर कैलकुलेटर)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Room</label>
                <select
                  value={calcRoomNumber}
                  onChange={e => {
                    setCalcRoomNumber(e.target.value);
                    const rm = rooms.find(r => r.roomNumber === e.target.value);
                    if (rm) setCalcBaseRent(rm.baseRent);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {rooms.filter(r => r.propertyId === property.id).map(r => (
                    <option key={r.id} value={r.roomNumber}>Room {r.roomNumber} ({r.roomType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rate per Unit (₹/kWh)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step={0.5}
                    value={unitRate}
                    onChange={e => setUnitRate(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Month Reading (पिछली)</label>
                <input
                  type="number"
                  value={prevReading}
                  onChange={e => setPrevReading(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Reading (आज की)</label>
                <input
                  type="number"
                  value={currReading}
                  onChange={e => setCurrReading(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-emerald-400 bg-emerald-50 text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2 flex items-center justify-between text-xs pt-2 border-t border-slate-200 text-slate-600">
                <span>Units Consumed: <b>{consumedUnits} kWh Units</b></span>
                <span className="font-bold text-emerald-800 text-sm">
                  {consumedUnits} × ₹{unitRate} = ₹{electricityTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Rent (₹)</label>
                <input
                  type="number"
                  value={calcBaseRent}
                  onChange={e => setCalcBaseRent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WiFi / Maintenance (₹)</label>
                <input
                  type="number"
                  value={calcWifi}
                  onChange={e => setCalcWifi(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Other / Mess (₹)</label>
                <input
                  type="number"
                  value={calcOther}
                  onChange={e => setCalcOther(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-800 font-semibold">Total Monthly Bill to Tenant</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-900">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white text-emerald-900 hover:bg-emerald-100 rounded-xl text-xs font-bold border border-emerald-300 shadow-2xs transition"
                >
                  {copiedBill ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                  <span>{copiedBill ? 'Copied!' : 'Copy Bill'}</span>
                </button>

                <button
                  onClick={() => {
                    const t = propTenants.find(x => x.roomNumber === calcRoomNumber);
                    if (t) openWhatsApp(t.phone, generateBillText());
                    else openWhatsApp('', generateBillText());
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <Share2 size={14} />
                  <span>Send on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Preview: Live WhatsApp Message Simulator */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                WhatsApp Preview (जैसा किरायेदार को दिखेगा)
              </div>

              <div className="bg-[#e5ddd5] p-4 rounded-2xl shadow-inner font-sans text-xs text-slate-800 space-y-2 whitespace-pre-wrap leading-relaxed border border-amber-900/10">
                <div className="bg-white p-3 rounded-xl shadow-xs border-l-4 border-emerald-600">
                  {generateBillText()}
                  <div className="text-[10px] text-slate-400 text-right mt-1">11:42 AM ✓✓</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              💡 <b>Owner Pro-Tip:</b> Landlords using sub-meter calculations on WhatsApp experience 94% on-time rent payment with zero arguments over electricity bills.
            </div>
          </div>

        </div>
      ) : (
        /* Monthly Rent Khata (Collection Register) */
        <div className="space-y-6">
          
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Total Expected ({selectedMonth})</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                ₹{(totalCollected + totalPending).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{propRecords.length} Active rooms billed</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={14} /> Collected (जमा हुआ)
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
                ₹{totalCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">
                {propRecords.filter(r => r.status === 'paid').length} Paid
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                <Clock size={14} /> Pending (बाकी)
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-800 mt-1">
                ₹{totalPending.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-amber-600 mt-1">
                {propRecords.filter(r => r.status === 'pending').length} Awaiting payment
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                <AlertCircle size={14} /> Overdue (देरी से)
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-800 mt-1">
                {overdueCount} Tenants
              </div>
              <div className="text-[11px] text-rose-600 mt-1">Past due date (5th of month)</div>
            </div>

          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 text-base">Monthly Rent Register</span>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white"
                >
                  <option>October 2026</option>
                  <option>September 2026</option>
                  <option>August 2026</option>
                </select>
              </div>

              {/* Broadcast reminder button */}
              {totalPending > 0 && (
                <button
                  onClick={() => {
                    const pendingTenants = propRecords.filter(r => r.status !== 'paid');
                    if (pendingTenants.length > 0) {
                      const first = pendingTenants[0];
                      const t = propTenants.find(x => x.id === first.tenantId);
                      openWhatsApp(
                        t?.phone || '',
                        `नमस्ते ${first.tenantName} जी, ${property.name} का ${selectedMonth} का किराया ₹${first.totalAmount} बकाया है। कृपया UPI पर भुगतान करें: ${profile.upiId}`
                      );
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition"
                >
                  <Send size={13} />
                  <span>Send WhatsApp Due Reminder</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Room & Resident</th>
                    <th className="py-3 px-4">Base Rent</th>
                    <th className="py-3 px-4">Electricity (Units)</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {propRecords.map(record => {
                    const isPaid = record.status === 'paid';
                    const isOverdue = record.status === 'overdue';
                    const tenant = propTenants.find(t => t.id === record.tenantId);

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            Room {record.roomNumber} · {record.tenantName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Due: {record.dueDate} {record.paidDate && `· Paid on ${record.paidDate}`}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-700">
                          ₹{record.baseRent.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4">
                          {record.electricityUnits ? (
                            <div>
                              <span className="font-semibold text-slate-900">₹{record.electricityAmount}</span>
                              <span className="text-[11px] text-slate-400 block">({record.electricityUnits} units)</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Included</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-extrabold text-sm text-slate-900">
                            ₹{record.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {isPaid ? (
                            <button
                              onClick={() => onViewReceipt(record)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg transition inline-flex items-center gap-1"
                            >
                              <Receipt size={13} /> Receipt
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setPayTarget(record)}
                                className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-2xs"
                              >
                                Mark Paid
                              </button>
                              {tenant && (
                                <button
                                  onClick={() => openWhatsApp(
                                    tenant.phone,
                                    `नमस्ते ${tenant.fullName} जी, ${property.name} का ${record.month} का किराया ₹${record.totalAmount} बकाया है। कृपया UPI पर भेजें: ${profile.upiId}`
                                  )}
                                  className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg transition inline-block align-middle"
                                  title="WhatsApp Reminder"
                                >
                                  <Share2 size={15} />
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Record Rent Payment Modal */}
      {payTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Record Rent Payment</h3>
              <button onClick={() => setPayTarget(null)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <form onSubmit={handlePayConfirm} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                Recording payment for <b>{payTarget.tenantName}</b> (Room {payTarget.roomNumber})
                <div className="text-sm font-bold text-emerald-800 mt-1">
                  Total: ₹{payTarget.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash (नकद)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-REF-998822 or Handover to Guard"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayTarget(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  Confirm Payment & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
