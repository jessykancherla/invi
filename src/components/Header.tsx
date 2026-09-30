import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Calendar, 
  ChevronDown, 
  X, 
  Bell, 
  Building2, 
  UserCheck, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  Cpu,
  Download 
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { NotificationCenterModal } from './NotificationCenterModal';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { searchQuery, setSearchQuery, metrics, setIsESP32ConsoleModalOpen, openExportModal } = useExamContext();
  const { user, role, college, logout, quickLogin } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // User initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')
    : 'JD';

  const roleLabel =
    role === 'coordinator'
      ? 'Exam Coordinator'
      : role === 'invigilator'
      ? 'Invigilator'
      : 'Staff Viewer';

  const roleColor =
    role === 'coordinator'
      ? 'bg-[#6B1120] text-white'
      : role === 'invigilator'
      ? 'bg-emerald-600 text-white'
      : 'bg-indigo-600 text-white';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/70 px-6 py-3 transition-shadow">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side: Mobile Menu Button & Search Input */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              id="mobile-menu-btn"
              onClick={onOpenSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                placeholder="Search exams, halls, staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-2 text-xs bg-[#F4F5F7] border border-slate-200/60 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all font-normal"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Institution, Date, Hardware, Notifications & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Institution Badge */}
            {college?.name && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 max-w-[220px] truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{college.name}</span>
              </div>
            )}

            {/* Date Indicator Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white text-xs font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-600 stroke-[1.8]" />
              <span>Tue, 27 May 2025</span>
            </div>

            {/* ESP32 Hardware Console Quick Button */}
            <button
              onClick={() => setIsESP32ConsoleModalOpen(true)}
              title="Open ESP32 Hardware & BLE Console"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">ESP32 Hub</span>
            </button>

            {/* Export Center Quick Button */}
            <button
              id="header-export-btn"
              onClick={() => openExportModal('exams')}
              title="Export examination timetable, duty roster, and reports (CSV, PDF, JSON)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Notification Bell with Badge */}
            <button
              id="header-notif-btn"
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {metrics.unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6B1120] ring-2 ring-white" />
              )}
            </button>

            {/* Subtle Vertical Divider */}
            <div className="hidden sm:block h-5 w-px bg-slate-200" />

            {/* User Profile Menu */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 cursor-pointer select-none text-left p-1 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#4A0E17] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  {initials}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {user?.name || 'Sign In'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.name || 'Guest User'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <div className="mt-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColor}`}>
                        {roleLabel}
                      </span>
                    </div>
                  </div>

                  {/* Role Switcher for Evaluator/Testing */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                    <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Switch Role (Demo)
                    </p>
                    <div className="space-y-1">
                      <button
                        onClick={async () => {
                          await quickLogin('coordinator');
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                          role === 'coordinator'
                            ? 'bg-[#6B1120] text-white font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>Exam Coordinator</span>
                        {role === 'coordinator' && <ShieldCheck className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={async () => {
                          await quickLogin('invigilator');
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                          role === 'invigilator'
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>Invigilator (Mr. Lewis)</span>
                        {role === 'invigilator' && <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={async () => {
                          await quickLogin('viewer');
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                          role === 'viewer'
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>Staff Observer (Viewer)</span>
                        {role === 'viewer' && <ShieldCheck className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 text-slate-400" />
                      <span>Switch Account / Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Modals triggered from Header */}
      <NotificationCenterModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
