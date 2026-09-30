import React, { useState, useRef, useEffect } from 'react';
import { Language, MealCategory, MealAnalysisResult, LoggedMeal, FoodItemBreakdown } from '../types';
import { translations } from '../translations';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  X,
  Check,
  Flame,
  Activity,
  Heart,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  Info,
  Footprints,
  Bike,
} from 'lucide-react';

interface CameraMealScannerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onMealLogged: (meal: LoggedMeal) => void;
}

// Built-in high-quality SVG demo meal images encoded as clean base64 data URLs
const SAMPLE_MEALS = [
  {
    id: 'salmon_salad',
    nameAr: 'سلطة سلمون مشوي وأفوكادو',
    nameEn: 'Grilled Salmon & Avocado Salad',
    mealCategory: 'lunch' as MealCategory,
    notes: 'مع زيت زيتون وليمون، غني بالأوميغا 3',
    // Realistic SVG data URL for instant testing
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23f1f5f9"/></linearGradient><linearGradient id="salmon" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fb923c"/><stop offset="100%" stop-color="%23f97316"/></linearGradient></defs><rect width="600" height="400" fill="url(%23bg)"/><circle cx="300" cy="200" r="160" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="8"/><ellipse cx="300" cy="200" rx="140" ry="140" fill="%23ecfdf5"/><circle cx="260" cy="180" r="50" fill="%2384cc16" opacity="0.6"/><circle cx="340" cy="220" r="45" fill="%2322c55e" opacity="0.6"/><rect x="230" y="160" width="140" height="70" rx="20" fill="url(%23salmon)" stroke="%23ea580c" stroke-width="3"/><line x1="250" y1="170" x2="350" y2="170" stroke="%23fff" stroke-width="2" opacity="0.5"/><line x1="250" y1="190" x2="350" y2="190" stroke="%23fff" stroke-width="2" opacity="0.5"/><line x1="250" y1="210" x2="350" y2="210" stroke="%23fff" stroke-width="2" opacity="0.5"/><circle cx="360" cy="150" r="22" fill="%23bef264"/><circle cx="230" cy="230" r="20" fill="%23f43f5e"/><text x="300" y="320" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f766e" text-anchor="middle">Grilled Salmon &amp; Fresh Salad</text></svg>`,
  },
  {
    id: 'chicken_rice',
    nameAr: 'صدر دجاج مشوي مع أرز بسمتي وخضار',
    nameEn: 'Grilled Chicken Breast with Basmati Rice',
    mealCategory: 'dinner' as MealCategory,
    notes: 'صدر دجاج بدون جلد، أرز مسلوق، بروكلي',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="chicken" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d97706"/><stop offset="100%" stop-color="%23b45309"/></linearGradient></defs><rect width="600" height="400" fill="%23f8fafc"/><circle cx="300" cy="200" r="160" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="8"/><circle cx="250" cy="200" r="75" fill="%23fef3c7" stroke="%23fde68a" stroke-width="2"/><ellipse cx="340" cy="180" rx="65" ry="45" fill="url(%23chicken)"/><circle cx="340" cy="240" r="35" fill="%2315803d"/><circle cx="365" cy="235" r="25" fill="%2316a34a"/><text x="300" y="330" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23334155" text-anchor="middle">Grilled Chicken, Rice &amp; Broccoli</text></svg>`,
  },
  {
    id: 'avocado_toast',
    nameAr: 'توست حبوب كاملة مع أفوكادو وبيض مسلوق',
    nameEn: 'Avocado Toast with Poached Egg',
    mealCategory: 'breakfast' as MealCategory,
    notes: 'خبز بر، بيض، رشة سمسم وبذور شيا',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f8fafc"/><circle cx="300" cy="200" r="150" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="6"/><rect x="220" y="140" width="160" height="120" rx="15" fill="%2392400e"/><rect x="230" y="150" width="140" height="100" rx="10" fill="%2365a30d"/><circle cx="300" cy="200" r="35" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/><circle cx="300" cy="200" r="20" fill="%23eab308"/><text x="300" y="320" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23475569" text-anchor="middle">Avocado Toast &amp; Egg</text></svg>`,
  },
];

export const CameraMealScanner: React.FC<CameraMealScannerProps> = ({
  isOpen,
  onClose,
  language,
  onMealLogged,
}) => {
  const t = translations[language];

  // Camera & Image state
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Meal selection options
  const [mealCategory, setMealCategory] = useState<MealCategory>('lunch');
  const [notes, setNotes] = useState('');

  // Scanning & Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResult | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [scanError, setScanError] = useState<string | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup camera stream when modal closes or unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setSelectedImage(null);
      setAnalysisResult(null);
      setIsAnalyzing(false);
      setScanError(null);
    }
  }, [isOpen]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  const startLiveCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCameraStream();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsLiveCameraActive(true);
      setFacingMode(mode);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(t.cameraStartError);
      setIsLiveCameraActive(false);
    }
  };

  const toggleCameraFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startLiveCamera(nextMode);
  };

  const captureLiveSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCameraStream();
      setAnalysisResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        stopCameraStream();
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSampleMeal = (sample: typeof SAMPLE_MEALS[0]) => {
    setSelectedImage(sample.svg);
    setMealCategory(sample.mealCategory);
    setNotes(sample.notes);
    stopCameraStream();
    setAnalysisResult(null);
  };

  const retakeImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setPortionMultiplier(1);
    setScanError(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setScanError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mealType: mealCategory,
          notes: notes.trim(),
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data: MealAnalysisResult = await response.json();
      setAnalysisResult(data);
      setPortionMultiplier(1);
    } catch (err: any) {
      console.error('Failed to analyze meal with Gemini API:', err);
      setScanError(
        language === 'ar'
          ? 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.'
          : 'Error connecting to AI service. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddMealToLog = () => {
    if (!analysisResult) return;

    const multiplier = portionMultiplier;
    const finalCalories = Math.round(analysisResult.totalCalories * multiplier);
    const finalProtein = Math.round(analysisResult.proteinGrams * multiplier);
    const finalCarbs = Math.round(analysisResult.carbsGrams * multiplier);
    const finalFats = Math.round(analysisResult.fatsGrams * multiplier);
    const finalFiber = Math.round(analysisResult.fiberGrams * multiplier);

    const loggedMeal: LoggedMeal = {
      id: 'meal_' + Date.now(),
      mealCategory,
      nameAr: analysisResult.mealNameAr,
      nameEn: analysisResult.mealNameEn,
      calories: finalCalories,
      protein: finalProtein,
      carbs: finalCarbs,
      fats: finalFats,
      fiber: finalFiber,
      healthScore: analysisResult.healthScore,
      healthTagAr: analysisResult.healthTagAr,
      healthTagEn: analysisResult.healthTagEn,
      photoUrl: selectedImage || undefined,
      timestamp: new Date().toISOString(),
      items: analysisResult.items?.map((item) => ({
        ...item,
        calories: Math.round(item.calories * multiplier),
        weightGrams: item.weightGrams ? Math.round(item.weightGrams * multiplier) : undefined,
      })),
      adviceAr: analysisResult.dietitianAdviceAr,
      adviceEn: analysisResult.dietitianAdviceEn,
    };

    onMealLogged(loggedMeal);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{t.cameraTitle}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Gemini AI
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{t.cameraSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Meal Category & Notes Header */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.mealTypePrompt}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMealCategory(cat)}
                    className={`py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer text-center ${
                      mealCategory === cat
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {t[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.optionalNotes}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          {/* Camera / Image Upload View Area */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[360px]">
            {/* Live Camera Viewfinder */}
            {isLiveCameraActive && (
              <div className="relative w-full h-[320px] sm:h-[400px] bg-black">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Camera Viewfinder Overlay Target Grid */}
                <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="text-white/80 text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xs">
                    {language === 'ar' ? 'ضع الوجبة داخل الإطار' : 'Align food within frame'}
                  </div>
                </div>

                {/* Live Controls */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
                  <button
                    onClick={toggleCameraFacingMode}
                    className="p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                    title={t.switchCamera}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={captureLiveSnapshot}
                    className="w-16 h-16 rounded-full bg-white ring-4 ring-emerald-500/60 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center cursor-pointer"
                    title={t.capturePhoto}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <Camera className="w-6 h-6" />
                    </div>
                  </button>

                  <button
                    onClick={stopCameraStream}
                    className="p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Selected Image Preview */}
            {!isLiveCameraActive && selectedImage && (
              <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-900 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Meal preview"
                  className="w-full h-full object-contain"
                />

                {/* Scanning Laser Animation overlay when analyzing */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-2xs flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                      <Sparkles className="w-8 h-8 text-emerald-300 animate-pulse" />
                    </div>
                    <p className="text-white font-bold text-base sm:text-lg">{t.analyzingMeal}</p>
                    <p className="text-emerald-200 text-xs sm:text-sm mt-1 max-w-md">{t.analyzingSub}</p>
                  </div>
                )}

                {!isAnalyzing && (
                  <button
                    onClick={retakeImage}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t.retake}</span>
                  </button>
                )}
              </div>
            )}

            {/* Empty State: Choose camera or gallery */}
            {!isLiveCameraActive && !selectedImage && (
              <div className="p-8 sm:p-12 text-center text-slate-300 space-y-6 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{t.cameraTitle}</h4>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    {t.cameraSubtitle}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => startLiveCamera('environment')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.openLiveCamera}</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>{t.chooseFromGallery}</span>
                  </button>
                </div>

                {cameraError && (
                  <p className="text-amber-400 text-xs bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl">
                    {cameraError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Hidden File Input for Gallery / Camera Picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Instant Demo Presets Section */}
          {!selectedImage && !isLiveCameraActive && (
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                {t.trySampleTitle}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_MEALS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => selectSampleMeal(sample)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 text-start transition-all cursor-pointer group flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white">
                      <img src={sample.svg} alt={sample.nameEn} className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-xs text-slate-800 block truncate group-hover:text-emerald-700">
                        {language === 'ar' ? sample.nameAr : sample.nameEn}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {sample.notes}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button: Analyze Image if selected and not yet analyzed */}
          {selectedImage && !analysisResult && (
            <div className="pt-2">
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 text-emerald-200" />
                <span>{isAnalyzing ? t.analyzingMeal : t.analyzeButton}</span>
              </button>
            </div>
          )}

          {/* Error Message if Scan Failed */}
          {scanError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {/* ANALYSIS RESULTS CARD */}
          {analysisResult && (
            <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 via-white to-white p-5 sm:p-6 space-y-6 shadow-sm">
              {/* Title & Calories Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      {language === 'ar' ? analysisResult.healthTagAr : analysisResult.healthTagEn}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {t.healthScore}: {analysisResult.healthScore} / 10
                    </span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {language === 'ar' ? analysisResult.mealNameAr : analysisResult.mealNameEn}
                  </h4>
                </div>

                <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shrink-0 shadow-sm shadow-emerald-600/20">
                  <Flame className="w-7 h-7 text-amber-300 animate-pulse" />
                  <div>
                    <div className="text-2xl sm:text-3xl font-black leading-none">
                      {Math.round(analysisResult.totalCalories * portionMultiplier)}
                    </div>
                    <div className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider mt-0.5">
                      {t.kcalUnit}
                    </div>
                  </div>
                </div>
              </div>

              {/* Portion Multiplier Selector */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-xs font-bold text-slate-700">{t.portionMultiplier}:</span>
                <div className="flex items-center gap-1.5">
                  {[0.5, 0.75, 1, 1.25, 1.5].map((factor) => (
                    <button
                      key={factor}
                      type="button"
                      onClick={() => setPortionMultiplier(factor)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        portionMultiplier === factor
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {factor}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Macronutrients Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <span className="text-xs font-bold text-emerald-800 block">{t.protein}</span>
                  <span className="text-lg font-black text-emerald-950 mt-1 block">
                    {Math.round(analysisResult.proteinGrams * portionMultiplier)} {t.gramsUnit}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                  <span className="text-xs font-bold text-amber-800 block">{t.carbs}</span>
                  <span className="text-lg font-black text-amber-950 mt-1 block">
                    {Math.round(analysisResult.carbsGrams * portionMultiplier)} {t.gramsUnit}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-center">
                  <span className="text-xs font-bold text-rose-800 block">{t.fats}</span>
                  <span className="text-lg font-black text-rose-950 mt-1 block">
                    {Math.round(analysisResult.fatsGrams * portionMultiplier)} {t.gramsUnit}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-center">
                  <span className="text-xs font-bold text-teal-800 block">{t.fiber}</span>
                  <span className="text-lg font-black text-teal-950 mt-1 block">
                    {Math.round(analysisResult.fiberGrams * portionMultiplier)} {t.gramsUnit}
                  </span>
                </div>
              </div>

              {/* Detected Items & Portions Breakdown */}
              {analysisResult.items && analysisResult.items.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                    {t.detectedItems}
                  </span>
                  <div className="space-y-2">
                    {analysisResult.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-semibold text-slate-800">
                            {language === 'ar' ? item.nameAr : item.nameEn}
                          </span>
                          <span className="text-slate-400 text-xs">
                            ({item.portionSize} {item.weightGrams ? `· ${Math.round(item.weightGrams * portionMultiplier)}g` : ''})
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0">
                          {Math.round(item.calories * portionMultiplier)} {t.kcalUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietitian Advice */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <Heart className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-blue-900 block mb-0.5">
                    {t.dietitianAdvice}
                  </span>
                  <p className="text-xs sm:text-sm text-blue-800/90 leading-relaxed">
                    {language === 'ar' ? analysisResult.dietitianAdviceAr : analysisResult.dietitianAdviceEn}
                  </p>
                </div>
              </div>

              {/* Burn Time Equivalent */}
              {analysisResult.burnTimeEstimates && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    {t.burnedEquivalent}
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <Footprints className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                      <span className="font-black text-slate-800 block">
                        {Math.round(analysisResult.burnTimeEstimates.walkingMinutes * portionMultiplier)}
                      </span>
                      <span className="text-[10px] text-slate-500">{t.walkMin}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <Activity className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                      <span className="font-black text-slate-800 block">
                        {Math.round(analysisResult.burnTimeEstimates.runningMinutes * portionMultiplier)}
                      </span>
                      <span className="text-[10px] text-slate-500">{t.runMin}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <Bike className="w-4 h-4 mx-auto text-cyan-600 mb-1" />
                      <span className="font-black text-slate-800 block">
                        {Math.round(analysisResult.burnTimeEstimates.cyclingMinutes * portionMultiplier)}
                      </span>
                      <span className="text-[10px] text-slate-500">{t.cycleMin}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Add to Daily Log CTA */}
              <button
                type="button"
                onClick={handleAddMealToLog}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>{t.addToLog}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
