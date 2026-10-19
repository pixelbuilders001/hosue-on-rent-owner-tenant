import React, { useState } from 'react';
import { OwnerProfile, TenantProfile, UserRole } from '../../types';
import { X, ShieldCheck, Check, Sparkles, Phone, Building2, GraduationCap, Lock, LogOut } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface AuthModalProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  profile: OwnerProfile;
  tenantProfile: TenantProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: OwnerProfile) => void;
  onUpdateTenantProfile: (updated: TenantProfile) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  userEmail?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentRole,
  onSelectRole,
  profile,
  tenantProfile,
  isOpen,
  onClose,
  onUpdateProfile,
  onUpdateTenantProfile,
  isAuthenticated,
  onLogout,
  userEmail
}) => {
  if (!isOpen) return null;

  const activeProf = currentRole === 'owner' ? profile : tenantProfile;
  const avatarUrl = activeProf.avatarUrl;
  const displayName = activeProf.fullName || 'User';
  const userInitial = displayName.charAt(0).toUpperCase() || 'U';

  const [inputPhone, setInputPhone] = useState(
    currentRole === 'owner' ? profile.phone : tenantProfile.phone
  );
  const [inputName, setInputName] = useState(
    currentRole === 'owner' ? profile.fullName : tenantProfile.fullName
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/?role=${currentRole}`
        }
      });
    } else {
      alert("Google OAuth is simulated! You can switch roles or update credentials below.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'owner') {
      onUpdateProfile({
        ...profile,
        fullName: inputName,
        phone: inputPhone
      });
    } else {
      onUpdateTenantProfile({
        ...tenantProfile,
        fullName: inputName,
        phone: inputPhone
      });
    }
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          role: currentRole,
          full_name: inputName,
          phone: inputPhone
        }).eq('id', user.id);
      }
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isAuthenticated ? 'Account & Session' : 'Account & Sign In'}
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {isAuthenticated ? (
          <div className="my-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Active Session
              </span>
              <span className="text-[11px] font-semibold text-slate-500 capitalize">
                Role: {currentRole === 'owner' ? 'Host (मालिक)' : 'Tenant (किरायेदार)'}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  currentRole === 'owner' ? 'bg-emerald-700' : 'bg-blue-600'
                }`}>
                  {userInitial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 text-sm truncate">
                  {displayName}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {userEmail || activeProf.email || 'Signed in via Google'}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
              <Lock size={14} className="text-amber-700 shrink-0 mt-0.5" />
              <span>
                Role locked to <b>{currentRole === 'owner' ? 'Host (मालिक)' : 'Tenant (किरायेदार)'}</b>. To switch roles, please log out first.
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <LogOut size={15} />
              <span>Log Out from {currentRole === 'owner' ? 'Host' : 'Tenant'}</span>
            </button>
          </div>
        ) : (
          <>
            <div className="my-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 mx-auto flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-700/20">
                ⌂
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">RoomSaathi Account</h3>
                <p className="text-xs text-slate-500">Select your role to sign in</p>
              </div>
            </div>

            {/* Role Chooser Cards */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <button
                type="button"
                onClick={() => {
                  onSelectRole('owner');
                  setInputName(profile.fullName);
                  setInputPhone(profile.phone);
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  currentRole === 'owner'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <Building2 size={20} className={currentRole === 'owner' ? 'text-emerald-700' : 'text-slate-500'} />
                  {currentRole === 'owner' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-slate-900 text-xs">Property Owner</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Manage PG, rooms, rent khata & leads</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectRole('tenant');
                  setInputName(tenantProfile.fullName);
                  setInputPhone(tenantProfile.phone);
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  currentRole === 'tenant'
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <GraduationCap size={20} className={currentRole === 'tenant' ? 'text-blue-600' : 'text-slate-500'} />
                  {currentRole === 'tenant' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-slate-900 text-xs">Tenant / Student</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Find rooms, pay rent & track bills</div>
                </div>
              </button>
            </div>

            {/* Google Sign in button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google as {currentRole === 'owner' ? 'Host' : 'Tenant'}</span>
            </button>
          </>
        )}

        {/* Profile Update Details */}
        <form onSubmit={handleSaveProfile} className="space-y-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
            <input
              type="text"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">WhatsApp / Phone Number</label>
            <input
              type="tel"
              value={inputPhone}
              onChange={e => setInputPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            {savedSuccess ? <Check size={14} /> : null}
            <span>{savedSuccess ? 'Saved!' : 'Save & Continue'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
