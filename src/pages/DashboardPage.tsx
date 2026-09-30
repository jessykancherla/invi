import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Landmark, 
  Users, 
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  UserCheck,
  Cpu,
  Clock,
  Radio,
  CheckCircle2,
  Plus,
  Download
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { PaperDistributionAlarm } from '../components/PaperDistributionAlarm';

export interface DashboardHallItem {
  id: string;
  hall: string;
  block: string;
  floor: string;
  currentExam: string;
  faculty: string;
  device: 'Online' | 'Offline';
  beacon: 'Detected' | 'Not Detected' | 'Weak Signal';
  status: 'Ready' | 'Problem';
}

export const DashboardPage: React.FC = () => {
  const { 
    setActivePage, 
    searchQuery, 
    halls, 
    exams, 
    staff, 
    devices, 
    metrics, 
    setIsSetInvigilatorModalOpen,
    setIsAddExamModalOpen,
    setIsESP32ConsoleModalOpen,
    openExportModal
  } = useExamContext();

  const { role, user, staffProfile } = useAuth();

  // Filters State
  const [selectedBlock, setSelectedBlock] = useState('All Blocks');
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedHall, setSelectedHall] = useState('All Halls');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Map persistent halls from backend to dashboard dataset
  const hallsData: DashboardHallItem[] = useMemo(() => {
    return halls.map((h) => {
      // Find matching device
      const dev = devices.find((d) => d.hall === h.hall);
      return {
        id: h.id,
        hall: h.hall,
        block: h.block || h.hall.split('-')[0] || 'A1',
        floor: h.floor || '01',
        currentExam: h.currentExam || 'Unscheduled',
        faculty: h.faculty || 'Unassigned',
        device: dev ? dev.status === 'Offline' ? 'Offline' : 'Online' : h.deviceStatus || 'Online',
        beacon: h.beaconStatus || 'Not Detected',
        status: h.overallStatus === 'Ready' ? 'Ready' : 'Problem',
      };
    });
  }, [halls, devices]);

  // Invigilator-specific assigned exam
  const assignedExamForInvigilator = useMemo(() => {
    if (role !== 'invigilator' && !staffProfile) return null;
    return exams.find(
      (e) =>
        (staffProfile && (e.staffId === staffProfile.id || e.staff === staffProfile.name)) ||
        (user && e.staff.toLowerCase().includes(user.name.toLowerCase()))
    ) || exams[0];
  }, [role, staffProfile, user, exams]);

  // Reactive filtering for hall status table
  const filteredHalls = useMemo(() => {
    return hallsData.filter((item) => {
      const matchBlock = 
        selectedBlock === 'All Blocks' || 
        item.block === selectedBlock || 
        `Block ${item.block}` === selectedBlock;

      const matchFloor = 
        selectedFloor === 'All Floors' || 
        item.floor === selectedFloor || 
        `Floor ${item.floor}` === selectedFloor ||
        item.floor === selectedFloor.replace(/^0+/, '');

      const matchHall = selectedHall === 'All Halls' || item.hall === selectedHall;

      let matchStatus = true;
      if (selectedStatus !== 'All Statuses') {
        if (selectedStatus === 'Ready' || selectedStatus === 'Problem') {
          matchStatus = item.status === selectedStatus;
        } else if (selectedStatus === 'Beacon: Detected' || selectedStatus === 'Detected') {
          matchStatus = item.beacon === 'Detected';
        } else if (selectedStatus === 'Beacon: Weak Signal' || selectedStatus === 'Weak Signal') {
          matchStatus = item.beacon === 'Weak Signal';
        } else if (selectedStatus === 'Beacon: Not Detected' || selectedStatus === 'Not Detected') {
          matchStatus = item.beacon === 'Not Detected';
        } else if (selectedStatus === 'Device: Online' || selectedStatus === 'Online') {
          matchStatus = item.device === 'Online';
        } else if (selectedStatus === 'Device: Offline' || selectedStatus === 'Offline') {
          matchStatus = item.device === 'Offline';
        }
      }

      const query = searchQuery ? searchQuery.toLowerCase() : '';
      const matchSearch = !query ||
        item.hall.toLowerCase().includes(query) ||
        item.currentExam.toLowerCase().includes(query) ||
        item.faculty.toLowerCase().includes(query) ||
        item.block.toLowerCase().includes(query);

      return matchBlock && matchFloor && matchHall && matchStatus && matchSearch;
    });
  }, [hallsData, selectedBlock, selectedFloor, selectedHall, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Invigilator Paper Distribution Alarm Banner */}
      {role === 'invigilator' && assignedExamForInvigilator && (
        <PaperDistributionAlarm
          assignedExam={assignedExamForInvigilator}
          staffProfile={staffProfile}
        />
      )}

      {/* Invigilator Personalized Status Panel */}
      {role === 'invigilator' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Invigilator Account
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {staffProfile?.department || 'Academic Department'} • Staff ID: {staffProfile?.staffId || user?.staffId || 'ST-001'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Hall</span>
                <span className="font-bold text-[#6B1120]">{assignedExamForInvigilator?.hall || staffProfile?.assignedHall || 'A1-01'}</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Beacon</span>
                <span className="font-bold text-slate-800">{staffProfile?.beaconId || user?.assignedBeaconId || 'B-1042'}</span>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 block text-[10px] uppercase font-semibold">Beacon Telemetry</span>
                <span className="font-bold text-emerald-900">{staffProfile?.beaconStatus || 'Detected'}</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Arrival Status</span>
                <span className="font-bold text-slate-800">{staffProfile?.status || 'Checked In'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 font-normal mt-1">
            Real-time examination telemetry, hall readiness, and beacon tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="export-dashboard-btn"
            onClick={() => openExportModal('exams')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export examination summaries, hall rosters, and attendance reports"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Report</span>
          </button>

          {role === 'coordinator' && (
            <>
              <button
                onClick={() => setIsESP32ConsoleModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Simulate ESP32 Packet</span>
              </button>
              <button
                onClick={() => setIsSetInvigilatorModalOpen(true)}
                className="px-4 py-2 bg-[#6B1120] hover:bg-[#570E1C] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Set Invigilator</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Exams */}
        <div 
          onClick={() => setActivePage('exams')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Exams</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#6B1120] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{metrics.todaysExamsCount}</p>
          <p className="text-xs text-slate-400 font-normal mt-1">Active scheduled exam papers</p>
        </div>

        {/* Halls Ready */}
        <div 
          onClick={() => setActivePage('halls')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Halls Ready</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-3xl font-extrabold text-slate-900">{metrics.hallsReadyCount}</p>
            <p className="text-xs text-slate-400 font-medium">/ {metrics.totalHallsCount} Total</p>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">All readiness checks verified</p>
        </div>

        {/* Staff Present */}
        <div 
          onClick={() => setActivePage('staff')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Present</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-3xl font-extrabold text-slate-900">{metrics.staffPresentCount}</p>
            <p className="text-xs text-slate-400 font-medium">/ {metrics.totalStaffCount} On Duty</p>
          </div>
          <p className="text-xs text-slate-400 font-normal mt-1">Confirmed via BLE beacons</p>
        </div>

        {/* Problems */}
        <div 
          onClick={() => setActivePage('halls')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Problems</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{metrics.openProblemsCount}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">
            {metrics.openProblemsCount > 0 ? 'Requires coordinator attention' : 'No open alerts'}
          </p>
        </div>
      </div>

      {/* Hall Status Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Section Header & Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hall Status</h2>
            <p className="text-xs text-slate-400">
              Live readiness checklist, BLE beacon telemetry, and hardware node status
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Block Filter */}
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            >
              <option value="All Blocks">All Blocks</option>
              <option value="A1">Block A1</option>
              <option value="A2">Block A2</option>
              <option value="B1">Block B1</option>
              <option value="B2">Block B2</option>
            </select>

            {/* Floor Filter */}
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            >
              <option value="All Floors">All Floors</option>
              <option value="01">Floor 01</option>
              <option value="02">Floor 02</option>
              <option value="03">Floor 03</option>
            </select>

            {/* Hall Filter */}
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            >
              <option value="All Halls">All Halls</option>
              {halls.map((h) => (
                <option key={h.id} value={h.hall}>
                  {h.hall}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Ready">Ready</option>
              <option value="Problem">Problem</option>
              <option value="Beacon: Detected">Beacon: Detected</option>
              <option value="Beacon: Weak Signal">Beacon: Weak Signal</option>
              <option value="Beacon: Not Detected">Beacon: Not Detected</option>
              <option value="Device: Online">Device: Online</option>
              <option value="Device: Offline">Device: Offline</option>
            </select>
          </div>
        </div>

        {/* Hall Status Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBFD] text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-5">Hall</th>
                <th className="py-3.5 px-5">Current Exam</th>
                <th className="py-3.5 px-5">Faculty</th>
                <th className="py-3.5 px-5">Device</th>
                <th className="py-3.5 px-5">Beacon</th>
                <th className="py-3.5 px-5">Status</th>
                {role === 'coordinator' && <th className="py-3.5 px-5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No examination halls match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredHalls.map((row) => {
                  const isDeviceOnline = row.device === 'Online';
                  const isBeaconDetected = row.beacon === 'Detected';
                  const isBeaconWeak = row.beacon === 'Weak Signal';
                  const isReady = row.status === 'Ready';

                  return (
                    <tr 
                      key={row.id} 
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Hall */}
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {row.hall}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Block {row.block}, Fl {row.floor}
                        </span>
                      </td>

                      {/* Current Exam */}
                      <td className="py-3.5 px-5 text-slate-700 font-medium">
                        {row.currentExam}
                      </td>

                      {/* Faculty */}
                      <td className="py-3.5 px-5 text-slate-900">
                        {row.faculty}
                      </td>

                      {/* Device Status */}
                      <td className="py-3.5 px-5">
                        <div className="inline-flex items-center gap-1.5 font-medium">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isDeviceOnline ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          <span className={isDeviceOnline ? 'text-slate-700' : 'text-red-700 font-bold'}>
                            {row.device}
                          </span>
                        </div>
                      </td>

                      {/* Beacon Status */}
                      <td className="py-3.5 px-5">
                        <div className="inline-flex items-center gap-1.5 font-medium">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isBeaconDetected
                                ? 'bg-emerald-500'
                                : isBeaconWeak
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span
                            className={
                              isBeaconDetected
                                ? 'text-slate-700'
                                : isBeaconWeak
                                ? 'text-amber-700 font-bold'
                                : 'text-slate-500 font-semibold'
                            }
                          >
                            {row.beacon}
                          </span>
                        </div>
                      </td>

                      {/* Overall Status */}
                      <td className="py-3.5 px-5">
                        <div className="inline-flex items-center gap-1.5 font-semibold">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isReady ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          <span className={isReady ? 'text-emerald-700' : 'text-red-700 font-bold'}>
                            {row.status}
                          </span>
                        </div>
                      </td>

                      {/* Coordinator Actions */}
                      {role === 'coordinator' && (
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => {
                              const ex = exams.find((e) => e.hall === row.hall);
                              if (ex) {
                                setIsSetInvigilatorModalOpen(true);
                              } else {
                                setIsSetInvigilatorModalOpen(true);
                              }
                            }}
                            className="text-[#6B1120] hover:underline font-semibold text-xs cursor-pointer"
                          >
                            Assign
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
    </div>
  );
};
