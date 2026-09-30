import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Radio, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  Copy, 
  Terminal, 
  RefreshCw 
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';

export const ESP32ConsoleModal: React.FC = () => {
  const { 
    isESP32ConsoleModalOpen, 
    setIsESP32ConsoleModalOpen, 
    devices, 
    staff, 
    halls, 
    esp32Logs, 
    sendESP32Telemetry, 
    refreshData 
  } = useExamContext();

  const [activeTab, setActiveTab] = useState<'simulator' | 'logs' | 'firmware'>('simulator');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('INV-0012');
  const [selectedBeaconId, setSelectedBeaconId] = useState<string>('B-1042');
  const [rssi, setRssi] = useState<number>(-62);
  const [isSending, setIsSending] = useState(false);
  const [lastAck, setLastAck] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isESP32ConsoleModalOpen) return null;

  const handleDeviceChange = (devId: string) => {
    setSelectedDeviceId(devId);
    const dev = devices.find((d) => d.deviceId === devId);
    if (dev && dev.beaconId) {
      setSelectedBeaconId(dev.beaconId);
    }
  };

  const handleTransmit = async () => {
    setIsSending(true);
    setLastAck(null);
    try {
      const res = await sendESP32Telemetry({
        deviceId: selectedDeviceId,
        beaconId: selectedBeaconId,
        rssi,
      });
      setLastAck(`ACK Received: Packet ${res.telemetry?.packet?.id || 'OK'} processed. Database synced!`);
      await refreshData();
    } catch (err: any) {
      alert(`Transmission failed: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const sampleArduinoCode = `/*
 * INVI Smart Invigilation - ESP32 BLE Hardware Hub Firmware
 * Scans for BLE Beacons and sends telemetry to the INVI Backend REST API
 */
#include <WiFi.h>
#include <HTTPClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

const char* WIFI_SSID = "INVI-CAMPUS-WIFI";
const char* WIFI_PASS = "InviExamSecure2025";
const char* INVI_API_ENDPOINT = "http://YOUR-INVI-SERVER:3000/api/esp32/telemetry";

const char* HARDWARE_DEVICE_ID = "${selectedDeviceId}";
const int SCAN_TIME_SECONDS = 3;

BLEScan* pBLEScan;

void sendTelemetry(const char* beaconId, int rssi) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(INVI_API_ENDPOINT);
    http.addHeader("Content-Type", "application/json");

    String payload = String("{\\"deviceId\\":\\"") + HARDWARE_DEVICE_ID + 
                     "\\",\\"beaconId\\":\\"" + beaconId + 
                     "\\",\\"rssi\\":" + String(rssi) + "}";

    int httpResponseCode = http.POST(payload);
    Serial.printf("[INVI] Sent %s (RSSI: %d) -> HTTP %d\\n", beaconId, rssi, httpResponseCode);
    http.end();
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\\n[INVI Hub] Wi-Fi Connected!");

  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setActiveScan(true);
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99);
}

void loop() {
  BLEScanResults foundDevices = pBLEScan->start(SCAN_TIME_SECONDS, false);
  for (int i = 0; i < foundDevices.getCount(); i++) {
    BLEAdvertisedDevice device = foundDevices.getDevice(i);
    // Transmit scanned beacon to backend
    sendTelemetry(device.getAddress().toString().c_str(), device.getRSSI());
  }
  pBLEScan->clearResults();
  delay(2000);
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">ESP32 Hardware & BLE Console</h2>
              <p className="text-xs text-slate-500">Live hardware telemetry, packet injection, and firmware setup</p>
            </div>
          </div>
          <button
            onClick={() => setIsESP32ConsoleModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'simulator' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Hardware Packet Simulator
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'logs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Live Telemetry Logs ({esp32Logs.length})
          </button>
          <button
            onClick={() => setActiveTab('firmware')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'firmware' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ESP32 Arduino C++ Code
          </button>
        </div>

        {/* Content */}
        <div className="mt-5">
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/60 rounded-xl text-xs text-indigo-900">
                <p className="font-semibold">Simulate ESP32 Microcontroller Transmissions</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Test live presence detection. Transmitting will immediately update the database, trigger hall readiness, and update faculty status in real-time.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Device Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ESP32 Device / Hub
                  </label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {devices.map((d) => (
                      <option key={d.id} value={d.deviceId}>
                        {d.deviceId} ({d.hall} - {d.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Beacon Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detected Beacon ID
                  </label>
                  <select
                    value={selectedBeaconId}
                    onChange={(e) => setSelectedBeaconId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.beaconId}>
                        {s.beaconId} ({s.name} - {s.assignedHall})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RSSI Signal Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Signal Strength (RSSI: {rssi} dBm)
                </label>
                <input
                  type="range"
                  min="-100"
                  max="-40"
                  value={rssi}
                  onChange={(e) => setRssi(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setRssi(-58)}
                    className={`flex-1 py-1 text-[11px] font-medium rounded-lg border cursor-pointer transition-colors ${
                      rssi >= -75 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Detected (-58 dBm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRssi(-84)}
                    className={`flex-1 py-1 text-[11px] font-medium rounded-lg border cursor-pointer transition-colors ${
                      rssi >= -88 && rssi < -75 ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Weak Signal (-84 dBm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRssi(-96)}
                    className={`flex-1 py-1 text-[11px] font-medium rounded-lg border cursor-pointer transition-colors ${
                      rssi < -88 ? 'bg-red-50 text-red-700 border-red-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Out of Range (-96 dBm)
                  </button>
                </div>
              </div>

              {lastAck && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{lastAck}</span>
                </div>
              )}

              {/* Transmit Button */}
              <button
                type="button"
                disabled={isSending}
                onClick={handleTransmit}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Transmitting to /api/esp32/telemetry...' : 'Transmit Telemetry Packet'}</span>
              </button>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Recent Ingested Hardware Packets</span>
                <button
                  onClick={() => refreshData()}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] p-3 space-y-2">
                {esp32Logs.length === 0 ? (
                  <p className="text-slate-500">No telemetry packets received yet.</p>
                ) : (
                  esp32Logs.map((log) => (
                    <div key={log.id} className="border-b border-slate-800 pb-1.5 last:border-0">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>[{log.timestamp}] Hub: {log.deviceId}</span>
                        <span className={log.rssi >= -75 ? 'text-emerald-400' : log.rssi >= -88 ? 'text-amber-400' : 'text-red-400'}>
                          RSSI: {log.rssi} dBm ({log.signalQuality})
                        </span>
                      </div>
                      <div className="text-slate-200 mt-0.5">
                        Beacon <span className="text-cyan-300 font-bold">{log.beaconId}</span> &rarr; {log.action}
                        {log.matchedStaff && <span className="text-slate-400"> (Faculty: {log.matchedStaff})</span>}
                        {log.matchedHall && <span className="text-slate-400"> (Hall: {log.matchedHall})</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'firmware' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Arduino C++ Sketch for ESP32 BLE Hub</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sampleArduinoCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] p-3 leading-relaxed">
                {sampleArduinoCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsESP32ConsoleModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
