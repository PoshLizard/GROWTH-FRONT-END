import { useState, useRef } from 'react';
import { X, Upload, Sprout, Leaf, ScanLine } from 'lucide-react';
import { Plant } from '../types';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (plant: Omit<Plant, 'id'>) => void;
}

export function AddPlantModal({ isOpen, onClose, onAdd }: AddPlantModalProps) {
  const [name, setName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      
      // Simulate "scanning" process
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
      }, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Create a new plant with default/randomized stats
    const newPlant: Omit<Plant, 'id'> = {
      name,
      type: 'Unknown', // Could be inferred from "scan" in a real app
      image: imagePreview || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1080', // Fallback if no image
      isHealthy: true,
      waterLevel: 75,
      sunlight: 5,
      temperature: 70,
      growthStage: 'growing',
      lastWatered: 'Just now',
    };
    
    onAdd(newPlant);
    
    // Reset form
    setName('');
    setImagePreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Leaf className="size-5 text-primary" />
            Add New Plant
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Plant Name</label>
            <div className="relative">
              <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="e.g. Monstera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Image Upload / Scan */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Scan Plant</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative h-56 w-full rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden group
                ${imagePreview ? 'border-primary/50 bg-background' : 'border-border hover:border-primary/50 hover:bg-primary/5'}
              `}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-90" />
                  
                  {/* Scanning Animation Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
                      <ScanLine className="size-12 text-primary animate-pulse mb-2" />
                      <span className="text-white font-medium text-sm">Scanning plant details...</span>
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                  )}

                  {!isScanning && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium flex items-center gap-2">
                        <Upload className="size-4" /> Rescan Image
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-muted group-hover:bg-background transition-colors">
                    <ScanLine className="size-8 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      Upload to Scan
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Identify species & health
                    </p>
                  </div>
                </>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden" 
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isScanning}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <PlusIcon />
              Add Plant
            </button>
          </div>
        </form>
      </div>
      
      {/* Inline styles for scanning animation if not in global css */}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
    )
}
