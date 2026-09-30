import { 
  UserAccount, 
  CollegeInfo, 
  StaffMember, 
  ExamHall, 
  Exam, 
  Device, 
  ReplacementRecord, 
  NotificationItem, 
  ESP32TelemetryPacket 
} from '../types';

const TOKEN_KEY = 'invi_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  getAuthStatus: () => request<{ isInitialized: boolean; hasCoordinator: boolean; collegeName: string }>('/api/auth/status'),
  registerCoordinator: (body: any) =>
    request<{ success: boolean; user: UserAccount; token: string }>('/api/auth/register-coordinator', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (credentials: { username: string; password: string }) =>
    request<{ success: boolean; token: string; user: UserAccount; staffProfile?: StaffMember }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<{ user: UserAccount; staffProfile?: StaffMember }>('/api/auth/me'),
  getUsers: () => request<UserAccount[]>('/api/auth/users'),
  transferCoordinator: (body: { targetUserId: string; newRoleForPreviousCoordinator?: string }) =>
    request<{ success: boolean; message: string; newCoordinator: UserAccount }>('/api/auth/transfer-coordinator', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // College Profile
  getCollege: () => request<CollegeInfo>('/api/college'),
  updateCollege: (body: Partial<CollegeInfo>) =>
    request<{ success: boolean; college: CollegeInfo }>('/api/college', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // Staff / Invigilators
  getStaff: () => request<StaffMember[]>('/api/staff'),
  addStaff: (body: Partial<StaffMember>) =>
    request<{ success: boolean; staff: StaffMember }>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateStaff: (id: string, body: Partial<StaffMember>) =>
    request<{ success: boolean; staff: StaffMember }>(`/api/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteStaff: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/staff/${id}`, {
      method: 'DELETE',
    }),
  overrideStaffStatus: (id: string, body: { status?: string; beaconStatus?: string; note?: string }) =>
    request<{ success: boolean; staff: StaffMember }>(`/api/staff/${id}/override-status`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Halls
  getHalls: () => request<ExamHall[]>('/api/halls'),
  addHall: (body: Partial<ExamHall>) =>
    request<{ success: boolean; hall: ExamHall }>('/api/halls', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateHall: (id: string, body: Partial<ExamHall>) =>
    request<{ success: boolean; hall: ExamHall }>(`/api/halls/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteHall: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/halls/${id}`, {
      method: 'DELETE',
    }),
  toggleHallChecklist: (id: string, checklistKey: string, value?: boolean) =>
    request<{ success: boolean; hall: ExamHall }>(`/api/halls/${id}/checklist`, {
      method: 'POST',
      body: JSON.stringify({ checklistKey, value }),
    }),

  // Exams & Timetable
  getExams: () => request<Exam[]>('/api/exams'),
  addExam: (body: Partial<Exam>) =>
    request<{ success: boolean; exam: Exam }>('/api/exams', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateExam: (id: string, body: Partial<Exam>) =>
    request<{ success: boolean; exam: Exam }>(`/api/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteExam: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/exams/${id}`, {
      method: 'DELETE',
    }),
  importTimetable: (exams: any[]) =>
    request<{ success: boolean; count: number; exams: Exam[] }>('/api/exams/import', {
      method: 'POST',
      body: JSON.stringify({ exams }),
    }),
  assignInvigilator: (examId: string, body: { staffId: string; hall?: string; beaconId?: string; deviceId?: string }) =>
    request<{ success: boolean; message: string; exam: Exam; staff: StaffMember }>(`/api/exams/${examId}/assign`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  replaceInvigilator: (examId: string, body: { originalStaffId?: string; replacementStaffId: string; reason: string }) =>
    request<{ success: boolean; message: string; exam: Exam; replacementLog: ReplacementRecord }>(
      `/api/exams/${examId}/replace`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    ),
  getReplacements: () => request<ReplacementRecord[]>('/api/replacements'),

  // Devices
  getDevices: () => request<Device[]>('/api/devices'),
  addDevice: (body: Partial<Device>) =>
    request<{ success: boolean; device: Device }>('/api/devices', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  pingDevice: (id: string) =>
    request<{ success: boolean; message: string; device: Device }>(`/api/devices/${id}/ping`, {
      method: 'POST',
    }),
  rebootDevice: (id: string) =>
    request<{ success: boolean; message: string; device: Device }>(`/api/devices/${id}/reboot`, {
      method: 'POST',
    }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean; count: number }>('/api/notifications/mark-all-read', {
      method: 'POST',
    }),

  // ESP32 Telemetry & Simulator
  sendESP32Telemetry: (payload: { deviceId: string; beaconId: string; rssi: number; timestamp?: string }) =>
    request<{ status: string; message: string; telemetry: any }>('/api/esp32/telemetry', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getESP32Logs: () => request<ESP32TelemetryPacket[]>('/api/esp32/logs'),
};
