import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Garden, Plant } from '../types';

interface GardenContextType {
  gardens: Garden[];
  addGarden: (name: string, location: string, imageFile: File | null) => Promise<void>;
  addPlantToGarden: (gardenId: number, name: string, species: string, imageFile: File | null) => Promise<void>;
  updatePlant: (gardenId: number, plantId: number, updates: Partial<Plant>) => void;
  deletePlant: (gardenId: number, plantId: number) => Promise<void>;
  deleteGarden: (gardenId: number) => Promise<void>;
  scanPlant: (gardenId: number, plantId: number, imageFile: File) => Promise<void>;
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);
const API_BASE = "http://localhost:8080/api";

export function GardenProvider({ children }: { children: ReactNode }) {
  const [gardens, setGardens] = useState<Garden[]>([]);

  // 1. FETCH ALL DATA ON LOAD
  useEffect(() => {
    fetch(`${API_BASE}/gardens`)
      .then(res => res.json())
      .then(data => setGardens(data))
      .catch(err => console.error("Error fetching gardens:", err));
  }, []);

  // 2. CREATE GARDEN (with Image)
  const addGarden = async (name: string, location: string, imageFile: File | null) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    if (imageFile) formData.append('file', imageFile);

    const res = await fetch(`${API_BASE}/gardens`, {
      method: 'POST',
      body: formData, // No Content-Type header needed for FormData
    });
    const newGarden = await res.json();
    setGardens((prev) => [...prev, newGarden]);
  };

  // 3. CREATE PLANT (Linked to Garden)
  const addPlantToGarden = async (gardenId: number, name: string, species: string, imageFile: File | null) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('species', species);
    if (imageFile) formData.append('file', imageFile);

    const res = await fetch(`${API_BASE}/plants/garden/${gardenId}`, {
      method: 'POST',
      body: formData,
    });
    const newPlant = await res.json();
    
    setGardens((prev) => prev.map(g => 
      g.id === gardenId ? { ...g, plants: [...g.plants, newPlant] } : g
    ));
  };

  // 4. DELETE GARDEN
  const deleteGarden = async (gardenId: number) => {
    const res = await fetch(`${API_BASE}/gardens/${gardenId}`, { method: 'DELETE' });
    if (res.ok) {
      setGardens((prev) => prev.filter(g => g.id !== gardenId));
    }
  };

  // 5. DELETE PLANT
  const deletePlant = async (gardenId: number, plantId: number) => {
    const res = await fetch(`${API_BASE}/plants/${plantId}`, { method: 'DELETE' });
    if (res.ok) {
      setGardens((prev) => prev.map(g => 
        g.id === gardenId ? { ...g, plants: g.plants.filter(p => p.id !== plantId) } : g
      ));
    }
  };

  // 6. SCAN PLANT (AI Integration)
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
      
      const newLog = await res.json(); // This is the new GrowthLog from Spring Boot

      // Instantly update the UI with the new AI data
      setGardens((prevGardens) => 
        prevGardens.map(garden => {
          if (garden.id === gardenId) {
            return {
              ...garden,
              plants: garden.plants.map(plant => {
                if (plant.id === plantId) {
                  return {
                    ...plant,
                    // Update the plant's current health score to match the new scan
                    healthScore: newLog.healthScore, 
                    // Add the new log to the end of the history array
                    logs: [...(plant.logs || []), newLog] 
                  };
                }
                return plant;
              })
            };
          }
          return garden;
        })
      );
    } catch (error) {
      console.error("Error scanning plant:", error);
      throw error; // Re-throw so the modal can catch it and show an alert
    }
  };
  const updatePlant = (gardenId: number, plantId: number, updates: Partial<Plant>) => {
    // For things like "Watering" which might just be local state for now
    setGardens((prev) => prev.map(g => g.id === gardenId ? { ...g, plants: g.plants.map(p => p.id === plantId ? { ...p, ...updates } : p) } : g));
  };

  return (
    <GardenContext.Provider value={{ gardens, addGarden, addPlantToGarden, updatePlant, deletePlant, deleteGarden, scanPlant }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGardens() {
  const context = useContext(GardenContext);
  if (context === undefined) throw new Error('useGardens must be used within a GardenProvider');
  return context;
}