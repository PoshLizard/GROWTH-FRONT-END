import { useState } from 'react';
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
  const { gardens, addPlantToGarden, updatePlant, deletePlant } = useGardens();
  
  const garden = gardens.find(g => g.id === id);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const selectedPlant = garden?.plants.find(p => p.id === selectedPlantId) || null;

  if (!garden) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Sprout className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Garden Not Found</h2>
        <p className="text-muted-foreground mb-8">The garden you're looking for doesn't exist.</p>
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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors mr-2 flex items-center gap-2 text-foreground"
            >
                <ChevronLeft className="size-5" />
                <span className="hidden md:inline text-sm font-medium">Back to Gardens</span>
            </button>
            <div className="h-6 w-px bg-border mx-2" />
            <div className="p-2 rounded-lg bg-primary/20">
              <Leaf className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl text-foreground">Growth</h1>
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">
            {garden.name}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <GardenSlide
          garden={garden}
          onPlantClick={(plantId) => setSelectedPlantId(plantId)}
          onAddPlant={() => setIsAddPlantModalOpen(true)}
          onChatClick={() => setIsChatOpen(true)}
        />
      </main>

      <HurbeeChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Plant Detail Modal */}
      <PlantDetailModal
        plant={selectedPlant}
        onClose={() => setSelectedPlantId(null)}
        onWater={() => {
          if (garden && selectedPlant) {
            updatePlant(garden.id, selectedPlant.id, { lastWatered: 'Just now' });
          }
        }}
        onDelete={() => {
            if (garden && selectedPlant) {
                deletePlant(garden.id, selectedPlant.id);
                setSelectedPlantId(null);
            }
        }}
        onScan={(image) => {
            if (garden && selectedPlant) {
                updatePlant(garden.id, selectedPlant.id, { 
                    lastScanned: 'Just now',
                    image: image,
                    // Simulate new diagnosis results
                    waterLevel: Math.floor(Math.random() * 30) + 60,
                    sunlight: Math.floor(Math.random() * 4) + 4,
                    temperature: Math.floor(Math.random() * 15) + 65,
                    isHealthy: Math.random() > 0.1
                });
            }
        }}
      />

      {/* Add Plant Modal */}
      <AddPlantModal
        isOpen={isAddPlantModalOpen}
        onClose={() => setIsAddPlantModalOpen(false)}
        onAdd={(plantData) => {
          if (id) {
            addPlantToGarden(id, plantData);
            setIsAddPlantModalOpen(false);
          }
        }}
      />
    </div>
  );
}
