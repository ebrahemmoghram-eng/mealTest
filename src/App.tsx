import React, { useState, useEffect } from 'react';
import { DayRecord, Language, LoggedActivity, LoggedMeal, MealCategory, UserProfile } from './types';
import { translations } from './translations';
import {
  clearAllAppData,
  loadLanguage,
  loadTodayRecord,
  loadUserProfile,
  saveLanguage,
  saveTodayRecord,
  saveUserProfile,
} from './utils/storage';
import { Header } from './components/Header';
import { OnboardingModal } from './components/OnboardingModal';
import { CameraMealScanner } from './components/CameraMealScanner';
import { ActivityModal } from './components/ActivityModal';
import { MealDetailModal } from './components/MealDetailModal';
import { WaterTracker } from './components/WaterTracker';
import { DailyStats } from './components/DailyStats';
import {
  Camera,
  Activity,
  Plus,
  Utensils,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  Trash2,
} from 'lucide-react';

export default function App() {
  // Global Language state
  const [language, setLanguage] = useState<Language>('ar');

  // User Profile state (persisted)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Today's Day Record (meals, activities, water)
  const [todayRecord, setTodayRecord] = useState<DayRecord>({
    date: new Date().toISOString().split('T')[0],
    waterMl: 500,
    meals: [],
    activities: [],
  });

  // Modal open states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [selectedMealDetail, setSelectedMealDetail] = useState<LoggedMeal | null>(null);

  // Load state on mount
  useEffect(() => {
    const savedLang = loadLanguage();
    setLanguage(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';

    const savedProfile = loadUserProfile();
    if (savedProfile) {
      setUserProfile(savedProfile);
    }

    const savedToday = loadTodayRecord();
    setTodayRecord(savedToday);
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    saveLanguage(newLang);
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
    setIsProfileModalOpen(false);
  };

  // Add meal logged from AI camera scanner
  const handleMealLogged = (meal: LoggedMeal) => {
    const updatedMeals = [meal, ...todayRecord.meals];
    const updatedRecord: DayRecord = {
      ...todayRecord,
      meals: updatedMeals,
    };
    setTodayRecord(updatedRecord);
    saveTodayRecord(updatedRecord);
  };

  // Delete meal
  const handleDeleteMeal = (mealId: string) => {
    const updatedMeals = todayRecord.meals.filter((m) => m.id !== mealId);
    const updatedRecord: DayRecord = {
      ...todayRecord,
      meals: updatedMeals,
    };
    setTodayRecord(updatedRecord);
    saveTodayRecord(updatedRecord);
  };

  // Add physical activity
  const handleAddActivity = (activity: LoggedActivity) => {
    const updatedActivities = [activity, ...todayRecord.activities];
    const updatedRecord: DayRecord = {
      ...todayRecord,
      activities: updatedActivities,
    };
    setTodayRecord(updatedRecord);
    saveTodayRecord(updatedRecord);
  };

  // Delete activity
  const handleDeleteActivity = (actId: string) => {
    const updatedActivities = todayRecord.activities.filter((a) => a.id !== actId);
    const updatedRecord: DayRecord = {
      ...todayRecord,
      activities: updatedActivities,
    };
    setTodayRecord(updatedRecord);
    saveTodayRecord(updatedRecord);
  };

  // Water tracking actions
  const handleAddWater = (amountMl: number) => {
    const newWater = (todayRecord.waterMl || 0) + amountMl;
    const updatedRecord: DayRecord = {
      ...todayRecord,
      waterMl: newWater,
    };
    setTodayRecord(updatedRecord);
    saveTodayRecord(updatedRecord);
  };

  const handleResetWater = () => {
    const updatedRecord: DayRecord = {
      ...todayRecord,
      waterMl: 0,
    };
    setTodayRecord(updatedRecord);
    saveTodayRecord(updatedRecord);
  };

  const handleResetAll = () => {
    const t = translations[language];
    if (window.confirm(t.confirmDelete)) {
      clearAllAppData();
      window.location.reload();
    }
  };

  const t = translations[language];

  // Group meals by category
  const mealCategories: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Onboarding Welcome Banner if no profile yet */}
        {(!userProfile || !userProfile.isProfileComplete) && (
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20 flex flex-col sm:flex-row sm:items-center justify-between gap-5 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.welcomeTitle}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t.onboardingTitle}
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
                {t.onboardingSubtitle}
              </p>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 active:scale-95 text-emerald-800 font-bold text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              {t.saveProfile}
            </button>
          </div>
        )}

        {/* Daily Stats (Calorie Balance & Macros) */}
        {userProfile && (
          <DailyStats
            userProfile={userProfile}
            meals={todayRecord.meals}
            activities={todayRecord.activities}
            language={language}
          />
        )}

        {/* Quick Action Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Snap Meal Card */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-700/20 transition-all active:scale-98 cursor-pointer flex items-center justify-between text-start group"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
                <Camera className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
                  AI Food Vision
                </span>
                <span className="text-base sm:text-lg font-black block">
                  {t.scanMeal}
                </span>
                <span className="text-xs text-emerald-100/80 block mt-0.5">
                  {language === 'ar' ? 'صوّر طبقك واعرف سعراته بدقة' : 'Snap your meal to calculate calories'}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Plus className="w-5 h-5" />
            </div>
          </button>

          {/* Log Physical Activity Card */}
          <button
            onClick={() => setIsActivityOpen(true)}
            className="p-5 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-600/20 transition-all active:scale-98 cursor-pointer flex items-center justify-between text-start group"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
                <Activity className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-orange-200 uppercase tracking-wider block">
                  Burn Tracker
                </span>
                <span className="text-base sm:text-lg font-black block">
                  {t.logActivity}
                </span>
                <span className="text-xs text-orange-100/80 block mt-0.5">
                  {language === 'ar' ? 'سجل تمارينك واحسب السعرات المحروقة' : 'Track your workout & burned calories'}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Plus className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Water Intake Tracker */}
        <WaterTracker
          currentMl={todayRecord.waterMl || 0}
          targetMl={userProfile?.dailyWaterTargetMl || 2500}
          language={language}
          onAddWater={handleAddWater}
          onResetWater={handleResetWater}
        />

        {/* Today's Meals Timeline & Feed */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{t.allMeals}</h3>
                <span className="text-xs text-slate-400">
                  {todayRecord.meals.length} {language === 'ar' ? 'وجبة مسجلة اليوم' : 'meals logged today'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.scanMeal}</span>
            </button>
          </div>

          {todayRecord.meals.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-slate-600 font-semibold text-sm max-w-md mx-auto">
                {t.noMealsYet}
              </p>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>{t.scanMeal}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {todayRecord.meals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => setSelectedMealDetail(meal)}
                  className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-500/80 bg-white hover:bg-emerald-50/20 transition-all cursor-pointer flex items-center gap-3.5 group shadow-2xs"
                >
                  {/* Photo or Icon */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 relative">
                    {meal.photoUrl ? (
                      <img
                        src={meal.photoUrl}
                        alt={meal.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Utensils className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Meal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <span className="font-bold text-emerald-700">
                        {t[meal.mealCategory]}
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(meal.timestamp).toLocaleTimeString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 truncate mt-0.5 group-hover:text-emerald-700 transition-colors">
                      {language === 'ar' ? meal.nameAr : meal.nameEn}
                    </h4>

                    {/* Quick macros */}
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-1">
                      <span>P: {meal.protein}g</span>
                      <span>·</span>
                      <span>C: {meal.carbs}g</span>
                      <span>·</span>
                      <span>F: {meal.fats}g</span>
                    </div>
                  </div>

                  {/* Calories & Details Indicator */}
                  <div className="text-end shrink-0">
                    <div className="text-base font-black text-slate-900">
                      {meal.calories}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      {t.kcalUnit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Today's Activities Timeline */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{t.allActivities}</h3>
                <span className="text-xs text-slate-400">
                  {todayRecord.activities.length} {language === 'ar' ? 'نشاط مسجل اليوم' : 'activities today'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsActivityOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.logActivity}</span>
            </button>
          </div>

          {todayRecord.activities.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <p className="text-slate-600 font-semibold text-sm max-w-md mx-auto">
                {t.noActivitiesYet}
              </p>
              <button
                onClick={() => setIsActivityOpen(true)}
                className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t.logActivity}</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {todayRecord.activities.map((act) => (
                <div
                  key={act.id}
                  className="py-3.5 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {language === 'ar' ? act.titleAr : act.titleEn}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {act.durationMinutes} {t.minUnit}
                        {act.steps ? ` · ${act.steps.toLocaleString()} ${language === 'ar' ? 'خطوة' : 'steps'}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-end">
                      <span className="font-black text-orange-600 text-base">
                        -{act.caloriesBurned}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold ms-1">
                        {t.kcalUnit}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteActivity(act.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer info & Data control */}
        <footer className="pt-6 border-t border-slate-200/70 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>{t.privacyNote}</span>
          </div>

          <div>
            <button
              onClick={handleResetAll}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors underline cursor-pointer"
            >
              {t.clearAllData}
            </button>
          </div>
        </footer>
      </main>

      {/* MODALS */}
      {/* Onboarding / Profile Setup Modal */}
      <OnboardingModal
        isOpen={isProfileModalOpen || (!userProfile && true)}
        language={language}
        existingProfile={userProfile}
        onSave={handleSaveProfile}
        onClose={() => setIsProfileModalOpen(false)}
        isFirstTime={!userProfile}
      />

      {/* AI Camera Meal Scanner Modal */}
      <CameraMealScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        language={language}
        onMealLogged={handleMealLogged}
      />

      {/* Activity Logger Modal */}
      {userProfile && (
        <ActivityModal
          isOpen={isActivityOpen}
          onClose={() => setIsActivityOpen(false)}
          language={language}
          userProfile={userProfile}
          onAddActivity={handleAddActivity}
        />
      )}

      {/* Meal Detail Modal */}
      <MealDetailModal
        meal={selectedMealDetail}
        language={language}
        onClose={() => setSelectedMealDetail(null)}
        onDelete={handleDeleteMeal}
      />
    </div>
  );
}
