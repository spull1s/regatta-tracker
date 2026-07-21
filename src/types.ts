export interface RegattaConfig {
  theme: string;
  startDate: string;
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
}

export type Theme = 'light' | 'dark';
