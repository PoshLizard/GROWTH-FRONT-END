import { Leaf, Droplets, AlertTriangle } from "lucide-react";
import { Plant } from "../types";

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
}

export function PlantCard({ plant, onClick }: PlantCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group overflow-hidden rounded-xl bg-card border border-border transition-all hover:scale-105 hover:border-primary"
    >
      {/* Plant Image */}
      <div className="h-40 overflow-hidden relative">
        <img
          src={plant.image}
          alt={plant.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs backdrop-blur-sm ${
          plant.isHealthy 
            ? 'bg-primary/20 text-primary border border-primary/30' 
            : 'bg-destructive/20 text-destructive border border-destructive/30'
        }`}>
          {plant.isHealthy ? (
            <span className="flex items-center gap-1">
              <Leaf className="size-3" />
              Healthy
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <AlertTriangle className="size-3" />
              Needs Care
            </span>
          )}
        </div>
      </div>

      {/* Plant Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg text-foreground">{plant.name}</h3>
        <p className="text-sm text-muted-foreground">{plant.type}</p>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Droplets className="size-3 text-primary" />
            <span>{plant.waterLevel}%</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Leaf className="size-3 text-primary" />
            <span>{plant.growthStage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
