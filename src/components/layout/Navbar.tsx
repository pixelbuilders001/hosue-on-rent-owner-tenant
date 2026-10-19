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
  Compass
} from 'lucide-react';
import { OwnerProfile, TenantProfile, Property, Language, UserRole } from '../../types';
import { t } from '../../services/i18n';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  profile: OwnerProfile;
  tenantProfile: TenantProfile;
  properties: Property[];
  activePropertyId: string;
  onSelectProperty: (id: string) => void;
  onOpenAddProperty: () => void;
  language: Language;
  onToggleLanguage: () => void;
  unreadCount: number;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  profile,
  tenantProfile,
  properties,
  activePropertyId,
  onSelectProperty,
  onOpenAddProperty,
  language,
  onToggleLanguage,
  unreadCount,
  onOpenProfile
}) => {
  const [showPropertyMenu, setShowPropertyMenu] = useState(false);
  const activeProperty = properties.find(p => p.id === activePropertyId) || properties[0];

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
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider hidden sm:inline ${
                  currentRole === 'owner' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentRole === 'owner' ? 'Host' : 'Tenant'}
                </span>
              </div>
            </div>

            {/* Desktop Property Selector (hidden on mobile) */}
            {currentRole === 'owner' && (
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
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition ${
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
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Add New Property
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center: Live Role Switcher (Host vs Tenant) */}
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-200 shadow-inner shrink-0">
            <button
              onClick={() => onSelectRole('owner')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition ${
                currentRole === 'owner'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={12} className="shrink-0" />
              <span>Host <span className="hidden md:inline">(मालिक)</span></span>
            </button>

            <button
              onClick={() => onSelectRole('tenant')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition ${
                currentRole === 'tenant'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap size={13} className="shrink-0" />
              <span>Tenant <span className="hidden md:inline">(किरायेदार)</span></span>
            </button>
          </div>

          {/* Right: Language, Notifications, Profile */}
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
              {unreadCount > 0 && currentRole === 'owner' && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar / Trigger */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 pl-1 pr-1 sm:pl-1.5 sm:pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition shrink-0"
            >
              <img
                src={currentRole === 'owner' ? profile.avatarUrl : tenantProfile.avatarUrl}
                alt="Profile"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-emerald-600/30"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentRole === 'owner' ? profile.fullName.split(' ')[0] : tenantProfile.fullName.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">{currentRole}</div>
              </div>
            </button>

          </div>

        </div>

        {/* Mobile Dedicated Sub-bar for Owner Property Selector */}
        {currentRole === 'owner' && (
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
        )}
      </div>
    </header>
  );
};
