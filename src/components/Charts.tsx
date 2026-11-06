import React from 'react';
import { VoteResult } from '../types';

interface ChartsProps {
  results: VoteResult[];
  totalVotes: number;
}

const CANDIDATE_COLORS = [
  { bg: 'bg-indigo-600', fill: '#4f46e5', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { bg: 'bg-emerald-600', fill: '#059669', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-amber-500', fill: '#d97706', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { bg: 'bg-rose-600', fill: '#e11d48', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { bg: 'bg-cyan-600', fill: '#0891b2', light: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
];

export const ResultsChart: React.FC<ChartsProps> = ({ results, totalVotes }) => {
  // Sort by candidate number
  const sorted = [...results].sort((a, b) => a.candidate.candidate_number - b.candidate.candidate_number);

  // Find max votes for relative bar sizing
  const maxVotes = Math.max(...sorted.map(r => r.votes), 1);

  // SVG Donut calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. Bar Chart: Perolehan Suara */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Grafik Perolehan Suara</h3>
              <p className="text-xs text-slate-500">Perbandingan perolehan suara masing-masing paslon</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Suara Sah</span>
              <span className="text-base font-bold text-slate-900 font-mono tabular-nums">{totalVotes}</span>
            </div>
          </div>

          <div className="space-y-5 mt-6">
            {sorted.map((item, index) => {
              const color = CANDIDATE_COLORS[index % CANDIDATE_COLORS.length];
              const relativeWidth = totalVotes > 0 ? (item.votes / maxVotes) * 100 : 0;
              return (
                <div key={item.candidate.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md font-mono font-bold text-[11px] flex items-center justify-center text-white ${color.bg}`}>
                        {item.candidate.candidate_number}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {item.candidate.ketua_name} &amp; {item.candidate.wakil_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="font-bold text-slate-900 text-sm">{item.votes} suara</span>
                      <span className="text-slate-500 font-medium w-14 text-right">({item.percentage}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${color.bg}`}
                      style={{ width: `${Math.max(relativeWidth, item.votes > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Data diperbarui secara otomatis secara real-time</span>
          <span className="font-medium text-slate-700">Skala 100% Suara Masuk</span>
        </div>
      </div>

      {/* 2. Donut Distribution Chart */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Distribusi Persentase</h3>
          <p className="text-xs text-slate-500 mb-4">Porsi persentase suara per kandidat</p>

          <div className="relative flex items-center justify-center my-4">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="20"
                fill="transparent"
              />

              {totalVotes === 0 ? (
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-200"
                  strokeWidth="20"
                  strokeDasharray={`${circumference} ${circumference}`}
                  fill="transparent"
                />
              ) : (
                sorted.map((item, index) => {
                  const color = CANDIDATE_COLORS[index % CANDIDATE_COLORS.length];
                  const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                  const rotation = (accumulatedPercent / 100) * 360;
                  accumulatedPercent += item.percentage;

                  return (
                    <circle
                      key={item.candidate.id}
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={color.fill}
                      strokeWidth="20"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{
                        transformOrigin: 'center',
                        transform: `rotate(${rotation}deg)`,
                        transition: 'stroke-dashoffset 0.8s ease',
                      }}
                      fill="transparent"
                    />
                  );
                })
              )}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">Total Suara</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">{totalVotes}</span>
              <span className="text-[10px] text-slate-500">Pemilih</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
          {sorted.map((item, index) => {
            const color = CANDIDATE_COLORS[index % CANDIDATE_COLORS.length];
            return (
              <div key={item.candidate.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${color.bg}`} />
                  <span className="text-slate-700 truncate max-w-[150px]">
                    Paslon {item.candidate.candidate_number}
                  </span>
                </div>
                <span className="font-mono font-bold tabular-nums text-slate-900">
                  {item.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
