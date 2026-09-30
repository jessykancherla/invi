import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  RotateCw,
  Activity,
  Radio,
  Wifi,
  Check,
  X,
  Plus,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Battery
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { Device } from '../types';

export const DevicesPage: React.FC = () => {
  const { 
    devices, 
    searchQuery, 
    pingDevice, 
    rebootDevice, 
    addDevice, 
    setIsESP32ConsoleModalOpen 
  } = useExamContext();

  const { role } = useAuth();

  // Filters State
  const [selectedBlock, setSelectedBlock] = useState('All Blocks');
  const [selectedHall, setSelectedHall] = useState('All Halls');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Selected device ID for details pane
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // New Device Modal
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newHall, setNewHall] = useState('A1-01');
  const [newIp, setNewIp] = useState('192.168.1.150');

  // Reactive filtering
  const filteredDevices = useMemo(() => {
    return devices.filter((item) => {
      const matchBlock = selectedBlock === 'All Blocks' || item.block === selectedBlock;
      const matchHall = selectedHall === 'All Halls' || item.hall === selectedHall;
      
      let matchStatus = true;
      if (selectedStatus !== 'All Statuses') {
        if (selectedStatus === 'Online' || selectedStatus === 'Offline' || selectedStatus === 'Warning') {
          matchStatus = item.status === selectedStatus;
        } else if (selectedStatus === 'Detected' || selectedStatus === 'Weak Signal' || selectedStatus === 'Not Detected') {
          matchStatus = item.beaconStatus === selectedStatus;
        }
      }

      const query = searchQuery ? searchQuery.toLowerCase() : '';
      const matchSearch = !query ||
        item.deviceId.toLowerCase().includes(query) ||
        item.hall.toLowerCase().includes(query) ||
        item.beaconId.toLowerCase().includes(query) ||
        (item.assignedFaculty && item.assignedFaculty.toLowerCase().includes(query));

      return matchBlock && matchHall && matchStatus && matchSearch;
    });
  }, [devices, selectedBlock, selectedHall, selectedStatus, searchQuery]);

  // Active selected device
  const activeDevice: Device | undefined = useMemo(() => {
    if (selectedDeviceId) {
      const found = devices.find((d) => d.id === selectedDeviceId || d.deviceId === selectedDeviceId);
      if (found) return found;
    }
    return filteredDevices[0] || devices[0];
  }, [devices, selectedDeviceId, filteredDevices]);

  const handlePing = async (dev: Device) => {
    setActionFeedback(`Pinging ${dev.deviceId}...`);
    await pingDevice(dev.id);
    setActionFeedback(`Ping acknowledged by ${dev.deviceId} (14ms latency). Node responsive.`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleReboot = async (dev: Device) => {
    if (window.confirm(`Send remote reboot command to ESP32 node ${dev.deviceId}?`)) {
      setActionFeedback(`Rebooting ${dev.deviceId}...`);
      await rebootDevice(dev.id);
      setActionFeedback(`Reboot command acknowledged. Node ${dev.deviceId} online.`);
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const handleAddDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceId) return;
    const ok = await addDevice({
      deviceId: newDeviceId,
      hall: newHall,
      block: newHall.split('-')[0] || 'A1',
      floor: '1',
      ipAddress: newIp,
    });
    if (ok) {
      setIsAddDeviceOpen(false);
      setNewDeviceId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            ESP32 Devices & Beacons
          </h1>
          <p className="text-sm text-slate-400 font-normal mt-1">
            Hardware gateway status, Bluetooth beacon detection, and microcontroller node health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsESP32ConsoleModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Open ESP32 Console</span>
          </button>
          {role === 'coordinator' && (
            <button
              onClick={() => setIsAddDeviceOpen(true)}
              className="bg-[#6B1120] hover:bg-[#570E1C] active:bg-[#4A0E17] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Node</span>
            </button>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Block */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Block</label>
            <div className="relative">
              <select
                id="filter-device-block"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Blocks">All Blocks</option>
                <option value="A1">Block A1</option>
                <option value="B2">Block B2</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Hall */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hall</label>
            <div className="relative">
              <select
                id="filter-device-hall"
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
                id="filter-device-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120] transition-all cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Online">Node: Online</option>
                <option value="Offline">Node: Offline</option>
                <option value="Detected">Beacon: Detected</option>
                <option value="Weak Signal">Beacon: Weak Signal</option>
                <option value="Not Detected">Beacon: Not Detected</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Table + Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Device Node</th>
                  <th className="py-3.5 px-4 font-semibold">Hall</th>
                  <th className="py-3.5 px-4 font-semibold">Beacon ID</th>
                  <th className="py-3.5 px-4 font-semibold">Beacon Status</th>
                  <th className="py-3.5 px-4 font-semibold">Signal Strength</th>
                  <th className="py-3.5 px-4 font-semibold">Node Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Ping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No hardware devices match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((dev) => {
                    const isSelected = activeDevice?.id === dev.id;
                    const isOnline = dev.status === 'Online';
                    const isBeaconDetected = dev.beaconStatus === 'Detected';
                    const isBeaconWeak = dev.beaconStatus === 'Weak Signal';

                    return (
                      <tr
                        key={dev.id}
                        id={`device-row-${dev.deviceId}`}
                        onClick={() => setSelectedDeviceId(dev.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#6B1120]/5 text-slate-900 font-medium'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          {dev.deviceId}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#6B1120]">
                          {dev.hall}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                          {dev.beaconId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 font-semibold ${
                              isBeaconDetected
                                ? 'text-emerald-700'
                                : isBeaconWeak
                                ? 'text-amber-700'
                                : 'text-slate-400'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isBeaconDetected
                                  ? 'bg-emerald-500'
                                  : isBeaconWeak
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {dev.beaconStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {dev.signalStrength}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isOnline ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOnline ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            />
                            {dev.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400">
                          {dev.lastPing}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Device Details */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          {activeDevice ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-mono text-slate-900">
                      {activeDevice.deviceId}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Hall {activeDevice.hall} • Block {activeDevice.block}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      activeDevice.status === 'Online'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {activeDevice.status}
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePing(activeDevice)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ping Node</span>
                </button>
                {role === 'coordinator' && (
                  <button
                    onClick={() => handleReboot(activeDevice)}
                    className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-red-600" />
                    <span>Reboot Node</span>
                  </button>
                )}
              </div>

              {/* Specifications */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Assigned Hall</span>
                  <span className="font-bold text-[#6B1120]">{activeDevice.hall}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Detected Beacon</span>
                  <span className="font-mono font-bold text-slate-900">{activeDevice.beaconId}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Beacon Status</span>
                  <span className="font-semibold text-slate-800">{activeDevice.beaconStatus}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Signal Strength (RSSI)</span>
                  <span className="font-semibold text-slate-800">{activeDevice.signalStrength}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Battery Level</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    {activeDevice.batteryLevel}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">IP Address</span>
                  <span className="font-mono text-slate-600">{activeDevice.ipAddress}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Firmware</span>
                  <span className="font-mono text-slate-600">{activeDevice.firmwareVersion}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Last Telemetry Ping</span>
                  <span className="font-medium text-slate-600">{activeDevice.lastPing}</span>
                </div>
              </div>

              {/* Telemetry Endpoint Reference */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <span className="text-slate-500 font-semibold block text-[11px] mb-1">
                  Microcontroller Ingestion Endpoint:
                </span>
                <code className="text-[11px] text-indigo-700 bg-white px-2 py-1 rounded border border-slate-200 block truncate">
                  POST /api/esp32/telemetry
                </code>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select an ESP32 hub from the table to view telemetry.
            </div>
          )}
        </div>
      </div>

      {/* Register Node Modal */}
      {isAddDeviceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register New ESP32 Hub</h3>
            <p className="text-xs text-slate-500 mb-4">Pair a physical BLE gateway node to an exam hall.</p>

            <form onSubmit={handleAddDeviceSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hardware Device ID *
                </label>
                <input
                  type="text"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  placeholder="e.g. INV-0040"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Exam Hall
                </label>
                <input
                  type="text"
                  value={newHall}
                  onChange={(e) => setNewHall(e.target.value)}
                  placeholder="e.g. A1-01"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Static IP / LAN Address
                </label>
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="192.168.1.150"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDeviceOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#6B1120] hover:bg-[#570E1C] rounded-lg shadow-sm cursor-pointer"
                >
                  Register Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
