import React from 'react';
import { AppSettings, AdminUser, Student } from '../types';
import { LogOut, ShieldCheck, UserCheck, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  settings: AppSettings | null;
  adminUser: AdminUser | null;
  studentUser: Student | null;
  currentRole: 'student' | 'admin' | null;
  onLogout: () => void;
  onSwitchPortal: (target: 'student' | 'admin') => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  adminUser,
  studentUser,
  currentRole,
  onLogout,
  onSwitchPortal,
}) => {
  const schoolName = settings?.school_name || 'E-VOTING OSIS';
  const schoolLogo = settings?.school_logo || '/src/assets/images/eosis_school_logo_1792395943704.jpg';
  const period = settings?.election_period || '2026/2027';
  const isActive = settings?.is_active ?? true;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: School Identity & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center shadow-xs">
              <img
                src={schoolLogo}
                alt={schoolName}
                className="w-full h-full object-contain p-0.5"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/src/assets/images/eosis_school_logo_1792395943704.jpg';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                  {schoolName}
                </h1>
                <span className="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {period}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="truncate">E-Voting Pemilihan OSIS</span>
                <span aria-hidden="true">·</span>
                <span className={isActive ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                  {isActive ? 'Pemilihan Aktif' : 'Pemilihan Ditutup'}
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2 & 3: Active User Context & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {currentRole === 'admin' && adminUser && (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900">{adminUser.nama || adminUser.username}</span>
                  <span className="text-[11px] text-indigo-600 font-medium">Administrator</span>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors"
                  title="Keluar dari Panel Admin"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            )}

            {currentRole === 'student' && studentUser && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[160px]">{studentUser.nama}</span>
                  <div className="flex items-center justify-end gap-1 text-[11px]">
                    <span className="text-slate-500">{studentUser.class_name}</span>
                    <span aria-hidden="true">·</span>
                    {studentUser.has_voted ? (
                      <span className="text-emerald-700 font-medium inline-flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sudah Memilih
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium">Belum Memilih</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors"
                  title="Selesai & Keluar"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            )}

            {!currentRole && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSwitchPortal('student')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Login Siswa</span>
                </button>
                <button
                  onClick={() => onSwitchPortal('admin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Login Admin</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
