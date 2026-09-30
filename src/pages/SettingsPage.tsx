import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  UserCog, 
  ArrowRightLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Layers 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExamContext } from '../context/ExamContext';
import { api } from '../api/client';

export const SettingsPage: React.FC = () => {
  const { college, user, role, updateCollegeProfile, transferCoordinator } = useAuth();
  const { halls, staff, exams } = useExamContext();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [departmentsStr, setDepartmentsStr] = useState('');

  const [candidateUsers, setCandidateUsers] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (college) {
      setName(college.name || '');
      setCode(college.code || '');
      setAddress(college.address || '');
      setPhone(college.phone || '');
      setEmail(college.email || '');
      setDepartmentsStr((college.departments || []).join(', '));
    }
  }, [college]);

  useEffect(() => {
    api.getUsers().then((uList) => {
      setCandidateUsers(uList.filter((u) => u.id !== user?.id));
    }).catch(() => null);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg(null);
    const depts = departmentsStr.split(',').map((d) => d.trim()).filter(Boolean);
    const ok = await updateCollegeProfile({
      name,
      code,
      address,
      phone,
      email,
      departments: depts,
    });
    setIsSaving(false);
    if (ok) {
      setFeedbackMsg('College information successfully saved to persistent database.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleTransfer = async () => {
    if (!targetUserId) {
      alert('Please select a recipient user');
      return;
    }
    if (!confirmTransfer) {
      alert('Please confirm that you want to transfer the coordinator role');
      return;
    }

    setIsSaving(true);
    const ok = await transferCoordinator(targetUserId, 'viewer');
    setIsSaving(false);

    if (ok) {
      alert('Chief Exam Coordinator role transferred successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          Institution & Coordinator Settings
        </h1>
        <p className="text-sm text-slate-400 font-normal mt-1">
          Configure university examination credentials, departments, and coordinator delegation.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: College Profile */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#6B1120]/10 text-[#6B1120] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Institution Information</h2>
              <p className="text-xs text-slate-400">Institutional identity across examination records</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institution Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={role !== 'coordinator'}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institution Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={role !== 'coordinator'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Helpline / Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={role !== 'coordinator'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={role !== 'coordinator'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={role !== 'coordinator'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departments (Comma Separated)
              </label>
              <textarea
                value={departmentsStr}
                onChange={(e) => setDepartmentsStr(e.target.value)}
                disabled={role !== 'coordinator'}
                rows={3}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
              />
            </div>

            {role === 'coordinator' && (
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#6B1120] hover:bg-[#570E1C] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save College Profile'}</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Coordinator Details & Transfer */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Coordinator Details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Coordinator Details</h2>
                <p className="text-xs text-slate-400">Chief authority over exam schedule and staff</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{college?.coordinator?.name || user?.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase block">Designation</span>
                  <span className="font-semibold text-slate-800">{user?.designation || 'Chief Coordinator'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase block">Staff ID</span>
                  <span className="font-semibold text-slate-800">{user?.staffId || 'COORD-01'}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase block">Email Address</span>
                <span className="font-semibold text-slate-800">{college?.coordinator?.email || user?.email}</span>
              </div>
            </div>
          </div>

          {/* Transfer Coordinator Role */}
          {role === 'coordinator' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Transfer Coordinator Role</h2>
                  <p className="text-xs text-slate-400">Delegate administration to a colleague</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Select a faculty member below to grant them Chief Coordinator administrative access:
                </p>

                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="">-- Choose Successor --</option>
                  {candidateUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.username}) – {u.designation || u.role}
                    </option>
                  ))}
                </select>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="page-transfer-confirm"
                    checked={confirmTransfer}
                    onChange={(e) => setConfirmTransfer(e.target.checked)}
                    className="mt-0.5 rounded text-[#6B1120] focus:ring-[#6B1120]"
                  />
                  <label htmlFor="page-transfer-confirm" className="text-xs text-slate-600 select-none">
                    I confirm that I am transferring full Chief Coordinator permissions to this user.
                  </label>
                </div>

                <button
                  type="button"
                  disabled={!targetUserId || !confirmTransfer || isSaving}
                  onClick={handleTransfer}
                  className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>{isSaving ? 'Processing Transfer...' : 'Execute Role Transfer'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
