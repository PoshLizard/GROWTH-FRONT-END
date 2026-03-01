import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Garden, Plant } from '../types';

interface GardenContextType {
  gardens: Garden[];
  loading: boolean;
  refreshGardens: () => Promise<void>; // Added this
  addGarden: (name: string, location: string, imageFile: File | null) => Promise<void>;
  addPlantToGarden: (gardenId: number, nickname: string, species: string) => Promise<void>;
  updatePlant: (gardenId: number, plantId: number, updates: Partial<Plant>) => void;
  deletePlant: (gardenId: number, plantId: number) => Promise<void>;
  deleteGarden: (gardenId: number) => Promise<void>;
  scanPlant: (gardenId: number, plantId: number, imageFile: File) => Promise<void>;
}

const API_BASE = "http://localhost:8080/api";
export const GardenContext = createContext<GardenContextType | undefined>(undefined);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. REFRESH ALL DATA (The "Master Fetch")
  const refreshGardens = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gardens`);
      if (!res.ok) throw new Error("Failed to fetch gardens");
      const data = await res.json();
      setGardens(data);
    } catch (err) {
      console.error("Error refreshing gardens:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshGardens();
  }, []);

  // 2. CREATE GARDEN
  const addGarden = async (name: string, location: string, imageFile: File | null) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    if (imageFile) formData.append('file', imageFile);

    const res = await fetch(`${API_BASE}/gardens`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) await refreshGardens();
  };

  // 3. CREATE PLANT
  const addPlantToGarden = async (gardenId: number, nickname: string, species: string) => {
    const res = await fetch(`${API_BASE}/plants/garden/${gardenId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, species }),
    });

    if (res.ok) await refreshGardens();
  };

  // 4. DELETE GARDEN
  const deleteGarden = async (gardenId: number) => {
    const res = await fetch(`${API_BASE}/gardens/${gardenId}`, { method: 'DELETE' });
    if (res.ok) await refreshGardens();
  };

  // 5. DELETE PLANT
  const deletePlant = async (gardenId: number, plantId: number) => {
    const res = await fetch(`${API_BASE}/plants/${plantId}`, { method: 'DELETE' });
    if (res.ok) await refreshGardens();
  };

  // 6. SCAN PLANT (AI Integration)
  const scanPlant = async (gardenId: number, plantId: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile); 

    try {
      const res = await fetch(`${API_BASE}/scans/${plantId}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Scan API failed");
      await refreshGardens(); // Re-sync UI after scan
    } catch (error) {
      console.error("Error scanning plant:", error);
      throw error; 
    }
  };

  // 7. LOCAL UPDATE (For instant UI feedback)
  const updatePlant = (gardenId: number, plantId: number, updates: Partial<Plant>) => {
    setGardens((prev) => prev.map(g => 
      g.id === gardenId ? { ...g, plants: g.plants.map(p => p.id === plantId ? { ...p, ...updates } : p) } : g
    ));
  };

  return (
    <GardenContext.Provider value={{ 
      gardens, 
      loading, 
      refreshGardens, 
      addGarden, 
      addPlantToGarden, 
      updatePlant, 
      deletePlant, 
      deleteGarden, 
      scanPlant 
    }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGardens() {
  const context = useContext(GardenContext);
  if (context === undefined) throw new Error('useGardens must be used within a GardenProvider');
  return context;
}