import { useState, useEffect } from 'react';
import { ChevronLeft, Leaf, Sprout } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { GardenSlide } from '../components/GardenSlide';
import { PlantDetailModal } from '../components/PlantDetailModal';
import { AddPlantModal } from '../components/AddPlantModal';
import { HurbeeChatbot } from '../components/HurbeeChatbot';
import { useGardens } from '../context/GardenContext';

export function GardenDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 1. FIX: Removed duplicate useGardens() call and duplicate 'gardens' declaration
  const { gardens, addPlantToGarden, deletePlant, scanPlant, refreshGardens } = useGardens();
 
  const gardenId = Number(id);
  const garden = gardens.find(g => g.id === gardenId);
  
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 2. Derive selectedPlant directly from the latest gardens data
  const selectedPlant = garden?.plants.find(p => p.id === selectedPlantId) || null;

  const handleDeleteLog = async (logId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/scans/${logId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        // This triggers the Context to fetch fresh data from the DB
        await refreshGardens(); 
        console.log("Hurbee updated the garden and removed the log!");
      }
    } catch (error) {
      console.error("Network error deleting log:", error);
    }
  };

  if (!garden) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Sprout className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Garden Not Found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors mr-2 flex items-center gap-2 text-foreground"
            >
                <ChevronLeft className="size-5" />
                <span className="hidden md:inline text-sm font-medium">Back</span>
            </button>
            <div className="h-6 w-px bg-border mx-2" />
            <Leaf className="size-6 text-primary" />
            <h1 className="text-2xl text-foreground font-bold">Growth</h1>
          </div>
          <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {garden.name}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <GardenSlide
          garden={garden}
          onPlantClick={(plantId) => setSelectedPlantId(Number(plantId))}
          onAddPlant={() => setIsAddPlantModalOpen(true)}
          onChatClick={() => setIsChatOpen(true)}
        />
      </main>

      <HurbeeChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {selectedPlant && (
        <PlantDetailModal
          plant={selectedPlant}
          onClose={() => setSelectedPlantId(null)}
          onDelete={() => {
              if (garden && selectedPlant) {
                  deletePlant(garden.id, selectedPlant.id);
                  setSelectedPlantId(null);
              }
          }}
          onScan={async (imageFile) => {
              if (garden && selectedPlant) {
                  try {
                      await scanPlant(garden.id, selectedPlant.id, imageFile);
                  } catch (error) {
                      console.error("Failed to scan plant", error);
                  }
              }
          }}
          onDeleteLog={handleDeleteLog}
        />
      )}

      <AddPlantModal
        isOpen={isAddPlantModalOpen}
        onClose={() => setIsAddPlantModalOpen(false)}
        onAdd={(nickname: string, species: string) => {
          if (gardenId) {
            addPlantToGarden(gardenId, nickname, species);
            setIsAddPlantModalOpen(false);
          }
        }}
      />
    </div>
  );
}