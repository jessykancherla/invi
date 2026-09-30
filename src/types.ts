export type NavigationPage = 
  | 'dashboard' 
  | 'exams' 
  | 'staff' 
  | 'halls' 
  | 'devices' 
  | 'esp32' 
  | 'replacements' 
  | 'settings';

export type UserRole = 'coordinator' | 'invigilator' | 'viewer';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  staffId?: string;
  department?: string;
  designation?: string;
  assignedBeaconId?: string;
}

export interface CollegeInfo {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  departments: string[];
  isSetupComplete: boolean;
  coordinator?: {
    name: string;
    email: string;
    phone: string;
    department?: string;
    designation?: string;
  } | null;
}

export type ExamStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed' | 'Ready' | 'Late' | 'Changed';

export type StaffStatus = 'Checked In' | 'On Duty' | 'Late' | 'Absent' | 'Standby';

export type HallStatus = 'Ready' | 'Setup Needed' | 'Problem' | 'In Session';

export type BeaconStatus = 'Detected' | 'Not Detected' | 'Weak Signal';

export type DeviceStatus = 'Online' | 'Warning' | 'Offline';

export interface Exam {
  id: string;
  exam: string;
  subjectCode: string;
  date: string;
  time: string;
  startTime: string;
  endTime: string;
  duration: string;
  session: string;
  hall: string;
  block: string;
  floor: string;
  staff: string;
  staffId?: string;
  teacher: string;
  backupTeacher: string;
  requiredInvigilators: number;
  status: 'Ready' | 'Late' | 'Changed' | 'In Progress' | 'Completed';
  notes: string;
  paperDistributionMinutesBefore: number;
}

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  staffId: string;
  role: 'Chief Superintendent' | 'Hall Invigilator' | 'Reliever' | 'Flying Squad';
  department: string;
  designation: string;
  email: string;
  phone: string;
  accountStatus: 'Active' | 'Inactive';
  beaconId: string;
  beaconStatus: BeaconStatus;
  signalStrength: string;
  lastDetected: string;
  checkedInTime?: string;
  status: StaffStatus;
  assignedHall: string;
  block: string;
  floor: string;
  assignedDeviceId: string;
}

export interface ExamHall {
  id: string;
  hall: string;
  block: string;
  floor: string;
  capacity: number;
  currentExam: string;
  faculty: string;
  beaconId: string;
  beaconStatus: BeaconStatus;
  deviceStatus: 'Online' | 'Offline';
  overallStatus: HallStatus;
  checklists: {
    examSet: boolean;
    deviceOn: boolean;
    facultyPresent: boolean;
    beaconDetected: boolean;
    noAlerts: boolean;
  };
  notes?: string;
}

export interface Device {
  id: string;
  deviceId: string;
  hall: string;
  block: string;
  floor: string;
  beaconId: string;
  beaconStatus: BeaconStatus;
  signalStrength: string;
  batteryLevel: number;
  lastPing: string;
  status: DeviceStatus;
  ipAddress: string;
  firmwareVersion: string;
  assignedFaculty: string;
}

export interface ReplacementRecord {
  id: string;
  examId: string;
  examSubject: string;
  hall: string;
  originalStaffId: string;
  originalStaffName: string;
  replacementStaffId: string;
  replacementStaffName: string;
  reason: string;
  coordinatorName: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  targetUserId: string;
  targetRole: 'all' | 'coordinator' | 'invigilator' | 'viewer';
  type: 'assignment' | 'replacement' | 'absence_alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, any>;
}

export interface ESP32TelemetryPacket {
  id: string;
  timestamp: string;
  deviceId: string;
  beaconId: string;
  rssi: number;
  signalQuality: string;
  action: string;
  matchedHall?: string;
  matchedStaff?: string;
}

export interface ProblemIncident {
  id: string;
  hall: string;
  examCode?: string;
  category: 'Staff Delay' | 'Question Paper Issue' | 'Medical Emergency' | 'Malpractice Suspected' | 'Infrastructure' | 'Device Fault';
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  reportedAt: string;
  reportedBy: string;
  status: 'Open' | 'Investigating' | 'Resolved';
}
