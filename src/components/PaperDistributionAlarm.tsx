import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle2, AlertTriangle, ShieldAlert, Volume2 } from 'lucide-react';
import { Exam, StaffMember } from '../types';

interface PaperDistributionAlarmProps {
  assignedExam?: Exam | null;
  staffProfile?: StaffMember | null;
}

export const PaperDistributionAlarm: React.FC<PaperDistributionAlarmProps> = ({
  assignedExam,
  staffProfile,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);

  useEffect(() => {
    if (!assignedExam) return;

    const calculateAlarm = () => {
      // Parse exam start time (e.g. "09:00")
      const [startHourStr, startMinStr] = (assignedExam.startTime || '09:00').split(':');
      const startHour = parseInt(startHourStr, 10);
      const startMin = parseInt(startMinStr, 10);

      const now = new Date();
      const examDate = new Date();
      examDate.setHours(startHour, startMin, 0, 0);

      // Paper distribution is 15 minutes prior to start
      const alarmDate = new Date(examDate.getTime() - (assignedExam.paperDistributionMinutesBefore || 15) * 60 * 1000);

      const diffMs = alarmDate.getTime() - now.getTime();

      if (diffMs <= 0 && diffMs > -60 * 60 * 1000) {
        setIsAlarmTriggered(true);
        setTimeLeftStr('NOW! Distribute examination papers immediately');
      } else if (diffMs > 0) {
        const mins = Math.floor(diffMs / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeftStr(`${mins}m ${secs}s remaining until paper collection`);
        setIsAlarmTriggered(false);
      } else {
        setTimeLeftStr('Exam in progress / completed');
        setIsAlarmTriggered(false);
      }
    };

    calculateAlarm();
    const interval = setInterval(calculateAlarm, 1000);
    return () => clearInterval(interval);
  }, [assignedExam]);

  if (!assignedExam || isDismissed) return null;

  // Format alarm time for display (e.g. 08:45 AM)
  const [h, m] = (assignedExam.startTime || '09:00').split(':');
  const d = new Date();
  d.setHours(parseInt(h, 10), parseInt(m, 10) - (assignedExam.paperDistributionMinutesBefore || 15));
  const alarmTimeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`rounded-2xl p-4 transition-all border ${
        isAlarmTriggered
          ? 'bg-red-50 border-red-300 text-red-900 shadow-md animate-pulse'
          : 'bg-amber-50/90 border-amber-200 text-amber-900 shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isAlarmTriggered ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
            }`}
          >
            {isAlarmTriggered ? <Volume2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 border border-current">
                Paper-Distribution Alarm
              </span>
              <span className="text-xs font-bold text-slate-800">
                Scheduled at {alarmTimeString} (15m before start)
              </span>
            </div>

            <p className="text-sm font-semibold mt-1 text-slate-900">
              Exam: {assignedExam.exam} ({assignedExam.subjectCode}) in Hall {assignedExam.hall}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-medium text-[#6B1120]">
                <Clock className="w-3.5 h-3.5" />
                {timeLeftStr}
              </span>
              {staffProfile && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Beacon {staffProfile.beaconId}: {staffProfile.beaconStatus} ({staffProfile.signalStrength})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setIsDismissed(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-200 cursor-pointer transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
