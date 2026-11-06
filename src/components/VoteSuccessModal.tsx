import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

interface VoteSuccessModalProps {
  isOpen: boolean;
  onFinish: () => void;
  candidateName?: string;
  candidateNumber?: number;
}

export const VoteSuccessModal: React.FC<VoteSuccessModalProps> = ({
  isOpen,
  onFinish,
  candidateName,
  candidateNumber,
}) => {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(4);
      return;
    }

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // ignore
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onFinish]);

  if (!isOpen) return null;

  const progressPercentage = ((4 - countdown) / 4) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-100 transform transition-all">
        
        {/* Animated Badge */}
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-xs">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        {/* Message */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Suara Anda Berhasil Dicatat!
        </h2>
        
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
          Suara Anda berhasil dicatat, terima kasih telah berpartisipasi dalam Pemilihan Ketua &amp; Wakil Ketua OSIS.
        </p>

        {candidateNumber && candidateName && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6 text-xs text-slate-600">
            Pilihan: <span className="font-semibold text-slate-900">Paslon No. {candidateNumber} ({candidateName})</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 rounded-lg py-2 px-3 mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Asas LUBER: Pilihan Anda aman dan dirahasiakan</span>
        </div>

        {/* 4-Second Countdown Indicator */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Mengalihkan otomatis ke login</span>
            <span className="font-bold tabular-nums text-indigo-600">{countdown} detik</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <button
          onClick={onFinish}
          className="mt-4 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:underline"
        >
          Klik di sini jika tidak beralih otomatis
        </button>

      </div>
    </div>
  );
};
