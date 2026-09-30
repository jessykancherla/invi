import React, { useState, useEffect } from 'react';
import { X, Building2, UserCog, CheckCircle2, ShieldAlert, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExamContext } from '../context/ExamContext';
import { api } from '../api/client';

export const CollegeSettingsModal: React.FC = () => {
  const { isCollegeSettingsModalOpen, setIsCollegeSettingsModalOpen } = useExamContext();
  const { college, user, role, updateCollegeProfile, transferCoordinator } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'coordinator' | 'transfer'>('profile');

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [departmentsStr, setDepartmentsStr] = useState('');

  // Transfer states
  const [candidateUsers, setCandidateUsers] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    if (isCollegeSettingsModalOpen) {
      api.getUsers().then((uList) => {
        setCandidateUsers(uList.filter((u) => u.id !== user?.id));
      }).catch(() => null);
    }
  }, [isCollegeSettingsModalOpen, user]);

  if (!isCollegeSettingsModalOpen) return null;

  const handleSaveCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const depts = departmentsStr.split(',').map((d) => d.trim()).filter(Boolean);
    const success = await updateCollegeProfile({
      name,
      code,
      address,
      phone,
      email,
      departments: depts,
    });
    setIsSaving(false);
    if (success) {
      alert('College profile updated successfully');
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
      alert('Chief Coordinator role successfully transferred!');
      setIsCollegeSettingsModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B1120]/10 flex items-center justify-center text-[#6B1120]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Institution & Coordinator Settings</h2>
              <p className="text-xs text-slate-500">Manage college profile, departments, and coordinator delegation</p>
            </div>
          </div>
          <button
            onClick={() => setIsCollegeSettingsModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            College Profile
          </button>
          <button
            onClick={() => setActiveTab('coordinator')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'coordinator' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Coordinator Details
          </button>
          {role === 'coordinator' && (
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'transfer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Transfer Role
            </button>
          )}
        </div>

        <div className="mt-5">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveCollege} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={role !== 'coordinator'}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution Code / ID
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={role !== 'coordinator'}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={role !== 'coordinator'}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Campus Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={role !== 'coordinator'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Departments (Comma Separated)
                </label>
                <textarea
                  value={departmentsStr}
                  onChange={(e) => setDepartmentsStr(e.target.value)}
                  disabled={role !== 'coordinator'}
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] disabled:opacity-60"
                />
              </div>

              {role === 'coordinator' && (
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#6B1120] hover:bg-[#570E1C] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save College Information'}</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {activeTab === 'coordinator' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#6B1120] text-white flex items-center justify-center font-bold text-base">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CO'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{college?.coordinator?.name || user?.name}</h3>
                    <p className="text-xs text-slate-500">{user?.designation || 'Chief Exam Coordinator'}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Full Administrative Access
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <p className="font-semibold text-slate-700">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>
                    <p className="font-semibold text-slate-700">{user?.phone || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Username:</span>
                    <p className="font-semibold text-slate-700">{user?.username}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Staff / ID:</span>
                    <p className="font-semibold text-slate-700">{user?.staffId || 'COORD-01'}</p>
                  </div>
                </div>
              </div>

              {role === 'coordinator' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-800 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Delegation / Role Transfer</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Need to transfer the coordinator responsibilities to another faculty member? Switch to the 'Transfer Role' tab.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transfer' && role === 'coordinator' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Caution: Coordinator Role Transfer
                </p>
                <p className="text-[11px] text-red-700 mt-1">
                  Transferring the Chief Coordinator role will grant administrative control over timetables, staff, and halls to the selected user. Your account will automatically transition to Observer/Viewer status.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Successor Faculty Member *
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
                >
                  <option value="">-- Choose Successor --</option>
                  {candidateUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.username}) – {u.designation || u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="confirm-transfer"
                  checked={confirmTransfer}
                  onChange={(e) => setConfirmTransfer(e.target.checked)}
                  className="rounded text-[#6B1120] focus:ring-[#6B1120]"
                />
                <label htmlFor="confirm-transfer" className="text-xs text-slate-700 select-none">
                  I confirm that I am transferring full Chief Coordinator permissions to this user.
                </label>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={!targetUserId || !confirmTransfer || isSaving}
                  onClick={handleTransfer}
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 disabled:bg-slate-300 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>{isSaving ? 'Transferring...' : 'Execute Role Transfer'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
