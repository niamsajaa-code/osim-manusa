import React, { useState, useEffect } from 'react';
import { AppSettings, AdminUser, Student } from './types';
import { getSettings, fetchStudentById } from './services/electionService';
import { Navbar } from './components/Navbar';
import { AdminSidebar, AdminTab } from './components/AdminSidebar';

// Student Pages
import { StudentLogin } from './pages/student/StudentLogin';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { VotingBooth } from './pages/student/VotingBooth';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminClasses } from './pages/admin/AdminClasses';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminCandidates } from './pages/admin/AdminCandidates';
import { AdminResults } from './pages/admin/AdminResults';
import { AdminSettings } from './pages/admin/AdminSettings';

import { Menu } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentRole, setCurrentRole] = useState<'student' | 'admin' | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [studentUser, setStudentUser] = useState<Student | null>(null);
  
  // Navigation states
  const [portalMode, setPortalMode] = useState<'student' | 'admin'>('student');
  const [adminTab, setAdminTab] = useState<AdminTab>('beranda');
  const [isVotingBooth, setIsVotingBooth] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    loadSettings();
    // Restore session if available
    const savedAdmin = localStorage.getItem('eosis_admin_session');
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        setAdminUser(parsed);
        setCurrentRole('admin');
        setPortalMode('admin');
      } catch {
        localStorage.removeItem('eosis_admin_session');
      }
    }
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  // Student Handlers
  const handleStudentLoginSuccess = (student: Student) => {
    setStudentUser(student);
    setCurrentRole('student');
    setIsVotingBooth(false);
  };

  const handleStartVoting = () => {
    setIsVotingBooth(true);
  };

  const handleVoteCompleted = () => {
    // Session is automatically ended after 4 seconds as per prompt specification
    setStudentUser(null);
    setCurrentRole(null);
    setIsVotingBooth(false);
    setPortalMode('student');
    loadSettings();
  };

  const handleStudentLogout = () => {
    setStudentUser(null);
    setCurrentRole(null);
    setIsVotingBooth(false);
    setPortalMode('student');
  };

  // Admin Handlers
  const handleAdminLoginSuccess = (admin: AdminUser) => {
    setAdminUser(admin);
    setCurrentRole('admin');
    setAdminTab('beranda');
    localStorage.setItem('eosis_admin_session', JSON.stringify(admin));
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setCurrentRole(null);
    localStorage.removeItem('eosis_admin_session');
    setPortalMode('student');
  };

  const handleSwitchPortal = (target: 'student' | 'admin') => {
    setPortalMode(target);
    if (target === 'student') {
      if (currentRole === 'admin') {
        handleAdminLogout();
      }
    } else {
      if (currentRole === 'student') {
        handleStudentLogout();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        settings={settings}
        adminUser={adminUser}
        studentUser={studentUser}
        currentRole={currentRole}
        onLogout={currentRole === 'admin' ? handleAdminLogout : handleStudentLogout}
        onSwitchPortal={handleSwitchPortal}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col">
        
        {/* ==================================================== */}
        {/* 1. ADMIN LOGGED IN VIEW WITH PERSISTENT SIDEBAR      */}
        {/* ==================================================== */}
        {currentRole === 'admin' && adminUser ? (
          <div className="flex-1 flex flex-col lg:flex-row">
            
            {/* Mobile Sidebar Trigger Header */}
            <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span>Menu Panel Admin</span>
              </button>
              <span className="text-xs font-bold text-indigo-700 uppercase">
                {adminTab}
              </span>
            </div>

            {/* Sidebar Component */}
            <AdminSidebar
              currentTab={adminTab}
              onSelectTab={setAdminTab}
              onLogout={handleAdminLogout}
              isMobileOpen={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            {/* Admin Workspace Content */}
            <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {adminTab === 'beranda' && (
                <AdminDashboard
                  settings={settings}
                  onNavigateTab={setAdminTab}
                  onRefreshSettings={loadSettings}
                />
              )}
              {adminTab === 'kelas' && <AdminClasses />}
              {adminTab === 'siswa' && <AdminStudents />}
              {adminTab === 'kandidat' && <AdminCandidates />}
              {adminTab === 'perolehan' && <AdminResults settings={settings} />}
              {adminTab === 'pengaturan' && (
                <AdminSettings
                  settings={settings}
                  adminUser={adminUser}
                  onRefreshSettings={loadSettings}
                  onUpdateAdminUser={(updated) => {
                    setAdminUser(updated);
                    localStorage.setItem('eosis_admin_session', JSON.stringify(updated));
                  }}
                />
              )}
            </main>
          </div>
        ) : currentRole === 'student' && studentUser ? (
          
          /* ==================================================== */
          /* 2. STUDENT LOGGED IN VIEW (DASHBOARD OR VOTING BOOTH) */
          /* ==================================================== */
          <main className="flex-1">
            {isVotingBooth ? (
              <VotingBooth
                student={studentUser}
                settings={settings}
                onBackToDashboard={() => setIsVotingBooth(false)}
                onVoteCompleted={handleVoteCompleted}
              />
            ) : (
              <StudentDashboard
                student={studentUser}
                settings={settings}
                onStartVoting={handleStartVoting}
                onLogout={handleStudentLogout}
              />
            )}
          </main>
        ) : (
          
          /* ==================================================== */
          /* 3. AUTHENTICATION PORTAL (STUDENT / ADMIN LOGIN)     */
          /* ==================================================== */
          <main className="flex-1">
            {portalMode === 'admin' ? (
              <AdminLogin
                settings={settings}
                onLoginSuccess={handleAdminLoginSuccess}
                onBackToStudent={() => setPortalMode('student')}
              />
            ) : (
              <StudentLogin
                settings={settings}
                onLoginSuccess={handleStudentLoginSuccess}
                onGoToAdmin={() => setPortalMode('admin')}
              />
            )}
          </main>
        )}

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>&copy; {new Date().getFullYear()} {settings?.school_name || 'OSIS'}. Seluruh hak cipta dilindungi.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Sistem Pemilihan Ketua &amp; Wakil Ketua OSIS</span>
            <span aria-hidden="true">·</span>
            <span>Prinsip LUBER JURDIL</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
