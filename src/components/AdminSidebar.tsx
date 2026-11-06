import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Award, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronRight
} from 'lucide-react';

export type AdminTab = 'beranda' | 'kelas' | 'siswa' | 'kandidat' | 'perolehan' | 'pengaturan';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'beranda', label: 'Beranda', icon: LayoutDashboard },
    { id: 'kelas', label: 'Kelas', icon: GraduationCap },
    { id: 'siswa', label: 'Siswa / User', icon: Users },
    { id: 'kandidat', label: 'Calon Kandidat', icon: Award },
    { id: 'perolehan', label: 'Perolehan Suara', icon: BarChart3 },
    { id: 'pengaturan', label: 'Pengaturan', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-100">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Panel Administrator
          </div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            Navigasi Utama
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-indigo-500" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};
