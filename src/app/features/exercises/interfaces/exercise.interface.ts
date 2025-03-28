export interface Exercise {
  _id: string;
  name: string;
  description: string;
  categorie: string[];
  gifUrl: string;
  type: string;
  minutes?: number;
  reps: number;
  series?: number;
  restTime?: number;
  updatedAt: { $date: string };
  createdAt: { $date: string };
  __v: number;
}
export interface ExercisePayload {
  name: string;
  description: string;
  gifUrl?: string;
  type: string;
  minutes?: number;
  reps: number;
  series?: number;
  restTime?: number;
}
