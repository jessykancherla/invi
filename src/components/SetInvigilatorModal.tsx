import React, { useState, useEffect, useMemo } from 'react';
import { X, UserCheck, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';

export const SetInvigilatorModal: React.FC = () => {
  const { 
    isSetInvigilatorModalOpen, 
    setIsSetInvigilatorModalOpen, 
    selectedExamForAction, 
    setSelectedExamForAction,
    exams,
    staff,
    halls,
    devices,
    setInvigilator 
  } = useExamContext();

  const { role } = useAuth();

  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedHall, setSelectedHall] = useState<string>('');
  const [selectedBeaconId, setSelectedBeaconId] = useState<string>('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Sync with selected target exam when opened
  useEffect(() => {
    if (selectedExamForAction) {
      setSelectedExamId(selectedExamForAction.id);
      setSelectedHall(selectedExamForAction.hall || '');
      
      const currentStaff = staff.find((s) => s.name === selectedExamForAction.staff);
      if (currentStaff) {
        setSelectedStaffId(currentStaff.id);
        setSelectedBeaconId(currentStaff.beaconId);
        setSelectedDeviceId(currentStaff.assignedDeviceId || '');
      } else {
        setSelectedStaffId('');
      }
    } else if (exams.length > 0 && !selectedExamId) {
      setSelectedExamId(exams[0].id);
      setSelectedHall(exams[0].hall || '');
    }
  }, [selectedExamForAction, exams, staff]);

  // When staff changes, auto-fill their beacon & device
  const handleStaffChange = (sId: string) => {
    setSelectedStaffId(sId);
    const chosen = staff.find((s) => s.id === sId);
    if (chosen) {
      setSelectedBeaconId(chosen.beaconId);
      setSelectedDeviceId(chosen.assignedDeviceId || '');
    }
  };

  // Conflict detection
  const activeExam = useMemo(() => exams.find((e) => e.id === selectedExamId), [exams, selectedExamId]);
  const activeStaff = useMemo(() => staff.find((s) => s.id === selectedStaffId), [staff, selectedStaffId]);

  useEffect(() => {
    if (!activeExam || !activeStaff) {
      setConflictWarning(null);
      return;
    }

    // Check if chosen staff is already assigned to another exam at the same date & time
    const conflict = exams.find(
      (e) =>
        e.id !== activeExam.id &&
        (e.staffId === activeStaff.id || e.staff.toLowerCase() === activeStaff.name.toLowerCase()) &&
        e.date === activeExam.date &&
        e.time === activeExam.time
    );

    if (conflict) {
      setConflictWarning(
        `Warning: ${activeStaff.name} is already assigned to ${conflict.exam} in Hall ${conflict.hall} during the same session (${conflict.time}). Assigning will cause a scheduling conflict!`
      );
    } else {
      setConflictWarning(null);
    }
  }, [activeExam, activeStaff, exams]);

  if (!isSetInvigilatorModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !selectedStaffId) {
      alert('Please select both an exam and an invigilator');
      return;
    }

    setIsSubmitting(true);
    const res = await setInvigilator(selectedExamId, {
      staffId: selectedStaffId,
      hall: selectedHall,
      beaconId: selectedBeaconId,
      deviceId: selectedDeviceId,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsSetInvigilatorModalOpen(false);
      setSelectedExamForAction(null);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B1120]/10 flex items-center justify-center text-[#6B1120]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Set Invigilator Assignment</h2>
              <p className="text-xs text-slate-500">Allocate faculty, hall, and hardware BLE beacon</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsSetInvigilatorModalOpen(false);
              setSelectedExamForAction(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Alert Banner */}
        {conflictWarning && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{conflictWarning}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Exam Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Exam Timetable Entry *
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                const ex = exams.find((x) => x.id === e.target.value);
                if (ex) setSelectedHall(ex.hall);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.exam} ({ex.subjectCode}) – {ex.date} [{ex.time}] – Hall {ex.hall}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Hall Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Hall *
              </label>
              <select
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              >
                {halls.map((h) => (
                  <option key={h.id} value={h.hall}>
                    Hall {h.hall} (Block {h.block}, Fl {h.floor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hardware BLE Hub
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              >
                <option value="None">None (Unpaired)</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.deviceId}>
                    {d.deviceId} ({d.hall} - {d.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Invigilator Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Invigilator Faculty Member *
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => handleStaffChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            >
              <option value="">-- Choose Invigilator --</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.staffId}) – {s.department} [{s.role}] – Beacon: {s.beaconId}
                </option>
              ))}
            </select>
          </div>

          {/* Beacon ID Configuration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned BLE Beacon ID
            </label>
            <input
              type="text"
              value={selectedBeaconId}
              onChange={(e) => setSelectedBeaconId(e.target.value)}
              placeholder="e.g. B-1042"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The ESP32 in the assigned hall detects this beacon to confirm invigilator presence automatically.
            </p>
          </div>

          {/* Confirmation Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6B1120] shrink-0" />
            <span>
              Saving will dispatch an in-app assignment notification to the invigilator with hall and paper-distribution timing.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsSetInvigilatorModalOpen(false);
                setSelectedExamForAction(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#6B1120] hover:bg-[#570E1C] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Confirm Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
