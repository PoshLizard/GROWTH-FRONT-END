import { Leaf, AlertTriangle, Activity } from "lucide-react";
import { Plant } from "../types";

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
}

export function PlantCard({ plant, onClick }: PlantCardProps) {
  // A health score of 7 or higher is considered healthy
  const isHealthy = plant.healthScore >= 7;
  
  // Get the latest log for the current growth stage, if any exist
  const latestLog = plant.logs && plant.logs.length > 0 ? plant.logs[plant.logs.length - 1] : null;
  const currentStage = latestLog?.growthStage || "Unknown stage";

  // Fallback image since the backend Plant entity doesn't store an imageUrl yet
  const displayImage = "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=500";

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group overflow-hidden rounded-xl bg-card border border-border transition-all hover:scale-105 hover:border-primary"
    >
      {/* Plant Image */}
      <div className="h-40 overflow-hidden relative">
        <img
          src={displayImage}
          alt={plant.nickname}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs backdrop-blur-sm ${
          isHealthy 
            ? 'bg-primary/20 text-primary border border-primary/30' 
            : 'bg-destructive/20 text-destructive border border-destructive/30'
        }`}>
          {isHealthy ? (
            <span className="flex items-center gap-1">
              <Leaf className="size-3" />
              Healthy ({plant.healthScore}/10)
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <AlertTriangle className="size-3" />
              Needs Care ({plant.healthScore}/10)
            </span>
          )}
        </div>
      </div>

      {/* Plant Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg text-foreground font-bold">{plant.nickname}</h3>
        <p className="text-sm text-muted-foreground italic">{plant.species}</p>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="size-3 text-primary" />
            <span>Score: {plant.healthScore}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Leaf className="size-3 text-primary" />
            <span className="capitalize">{currentStage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}