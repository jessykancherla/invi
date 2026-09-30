import React, { useState, useEffect } from 'react';
import { X, UserX, AlertCircle, History, CheckCircle2 } from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';

export const ReplaceInvigilatorModal: React.FC = () => {
  const {
    isReplaceInvigilatorModalOpen,
    setIsReplaceInvigilatorModalOpen,
    selectedExamForAction,
    setSelectedExamForAction,
    exams,
    staff,
    replaceInvigilator,
  } = useExamContext();

  const { user } = useAuth();

  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [originalStaffName, setOriginalStaffName] = useState<string>('');
  const [originalStaffId, setOriginalStaffId] = useState<string>('');
  const [replacementStaffId, setReplacementStaffId] = useState<string>('');
  const [reason, setReason] = useState<string>('Personal Emergency');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedExamForAction) {
      setSelectedExamId(selectedExamForAction.id);
      setOriginalStaffName(selectedExamForAction.staff);
      const st = staff.find((s) => s.name === selectedExamForAction.staff);
      setOriginalStaffId(st ? st.id : '');
    } else if (exams.length > 0 && !selectedExamId) {
      setSelectedExamId(exams[0].id);
      setOriginalStaffName(exams[0].staff);
    }
  }, [selectedExamForAction, exams, staff]);

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    const ex = exams.find((e) => e.id === examId);
    if (ex) {
      setOriginalStaffName(ex.staff);
      const st = staff.find((s) => s.name === ex.staff);
      setOriginalStaffId(st ? st.id : '');
    }
  };

  if (!isReplaceInvigilatorModalOpen) return null;

  const currentExam = exams.find((e) => e.id === selectedExamId);

  // Filter out original staff from replacement dropdown
  const availableReplacements = staff.filter((s) => s.id !== originalStaffId && s.name !== originalStaffName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !replacementStaffId) {
      alert('Please select an exam and a replacement invigilator');
      return;
    }

    const finalReason = reason === 'Other' ? customReason : reason;
    if (!finalReason.trim()) {
      alert('Please provide a reason for the replacement');
      return;
    }

    setIsSubmitting(true);
    const res = await replaceInvigilator(selectedExamId, {
      originalStaffId,
      replacementStaffId,
      reason: finalReason,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsReplaceInvigilatorModalOpen(false);
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Replace Invigilator</h2>
              <p className="text-xs text-slate-500">Reassign hall invigilator and preserve historical audit log</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsReplaceInvigilatorModalOpen(false);
              setSelectedExamForAction(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Exam Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Exam Timetable Entry *
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => handleExamChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.exam} ({ex.subjectCode}) – Hall {ex.hall} – Current: {ex.staff}
                </option>
              ))}
            </select>
          </div>

          {/* Original Invigilator (Read-Only) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Original Assigned Invigilator
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {originalStaffName || 'None assigned'}
                </p>
                <p className="text-xs text-slate-500">
                  Hall: {currentExam?.hall || 'N/A'} • Session: {currentExam?.time || 'N/A'}
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                To Be Replaced
              </div>
            </div>
          </div>

          {/* Replacement Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Replacement Invigilator *
            </label>
            <select
              value={replacementStaffId}
              onChange={(e) => setReplacementStaffId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            >
              <option value="">-- Choose Available Staff / Reliever --</option>
              {availableReplacements.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.staffId}) – {s.role} [{s.department}] – Status: {s.status}
                </option>
              ))}
            </select>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Replacement *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            >
              <option value="Personal Emergency">Personal Emergency</option>
              <option value="Medical Leave / Unwell">Medical Leave / Unwell</option>
              <option value="Transit Delay / Beacon Unlocated">Transit Delay / Beacon Unlocated</option>
              <option value="Administrative Reassignment">Administrative Reassignment</option>
              <option value="Other">Other (Specify below)</option>
            </select>
          </div>

          {reason === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specify Reason
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter detailed reason..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
          )}

          {/* Audit Trail Guarantee Notice */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60 text-xs text-blue-800 flex items-start gap-2.5">
            <History className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Immutable Audit Trail Preserved</p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                The original assignment is preserved in the replacement history with coordinator stamp ({user?.name || 'Coordinator'}), timestamp, and reason. The new invigilator will receive an immediate assignment notification.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsReplaceInvigilatorModalOpen(false);
                setSelectedExamForAction(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing...' : 'Confirm Replacement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
