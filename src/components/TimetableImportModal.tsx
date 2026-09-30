import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useExamContext } from '../context/ExamContext';

export const TimetableImportModal: React.FC = () => {
  const { isImportTimetableModalOpen, setIsImportTimetableModalOpen, importTimetable } = useExamContext();

  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'sample'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isImportTimetableModalOpen) return null;

  // Sample CSV template generator
  const sampleCSV = `Exam Name,Subject Code,Date,Start Time,End Time,Hall,Duration,Session,Required Invigilators
Database Management Systems,CS-401,Wed, 28 May 2025,09:00,11:00,A1-01,2 Hours,Morning,1
Signals & Systems,EC-302,Wed, 28 May 2025,09:00,11:00,A1-02,2 Hours,Morning,1
Thermodynamics,ME-201,Wed, 28 May 2025,13:00,15:00,B2-02,2 Hours,Afternoon,1
Operating Systems,CS-403,Thu, 29 May 2025,09:00,11:00,A1-03,2 Hours,Morning,1`;

  const parseCSVText = (text: string) => {
    const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      alert('Input must have a header row and at least one data row');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (cols.length < 2) continue;

      // Fuzzy column extraction
      let exam = cols[0] || 'Examination';
      let code = cols[1] || 'SUB-101';
      let date = cols[2] || 'Wed, 28 May 2025';
      let startTime = cols[3] || '09:00';
      let endTime = cols[4] || '11:00';
      let hall = cols[5] || 'A1-01';
      let duration = cols[6] || '2 Hours';
      let session = cols[7] || 'Morning';
      let reqInv = cols[8] || '1';

      rows.push({
        id: `imp-${i}`,
        exam,
        subjectCode: code,
        date,
        startTime,
        endTime,
        hall,
        duration,
        session,
        requiredInvigilators: Number(reqInv) || 1,
        time: `${startTime} – ${endTime}`,
        status: 'Ready',
      });
    }

    setParsedRows(rows);
    setStatusMessage(`Successfully parsed ${rows.length} exam timetable entries`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseCSVText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setPastedText(sampleCSV);
    parseCSVText(sampleCSV);
  };

  const handleRemoveRow = (idx: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) {
      alert('No rows parsed yet. Please upload a CSV or paste timetable data.');
      return;
    }

    setIsSubmitting(true);
    const count = await importTimetable(parsedRows);
    setIsSubmitting(false);

    if (count > 0) {
      setIsImportTimetableModalOpen(false);
      setParsedRows([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B1120]/10 flex items-center justify-center text-[#6B1120]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upload Examination Timetable</h2>
              <p className="text-xs text-slate-500">Import timetable from CSV, spreadsheet export, or structured text</p>
            </div>
          </div>
          <button
            onClick={() => setIsImportTimetableModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Upload File (.CSV)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Paste Data
          </button>
          <button
            onClick={() => {
              setActiveTab('sample');
              handleLoadSample();
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'sample' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Load Sample Timetable
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-4">
          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#6B1120]/50 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">
                Drag and drop your exam schedule CSV file, or browse
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Accepts comma-delimited columns: Exam Name, Subject Code, Date, Start Time, End Time, Hall, Duration
              </p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="mt-4 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6B1120] file:text-white hover:file:bg-[#570E1C] cursor-pointer"
              />
            </div>
          )}

          {activeTab === 'paste' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paste CSV or Tab-Separated Values:
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Exam Name,Subject Code,Date,Start Time,End Time,Hall..."
                rows={4}
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
              <button
                type="button"
                onClick={() => parseCSVText(pastedText)}
                className="mt-2 px-4 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Parse Timetable Text
              </button>
            </div>
          )}

          {activeTab === 'sample' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <div>
                <p className="font-semibold">Sample 4-Course Semester Timetable Loaded</p>
                <p className="text-[11px] text-amber-700">Preview the entries below and click 'Confirm & Import' to insert into the database.</p>
              </div>
            </div>
          )}
        </div>

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Mapped Entries ({parsedRows.length})
              </span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Import
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Subject / Exam</th>
                    <th className="p-2">Code</th>
                    <th className="p-2">Date & Time</th>
                    <th className="p-2">Hall</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-2 font-medium text-slate-900">{r.exam}</td>
                      <td className="p-2 text-slate-500">{r.subjectCode}</td>
                      <td className="p-2 text-slate-600">{r.date} [{r.time}]</td>
                      <td className="p-2 font-semibold text-[#6B1120]">{r.hall}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleRemoveRow(i)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsImportTimetableModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || isSubmitting}
            onClick={handleImportSubmit}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#6B1120] hover:bg-[#570E1C] disabled:bg-slate-300 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Importing...' : `Confirm & Import ${parsedRows.length} Exams`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
