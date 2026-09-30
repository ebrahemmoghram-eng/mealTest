import React from 'react';
import { Language, LoggedMeal } from '../types';
import { translations } from '../translations';
import { X, Flame, Trash2, Heart, Clock, Utensils } from 'lucide-react';

interface MealDetailModalProps {
  meal: LoggedMeal | null;
  language: Language;
  onClose: () => void;
  onDelete: (mealId: string) => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  meal,
  language,
  onClose,
  onDelete,
}) => {
  const t = translations[language];

  if (!meal) return null;

  const timeFormatted = new Date(meal.timestamp).toLocaleTimeString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Photo or Header Graphic */}
        {meal.photoUrl ? (
          <div className="relative w-full h-52 sm:h-64 bg-slate-900">
            <img
              src={meal.photoUrl}
              alt={meal.nameEn}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                {t[meal.mealCategory]} · {timeFormatted}
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                {language === 'ar' ? meal.nameAr : meal.nameEn}
              </h3>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
                {t[meal.mealCategory]} · {timeFormatted}
              </span>
              <h3 className="text-xl font-bold mt-1">
                {language === 'ar' ? meal.nameAr : meal.nameEn}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Calorie & Health Score Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Flame className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  {t.calorieBalance}
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {meal.calories} <span className="text-xs font-bold text-slate-500">{t.kcalUnit}</span>
                </span>
              </div>
            </div>

            <div className="text-end">
              <span className="text-xs font-semibold text-slate-500 block">
                {t.healthScore}
              </span>
              <span className="text-base font-black text-emerald-700">
                {meal.healthScore} / 10
              </span>
            </div>
          </div>

          {/* Macros Chips */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 block">{t.protein}</span>
              <span className="text-sm font-black text-emerald-950 mt-0.5 block">{meal.protein}g</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[11px] font-bold text-amber-800 block">{t.carbs}</span>
              <span className="text-sm font-black text-amber-950 mt-0.5 block">{meal.carbs}g</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-[11px] font-bold text-rose-800 block">{t.fats}</span>
              <span className="text-sm font-black text-rose-950 mt-0.5 block">{meal.fats}g</span>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100">
              <span className="text-[11px] font-bold text-teal-800 block">{t.fiber}</span>
              <span className="text-sm font-black text-teal-950 mt-0.5 block">{meal.fiber}g</span>
            </div>
          </div>

          {/* Items Breakdown */}
          {meal.items && meal.items.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                {t.detectedItems}
              </span>
              <div className="space-y-1.5">
                {meal.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs border border-slate-100"
                  >
                    <span className="font-semibold text-slate-800">
                      {language === 'ar' ? it.nameAr : it.nameEn}
                    </span>
                    <span className="font-bold text-slate-900">
                      {it.calories} {t.kcalUnit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dietitian Advice */}
          {(meal.adviceAr || meal.adviceEn) && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
              <Heart className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-blue-900 block mb-0.5">
                  {t.dietitianAdvice}
                </span>
                <p className="text-xs text-blue-800/90 leading-relaxed">
                  {language === 'ar' ? meal.adviceAr : meal.adviceEn}
                </p>
              </div>
            </div>
          )}

          {/* Delete Action */}
          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t.confirmDelete)) {
                  onDelete(meal.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.delete}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
