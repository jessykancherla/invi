import { Exam, StaffMember, ExamHall, ReplacementRecord, CollegeInfo } from '../types';

/**
 * Downloads a string payload as a file in the user's browser
 */
export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Converts headers and rows to an RFC 4180 compliant CSV string with UTF-8 BOM
 */
export function buildCSV(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((r) => r.map(escapeCell).join(','));
  
  // \uFEFF Byte Order Mark ensures Excel handles UTF-8 correctly
  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}

/**
 * Exports data to a CSV file and downloads it
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const csvContent = buildCSV(headers, rows);
  downloadFile(filename.endsWith('.csv') ? filename : `${filename}.csv`, csvContent, 'text/csv;charset=utf-8;');
}

/**
 * Exports data to a formatted JSON file and downloads it
 */
export function exportToJSON(filename: string, data: any): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(filename.endsWith('.json') ? filename : `${filename}.json`, jsonContent, 'application/json;charset=utf-8;');
}

/**
 * Copies plain text or tab-separated table to system clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Generates tab-separated text (ideal for pasting directly into Excel or Google Sheets)
 */
export function buildTSV(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const cleanCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '';
    return String(val).replace(/[\t\r\n]+/g, ' ');
  };
  const headerLine = headers.map(cleanCell).join('\t');
  const rowLines = rows.map((r) => r.map(cleanCell).join('\t'));
  return [headerLine, ...rowLines].join('\n');
}

/**
 * Exams Timetable & Invigilator Duty Roster CSV Generator
 */
export function exportExamsCSV(exams: Exam[], collegeName?: string): void {
  const headers = [
    'Subject Name',
    'Subject Code',
    'Date',
    'Session',
    'Start Time',
    'End Time',
    'Duration',
    'Exam Hall',
    'Block',
    'Floor',
    'Assigned Invigilator',
    'Invigilator ID',
    'Chief Teacher',
    'Backup Invigilator',
    'Required Staff',
    'Status',
    'Paper Distribution Alarm (Min)',
    'Notes'
  ];

  const rows = exams.map((e) => [
    e.exam || '',
    e.subjectCode || '',
    e.date || '',
    e.session || '',
    e.startTime || '',
    e.endTime || '',
    e.duration || '',
    e.hall || '',
    e.block || '',
    e.floor || '',
    e.staff || '',
    e.staffId || '',
    e.teacher || '',
    e.backupTeacher || '',
    e.requiredInvigilators ?? 1,
    e.status || 'Ready',
    e.paperDistributionMinutesBefore ?? 15,
    e.notes || ''
  ]);

  const dateStr = new Date().toISOString().split('T')[0];
  const prefix = collegeName ? `${collegeName.replace(/[^a-zA-Z0-9]/g, '_')}_` : '';
  exportToCSV(`${prefix}Exam_Timetable_${dateStr}.csv`, headers, rows);
}

/**
 * Staff & Invigilator Roster CSV Generator
 */
export function exportStaffCSV(staff: StaffMember[], collegeName?: string): void {
  const headers = [
    'Faculty Name',
    'Staff ID',
    'Department',
    'Designation',
    'Invigilation Role',
    'Assigned Hall',
    'Block',
    'Floor',
    'Beacon ID',
    'Beacon Telemetry Status',
    'Signal Strength',
    'Duty Attendance Status',
    'Checked-In Time',
    'Last Detected',
    'Phone',
    'Email',
    'Account Status'
  ];

  const rows = staff.map((s) => [
    s.name || '',
    s.staffId || '',
    s.department || '',
    s.designation || '',
    s.role || '',
    s.assignedHall || '',
    s.block || '',
    s.floor || '',
    s.beaconId || '',
    s.beaconStatus || '',
    s.signalStrength || '',
    s.status || '',
    s.checkedInTime || '',
    s.lastDetected || '',
    s.phone || '',
    s.email || '',
    s.accountStatus || 'Active'
  ]);

  const dateStr = new Date().toISOString().split('T')[0];
  const prefix = collegeName ? `${collegeName.replace(/[^a-zA-Z0-9]/g, '_')}_` : '';
  exportToCSV(`${prefix}Invigilator_Staff_Roster_${dateStr}.csv`, headers, rows);
}

/**
 * Exam Halls Readiness Report CSV Generator
 */
export function exportHallsCSV(halls: ExamHall[], collegeName?: string): void {
  const headers = [
    'Hall Number',
    'Block',
    'Floor',
    'Student Capacity',
    'Current Exam',
    'Assigned Faculty',
    'Overall Readiness',
    'BLE Device Status',
    'Beacon ID',
    'Beacon Telemetry',
    'Exam Paper Set',
    'ESP32 Device Powered',
    'Faculty Present',
    'Beacon Detected',
    'No Active Alerts',
    'Notes'
  ];

  const rows = halls.map((h) => [
    h.hall || '',
    h.block || '',
    h.floor || '',
    h.capacity ?? 40,
    h.currentExam || '',
    h.faculty || '',
    h.overallStatus || 'Ready',
    h.deviceStatus || 'Online',
    h.beaconId || '',
    h.beaconStatus || '',
    h.checklists?.examSet ? 'YES' : 'NO',
    h.checklists?.deviceOn ? 'YES' : 'NO',
    h.checklists?.facultyPresent ? 'YES' : 'NO',
    h.checklists?.beaconDetected ? 'YES' : 'NO',
    h.checklists?.noAlerts ? 'YES' : 'NO',
    h.notes || ''
  ]);

  const dateStr = new Date().toISOString().split('T')[0];
  const prefix = collegeName ? `${collegeName.replace(/[^a-zA-Z0-9]/g, '_')}_` : '';
  exportToCSV(`${prefix}Exam_Halls_Readiness_${dateStr}.csv`, headers, rows);
}

/**
 * Replacement Audit Log CSV Generator
 */
export function exportReplacementsCSV(replacements: ReplacementRecord[], collegeName?: string): void {
  const headers = [
    'Substitution Timestamp',
    'Exam Subject',
    'Exam Hall',
    'Original Invigilator',
    'Original Staff ID',
    'Replacement Invigilator',
    'Replacement Staff ID',
    'Reason for Replacement',
    'Authorized Coordinator',
    'Audit Log ID'
  ];

  const rows = replacements.map((r) => [
    r.timestamp || '',
    r.examSubject || '',
    r.hall || '',
    r.originalStaffName || '',
    r.originalStaffId || '',
    r.replacementStaffName || '',
    r.replacementStaffId || '',
    r.reason || '',
    r.coordinatorName || '',
    r.id || ''
  ]);

  const dateStr = new Date().toISOString().split('T')[0];
  const prefix = collegeName ? `${collegeName.replace(/[^a-zA-Z0-9]/g, '_')}_` : '';
  exportToCSV(`${prefix}Invigilator_Replacements_Audit_${dateStr}.csv`, headers, rows);
}

/**
 * Full Institutional System Backup (JSON)
 */
export function exportFullBackupJSON(data: {
  college?: CollegeInfo | null;
  exams: Exam[];
  staff: StaffMember[];
  halls: ExamHall[];
  replacements: ReplacementRecord[];
  devices?: any[];
  exportedAt?: string;
}): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const payload = {
    system: 'INVI Exam Invigilation Management Platform',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    institution: data.college || { name: 'INVI Examination Cell' },
    summary: {
      totalExams: data.exams.length,
      totalStaff: data.staff.length,
      totalHalls: data.halls.length,
      totalReplacements: data.replacements.length,
      totalDevices: data.devices?.length || 0,
    },
    data: {
      exams: data.exams,
      staff: data.staff,
      halls: data.halls,
      replacements: data.replacements,
      devices: data.devices || []
    }
  };

  const filename = `INVI_Complete_System_Backup_${dateStr}.json`;
  exportToJSON(filename, payload);
}
