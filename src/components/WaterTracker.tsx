import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Droplets, Plus, RotateCcw } from 'lucide-react';

interface WaterTrackerProps {
  currentMl: number;
  targetMl: number;
  language: Language;
  onAddWater: (amountMl: number) => void;
  onResetWater: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  currentMl,
  targetMl,
  language,
  onAddWater,
  onResetWater,
}) => {
  const t = translations[language];
  const percentage = Math.min(100, Math.round((currentMl / (targetMl || 2500)) * 100));
  const glassCount = (currentMl / 250).toFixed(1).replace('.0', '');

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs relative overflow-hidden">
      {/* Background soft wave decoration */}
      <div
        className="absolute bottom-0 inset-x-0 bg-cyan-50/50 transition-all duration-700 pointer-events-none"
        style={{ height: `${percentage}%` }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Metric Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <Droplets className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{t.waterIntake}</h3>
              <span className="text-xs font-bold text-cyan-700 bg-cyan-100/80 px-2 py-0.5 rounded-full">
                {percentage}%
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-sm">
                {(currentMl / 1000).toFixed(2)}L
              </span>
              <span>{t.waterOf}</span>
              <span>{(targetMl / 1000).toFixed(1)}L ({glassCount} {t.glassCount})</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddWater(250)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 active:scale-95 text-cyan-700 border border-cyan-200/80 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addGlass}</span>
          </button>

          <button
            onClick={() => onAddWater(500)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white text-xs font-bold shadow-xs shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addBottle}</span>
          </button>

          <button
            onClick={onResetWater}
            title={t.resetWater}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
