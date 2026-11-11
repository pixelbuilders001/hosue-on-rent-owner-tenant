import React, { useState } from 'react';
import { OwnerProfile } from '../../types';
import { X, ShieldCheck, Check, Sparkles, Phone, Building2, Lock, LogOut } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface AuthModalProps {
  profile: OwnerProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: OwnerProfile) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  userEmail?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
  isAuthenticated,
  onLogout,
  userEmail
}) => {
  if (!isOpen) return null;

  const avatarUrl = profile.avatarUrl;
  const displayName = profile.fullName || 'Host';
  const userInitial = displayName.charAt(0).toUpperCase() || 'H';

  const [inputPhone, setInputPhone] = useState(profile.phone);
  const [inputName, setInputName] = useState(profile.fullName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/?role=owner`
        }
      });
    } else {
      alert("Google OAuth is simulated! You can update credentials below.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      fullName: inputName,
      phone: inputPhone
    });
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          role: 'owner',
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
              <span className="text-[11px] font-semibold text-emerald-700">
                Host Portal
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-emerald-700">
                  {userInitial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 text-sm truncate">
                  {displayName}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {userEmail || profile.email || 'Signed in via Google'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <>
            <div className="my-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 mx-auto flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-700/20">
                ⌂
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">RoomSaathi Host Portal</h3>
                <p className="text-xs text-slate-500">Sign in with Google to manage your properties & rent collections</p>
              </div>
            </div>

            {/* Google Sign in button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition mb-4 cursor-pointer"
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
              <span>Continue with Google as Host</span>
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
