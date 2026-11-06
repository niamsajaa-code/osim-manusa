import React, { useState } from 'react';
import { AppSettings, Student } from '../../types';
import { loginStudent } from '../../services/electionService';
import { Shield, KeyRound, Calendar, UserCheck, AlertCircle, Sparkles } from 'lucide-react';

interface StudentLoginProps {
  settings: AppSettings | null;
  onLoginSuccess: (student: Student) => void;
  onGoToAdmin: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  settings,
  onLoginSuccess,
  onGoToAdmin,
}) => {
  const [nisn, setNisn] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const schoolName = settings?.school_name || 'SMA / SMK NEGERI NUSANTARA';
  const schoolLogo = settings?.school_logo || '/src/assets/images/eosis_school_logo_1792395943704.jpg';
  const period = settings?.election_period || '2026/2027';
  const electionTitle = settings?.election_title || 'Pemilihan Ketua & Wakil Ketua OSIS';
  const isActive = settings?.is_active ?? true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nisn.trim()) {
      setErrorMessage('Harap masukkan nomor NISN Anda');
      return;
    }

    if (!tanggalLahir.trim()) {
      setErrorMessage('Harap masukkan tanggal lahir Anda');
      return;
    }

    setLoading(true);
    const result = await loginStudent(nisn, tanggalLahir);
    setLoading(false);

    if (result.success && result.student) {
      onLoginSuccess(result.student);
    } else {
      setErrorMessage(result.error || 'Login gagal. Periksa kembali NISN dan tanggal lahir.');
    }
  };

  // Demo accounts for instant test convenience
  const quickFill = (testNisn: string, testDob: string) => {
    setNisn(testNisn);
    setTanggalLahir(testDob);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-b from-indigo-900 to-indigo-950 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-3 bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-md">
              <img
                src={schoolLogo}
                alt={schoolName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/src/assets/images/eosis_school_logo_1792395943704.jpg';
                }}
              />
            </div>
            
            <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-300 block mb-1">
              Portal Pemilih
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">
              {electionTitle}
            </h2>
            <p className="text-xs text-indigo-200 font-medium">
              {schoolName} · Periode {period}
            </p>
          </div>
        </div>

        {/* Voting Inactive Warning if closed */}
        {!isActive && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Pemilihan saat ini sedang ditutup oleh panitia OSIS.</span>
          </div>
        )}

        {/* Form */}
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900">Masuk dengan Data Pemilih</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan Nomor Induk Siswa Nasional (NISN) dan tanggal lahir terdaftar.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nisn" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <div className="relative">
                <input
                  id="nisn"
                  type="text"
                  maxLength={15}
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="Contoh: 0067891234"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
                  required
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="tanggalLahir" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Lahir
              </label>
              <div className="relative">
                <input
                  id="tanggalLahir"
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
                  required
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Format: YYYY-MM-DD sesuai data kesiswaan
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2 mt-6 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? 'Memverifikasi Data...' : 'Masuk & Periksa Hak Suara'}</span>
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-slate-700">Akun Siswa Contoh (Untuk Uji Coba):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickFill('0067891234', '2008-05-14')}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors"
              >
                <div className="font-semibold text-slate-800">Ahmad Fauzan</div>
                <div className="text-slate-500 font-mono">0067891234</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('0067891235', '2008-09-21')}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors"
              >
                <div className="font-semibold text-slate-800">Bella Anindya</div>
                <div className="text-slate-500 font-mono">0067891235</div>
              </button>
            </div>
          </div>

          {/* Link to Admin */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onGoToAdmin}
              className="text-xs text-slate-500 hover:text-indigo-600 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Masuk sebagai Panitia / Administrator</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
