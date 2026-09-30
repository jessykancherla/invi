import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Check, 
  X, 
  AlertCircle, 
  Landmark, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Radio, 
  ShieldCheck,
  Download 
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { ExamHall } from '../types';

export const HallsPage: React.FC = () => {
  const { 
    halls, 
    searchQuery, 
    toggleHallChecklist, 
    setIsHallModalOpen, 
    setSelectedHallForAction,
    openExportModal 
  } = useExamContext();

  const { role } = useAuth();

  // Filters State
  const [selectedBlock, setSelectedBlock] = useState('All Blocks');
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Currently selected hall ID for details pane
  const [selectedHallId, setSelectedHallId] = useState<string>('');

  // Reactive filtering
  const filteredHalls = useMemo(() => {
    return halls.filter((item) => {
      const matchBlock = 
        selectedBlock === 'All Blocks' || 
        item.block === selectedBlock || 
        `Block ${item.block}` === selectedBlock;

      const matchFloor = 
        selectedFloor === 'All Floors' || 
        item.floor === selectedFloor || 
        `Floor ${item.floor}` === selectedFloor ||
        item.floor === selectedFloor.replace(/^0+/, '');

      let matchStatus = true;
      if (selectedStatus !== 'All Statuses') {
        if (selectedStatus === 'Ready' || selectedStatus === 'Problem') {
          matchStatus = item.overallStatus === selectedStatus;
        } else if (selectedStatus === 'Detected' || selectedStatus === 'Weak Signal' || selectedStatus === 'Not Detected') {
          matchStatus = item.beaconStatus === selectedStatus;
        }
      }

      const query = searchQuery ? searchQuery.toLowerCase() : '';
      const matchSearch = !query ||
        item.hall.toLowerCase().includes(query) ||
        item.currentExam.toLowerCase().includes(query) ||
        item.faculty.toLowerCase().includes(query) ||
        item.block.toLowerCase().includes(query) ||
        item.beaconId.toLowerCase().includes(query);

      return matchBlock && matchFloor && matchStatus && matchSearch;
    });
  }, [halls, selectedBlock, selectedFloor, selectedStatus, searchQuery]);

  // Active selected hall
  const activeHall: ExamHall | undefined = useMemo(() => {
    if (selectedHallId) {
      const found = halls.find((h) => h.id === selectedHallId || h.hall === selectedHallId);
      if (found) return found;
    }
    return filteredHalls[0] || halls[0];
  }, [halls, selectedHallId, filteredHalls]);

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

  const handleEditHall = (hallItem: ExamHall) => {
    setSelectedHallForAction(hallItem);
    setIsHallModalOpen(true);
  };

  const handleCreateHall = () => {
    setSelectedHallForAction(null);
    setIsHallModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Exam Halls
          </h1>
          <p className="text-sm text-slate-400 font-normal mt-1">
            Exam hall allocation, hardware BLE hub telemetry, and 5-point readiness checklist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="export-halls-btn"
            onClick={() => openExportModal('halls')}
            className="self-start sm:self-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            title="Export examination halls status and readiness checklist"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Halls</span>
          </button>

          {role === 'coordinator' && (
            <button
              id="add-hall-btn"
              onClick={handleCreateHall}
              className="self-start sm:self-center bg-[#6B1120] hover:bg-[#570E1C] active:bg-[#4A0E17] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exam Hall</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Block */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Block</label>
            <div className="relative">
              <select
                id="filter-hall-block"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Blocks">All Blocks</option>
                <option value="A1">Block A1</option>
                <option value="A2">Block A2</option>
                <option value="B1">Block B1</option>
                <option value="B2">Block B2</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Floor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Floor</label>
            <div className="relative">
              <select
                id="filter-hall-floor"
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Floors">All Floors</option>
                <option value="01">Floor 01</option>
                <option value="02">Floor 02</option>
                <option value="03">Floor 03</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
            <div className="relative">
              <select
                id="filter-hall-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Ready">Overall: Ready</option>
                <option value="Problem">Overall: Problem</option>
                <option value="Detected">Beacon: Detected</option>
                <option value="Weak Signal">Beacon: Weak Signal</option>
                <option value="Not Detected">Beacon: Not Detected</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Table + Side Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Hall</th>
                  <th className="py-3.5 px-4 font-semibold">Block / Floor</th>
                  <th className="py-3.5 px-4 font-semibold">Current Exam</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Faculty</th>
                  <th className="py-3.5 px-4 font-semibold">Beacon ID</th>
                  <th className="py-3.5 px-4 font-semibold">Beacon Status</th>
                  <th className="py-3.5 px-4 font-semibold">Device</th>
                  <th className="py-3.5 px-4 font-semibold">Overall Status</th>
                  {role === 'coordinator' && <th className="py-3.5 px-4 font-semibold text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHalls.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'coordinator' ? 9 : 8} className="py-8 text-center text-slate-400">
                      No examination halls match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredHalls.map((h) => {
                    const isSelected = activeHall?.id === h.id || activeHall?.hall === h.hall;
                    const isDeviceOn = h.deviceStatus === 'Online';
                    const isReady = h.overallStatus === 'Ready';

                    return (
                      <tr
                        key={h.id}
                        id={`hall-row-${h.hall}`}
                        onClick={() => setSelectedHallId(h.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#6B1120]/5 text-slate-900 font-medium'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-[#6B1120] text-sm">
                          {h.hall}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          Block {h.block}, Fl {h.floor}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {h.currentExam}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800">
                          {h.faculty}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                          {h.beaconId}
                        </td>
                        <td className="py-3.5 px-4">
                          {renderBeaconStatus(h.beaconStatus)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isDeviceOn ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isDeviceOn ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            />
                            {h.deviceStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              isReady ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isReady ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            />
                            {h.overallStatus}
                          </span>
                        </td>
                        {role === 'coordinator' && (
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditHall(h);
                              }}
                              className="text-slate-400 hover:text-[#6B1120] p-1"
                              title="Edit Hall"
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

        {/* Right Side: Selected Hall Details & Readiness Checklist */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          {activeHall ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#6B1120] tracking-tight">
                      Hall {activeHall.hall}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Block {activeHall.block} • Floor {activeHall.floor} • Capacity: {activeHall.capacity || 40} Seats
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      activeHall.overallStatus === 'Ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {activeHall.overallStatus === 'Ready' ? 'Hall Ready' : 'Attention Needed'}
                  </span>
                </div>
              </div>

              {/* Hall Information */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Current Exam</span>
                  <span className="font-bold text-slate-900">{activeHall.currentExam}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Assigned Faculty</span>
                  <span className="font-bold text-slate-900">{activeHall.faculty}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">BLE Beacon ID</span>
                  <span className="font-mono font-bold text-slate-900">{activeHall.beaconId}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Beacon Telemetry</span>
                  <div>{renderBeaconStatus(activeHall.beaconStatus)}</div>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Hardware Hub Device</span>
                  <span className="font-semibold text-slate-800">{activeHall.deviceStatus}</span>
                </div>
              </div>

              {/* Readiness Checklist (As requested by user: 5-point checklist) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Readiness Checklist
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    (Requires all 5 for 'Ready')
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* 1. Exam Set */}
                  <div
                    onClick={() => role === 'coordinator' && toggleHallChecklist(activeHall.id, 'examSet')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      role === 'coordinator' ? 'cursor-pointer' : ''
                    } ${
                      activeHall.checklists.examSet
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>✓ Exam Set</span>
                    {activeHall.checklists.examSet ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  {/* 2. Device On */}
                  <div
                    onClick={() => role === 'coordinator' && toggleHallChecklist(activeHall.id, 'deviceOn')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      role === 'coordinator' ? 'cursor-pointer' : ''
                    } ${
                      activeHall.checklists.deviceOn
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>✓ Device On</span>
                    {activeHall.checklists.deviceOn ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  {/* 3. Faculty Present */}
                  <div
                    onClick={() => role === 'coordinator' && toggleHallChecklist(activeHall.id, 'facultyPresent')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      role === 'coordinator' ? 'cursor-pointer' : ''
                    } ${
                      activeHall.checklists.facultyPresent
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>✓ Faculty Present</span>
                    {activeHall.checklists.facultyPresent ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  {/* 4. Beacon Detected */}
                  <div
                    onClick={() => role === 'coordinator' && toggleHallChecklist(activeHall.id, 'beaconDetected')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      role === 'coordinator' ? 'cursor-pointer' : ''
                    } ${
                      activeHall.checklists.beaconDetected
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>✓ Beacon Detected</span>
                    {activeHall.checklists.beaconDetected ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  {/* 5. No Alerts */}
                  <div
                    onClick={() => role === 'coordinator' && toggleHallChecklist(activeHall.id, 'noAlerts')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      role === 'coordinator' ? 'cursor-pointer' : ''
                    } ${
                      activeHall.checklists.noAlerts
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>✓ No Alerts</span>
                    {activeHall.checklists.noAlerts ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  {role === 'coordinator' ? 'Click any checklist item above to toggle manual override.' : 'Readiness is synchronized via BLE beacon hub.'}
                </p>
              </div>

              {/* Notes */}
              <div>
                <span className="text-slate-400 text-xs block mb-1">Hall Notes:</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                  {activeHall.notes || 'Desks numbered. Room sanitized.'}
                </p>
              </div>

              {/* Coordinator Edit Hall Button */}
              {role === 'coordinator' && (
                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleEditHall(activeHall)}
                    className="flex-1 py-2 text-xs font-semibold text-[#6B1120] hover:bg-[#6B1120]/10 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Hall Settings</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select an exam hall to view its live readiness verification checklist.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
