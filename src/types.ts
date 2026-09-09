export type ObjectiveStatus = 'active' | 'completed';

export interface Objective {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601
  status: ObjectiveStatus;
}

export interface ObjectiveActivity {
  id: string;
  objectiveId: string;
  date: string; // YYYY-MM-DD
  type: string;
  description?: string;
  createdAt: string; // ISO 8601
}
