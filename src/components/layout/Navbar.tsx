import React from 'react';
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
  const activeProperty = properties.find(p => p.id === activePropertyId) || properties[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Left: Brand & (Property Switcher if Owner) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 shrink-0">
                <span className="text-xl font-black tracking-tighter">⌂</span>
              </div>
              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">RoomSaathi</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    currentRole === 'owner' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {currentRole === 'owner' ? 'Partner' : 'Tenant'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  {currentRole === 'owner' ? t(language, 'tagline') : 'Samastipur · 100% Cost Transparency'}
                </div>
              </div>
            </div>

            {/* Owner: Property Selector */}
            {currentRole === 'owner' && (
              <div className="relative group ml-1 sm:ml-2">
                <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 transition cursor-pointer">
                  <Building2 size={15} className="text-emerald-700 shrink-0" />
                  <span className="truncate max-w-[100px] sm:max-w-[180px]">
                    {activeProperty?.name || 'Select Property'}
                  </span>
                  <ChevronDown size={14} className="text-slate-500" />
                </div>

                {/* Dropdown Menu */}
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 hidden group-hover:block hover:block z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {t(language, 'switchProperty')}
                  </div>
                  {properties.map(p => (
                    <button
                      key={p.id}
                      onClick={() => onSelectProperty(p.id)}
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
                      onClick={onOpenAddProperty}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Add New Property
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Center: Live Role Switcher (Owner vs Tenant) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button
              onClick={() => onSelectRole('owner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                currentRole === 'owner'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={13} />
              <span>Owner <span className="hidden sm:inline">(मालिक)</span></span>
            </button>

            <button
              onClick={() => onSelectRole('tenant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                currentRole === 'tenant'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap size={15} />
              <span>Tenant <span className="hidden sm:inline">(किरायेदार)</span></span>
            </button>
          </div>

          {/* Right: Language, Notifications, Profile */}
          <div className="flex items-center gap-2">
            
            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition hidden sm:flex"
              title="Change Language"
            >
              <Languages size={14} className="text-slate-500" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && currentRole === 'owner' && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar / Trigger */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-1.5 pr-1 sm:pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <img
                src={currentRole === 'owner' ? profile.avatarUrl : tenantProfile.avatarUrl}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-600/30"
              />
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentRole === 'owner' ? profile.fullName.split(' ')[0] : tenantProfile.fullName.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">{currentRole}</div>
              </div>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
