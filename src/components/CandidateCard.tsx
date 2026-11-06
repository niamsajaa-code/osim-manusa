import React, { useState } from 'react';
import { Candidate } from '../types';
import { parseMisi } from '../services/electionService';
import { ChevronDown, ChevronUp, Check, Award, Quote } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onSelect?: (candidate: Candidate) => void;
  showVoteAction?: boolean;
  isVotingBooth?: boolean;
  disabled?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onSelect,
  showVoteAction = false,
  isVotingBooth = false,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const misiList = parseMisi(candidate.misi);

  const fallbackPhoto = `/src/assets/images/candidate_paslon_satu_1792395944411.jpg`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative group">
      
      {/* Top Banner & Number Badge */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={candidate.photo_url || fallbackPhoto}
          alt={`Paslon ${candidate.candidate_number}: ${candidate.ketua_name} & ${candidate.wakil_name}`}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackPhoto;
          }}
        />

        {/* Number Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white font-mono font-bold text-lg sm:text-xl w-11 h-11 rounded-xl flex items-center justify-center shadow-md border border-white/20">
          {candidate.candidate_number < 10 ? `0${candidate.candidate_number}` : candidate.candidate_number}
        </div>

        {/* Paslon Header Label */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs">
          Paslon #{candidate.candidate_number}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Candidate Names */}
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-0.5">
              Calon Ketua &amp; Wakil Ketua
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {candidate.ketua_name}
            </h3>
            <p className="text-sm font-medium text-slate-600">
              &amp; {candidate.wakil_name}
            </p>
          </div>

          {/* Slogan */}
          {candidate.slogan && (
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 mb-4 text-xs text-slate-700 italic flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>&ldquo;{candidate.slogan}&rdquo;</span>
            </div>
          )}

          {/* Visi preview */}
          <div className="text-xs text-slate-600 mb-3">
            <span className="font-semibold text-slate-800">Visi: </span>
            <span className="line-clamp-2">{candidate.visi}</span>
          </div>

          {/* Accordion Visi & Misi */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between py-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors border-t border-slate-100"
          >
            <span>{isExpanded ? 'Tutup Detail Visi & Misi' : 'Lihat Visi & Misi Lengkap'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-xs animate-fade-in">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Visi:</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {candidate.visi}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Misi:</h4>
                <ul className="space-y-1.5 text-slate-600 pl-1">
                  {misiList.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600 font-mono text-[11px] shrink-0 mt-0.5">
                        {idx + 1}.
                      </span>
                      <span className="leading-relaxed">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Vote Button */}
        {showVoteAction && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onSelect && onSelect(candidate)}
              disabled={disabled}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-xs ${
                disabled
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white hover:shadow-indigo-100'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isVotingBooth ? `Pilih Paslon No. ${candidate.candidate_number}` : 'Pilih Kandidat'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
