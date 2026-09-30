import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Calendar, 
  UserCheck, 
  ArrowRightLeft, 
  Upload, 
  Plus, 
  Clock, 
  Landmark, 
  User, 
  Trash2, 
  FileText,
  AlertTriangle,
  ShieldCheck,
  Download,
  FileSpreadsheet 
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { exportExamsCSV } from '../utils/exportUtils';
import { Exam } from '../types';

export const ExamsPage: React.FC = () => {
  const { 
    exams, 
    searchQuery, 
    setIsAddExamModalOpen, 
    setIsImportTimetableModalOpen, 
    setIsSetInvigilatorModalOpen, 
    setIsReplaceInvigilatorModalOpen, 
    setSelectedExamForAction,
    deleteExam,
    openExportModal 
  } = useExamContext();

  const { role, college } = useAuth();

  // Filter States
  const [selectedBlock, setSelectedBlock] = useState('All Blocks');
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedHall, setSelectedHall] = useState('All Halls');
  const [selectedDate, setSelectedDate] = useState('All Dates');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Currently selected exam ID for details pane
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  // Reactive filtering
  const filteredExams = useMemo(() => {
    return exams.filter((item) => {
      const matchBlock = 
        selectedBlock === 'All Blocks' || 
        item.block === selectedBlock || 
        `Block ${item.block}` === selectedBlock;

      const matchFloor = 
        selectedFloor === 'All Floors' || 
        item.floor === selectedFloor || 
        `Floor ${item.floor}` === selectedFloor;

      const matchHall = selectedHall === 'All Halls' || item.hall === selectedHall;
      const matchDate = selectedDate === 'All Dates' || item.date === selectedDate;
      const matchStatus = selectedStatus === 'All Statuses' || item.status === selectedStatus;

      const query = searchQuery ? searchQuery.toLowerCase() : '';
      const matchSearch = !query ||
        item.exam.toLowerCase().includes(query) ||
        (item.subjectCode && item.subjectCode.toLowerCase().includes(query)) ||
        item.hall.toLowerCase().includes(query) ||
        item.staff.toLowerCase().includes(query) ||
        item.teacher.toLowerCase().includes(query) ||
        item.block.toLowerCase().includes(query);

      return matchBlock && matchFloor && matchHall && matchDate && matchStatus && matchSearch;
    });
  }, [exams, selectedBlock, selectedFloor, selectedHall, selectedDate, selectedStatus, searchQuery]);

  // Active selected exam object
  const activeExam: Exam | undefined = useMemo(() => {
    if (selectedExamId) {
      const found = exams.find((e) => e.id === selectedExamId);
      if (found) return found;
    }
    return filteredExams[0] || exams[0];
  }, [exams, selectedExamId, filteredExams]);

  // Helper for Status indicator dot + label matching reference design
  const renderStatus = (status: string) => {
    switch (status) {
      case 'Ready':
        return (
          <div className="inline-flex items-center gap-2 font-normal text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
            <span>Ready</span>
          </div>
        );
      case 'Late':
        return (
          <div className="inline-flex items-center gap-2 font-normal text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
            <span>Late</span>
          </div>
        );
      case 'Changed':
        return (
          <div className="inline-flex items-center gap-2 font-normal text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" />
            <span>Changed</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 font-normal text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
            <span>{status}</span>
          </div>
        );
    }
  };

  const handleOpenSetInvigilator = (examItem: Exam) => {
    setSelectedExamForAction(examItem);
    setIsSetInvigilatorModalOpen(true);
  };

  const handleOpenReplaceInvigilator = (examItem: Exam) => {
    setSelectedExamForAction(examItem);
    setIsReplaceInvigilatorModalOpen(true);
  };

  const handleDeleteExam = async (examId: string, examName: string) => {
    if (window.confirm(`Are you sure you want to delete ${examName} from the timetable?`)) {
      await deleteExam(examId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header: Title, Subtitle, and Timetable Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Exams Timetable
          </h1>
          <p className="text-sm text-slate-400 font-normal mt-1">
            See and manage exam plans, timetables, and invigilator hall allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export Timetable Button */}
          <button
            id="export-timetable-btn"
            onClick={() => openExportModal('exams')}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            title="Export exams timetable to CSV, PDF/Print, or JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Timetable</span>
          </button>

          {role === 'coordinator' && (
            <>
              <button
                id="upload-timetable-btn"
                onClick={() => setIsImportTimetableModalOpen(true)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Timetable</span>
              </button>
              <button
                id="add-exam-btn"
                onClick={() => setIsAddExamModalOpen(true)}
                className="bg-[#6B1120] hover:bg-[#570E1C] active:bg-[#4A0E17] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Exam</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Block Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Block
            </label>
            <div className="relative">
              <select
                id="filter-block"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Blocks">All Blocks</option>
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Floor
            </label>
            <div className="relative">
              <select
                id="filter-floor"
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Floors">All Floors</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
                <option value="4">Floor 4</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Hall Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hall
            </label>
            <div className="relative">
              <select
                id="filter-hall"
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Halls">All Halls</option>
                <option value="A1-01">A1-01</option>
                <option value="A1-02">A1-02</option>
                <option value="A1-03">A1-03</option>
                <option value="A1-04">A1-04</option>
                <option value="A2-03">A2-03</option>
                <option value="B1-04">B1-04</option>
                <option value="B2-02">B2-02</option>
                <option value="B2-03">B2-03</option>
                <option value="C3-01">C3-01</option>
                <option value="C4-05">C4-05</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date
            </label>
            <div className="relative">
              <select
                id="filter-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Dates">All Dates</option>
                <option value="Tue, 27 May 2025">Tue, 27 May 2025</option>
                <option value="Wed, 28 May 2025">Wed, 28 May 2025</option>
                <option value="Thu, 29 May 2025">Thu, 29 May 2025</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Status
            </label>
            <div className="relative">
              <select
                id="filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Ready">Ready</option>
                <option value="Late">Late</option>
                <option value="Changed">Changed</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Table + Side Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Exams Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Exam</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Time</th>
                  <th className="py-3.5 px-4 font-semibold">Hall</th>
                  <th className="py-3.5 px-4 font-semibold">Staff</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  {role === 'coordinator' && (
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'coordinator' ? 7 : 6} className="py-8 text-center text-slate-400">
                      No exams match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((examItem) => {
                    const isSelected = activeExam?.id === examItem.id;
                    return (
                      <tr
                        key={examItem.id}
                        id={`exam-row-${examItem.id}`}
                        onClick={() => setSelectedExamId(examItem.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#6B1120]/5 text-slate-900 font-medium'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {examItem.exam}
                          {examItem.subjectCode && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {examItem.subjectCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{examItem.date}</td>
                        <td className="py-3.5 px-4 text-slate-600">{examItem.time}</td>
                        <td className="py-3.5 px-4 font-bold text-[#6B1120]">
                          {examItem.hall}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 font-medium">
                          {examItem.staff || examItem.teacher}
                        </td>
                        <td className="py-3.5 px-4">
                          {renderStatus(examItem.status)}
                        </td>
                        {role === 'coordinator' && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenSetInvigilator(examItem);
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#6B1120] hover:bg-[#6B1120]/10 rounded-lg transition-colors cursor-pointer"
                                title="Set Invigilator"
                              >
                                Set
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReplaceInvigilator(examItem);
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100/60 rounded-lg transition-colors cursor-pointer"
                                title="Replace Invigilator"
                              >
                                Replace
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Exam Details Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          {activeExam ? (
            <>
              {/* Exam Title & Subject */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {activeExam.exam}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 font-mono">
                    {activeExam.subjectCode || 'EXAM-CODE'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Exam schedule and hall allocation details
                </p>
              </div>

              {/* Coordinator Action Buttons */}
              {role === 'coordinator' && (
                <div className="flex items-center gap-2 pt-1 pb-2">
                  <button
                    id="set-invigilator-detail-btn"
                    onClick={() => handleOpenSetInvigilator(activeExam)}
                    className="flex-1 py-2 px-3 bg-[#6B1120] hover:bg-[#570E1C] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Set Invigilator</span>
                  </button>
                  <button
                    id="replace-invigilator-detail-btn"
                    onClick={() => handleOpenReplaceInvigilator(activeExam)}
                    className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Replace Invigilator</span>
                  </button>
                </div>
              )}

              {/* Details List */}
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Date</span>
                  <span className="font-semibold text-slate-800">{activeExam.date}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Time Window</span>
                  <span className="font-semibold text-slate-800">{activeExam.time}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-semibold text-slate-800">{activeExam.duration || '2 Hours'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Exam Hall</span>
                  <span className="font-bold text-[#6B1120]">{activeExam.hall}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Block & Floor</span>
                  <span className="font-semibold text-slate-800">
                    Block {activeExam.block}, Floor {activeExam.floor}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Allocated Invigilator</span>
                  <span className="font-bold text-slate-900">{activeExam.staff || activeExam.teacher}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Backup Reliever</span>
                  <span className="font-semibold text-slate-800">{activeExam.backupTeacher}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Required Staff Count</span>
                  <span className="font-semibold text-slate-800">{activeExam.requiredInvigilators || 1} Faculty</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Readiness Status</span>
                  <div>{renderStatus(activeExam.status)}</div>
                </div>

                {/* Paper Distribution Alarm Time */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Paper Distribution Schedule</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Scheduled 15 minutes prior to start time ({activeExam.startTime || '09:00'}). Invigilators must pick up sealed examination booklets at the central exam control.
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <span className="text-slate-400 block mb-1">Notes & Instructions:</span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 whitespace-pre-line leading-relaxed">
                    {activeExam.notes || 'Standard examination protocol in effect.'}
                  </p>
                </div>
              </div>

              {/* Delete button (Coordinator only) */}
              {role === 'coordinator' && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleDeleteExam(activeExam.id, activeExam.exam)}
                    className="w-full py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Exam from Timetable</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select an exam from the table to view complete allocation details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
