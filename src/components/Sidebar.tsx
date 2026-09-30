import React from 'react';
import { 
  Home, 
  FileText, 
  Landmark, 
  Users, 
  Tablet, 
  Cpu, 
  History, 
  Settings, 
  X, 
  ShieldCheck 
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { NavigationPage } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage } = useExamContext();
  const { role, user } = useAuth();

  const navItems: {
    id: NavigationPage;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: FileText,
    },
    {
      id: 'halls',
      label: 'Halls',
      icon: Landmark,
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: Users,
    },
    {
      id: 'devices',
      label: 'Devices',
      icon: Tablet,
    },
    {
      id: 'esp32',
      label: 'ESP32 Hub',
      icon: Cpu,
      badge: 'Live',
    },
    {
      id: 'replacements',
      label: 'Replacements',
      icon: History,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (page: NavigationPage) => {
    setActivePage(page);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#4A0E17] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Official INVI Brand Header */}
          <div className="pt-7 pb-6 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-extrabold text-amber-300 text-sm tracking-widest font-sans shadow-xs">
                IN
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-[0.25em] text-white font-sans leading-none">
                  I N V I
                </h1>
                <p className="text-[10px] text-white/50 tracking-wider uppercase font-medium mt-0.5">
                  Smart Invigilation
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-white/70 hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#5C1523] text-white font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-4 h-4 shrink-0 stroke-[1.8]" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Slogan & Current Role Indicator */}
        <div className="p-5 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/20 border border-white/5 text-xs text-white/80">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-white/50 uppercase tracking-wider leading-none">Logged as</p>
              <p className="font-semibold text-white truncate text-[11px] mt-0.5 capitalize">
                {role === 'coordinator' ? 'Chief Coordinator' : role}
              </p>
            </div>
          </div>

          <p className="text-xs text-white/60 font-normal leading-relaxed px-1">
            Smarter Exams<br />
            Brighter Tomorrow
          </p>
        </div>
      </aside>
    </>
  );
};
