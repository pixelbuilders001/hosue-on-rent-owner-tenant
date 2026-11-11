import React, { useState } from 'react';
import { 
  Building2, 
  Languages, 
  Bell, 
  ChevronDown, 
  Plus, 
  GraduationCap,
  Sparkles,
  UsersRound,
  Compass,
  Lock,
  LogOut,
  User
} from 'lucide-react';
import { OwnerProfile, TenantProfile, Property, Language, UserRole } from '../../types';
import { t } from '../../services/i18n';

interface NavbarProps {
  profile: OwnerProfile;
  properties: Property[];
  activePropertyId: string;
  onSelectProperty: (id: string) => void;
  onOpenAddProperty: () => void;
  language: Language;
  onToggleLanguage: () => void;
  unreadCount: number;
  onOpenProfile: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  properties,
  activePropertyId,
  onSelectProperty,
  onOpenAddProperty,
  language,
  onToggleLanguage,
  unreadCount,
  onOpenProfile,
  isAuthenticated,
  onLogout
}) => {
  const [showPropertyMenu, setShowPropertyMenu] = useState(false);
  const activeProperty = properties.find(p => p.id === activePropertyId) || properties[0];

  const avatarUrl = profile.avatarUrl;
  const displayName = profile.fullName ? profile.fullName.split(' ')[0] : 'Host';
  const userInitial = displayName.charAt(0).toUpperCase() || 'H';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3">
          
          {/* Left: Brand & Desktop Property Selector */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 shrink-0">
                <span className="text-base sm:text-xl font-black tracking-tighter">⌂</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-lg">RoomSaathi</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider hidden sm:inline bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Host Portal
                </span>
              </div>
            </div>

            {/* Desktop Property Selector (hidden on mobile) */}
            <div className="relative hidden sm:block ml-1">
              <button
                type="button"
                onClick={() => setShowPropertyMenu(prev => !prev)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 transition cursor-pointer"
              >
                <Building2 size={14} className="text-emerald-700 shrink-0" />
                <span className="truncate max-w-[140px] md:max-w-[180px]">
                  {activeProperty?.name || 'Select Property'}
                </span>
                <ChevronDown size={13} className="text-slate-500 shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {showPropertyMenu && (
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {t(language, 'switchProperty')}
                  </div>
                  {properties.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProperty(p.id);
                        setShowPropertyMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${
                        p.id === activePropertyId ? 'bg-emerald-50/70 font-semibold text-emerald-900' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {p.availableBeds} free
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowPropertyMenu(false);
                        onOpenAddProperty();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} /> Add New Property
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Quick Add Property CTA (Desktop) */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onOpenAddProperty}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Property</span>
            </button>
          </div>

          {/* Right: Language, Notifications, Profile, Logout */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition hidden md:flex"
              title="Change Language"
            >
              <Languages size={14} className="text-slate-500" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Notification Bell */}
            <button
              className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition shrink-0"
              title="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar / Trigger */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 pl-1 pr-1 sm:pl-1.5 sm:pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition shrink-0"
              title={isAuthenticated ? "Account & Host Profile" : "Sign In / Profile"}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-emerald-600/30"
                />
              ) : (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold ring-1 ring-white bg-emerald-700">
                  {userInitial}
                </div>
              )}
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {displayName}
                </div>
                <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                  <span>Host</span>
                  {isAuthenticated && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Signed In" />}
                </div>
              </div>
            </button>

            {/* Quick Logout Button when Authenticated */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition text-[11px] sm:text-xs font-semibold shrink-0 cursor-pointer"
                title="Log Out"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Dedicated Sub-bar for Owner Property Selector */}
        <div className="sm:hidden pb-2 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-1">
            <div className="relative flex-1 min-w-0 pt-1.5">
              <button
                type="button"
                onClick={() => setShowPropertyMenu(prev => !prev)}
                className="w-full flex items-center justify-between gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 transition"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 size={13} className="text-emerald-700 shrink-0" />
                  <span className="truncate">{activeProperty?.name || 'Select Property'}</span>
                </div>
                <ChevronDown size={13} className="text-slate-500 shrink-0" />
              </button>

              {/* Mobile Dropdown */}
              {showPropertyMenu && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t(language, 'switchProperty')}
                  </div>
                  {properties.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProperty(p.id);
                        setShowPropertyMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition ${
                        p.id === activePropertyId ? 'bg-emerald-50/70 font-semibold text-emerald-900' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                        {p.availableBeds} free
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowPropertyMenu(false);
                        onOpenAddProperty();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5"
                    >
                      <Plus size={13} /> Add New Property
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onOpenAddProperty}
              className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 transition mt-1.5"
              title="Add New Property"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>
      </div>
    </header>
  );
};
