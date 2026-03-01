export interface Plant {
  id: string;
  name: string;
  type: string;
  image: string;
  isHealthy: boolean;
  waterLevel: number;
  sunlight: number;
  temperature: number;
  growthStage: 'seedling' | 'growing' | 'mature' | 'flowering';
  lastWatered: string;
  lastScanned?: string;
  scientificName: string;
  growthHistory: { date: string; height: number }[];
  healthIssue?: string;
  healthRecommendations?: string[]; // New: Bullet points for recovery
}

export interface Garden {
  id: string;
  name: string;
  location: string;
  image?: string;
  plants: Plant[];
}
