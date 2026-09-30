import fs from 'fs';
import path from 'path';

export interface CollegeProfile {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  departments: string[];
  isSetupComplete: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  password: string; // Plain/hashed for session auth
  role: 'coordinator' | 'invigilator' | 'viewer';
  name: string;
  phone: string;
  staffId?: string;
  department?: string;
  designation?: string;
  assignedBeaconId?: string;
  createdAt: string;
}

export interface StaffRecord {
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
  beaconStatus: 'Detected' | 'Not Detected' | 'Weak Signal';
  signalStrength: string;
  lastDetected: string;
  checkedInTime?: string;
  status: 'Checked In' | 'On Duty' | 'Late' | 'Absent' | 'Standby';
  assignedHall: string;
  block: string;
  floor: string;
  assignedDeviceId: string;
}

export interface ExamHallRecord {
  id: string;
  hall: string;
  block: string;
  floor: string;
  capacity: number;
  currentExam: string;
  faculty: string;
  beaconId: string;
  beaconStatus: 'Detected' | 'Not Detected' | 'Weak Signal';
  deviceStatus: 'Online' | 'Offline';
  overallStatus: 'Ready' | 'Problem' | 'In Session' | 'Setup Needed';
  checklists: {
    examSet: boolean;
    deviceOn: boolean;
    facultyPresent: boolean;
    beaconDetected: boolean;
    noAlerts: boolean;
  };
  notes?: string;
}

export interface ExamRecord {
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

export interface DeviceRecord {
  id: string;
  deviceId: string;
  hall: string;
  block: string;
  floor: string;
  beaconId: string;
  beaconStatus: 'Detected' | 'Not Detected' | 'Weak Signal';
  signalStrength: string;
  batteryLevel: number;
  lastPing: string;
  status: 'Online' | 'Offline' | 'Warning';
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

export interface NotificationRecord {
  id: string;
  targetUserId: string; // 'all' or user ID or staff email
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

export interface DatabaseSchema {
  college: CollegeProfile;
  users: UserAccount[];
  staff: StaffRecord[];
  halls: ExamHallRecord[];
  exams: ExamRecord[];
  devices: DeviceRecord[];
  replacements: ReplacementRecord[];
  notifications: NotificationRecord[];
  esp32Logs: ESP32TelemetryPacket[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'invi-database.json');

// Initial Seed Data
const DEFAULT_COLLEGE: CollegeProfile = {
  name: "St. Xavier's Institute of Engineering & Technology",
  code: "SXIET-401",
  address: "Campus Road, South Zone, Academic Enclave, Metro-4001",
  phone: "+1 (555) 349-8800",
  email: "exams@invi-edu.org",
  departments: [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Mathematics & Sciences',
    'Information Technology',
    'Humanities'
  ],
  isSetupComplete: true,
};

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-coord',
    username: 'coordinator',
    email: 'coordinator@invi.edu',
    password: 'password123',
    role: 'coordinator',
    name: 'Dr. Sarah Jenkins',
    phone: '+1 (555) 349-8800',
    staffId: 'COORD-01',
    department: 'Examination Control Division',
    designation: 'Chief Exam Coordinator',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-inv-1',
    username: 'james.lewis',
    email: 'j.lewis@college.edu',
    password: 'password123',
    role: 'invigilator',
    name: 'Mr. James Lewis',
    phone: '+1 (555) 014-2201',
    staffId: 'ST-001',
    department: 'Mathematics',
    designation: 'Senior Lecturer',
    assignedBeaconId: 'B-1042',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-inv-2',
    username: 'sarah.khan',
    email: 's.khan@college.edu',
    password: 'password123',
    role: 'invigilator',
    name: 'Ms. Sarah Khan',
    phone: '+1 (555) 018-9942',
    staffId: 'ST-002',
    department: 'Physics',
    designation: 'Assistant Professor',
    assignedBeaconId: 'B-1088',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-viewer',
    username: 'viewer',
    email: 'viewer@college.edu',
    password: 'password123',
    role: 'viewer',
    name: 'Mr. David Clark',
    phone: '+1 (555) 021-4477',
    staffId: 'ST-010',
    department: 'Academic Affairs',
    designation: 'Staff Observer',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_STAFF: StaffRecord[] = [
  {
    id: 'st-1',
    name: 'Mr. James Lewis',
    initials: 'JL',
    staffId: 'ST-001',
    role: 'Hall Invigilator',
    department: 'Mathematics',
    designation: 'Senior Lecturer',
    email: 'j.lewis@college.edu',
    phone: '+1 (555) 014-2201',
    accountStatus: 'Active',
    beaconId: 'B-1042',
    beaconStatus: 'Detected',
    signalStrength: '-62 dBm (Good)',
    lastDetected: 'Just now',
    checkedInTime: '08:45',
    status: 'Checked In',
    assignedHall: 'A1-01',
    block: 'A1',
    floor: '01',
    assignedDeviceId: 'INV-0012',
  },
  {
    id: 'st-2',
    name: 'Ms. Sarah Khan',
    initials: 'SK',
    staffId: 'ST-002',
    role: 'Hall Invigilator',
    department: 'Physics',
    designation: 'Assistant Professor',
    email: 's.khan@college.edu',
    phone: '+1 (555) 018-9942',
    accountStatus: 'Active',
    beaconId: 'B-1088',
    beaconStatus: 'Detected',
    signalStrength: '-58 dBm (Good)',
    lastDetected: '1 min ago',
    checkedInTime: '08:40',
    status: 'Checked In',
    assignedHall: 'A1-02',
    block: 'A1',
    floor: '01',
    assignedDeviceId: 'INV-0018',
  },
  {
    id: 'st-3',
    name: 'Mr. Ravi Patel',
    initials: 'RP',
    staffId: 'ST-003',
    role: 'Hall Invigilator',
    department: 'Chemistry',
    designation: 'Associate Professor',
    email: 'r.patel@college.edu',
    phone: '+1 (555) 019-3382',
    accountStatus: 'Active',
    beaconId: 'B-1090',
    beaconStatus: 'Weak Signal',
    signalStrength: '-84 dBm (Weak)',
    lastDetected: '8 mins ago',
    checkedInTime: '09:15',
    status: 'Late',
    assignedHall: 'A1-03',
    block: 'A1',
    floor: '01',
    assignedDeviceId: 'INV-0021',
  },
  {
    id: 'st-4',
    name: 'Ms. Emily Green',
    initials: 'EG',
    staffId: 'ST-004',
    role: 'Hall Invigilator',
    department: 'Biology',
    designation: 'Assistant Professor',
    email: 'e.green@college.edu',
    phone: '+1 (555) 012-7711',
    accountStatus: 'Active',
    beaconId: 'B-2011',
    beaconStatus: 'Not Detected',
    signalStrength: 'None (Out of Range)',
    lastDetected: 'Never',
    checkedInTime: undefined,
    status: 'Absent',
    assignedHall: 'A1-04',
    block: 'A1',
    floor: '01',
    assignedDeviceId: 'INV-0024',
  },
  {
    id: 'st-5',
    name: 'Mr. Ahmed Ali',
    initials: 'AA',
    staffId: 'ST-005',
    role: 'Reliever',
    department: 'History',
    designation: 'Lecturer',
    email: 'a.ali@college.edu',
    phone: '+1 (555) 017-4402',
    accountStatus: 'Active',
    beaconId: 'B-2055',
    beaconStatus: 'Detected',
    signalStrength: '-52 dBm (Good)',
    lastDetected: 'Just now',
    checkedInTime: '08:50',
    status: 'Checked In',
    assignedHall: 'B2-02',
    block: 'B2',
    floor: '02',
    assignedDeviceId: 'INV-0027',
  },
  {
    id: 'st-6',
    name: 'Ms. Aisha Rahman',
    initials: 'AR',
    staffId: 'ST-006',
    role: 'Hall Invigilator',
    department: 'Computer Science',
    designation: 'Associate Professor',
    email: 'a.rahman@college.edu',
    phone: '+1 (555) 013-8829',
    accountStatus: 'Active',
    beaconId: 'B-2089',
    beaconStatus: 'Detected',
    signalStrength: '-60 dBm (Good)',
    lastDetected: 'Just now',
    checkedInTime: '08:35',
    status: 'Checked In',
    assignedHall: 'B2-03',
    block: 'B2',
    floor: '02',
    assignedDeviceId: 'INV-0030',
  },
  {
    id: 'st-7',
    name: 'Mr. Marcus Vance',
    initials: 'MV',
    staffId: 'ST-007',
    role: 'Flying Squad',
    department: 'Mathematics',
    designation: 'Senior Faculty',
    email: 'm.vance@college.edu',
    phone: '+1 (555) 016-5510',
    accountStatus: 'Active',
    beaconId: 'B-3012',
    beaconStatus: 'Detected',
    signalStrength: '-65 dBm (Good)',
    lastDetected: '3 mins ago',
    checkedInTime: '08:30',
    status: 'On Duty',
    assignedHall: 'Floating (Campus-Wide)',
    block: 'Main',
    floor: 'All',
    assignedDeviceId: 'INV-0035',
  },
];

const DEFAULT_HALLS: ExamHallRecord[] = [
  {
    id: 'h-1',
    hall: 'A1-01',
    block: 'A1',
    floor: '01',
    capacity: 40,
    currentExam: 'Mathematics',
    faculty: 'Mr. James Lewis',
    beaconId: 'B-1042',
    beaconStatus: 'Detected',
    deviceStatus: 'Online',
    overallStatus: 'Ready',
    checklists: {
      examSet: true,
      deviceOn: true,
      facultyPresent: true,
      beaconDetected: true,
      noAlerts: true,
    },
    notes: 'Standard exam setup. All desks numbered 1-40.',
  },
  {
    id: 'h-2',
    hall: 'A1-02',
    block: 'A1',
    floor: '01',
    capacity: 40,
    currentExam: 'Physics',
    faculty: 'Ms. Sarah Khan',
    beaconId: 'B-1088',
    beaconStatus: 'Detected',
    deviceStatus: 'Online',
    overallStatus: 'Ready',
    checklists: {
      examSet: true,
      deviceOn: true,
      facultyPresent: true,
      beaconDetected: true,
      noAlerts: true,
    },
    notes: 'Formula sheets pre-placed on desks.',
  },
  {
    id: 'h-3',
    hall: 'A1-03',
    block: 'A1',
    floor: '01',
    capacity: 45,
    currentExam: 'Chemistry',
    faculty: 'Mr. Ravi Patel',
    beaconId: 'B-1090',
    beaconStatus: 'Weak Signal',
    deviceStatus: 'Online',
    overallStatus: 'Problem',
    checklists: {
      examSet: true,
      deviceOn: true,
      facultyPresent: false,
      beaconDetected: false,
      noAlerts: false,
    },
    notes: 'Faculty beacon reporting weak signal outside entrance. Reliever alert sent.',
  },
  {
    id: 'h-4',
    hall: 'A1-04',
    block: 'A1',
    floor: '01',
    capacity: 35,
    currentExam: 'Biology',
    faculty: 'Ms. Emily Green',
    beaconId: 'B-2011',
    beaconStatus: 'Not Detected',
    deviceStatus: 'Offline',
    overallStatus: 'Problem',
    checklists: {
      examSet: true,
      deviceOn: false,
      facultyPresent: false,
      beaconDetected: false,
      noAlerts: false,
    },
    notes: 'BLE Hub offline and invigilator unlocated. Requires immediate intervention.',
  },
  {
    id: 'h-5',
    hall: 'B2-02',
    block: 'B2',
    floor: '02',
    capacity: 50,
    currentExam: 'History',
    faculty: 'Mr. Ahmed Ali',
    beaconId: 'B-2055',
    beaconStatus: 'Detected',
    deviceStatus: 'Online',
    overallStatus: 'Ready',
    checklists: {
      examSet: true,
      deviceOn: true,
      facultyPresent: true,
      beaconDetected: true,
      noAlerts: true,
    },
    notes: 'Room verified. Extra answer scripts stocked.',
  },
  {
    id: 'h-6',
    hall: 'B2-03',
    block: 'B2',
    floor: '02',
    capacity: 50,
    currentExam: 'English',
    faculty: 'Ms. Aisha Rahman',
    beaconId: 'B-2089',
    beaconStatus: 'Detected',
    deviceStatus: 'Online',
    overallStatus: 'Ready',
    checklists: {
      examSet: true,
      deviceOn: true,
      facultyPresent: true,
      beaconDetected: true,
      noAlerts: true,
    },
    notes: 'Ready for 10-minute pre-reading interval.',
  },
];

const DEFAULT_EXAMS: ExamRecord[] = [
  {
    id: 'ex-1',
    exam: 'Mathematics',
    subjectCode: 'MATH-301',
    date: 'Tue, 27 May 2025',
    time: '09:00 – 11:00',
    startTime: '09:00',
    endTime: '11:00',
    duration: '2 Hours',
    session: 'Morning (09:00 - 11:00)',
    hall: 'A1-01',
    block: 'A1',
    floor: '1',
    staff: 'Mr. James Lewis',
    staffId: 'st-1',
    teacher: 'Mr. James Lewis',
    backupTeacher: 'Ms. Sarah Carter',
    requiredInvigilators: 1,
    status: 'Ready',
    notes: 'Standard exam setup.\nNo special requirements.',
    paperDistributionMinutesBefore: 15,
  },
  {
    id: 'ex-2',
    exam: 'Physics',
    subjectCode: 'PHY-202',
    date: 'Tue, 27 May 2025',
    time: '09:00 – 11:00',
    startTime: '09:00',
    endTime: '11:00',
    duration: '2 Hours',
    session: 'Morning (09:00 - 11:00)',
    hall: 'A1-02',
    block: 'A1',
    floor: '1',
    staff: 'Ms. Sarah Khan',
    staffId: 'st-2',
    teacher: 'Ms. Sarah Khan',
    backupTeacher: 'Mr. David Clark',
    requiredInvigilators: 1,
    status: 'Ready',
    notes: 'Formula sheets provided at entrance.\nScientific calculators permitted.',
    paperDistributionMinutesBefore: 15,
  },
  {
    id: 'ex-3',
    exam: 'Chemistry',
    subjectCode: 'CHEM-205',
    date: 'Tue, 27 May 2025',
    time: '13:00 – 15:00',
    startTime: '13:00',
    endTime: '15:00',
    duration: '2 Hours',
    session: 'Afternoon (13:00 - 15:00)',
    hall: 'A1-03',
    block: 'A1',
    floor: '1',
    staff: 'Mr. Ravi Patel',
    staffId: 'st-3',
    teacher: 'Mr. Ravi Patel',
    backupTeacher: 'Ms. Clara Wilson',
    requiredInvigilators: 1,
    status: 'Late',
    notes: 'Staff delayed in transit.\nReliever notified and on standby.',
    paperDistributionMinutesBefore: 15,
  },
  {
    id: 'ex-4',
    exam: 'Biology',
    subjectCode: 'BIO-101',
    date: 'Tue, 27 May 2025',
    time: '13:00 – 15:00',
    startTime: '13:00',
    endTime: '15:00',
    duration: '2 Hours',
    session: 'Afternoon (13:00 - 15:00)',
    hall: 'A1-04',
    block: 'A1',
    floor: '1',
    staff: 'Ms. Emily Green',
    staffId: 'st-4',
    teacher: 'Ms. Emily Green',
    backupTeacher: 'Mr. Thomas Evans',
    requiredInvigilators: 1,
    status: 'Changed',
    notes: 'Specimen diagram sheets distributed.\nDesks sanitized and numbered.',
    paperDistributionMinutesBefore: 15,
  },
  {
    id: 'ex-5',
    exam: 'History',
    subjectCode: 'HIST-104',
    date: 'Tue, 27 May 2025',
    time: '16:00 – 18:00',
    startTime: '16:00',
    endTime: '18:00',
    duration: '2 Hours',
    session: 'Evening (16:00 - 18:00)',
    hall: 'B2-02',
    block: 'B2',
    floor: '2',
    staff: 'Mr. Ahmed Ali',
    staffId: 'st-5',
    teacher: 'Mr. Ahmed Ali',
    backupTeacher: 'Ms. Taylor Brooks',
    requiredInvigilators: 1,
    status: 'Ready',
    notes: 'Room verified. Clean desk protocol enforced.',
    paperDistributionMinutesBefore: 15,
  },
  {
    id: 'ex-6',
    exam: 'English',
    subjectCode: 'ENG-201',
    date: 'Tue, 27 May 2025',
    time: '16:00 – 18:00',
    startTime: '16:00',
    endTime: '18:00',
    duration: '2 Hours',
    session: 'Evening (16:00 - 18:00)',
    hall: 'B2-03',
    block: 'B2',
    floor: '2',
    staff: 'Ms. Aisha Rahman',
    staffId: 'st-6',
    teacher: 'Ms. Aisha Rahman',
    backupTeacher: 'Mr. David Clark',
    requiredInvigilators: 1,
    status: 'Ready',
    notes: 'Answer booklets pre-allocated.\n10 min reading time before writing.',
    paperDistributionMinutesBefore: 15,
  },
];

const DEFAULT_DEVICES: DeviceRecord[] = [
  {
    id: 'dev-1',
    deviceId: 'INV-0012',
    hall: 'A1-01',
    block: 'A1',
    floor: '1',
    beaconId: 'B-1042',
    beaconStatus: 'Detected',
    signalStrength: '-62 dBm (Good)',
    batteryLevel: 94,
    lastPing: '12s ago',
    status: 'Online',
    ipAddress: '192.168.1.101',
    firmwareVersion: 'v2.4.1',
    assignedFaculty: 'Mr. James Lewis',
  },
  {
    id: 'dev-2',
    deviceId: 'INV-0018',
    hall: 'A1-02',
    block: 'A1',
    floor: '1',
    beaconId: 'B-1088',
    beaconStatus: 'Detected',
    signalStrength: '-58 dBm (Good)',
    batteryLevel: 87,
    lastPing: '45s ago',
    status: 'Online',
    ipAddress: '192.168.1.102',
    firmwareVersion: 'v2.4.1',
    assignedFaculty: 'Ms. Sarah Khan',
  },
  {
    id: 'dev-3',
    deviceId: 'INV-0021',
    hall: 'A1-03',
    block: 'A1',
    floor: '1',
    beaconId: 'B-1090',
    beaconStatus: 'Weak Signal',
    signalStrength: '-84 dBm (Weak)',
    batteryLevel: 62,
    lastPing: '2m ago',
    status: 'Warning',
    ipAddress: '192.168.1.103',
    firmwareVersion: 'v2.4.0',
    assignedFaculty: 'Mr. Ravi Patel',
  },
  {
    id: 'dev-4',
    deviceId: 'INV-0024',
    hall: 'A1-04',
    block: 'A1',
    floor: '1',
    beaconId: 'B-2011',
    beaconStatus: 'Not Detected',
    signalStrength: 'None (Offline)',
    batteryLevel: 12,
    lastPing: '18m ago',
    status: 'Offline',
    ipAddress: '192.168.1.104',
    firmwareVersion: 'v2.3.9',
    assignedFaculty: 'Ms. Emily Green',
  },
  {
    id: 'dev-5',
    deviceId: 'INV-0027',
    hall: 'B2-02',
    block: 'B2',
    floor: '2',
    beaconId: 'B-2055',
    beaconStatus: 'Detected',
    signalStrength: '-52 dBm (Good)',
    batteryLevel: 98,
    lastPing: '5s ago',
    status: 'Online',
    ipAddress: '192.168.1.105',
    firmwareVersion: 'v2.4.1',
    assignedFaculty: 'Mr. Ahmed Ali',
  },
  {
    id: 'dev-6',
    deviceId: 'INV-0030',
    hall: 'B2-03',
    block: 'B2',
    floor: '2',
    beaconId: 'B-2089',
    beaconStatus: 'Detected',
    signalStrength: '-60 dBm (Good)',
    batteryLevel: 91,
    lastPing: '20s ago',
    status: 'Online',
    ipAddress: '192.168.1.106',
    firmwareVersion: 'v2.4.1',
    assignedFaculty: 'Ms. Aisha Rahman',
  },
];

const DEFAULT_REPLACEMENTS: ReplacementRecord[] = [
  {
    id: 'rep-1',
    examId: 'ex-4',
    examSubject: 'Biology (BIO-101)',
    hall: 'A1-04',
    originalStaffId: 'st-4',
    originalStaffName: 'Ms. Emily Green',
    replacementStaffId: 'st-7',
    replacementStaffName: 'Mr. Marcus Vance',
    reason: 'Original staff absent without notice. Reliever reassigned from Flying Squad.',
    coordinatorName: 'Dr. Sarah Jenkins',
    timestamp: '2025-05-27T08:42:00Z',
  },
];

const DEFAULT_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'notif-1',
    targetUserId: 'all',
    targetRole: 'all',
    type: 'system',
    title: 'Semester Examination Session Active',
    message: 'Welcome to the INVI Smart Invigilation Platform. Real-time ESP32 telemetry is active across Blocks A1 and B2.',
    timestamp: 'Just now',
    read: false,
  },
  {
    id: 'notif-2',
    targetUserId: 'usr-inv-1',
    targetRole: 'invigilator',
    type: 'assignment',
    title: 'Exam Assignment: Mathematics (MATH-301)',
    message: 'You are assigned to Hall A1-01 on Tue, 27 May 2025 from 09:00 to 11:00. Paper distribution starts at 08:45 AM.',
    timestamp: '15m ago',
    read: false,
    metadata: { examId: 'ex-1', hall: 'A1-01' },
  },
  {
    id: 'notif-3',
    targetUserId: 'usr-coord',
    targetRole: 'coordinator',
    type: 'absence_alert',
    title: 'Urgent: Faculty Beacon Not Detected (Hall A1-04)',
    message: 'Beacon B-2011 for Ms. Emily Green has not been detected near Hall A1-04 within 20 mins of exam start.',
    timestamp: '8m ago',
    read: false,
  },
];

const DEFAULT_ESP32_LOGS: ESP32TelemetryPacket[] = [
  {
    id: 'esp-log-1',
    timestamp: new Date(Date.now() - 1000 * 30).toLocaleTimeString(),
    deviceId: 'INV-0012',
    beaconId: 'B-1042',
    rssi: -62,
    signalQuality: 'Strong',
    action: 'BEACON_PRESENT',
    matchedHall: 'A1-01',
    matchedStaff: 'Mr. James Lewis',
  },
  {
    id: 'esp-log-2',
    timestamp: new Date(Date.now() - 1000 * 60).toLocaleTimeString(),
    deviceId: 'INV-0018',
    beaconId: 'B-1088',
    rssi: -58,
    signalQuality: 'Strong',
    action: 'BEACON_PRESENT',
    matchedHall: 'A1-02',
    matchedStaff: 'Ms. Sarah Khan',
  },
  {
    id: 'esp-log-3',
    timestamp: new Date(Date.now() - 1000 * 120).toLocaleTimeString(),
    deviceId: 'INV-0021',
    beaconId: 'B-1090',
    rssi: -84,
    signalQuality: 'Weak',
    action: 'WEAK_SIGNAL_WARNING',
    matchedHall: 'A1-03',
    matchedStaff: 'Mr. Ravi Patel',
  },
];

class DatabaseManager {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all collections exist
        return {
          college: parsed.college || DEFAULT_COLLEGE,
          users: parsed.users || DEFAULT_USERS,
          staff: parsed.staff || DEFAULT_STAFF,
          halls: parsed.halls || DEFAULT_HALLS,
          exams: parsed.exams || DEFAULT_EXAMS,
          devices: parsed.devices || DEFAULT_DEVICES,
          replacements: parsed.replacements || DEFAULT_REPLACEMENTS,
          notifications: parsed.notifications || DEFAULT_NOTIFICATIONS,
          esp32Logs: parsed.esp32Logs || DEFAULT_ESP32_LOGS,
        };
      }
    } catch (err) {
      console.error('[DB] Failed to read database file, initializing defaults:', err);
    }

    const initial: DatabaseSchema = {
      college: DEFAULT_COLLEGE,
      users: DEFAULT_USERS,
      staff: DEFAULT_STAFF,
      halls: DEFAULT_HALLS,
      exams: DEFAULT_EXAMS,
      devices: DEFAULT_DEVICES,
      replacements: DEFAULT_REPLACEMENTS,
      notifications: DEFAULT_NOTIFICATIONS,
      esp32Logs: DEFAULT_ESP32_LOGS,
    };
    this.save(initial);
    return initial;
  }

  public save(data?: DatabaseSchema) {
    if (data) {
      this.db = data;
    }
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Failed to save database file:', err);
    }
  }

  public getSnapshot(): DatabaseSchema {
    return this.db;
  }

  // College Operations
  public getCollege(): CollegeProfile {
    return this.db.college;
  }

  public updateCollege(college: Partial<CollegeProfile>): CollegeProfile {
    this.db.college = { ...this.db.college, ...college };
    this.save();
    return this.db.college;
  }

  // Users Operations
  public getUsers(): UserAccount[] {
    return this.db.users;
  }

  public findUserByUsername(username: string): UserAccount | undefined {
    return this.db.users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === username.toLowerCase()
    );
  }

  public findUserById(id: string): UserAccount | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  public addUser(user: UserAccount): UserAccount {
    this.db.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<UserAccount>): UserAccount | undefined {
    const idx = this.db.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.db.users[idx] = { ...this.db.users[idx], ...updates };
      this.save();
      return this.db.users[idx];
    }
    return undefined;
  }

  // Staff Operations
  public getStaff(): StaffRecord[] {
    return this.db.staff;
  }

  public getStaffById(id: string): StaffRecord | undefined {
    return this.db.staff.find((s) => s.id === id);
  }

  public addStaff(record: StaffRecord): StaffRecord {
    this.db.staff.push(record);
    this.save();
    return record;
  }

  public updateStaff(id: string, updates: Partial<StaffRecord>): StaffRecord | undefined {
    const idx = this.db.staff.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.db.staff[idx] = { ...this.db.staff[idx], ...updates };
      this.save();
      return this.db.staff[idx];
    }
    return undefined;
  }

  public deleteStaff(id: string): boolean {
    const prevLen = this.db.staff.length;
    this.db.staff = this.db.staff.filter((s) => s.id !== id);
    if (this.db.staff.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Halls Operations
  public getHalls(): ExamHallRecord[] {
    return this.db.halls;
  }

  public getHallById(id: string): ExamHallRecord | undefined {
    return this.db.halls.find((h) => h.id === id || h.hall === id);
  }

  public addHall(record: ExamHallRecord): ExamHallRecord {
    this.db.halls.push(record);
    this.save();
    return record;
  }

  public updateHall(id: string, updates: Partial<ExamHallRecord>): ExamHallRecord | undefined {
    const idx = this.db.halls.findIndex((h) => h.id === id || h.hall === id);
    if (idx !== -1) {
      this.db.halls[idx] = { ...this.db.halls[idx], ...updates };
      
      // Auto-compute overall status if checklists changed
      if (updates.checklists) {
        const c = this.db.halls[idx].checklists;
        const allOk = c.examSet && c.deviceOn && c.facultyPresent && c.beaconDetected && c.noAlerts;
        this.db.halls[idx].overallStatus = allOk ? 'Ready' : 'Problem';
      }
      
      this.save();
      return this.db.halls[idx];
    }
    return undefined;
  }

  public deleteHall(id: string): boolean {
    const prevLen = this.db.halls.length;
    this.db.halls = this.db.halls.filter((h) => h.id !== id && h.hall !== id);
    if (this.db.halls.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Exams Operations
  public getExams(): ExamRecord[] {
    return this.db.exams;
  }

  public getExamById(id: string): ExamRecord | undefined {
    return this.db.exams.find((e) => e.id === id);
  }

  public addExam(record: ExamRecord): ExamRecord {
    this.db.exams.push(record);
    this.save();
    return record;
  }

  public updateExam(id: string, updates: Partial<ExamRecord>): ExamRecord | undefined {
    const idx = this.db.exams.findIndex((e) => e.id === id);
    if (idx !== -1) {
      this.db.exams[idx] = { ...this.db.exams[idx], ...updates };
      this.save();
      return this.db.exams[idx];
    }
    return undefined;
  }

  public deleteExam(id: string): boolean {
    const prevLen = this.db.exams.length;
    this.db.exams = this.db.exams.filter((e) => e.id !== id);
    if (this.db.exams.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Devices Operations
  public getDevices(): DeviceRecord[] {
    return this.db.devices;
  }

  public getDeviceById(id: string): DeviceRecord | undefined {
    return this.db.devices.find((d) => d.id === id || d.deviceId === id);
  }

  public addDevice(record: DeviceRecord): DeviceRecord {
    this.db.devices.push(record);
    this.save();
    return record;
  }

  public updateDevice(id: string, updates: Partial<DeviceRecord>): DeviceRecord | undefined {
    const idx = this.db.devices.findIndex((d) => d.id === id || d.deviceId === id);
    if (idx !== -1) {
      this.db.devices[idx] = { ...this.db.devices[idx], ...updates };
      this.save();
      return this.db.devices[idx];
    }
    return undefined;
  }

  // Replacements Operations
  public getReplacements(): ReplacementRecord[] {
    return this.db.replacements;
  }

  public addReplacement(record: ReplacementRecord): ReplacementRecord {
    this.db.replacements.unshift(record);
    this.save();
    return record;
  }

  // Notifications Operations
  public getNotifications(userId?: string, role?: string): NotificationRecord[] {
    return this.db.notifications.filter((n) => {
      if (n.targetUserId === 'all' || (userId && n.targetUserId === userId)) return true;
      if (n.targetRole === 'all' || (role && n.targetRole === role)) return true;
      return false;
    });
  }

  public addNotification(record: NotificationRecord): NotificationRecord {
    this.db.notifications.unshift(record);
    // Keep max 100 notifications
    if (this.db.notifications.length > 100) {
      this.db.notifications = this.db.notifications.slice(0, 100);
    }
    this.save();
    return record;
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId?: string, role?: string): number {
    let count = 0;
    this.db.notifications.forEach((n) => {
      if (
        n.targetUserId === 'all' ||
        (userId && n.targetUserId === userId) ||
        n.targetRole === 'all' ||
        (role && n.targetRole === role)
      ) {
        if (!n.read) {
          n.read = true;
          count++;
        }
      }
    });
    if (count > 0) this.save();
    return count;
  }

  // ESP32 Logs & Ingestion
  public getESP32Logs(): ESP32TelemetryPacket[] {
    return this.db.esp32Logs;
  }

  public processESP32Telemetry(payload: {
    deviceId: string;
    beaconId: string;
    rssi: number;
    timestamp?: string;
  }): {
    success: boolean;
    packet: ESP32TelemetryPacket;
    matchedStaff?: StaffRecord;
    matchedHall?: ExamHallRecord;
  } {
    const { deviceId, beaconId, rssi } = payload;
    const nowTime = new Date().toLocaleTimeString();

    // Signal analysis
    let signalQuality = 'Weak';
    let beaconStatus: 'Detected' | 'Weak Signal' | 'Not Detected' = 'Not Detected';
    let signalStrengthStr = `${rssi} dBm`;

    if (rssi >= -75) {
      signalQuality = 'Strong';
      beaconStatus = 'Detected';
      signalStrengthStr = `${rssi} dBm (Good)`;
    } else if (rssi >= -88) {
      signalQuality = 'Moderate';
      beaconStatus = 'Weak Signal';
      signalStrengthStr = `${rssi} dBm (Weak)`;
    } else {
      signalQuality = 'Lost';
      beaconStatus = 'Not Detected';
      signalStrengthStr = `${rssi} dBm (Out of Range)`;
    }

    // Find and update matching device
    const device = this.db.devices.find((d) => d.deviceId.toLowerCase() === deviceId.toLowerCase());
    if (device) {
      device.lastPing = 'Just now';
      device.status = 'Online';
      device.beaconId = beaconId;
      device.beaconStatus = beaconStatus;
      device.signalStrength = signalStrengthStr;
    }

    // Find matching staff assigned to this beacon
    const matchedStaff = this.db.staff.find((s) => s.beaconId.toLowerCase() === beaconId.toLowerCase());
    let matchedHallName = device?.hall || matchedStaff?.assignedHall;

    if (matchedStaff) {
      matchedStaff.beaconStatus = beaconStatus;
      matchedStaff.signalStrength = signalStrengthStr;
      matchedStaff.lastDetected = 'Just now';

      if (beaconStatus === 'Detected') {
        matchedStaff.status = 'On Duty';
        if (!matchedStaff.checkedInTime) {
          const hours = String(new Date().getHours()).padStart(2, '0');
          const minutes = String(new Date().getMinutes()).padStart(2, '0');
          matchedStaff.checkedInTime = `${hours}:${minutes}`;
        }
      } else if (beaconStatus === 'Weak Signal') {
        // keep current status or mark Late if past time
      } else if (beaconStatus === 'Not Detected') {
        // missing
      }
    }

    // Find matching hall
    let matchedHall = this.db.halls.find(
      (h) => (matchedHallName && h.hall === matchedHallName) || h.beaconId.toLowerCase() === beaconId.toLowerCase()
    );

    if (matchedHall) {
      matchedHall.beaconStatus = beaconStatus;
      matchedHall.checklists.beaconDetected = beaconStatus === 'Detected';
      if (matchedStaff) {
        matchedHall.checklists.facultyPresent =
          matchedStaff.status === 'On Duty' || matchedStaff.status === 'Checked In';
      }
      const allReady =
        matchedHall.checklists.examSet &&
        matchedHall.checklists.deviceOn &&
        matchedHall.checklists.facultyPresent &&
        matchedHall.checklists.beaconDetected &&
        matchedHall.checklists.noAlerts;
      matchedHall.overallStatus = allReady ? 'Ready' : 'Problem';
    }

    const packet: ESP32TelemetryPacket = {
      id: `esp-pkt-${Date.now()}`,
      timestamp: nowTime,
      deviceId,
      beaconId,
      rssi,
      signalQuality,
      action: beaconStatus === 'Detected' ? 'BEACON_PRESENT' : beaconStatus === 'Weak Signal' ? 'WEAK_SIGNAL_WARNING' : 'BEACON_LOST',
      matchedHall: matchedHall?.hall,
      matchedStaff: matchedStaff?.name,
    };

    this.db.esp32Logs.unshift(packet);
    if (this.db.esp32Logs.length > 50) {
      this.db.esp32Logs = this.db.esp32Logs.slice(0, 50);
    }

    // If absent or weak during active exam, dispatch coordinator notification
    if (beaconStatus !== 'Detected' && matchedStaff) {
      this.addNotification({
        id: `notif-${Date.now()}`,
        targetUserId: 'usr-coord',
        targetRole: 'coordinator',
        type: 'absence_alert',
        title: `ESP32 Alert: ${matchedStaff.name} Beacon Status ${beaconStatus}`,
        message: `Hardware HUB ${deviceId} in ${matchedHall?.hall || 'hall'} reports beacon ${beaconId} signal at ${rssi} dBm.`,
        timestamp: 'Just now',
        read: false,
      });
    }

    this.save();

    return {
      success: true,
      packet,
      matchedStaff,
      matchedHall,
    };
  }
}

export const dbManager = new DatabaseManager();
