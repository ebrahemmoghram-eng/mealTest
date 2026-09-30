import { ActivityIntensity, ActivityLevel, ActivityType, FitnessGoal, Gender, UserProfile } from '../types';

/**
 * Calculate Basal Metabolic Rate using the Mifflin-St Jeor Equation
 */
export function calculateBMR(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

/**
 * Activity Multiplier according to physical activity level
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Little or no exercise, desk job
  light: 1.375, // Light exercise 1-3 days/week
  moderate: 1.55, // Moderate exercise 3-5 days/week
  active: 1.725, // Hard exercise 6-7 days/week
  very_active: 1.9, // Very hard exercise, physical job or 2x training
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate recommended daily calorie target according to fitness goal
 */
export function calculateTargetCalories(tdee: number, goal: FitnessGoal): number {
  switch (goal) {
    case 'lose_weight':
      return Math.max(1200, Math.round(tdee - 500)); // Moderate deficit ~0.5kg/week
    case 'gain_weight':
      return Math.round(tdee + 500); // Surplus for weight gain
    case 'muscle_gain':
      return Math.round(tdee + 300); // Lean muscle gain surplus
    case 'maintain':
    default:
      return tdee;
  }
}

/**
 * Calculate recommended water intake in milliliters (approx 35 ml per kg of body weight)
 */
export function calculateTargetWaterMl(weightKg: number, activityLevel: ActivityLevel): number {
  let baseMl = weightKg * 35;
  if (activityLevel === 'active' || activityLevel === 'very_active') {
    baseMl += 500;
  }
  // Round to nearest 250ml
  return Math.max(1500, Math.round(baseMl / 250) * 250);
}

/**
 * Calculate recommended macronutrient distribution (Grams of Protein, Carbs, Fats)
 */
export function calculateTargetMacros(calories: number, weightKg: number, goal: FitnessGoal) {
  // Protein: 1.6g to 2.2g per kg depending on goal
  let proteinPerKg = 1.8;
  if (goal === 'muscle_gain') proteinPerKg = 2.0;
  if (goal === 'lose_weight') proteinPerKg = 2.0; // Higher protein to preserve lean muscle
  if (goal === 'maintain') proteinPerKg = 1.6;

  const proteinGrams = Math.round(Math.min(weightKg * proteinPerKg, (calories * 0.35) / 4));
  const proteinCalories = proteinGrams * 4;

  // Fat: 25% - 30% of total calories (9 cal/g)
  const fatCalories = calories * 0.25;
  const fatsGrams = Math.round(fatCalories / 9);

  // Carbs: Remaining calories (4 cal/g)
  const remainingCalories = calories - (proteinCalories + fatsGrams * 9);
  const carbsGrams = Math.max(50, Math.round(remainingCalories / 4));

  return {
    proteinGrams,
    carbsGrams,
    fatsGrams,
  };
}

/**
 * Calculate Body Mass Index (BMI)
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  categoryKey: 'underweight' | 'normal' | 'overweight' | 'obese';
} {
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let categoryKey: 'underweight' | 'normal' | 'overweight' | 'obese' = 'normal';
  if (bmi < 18.5) categoryKey = 'underweight';
  else if (bmi < 25) categoryKey = 'normal';
  else if (bmi < 30) categoryKey = 'overweight';
  else categoryKey = 'obese';

  return { bmi, categoryKey };
}

/**
 * MET (Metabolic Equivalent of Task) values for various activities
 */
export const ACTIVITY_MET_VALUES: Record<ActivityType, Record<ActivityIntensity, number>> = {
  walking: { light: 2.8, moderate: 3.5, vigorous: 4.5 },
  running: { light: 7.0, moderate: 9.0, vigorous: 11.5 },
  cycling: { light: 4.0, moderate: 6.8, vigorous: 9.5 },
  gym: { light: 3.5, moderate: 5.5, vigorous: 7.5 },
  swimming: { light: 5.0, moderate: 7.0, vigorous: 9.8 },
  hiit: { light: 6.0, moderate: 8.5, vigorous: 12.0 },
  football: { light: 5.5, moderate: 7.5, vigorous: 10.0 },
  yoga: { light: 2.3, moderate: 3.0, vigorous: 4.0 },
  custom: { light: 3.0, moderate: 5.0, vigorous: 7.5 },
};

/**
 * Estimate calories burned during exercise:
 * Calories = (MET * 3.5 * weightKg / 200) * minutes
 */
export function estimateCaloriesBurned(
  type: ActivityType,
  intensity: ActivityIntensity,
  durationMinutes: number,
  weightKg: number
): number {
  const met = ACTIVITY_MET_VALUES[type]?.[intensity] || 4.0;
  const burned = ((met * 3.5 * weightKg) / 200) * durationMinutes;
  return Math.round(burned);
}

export function getDefaultProfile(): UserProfile {
  const weight = 70;
  const height = 175;
  const age = 28;
  const gender: Gender = 'male';
  const activityLevel: ActivityLevel = 'moderate';
  const goal: FitnessGoal = 'maintain';

  const bmr = calculateBMR(gender, weight, height, age);
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyCalorieTarget = calculateTargetCalories(tdee, goal);
  const dailyWaterTargetMl = calculateTargetWaterMl(weight, activityLevel);
  const macros = calculateTargetMacros(dailyCalorieTarget, weight, goal);

  return {
    name: '',
    age,
    gender,
    weight,
    height,
    activityLevel,
    goal,
    dailyCalorieTarget,
    dailyWaterTargetMl,
    proteinTargetGrams: macros.proteinGrams,
    carbsTargetGrams: macros.carbsGrams,
    fatsTargetGrams: macros.fatsGrams,
    isProfileComplete: false,
    createdAt: new Date().toISOString(),
  };
}
