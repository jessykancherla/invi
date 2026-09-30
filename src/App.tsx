import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ExamProvider, useExamContext } from './context/ExamContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { ExamsPage } from './pages/ExamsPage';
import { StaffPage } from './pages/StaffPage';
import { HallsPage } from './pages/HallsPage';
import { DevicesPage } from './pages/DevicesPage';
import { ESP32HubPage } from './pages/ESP32HubPage';
import { ReplacementsPage } from './pages/ReplacementsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportProblemModal } from './components/ReportProblemModal';
import { AddExamModal } from './components/AddExamModal';
import { AssignStaffModal } from './components/AssignStaffModal';
import { SetInvigilatorModal } from './components/SetInvigilatorModal';
import { ReplaceInvigilatorModal } from './components/ReplaceInvigilatorModal';
import { TimetableImportModal } from './components/TimetableImportModal';
import { ESP32ConsoleModal } from './components/ESP32ConsoleModal';
import { StaffEditModal } from './components/StaffEditModal';
import { HallEditModal } from './components/HallEditModal';
import { CollegeSettingsModal } from './components/CollegeSettingsModal';
import { ExportModal } from './components/ExportModal';

const AppContent: React.FC = () => {
  const { activePage } = useExamContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'exams':
        return <ExamsPage />;
      case 'staff':
        return <StaffPage />;
      case 'halls':
        return <HallsPage />;
      case 'devices':
        return <DevicesPage />;
      case 'esp32':
        return <ESP32HubPage />;
      case 'replacements':
        return <ReplacementsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col font-sans">
      {/* Dark Maroon Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area (offset by sidebar on desktop) */}
      <div className="lg:pl-60 flex flex-col min-h-screen bg-[#F8F9FA]">
        {/* Top Header */}
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-6 lg:p-8 w-full max-w-[1400px] mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals */}
      <ReportProblemModal />
      <AddExamModal />
      <AssignStaffModal />
      <SetInvigilatorModal />
      <ReplaceInvigilatorModal />
      <TimetableImportModal />
      <ESP32ConsoleModal />
      <StaffEditModal />
      <HallEditModal />
      <CollegeSettingsModal />
      <ExportModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <AppContent />
      </ExamProvider>
    </AuthProvider>
  );
}
