import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Receipt, 
  Printer, 
  Calendar, 
  IndianRupee, 
  Wrench, 
  Zap, 
  Droplet, 
  Wifi, 
  Brush, 
  Paintbrush, 
  Building2, 
  HelpCircle, 
  X, 
  Camera, 
  Eye, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Property, RentRecord, PropertyExpense, ExpenseCategory, Language } from '../../types';
import { Button } from '../common/Button';

interface ExpensesViewProps {
  property: Property;
  rentRecords: RentRecord[];
  expenses: PropertyExpense[];
  language: Language;
  onAddExpense: (expense: Omit<PropertyExpense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; icon: any; color: string; bg: string }> = {
  'Plumbing': { label: 'Plumbing (नल/पाइप)', icon: Wrench, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'Electrical': { label: 'Electrical (बिजली)', icon: Zap, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'Water Tanker': { label: 'Water Tanker (पानी टैंकर)', icon: Droplet, color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  'WiFi': { label: 'WiFi & Internet', icon: Wifi, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  'Cleaning & Sweeper': { label: 'Cleaning & Sweeper (सफाई)', icon: Brush, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'Repairs & Painting': { label: 'Repairs & Paint (रंगाई/मरम्मत)', icon: Paintbrush, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  'Govt & Municipal': { label: 'Govt & Municipal (टैक्स)', icon: Building2, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  'Other': { label: 'Other Misc (अन्य)', icon: HelpCircle, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' }
};

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  property,
  rentRecords,
  expenses,
  language: _language,
  onAddExpense,
  onDeleteExpense
}) => {
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthName);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Expense Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Plumbing');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidTo, setPaidTo] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);

  // All available months from rentRecords and expenses
  const allMonths = Array.from(new Set([
    currentMonthName,
    'October 2026',
    'September 2026',
    ...rentRecords.filter(r => r.propertyId === property.id).map(r => r.month),
    ...expenses.filter(e => e.propertyId === property.id).map(e => {
      const d = new Date(e.date);
      return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    })
  ])).filter(Boolean);

  // Filter expenses for this property & month
  const propExpenses = expenses.filter(e => {
    if (e.propertyId !== property.id) return false;
    if (selectedMonth === 'all') return true;
    const d = new Date(e.date);
    const m = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return m === selectedMonth;
  });

  const filteredExpenses = propExpenses.filter(e => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  // Rent collected for this property & month
  const propRentRecords = rentRecords.filter(r => {
    if (r.propertyId !== property.id) return false;
    if (selectedMonth === 'all') return true;
    return r.month === selectedMonth;
  });

  const totalRentCollected = propRentRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const totalExpenses = propExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netRentalProfit = totalRentCollected - totalExpenses;
  const profitMargin = totalRentCollected > 0 
    ? Math.round((netRentalProfit / totalRentCollected) * 100) 
    : 0;

  // Breakdown by category
  const categoryTotals: Record<string, number> = {};
  propExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await Promise.resolve(onAddExpense({
        propertyId: property.id,
        title,
        category,
        amount: Number(amount),
        date,
        paidTo: paidTo.trim() || undefined,
        notes: notes.trim() || undefined,
        receiptPhoto: receiptPhoto || undefined
      }));

      setTitle('');
      setAmount('');
      setPaidTo('');
      setNotes('');
      setReceiptPhoto(null);
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintPnl = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Maintenance Expenses & Net Profit Khata</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              खर्चा और मुनाफा
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track plumbers, electricians, water tankers, and see your exact take-home rental profit after expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Time (कुल रिकॉर्ड)</option>
            {allMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Rent Inflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Rent Collected (कुल किराया जमा)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <IndianRupee size={15} />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{totalRentCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>{propRentRecords.filter(r => r.status === 'paid').length} Paid Rooms ({selectedMonth})</span>
          </div>
        </div>

        {/* Expense Outflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Operating Expenses (कुल खर्चा)</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <TrendingDown size={15} />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {propExpenses.length} Expense vouchers recorded
          </div>
        </div>

        {/* Net Profit (The Magic KPI) */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-200">
            <span>Net Take-Home Rental Profit (शुद्ध लाभ)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold">
              {profitMargin}% Margin
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2 flex items-center">
            ₹{netRentalProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-200/90 mt-1 flex items-center gap-1">
            <ArrowUpRight size={13} />
            <span>In Hand after all repairs & bills</span>
          </div>
        </div>

      </div>

      {/* Category Breakdown Progress Bar */}
      {totalExpenses > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Expense Category Distribution (खर्च का विवरण)</span>
            <span className="text-slate-400 font-normal">Total: ₹{totalExpenses.toLocaleString('en-IN')}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map(cat => {
              const catAmount = categoryTotals[cat] || 0;
              if (catAmount === 0) return null;
              const percent = Math.round((catAmount / totalExpenses) * 100);
              const conf = CATEGORY_CONFIG[cat];
              const Icon = conf.icon;

              return (
                <div key={cat} className={`p-3 rounded-xl border ${conf.bg} flex items-center gap-2.5`}>
                  <div className={`p-1.5 rounded-lg bg-white ${conf.color} shadow-xs`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-slate-800 truncate">{conf.label}</div>
                    <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                      ₹{catAmount.toLocaleString('en-IN')} <span className="text-[10px] text-slate-500 font-normal">({percent}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-base">Expense Vouchers ({filteredExpenses.length})</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white"
            >
              <option value="all">All Categories</option>
              {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map(cat => (
                <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrintPnl}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Printer size={13} />
            <span>Print P&L Summary</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Date & Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Paid To / Vendor</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Receipt size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No expenses recorded for this period.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click "Add Expense" to log repairs, maintenance, or bill payments.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(expense => {
                  const conf = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG['Other'];
                  const Icon = conf.icon;

                  return (
                    <tr key={expense.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {expense.title}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} />
                          <span>{expense.date}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${conf.bg} ${conf.color}`}>
                          <Icon size={12} />
                          <span>{expense.category}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {expense.paidTo || '—'}
                      </td>

                      <td className="py-3 px-4 text-slate-500 truncate max-w-[180px]">
                        {expense.notes || '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-black text-sm text-rose-700">
                          -₹{expense.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {expense.receiptPhoto && (
                          <button
                            type="button"
                            onClick={() => setViewingReceipt(expense.receiptPhoto!)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition inline-block align-middle cursor-pointer"
                            title="View Attached Receipt Photo"
                          >
                            <Camera size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete expense "${expense.title}"?`)) {
                              onDeleteExpense(expense.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition inline-block align-middle cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            
            <div className="bg-slate-900 text-white p-5 relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
              <h2 className="text-lg font-bold tracking-tight">Record Operating Expense</h2>
              <p className="text-xs text-slate-300 mt-0.5">Log maintenance cost for {property.name}</p>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-3.5 overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Tap repair Room 201"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map(cat => (
                      <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value) || '')}
                      placeholder="e.g. 450"
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Paid To / Worker Name</label>
                <input
                  type="text"
                  value={paidTo}
                  onChange={e => setPaidTo(e.target.value)}
                  placeholder="e.g. Raju Plumber (Mob: 9835xxxxxx)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Replaced ball valve in terrace water tank"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Receipt Snapshot upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bill / Receipt Snapshot (Optional)</label>
                {receiptPhoto ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-900 flex items-center justify-center">
                    <img src={receiptPhoto} alt="Bill receipt" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setReceiptPhoto(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-rose-600 text-white cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50 transition text-xs text-slate-600">
                    <Camera size={16} className="text-slate-400" />
                    <span>Upload Bill / Receipt Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            if (typeof ev.target?.result === 'string') {
                              setReceiptPhoto(ev.target.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  isLoading={isSubmitting}
                  loadingText="Saving Voucher..."
                >
                  Save Expense Voucher
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Receipt Photo Lightbox */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-4 overflow-hidden relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
              <span className="text-xs font-bold">Expense Receipt / Bill Proof</span>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-3 rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              <img src={viewingReceipt} alt="Expense Bill Receipt" className="max-h-[68vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
