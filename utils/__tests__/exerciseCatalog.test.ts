import { describe, it, expect } from 'vitest';
import {
  buildMainLiftSession,
  buildAccessorySession,
  swapExerciseVariant,
  isBarbellProgressionLift,
  DEFAULT_ACCESSORIES,
} from '../exerciseCatalog';
import { ExerciseSession } from '../../types';

describe('exerciseCatalog', () => {
  it('builds main lift with swap fields for bench press', () => {
    const session = buildMainLiftSession(
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
      { scheme: '3x5', currentWeights: { 'Bench Press': 50 }, exerciseAttempts: { 'Bench Press': 2 } }
    );

    expect(session.name).toBe('Bench Press');
    expect(session.equipment).toBe('barbell');
    expect(session.alternateName).toBe('Dumbbell Bench Press');
    expect(session.sets).toHaveLength(3);
    expect(session.attempt).toBe(2);
  });

  it('swaps barbell main lift to dumbbell alternate', () => {
    const bench = buildMainLiftSession(
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
      { scheme: '3x5', currentWeights: { 'Bench Press': 50, 'Dumbbell Bench Press': 22.5 } }
    );

    const swapped = swapExerciseVariant(bench, { 'Dumbbell Bench Press': 22.5 });
    expect(swapped?.name).toBe('Dumbbell Bench Press');
    expect(swapped?.equipment).toBe('dumbbell');
    expect(swapped?.targetReps).toBe(8);
    expect(swapped?.weight).toBe(22.5);
    expect(swapped?.usingAlternate).toBe(true);
    expect(swapped?.sets.every(s => s === null)).toBe(true);
  });

  it('swaps back to barbell from dumbbell alternate', () => {
    const bench = buildMainLiftSession(
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
      { scheme: '3x5', currentWeights: { 'Bench Press': 50 } }
    );
    const swapped = swapExerciseVariant(bench, {})!;
    const back = swapExerciseVariant(swapped, { 'Bench Press': 50 });

    expect(back?.name).toBe('Bench Press');
    expect(back?.equipment).toBe('barbell');
    expect(back?.targetReps).toBe(5);
    expect(back?.usingAlternate).toBe(false);
  });

  it('isBarbellProgressionLift is false for dumbbell alternate mains', () => {
    const ex: ExerciseSession = {
      name: 'Dumbbell Shoulder Press',
      weight: 15,
      sets: [8, 8, 8],
      category: 'main',
      equipment: 'dumbbell',
      usingAlternate: true,
      progressionKey: 'Overhead Press',
    };
    expect(isBarbellProgressionLift(ex)).toBe(false);
  });

  it('builds hybrid accessories with equipment', () => {
    const lateral = buildAccessorySession(DEFAULT_ACCESSORIES.A[0], {});
    expect(lateral.equipment).toBe('dumbbell');
    expect(lateral.name).toBe('Lateral Raise');
    expect(lateral.weight).toBe(10);
  });
});
