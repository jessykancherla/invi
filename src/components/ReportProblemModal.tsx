import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { ProblemIncident } from '../types';

export const ReportProblemModal: React.FC = () => {
  const { 
    isReportModalOpen, 
    setIsReportModalOpen, 
    halls, 
    exams,
    toggleHallChecklist 
  } = useExamContext();

  const [hall, setHall] = useState('A1-01');
  const [examCode, setExamCode] = useState('MATH-301');
  const [category, setCategory] = useState<ProblemIncident['category']>('Infrastructure');
  const [severity, setSeverity] = useState<ProblemIncident['severity']>('Medium');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('Exam Staff / Invigilator');

  if (!isReportModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Find hall and update alerts
    const targetHall = halls.find((h) => h.hall === hall);
    if (targetHall && targetHall.checklists.noAlerts) {
      await toggleHallChecklist(targetHall.id, 'noAlerts');
    }

    alert(`Incident logged for Hall ${hall}: ${description}`);
    setDescription('');
    setIsReportModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Report Examination Incident / Problem
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Broadcast live issue to the Controller Room & Reliever Squad
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Examination Hall *
              </label>
              <select
                value={hall}
                onChange={(e) => setHall(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
              >
                {halls.map((h) => (
                  <option key={h.id} value={h.hall}>
                    Hall {h.hall} (Block {h.block})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Exam Code
              </label>
              <select
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
              >
                <option value="">-- General / Non-Subject Specific --</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.subjectCode}>
                    {ex.subjectCode} - {ex.exam}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Issue Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProblemIncident['category'])}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
              >
                <option value="Staff Delay">Staff Delay / Absence</option>
                <option value="Infrastructure">Infrastructure (Light/Fan/Desks)</option>
                <option value="Question Paper Issue">Question Paper / Answer Sheet</option>
                <option value="Device Fault">Device / CCTV / Jammer Fault</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Malpractice Suspected">Malpractice Suspected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Severity Level *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      severity === lvl
                        ? lvl === 'High'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : lvl === 'Medium'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Incident Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details regarding room, seat numbers, or equipment malfunction..."
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Reported By
            </label>
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#761427] hover:bg-[#570E1C] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
