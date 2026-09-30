import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  FileText, 
  Calendar, 
  Users, 
  Landmark, 
  History, 
  Database,
  Building2,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { 
  exportExamsCSV, 
  exportStaffCSV, 
  exportHallsCSV, 
  exportReplacementsCSV, 
  exportFullBackupJSON,
  buildTSV,
  copyToClipboard 
} from '../utils/exportUtils';

export type ExportTabType = 'exams' | 'staff' | 'halls' | 'replacements' | 'backup';

export const ExportModal: React.FC = () => {
  const { 
    isExportModalOpen, 
    setIsExportModalOpen, 
    exportInitialTab,
    exams, 
    staff, 
    halls, 
    devices,
    replacements,
    metrics
  } = useExamContext();

  const { college, user } = useAuth();

  const [activeTab, setActiveTab] = useState<ExportTabType>('exams');
  const [copied, setCopied] = useState(false);
  const [filterBlock, setFilterBlock] = useState('All Blocks');
  const [filterDate, setFilterDate] = useState('All Dates');
  const [tableSearch, setTableSearch] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isExportModalOpen && exportInitialTab) {
      if (exportInitialTab === 'all') {
        setActiveTab('backup');
      } else {
        setActiveTab(exportInitialTab as ExportTabType);
      }
    }
  }, [isExportModalOpen, exportInitialTab]);

  // Unique dates in exams
  const examDates = useMemo(() => {
    const dates = new Set<string>();
    exams.forEach((e) => {
      if (e.date) dates.add(e.date);
    });
    return Array.from(dates);
  }, [exams]);

  // Unique blocks
  const blocks = useMemo(() => {
    const blk = new Set<string>();
    exams.forEach((e) => { if (e.block) blk.add(e.block); });
    staff.forEach((s) => { if (s.block) blk.add(s.block); });
    halls.forEach((h) => { if (h.block) blk.add(h.block); });
    return Array.from(blk).filter(Boolean);
  }, [exams, staff, halls]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (filterBlock !== 'All Blocks' && e.block !== filterBlock && `Block ${e.block}` !== filterBlock) return false;
      if (filterDate !== 'All Dates' && e.date !== filterDate) return false;
      if (tableSearch) {
        const q = tableSearch.toLowerCase();
        return (
          e.exam.toLowerCase().includes(q) ||
          e.subjectCode?.toLowerCase().includes(q) ||
          e.hall.toLowerCase().includes(q) ||
          e.staff.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [exams, filterBlock, filterDate, tableSearch]);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      if (filterBlock !== 'All Blocks' && s.block !== filterBlock && `Block ${s.block}` !== filterBlock) return false;
      if (tableSearch) {
        const q = tableSearch.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.staffId.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.assignedHall.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [staff, filterBlock, tableSearch]);

  // Filtered Halls
  const filteredHalls = useMemo(() => {
    return halls.filter((h) => {
      if (filterBlock !== 'All Blocks' && h.block !== filterBlock && `Block ${h.block}` !== filterBlock) return false;
      if (tableSearch) {
        const q = tableSearch.toLowerCase();
        return (
          h.hall.toLowerCase().includes(q) ||
          h.faculty.toLowerCase().includes(q) ||
          h.currentExam.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [halls, filterBlock, tableSearch]);

  // Filtered Replacements
  const filteredReplacements = useMemo(() => {
    return replacements.filter((r) => {
      if (tableSearch) {
        const q = tableSearch.toLowerCase();
        return (
          r.examSubject.toLowerCase().includes(q) ||
          r.hall.toLowerCase().includes(q) ||
          r.originalStaffName.toLowerCase().includes(q) ||
          r.replacementStaffName.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [replacements, tableSearch]);

  if (!isExportModalOpen) return null;

  // Actions
  const handleExportCSV = () => {
    const institutionName = college?.name || 'INVI';
    switch (activeTab) {
      case 'exams':
        exportExamsCSV(filteredExams, institutionName);
        break;
      case 'staff':
        exportStaffCSV(filteredStaff, institutionName);
        break;
      case 'halls':
        exportHallsCSV(filteredHalls, institutionName);
        break;
      case 'replacements':
        exportReplacementsCSV(filteredReplacements, institutionName);
        break;
      case 'backup':
        exportFullBackupJSON({
          college,
          exams,
          staff,
          halls,
          replacements,
          devices
        });
        break;
    }
  };

  const handleCopyClipboard = async () => {
    let tsvData = '';
    if (activeTab === 'exams') {
      const headers = ['Subject', 'Code', 'Date', 'Time', 'Hall', 'Invigilator', 'Status'];
      const rows = filteredExams.map((e) => [e.exam, e.subjectCode, e.date, e.time, e.hall, e.staff, e.status]);
      tsvData = buildTSV(headers, rows);
    } else if (activeTab === 'staff') {
      const headers = ['Staff Name', 'ID', 'Department', 'Role', 'Assigned Hall', 'Beacon Status', 'Status'];
      const rows = filteredStaff.map((s) => [s.name, s.staffId, s.department, s.role, s.assignedHall, s.beaconStatus, s.status]);
      tsvData = buildTSV(headers, rows);
    } else if (activeTab === 'halls') {
      const headers = ['Hall', 'Block', 'Floor', 'Current Exam', 'Faculty', 'Readiness'];
      const rows = filteredHalls.map((h) => [h.hall, h.block, h.floor, h.currentExam, h.faculty, h.overallStatus]);
      tsvData = buildTSV(headers, rows);
    } else if (activeTab === 'replacements') {
      const headers = ['Timestamp', 'Exam', 'Hall', 'Original Staff', 'Replacement Staff', 'Reason'];
      const rows = filteredReplacements.map((r) => [r.timestamp, r.examSubject, r.hall, r.originalStaffName, r.replacementStaffName, r.reason]);
      tsvData = buildTSV(headers, rows);
    } else {
      tsvData = JSON.stringify({ exams, staff, halls, replacements }, null, 2);
    }

    const success = await copyToClipboard(tsvData);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-5xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#6B1120] to-[#8B1830] text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Export Examination Data</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white border border-white/30">
                  INVI Export Center
                </span>
              </div>
              <p className="text-xs text-white/80 font-normal mt-0.5">
                Download exam timetables, duty allocations, faculty rosters, and compliance audit logs.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => { setActiveTab('exams'); setShowPrintPreview(false); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'exams'
                  ? 'bg-white text-[#6B1120] shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#6B1120]" />
              <span>Exam Timetable</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700">
                {exams.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('staff'); setShowPrintPreview(false); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'staff'
                  ? 'bg-white text-[#6B1120] shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#6B1120]" />
              <span>Invigilator Roster</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700">
                {staff.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('halls'); setShowPrintPreview(false); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'halls'
                  ? 'bg-white text-[#6B1120] shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-[#6B1120]" />
              <span>Halls Readiness</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700">
                {halls.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('replacements'); setShowPrintPreview(false); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'replacements'
                  ? 'bg-white text-[#6B1120] shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <History className="w-3.5 h-3.5 text-[#6B1120]" />
              <span>Replacements Audit</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700">
                {replacements.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('backup'); setShowPrintPreview(false); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'backup'
                  ? 'bg-white text-[#6B1120] shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full System Backup</span>
            </button>
          </div>

          {/* Quick Print Toggle */}
          {activeTab !== 'backup' && (
            <button
              onClick={() => setShowPrintPreview(!showPrintPreview)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showPrintPreview 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>{showPrintPreview ? 'Hide Print Layout' : 'Print Preview'}</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Institution Header Stamp */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#6B1120]/10 text-[#6B1120] flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{college?.name || "St. Xavier's Institute of Engineering & Technology"}</p>
                <p className="text-slate-500 text-[11px]">
                  Examination Cell • Code: {college?.code || 'SXIET-4029'} • Authorized by: {user?.name || 'Controller'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Live Verified
              </span>
              <span className="text-slate-400 text-[11px]">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ready to Export:</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold">
                {activeTab === 'exams' ? filteredExams.length :
                 activeTab === 'staff' ? filteredStaff.length :
                 activeTab === 'halls' ? filteredHalls.length :
                 activeTab === 'replacements' ? filteredReplacements.length : 'All Database Records'} Records
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Copy TSV button */}
              <button
                id="copy-export-data-btn"
                onClick={handleCopyClipboard}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Copy table data formatted for Microsoft Excel or Google Sheets"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy for Excel/Sheets'}</span>
              </button>

              {/* Print Duty Chart button */}
              {activeTab !== 'backup' && (
                <button
                  id="print-duty-chart-btn"
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Print Official Sheet</span>
                </button>
              )}

              {/* Primary Download CSV button */}
              <button
                id="download-export-csv-btn"
                onClick={handleExportCSV}
                className="px-4 py-2 bg-[#6B1120] hover:bg-[#570E1C] active:bg-[#4A0E17] text-white text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {activeTab === 'backup' ? 'Download Full JSON Backup' : 'Download CSV (.csv)'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Filter Bar (for tabular tabs) */}
          {activeTab !== 'backup' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
                />
              </div>

              {blocks.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Block:</span>
                  <select
                    value={filterBlock}
                    onChange={(e) => setFilterBlock(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                  >
                    <option value="All Blocks">All Blocks</option>
                    {blocks.map((b) => (
                      <option key={b} value={b}>Block {b}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'exams' && examDates.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Date:</span>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                  >
                    <option value="All Dates">All Dates</option>
                    {examDates.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* PRINTABLE PREVIEW SHEET (Used by window.print()) */}
          {showPrintPreview ? (
            <div id="printable-duty-sheet" className="bg-white border-2 border-slate-300 p-8 rounded-xl shadow-xs space-y-6">
              <div className="text-center pb-4 border-b-2 border-slate-900">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  {college?.name || "St. Xavier's Institute of Engineering & Technology"}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  OFFICE OF THE CONTROLLER OF EXAMINATIONS • EXAM CELL
                </p>
                <p className="text-sm font-extrabold text-[#6B1120] uppercase mt-2">
                  {activeTab === 'exams' ? 'Official Examination Timetable & Invigilation Duty Chart' :
                   activeTab === 'staff' ? 'Faculty Invigilator Attendance & Telemetry Duty Roster' :
                   activeTab === 'halls' ? 'Examination Halls Readiness & Inspection Report' :
                   activeTab === 'replacements' ? 'Emergency Invigilator Replacement & Audit Trail' : 'Institutional Examination Database Record'}
                </p>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
                  <span>Generated Date: {new Date().toLocaleDateString()}</span>
                  <span>Session: Academic Year 2024-2025</span>
                  <span>Institutional Code: {college?.code || 'SXIET-4029'}</span>
                </div>
              </div>

              {/* Table Preview */}
              <div className="overflow-x-auto">
                {activeTab === 'exams' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-y border-slate-400 font-bold text-slate-800">
                        <th className="p-2">Subject Name</th>
                        <th className="p-2">Code</th>
                        <th className="p-2">Date & Time</th>
                        <th className="p-2">Hall</th>
                        <th className="p-2">Assigned Invigilator</th>
                        <th className="p-2">Chief Teacher</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredExams.map((e) => (
                        <tr key={e.id} className="text-slate-800">
                          <td className="p-2 font-medium">{e.exam}</td>
                          <td className="p-2 font-mono text-[11px]">{e.subjectCode}</td>
                          <td className="p-2">{e.date} • {e.time}</td>
                          <td className="p-2 font-bold">{e.hall}</td>
                          <td className="p-2">{e.staff}</td>
                          <td className="p-2 text-slate-600">{e.teacher}</td>
                          <td className="p-2 font-semibold">{e.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'staff' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-y border-slate-400 font-bold text-slate-800">
                        <th className="p-2">Faculty Name</th>
                        <th className="p-2">Staff ID</th>
                        <th className="p-2">Department</th>
                        <th className="p-2">Role</th>
                        <th className="p-2">Hall</th>
                        <th className="p-2">Beacon</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredStaff.map((s) => (
                        <tr key={s.id} className="text-slate-800">
                          <td className="p-2 font-medium">{s.name}</td>
                          <td className="p-2 font-mono text-[11px]">{s.staffId}</td>
                          <td className="p-2">{s.department}</td>
                          <td className="p-2">{s.role}</td>
                          <td className="p-2 font-bold">{s.assignedHall}</td>
                          <td className="p-2">{s.beaconId} ({s.beaconStatus})</td>
                          <td className="p-2 font-semibold">{s.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'halls' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-y border-slate-400 font-bold text-slate-800">
                        <th className="p-2">Hall</th>
                        <th className="p-2">Block / Floor</th>
                        <th className="p-2">Capacity</th>
                        <th className="p-2">Scheduled Exam</th>
                        <th className="p-2">Faculty</th>
                        <th className="p-2">Hardware Hub</th>
                        <th className="p-2">Readiness</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredHalls.map((h) => (
                        <tr key={h.id} className="text-slate-800">
                          <td className="p-2 font-bold">{h.hall}</td>
                          <td className="p-2">Block {h.block}, Floor {h.floor}</td>
                          <td className="p-2">{h.capacity || 40} seats</td>
                          <td className="p-2 font-medium">{h.currentExam}</td>
                          <td className="p-2">{h.faculty}</td>
                          <td className="p-2">{h.deviceStatus}</td>
                          <td className="p-2 font-semibold">{h.overallStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'replacements' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-y border-slate-400 font-bold text-slate-800">
                        <th className="p-2">Date / Time</th>
                        <th className="p-2">Exam Subject</th>
                        <th className="p-2">Hall</th>
                        <th className="p-2">Original Staff</th>
                        <th className="p-2">Substitute Staff</th>
                        <th className="p-2">Official Reason</th>
                        <th className="p-2">Authorized By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredReplacements.map((r) => (
                        <tr key={r.id} className="text-slate-800">
                          <td className="p-2 text-slate-600">{r.timestamp}</td>
                          <td className="p-2 font-bold">{r.examSubject}</td>
                          <td className="p-2">{r.hall}</td>
                          <td className="p-2 text-red-700">{r.originalStaffName}</td>
                          <td className="p-2 text-emerald-800 font-semibold">{r.replacementStaffName}</td>
                          <td className="p-2 italic">{r.reason}</td>
                          <td className="p-2">{r.coordinatorName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Official Signatures Section for Examination Cell */}
              <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs text-slate-800 border-t border-slate-300">
                <div>
                  <div className="border-b border-slate-400 h-10 mb-2"></div>
                  <p className="font-bold">Chief Superintendent</p>
                  <p className="text-[10px] text-slate-500">Signature & Seal</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-10 mb-2"></div>
                  <p className="font-bold">Controller of Examinations</p>
                  <p className="text-[10px] text-slate-500">Signature & Date</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-10 mb-2"></div>
                  <p className="font-bold">Principal / Institutional Head</p>
                  <p className="text-[10px] text-slate-500">Approved Signature</p>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Data Table Preview */
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Preview Data Table (First 15 records)</span>
                <span className="text-slate-500 text-[11px]">Formatted with RFC-4180 CSV & Excel Unicode BOM</span>
              </div>

              <div className="overflow-x-auto max-h-[360px]">
                {activeTab === 'exams' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFBFD] text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4">Subject</th>
                        <th className="py-2.5 px-4">Code</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Time</th>
                        <th className="py-2.5 px-4">Hall</th>
                        <th className="py-2.5 px-4">Invigilator</th>
                        <th className="py-2.5 px-4">Teacher</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExams.slice(0, 15).map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{e.exam}</td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">{e.subjectCode}</td>
                          <td className="py-2.5 px-4 text-slate-700">{e.date}</td>
                          <td className="py-2.5 px-4 text-slate-600">{e.time}</td>
                          <td className="py-2.5 px-4 font-bold text-[#6B1120]">{e.hall}</td>
                          <td className="py-2.5 px-4 text-slate-800 font-medium">{e.staff}</td>
                          <td className="py-2.5 px-4 text-slate-500">{e.teacher}</td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              {e.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'staff' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFBFD] text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4">Faculty Name</th>
                        <th className="py-2.5 px-4">Staff ID</th>
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4">Role</th>
                        <th className="py-2.5 px-4">Hall</th>
                        <th className="py-2.5 px-4">Beacon</th>
                        <th className="py-2.5 px-4">Telemetry</th>
                        <th className="py-2.5 px-4">Duty Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStaff.slice(0, 15).map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{s.name}</td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">{s.staffId}</td>
                          <td className="py-2.5 px-4 text-slate-700">{s.department}</td>
                          <td className="py-2.5 px-4 text-slate-600">{s.role}</td>
                          <td className="py-2.5 px-4 font-bold text-[#6B1120]">{s.assignedHall}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-700">{s.beaconId}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              s.beaconStatus === 'Detected' ? 'bg-emerald-100 text-emerald-800' :
                              s.beaconStatus === 'Weak Signal' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {s.beaconStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-800">{s.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'halls' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFBFD] text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4">Hall</th>
                        <th className="py-2.5 px-4">Block / Floor</th>
                        <th className="py-2.5 px-4">Capacity</th>
                        <th className="py-2.5 px-4">Exam</th>
                        <th className="py-2.5 px-4">Faculty</th>
                        <th className="py-2.5 px-4">ESP32 Hub</th>
                        <th className="py-2.5 px-4">Overall Readiness</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredHalls.slice(0, 15).map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{h.hall}</td>
                          <td className="py-2.5 px-4 text-slate-600">Block {h.block}, Fl {h.floor}</td>
                          <td className="py-2.5 px-4 text-slate-700">{h.capacity || 40} seats</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{h.currentExam}</td>
                          <td className="py-2.5 px-4 text-slate-800">{h.faculty}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              h.deviceStatus === 'Online' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {h.deviceStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-[#6B1120]">{h.overallStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'replacements' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFBFD] text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4">Date / Time</th>
                        <th className="py-2.5 px-4">Subject</th>
                        <th className="py-2.5 px-4">Hall</th>
                        <th className="py-2.5 px-4">Original Staff</th>
                        <th className="py-2.5 px-4">Substitute Staff</th>
                        <th className="py-2.5 px-4">Reason</th>
                        <th className="py-2.5 px-4">Authorized By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReplacements.slice(0, 15).map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{r.timestamp}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">{r.examSubject}</td>
                          <td className="py-2.5 px-4 font-semibold text-[#6B1120]">{r.hall}</td>
                          <td className="py-2.5 px-4 text-red-700 font-medium">{r.originalStaffName}</td>
                          <td className="py-2.5 px-4 text-emerald-800 font-bold">{r.replacementStaffName}</td>
                          <td className="py-2.5 px-4 text-slate-600 italic">{r.reason}</td>
                          <td className="py-2.5 px-4 text-slate-700">{r.coordinatorName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'backup' && (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                      <Database className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Institutional Database Snapshot (JSON)</h3>
                      <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1">
                        Export an archival backup of the entire examination management database including college settings, {exams.length} exams, {staff.length} staff records, {halls.length} halls, and {replacements.length} replacement audit records.
                      </p>
                    </div>
                    <div className="inline-grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-xl mx-auto pt-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Exams</span>
                        <span className="text-base font-extrabold text-slate-900">{exams.length} records</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Staff / Faculty</span>
                        <span className="text-base font-extrabold text-slate-900">{staff.length} records</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Exam Halls</span>
                        <span className="text-base font-extrabold text-slate-900">{halls.length} records</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Audit Trail</span>
                        <span className="text-base font-extrabold text-slate-900">{replacements.length} records</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Files exported with UTF-8 BOM encoding for seamless Microsoft Excel compatibility.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleExportCSV}
              className="px-5 py-2 bg-[#6B1120] hover:bg-[#570E1C] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export {activeTab === 'backup' ? 'JSON Backup' : 'CSV'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
