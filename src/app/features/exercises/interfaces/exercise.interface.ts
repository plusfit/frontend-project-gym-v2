export interface Exercise {
  _id: { $oid: string };
  name: string;
  description: string;
  gifUrl: string;
  type: string;
  mode: string;
  minutes?: number;
  reps?: number;
  series?: number;
  restTime?: number;
  updatedAt: { $date: string };
  createdAt: { $date: string };
  __v: number;
}
