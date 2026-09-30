import React, { useState } from 'react';
import { 
  Cpu, 
  Radio, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Wifi, 
  Copy, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';

export const ESP32HubPage: React.FC = () => {
  const { 
    devices, 
    staff, 
    halls, 
    esp32Logs, 
    sendESP32Telemetry, 
    refreshData 
  } = useExamContext();

  const { role } = useAuth();

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('INV-0012');
  const [selectedBeaconId, setSelectedBeaconId] = useState<string>('B-1042');
  const [rssi, setRssi] = useState<number>(-60);
  const [isSending, setIsSending] = useState(false);
  const [lastAck, setLastAck] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleDeviceChange = (devId: string) => {
    setSelectedDeviceId(devId);
    const dev = devices.find((d) => d.deviceId === devId);
    if (dev?.beaconId) setSelectedBeaconId(dev.beaconId);
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
      setLastAck(`ACK: Packet received. Matched Hall: ${res.telemetry?.matchedHall?.hall || 'N/A'}, Staff: ${res.telemetry?.matchedStaff?.name || 'N/A'}`);
      await refreshData();
    } catch (err: any) {
      alert(`Telemetry transmission error: ${err.message}`);
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
const char* INVI_API_ENDPOINT = "http://YOUR-INVI-HOST:3000/api/esp32/telemetry";

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
    sendTelemetry(device.getAddress().toString().c_str(), device.getRSSI());
  }
  pBLEScan->clearResults();
  delay(2000);
}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ESP32 Hardware Hub
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-sm text-slate-400 font-normal mt-1">
            Real-time BLE beacon scanning, gateway node telemetry, and microcontroller packet ingestion.
          </p>
        </div>

        <button
          onClick={() => refreshData()}
          className="self-start sm:self-center px-4 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Hardware Status</span>
        </button>
      </div>

      {/* Architecture Overview Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-[#4A0E17] text-white rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
              Hardware Telemetry Architecture
            </p>
            <p className="text-sm font-semibold mt-1">
              ESP32 Hub &rarr; Wi-Fi &rarr; POST /api/esp32/telemetry &rarr; INVI Persistent Database &rarr; Live Dashboard
            </p>
            <p className="text-xs text-white/70 mt-0.5">
              The web browser never directly polls microcontrollers. Incoming beacon packets automatically update presence and hall readiness.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center px-3 py-1.5 bg-white/10 rounded-xl border border-white/10">
              <p className="text-[10px] text-white/60 uppercase">Online Hubs</p>
              <p className="text-sm font-bold text-emerald-400">
                {devices.filter((d) => d.status === 'Online').length} / {devices.length}
              </p>
            </div>
            <div className="text-center px-3 py-1.5 bg-white/10 rounded-xl border border-white/10">
              <p className="text-[10px] text-white/60 uppercase">Packets Logged</p>
              <p className="text-sm font-bold text-amber-300">{esp32Logs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Simulator & Live Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Packet Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">ESP32 Packet Simulator</h3>
                <p className="text-xs text-slate-500">Inject telemetry packets to test presence workflows</p>
              </div>
            </div>

            {/* Hub Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select ESP32 Hub Node
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.deviceId}>
                    {d.deviceId} – Hall {d.hall} (Block {d.block}) – Status: {d.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Beacon Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detected Faculty Beacon
              </label>
              <select
                value={selectedBeaconId}
                onChange={(e) => setSelectedBeaconId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.beaconId}>
                    {s.beaconId} – {s.name} ({s.assignedHall})
                  </option>
                ))}
              </select>
            </div>

            {/* RSSI Signal Slider & Presets */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Signal Strength (RSSI)</span>
                <span className="font-mono text-indigo-600">{rssi} dBm</span>
              </div>
              <input
                type="range"
                min="-100"
                max="-40"
                value={rssi}
                onChange={(e) => setRssi(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setRssi(-58)}
                  className={`py-1 text-[11px] font-semibold rounded-lg border cursor-pointer transition-colors ${
                    rssi >= -75 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Detected (-58)
                </button>
                <button
                  type="button"
                  onClick={() => setRssi(-84)}
                  className={`py-1 text-[11px] font-semibold rounded-lg border cursor-pointer transition-colors ${
                    rssi >= -88 && rssi < -75 ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Weak (-84)
                </button>
                <button
                  type="button"
                  onClick={() => setRssi(-96)}
                  className={`py-1 text-[11px] font-semibold rounded-lg border cursor-pointer transition-colors ${
                    rssi < -88 ? 'bg-red-50 text-red-800 border-red-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Lost (-96)
                </button>
              </div>
            </div>

            {lastAck && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{lastAck}</span>
              </div>
            )}

            <button
              type="button"
              disabled={isSending}
              onClick={handleTransmit}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Transmitting...' : 'Transmit Telemetry to Backend'}</span>
            </button>
          </div>

          {/* Sample Firmware Viewer */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Arduino C++ ESP32 Firmware</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sampleArduinoCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="max-h-48 overflow-y-auto bg-slate-950 text-emerald-400 font-mono text-[10px] p-3 rounded-xl leading-relaxed">
              {sampleArduinoCode}
            </pre>
          </div>
        </div>

        {/* Right Column: Live Ingested Packet Logs */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#6B1120]" />
              <h3 className="text-sm font-bold text-slate-900">
                Live Ingested Telemetry Feed ({esp32Logs.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Auto-refreshes every 4s</span>
          </div>

          <div className="flex-1 max-h-[560px] overflow-y-auto space-y-2.5 pr-1 font-mono text-xs">
            {esp32Logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No telemetry packets recorded yet. Transmit a packet or connect a real ESP32 device!
              </div>
            ) : (
              esp32Logs.map((log) => {
                const isStrong = log.rssi >= -75;
                const isWeak = log.rssi >= -88 && log.rssi < -75;

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                          {log.deviceId}
                        </span>
                        <span className="text-slate-500 text-[11px]">[{log.timestamp}]</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isStrong
                            ? 'bg-emerald-100 text-emerald-800'
                            : isWeak
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.rssi} dBm ({log.signalQuality})
                      </span>
                    </div>

                    <div className="mt-2 text-slate-800 text-xs">
                      Scanned Beacon: <span className="font-bold text-[#6B1120]">{log.beaconId}</span> &bull; Action: <span className="font-semibold">{log.action}</span>
                    </div>

                    {(log.matchedStaff || log.matchedHall) && (
                      <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-3">
                        {log.matchedStaff && <span>Faculty: <strong className="text-slate-700">{log.matchedStaff}</strong></span>}
                        {log.matchedHall && <span>Hall: <strong className="text-slate-700">{log.matchedHall}</strong></span>}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
