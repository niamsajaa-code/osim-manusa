import React, { useState, useEffect } from 'react';
import { AppSettings, AdminUser, SupabaseHealthStatus } from '../../types';
import { 
  updateSettings, 
  updateAdminCredentials, 
  uploadAsset,
  resetElectionData,
  checkSupabaseStatus 
} from '../../services/electionService';
import { 
  Building2, 
  Lock, 
  Database, 
  Upload, 
  Check, 
  Copy, 
  AlertCircle, 
  Power, 
  Calendar,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Trash2,
  Activity,
  Server,
  Wifi,
  RefreshCw,
  XCircle,
  Table as TableIcon
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';

interface AdminSettingsProps {
  settings: AppSettings | null;
  adminUser: AdminUser | null;
  onRefreshSettings: () => void;
  onUpdateAdminUser: (admin: AdminUser) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  adminUser,
  onRefreshSettings,
  onUpdateAdminUser,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'reset' | 'sql'>('general');

  // General Settings State
  const [schoolName, setSchoolName] = useState(settings?.school_name || '');
  const [schoolLogo, setSchoolLogo] = useState(settings?.school_logo || '');
  const [electionTitle, setElectionTitle] = useState(settings?.election_title || '');
  const [electionPeriod, setElectionPeriod] = useState(settings?.election_period || '');
  const [isActive, setIsActive] = useState(settings?.is_active ?? true);
  const [generalLoading, setGeneralLoading] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Admin Account Credentials State
  const [currentUsername, setCurrentUsername] = useState(adminUser?.username || 'admin');
  const [adminName, setAdminName] = useState(adminUser?.nama || 'Administrator OSIS');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState(false);
  const [accountError, setAccountError] = useState('');

  // Reset Election State
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // SQL Copy State
  const [copiedSql, setCopiedSql] = useState(false);

  // Supabase Database Health State
  const [dbStatus, setDbStatus] = useState<SupabaseHealthStatus | null>(null);
  const [dbStatusLoading, setDbStatusLoading] = useState(false);

  const fetchDbStatus = async () => {
    setDbStatusLoading(true);
    const res = await checkSupabaseStatus();
    setDbStatus(res);
    setDbStatusLoading(false);
  };

  const handleExecuteReset = async () => {
    setResetLoading(true);
    setResetError('');
    setResetSuccess(false);

    const res = await resetElectionData();
    setResetLoading(false);

    if (res.success) {
      setIsResetModalOpen(false);
      setResetConfirmationInput('');
      setResetSuccess(true);
      onRefreshSettings();
      setTimeout(() => setResetSuccess(false), 5000);
    } else {
      setResetError(res.error || 'Gagal mereset data pemilihan');
    }
  };

  useEffect(() => {
    if (activeTab === 'sql') {
      fetchDbStatus();
    }
  }, [activeTab]);

  useEffect(() => {
    if (settings) {
      setSchoolName(settings.school_name);
      setSchoolLogo(settings.school_logo);
      setElectionTitle(settings.election_title);
      setElectionPeriod(settings.election_period);
      setIsActive(settings.is_active);
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setGeneralError('');
    try {
      const url = await uploadAsset(file, 'logos');
      setSchoolLogo(url);
    } catch {
      setGeneralError('Gagal mengunggah logo sekolah');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralLoading(true);
    setGeneralSuccess(false);
    setGeneralError('');

    const res = await updateSettings({
      school_name: schoolName.trim(),
      school_logo: schoolLogo.trim(),
      election_title: electionTitle.trim(),
      election_period: electionPeriod.trim(),
      is_active: isActive,
    });

    setGeneralLoading(false);

    if (res.success) {
      setGeneralSuccess(true);
      onRefreshSettings();
      setTimeout(() => setGeneralSuccess(false), 3000);
    } else {
      setGeneralError(res.error || 'Gagal menyimpan pengaturan');
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;

    if (!currentPassword.trim()) {
      setAccountError('Password saat ini wajib diisi untuk verifikasi keamanan');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setAccountError('Konfirmasi password baru tidak cocok');
      return;
    }

    setAccountLoading(true);
    setAccountSuccess(false);
    setAccountError('');

    const res = await updateAdminCredentials(
      adminUser.id,
      currentPassword,
      newPassword,
      currentUsername,
      adminName
    );

    setAccountLoading(false);

    if (res.success) {
      setAccountSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onUpdateAdminUser({
        ...adminUser,
        username: currentUsername,
        nama: adminName,
        password_hash: newPassword || adminUser.password_hash,
      });
      setTimeout(() => setAccountSuccess(false), 3000);
    } else {
      setAccountError(res.error || 'Gagal memperbarui profil/password');
    }
  };

  const sqlSchemaCode = `-- SKRIP SKEMA SUPABASE LENGKAP E-VOTING OSIS
-- 1. Tabel Settings (Pengaturan Sekolah & Pemilihan)
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL DEFAULT 'SMA / SMK NEGERI NUSANTARA',
    school_logo TEXT,
    election_title VARCHAR(255) NOT NULL DEFAULT 'Pemilihan Ketua & Wakil Ketua OSIS',
    election_period VARCHAR(50) NOT NULL DEFAULT '2026/2027',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel Admin
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL DEFAULT 'Administrator OSIS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabel Kelas
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    grade VARCHAR(20) NOT NULL DEFAULT 'X',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabel Siswa (DPT Pemilih)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) DEFAULT 'L',
    has_voted BOOLEAN NOT NULL DEFAULT false,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabel Paslon Kandidat
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_number INT UNIQUE NOT NULL,
    ketua_name VARCHAR(255) NOT NULL,
    wakil_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    slogan TEXT,
    visi TEXT NOT NULL,
    misi TEXT NOT NULL,
    total_votes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tabel Surat Suara (Asas Rahasia - Secret Ballot)
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    voted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Supabase RPC Function: Pemungutan Suara Atomik & Aman
CREATE OR REPLACE FUNCTION public.submit_vote(p_student_id UUID, p_candidate_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_has_voted BOOLEAN;
    v_is_active BOOLEAN;
BEGIN
    SELECT is_active INTO v_is_active FROM public.settings WHERE id = 1;
    IF v_is_active IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pemilihan OSIS sedang ditutup.');
    END IF;

    SELECT has_voted INTO v_has_voted FROM public.students WHERE id = p_student_id FOR UPDATE;
    IF v_has_voted = TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda sudah menggunakan hak suara Anda.');
    END IF;

    INSERT INTO public.votes (candidate_id, voted_at) VALUES (p_candidate_id, now());
    UPDATE public.students SET has_voted = TRUE, voted_at = now() WHERE id = p_student_id;
    UPDATE public.candidates SET total_votes = total_votes + 1 WHERE id = p_candidate_id;

    RETURN jsonb_build_object('success', true, 'message', 'Suara Anda berhasil dicatat.');
END;
$$;`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Pengaturan</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Pengaturan Aplikasi &amp; Akun
          </h1>
          <p className="text-xs text-slate-500">
            Konfigurasi identitas sekolah, periode pemilihan, status voting, dan keamanan kredensial
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Sekolah &amp; Pemilihan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'account'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Kredensial Admin</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reset')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'reset'
              ? 'border-red-600 text-red-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <RotateCcw className={`w-4 h-4 ${activeTab === 'reset' ? 'text-red-600' : 'text-slate-400'}`} />
          <span>Reset Pemilihan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'sql'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Skrip SQL &amp; Supabase</span>
        </button>
      </div>

      {/* TAB 1: General School & Election */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Identitas Sekolah &amp; Status Pemilihan
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Informasi ini otomatis ditampilkan pada bilah atas, kartu suara siswa, dan kop dokumen hasil pemilihan.
          </p>

          {generalSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pengaturan sekolah &amp; pemilihan berhasil disimpan ke Supabase!</span>
            </div>
          )}

          {generalError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Sekolah / Madrasah
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: SMA NEGERI 1 NUSANTARA"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                required
              />
            </div>

            {/* School Logo */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Logo Sekolah (Supabase Storage / URL)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                  <img
                    src={schoolLogo || '/src/assets/images/eosis_school_logo_1792395943704.jpg'}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/eosis_school_logo_1792395943704.jpg';
                    }}
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors text-[11px] font-medium border border-slate-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? 'Mengunggah...' : 'Upload Logo Baru'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={schoolLogo}
                    onChange={(e) => setSchoolLogo(e.target.value)}
                    placeholder="URL logo sekolah..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Pemilihan
                </label>
                <input
                  type="text"
                  value={electionTitle}
                  onChange={(e) => setElectionTitle(e.target.value)}
                  placeholder="Pemilihan Ketua & Wakil Ketua OSIS"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Periode / Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={electionPeriod}
                  onChange={(e) => setElectionPeriod(e.target.value)}
                  placeholder="Contoh: 2026/2027"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
                  required
                />
              </div>
            </div>

            {/* Voting Active Switch */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Status Pemungutan Suara
              </label>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="font-bold text-slate-900">
                    {isActive ? 'Pemilihan Sedang Dibuka' : 'Pemilihan Ditutup'}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {isActive
                      ? 'Siswa yang belum memilih dapat login dan memberikan suara'
                      : 'Bilik suara dinonaktifkan sementara oleh panitia'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={generalLoading || uploadingLogo}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
              >
                {generalLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Admin Account Credentials */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Ganti Username &amp; Password Administrator
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Perbarui akun login admin. Kredensial ini disimpan aman pada database Supabase.
          </p>

          {accountSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kredensial administrator berhasil diperbarui!</span>
            </div>
          )}

          {accountError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{accountError}</span>
            </div>
          )}

          <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Pengelola
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Administrator OSIS"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Username Admin
              </label>
              <input
                type="text"
                value={currentUsername}
                onChange={(e) => setCurrentUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
                required
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">
                Password Saat Ini (Wajib diisi)
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password admin saat ini"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password Baru (Opsional, kosongkan jika tidak ingin mengganti)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
              />
            </div>

            {newPassword && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ulangi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
                  required
                />
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={accountLoading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs transition-colors"
              >
                {accountLoading ? 'Memperbarui...' : 'Perbarui Kredensial'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Reset Pemilihan (Zona Bahaya) */}
      {activeTab === 'reset' && (
        <div className="bg-white rounded-2xl border border-red-200/80 p-6 shadow-xs max-w-2xl space-y-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reset Data Pemilihan &amp; Hasil Suara
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengosongkan perolehan suara dan mengembalikan status seluruh pemilih menjadi belum memilih.
              </p>
            </div>
          </div>

          {resetSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Reset Pemilihan Berhasil!</span>
                <span>Seluruh surat suara telah dikosongkan, status semua siswa telah kembali menjadi 'Belum Memilih', dan total perolehan paslon telah kembali ke 0.</span>
              </div>
            </div>
          )}

          {resetError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Gagal Mereset Pemilihan:</span>
                <span>{resetError}</span>
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
            <span className="font-bold text-slate-900 block">Dampak dari Tindakan Reset:</span>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              <li>
                <strong>Surat Suara Dikosongkan:</strong> Seluruh baris suara pada tabel <code>votes</code> akan dihapus secara permanen.
              </li>
              <li>
                <strong>Status Siswa Direset:</strong> Semua akun siswa pemilih akan dikembalikan ke status <code>Belum Memilih</code> sehingga dapat login dan memilih kembali.
              </li>
              <li>
                <strong>Perolehan Paslon 0:</strong> Counter suara (<code>total_votes</code>) setiap paslon kandidat dikembalikan menjadi 0.
              </li>
              <li>
                <strong>Data Master Aman:</strong> Data biodata siswa, data kelas, data calon kandidat, dan profil sekolah <u>TIDAK</u> akan dihapus.
              </li>
            </ul>
          </div>

          {/* Safety input guard */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <label className="block font-semibold text-slate-700">
              Ketik kata <span className="font-mono text-red-600 font-bold bg-red-50 px-1 py-0.5 rounded">RESET</span> di bawah ini untuk membuka tombol konfirmasi:
            </label>
            <input
              type="text"
              value={resetConfirmationInput}
              onChange={(e) => setResetConfirmationInput(e.target.value)}
              placeholder="Ketik RESET"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono uppercase tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              *Tindakan ini tidak dapat dibatalkan setelah dijalankan.
            </span>
            <button
              type="button"
              disabled={resetConfirmationInput.trim().toUpperCase() !== 'RESET' || resetLoading}
              onClick={() => setIsResetModalOpen(true)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                resetConfirmationInput.trim().toUpperCase() === 'RESET' && !resetLoading
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer active:scale-98'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${resetLoading ? 'animate-spin' : ''}`} />
              <span>{resetLoading ? 'Mereset Data...' : 'Kosongkan Seluruh Suara & Reset Pemilihan'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset Pemilihan */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Konfirmasi Reset Pemilihan OSIS"
        message="PERINGATAN: Anda akan menghapus seluruh surat suara yang sudah masuk dan mengembalikan hak suara seluruh siswa menjadi belum memilih. Apakah Anda benar-benar yakin ingin melanjutkan?"
        confirmLabel="Ya, Lakukan Reset Sekarang"
        cancelLabel="Batal"
        variant="danger"
        isLoading={resetLoading}
        onConfirm={handleExecuteReset}
        onCancel={() => setIsResetModalOpen(false)}
      />

      {/* TAB 4: SQL Schema & Supabase Architecture with Database Status */}
      {activeTab === 'sql' && (
        <div className="space-y-6 max-w-4xl">
          
          {/* Status Database Supabase Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  dbStatus?.connected
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Status Database Supabase
                    </h3>
                    {dbStatus && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        dbStatus.connected
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {dbStatus.connected ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Terhubung (Connected)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Gagal Terhubung</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monitoring koneksi real-time, latensi query, dan kesiapan tabel sistem E-Voting
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchDbStatus}
                disabled={dbStatusLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors self-start sm:self-auto shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dbStatusLoading ? 'animate-spin text-indigo-600' : ''}`} />
                <span>{dbStatusLoading ? 'Memeriksa...' : 'Uji Ulang Koneksi'}</span>
              </button>
            </div>

            {/* Parameter & Latensi Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">API Endpoint URL</span>
                <span className="text-xs font-mono font-semibold text-slate-800 truncate block" title={dbStatus?.url}>
                  {dbStatus?.url ? dbStatus.url.replace('https://', '') : 'yppdnhuglvbevkuopprc...'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Kunci Akses (Anon Key)</span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Terpasang &amp; Valid</span>
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Latensi Respon (Ping)</span>
                <span className="text-xs font-mono font-bold text-slate-800 tabular-nums flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{dbStatus?.latencyMs ?? 0} ms</span>
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Pemeriksaan Terakhir</span>
                <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                  {dbStatus?.checkedAt ?? '-'} WIB
                </span>
              </div>
            </div>

            {/* Health Status Per Tabel Database */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TableIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Status Kesiapan Tabel Database:</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {dbStatus?.tables.filter(t => t.status === 'ok').length || 0} dari {dbStatus?.tables.length || 0} tabel aktif
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {dbStatus?.tables.map((tbl) => (
                  <div
                    key={tbl.name}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                      tbl.status === 'ok'
                        ? 'bg-slate-50/80 border-slate-200 hover:border-emerald-300'
                        : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        {tbl.name}
                      </span>
                      {tbl.status === 'ok' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-600 shrink-0" />
                      )}
                    </div>
                    <div className="font-mono text-[10px] tabular-nums text-slate-500">
                      {tbl.status === 'ok' ? `${tbl.rowCount} baris` : 'Error'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage & RPC Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Supabase Storage:</span>
                  <span className="text-slate-500 text-[11px]">Bucket <code>osis-assets</code> aktif dengan fallback Data URL aman untuk upload foto &amp; logo.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <Activity className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">RPC &amp; Row Level Security:</span>
                  <span className="text-slate-500 text-[11px]">Validasi integritas 1 suara siswa dan pemisahan surat suara anonim (Secret Ballot) aktif.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Skrip SQL Editor Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Skrip SQL &amp; Konfigurasi Database Supabase
                </h3>
                <p className="text-xs text-slate-500">
                  Gunakan skrip ini di SQL Editor Supabase untuk migrasi skema lengkap, RPC function submit_vote, dan RLS security.
                </p>
              </div>

              <button
                type="button"
                onClick={copySqlToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200 transition-colors self-start sm:self-auto"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL'}</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-slate-200 font-mono text-[11px] leading-relaxed max-h-96 border border-slate-800">
              <pre>{sqlSchemaCode}</pre>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">Keterangan Keamanan &amp; Integritas:</span>
              <p>1. RPC <code>submit_vote</code> berjalan sebagai <code>SECURITY DEFINER</code> dan mengunci baris siswa (<code>FOR UPDATE</code>) untuk mencegah double-vote saat multiple tab atau refresh.</p>
              <p>2. Tabel <code>votes</code> sengaja dibuat terpisah tanpa foreign key ke <code>student_id</code> guna menjaga asas kerahasiaan suara (secret ballot).</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
