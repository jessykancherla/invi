import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  FileText, 
  UserCheck, 
  ArrowRightLeft, 
  Clock 
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { NotificationItem } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useExamContext();
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'assignment':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'replacement':
        return <ArrowRightLeft className="w-4 h-4 text-amber-600" />;
      case 'absence_alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B1120]/10 flex items-center justify-center text-[#6B1120]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notification Center</h2>
              <p className="text-xs text-slate-500">
                Exam assignments, replacements, and telemetry presence alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Mark all read */}
        <div className="flex items-center justify-between gap-2 mt-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'unread', 'assignment', 'replacement', 'absence_alert'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize cursor-pointer transition-colors ${
                  filterType === f
                    ? 'bg-[#6B1120] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => markAllNotificationsRead()}
            className="text-[11px] font-semibold text-[#6B1120] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No notifications matching your filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !item.read
                    ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/60 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#6B1120] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 mt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
