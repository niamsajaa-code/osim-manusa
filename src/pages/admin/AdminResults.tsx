import React, { useState, useEffect } from 'react';
import { VoteResult, VotingStats, AppSettings } from '../../types';
import { getVoteResults, getVotingStats } from '../../services/electionService';
import { ResultsChart } from '../../components/Charts';
import { 
  BarChart3, 
  RefreshCw, 
  Printer, 
  ShieldCheck, 
  Trophy, 
  Users, 
  Vote, 
  Loader2 
} from 'lucide-react';

interface AdminResultsProps {
  settings: AppSettings | null;
}

export const AdminResults: React.FC<AdminResultsProps> = ({ settings }) => {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [stats, setStats] = useState<VotingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchResults();
    // Auto refresh every 10 seconds for real-time polling during count
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      setErrorMessage('');
      const [resData, statData] = await Promise.all([
        getVoteResults(),
        getVotingStats(),
      ]);
      setResults(resData || []);
      setStats(statData);
    } catch (err: unknown) {
      console.error('Failed to load results:', err);
      setErrorMessage('Gagal memuat data perolehan suara.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Rank candidates descending by total votes
  const ranked = [...results].sort((a, b) => b.votes - a.votes);
  const totalVotesCast = stats?.votedCount ?? 0;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Perolehan Suara</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Rekapitulasi Hasil Perolehan Suara
          </h1>
          <p className="text-xs text-slate-500">
            Penghitungan suara otomatis real-time berdasarkan asas LUBER JURDIL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchResults}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Segarkan Data</span>
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Berita Acara</span>
          </button>
        </div>
      </div>

      {/* Printable Official Header (Shown only on print or export) */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider">{settings?.school_name}</h2>
        <h3 className="text-base font-semibold">PANITIA PEMILIHAN KETUA &amp; WAKIL KETUA OSIS</h3>
        <p className="text-xs text-slate-600 mt-1">
          BERITA ACARA HASIL PENGHITUNGAN SUARA PERIODE {settings?.election_period}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Dicetak pada: {new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })}
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={fetchResults}
            className="font-bold underline ml-2 hover:text-red-900"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Secret Ballot & Security Assurance Callout */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex items-start gap-3 print:hidden">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950">
          <span className="font-bold block mb-0.5">Asas Kerahasiaan Pemilih (Secret Ballot):</span>
          <p className="text-indigo-900/80 leading-relaxed">
            Sesuai regulasi pemilihan OSIS dan prinsip LUBER JURDIL, sistem database Supabase secara ketat tidak mengaitkan identitas pemilih (NISN/Nama) dengan nomor paslon yang dipilih. Admin hanya dapat memantau status partisipasi (sudah/belum memilih) dan perolehan total suara masing-masing kandidat.
          </p>
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Total Suara Masuk</span>
            <Vote className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
            {totalVotesCast}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Dari total {stats?.totalStudents ?? 0} pemilih tetap (DPT)
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Tingkat Partisipasi</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-emerald-600">
            {stats?.participationPercentage ?? 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats?.notVotedCount ?? 0} siswa belum memberikan suara
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Kandidat Terunggul</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {ranked[0]?.votes > 0 ? (
              <span>Paslon #{ranked[0]?.candidate.candidate_number}</span>
            ) : (
              <span className="text-slate-400 text-sm font-normal">Belum ada suara</span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {ranked[0]?.votes > 0
              ? `${ranked[0]?.candidate.ketua_name} (${ranked[0]?.percentage}%)`
              : 'Menunggu suara masuk'}
          </div>
        </div>
      </div>

      {/* Visual Chart Component */}
      <ResultsChart
        results={results}
        totalVotes={totalVotesCast}
      />

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Tabel Rekapitulasi Perolehan Suara</h3>
          <span className="text-xs text-slate-400">Total Paslon: {results.length}</span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs">Menghitung suara...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Belum ada pasangan calon terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Peringkat</th>
                  <th className="py-3 px-4 w-20 text-center">No Urut</th>
                  <th className="py-3 px-4">Nama Pasangan Calon</th>
                  <th className="py-3 px-4 text-right">Perolehan Suara</th>
                  <th className="py-3 px-4 text-right">Persentase</th>
                  <th className="py-3 px-4 text-center">Grafik Porsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ranked.map((item, index) => {
                  const isLeader = index === 0 && item.votes > 0;
                  return (
                    <tr 
                      key={item.candidate.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isLeader ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                        {isLeader ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[11px]">
                            🏆 1
                          </span>
                        ) : (
                          <span className="text-slate-500">{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                          #{item.candidate.candidate_number}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.candidate.photo_url || '/src/assets/images/candidate_paslon_satu_1792395944411.jpg'}
                            alt={item.candidate.ketua_name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/src/assets/images/candidate_paslon_satu_1792395944411.jpg';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900">
                              {item.candidate.ketua_name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Wakil: {item.candidate.wakil_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                        {item.votes} suara
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700 text-sm tabular-nums">
                        {item.percentage}%
                      </td>
                      <td className="py-3 px-4 w-44">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Signatures for Printed Report */}
      <div className="hidden print:grid grid-cols-2 gap-8 pt-12 mt-12 text-center text-xs">
        <div>
          <p className="mb-16">Ketua Panitia Pemilihan OSIS,</p>
          <p className="font-bold underline">( ............................................ )</p>
          <p className="text-[10px] text-slate-500">NIP / NISN.</p>
        </div>
        <div>
          <p className="mb-16">Mengetahui, Pembina OSIS / Kesiswaan</p>
          <p className="font-bold underline">( ............................................ )</p>
          <p className="text-[10px] text-slate-500">NIP.</p>
        </div>
      </div>

    </div>
  );
};
