import React, { useState } from 'react';
import { X, BookOpen, Check } from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { Exam } from '../types';

export const AddExamModal: React.FC = () => {
  const { isAddExamModalOpen, setIsAddExamModalOpen, addExam, halls, staff } = useExamContext();

  const [code, setCode] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('Semester 5');
  const [date, setDate] = useState('2026-09-19');
  const [session, setSession] = useState<Exam['session']>('Morning (09:30 - 12:30)');
  const [selectedHalls, setSelectedHalls] = useState<string[]>(['Hall 101']);
  const [chiefInvigilator, setChiefInvigilator] = useState(staff[0]?.name || 'Dr. Arthur Mitchell');
  const [totalStudents, setTotalStudents] = useState(60);

  if (!isAddExamModalOpen) return null;

  const handleToggleHall = (hallName: string) => {
    if (selectedHalls.includes(hallName)) {
      if (selectedHalls.length > 1) {
        setSelectedHalls(selectedHalls.filter(h => h !== hallName));
      }
    } else {
      setSelectedHalls([...selectedHalls, hallName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !subject) return;

    addExam({
      exam: subject,
      subjectCode: code.toUpperCase(),
      date,
      time: session.includes('Morning') ? '09:00 – 11:00' : '13:00 – 15:00',
      startTime: session.includes('Morning') ? '09:00' : '13:00',
      endTime: session.includes('Morning') ? '11:00' : '15:00',
      duration: '2 Hours',
      session,
      hall: selectedHalls[0] || halls[0]?.hall || 'A1-01',
      block: (selectedHalls[0] || halls[0]?.hall || 'A1').split('-')[0],
      floor: '1',
      staff: chiefInvigilator,
      teacher: chiefInvigilator,
      backupTeacher: 'On Standby',
      requiredInvigilators: 1,
      status: 'Ready',
      notes: `${department} - ${semester}. Seating prepared for ${totalStudents} students.`,
      paperDistributionMinutesBefore: 15,
    });

    setIsAddExamModalOpen(false);
    // Reset
    setCode('');
    setSubject('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#761427] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Schedule New Examination
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Add curriculum paper and allocate invigilation halls
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddExamModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Exam Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS-502"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427] uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
              >
                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Operating Systems & Cloud Computing"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                <option value="Applied Mathematics">Applied Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Session *
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as Exam['session'])}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
              >
                <option value="Morning (09:30 - 12:30)">Morning (09:30 - 12:30)</option>
                <option value="Afternoon (14:00 - 17:00)">Afternoon (14:00 - 17:00)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Total Enrolled Students *
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={totalStudents}
                onChange={(e) => setTotalStudents(Number(e.target.value))}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Chief Superintendent *
              </label>
              <select
                value={chiefInvigilator}
                onChange={(e) => setChiefInvigilator(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#761427]"
              >
                {staff.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} ({st.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Allocate Examination Halls (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
              {halls.map((h) => {
                const hallName = h.hall || (h as any).name;
                const isSelected = selectedHalls.includes(hallName);
                return (
                  <button
                    type="button"
                    key={h.id}
                    onClick={() => handleToggleHall(hallName)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#761427] text-white border-[#761427]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{hallName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddExamModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#761427] hover:bg-[#570E1C] rounded-lg shadow-xs transition-colors"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
