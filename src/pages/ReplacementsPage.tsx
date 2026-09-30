import React from 'react';
import { History, ArrowRightLeft, User, Calendar, ShieldCheck, AlertCircle, Download } from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';

export const ReplacementsPage: React.FC = () => {
  const { replacements, setIsReplaceInvigilatorModalOpen, openExportModal } = useExamContext();
  const { role } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Replacement Audit Records
          </h1>
          <p className="text-sm text-slate-400 font-normal mt-1">
            Permanent historical audit trail of all invigilator substitutions and emergency reassignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="export-replacements-btn"
            onClick={() => openExportModal('replacements')}
            className="self-start sm:self-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            title="Export substitution audit records"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Audit Log</span>
          </button>

          {role === 'coordinator' && (
            <button
              onClick={() => setIsReplaceInvigilatorModalOpen(true)}
              className="self-start sm:self-center bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Replace Invigilator</span>
            </button>
          )}
        </div>
      </div>

      {/* Audit Guarantee Card */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Institutional Compliance & Integrity</p>
          <p className="text-amber-800 text-[11px] mt-0.5">
            Per examination guidelines, original invigilator assignments are never erased upon replacement. Every change records the predecessor, successor, detailed reason, coordinator authorization timestamp, and audit key.
          </p>
        </div>
      </div>

      {/* Replacements Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {replacements.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No replacements recorded yet. When a coordinator executes a replacement, it will be permanently cataloged here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-5">Exam & Subject</th>
                  <th className="py-3.5 px-5">Hall</th>
                  <th className="py-3.5 px-5">Original Invigilator</th>
                  <th className="py-3.5 px-5">Replacement Invigilator</th>
                  <th className="py-3.5 px-5">Reason</th>
                  <th className="py-3.5 px-5">Authorized By</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {replacements.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {r.examSubject}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#6B1120]">
                      {r.hall}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 font-medium">
                      <span className="line-through text-slate-400 mr-1.5">{r.originalStaffName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-700 font-semibold">Relieved</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-900 font-bold">
                      <span className="text-emerald-700">{r.replacementStaffName}</span>
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 font-semibold">Assigned</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">
                      {r.coordinatorName}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
