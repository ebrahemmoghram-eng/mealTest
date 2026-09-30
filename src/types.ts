export type Language = 'ar' | 'en';

export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type FitnessGoal = 'lose_weight' | 'maintain' | 'gain_weight' | 'muscle_gain';

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  weight: number; // in kg
  height: number; // in cm
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dailyCalorieTarget: number;
  dailyWaterTargetMl: number;
  proteinTargetGrams: number;
  carbsTargetGrams: number;
  fatsTargetGrams: number;
  isProfileComplete: boolean;
  createdAt: string;
}

export interface FoodItemBreakdown {
  nameAr: string;
  nameEn: string;
  portionSize: string;
  weightGrams?: number;
  calories: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatsGrams?: number;
}

export interface MealAnalysisResult {
  mealNameAr: string;
  mealNameEn: string;
  totalCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  fiberGrams: number;
  healthScore: number; // 1 - 10
  healthTagAr: string;
  healthTagEn: string;
  glycemicLoad?: 'low' | 'medium' | 'high';
  items: FoodItemBreakdown[];
  dietitianAdviceAr: string;
  dietitianAdviceEn: string;
  burnTimeEstimates?: {
    walkingMinutes: number;
    runningMinutes: number;
    cyclingMinutes: number;
  };
}

export interface LoggedMeal {
  id: string;
  mealCategory: MealCategory;
  nameAr: string;
  nameEn: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  healthScore: number;
  healthTagAr: string;
  healthTagEn: string;
  photoUrl?: string;
  timestamp: string; // ISO string
  items?: FoodItemBreakdown[];
  adviceAr?: string;
  adviceEn?: string;
}

export type ActivityType =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'gym'
  | 'swimming'
  | 'hiit'
  | 'football'
  | 'yoga'
  | 'custom';

export type ActivityIntensity = 'light' | 'moderate' | 'vigorous';

export interface LoggedActivity {
  id: string;
  type: ActivityType;
  titleAr: string;
  titleEn: string;
  durationMinutes: number;
  caloriesBurned: number;
  intensity: ActivityIntensity;
  steps?: number;
  timestamp: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  waterMl: number;
  meals: LoggedMeal[];
  activities: LoggedActivity[];
}
