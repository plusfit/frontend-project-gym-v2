import { Routine } from '@features/routines/interfaces/routine.interface';

export interface Plan {
  _id: string;
  name: string;
  type: string;
  defaultRoutine: Routine;
  days: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface PlanApiResponse {
  success: boolean;
  data: PlanData;
}

interface PlanData {
  data: Plan[];
  total: number;
  page: number;
  limit: number;
}

export enum PlanCategory {
  WEIGHT_LOSS = 'weightLoss',
  MUSCLE_GAIN = 'muscleGain',
  ENDURANCE = 'endurance',
  GENERAL_WELLNESS = 'generalWellness',
  FLEXIBILITY = 'flexibility',
  STRENGTH_TRAINING = 'strengthTraining',
}

export enum PlanGoal {
  LOSE_WEIGHT = 'loseWeight',
  BUILD_MUSCLE = 'buildMuscle',
  IMPROVE_CARDIO = 'improveCardio',
  INCREASE_FLEXIBILITY = 'increaseFlexibility',
  GENERAL_FITNESS = 'generalFitness',
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum Tags {
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  HIIT = 'hiit',
  FLEXIBILITY = 'flexibility',
  FUNCTIONAL_TRAINING = 'functionalTraining',
  HOME_WORKOUT = 'homeWorkout',
  GYM_WORKOUT = 'gymWorkout',
  BODYWEIGHT = 'bodyweight',
  EQUIPMENT_REQUIRED = 'equipmentRequired',
}

export enum PlanType {
  ROOM = 'room',
  CARDIO = 'cardio',
  MIXED = 'mixed',
}
