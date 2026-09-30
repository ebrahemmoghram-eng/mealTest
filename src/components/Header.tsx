import React from 'react';
import { Language, UserProfile } from '../types';
import { translations } from '../translations';
import { Flame, Globe, User, Activity, Sparkles } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userProfile: UserProfile | null;
  onOpenProfile: () => void;
  onOpenScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  userProfile,
  onOpenProfile,
  onOpenScanner,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white shadow-md shadow-emerald-500/20">
            <Flame className="w-6 h-6 animate-pulse" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white ring-2 ring-white">
              AI
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                MOmeter
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Scan Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs sm:text-sm shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{t.scanMeal}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* User Profile Avatar / Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 text-slate-700 text-xs sm:text-sm font-medium transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <span className="hidden md:inline font-semibold text-slate-800 max-w-[120px] truncate">
              {userProfile?.name || t.editProfile}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
