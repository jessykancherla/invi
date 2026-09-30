import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Phone, 
  Mail, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Radio, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck,
  Download 
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { StaffMember, StaffStatus } from '../types';

export const StaffPage: React.FC = () => {
  const { 
    staff, 
    searchQuery, 
    setIsStaffModalOpen, 
    setSelectedStaffForAction,
    overrideStaffStatus,
    deleteStaff,
    openExportModal 
  } = useExamContext();

  const { role } = useAuth();

  // Filters State
  const [selectedBlock, setSelectedBlock] = useState('All Blocks');
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedHall, setSelectedHall] = useState('All Halls');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Currently selected faculty member ID for details pane
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Status override modal state
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideStatusVal, setOverrideStatusVal] = useState<StaffStatus>('On Duty');
  const [overrideBeaconVal, setOverrideBeaconVal] = useState<string>('Detected');
  const [overrideNote, setOverrideNote] = useState('');

  // Reactive filtering
  const filteredStaff = useMemo(() => {
    return staff.filter((item) => {
      const matchBlock = 
        selectedBlock === 'All Blocks' || 
        item.block === selectedBlock || 
        `Block ${item.block}` === selectedBlock;

      const matchFloor = 
        selectedFloor === 'All Floors' || 
        item.floor === selectedFloor || 
        `Floor ${item.floor}` === selectedFloor ||
        item.floor === selectedFloor.replace(/^0+/, '');

      const matchHall = selectedHall === 'All Halls' || item.assignedHall === selectedHall;

      let matchStatus = true;
      if (selectedStatus !== 'All Statuses') {
        matchStatus = item.status === selectedStatus || item.beaconStatus === selectedStatus;
      }

      const query = searchQuery ? searchQuery.toLowerCase() : '';
      const matchSearch = !query ||
        item.name.toLowerCase().includes(query) ||
        (item.staffId && item.staffId.toLowerCase().includes(query)) ||
        item.department.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.assignedHall.toLowerCase().includes(query) ||
        item.beaconId.toLowerCase().includes(query);

      return matchBlock && matchFloor && matchHall && matchStatus && matchSearch;
    });
  }, [staff, selectedBlock, selectedFloor, selectedHall, selectedStatus, searchQuery]);

  // Active selected faculty object
  const activeStaff: StaffMember | undefined = useMemo(() => {
    if (selectedStaffId) {
      const found = staff.find((s) => s.id === selectedStaffId);
      if (found) return found;
    }
    return filteredStaff[0] || staff[0];
  }, [staff, selectedStaffId, filteredStaff]);

  const renderStatus = (status: string) => {
    switch (status) {
      case 'On Duty':
      case 'Checked In':
        return (
          <div className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
            <span>{status}</span>
          </div>
        );
      case 'Late':
        return (
          <div className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
            <span>Late</span>
          </div>
        );
      case 'Absent':
        return (
          <div className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" />
            <span>Absent</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
            <span>{status}</span>
          </div>
        );
    }
  };

  const renderBeaconStatus = (beaconStatus: string) => {
    switch (beaconStatus) {
      case 'Detected':
        return (
          <div className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
            <span>Detected</span>
          </div>
        );
      case 'Weak Signal':
        return (
          <div className="inline-flex items-center gap-1.5 font-medium text-amber-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
            <span>Weak Signal</span>
          </div>
        );
      case 'Not Detected':
      default:
        return (
          <div className="inline-flex items-center gap-1.5 font-medium text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
            <span>Not Detected</span>
          </div>
        );
    }
  };

  const handleEditStaff = (member: StaffMember) => {
    setSelectedStaffForAction(member);
    setIsStaffModalOpen(true);
  };

  const handleCreateStaff = () => {
    setSelectedStaffForAction(null);
    setIsStaffModalOpen(true);
  };

  const handleExecuteOverride = async () => {
    if (!activeStaff) return;
    await overrideStaffStatus(activeStaff.id, overrideStatusVal, overrideBeaconVal, overrideNote);
    setIsOverrideModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Staff & Invigilators
          </h1>
          <p className="text-sm text-slate-400 font-normal mt-1">
            Faculty directory, duty assignments, and BLE hardware beacon telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="export-staff-btn"
            onClick={() => openExportModal('staff')}
            className="self-start sm:self-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            title="Export staff roster and duty attendance"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Roster</span>
          </button>

          {role === 'coordinator' && (
            <button
              id="add-staff-btn"
              onClick={handleCreateStaff}
              className="self-start sm:self-center bg-[#6B1120] hover:bg-[#570E1C] active:bg-[#4A0E17] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Invigilator</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Block */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Block</label>
            <div className="relative">
              <select
                id="filter-staff-block"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Blocks">All Blocks</option>
                <option value="A1">Block A1</option>
                <option value="B2">Block B2</option>
                <option value="Main">Main Campus</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Floor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Floor</label>
            <div className="relative">
              <select
                id="filter-staff-floor"
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Floors">All Floors</option>
                <option value="01">Floor 01</option>
                <option value="02">Floor 02</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Hall */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hall</label>
            <div className="relative">
              <select
                id="filter-staff-hall"
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Halls">All Halls</option>
                <option value="A1-01">A1-01</option>
                <option value="A1-02">A1-02</option>
                <option value="A1-03">A1-03</option>
                <option value="A1-04">A1-04</option>
                <option value="B2-02">B2-02</option>
                <option value="B2-03">B2-03</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
            <div className="relative">
              <select
                id="filter-staff-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="On Duty">On Duty</option>
                <option value="Checked In">Checked In</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="Standby">Standby</option>
                <option value="Detected">Beacon: Detected</option>
                <option value="Weak Signal">Beacon: Weak Signal</option>
                <option value="Not Detected">Beacon: Not Detected</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Staff Table + Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Faculty Member</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Hall</th>
                  <th className="py-3.5 px-4 font-semibold">Beacon ID</th>
                  <th className="py-3.5 px-4 font-semibold">Beacon Status</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  {role === 'coordinator' && <th className="py-3.5 px-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'coordinator' ? 7 : 6} className="py-8 text-center text-slate-400">
                      No staff members match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => {
                    const isSelected = activeStaff?.id === member.id;

                    return (
                      <tr
                        key={member.id}
                        id={`staff-row-${member.id}`}
                        onClick={() => setSelectedStaffId(member.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#6B1120]/5 text-slate-900 font-medium'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#FAF0F2] text-[#6B1120] font-bold text-[11px] flex items-center justify-center shrink-0">
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{member.name}</p>
                              <p className="text-[10px] text-slate-400 font-normal">{member.staffId} • {member.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{member.role}</td>
                        <td className="py-3.5 px-4 font-bold text-[#6B1120]">
                          {member.assignedHall}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          {member.beaconId}
                        </td>
                        <td className="py-3.5 px-4">
                          {renderBeaconStatus(member.beaconStatus)}
                        </td>
                        <td className="py-3.5 px-4">
                          {renderStatus(member.status)}
                        </td>
                        {role === 'coordinator' && (
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStaff(member);
                              }}
                              className="text-slate-400 hover:text-[#6B1120] p-1 rounded-lg"
                              title="Edit Invigilator Profile"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
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

        {/* Right Side: Selected Faculty Details Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          {activeStaff ? (
            <>
              {/* Profile Card Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#6B1120] text-white font-extrabold text-sm flex items-center justify-center shadow-2xs">
                      {activeStaff.initials}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{activeStaff.name}</h2>
                      <p className="text-xs text-slate-500">{activeStaff.designation} • {activeStaff.department}</p>
                    </div>
                  </div>

                  {role === 'coordinator' && (
                    <button
                      onClick={() => handleEditStaff(activeStaff)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#6B1120] hover:bg-slate-50"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Coordinator Status Override & Actions */}
              {role === 'coordinator' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setOverrideStatusVal(activeStaff.status);
                      setOverrideBeaconVal(activeStaff.beaconStatus);
                      setIsOverrideModalOpen(true);
                    }}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Override Status</span>
                  </button>
                </div>
              )}

              {/* Key Details Display (as requested by user) */}
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Faculty Name</span>
                  <span className="font-bold text-slate-900">{activeStaff.name}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Staff ID</span>
                  <span className="font-semibold text-slate-800">{activeStaff.staffId}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Assigned Hall</span>
                  <span className="font-bold text-[#6B1120]">{activeStaff.assignedHall}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Beacon ID</span>
                  <span className="font-mono font-bold text-slate-900">{activeStaff.beaconId}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Beacon Status</span>
                  <div>{renderBeaconStatus(activeStaff.beaconStatus)}</div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Signal Strength</span>
                  <span className="font-semibold text-slate-800">{activeStaff.signalStrength}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Last Detected</span>
                  <span className="font-semibold text-slate-800">{activeStaff.lastDetected}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Check-in Time</span>
                  <span className="font-semibold text-slate-800">{activeStaff.checkedInTime || 'Pending'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Current Status</span>
                  <div>{renderStatus(activeStaff.status)}</div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Account Status</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    {activeStaff.accountStatus}
                  </span>
                </div>
              </div>

              {/* Contact actions */}
              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`tel:${activeStaff.phone}`}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{activeStaff.phone || 'Call'}</span>
                </a>
                <a
                  href={`mailto:${activeStaff.email}`}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Email</span>
                </a>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a faculty member from the directory to view complete beacon telemetry.
            </div>
          )}
        </div>
      </div>

      {/* Manual Status Override Modal (Coordinator only) */}
      {isOverrideModalOpen && activeStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Manual Override: {activeStaff.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Manually set attendance and beacon detection state in the database.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attendance Status
                </label>
                <select
                  value={overrideStatusVal}
                  onChange={(e) => setOverrideStatusVal(e.target.value as StaffStatus)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="On Duty">On Duty</option>
                  <option value="Checked In">Checked In</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Standby">Standby</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beacon Status Override
                </label>
                <select
                  value={overrideBeaconVal}
                  onChange={(e) => setOverrideBeaconVal(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="Detected">Detected</option>
                  <option value="Weak Signal">Weak Signal</option>
                  <option value="Not Detected">Not Detected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Override Note / Authorization Reason
                </label>
                <input
                  type="text"
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="e.g. In-person visual verification by coordinator"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteOverride}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm"
                >
                  Save Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
