import { useState, useRef } from 'react';
import { X, Leaf, AlertTriangle, CheckCircle, Trash2, ScanLine, Upload, Activity, Stethoscope, ClipboardList, Calendar } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Plant } from "../types";

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
  onDelete: () => void;
  onScan: (imageFile: File) => void;
  onDeleteLog: (logId: number) => void; // New prop for deleting scans
}

export function PlantDetailModal({ plant, onClose, onDelete, onScan, onDeleteLog }: PlantDetailModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  if (!plant) return null;

  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      onScan(file);
      setTimeout(() => setIsScanning(false), 3000);
    }
  };

  const isHealthy = plant.healthScore >= 7;
  const sortedLogs = [...(plant.logs || [])].sort((a, b) => 
    new Date(a.scanDate).getTime() - new Date(b.scanDate).getTime()
  );
  
  const latestLog = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1] : null;
  const chartData = sortedLogs.map(log => ({
    date: new Date(log.scanDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    health: log.healthScore
  }));

  const displayImage = plant.imageUrl 
    ? `http://localhost:8080${plant.imageUrl}` 
    : "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1080";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        
        {/* Header Section (Always Visible) */}
        <div className="relative h-64 shrink-0">
          <img src={displayImage} alt={plant.nickname} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/30 text-white transition-colors">
            <X className="size-5" />
          </button>
          
          {isScanning && (
            <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center">
              <ScanLine className="size-12 text-primary animate-pulse mb-3" />
              <p className="text-white font-medium text-lg">Hurbee is analyzing...</p>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h2 className="text-3xl font-bold text-foreground mb-1">{plant.nickname}</h2>
            <p className="text-lg text-muted-foreground/80 font-medium italic">{plant.species}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border bg-muted/30">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-black/5'}`}
          >
            <Activity className="size-4" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-black/5'}`}
          >
            <ClipboardList className="size-4" /> Scan History
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
              {/* Health Banner */}
              <div className={`p-4 rounded-2xl border ${isHealthy ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/20'}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${isHealthy ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                    {isHealthy ? <CheckCircle className="size-6 text-primary" /> : <AlertTriangle className="size-6 text-destructive" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">Health Score: {plant.healthScore}/10</h3>
                    <p className="text-sm text-muted-foreground mt-1">Status: {latestLog?.diseaseDetected || "Looking good!"}</p>
                    <div className="mt-3 p-3 bg-background/50 rounded-xl border border-border/50 text-sm italic">
                      "{latestLog?.aiAdvice || "No advice yet. Run a scan!"}"
                    </div>
                  </div>
                </div>
              </div>

              {/* Action & Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border bg-blue-500/5 border-blue-500/20 flex justify-between items-center md:col-span-2">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="size-5 text-blue-500" />
                    <span className="font-bold">New Health Scan</span>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                  >
                    Upload Photo
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleScan} className="hidden" />
                </div>

                <div className="p-5 rounded-2xl bg-secondary/30 border border-border md:col-span-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Growth Stage</p>
                  <p className="text-xl font-black text-foreground">{latestLog?.growthStage || "Sprouting"}</p>
                </div>

                {/* Chart */}
                <div className="p-6 rounded-2xl bg-card border border-border md:col-span-2 shadow-sm h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide domain={[0, 10]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="health" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            /* HISTORY TAB CONTENT */
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              {sortedLogs.length > 0 ? (
                [...sortedLogs].reverse().map((log) => (
                  <div key={log.id} className="group relative p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all">
                    <button 
                      onClick={() => {
                        if(window.confirm("Delete this memory?")) onDeleteLog(log.id)
                      }}
                      className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full md:opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Calendar className="size-4" />
                      <span className="text-xs font-bold">{new Date(log.scanDate).toLocaleDateString()}</span>
                      <span className={`ml-auto mr-8 px-2 py-0.5 rounded-md text-[10px] font-black ${log.healthScore >= 7 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        Score: {log.healthScore}/10
                      </span>
                    </div>
                    <p className="text-sm font-bold">Stage: {log.growthStage}</p>
                    <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">"{log.aiAdvice}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 opacity-30">
                  <ClipboardList className="size-16 mx-auto mb-4" />
                  <p className="font-bold">No history available.</p>
                </div>
              )}
            </div>
          )}

          {/* Global Footer Actions */}
          <div className="pt-4 border-t border-border flex justify-end">
            <button
                onClick={() => window.confirm("Remove this plant from your garden?") && onDelete()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-destructive hover:bg-red-50 rounded-xl transition-colors"
            >
                <Trash2 className="size-4" /> Delete Plant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}