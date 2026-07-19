import { ExerciseCategory, ExerciseSession, EquipmentType } from '../types';

export const DEFAULT_DUMBBELL_PAIRS = [10, 15, 20, 25];

export interface SwapConfig {
  alternateName: string;
  alternateEquipment: EquipmentType;
  alternateTargetReps?: number;
  alternateStartWeight: number;
  /** single = one DB (goblet); per-hand = pair (default) */
  alternateWeightStyle?: 'per-hand' | 'single';
}

export interface MainLiftConfig {
  name: string;
  equipment: EquipmentType;
  swap?: SwapConfig;
}

export interface AccessoryConfig {
  name: string;
  equipment: EquipmentType;
  sets: number;
  targetReps: number;
  startWeight: number;
  swap?: SwapConfig;
}

export const PROGRAMS = {
  A: ['Squat', 'Bench Press', 'Barbell Row'],
  B: ['Squat', 'Overhead Press', 'Deadlift'],
} as const;

export const DEFAULT_WARMUPS = {
  A: [
    { name: 'Jumping Jacks', sets: 1, targetReps: 30 },
    { name: 'Arm Circles', sets: 1, targetReps: 20 },
    { name: 'Bodyweight Squats', sets: 1, targetReps: 10 },
    { name: 'Plank (seconds)', sets: 1, targetReps: 30 },
  ],
  B: [
    { name: 'Mountain Climbers', sets: 1, targetReps: 20 },
    { name: 'Hip Circles', sets: 1, targetReps: 10 },
    { name: 'Lunges (each leg)', sets: 1, targetReps: 8 },
    { name: 'Dead Bugs', sets: 1, targetReps: 10 },
  ],
};

export const MAIN_LIFT_CONFIG: Record<'A' | 'B', MainLiftConfig[]> = {
  A: [
    {
      name: 'Squat',
      equipment: 'barbell',
      swap: {
        alternateName: 'Goblet Squat',
        alternateEquipment: 'dumbbell',
        alternateTargetReps: 10,
        alternateStartWeight: 20,
        alternateWeightStyle: 'single',
      },
    },
    {
      name: 'Bench Press',
      equipment: 'barbell',
      swap: {
        alternateName: 'Dumbbell Bench Press',
        alternateEquipment: 'dumbbell',
        alternateTargetReps: 8,
        alternateStartWeight: 20,
      },
    },
    {
      name: 'Barbell Row',
      equipment: 'barbell',
      swap: {
        alternateName: 'Dumbbell Row',
        alternateEquipment: 'dumbbell',
        alternateTargetReps: 8,
        alternateStartWeight: 20,
      },
    },
  ],
  B: [
    {
      name: 'Squat',
      equipment: 'barbell',
      swap: {
        alternateName: 'Goblet Squat',
        alternateEquipment: 'dumbbell',
        alternateTargetReps: 10,
        alternateStartWeight: 20,
        alternateWeightStyle: 'single',
      },
    },
    {
      name: 'Overhead Press',
      equipment: 'barbell',
      swap: {
        alternateName: 'Dumbbell Shoulder Press',
        alternateEquipment: 'dumbbell',
        alternateTargetReps: 8,
        alternateStartWeight: 15,
      },
    },
    { name: 'Deadlift', equipment: 'barbell' },
  ],
};

/** Hybrid accessories: barbell + dumbbell complement each other (per-exercise swap). */
export const DEFAULT_ACCESSORIES: Record<'A' | 'B', AccessoryConfig[]> = {
  A: [
    {
      name: 'Lateral Raise',
      equipment: 'dumbbell',
      sets: 3,
      targetReps: 12,
      startWeight: 10,
    },
    {
      name: 'Barbell Hip Thrust',
      equipment: 'barbell',
      sets: 3,
      targetReps: 10,
      startWeight: 30,
      swap: {
        alternateName: 'Dumbbell Hip Thrust',
        alternateEquipment: 'dumbbell',
        alternateTargetReps: 12,
        alternateStartWeight: 25,
      },
    },
  ],
  B: [
    {
      name: 'Chin-ups',
      equipment: 'bodyweight',
      sets: 3,
      targetReps: 8,
      startWeight: 0,
    },
    {
      name: 'Bulgarian Split Squat',
      equipment: 'barbell',
      sets: 3,
      targetReps: 8,
      startWeight: 20,
      swap: {
        alternateName: 'DB Bulgarian Split Squat',
        alternateEquipment: 'dumbbell',
        alternateTargetReps: 8,
        alternateStartWeight: 15,
      },
    },
  ],
};

/** Default starting weights for dumbbell exercises (per hand, kg). */
export const DEFAULT_DUMBBELL_WEIGHTS: Record<string, number> = {
  'Dumbbell Bench Press': 20,
  'Dumbbell Row': 20,
  'Dumbbell Shoulder Press': 15,
  'Goblet Squat': 20,
  'Lateral Raise': 10,
  'Dumbbell Hip Thrust': 25,
  'DB Bulgarian Split Squat': 15,
};

function applySwapFields(
  session: ExerciseSession,
  swap?: SwapConfig
): ExerciseSession {
  if (!swap) return session;
  return {
    ...session,
    alternateName: swap.alternateName,
    alternateEquipment: swap.alternateEquipment,
    alternateTargetReps: swap.alternateTargetReps,
    alternateStartWeight: swap.alternateStartWeight,
    alternateWeightStyle: swap.alternateWeightStyle,
    usingAlternate: false,
  };
}

export function buildMainLiftSession(
  config: MainLiftConfig,
  options: {
    scheme: '3x5' | '5x5';
    currentWeights: Record<string, number>;
    exerciseAttempts?: Record<string, number>;
  }
): ExerciseSession {
  const mainSets = options.scheme === '5x5' ? 5 : 3;
  const sets = config.name === 'Deadlift' ? 1 : mainSets;
  const progressionKey = config.name;

  const session: ExerciseSession = {
    name: config.name,
    weight: options.currentWeights[config.name] || 0,
    sets: Array(sets).fill(null),
    attempt: options.exerciseAttempts?.[config.name] || 1,
    targetReps: 5,
    category: 'main' as ExerciseCategory,
    equipment: config.equipment,
    progressionKey,
    primaryEquipment: config.equipment,
    primaryTargetReps: 5,
  };

  return applySwapFields(session, config.swap);
}

export function resolveAccessoryConfig(
  a: {
    name: string;
    sets: number;
    targetReps: number;
    startWeight: number;
    equipment?: EquipmentType;
    swap?: SwapConfig;
  },
  workoutType: 'A' | 'B'
): AccessoryConfig {
  const defaultDef = DEFAULT_ACCESSORIES[workoutType].find(d => d.name === a.name);
  if (defaultDef) {
    return {
      ...defaultDef,
      ...a,
      equipment: a.equipment ?? defaultDef.equipment,
      swap: a.swap ?? defaultDef.swap,
    };
  }
  return {
    ...a,
    equipment: a.equipment ?? 'barbell',
  };
}

export function buildAccessorySession(
  config: AccessoryConfig,
  currentWeights: Record<string, number>
): ExerciseSession {
  const weight =
    currentWeights[config.name] ??
    (config.equipment === 'dumbbell'
      ? DEFAULT_DUMBBELL_WEIGHTS[config.name] ?? config.startWeight
      : config.startWeight);

  const session: ExerciseSession = {
    name: config.name,
    weight,
    sets: Array(config.sets).fill(null),
    targetReps: config.targetReps,
    category: 'accessory' as ExerciseCategory,
    equipment: config.equipment,
    progressionKey: config.name,
    primaryEquipment: config.equipment,
    primaryTargetReps: config.targetReps,
  };

  return applySwapFields(session, config.swap);
}

/** Toggle between barbell/default and dumbbell alternate for a session exercise. */
export function swapExerciseVariant(
  exercise: ExerciseSession,
  currentWeights: Record<string, number>
): ExerciseSession | null {
  if (!exercise.alternateName || !exercise.progressionKey) return null;

  const setCount = exercise.sets.length;

  if (!exercise.usingAlternate) {
    const altName = exercise.alternateName;
    return {
      ...exercise,
      usingAlternate: true,
      name: altName,
      equipment: exercise.alternateEquipment || 'dumbbell',
      weight:
        currentWeights[altName] ??
        exercise.alternateStartWeight ??
        DEFAULT_DUMBBELL_WEIGHTS[altName] ??
        0,
      targetReps: exercise.alternateTargetReps ?? exercise.targetReps,
      sets: Array(setCount).fill(null),
      attempt: undefined,
      weightStyle: exercise.alternateWeightStyle ?? 'per-hand',
    };
  }

  const barbellName = exercise.progressionKey;
  return {
    ...exercise,
    usingAlternate: false,
    name: barbellName,
    equipment: exercise.primaryEquipment || 'barbell',
    weight: currentWeights[barbellName] ?? exercise.weight,
    targetReps: exercise.primaryTargetReps ?? exercise.targetReps,
    sets: Array(setCount).fill(null),
    attempt: exercise.attempt,
    weightStyle: undefined,
  };
}

export function isBarbellProgressionLift(exercise: ExerciseSession): boolean {
  return (
    exercise.category === 'main' &&
    !exercise.usingAlternate &&
    exercise.equipment !== 'dumbbell'
  );
}
