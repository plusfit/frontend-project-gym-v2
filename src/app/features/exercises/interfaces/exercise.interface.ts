export interface Exercise {
  _id: string;
  name: string;
  description: string;
  category: string[];
  gifUrl: string;
  mediaType?: 'image' | 'video';
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
  mediaType?: 'image' | 'video';
  type: string;
  minutes?: number;
  reps: number;
  series?: number;
  restTime?: number;
}
