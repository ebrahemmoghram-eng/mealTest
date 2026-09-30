import React from 'react';
import { Language, LoggedActivity, LoggedMeal, UserProfile } from '../types';
import { translations } from '../translations';
import { Flame, Footprints, Target, Zap, ArrowDown, ArrowUp, Activity } from 'lucide-react';

interface DailyStatsProps {
  userProfile: UserProfile;
  meals: LoggedMeal[];
  activities: LoggedActivity[];
  language: Language;
}

export const DailyStats: React.FC<DailyStatsProps> = ({
  userProfile,
  meals,
  activities,
  language,
}) => {
  const t = translations[language];

  // Calorie calculations
  const calorieTarget = userProfile.dailyCalorieTarget || 2000;
  const caloriesConsumed = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const caloriesBurned = activities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
  const remaining = calorieTarget - caloriesConsumed + caloriesBurned;
  const isOver = remaining < 0;

  // Macros consumed
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFats = meals.reduce((sum, m) => sum + (m.fats || 0), 0);
  const totalFiber = meals.reduce((sum, m) => sum + (m.fiber || 0), 0);

  // Targets
  const targetProtein = userProfile.proteinTargetGrams || 120;
  const targetCarbs = userProfile.carbsTargetGrams || 220;
  const targetFats = userProfile.fatsTargetGrams || 65;

  const proteinPct = Math.min(100, Math.round((totalProtein / targetProtein) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / targetCarbs) * 100));
  const fatsPct = Math.min(100, Math.round((totalFats / targetFats) * 100));

  const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0);

  // Progress percentage for consumed out of target
  const consumedPct = Math.min(100, Math.round((caloriesConsumed / calorieTarget) * 100));

  return (
    <div className="space-y-4">
      {/* Primary Calorie Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Calorie Remaining Ring / Number */}
          <div className="flex items-center gap-5">
            {/* Visual Circular Gauge */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-700 ${
                    isOver ? 'stroke-rose-500' : 'stroke-emerald-500'
                  }`}
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * Math.min(100, consumedPct)) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isOver ? t.overTarget : t.remaining}
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    isOver ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {Math.abs(remaining)}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {t.kcalUnit}
                </span>
              </div>
            </div>

            {/* Title & Motivational note */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {t.todaySummary}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {userProfile.name ? `${userProfile.name}` : t.calorieBalance}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isOver
                  ? `${t.overTarget} ${Math.abs(remaining)} ${t.kcalUnit}`
                  : `${caloriesConsumed} ${t.kcalUnit} ${t.consumed} · ${caloriesBurned} ${t.kcalUnit} ${t.burned}`}
              </p>
            </div>
          </div>

          {/* Three Metric Pillars (Target, Consumed, Burned) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 border-t lg:border-t-0 lg:border-s border-slate-100 pt-4 lg:pt-0 lg:ps-6">
            {/* Target */}
            <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                <Target className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">{t.target}</span>
              </div>
              <div className="text-base sm:text-lg font-black text-slate-800">
                {calorieTarget}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">{t.kcalUnit}</div>
            </div>

            {/* Consumed */}
            <div className="text-center p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs mb-1">
                <ArrowDown className="w-3.5 h-3.5" />
                <span className="font-semibold">{t.consumed}</span>
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-950">
                {caloriesConsumed}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium">{t.kcalUnit}</div>
            </div>

            {/* Burned */}
            <div className="text-center p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center justify-center gap-1 text-amber-700 text-xs mb-1">
                <ArrowUp className="w-3.5 h-3.5" />
                <span className="font-semibold">{t.burned}</span>
              </div>
              <div className="text-base sm:text-lg font-black text-amber-950">
                {caloriesBurned}
              </div>
              <div className="text-[10px] text-amber-600 font-medium">{t.kcalUnit}</div>
            </div>
          </div>
        </div>

        {/* Macros Breakdown Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider">
              {t.macrosDistribution}
            </span>
            {totalSteps > 0 && (
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                {totalSteps.toLocaleString()} {language === 'ar' ? 'خطوة اليوم' : 'steps'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Protein */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800">{t.protein}</span>
                <span className="font-black text-slate-800">
                  {totalProtein} / {targetProtein}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPct}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-800">{t.carbs}</span>
                <span className="font-black text-slate-800">
                  {totalCarbs} / {targetCarbs}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${carbsPct}%` }}
                />
              </div>
            </div>

            {/* Fats */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-800">{t.fats}</span>
                <span className="font-black text-slate-800">
                  {totalFats} / {targetFats}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${fatsPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
