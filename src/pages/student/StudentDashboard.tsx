import React from 'react';
import { Student, AppSettings } from '../../types';
import { 
  User, 
  IdCard, 
  Calendar, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Vote, 
  ShieldCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  settings: AppSettings | null;
  onStartVoting: () => void;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  settings,
  onStartVoting,
  onLogout,
}) => {
  const isElectionActive = settings?.is_active ?? true;

  // Format birth date nicely in Indonesian locale
  const formatBirthDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatVotedTime = (timeStr?: string | null) => {
    if (!timeStr) return '-';
    try {
      const d = new Date(timeStr);
      return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      
      {/* Welcome Kicker */}
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
          Bilik Suara Elektronik Siswa
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Selamat Datang, {student.nama}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Periksa biodata dan status hak suara Anda sebelum melanjutkan pemilihan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Biodata Card */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-100">
              <IdCard className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Biodata Pemilih Tetap (DPT)
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start justify-between py-1 border-b border-slate-50">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Nama Lengkap
                </span>
                <span className="font-semibold text-slate-900 text-right">{student.nama}</span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-50">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-slate-400" /> Nomor NISN
                </span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{student.nisn}</span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-50">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Kelas
                </span>
                <span className="font-semibold text-slate-900">{student.class_name}</span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-50">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Lahir
                </span>
                <span className="font-medium text-slate-800">{formatBirthDate(student.tanggal_lahir)}</span>
              </div>

              <div className="flex items-start justify-between py-1">
                <span className="text-xs text-slate-500">Jenis Kelamin</span>
                <span className="font-medium text-slate-800">
                  {student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Terdaftar resmi sebagai pemilih sah dalam database KPU OSIS</span>
          </div>
        </div>

        {/* Right Column: Status Hak Suara & Action */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* Status Box */}
          <div className={`rounded-2xl border p-6 shadow-xs flex flex-col justify-between flex-1 ${
            student.has_voted
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status Hak Suara
                </span>
                {student.has_voted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sudah Memilih
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-200 shadow-2xs">
                    <Vote className="w-3.5 h-3.5 text-indigo-600" /> Belum Memilih
                  </span>
                )}
              </div>

              {student.has_voted ? (
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-xs mb-3 border border-emerald-200">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Anda sudah menggunakan hak suara
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Terima kasih atas partisipasi aktif Anda dalam pesta demokrasi sekolah. Suara Anda telah tercatat secara anonim dan tersimpan aman di database.
                  </p>
                  
                  {student.voted_at && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dicatat pada: {formatVotedTime(student.voted_at)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-xs mb-3 border border-indigo-200">
                    <Vote className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Hak Suara Anda Tersedia
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Gunakan hak suara Anda secara cerdas, jujur, dan adil. Setiap siswa memiliki 1 hak suara yang bersifat rahasia dan tidak dapat diubah setelah disimpan.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-200/60">
              {!student.has_voted && (
                <>
                  {isElectionActive ? (
                    <button
                      type="button"
                      onClick={onStartVoting}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Berikan Suara</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 text-center font-medium">
                      Pemilihan sedang ditutup sementara oleh panitia
                    </div>
                  )}
                </>
              )}

              {student.has_voted && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
                >
                  Keluar dari Sesi
                </button>
              )}
            </div>

          </div>

          {/* Guarantee Note */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs text-slate-500 space-y-1">
            <span className="font-bold text-slate-800 block">Asas LUBER JURDIL:</span>
            <p>Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil. Sistem tidak mempublikasikan atau mengaitkan nama siswa dengan pilihan paslon.</p>
          </div>

        </div>

      </div>

    </div>
  );
};
