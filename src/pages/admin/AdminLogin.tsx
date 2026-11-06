import React, { useState } from 'react';
import { AppSettings, AdminUser } from '../../types';
import { loginAdmin } from '../../services/electionService';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  settings: AppSettings | null;
  onLoginSuccess: (admin: AdminUser) => void;
  onBackToStudent: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  settings,
  onLoginSuccess,
  onBackToStudent,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const schoolName = settings?.school_name || 'E-VOTING OSIS';
  const schoolLogo = settings?.school_logo || '/src/assets/images/eosis_school_logo_1792395943704.jpg';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username dan password wajib diisi');
      return;
    }

    setLoading(true);
    const result = await loginAdmin(username, password);
    setLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setErrorMessage(result.error || 'Login admin gagal');
    }
  };

  const fillDefaultAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 mx-auto mb-3 bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/10 flex items-center justify-center shadow-md">
            <img
              src={schoolLogo}
              alt={schoolName}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/eosis_school_logo_1792395943704.jpg';
              }}
            />
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 block mb-1">
            Panel Administrator
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mb-0.5">
            Masuk Panitia Pemilihan
          </h2>
          <p className="text-xs text-slate-400">
            {schoolName}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="adminUsername" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username Administrator
              </label>
              <div className="relative">
                <input
                  id="adminUsername"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-mono"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="adminPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-mono"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2 mt-6 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard Admin'}</span>
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Akun Default: <strong>admin</strong> / <strong>admin123</strong></span>
            <button
              type="button"
              onClick={fillDefaultAdmin}
              className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <KeyRound className="w-3 h-3" />
              <span>Isi Cepat</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBackToStudent}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Pemilih Siswa</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
