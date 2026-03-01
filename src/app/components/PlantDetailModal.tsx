import { useState, useRef } from 'react';
import { X, Leaf, Droplets, AlertTriangle, CheckCircle, Trash2, ScanLine, Upload, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Plant } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
  onWater: () => void;
  onDelete: () => void;
  onScan: (image: string) => void;
}

// Fallback data for demonstration purposes if a plant has no history
const DEMO_GROWTH_DATA = [
  { date: 'Week 1', height: 4.2 },
  { date: 'Week 2', height: 5.5 },
  { date: 'Week 3', height: 6.8 },
  { date: 'Week 4', height: 9.1 },
  { date: 'Week 5', height: 11.4 },
  { date: 'Week 6', height: 12.8 },
];

const DEMO_HEALTH_DATA = [
  { date: 'Week 1', health: 95 },
  { date: 'Week 2', health: 92 },
  { date: 'Week 3', health: 96 },
  { date: 'Week 4', health: 85 },
  { date: 'Week 5', health: 88 },
  { date: 'Week 6', health: 94 },
];

export function PlantDetailModal({ plant, onClose, onWater, onDelete, onScan }: PlantDetailModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [graphType, setGraphType] = useState<'growth' | 'health'>('growth');

  if (!plant) return null;

  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      // Simulate scan delay
      setTimeout(() => {
        const imageUrl = URL.createObjectURL(file);
        onScan(imageUrl);
        setIsScanning(false);
      }, 2000);
    }
  };

  // Helper to determine status color based on lastWatered string
  const getWaterStatus = (lastWatered: string) => {
    const normalized = lastWatered.toLowerCase();
    
    // Green: Just now, Today, 1 day ago
    if (normalized.includes('just now') || normalized.includes('today') || normalized.includes('1 day')) {
      return { 
        bg: 'bg-green-500/10', 
        border: 'border-green-500/30', 
        icon: 'text-green-600',
        text: 'text-green-700'
      };
    }
    
    // Yellow: 2-3 days ago
    if (normalized.includes('2 days') || normalized.includes('3 days')) {
      return { 
        bg: 'bg-yellow-500/10', 
        border: 'border-yellow-500/30', 
        icon: 'text-yellow-600',
        text: 'text-yellow-700'
      };
    }
    
    // Red: 4+ days, or anything else implies neglect
    return { 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/30', 
      icon: 'text-red-600',
      text: 'text-red-700'
    };
  };

  const getScanStatus = (lastScanned?: string) => {
    if (!lastScanned) return { status: 'due', label: 'Scan Required', bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive' };
    
    const normalized = lastScanned.toLowerCase();
    if (normalized.includes('week') || normalized.includes('month') || normalized.includes('year')) {
        return { status: 'due', label: 'Update Diagnosis', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-600' };
    }
    return { status: 'ok', label: 'Vitals Current', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-600' };
  };

  const status = getWaterStatus(plant.lastWatered);
  const scanStatus = getScanStatus(plant.lastScanned);
  
  // Select chart data based on graph type
  const chartData = graphType === 'growth'
    ? ((plant.growthHistory && plant.growthHistory.length > 0) ? plant.growthHistory : DEMO_GROWTH_DATA)
    : DEMO_HEALTH_DATA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/30 text-white transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Plant Image */}
        <div className="h-72 overflow-hidden relative shrink-0">
          <img
            src={plant.image}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-black/50 z-20 flex flex-col items-center justify-center">
              <ScanLine className="size-12 text-primary animate-pulse mb-3" />
              <p className="text-white font-medium text-lg">Analyzing Plant Vitals...</p>
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-1">{plant.name}</h2>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <p className="text-lg text-muted-foreground/80 font-medium">{plant.type}</p>
                {plant.scientificName && (
                    <p className="text-sm text-muted-foreground/60 italic font-serif tracking-wide">{plant.scientificName}</p>
                )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Health Status Banner */}
          <div className={`p-4 rounded-2xl border ${
            plant.isHealthy 
              ? 'bg-primary/5 border-primary/20' 
              : 'bg-destructive/5 border-destructive/20'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full shrink-0 ${plant.isHealthy ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                {plant.isHealthy ? (
                  <CheckCircle className="size-6 text-primary" />
                ) : (
                  <AlertTriangle className="size-6 text-destructive" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {plant.isHealthy ? 'Plant is in good health' : 'Needs Attention'}
                </h3>
                {plant.isHealthy ? (
                    <p className="text-sm text-muted-foreground mt-1">
                        All vitals are within optimal range. Keep up the good work!
                    </p>
                ) : (
                    <div className="mt-2 text-sm text-muted-foreground">
                        <p className="font-medium mb-2 text-foreground/80">{plant.healthIssue}</p>
                        {plant.healthRecommendations && plant.healthRecommendations.length > 0 && (
                             <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                                <p className="text-xs uppercase tracking-wider font-semibold mb-2 opacity-70">Recovery Plan:</p>
                                <ul className="space-y-1.5">
                                    {plant.healthRecommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <div className="size-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                             </div>
                        )}
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Diagnosis / Scan Card */}
            <div className={`p-5 rounded-2xl border transition-colors md:col-span-2 ${scanStatus.bg} ${scanStatus.border}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-background/50 ${scanStatus.text}`}>
                    <Activity className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider opacity-70">Diagnosis Status</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-xl font-bold text-foreground`}>{scanStatus.label}</p>
                      {plant.lastScanned && (
                         <span className="text-sm font-normal text-muted-foreground">({plant.lastScanned})</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="px-5 py-2.5 rounded-xl bg-background/60 hover:bg-background/80 text-foreground font-medium text-sm transition-all shadow-sm border border-black/5 hover:border-black/10 active:scale-95 flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center"
                >
                  <Upload className="size-4" />
                  {isScanning ? 'Scanning...' : 'Upload New Photo'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleScan}
                    className="hidden"
                />
              </div>
            </div>

            {/* Last Watered Section */}
            <div className={`p-5 rounded-2xl border transition-colors duration-500 ${status.bg} ${status.border}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-background/50 ${status.icon}`}>
                    <Droplets className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider opacity-70">Last Watered</p>
                    <p className={`text-xl font-bold ${status.text}`}>{plant.lastWatered}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onWater}
                className="w-full py-2.5 rounded-xl bg-background/60 hover:bg-background/80 text-foreground font-medium text-sm transition-all shadow-sm border border-black/5 hover:border-black/10 active:scale-95 flex items-center justify-center gap-2"
              >
                <Droplets className="size-4 text-blue-500" />
                Water Plant
              </button>
            </div>



            {/* Growth Stage */}
            <div className="p-5 rounded-2xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-3 h-full">
                <div className="p-2.5 rounded-xl bg-chart-2/20">
                  <Leaf className="size-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Growth Stage</p>
                  <p className="text-xl font-bold text-foreground capitalize">{plant.growthStage}</p>
                </div>
              </div>
            </div>
            
            {/* Interactive Graph - Toggleable */}
            <div className="p-6 rounded-2xl bg-card border border-border md:col-span-2 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${graphType === 'growth' ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                            <Activity className={`size-5 ${graphType === 'growth' ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider opacity-70">
                                {graphType === 'growth' ? 'Growth History' : 'Health History'}
                            </p>
                            <p className="text-xl font-bold text-foreground">
                                {graphType === 'growth' ? 'Height over time' : 'Health Score over time'}
                            </p>
                        </div>
                    </div>
                    
                    <Select value={graphType} onValueChange={(v) => setGraphType(v as 'growth' | 'health')}>
                        <SelectTrigger className="w-[140px] bg-background">
                            <SelectValue placeholder="Select Metric" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="growth">Growth</SelectItem>
                            <SelectItem value="health">Health</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(value) => graphType === 'growth' ? `${value}"` : `${value}%`}
                                domain={graphType === 'growth' ? ['auto', 'auto'] : [0, 100]}
                                dx={-10}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#000', fontWeight: 600 }}
                                cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '4 4' }}
                                formatter={(value: number) => [
                                    graphType === 'growth' ? `${value} inches` : `${value}%`, 
                                    graphType === 'growth' ? 'Height' : 'Health Score'
                                ]}
                            />
                            <Line 
                                type="monotone" 
                                dataKey={graphType === 'growth' ? "height" : "health"}
                                stroke={graphType === 'growth' ? "#000" : "#2563eb"} 
                                strokeWidth={3}
                                dot={{ r: 6, fill: graphType === 'growth' ? "#000" : "#2563eb", strokeWidth: 0 }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
          </div>
          
          {/* Delete Action */}
          <div className="pt-4 border-t border-border flex justify-end">
            <button
                onClick={() => {
                    if (window.confirm("Are you sure you want to remove this plant?")) {
                        onDelete();
                    }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
                <Trash2 className="size-4" />
                Remove Plant
            </button>
          </div>
        </div>
        
        <style>{`
          @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
