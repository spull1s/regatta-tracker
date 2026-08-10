export interface RegattaConfig {
  theme: string;
  startDate: string;
  weeklyGoal: number; // Customizable weekly co-op point goal (default: 5000)
}

export interface JSONBinConfig {
  apiKey: string;
  binId: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface RegattaPoints {
  [weekNum: number]: number;
}

export interface RegattaHistoryItem {
  id: string;
  theme: string;
  totalPoints: number;
  date: string;
  weeks: { [weekNum: number]: number };
  weeklyGoal?: number;
}

export type Theme = 'light' | 'dark';
