import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  Check, 
  QrCode,
  Sparkles,
  Database
} from 'lucide-react';
import { OwnerProfile, Language } from '../../types';
import { hasSupabase } from '../../services/supabase';

interface SettingsViewProps {
  profile: OwnerProfile;
  language: Language;
  onUpdateProfile: (updated: OwnerProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  language,
  onUpdateProfile
}) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [upiId, setUpiId] = useState(profile.upiId);
  const [city, setCity] = useState(profile.city);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      fullName,
      phone,
      email,
      businessName,
      upiId,
      city
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isSupabaseActive = hasSupabase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Owner Profile & Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, UPI payout address, and property manager credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-600/30 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl ring-2 ring-emerald-600/30 shadow-xs">
                {profile.fullName.charAt(0).toUpperCase() || 'O'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">{profile.fullName}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck size={13} /> KYC Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Signed in via Google OAuth · Permanent Session Active</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business / Brand Name</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp / Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Used for tenant inquiries and rent payment confirmations.</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Google Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 text-slate-500 cursor-not-allowed"
                disabled
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Operating City & Region</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* UPI & Rent Collection Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
            <CreditCard size={18} className="text-emerald-700" />
            <span>UPI Rent Collection Setup (ऑनलाइन किराया खाता)</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your UPI ID (VPA)</label>
              <input
                type="text"
                placeholder="e.g. 9835044219@paytm or rajesh@okaxis"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                This UPI ID is automatically attached to every monthly rent bill and WhatsApp reminder sent to residents.
              </span>
            </div>
          </div>
        </div>

        {/* System & Database Status */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database size={18} className="text-slate-400" />
            <div>
              <div className="font-bold text-slate-800">Database Connection</div>
              <div className="text-[11px] text-slate-500">
                {isSupabaseActive ? '🟢 Connected to Live Supabase PostgreSQL' : '🟡 Offline-first Local Storage (Ready for Supabase credentials)'}
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] font-semibold text-slate-500">
            Version 1.0 (Production Release)
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Check size={14} /> Settings Saved Successfully!
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <Save size={15} />
            <span>Save Profile</span>
          </button>
        </div>

      </form>

    </div>
  );
};
