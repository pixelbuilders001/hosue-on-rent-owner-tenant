import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  Plus, 
  X, 
  Filter 
} from 'lucide-react';
import { Property, Complaint, Language } from '../../types';
import { t } from '../../services/i18n';

interface ComplaintsViewProps {
  property: Property;
  complaints: Complaint[];
  language: Language;
  onUpdateComplaintStatus: (id: string, status: Complaint['status'], note?: string) => void;
  onAddComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt'>) => void;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  property,
  complaints,
  language,
  onUpdateComplaintStatus,
  onAddComplaint
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [resolveTarget, setResolveTarget] = useState<Complaint | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // Add Complaint Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [roomNumber, setRoomNumber] = useState('101');
  const [tenantName, setTenantName] = useState('');
  const [category, setCategory] = useState<Complaint['category']>('Plumbing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Complaint['priority']>('medium');

  const propComplaints = complaints.filter(c => c.propertyId === property.id);
  const filtered = filterStatus === 'all'
    ? propComplaints
    : propComplaints.filter(c => c.status === filterStatus);

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTarget) return;

    onUpdateComplaintStatus(resolveTarget.id, 'resolved', adminNote);
    setResolveTarget(null);
    setAdminNote('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !roomNumber) return;

    onAddComplaint({
      propertyId: property.id,
      propertyName: property.name,
      roomNumber,
      tenantName: tenantName || `Room ${roomNumber} Resident`,
      category,
      title,
      description,
      priority,
      status: 'open'
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Maintenance & Complaints Desk (शिकायत निवारण)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Resolve WiFi, plumbing, water, and electrical issues reported by residents before they escalate.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus size={16} />
          <span>Log Maintenance Issue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold text-slate-600">
        {[
          { id: 'all', label: 'All Tickets', count: propComplaints.length },
          { id: 'open', label: 'Open (नया)', count: propComplaints.filter(c => c.status === 'open').length },
          { id: 'in_progress', label: 'In Progress (कार्य जारी)', count: propComplaints.filter(c => c.status === 'in_progress').length },
          { id: 'resolved', label: 'Resolved (हल किया)', count: propComplaints.filter(c => c.status === 'resolved').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filterStatus === tab.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              filterStatus === tab.id ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No active maintenance issues!</h3>
            <p className="mt-1">All rooms and facilities are in good condition.</p>
          </div>
        ) : (
          filtered.map(comp => {
            const isOpen = comp.status === 'open';
            const isInProg = comp.status === 'in_progress';
            const isResolved = comp.status === 'resolved';

            return (
              <div 
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      Room {comp.roomNumber}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{comp.title}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      comp.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {comp.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {comp.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Category: <b>{comp.category}</b></span>
                    <span>Reported by: <b>{comp.tenantName}</b></span>
                    <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                  </div>

                  {comp.adminNote && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 mt-1 inline-block">
                      <b>Owner Note:</b> {comp.adminNote}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0">
                  {isOpen && (
                    <button
                      onClick={() => onUpdateComplaintStatus(comp.id, 'in_progress', 'Plumber/Electrician assigned')}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-xl transition"
                    >
                      Mark In-Progress
                    </button>
                  )}

                  {!isResolved && (
                    <button
                      onClick={() => setResolveTarget(comp)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition shadow-2xs"
                    >
                      Resolve Issue
                    </button>
                  )}

                  {isResolved && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl text-xs font-semibold border border-emerald-200">
                      <CheckCircle2 size={14} /> Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Close & Resolve Ticket</h3>
              <button onClick={() => setResolveTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                Resolving: <b>{resolveTarget.title}</b> (Room {resolveTarget.roomNumber})
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Note</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Tap washer replaced by electrician Mukesh today at 4 PM."
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolveTarget(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Log Maintenance Ticket</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option>Plumbing</option>
                    <option>Electricity</option>
                    <option>WiFi</option>
                    <option>Cleaning</option>
                    <option>Food</option>
                    <option>Noise</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Geyser not heating in Room 102"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details of the issue..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
