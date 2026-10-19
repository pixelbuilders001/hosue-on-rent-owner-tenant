import React from 'react';
import { 
  LayoutDashboard, 
  DoorClosed, 
  MessageSquareShare, 
  UsersRound, 
  ReceiptIndianRupee, 
  Wrench, 
  Settings,
  Compass,
  Home,
  Clock,
  Heart
} from 'lucide-react';
import { Language, UserRole } from '../../types';
import { t } from '../../services/i18n';

export type TabType = 
  | 'dashboard' 
  | 'rooms' 
  | 'leads' 
  | 'tenants' 
  | 'billing' 
  | 'complaints' 
  | 'settings'
  // Tenant specific tabs
  | 'explore'
  | 'mystay'
  | 'myinquiries'
  | 'saved';

interface SidebarProps {
  currentRole: UserRole;
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  language: Language;
  leadsCount: number;
  dueRentsCount: number;
  openComplaintsCount: number;
  savedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentTab,
  onSelectTab,
  language,
  leadsCount,
  dueRentsCount,
  openComplaintsCount,
  savedCount
}) => {
  const ownerNavItems = [
    {
      id: 'dashboard' as TabType,
      label: t(language, 'dashboard'),
      icon: LayoutDashboard,
      badge: 0
    },
    {
      id: 'rooms' as TabType,
      label: t(language, 'roomsAndBeds'),
      icon: DoorClosed,
      badge: 0
    },
    {
      id: 'leads' as TabType,
      label: t(language, 'leads'),
      icon: MessageSquareShare,
      badge: leadsCount
    },
    {
      id: 'tenants' as TabType,
      label: t(language, 'tenants'),
      icon: UsersRound,
      badge: 0
    },
    {
      id: 'billing' as TabType,
      label: t(language, 'billing'),
      icon: ReceiptIndianRupee,
      badge: dueRentsCount
    },
    {
      id: 'complaints' as TabType,
      label: t(language, 'complaints'),
      icon: Wrench,
      badge: openComplaintsCount
    },
    {
      id: 'settings' as TabType,
      label: t(language, 'settings'),
      icon: Settings,
      badge: 0
    }
  ];

  const tenantNavItems = [
    {
      id: 'explore' as TabType,
      label: 'Explore Rooms (कमरे खोजें)',
      icon: Compass,
      badge: 0
    },
    {
      id: 'mystay' as TabType,
      label: 'My Room & Bills (मेरा कमरा)',
      icon: Home,
      badge: 0
    },
    {
      id: 'myinquiries' as TabType,
      label: 'Visits & Inquiries (विज़िट)',
      icon: Clock,
      badge: 0
    },
    {
      id: 'saved' as TabType,
      label: 'Saved Rooms (पसंदीदा)',
      icon: Heart,
      badge: savedCount
    },
    {
      id: 'complaints' as TabType,
      label: 'Maintenance (शिकायतें)',
      icon: Wrench,
      badge: 0
    }
  ];

  const navItems = currentRole === 'owner' ? ownerNavItems : tenantNavItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4">
        
        <div className="mb-3 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {currentRole === 'owner' ? 'Owner OS · Portal' : 'Tenant Portal · Samastipur'}
        </div>

        <div className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? currentRole === 'owner'
                      ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-900/10'
                      : 'bg-blue-600 text-white shadow-sm shadow-blue-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom PWA notice */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>📱</span> RoomSaathi Web App
            </div>
            <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
              Tap "Add to Home Screen" on mobile for instant zero-login access.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-1.5 px-2 flex justify-around items-center">
        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl relative ${
                isActive 
                  ? currentRole === 'owner' ? 'text-emerald-800 font-bold' : 'text-blue-600 font-bold'
                  : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <Icon size={19} className={
                  isActive 
                    ? currentRole === 'owner' ? 'text-emerald-700' : 'text-blue-600'
                    : 'text-slate-400'
                } />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 max-w-[60px] truncate">
                {item.id === 'dashboard' ? 'Home' : item.id === 'rooms' ? 'Rooms' : item.id === 'explore' ? 'Explore' : item.id === 'mystay' ? 'My Stay' : item.id === 'leads' ? 'Leads' : item.id === 'billing' ? 'Billing' : 'Menu'}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
