import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Garden, Plant } from '../types';

interface GardenContextType {
  gardens: Garden[];
  addGarden: (garden: Omit<Garden, 'id' | 'plants'>) => void;
  addPlantToGarden: (gardenId: string, plant: Omit<Plant, 'id'>) => void;
  updatePlant: (gardenId: string, plantId: string, updates: Partial<Plant>) => void;
  deletePlant: (gardenId: string, plantId: string) => void;
  deleteGarden: (gardenId: string) => void;
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export function GardenProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available, otherwise mock data
  const [gardens, setGardens] = useState<Garden[]>(() => {
    try {
      const saved = localStorage.getItem('growth_gardens');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('growth_gardens', JSON.stringify(gardens));
  }, [gardens]);

  const addGarden = (gardenData: Omit<Garden, 'id' | 'plants'>) => {
    const newGarden: Garden = {
      ...gardenData,
      id: Math.random().toString(36).substr(2, 9),
      plants: [], // Start with empty plants list
    };
    setGardens((prev) => [...prev, newGarden]);
  };

  const addPlantToGarden = (gardenId: string, plantData: Omit<Plant, 'id'>) => {
    setGardens((prev) => prev.map(garden => {
      if (garden.id === gardenId) {
        return {
          ...garden,
          plants: [...garden.plants, { ...plantData, id: Math.random().toString(36).substr(2, 9) }]
        };
      }
      return garden;
    }));
  };

  const updatePlant = (gardenId: string, plantId: string, updates: Partial<Plant>) => {
    setGardens((prev) => prev.map(garden => {
      if (garden.id === gardenId) {
        return {
          ...garden,
          plants: garden.plants.map(plant => 
            plant.id === plantId ? { ...plant, ...updates } : plant
          )
        };
      }
      return garden;
    }));
  };

  const deletePlant = (gardenId: string, plantId: string) => {
    setGardens((prev) => prev.map(garden => {
      if (garden.id === gardenId) {
        return {
          ...garden,
          plants: garden.plants.filter(plant => plant.id !== plantId)
        };
      }
      return garden;
    }));
  };

  const deleteGarden = (gardenId: string) => {
    setGardens((prev) => prev.filter(garden => garden.id !== gardenId));
  };

  return (
    <GardenContext.Provider value={{ gardens, addGarden, addPlantToGarden, updatePlant, deletePlant, deleteGarden }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGardens() {
  const context = useContext(GardenContext);
  if (context === undefined) {
    throw new Error('useGardens must be used within a GardenProvider');
  }
  return context;
}
