import { useState, useRef } from 'react';
import { X, Leaf, AlertTriangle, CheckCircle, Trash2, ScanLine, Upload, Activity, Stethoscope } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Plant } from "../types";

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
  onDelete: () => void;
  onScan: (imageFile: File) => void;
}

export function PlantDetailModal({ plant, onClose, onDelete, onScan }: PlantDetailModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  if (!plant) return null;

  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      // We pass the real file to the parent context to hit the Spring Boot endpoint
      onScan(file);
      // Stop the scanning animation after 3 seconds (assuming API finishes)
      setTimeout(() => setIsScanning(false), 3000);
    }
  };

  const isHealthy = plant.healthScore >= 7;
  
  // Sort logs by date so the graph renders left-to-right correctly
  const sortedLogs = [...(plant.logs || [])].sort((a, b) => 
    new Date(a.scanDate).getTime() - new Date(b.scanDate).getTime()
  );
  
  const latestLog = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1] : null;
  const currentStage = latestLog?.growthStage || "Unknown";
  const currentDisease = latestLog?.diseaseDetected || "None";
  const currentAdvice = latestLog?.aiAdvice || "Scan plant to receive AI advice.";

  // Format data for Recharts
  const chartData = sortedLogs.map(log => ({
    date: new Date(log.scanDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    health: log.healthScore
  }));

  const displayImage = "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1080";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/30 text-white transition-colors">
          <X className="size-5" />
        </button>

        {/* Plant Image */}
        <div className="h-72 overflow-hidden relative shrink-0">
          <img src={displayImage} alt={plant.nickname} className="w-full h-full object-cover" />
          
          {isScanning && (
            <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center">
              <ScanLine className="size-12 text-primary animate-pulse mb-3" />
              <p className="text-white font-medium text-lg">Gemini AI is analyzing...</p>
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-1">{plant.nickname}</h2>
            <p className="text-lg text-muted-foreground/80 font-medium italic">{plant.species}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Health Status Banner based on AI backend */}
          <div className={`p-4 rounded-2xl border ${isHealthy ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/20'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full shrink-0 ${isHealthy ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                {isHealthy ? <CheckCircle className="size-6 text-primary" /> : <AlertTriangle className="size-6 text-destructive" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Health Score: {plant.healthScore}/10
                </h3>
                <div className="mt-2 text-sm text-muted-foreground">
                    <p className="font-medium mb-1 text-foreground/80">Disease Detected: {currentDisease}</p>
                    <div className="bg-background/50 rounded-lg p-3 border border-border/50 mt-2">
                        <p className="text-xs uppercase tracking-wider font-semibold mb-1 opacity-70">AI Advice:</p>
                        <p className="text-sm">{currentAdvice}</p>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Scan Action Card */}
            <div className="p-5 rounded-2xl border bg-blue-500/10 border-blue-500/30 md:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background/50 text-blue-600">
                    <Stethoscope className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider opacity-70">AI Plant Doctor</p>
                    <p className="text-xl font-bold text-foreground">Run New Scan</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="px-5 py-2.5 rounded-xl bg-background/60 hover:bg-background/80 text-foreground font-medium text-sm transition-all shadow-sm border border-black/5 hover:border-black/10 active:scale-95 flex items-center gap-2"
                >
                  <Upload className="size-4" />
                  {isScanning ? 'Uploading...' : 'Upload Photo'}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleScan} className="hidden" />
            </div>

            {/* Growth Stage */}
            <div className="p-5 rounded-2xl bg-secondary/30 border border-border md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-chart-2/20">
                  <Leaf className="size-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Growth Stage</p>
                  <p className="text-xl font-bold text-foreground capitalize">{currentStage}</p>
                </div>
              </div>
            </div>
            
            {/* Health History Chart */}
            <div className="p-6 rounded-2xl bg-card border border-border md:col-span-2 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-green-500/10">
                        <Activity className="size-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider opacity-70">Health History</p>
                        <p className="text-xl font-bold text-foreground">Score over time</p>
                    </div>
                </div>
                
                <div className="h-64 w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`${value}/10`, 'Health Score']}
                                />
                                <Line type="monotone" dataKey="health" stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            No scans recorded yet. Upload a photo to start tracking!
                        </div>
                    )}
                </div>
            </div>
          </div>
          
          {/* Delete Action */}
          <div className="pt-4 border-t border-border flex justify-end">
            <button
                onClick={() => window.confirm("Remove this plant?") && onDelete()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
                <Trash2 className="size-4" /> Remove Plant
            </button>
          </div>
        </div>
        
        <style>{`@keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }`}</style>
      </div>
    </div>
  );
}