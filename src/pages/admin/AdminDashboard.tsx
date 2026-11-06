import React, { useEffect, useState } from 'react';
import { AppSettings, VotingStats, VoteResult } from '../../types';
import { getVotingStats, getVoteResults, updateSettings } from '../../services/electionService';
import { ResultsChart } from '../../components/Charts';
import { 
  Users, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  RefreshCw, 
  Power,
  ChevronRight
} from 'lucide-react';
import { AdminTab } from '../../components/AdminSidebar';

interface AdminDashboardProps {
  settings: AppSettings | null;
  onNavigateTab: (tab: AdminTab) => void;
  onRefreshSettings: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  onNavigateTab,
  onRefreshSettings,
}) => {
  const [stats, setStats] = useState<VotingStats | null>(null);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const [st, res] = await Promise.all([
      getVotingStats(),
      getVoteResults(),
    ]);
    setStats(st);
    setResults(res);
    setLoading(false);
  };

  const handleToggleElection = async () => {
    if (!settings) return;
    setToggleLoading(true);
    const nextState = !settings.is_active;
    await updateSettings({ is_active: nextState });
    onRefreshSettings();
    setToggleLoading(false);
  };

  const isElectionActive = settings?.is_active ?? true;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Beranda</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Ringkasan &amp; Statistik Pemilihan
          </h1>
          <p className="text-xs text-slate-500">
            {settings?.school_name} · {settings?.election_title} ({settings?.election_period})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Election Active Status Switch */}
          <button
            type="button"
            onClick={handleToggleElection}
            disabled={toggleLoading}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isElectionActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isElectionActive ? 'Pemilihan Dibuka' : 'Pemilihan Ditutup'}</span>
          </button>

          <button
            type="button"
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 6 Key Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Siswa */}
        <div 
          onClick={() => onNavigateTab('siswa')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Total DPT</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats?.totalStudents ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Siswa Terdaftar</div>
          </div>
        </div>

        {/* Total Kelas */}
        <div 
          onClick={() => onNavigateTab('kelas')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Total Kelas</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats?.totalClasses ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Rombongan Belajar</div>
          </div>
        </div>

        {/* Total Kandidat */}
        <div 
          onClick={() => onNavigateTab('kandidat')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Paslon Kandidat</span>
            <Award className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats?.totalCandidates ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Pasangan Calon</div>
          </div>
        </div>

        {/* Sudah Memilih */}
        <div 
          onClick={() => onNavigateTab('siswa')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-medium text-emerald-800">Sudah Memilih</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {stats?.votedCount ?? 0}
            </div>
            <div className="text-[11px] text-emerald-800/80 mt-0.5">Suara Masuk</div>
          </div>
        </div>

        {/* Belum Memilih */}
        <div 
          onClick={() => onNavigateTab('siswa')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-amber-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-medium text-amber-800">Belum Memilih</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
              {stats?.notVotedCount ?? 0}
            </div>
            <div className="text-[11px] text-amber-800/80 mt-0.5">Siswa Belum Hadir</div>
          </div>
        </div>

        {/* Persentase Partisipasi */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-2xl p-4 text-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-200 mb-2">
            <span className="text-xs font-medium">Partisipasi</span>
            <TrendingUp className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {stats?.participationPercentage ?? 0}%
            </div>
            <div className="w-full bg-indigo-950/60 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div 
                className="bg-indigo-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${stats?.participationPercentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Visual Chart Breakdown */}
      <ResultsChart
        results={results}
        totalVotes={stats?.votedCount ?? 0}
      />

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab('kandidat')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Kelola Calon Kandidat</h4>
              <p className="text-xs text-slate-500">Atur nomor urut, foto, visi &amp; misi</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('siswa')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Daftar Pemilih Tetap</h4>
              <p className="text-xs text-slate-500">Cek status sudah/belum memilih siswa</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('perolehan')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Hasil &amp; Berita Acara</h4>
              <p className="text-xs text-slate-500">Rekapitulasi resmi perolehan suara</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

    </div>
  );
};
