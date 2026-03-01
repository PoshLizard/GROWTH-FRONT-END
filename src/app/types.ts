export interface Plant {
  id: number;
  nickname: string;
  species: string;
  healthScore: number;
  imageUrl: string | null;
  logs: GrowthLog[];
}

export interface Garden {
  id: number;
  name: string;
  location: string;
  imageUrl: string | null;
  plants: Plant[];
}

export interface GrowthLog {
  id: number;
  healthScore: number;
  diseaseDetected: string;
  aiAdvice: string;
  scanDate: string;
  growthStage: string;
}
