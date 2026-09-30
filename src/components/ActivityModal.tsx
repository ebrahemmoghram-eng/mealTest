import React, { useState } from 'react';
import { ActivityIntensity, ActivityType, Language, LoggedActivity, UserProfile } from '../types';
import { translations } from '../translations';
import { estimateCaloriesBurned } from '../utils/nutrition';
import {
  Activity,
  Flame,
  X,
  Check,
  Footprints,
  Dumbbell,
  Timer,
  Bike,
  Waves,
  Zap,
  Trophy,
} from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  userProfile: UserProfile;
  onAddActivity: (activity: LoggedActivity) => void;
}

const ACTIVITIES_LIST: Array<{
  type: ActivityType;
  icon: any;
}> = [
  { type: 'walking', icon: Footprints },
  { type: 'running', icon: Activity },
  { type: 'cycling', icon: Bike },
  { type: 'gym', icon: Dumbbell },
  { type: 'swimming', icon: Waves },
  { type: 'hiit', icon: Zap },
  { type: 'football', icon: Trophy },
  { type: 'yoga', icon: Activity },
];

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  language,
  userProfile,
  onAddActivity,
}) => {
  const t = translations[language];

  const [selectedType, setSelectedType] = useState<ActivityType>('walking');
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<ActivityIntensity>('moderate');
  const [steps, setSteps] = useState<number | undefined>(undefined);

  if (!isOpen) return null;

  const estimatedBurn = estimateCaloriesBurned(
    selectedType,
    intensity,
    duration,
    userProfile.weight || 70
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const activity: LoggedActivity = {
      id: 'act_' + Date.now(),
      type: selectedType,
      titleAr: t[selectedType],
      titleEn: translations.en[selectedType],
      durationMinutes: Number(duration),
      caloriesBurned: estimatedBurn,
      intensity,
      steps: steps ? Number(steps) : undefined,
      timestamp: new Date().toISOString(),
    };

    onAddActivity(activity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">{t.activityTitle}</h3>
              <p className="text-xs text-orange-100">{t.activitySubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-5">
          {/* Select Activity Type Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              {t.activityType}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ACTIVITIES_LIST.map(({ type, icon: IconComponent }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedType(type);
                    if (type === 'walking' && !steps) {
                      setSteps(Math.round(duration * 100));
                    }
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedType === type
                      ? 'bg-orange-50 border-orange-500 text-orange-800 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${
                      selectedType === type ? 'text-orange-600' : 'text-slate-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-center leading-tight">
                    {t[type]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.duration}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="360"
                  required
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-slate-800 font-bold text-sm"
                />
                <span className="absolute end-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                  {t.minUnit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.intensity}
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['light', 'moderate', 'vigorous'] as ActivityIntensity[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensity(lvl)}
                    className={`py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      intensity === lvl
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {lvl === 'light'
                      ? t.lightIntensity
                      : lvl === 'moderate'
                      ? t.moderateIntensity
                      : t.vigorousIntensity}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Steps count if walking/running */}
          {(selectedType === 'walking' || selectedType === 'running') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.stepsLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={steps || ''}
                  onChange={(e) => setSteps(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder={language === 'ar' ? 'مثال: 4500 خطوة' : 'e.g. 4500 steps'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-slate-800 font-medium text-sm"
                />
              </div>
            </div>
          )}

          {/* Estimated Calories Burned Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-orange-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-600 block">
                  {t.estimatedBurn}
                </span>
                <span className="text-[11px] text-slate-400">
                  {userProfile.weight} {t.kgUnit} · {duration} {t.minUnit}
                </span>
              </div>
            </div>

            <div className="text-end">
              <span className="text-2xl font-black text-orange-600">
                {estimatedBurn}
              </span>
              <span className="text-xs font-semibold text-slate-500 ms-1">
                {t.kcalUnit}
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveActivity}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
