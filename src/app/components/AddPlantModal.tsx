import { useState } from 'react';
import { X, Sprout, Leaf } from 'lucide-react';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (nickname: string, species: string) => void;
}

export function AddPlantModal({ isOpen, onClose, onAdd }: AddPlantModalProps) {
  const [nickname, setNickname] = useState('');
  const [species, setSpecies] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !species.trim()) return;
    
    // Pass the data up to the Context!
    onAdd(nickname, species);
    
    // Reset form
    setNickname('');
    setSpecies('');
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
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Nickname Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Plant Nickname</label>
            <div className="relative">
              <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="e.g. Seymour"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Species Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Species / Type</label>
            <div className="relative">
              <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="e.g. Venus Flytrap"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!nickname.trim() || !species.trim()} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
              Add Plant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}