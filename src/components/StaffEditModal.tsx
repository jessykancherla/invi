import React, { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle2, Trash2 } from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { StaffMember } from '../types';

export const StaffEditModal: React.FC = () => {
  const { 
    isStaffModalOpen, 
    setIsStaffModalOpen, 
    selectedStaffForAction, 
    setSelectedStaffForAction, 
    addStaff, 
    updateStaff, 
    deleteStaff,
    halls,
    devices
  } = useExamContext();

  const isEditing = !!selectedStaffForAction;

  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [department, setDepartment] = useState('Mathematics');
  const [designation, setDesignation] = useState('Senior Lecturer');
  const [role, setRole] = useState<'Hall Invigilator' | 'Chief Superintendent' | 'Reliever' | 'Flying Squad'>('Hall Invigilator');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accountStatus, setAccountStatus] = useState<'Active' | 'Inactive'>('Active');
  const [beaconId, setBeaconId] = useState('');
  const [assignedHall, setAssignedHall] = useState('A1-01');
  const [assignedDeviceId, setAssignedDeviceId] = useState('None');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedStaffForAction) {
      setName(selectedStaffForAction.name || '');
      setStaffId(selectedStaffForAction.staffId || '');
      setDepartment(selectedStaffForAction.department || 'Mathematics');
      setDesignation(selectedStaffForAction.designation || 'Lecturer');
      setRole(selectedStaffForAction.role || 'Hall Invigilator');
      setEmail(selectedStaffForAction.email || '');
      setPhone(selectedStaffForAction.phone || '');
      setAccountStatus(selectedStaffForAction.accountStatus || 'Active');
      setBeaconId(selectedStaffForAction.beaconId || '');
      setAssignedHall(selectedStaffForAction.assignedHall || 'A1-01');
      setAssignedDeviceId(selectedStaffForAction.assignedDeviceId || 'None');
    } else {
      setName('');
      setStaffId(`ST-${String(Math.floor(100 + Math.random() * 900))}`);
      setDepartment('Mathematics');
      setDesignation('Assistant Professor');
      setRole('Hall Invigilator');
      setEmail('');
      setPhone('');
      setAccountStatus('Active');
      setBeaconId(`B-${Math.floor(1000 + Math.random() * 9000)}`);
      setAssignedHall(halls[0]?.hall || 'A1-01');
      setAssignedDeviceId('None');
    }
  }, [selectedStaffForAction, halls]);

  if (!isStaffModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and Email are required');
      return;
    }

    setIsSubmitting(true);
    const payload: Partial<StaffMember> = {
      name,
      staffId,
      department,
      designation,
      role,
      email,
      phone,
      accountStatus,
      beaconId,
      assignedHall,
      assignedDeviceId,
      block: assignedHall.split('-')[0] || 'A1',
      floor: '01',
    };

    let ok = false;
    if (isEditing && selectedStaffForAction) {
      ok = await updateStaff(selectedStaffForAction.id, payload);
    } else {
      ok = await addStaff(payload);
    }

    setIsSubmitting(false);
    if (ok) {
      setIsStaffModalOpen(false);
      setSelectedStaffForAction(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaffForAction) return;
    if (window.confirm(`Are you sure you want to delete ${selectedStaffForAction.name}? This will revoke their invigilator account.`)) {
      setIsSubmitting(true);
      const ok = await deleteStaff(selectedStaffForAction.id);
      setIsSubmitting(false);
      if (ok) {
        setIsStaffModalOpen(false);
        setSelectedStaffForAction(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B1120]/10 flex items-center justify-center text-[#6B1120]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Invigilator Profile' : 'Add New Invigilator'}
              </h2>
              <p className="text-xs text-slate-500">Configure faculty credentials and hardware beacon assignment</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsStaffModalOpen(false);
              setSelectedStaffForAction(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Robert Vance"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Staff ID *
              </label>
              <input
                type="text"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Associate Professor"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invigilation Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              >
                <option value="Hall Invigilator">Hall Invigilator</option>
                <option value="Chief Superintendent">Chief Superintendent</option>
                <option value="Reliever">Reliever</option>
                <option value="Flying Squad">Flying Squad</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@college.edu"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Beacon ID
              </label>
              <input
                type="text"
                value={beaconId}
                onChange={(e) => setBeaconId(e.target.value)}
                placeholder="e.g. B-1042"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Hall
              </label>
              <select
                value={assignedHall}
                onChange={(e) => setAssignedHall(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              >
                {halls.map((h) => (
                  <option key={h.id} value={h.hall}>
                    {h.hall}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsStaffModalOpen(false);
                  setSelectedStaffForAction(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#6B1120] hover:bg-[#570E1C] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Invigilator'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
