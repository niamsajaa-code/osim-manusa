import React, { useState, useEffect } from 'react';
import { Student, Candidate, AppSettings } from '../../types';
import { getCandidates, castVote } from '../../services/electionService';
import { CandidateCard } from '../../components/CandidateCard';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { VoteSuccessModal } from '../../components/VoteSuccessModal';
import { ArrowLeft, Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface VotingBoothProps {
  student: Student;
  settings: AppSettings | null;
  onBackToDashboard: () => void;
  onVoteCompleted: () => void;
}

export const VotingBooth: React.FC<VotingBoothProps> = ({
  student,
  settings,
  onBackToDashboard,
  onVoteCompleted,
}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    const data = await getCandidates();
    setCandidates(data);
    setLoading(false);
  };

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsConfirmOpen(true);
    setErrorMessage('');
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await castVote(student.id, selectedCandidate.id);
    setIsSubmitting(false);

    if (res.success) {
      setIsConfirmOpen(false);
      setIsSuccessModalOpen(true);
    } else {
      setErrorMessage(res.message || 'Gagal menyimpan suara');
      setIsConfirmOpen(false);
    }
  };

  const handleFinishSuccess = () => {
    setIsSuccessModalOpen(false);
    onVoteCompleted();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
      
      {/* Top Bar / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Biodata Siswa</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Surat Suara Elektronik (E-Ballot)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pilihlah salah satu Pasangan Calon Ketua &amp; Wakil Ketua OSIS Periode {settings?.election_period || '2026/2027'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs text-indigo-900 self-start sm:self-auto shadow-2xs">
          <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Pemilih: <strong>{student.nama}</strong> ({student.class_name})</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Peringatan Validasi:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Memuat data kandidat...</span>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <p className="text-slate-600 text-sm">Belum ada calon kandidat yang terdaftar dalam sistem.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              showVoteAction={true}
              isVotingBooth={true}
              onSelect={handleSelectCandidate}
              disabled={isSubmitting}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedCandidate && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          title="Konfirmasi Pilihan Suara Anda"
          message={`Anda akan memberikan suara untuk Pasangan Calon No. ${selectedCandidate.candidate_number} (${selectedCandidate.ketua_name} & ${selectedCandidate.wakil_name}). Pilihan ini bersifat final, rahasia, dan TIDAK dapat diubah kembali. Apakah Anda yakin dengan pilihan ini?`}
          confirmLabel="Ya, Berikan Suara Saya"
          cancelLabel="Kembali & Cek Lagi"
          variant="primary"
          isLoading={isSubmitting}
          onConfirm={handleConfirmVote}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}

      {/* 4-Second Success Modal */}
      <VoteSuccessModal
        isOpen={isSuccessModalOpen}
        candidateNumber={selectedCandidate?.candidate_number}
        candidateName={selectedCandidate ? `${selectedCandidate.ketua_name} & ${selectedCandidate.wakil_name}` : undefined}
        onFinish={handleFinishSuccess}
      />

    </div>
  );
};
