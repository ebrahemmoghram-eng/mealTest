import React, { useState, useEffect } from 'react';
import { ActivityLevel, FitnessGoal, Gender, Language, UserProfile } from '../types';
import { translations } from '../translations';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateTargetMacros,
  calculateTargetWaterMl,
  getDefaultProfile,
} from '../utils/nutrition';
import { Sparkles, Check, User, HeartPulse, Scale, Flame, Droplets, Target, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  language: Language;
  existingProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onClose?: () => void;
  isFirstTime?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  language,
  existingProfile,
  onSave,
  onClose,
  isFirstTime = false,
}) => {
  const t = translations[language];

  const [name, setName] = useState('');
  const [age, setAge] = useState(26);
  const [gender, setGender] = useState<Gender>('male');
  const [weight, setWeight] = useState(72);
  const [height, setHeight] = useState(175);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<FitnessGoal>('lose_weight');

  // Custom targets overrides if user wants
  const [customCalorieTarget, setCustomCalorieTarget] = useState<number | null>(null);

  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name || '');
      setAge(existingProfile.age || 26);
      setGender(existingProfile.gender || 'male');
      setWeight(existingProfile.weight || 72);
      setHeight(existingProfile.height || 175);
      setActivityLevel(existingProfile.activityLevel || 'moderate');
      setGoal(existingProfile.goal || 'lose_weight');
      setCustomCalorieTarget(existingProfile.dailyCalorieTarget || null);
    }
  }, [existingProfile]);

  if (!isOpen) return null;

  // Real-time calculated metrics
  const bmr = calculateBMR(gender, weight, height, age);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calculatedCalorieTarget = calculateTargetCalories(tdee, goal);
  const finalCalorieTarget = customCalorieTarget ?? calculatedCalorieTarget;
  const calculatedWaterMl = calculateTargetWaterMl(weight, activityLevel);
  const macros = calculateTargetMacros(finalCalorieTarget, weight, goal);
  const bmiInfo = calculateBMI(weight, height);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      name: name.trim() || (language === 'ar' ? 'البطل' : 'Champion'),
      age: Number(age),
      gender,
      weight: Number(weight),
      height: Number(height),
      activityLevel,
      goal,
      dailyCalorieTarget: finalCalorieTarget,
      dailyWaterTargetMl: calculatedWaterMl,
      proteinTargetGrams: macros.proteinGrams,
      carbsTargetGrams: macros.carbsGrams,
      fatsTargetGrams: macros.fatsGrams,
      isProfileComplete: true,
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
    };
    onSave(profile);
  };

  const getBmiColor = (cat: string) => {
    switch (cat) {
      case 'normal':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'overweight':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'obese':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-sky-700 bg-sky-50 border-sky-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white relative shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs">
              <HeartPulse className="w-5 h-5 text-emerald-200" />
            </div>
            <span className="text-xs font-semibold tracking-wider text-emerald-100 uppercase">
              {isFirstTime ? t.welcomeTitle : t.editProfile}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isFirstTime ? t.onboardingTitle : t.editProfile}
          </h2>
          <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
            {t.onboardingSubtitle}
          </p>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t.nameLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400 font-medium text-sm transition-all"
              />
            </div>
          </div>

          {/* Gender & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.genderLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  👨 {t.male}
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  👩 {t.female}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.ageLabel}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-semibold text-sm"
                />
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  {language === 'ar' ? 'سنة' : 'yrs'}
                </span>
              </div>
            </div>
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.weightLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="250"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-semibold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.heightLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="240"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-semibold text-sm"
                />
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t.activityLevelLabel}
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium text-sm bg-white cursor-pointer"
            >
              <option value="sedentary">{t.sedentary}</option>
              <option value="light">{t.light}</option>
              <option value="moderate">{t.moderate}</option>
              <option value="active">{t.active}</option>
              <option value="very_active">{t.very_active}</option>
            </select>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t.goalLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(['lose_weight', 'maintain', 'muscle_gain', 'gain_weight'] as FitnessGoal[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGoal(g);
                    setCustomCalorieTarget(null); // reset custom override
                  }}
                  className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border text-start flex items-center justify-between transition-all cursor-pointer ${
                    goal === g
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-800 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{t[g]}</span>
                  {goal === g && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Recommendations Preview Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {language === 'ar' ? 'الاحتياج اليومي المحسوب لك بدقة' : 'Scientifically Computed Plan'}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getBmiColor(bmiInfo.categoryKey)}`}>
                BMI: {bmiInfo.bmi} ({t[bmiInfo.categoryKey]})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.dailyTargetLabel}</span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {finalCalorieTarget} <span className="text-xs font-medium text-slate-500">{t.kcalUnit}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{t.waterTargetLabel}</span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {calculatedWaterMl} <span className="text-xs font-medium text-slate-500">{t.mlUnit}</span>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                  <Target className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'ar' ? 'الماكروز اليومي' : 'Daily Macros'}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 flex justify-center gap-2">
                  <span className="text-emerald-700">P: {macros.proteinGrams}g</span>
                  <span className="text-amber-700">C: {macros.carbsGrams}g</span>
                  <span className="text-rose-700">F: {macros.fatsGrams}g</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isFirstTime && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
            )}
            <button
              type="submit"
              className="ms-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isFirstTime ? t.saveProfile : t.updateProfile}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
