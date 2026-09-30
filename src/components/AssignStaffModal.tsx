import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { useExamContext } from '../context/ExamContext';

export const AssignStaffModal: React.FC = () => {
  const { 
    isAssignStaffModalOpen, 
    setIsAssignStaffModalOpen, 
    selectedStaffForAction,
    setSelectedStaffForAction,
    staff, 
    halls, 
    updateStaff 
  } = useExamContext();

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedHall, setSelectedHall] = useState('');

  useEffect(() => {
    if (selectedStaffForAction) {
      setSelectedStaffId(selectedStaffForAction.id);
      setSelectedHall(selectedStaffForAction.assignedHall || halls[0]?.hall || 'A1-01');
    } else if (staff.length > 0) {
      setSelectedStaffId(staff[0].id);
      setSelectedHall(halls[0]?.hall || 'A1-01');
    }
  }, [selectedStaffForAction, staff, halls]);

  if (!isAssignStaffModalOpen) return null;

  const currentStaff = staff.find((s) => s.id === selectedStaffId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || !selectedHall) return;

    await updateStaff(selectedStaffId, {
      assignedHall: selectedHall,
      block: selectedHall.split('-')[0] || 'A1',
      floor: '01',
    });
    setIsAssignStaffModalOpen(false);
    setSelectedStaffForAction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#761427] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Assign / Reassign Invigilator
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Allocate faculty to exam hall duty roster
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAssignStaffModalOpen(false);
              setSelectedStaffForAction(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Faculty Member *
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.department} • {s.status})
                </option>
              ))}
            </select>
            {currentStaff && (
              <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Current Status: <strong className="text-slate-900">{currentStaff.status}</strong></span>
                <span>Role: <strong className="text-slate-900">{currentStaff.role}</strong></span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Assigned Examination Hall *
            </label>
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
            >
              {halls.map((h) => (
                <option key={h.id} value={h.hall}>
                  Hall {h.hall} (Block {h.block} • {h.overallStatus})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAssignStaffModalOpen(false);
                setSelectedStaffForAction(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#761427] hover:bg-[#570E1C] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Update Duty Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
