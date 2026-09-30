import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  NavigationPage, 
  Exam, 
  StaffMember, 
  ExamHall, 
  Device, 
  ProblemIncident, 
  ReplacementRecord, 
  NotificationItem, 
  ESP32TelemetryPacket,
  StaffStatus,
  HallStatus 
} from '../types';
import { api } from '../api/client';
import { 
  INITIAL_EXAMS, 
  INITIAL_HALLS, 
  INITIAL_STAFF, 
  INITIAL_DEVICES, 
  INITIAL_PROBLEMS 
} from '../mockData';

interface ExamContextType {
  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;
  exams: Exam[];
  halls: ExamHall[];
  staff: StaffMember[];
  devices: Device[];
  replacements: ReplacementRecord[];
  notifications: NotificationItem[];
  esp32Logs: ESP32TelemetryPacket[];
  problems: ProblemIncident[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Modals & Target Objects
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isAddExamModalOpen: boolean;
  setIsAddExamModalOpen: (open: boolean) => void;
  isAssignStaffModalOpen: boolean;
  setIsAssignStaffModalOpen: (open: boolean) => void;
  isSetInvigilatorModalOpen: boolean;
  setIsSetInvigilatorModalOpen: (open: boolean) => void;
  isReplaceInvigilatorModalOpen: boolean;
  setIsReplaceInvigilatorModalOpen: (open: boolean) => void;
  isImportTimetableModalOpen: boolean;
  setIsImportTimetableModalOpen: (open: boolean) => void;
  isESP32ConsoleModalOpen: boolean;
  setIsESP32ConsoleModalOpen: (open: boolean) => void;
  isCollegeSettingsModalOpen: boolean;
  setIsCollegeSettingsModalOpen: (open: boolean) => void;
  isStaffModalOpen: boolean;
  setIsStaffModalOpen: (open: boolean) => void;
  isHallModalOpen: boolean;
  setIsHallModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  exportInitialTab: 'exams' | 'staff' | 'halls' | 'replacements' | 'all';
  openExportModal: (tab?: 'exams' | 'staff' | 'halls' | 'replacements' | 'all') => void;

  selectedExamForAction: Exam | null;
  setSelectedExamForAction: (exam: Exam | null) => void;
  selectedStaffForAction: StaffMember | null;
  setSelectedStaffForAction: (staff: StaffMember | null) => void;
  selectedHallForAction: ExamHall | null;
  setSelectedHallForAction: (hall: ExamHall | null) => void;

  // Actions
  addExam: (examData: Partial<Exam>) => Promise<boolean>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<boolean>;
  deleteExam: (id: string) => Promise<boolean>;
  importTimetable: (exams: any[]) => Promise<number>;
  setInvigilator: (examId: string, params: { staffId: string; hall?: string; beaconId?: string; deviceId?: string }) => Promise<{ success: boolean; message: string }>;
  replaceInvigilator: (examId: string, params: { originalStaffId?: string; replacementStaffId: string; reason: string }) => Promise<{ success: boolean; message: string }>;
  
  toggleHallChecklist: (hallId: string, key: keyof ExamHall['checklists']) => Promise<void>;
  addHall: (hallData: Partial<ExamHall>) => Promise<boolean>;
  updateHall: (id: string, updates: Partial<ExamHall>) => Promise<boolean>;
  deleteHall: (id: string) => Promise<boolean>;

  addStaff: (staffData: Partial<StaffMember>) => Promise<boolean>;
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<boolean>;
  deleteStaff: (id: string) => Promise<boolean>;
  overrideStaffStatus: (staffId: string, status?: StaffStatus, beaconStatus?: string, note?: string) => Promise<boolean>;

  pingDevice: (id: string) => Promise<void>;
  rebootDevice: (id: string) => Promise<void>;
  addDevice: (data: Partial<Device>) => Promise<boolean>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  sendESP32Telemetry: (payload: { deviceId: string; beaconId: string; rssi: number }) => Promise<any>;

  // Computed summary metrics
  metrics: {
    todaysExamsCount: number;
    inProgressExamsCount: number;
    hallsReadyCount: number;
    totalHallsCount: number;
    staffPresentCount: number;
    totalStaffCount: number;
    openProblemsCount: number;
    totalStudentsToday: number;
    onlineDevicesCount: number;
    totalDevicesCount: number;
    unreadNotificationsCount: number;
  };
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<NavigationPage>('dashboard');
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS as any);
  const [halls, setHalls] = useState<ExamHall[]>(INITIAL_HALLS as any);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF as any);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES as any);
  const [replacements, setReplacements] = useState<ReplacementRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [esp32Logs, setEsp32Logs] = useState<ESP32TelemetryPacket[]>([]);
  const [problems] = useState<ProblemIncident[]>(INITIAL_PROBLEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [isSetInvigilatorModalOpen, setIsSetInvigilatorModalOpen] = useState(false);
  const [isReplaceInvigilatorModalOpen, setIsReplaceInvigilatorModalOpen] = useState(false);
  const [isImportTimetableModalOpen, setIsImportTimetableModalOpen] = useState(false);
  const [isESP32ConsoleModalOpen, setIsESP32ConsoleModalOpen] = useState(false);
  const [isCollegeSettingsModalOpen, setIsCollegeSettingsModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportInitialTab, setExportInitialTab] = useState<'exams' | 'staff' | 'halls' | 'replacements' | 'all'>('exams');

  const openExportModal = useCallback((tab?: 'exams' | 'staff' | 'halls' | 'replacements' | 'all') => {
    if (tab) setExportInitialTab(tab);
    setIsExportModalOpen(true);
  }, []);

  // Selected targets
  const [selectedExamForAction, setSelectedExamForAction] = useState<Exam | null>(null);
  const [selectedStaffForAction, setSelectedStaffForAction] = useState<StaffMember | null>(null);
  const [selectedHallForAction, setSelectedHallForAction] = useState<ExamHall | null>(null);

  // Data Fetching from persistent Backend
  const refreshData = useCallback(async () => {
    try {
      const [exList, stList, hlList, dvList, notifList, repList, espList] = await Promise.all([
        api.getExams().catch(() => null),
        api.getStaff().catch(() => null),
        api.getHalls().catch(() => null),
        api.getDevices().catch(() => null),
        api.getNotifications().catch(() => null),
        api.getReplacements().catch(() => null),
        api.getESP32Logs().catch(() => null),
      ]);

      if (exList) setExams(exList);
      if (stList) setStaff(stList);
      if (hlList) setHalls(hlList);
      if (dvList) setDevices(dvList);
      if (notifList) setNotifications(notifList);
      if (repList) setReplacements(repList);
      if (espList) setEsp32Logs(espList);
    } catch (err) {
      console.warn('[ExamContext] sync error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic Telemetry Synchronization (every 4 seconds for live ESP32 updates)
  useEffect(() => {
    const timer = setInterval(() => {
      refreshData();
    }, 4000);
    return () => clearInterval(timer);
  }, [refreshData]);

  // Exam Actions
  const addExam = async (examData: Partial<Exam>): Promise<boolean> => {
    try {
      const res = await api.addExam(examData);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to add exam');
      return false;
    }
  };

  const updateExam = async (id: string, updates: Partial<Exam>): Promise<boolean> => {
    try {
      const res = await api.updateExam(id, updates);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to update exam');
      return false;
    }
  };

  const deleteExam = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteExam(id);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to delete exam');
      return false;
    }
  };

  const importTimetable = async (importedExams: any[]): Promise<number> => {
    try {
      const res = await api.importTimetable(importedExams);
      if (res.success) {
        await refreshData();
        return res.count;
      }
      return 0;
    } catch (err: any) {
      alert(err.message || 'Failed to import timetable');
      return 0;
    }
  };

  // Set Invigilator
  const setInvigilator = async (
    examId: string,
    params: { staffId: string; hall?: string; beaconId?: string; deviceId?: string }
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.assignInvigilator(examId, params);
      await refreshData();
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to set invigilator' };
    }
  };

  // Replace Invigilator
  const replaceInvigilator = async (
    examId: string,
    params: { originalStaffId?: string; replacementStaffId: string; reason: string }
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.replaceInvigilator(examId, params);
      await refreshData();
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to replace invigilator' };
    }
  };

  // Hall Actions
  const toggleHallChecklist = async (hallId: string, key: keyof ExamHall['checklists']) => {
    try {
      await api.toggleHallChecklist(hallId, key);
      await refreshData();
    } catch (err) {
      console.error('toggleHallChecklist error:', err);
    }
  };

  const addHall = async (hallData: Partial<ExamHall>): Promise<boolean> => {
    try {
      const res = await api.addHall(hallData);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to add hall');
      return false;
    }
  };

  const updateHall = async (id: string, updates: Partial<ExamHall>): Promise<boolean> => {
    try {
      const res = await api.updateHall(id, updates);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to update hall');
      return false;
    }
  };

  const deleteHall = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteHall(id);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to delete hall');
      return false;
    }
  };

  // Staff Actions
  const addStaff = async (staffData: Partial<StaffMember>): Promise<boolean> => {
    try {
      const res = await api.addStaff(staffData);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to add staff');
      return false;
    }
  };

  const updateStaff = async (id: string, updates: Partial<StaffMember>): Promise<boolean> => {
    try {
      const res = await api.updateStaff(id, updates);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to update staff');
      return false;
    }
  };

  const deleteStaff = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteStaff(id);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to delete staff');
      return false;
    }
  };

  const overrideStaffStatus = async (
    staffId: string,
    status?: StaffStatus,
    beaconStatus?: string,
    note?: string
  ): Promise<boolean> => {
    try {
      const res = await api.overrideStaffStatus(staffId, { status, beaconStatus, note });
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to override status');
      return false;
    }
  };

  // Device Actions
  const pingDevice = async (id: string) => {
    try {
      await api.pingDevice(id);
      await refreshData();
    } catch (err) {
      console.error('pingDevice error:', err);
    }
  };

  const rebootDevice = async (id: string) => {
    try {
      await api.rebootDevice(id);
      await refreshData();
    } catch (err) {
      console.error('rebootDevice error:', err);
    }
  };

  const addDevice = async (data: Partial<Device>): Promise<boolean> => {
    try {
      const res = await api.addDevice(data);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to add device');
      return false;
    }
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('markNotificationRead error:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('markAllNotificationsRead error:', err);
    }
  };

  // ESP32 Telemetry
  const sendESP32Telemetry = async (payload: { deviceId: string; beaconId: string; rssi: number }) => {
    try {
      const res = await api.sendESP32Telemetry(payload);
      await refreshData();
      return res;
    } catch (err: any) {
      throw err;
    }
  };

  // Computed summary metrics
  const metrics = useMemo(() => {
    const todaysExamsCount = exams.length;
    const inProgressExamsCount = exams.filter((e) => e.status === 'In Progress' || e.status === 'Ready').length;
    const hallsReadyCount = halls.filter((h) => h.overallStatus === 'Ready' || h.overallStatus === 'In Session').length;
    const totalHallsCount = halls.length;
    const staffPresentCount = staff.filter((s) => s.status === 'Checked In' || s.status === 'On Duty').length;
    const totalStaffCount = staff.length;
    const openProblemsCount = halls.filter((h) => h.overallStatus === 'Problem').length;
    const totalStudentsToday = halls.reduce((sum, h) => sum + (h.capacity || 0), 0);
    const onlineDevicesCount = devices.filter((d) => d.status === 'Online').length;
    const totalDevicesCount = devices.length;
    const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

    return {
      todaysExamsCount,
      inProgressExamsCount,
      hallsReadyCount,
      totalHallsCount,
      staffPresentCount,
      totalStaffCount,
      openProblemsCount,
      totalStudentsToday,
      onlineDevicesCount,
      totalDevicesCount,
      unreadNotificationsCount,
    };
  }, [exams, halls, staff, devices, notifications]);

  return (
    <ExamContext.Provider
      value={{
        activePage,
        setActivePage,
        exams,
        halls,
        staff,
        devices,
        replacements,
        notifications,
        esp32Logs,
        problems,
        searchQuery,
        setSearchQuery,
        isLoading,
        refreshData,

        isReportModalOpen,
        setIsReportModalOpen,
        isAddExamModalOpen,
        setIsAddExamModalOpen,
        isAssignStaffModalOpen,
        setIsAssignStaffModalOpen,
        isSetInvigilatorModalOpen,
        setIsSetInvigilatorModalOpen,
        isReplaceInvigilatorModalOpen,
        setIsReplaceInvigilatorModalOpen,
        isImportTimetableModalOpen,
        setIsImportTimetableModalOpen,
        isESP32ConsoleModalOpen,
        setIsESP32ConsoleModalOpen,
        isCollegeSettingsModalOpen,
        setIsCollegeSettingsModalOpen,
        isStaffModalOpen,
        setIsStaffModalOpen,
        isHallModalOpen,
        setIsHallModalOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        exportInitialTab,
        openExportModal,

        selectedExamForAction,
        setSelectedExamForAction,
        selectedStaffForAction,
        setSelectedStaffForAction,
        selectedHallForAction,
        setSelectedHallForAction,

        addExam,
        updateExam,
        deleteExam,
        importTimetable,
        setInvigilator,
        replaceInvigilator,

        toggleHallChecklist,
        addHall,
        updateHall,
        deleteHall,

        addStaff,
        updateStaff,
        deleteStaff,
        overrideStaffStatus,

        pingDevice,
        rebootDevice,
        addDevice,

        markNotificationRead,
        markAllNotificationsRead,
        sendESP32Telemetry,

        metrics,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExamContext = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExamContext must be used within an ExamProvider');
  }
  return context;
};
