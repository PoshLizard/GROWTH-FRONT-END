import { Sprout, Plus, LayoutGrid, Sun, Droplets, Moon, Star } from "lucide-react";
import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { Garden, Plant } from "../types";
import { PlantCard } from "./PlantCard";
import hurbeeIcon from '../../images/hurbee.gif';

interface GardenSlideProps {
  garden: Garden;
  onPlantClick: (plantId: string) => void;
  onAddPlant?: () => void;
  onChatClick?: () => void;
}

interface Bug {
  id: number;
  type: 'bee' | 'butterfly' | 'firefly';
  startTop: number; // percentage
  startLeft?: number; // percentage (for static bugs like fireflies)
  duration: number; // seconds
  direction: 'left' | 'right' | 'static';
  color?: string; // for butterflies
}

export function GardenSlide({ garden, onPlantClick, onAddPlant, onChatClick }: GardenSlideProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'garden'>('garden');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<{id: number, top: number, left: number, size: number, opacity: number, delay: number}[]>([]);
  const [grassTufts, setGrassTufts] = useState<{id: number, left: number, bottom: number, height: number, delay: number, rotation: number, color: string, zIndex: number}[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');
  const [bugs, setBugs] = useState<Bug[]>([]);
  
  // Layout Constants
  const ITEM_GAP = 180; // Distance between signs
  const FOREGROUND_THRESHOLD = 8; // Grass below this % is in front of signs

  // Scroll to center on mount
  useLayoutEffect(() => {
    if (viewMode === 'garden' && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollCenter = (container.scrollWidth - container.clientWidth) / 2;
        container.scrollLeft = scrollCenter;
    }
  }, [viewMode, garden.plants.length]);

  // Determine time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) setTimeOfDay('dawn');
    else if (hour >= 8 && hour < 17) setTimeOfDay('day');
    else if (hour >= 17 && hour < 20) setTimeOfDay('dusk');
    else setTimeOfDay('night');
  }, []);

  useEffect(() => {
    // 1. Stars (Only at night)
    if (timeOfDay === 'night') {
        setStars(Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            top: Math.random() * 50,
            left: Math.random() * 100,
            size: Math.random() * 2 + 1,
            opacity: Math.random(),
            delay: Math.random() * 3
        })));
    } else {
        setStars([]);
    }

    // 2. Optimized Grass Field Generation
    const clumpCount = 200; 
    const bladesPerClump = 3; 
    const newTufts = [];
    let idCounter = 0;

    for (let i = 0; i < clumpCount; i++) {
        const r = Math.random();
        // Depth: 0% to 35% from bottom
        const clumpBottom = (1 - Math.pow(r, 1.5)) * 35; 
        const clumpLeft = Math.random() * 100;
        
        // Scale based on depth (back = smaller)
        const scale = Math.max(0.4, 1 - (clumpBottom / 35)); 
        
        let colors = ['bg-emerald-600', 'bg-green-600', 'bg-[#4ade80]', 'bg-[#22c55e]'];
        if (timeOfDay === 'night') {
            colors = ['bg-emerald-900', 'bg-green-900', 'bg-[#064e3b]', 'bg-[#14532d]'];
        } else if (timeOfDay === 'dusk') {
            colors = ['bg-emerald-700', 'bg-green-700', 'bg-[#b91c1c]/20', 'bg-[#047857]'];
        }

        // Generate blades for this clump
        for (let j = 0; j < bladesPerClump; j++) {
            // Random offset within the clump
            const offsetLeft = (Math.random() - 0.5) * 0.8 * scale; 
            
            // Random height
            const height = (20 + Math.random() * 40) * scale;
            
            const rotation = (Math.random() - 0.5) * 60; // +/- 30 degrees
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            newTufts.push({
                id: idCounter++,
                left: Math.max(0, Math.min(100, clumpLeft + offsetLeft)),
                bottom: clumpBottom, 
                height: height,
                delay: Math.random() * 3,
                rotation: rotation,
                color: color,
                zIndex: Math.floor(100 - clumpBottom)
            });
        }
    }
    
    setGrassTufts(newTufts.sort((a, b) => b.bottom - a.bottom));
  }, [timeOfDay]);

  // 3. Bug Spawning System
  useEffect(() => {
    const spawnInterval = setInterval(() => {
        setBugs(currentBugs => {
            // Cleanup finished bugs
            const now = Date.now();
            // Add a 1000ms buffer to allow the CSS animation (which uses forwards) to fully complete and sit at opacity:0
            const activeBugs = currentBugs.filter(b => now - b.id < (b.duration * 1000) + 1000);
            
            // Limit max bugs
            if (activeBugs.length >= 6) return activeBugs;
            
            // Random chance to spawn
            if (Math.random() > 0.4) return activeBugs;

            let type: 'bee' | 'butterfly' | 'firefly';
            if (timeOfDay === 'night') {
                type = 'firefly';
            } else if (timeOfDay === 'dusk') {
                 type = 'firefly';
            } else {
                type = Math.random() > 0.6 ? 'bee' : 'butterfly';
            }

            const direction = Math.random() > 0.5 ? 'right' : 'left';
            const id = Date.now();
            
            // Bug Configs
            let duration = 5;
            let startTop = 20 + Math.random() * 40; // 20-60% height
            let startLeft = undefined;
            let color = undefined;

            if (type === 'firefly') {
                duration = 4 + Math.random() * 4; // 4-8s linger
                startTop = 30 + Math.random() * 40;
                startLeft = Math.random() * 90 + 5;
            } else if (type === 'bee') {
                duration = 3 + Math.random() * 2; // Fast 3-5s
            } else if (type === 'butterfly') {
                duration = 8 + Math.random() * 5; // Slow 8-13s
                const colors = ['#60a5fa', '#fb923c', '#f472b6', '#facc15', '#e2e8f0'];
                color = colors[Math.floor(Math.random() * colors.length)];
            }

            return [...activeBugs, {
                id,
                type,
                startTop,
                startLeft,
                duration,
                direction: type === 'firefly' ? 'static' : direction,
                color
            }];
        });
    }, 2000);

    return () => clearInterval(spawnInterval);
  }, [timeOfDay]);


  const healthyCount = garden.plants.filter(p => p.isHealthy).length;
  const totalPlants = garden.plants.length;

  const requiredWidth = useMemo(() => {
     const maxPairs = Math.ceil(garden.plants.length / 2);
     return (maxPairs * ITEM_GAP * 2) + 600; 
  }, [garden.plants.length]);

  const plantPositions = useMemo(() => {
    return garden.plants.map((plant, index) => {
        const dir = index % 2 === 0 ? -1 : 1;
        const multiplier = Math.floor(index / 2) + 1;
        const offset = dir * multiplier * ITEM_GAP;
        return { plant, offset };
    });
  }, [garden.plants]);

  // Dynamic Styles based on time
  const getSkyGradient = () => {
      switch(timeOfDay) {
          case 'dawn': return 'from-indigo-400 via-purple-300 to-orange-200';
          case 'day': return 'from-[#0ea5e9] via-[#38bdf8] to-[#bae6fd]';
          case 'dusk': return 'from-slate-800 via-purple-900 to-orange-500';
          case 'night': return 'from-slate-950 via-slate-900 to-[#0f172a]';
      }
  };

  const getHillColors = () => {
      switch(timeOfDay) {
          case 'night': return ['bg-[#022c22]', 'bg-[#064e3b]', 'from-[#022c22] to-[#064e3b]']; 
          case 'dusk': return ['bg-[#14532d]', 'bg-[#15803d]', 'from-[#14532d] to-[#15803d]'];
          default: return ['bg-[#15803d]', 'bg-[#16a34a]', 'from-[#15803d] to-[#16a34a]'];
      }
  };
  const hillColors = getHillColors();

  return (
    <div className="px-4 pb-8 w-full max-w-[1400px] mx-auto">
      <style>{`
        @keyframes sway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
        @keyframes sway-grass { 0%, 100% { transform: rotate(-12deg); } 50% { transform: rotate(12deg); } }
        @keyframes pop-up { 0% { transform: scale(0) translateY(100px); opacity: 0; } 60% { transform: scale(1.1) translateY(-10px); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        @keyframes wood-creak { 0% { transform: rotate(0deg); } 25% { transform: rotate(0.5deg); } 75% { transform: rotate(-0.5deg); } 100% { transform: rotate(0deg); } }
        
        /* Bug Animations */
        @keyframes fly-right { from { left: -5%; } to { left: 105%; } }
        @keyframes fly-left { from { left: 105%; } to { left: -5%; } }
        @keyframes bob-vertical { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes wing-flutter { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.5); } }
        @keyframes bee-buzz { 0%, 100% { transform: translate(0,0); } 25% { transform: translate(1px, -1px); } 75% { transform: translate(-1px, 1px); } }
        
        /* Updated firefly drift with smoother exit */
        @keyframes firefly-drift { 
            0% { transform: translate(0,0); opacity: 0; } 
            20% { opacity: 1; } 
            70% { opacity: 1; } 
            100% { transform: translate(30px, -30px); opacity: 0; } 
        }
        
        @keyframes glow-pulse { 0%, 100% { opacity: 0.5; r: 2.5; } 50% { opacity: 1; r: 3.5; } }
        @keyframes butterfly-wing-flap { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(0.2); } }

        .animate-sway { animation: sway 4s ease-in-out infinite; transform-origin: bottom center; }
        .animate-sway-grass { animation: sway-grass 3s ease-in-out infinite; transform-origin: bottom center; }
        .animate-pop { animation: pop-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; transform-origin: bottom center; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-creak:hover { animation: wood-creak 0.5s ease-in-out; }
        
        .field-scroll::-webkit-scrollbar { height: 12px; }
        .field-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .field-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.5); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
        .field-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.8); }

        .wood-texture {
            background-color: #8D6E63;
            background-image: 
                repeating-linear-gradient(90deg, transparent 0, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px),
                repeating-linear-gradient(0deg, transparent 0, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 40px);
            box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
        }
        .wood-post-texture {
            background-color: #5D4037;
            background-image: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 3px);
        }
        .grass-blade { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
      `}</style>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
           <h2 className="text-3xl font-bold text-foreground flex items-center gap-2 justify-center md:justify-start">
              {garden.name}
              <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full border border-border">
                 {garden.location}
              </span>
           </h2>
           <p className="text-muted-foreground text-sm mt-1">
              {healthyCount} of {totalPlants} plants healthy
           </p>
        </div>

        <div className="flex bg-secondary/50 p-1 rounded-xl border border-border">
          <button onClick={() => setViewMode('garden')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${viewMode === 'garden' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}>
             <Sprout className="size-4" /> <span>Living Garden</span>
          </button>
          <button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}>
             <LayoutGrid className="size-4" /> <span>Grid View</span>
          </button>
        </div>
      </div>

      {viewMode === 'garden' && (
        <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 bg-sky-300 isolate group/container">
            <div ref={scrollContainerRef} className="field-scroll overflow-x-auto overflow-y-hidden w-full h-full relative scroll-smooth">
                <div className="relative h-full mx-auto" style={{ width: '100%', minWidth: `${requiredWidth}px` }}>
                    
                    {/* 1. Sky & Celestial Bodies */}
                    <div className="sticky left-0 top-0 w-full h-full -z-50 overflow-hidden transition-colors duration-1000">
                        <div className={`absolute inset-0 bg-gradient-to-b ${getSkyGradient()} transition-all duration-1000`} />
                        
                        {/* Sun or Moon */}
                        <div className="absolute left-[8%] top-[8%] flex items-center justify-center transition-all duration-1000">
                            {timeOfDay === 'night' ? (
                                <div className="relative size-24 md:size-32">
                                    <div className="absolute inset-0 bg-blue-100 blur-3xl opacity-20 scale-[1.5] rounded-full" />
                                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
                                        <defs>
                                            <radialGradient id="moon-gradient" cx="25%" cy="25%" r="80%">
                                                <stop offset="0%" stopColor="#ffffff" />
                                                <stop offset="100%" stopColor="#e2e8f0" />
                                            </radialGradient>
                                            <filter id="crater-shadow">
                                                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
                                                <feOffset dx="0.5" dy="0.5" result="offsetblur" />
                                                <feFlood floodColor="rgba(0,0,0,0.2)" />
                                                <feComposite in2="offsetblur" operator="in" />
                                                <feMerge>
                                                    <feMergeNode />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        {/* Main Body */}
                                        <circle cx="50" cy="50" r="45" fill="url(#moon-gradient)" stroke="#cbd5e1" strokeWidth="1" />
                                        
                                        {/* Craters */}
                                        <g fill="#cbd5e1" filter="url(#crater-shadow)">
                                            <circle cx="30" cy="35" r="8" opacity="0.8" />
                                            <circle cx="65" cy="25" r="5" opacity="0.6" />
                                            <circle cx="70" cy="60" r="12" opacity="0.8" />
                                            <circle cx="30" cy="75" r="6" opacity="0.7" />
                                            <circle cx="50" cy="55" r="4" opacity="0.5" />
                                            <circle cx="85" cy="45" r="3" opacity="0.6" />
                                        </g>
                                    </svg>
                                </div>
                            ) : (
                                <div className="relative size-32 md:size-48">
                                    <div className={`absolute inset-0 ${timeOfDay === 'dusk' ? 'bg-orange-500' : 'bg-yellow-400'} blur-3xl opacity-40 scale-[1.5] rounded-full animate-pulse`} />
                                    <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_60s_linear_infinite] overflow-visible">
                                        <defs>
                                            <radialGradient id="sun-gradient" cx="50%" cy="50%" r="50%">
                                                <stop offset="0%" stopColor="#FFFBEB" />
                                                <stop offset="70%" stopColor={timeOfDay === 'dusk' ? "#FB923C" : "#FCD34D"} />
                                                <stop offset="100%" stopColor={timeOfDay === 'dusk' ? "#EA580C" : "#F59E0B"} />
                                            </radialGradient>
                                        </defs>
                                        
                                        {/* Rays (Layer 1 - Long) */}
                                        {[...Array(12)].map((_, i) => (
                                            <path key={`l1-${i}`} d="M50 10 L54 22 L50 24 L46 22 Z" fill={timeOfDay === 'dusk' ? "#F97316" : "#FBBF24"} transform={`rotate(${i * 30} 50 50)`} />
                                        ))}
                                        
                                        {/* Rays (Layer 2 - Short) */}
                                        {[...Array(12)].map((_, i) => (
                                            <path key={`l2-${i}`} d="M50 18 L53 25 L50 26 L47 25 Z" fill={timeOfDay === 'dusk' ? "#FDBA74" : "#FDE68A"} transform={`rotate(${i * 30 + 15} 50 50)`} />
                                        ))}

                                        {/* Core Sun */}
                                        <circle cx="50" cy="50" r="24" fill="url(#sun-gradient)" stroke={timeOfDay === 'dusk' ? "#C2410C" : "#D97706"} strokeWidth="1" />
                                        
                                        {/* Inner Highlight for depth */}
                                        <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Stars */}
                        {stars.map((star) => (
                            <div key={star.id} className="absolute bg-white rounded-full animate-twinkle"
                                style={{ top: `${star.top}%`, left: `${star.left}%`, width: `${star.size}px`, height: `${star.size}px`, animationDelay: `${star.delay}s` }}
                            />
                        ))}
                    </div>

                    {/* 2. Hills (Lowered: 40%, 25%, 10%) */}
                    <div className={`absolute bottom-0 left-0 w-full h-[40%] ${hillColors[0]} origin-bottom -z-20 transition-colors duration-1000`} 
                         style={{ borderRadius: '60% 40% 0 0 / 15% 10% 0 0' }} />
                    <div className={`absolute bottom-0 left-0 w-full h-[25%] ${hillColors[1]} origin-bottom -z-10 transition-colors duration-1000`} 
                         style={{ borderRadius: '30% 70% 0 0 / 20% 30% 0 0' }} />
                    <div className={`absolute bottom-0 left-0 w-full h-[10%] bg-gradient-to-t ${hillColors[2]} -z-10 transition-colors duration-1000`} />

                    {/* 3. Background Grass (Lowered threshold) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {grassTufts.filter(t => t.bottom > FOREGROUND_THRESHOLD).map((tuft) => (
                            <div key={tuft.id} className={`grass-blade absolute w-[4px] origin-bottom animate-sway-grass shadow-sm ${tuft.color} transition-colors duration-1000`}
                                style={{ left: `${tuft.left}%`, bottom: `${tuft.bottom}%`, height: `${tuft.height * 0.9}px`, animationDelay: `${tuft.delay}s`, transform: `rotate(${tuft.rotation}deg)`, zIndex: 0 }}
                            />
                        ))}
                    </div>

                    {/* 4. BUG LAYER */}
                    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                        {bugs.map((bug) => (
                            <div key={bug.id} 
                                className="absolute"
                                style={{ 
                                    top: `${bug.startTop}%`,
                                    left: bug.type === 'firefly' ? `${bug.startLeft}%` : undefined,
                                    animation: bug.direction === 'static' 
                                        ? `firefly-drift ${bug.duration}s ease-in-out forwards` 
                                        : `${bug.direction === 'right' ? 'fly-right' : 'fly-left'} ${bug.duration}s linear forwards`
                                }}
                            >
                                <div className={`relative ${bug.direction === 'left' ? 'scale-x-[-1]' : ''}`}>
                                    {bug.type === 'bee' && (
                                        <div className="w-10 h-10 animate-[bob-vertical_1s_ease-in-out_infinite]">
                                            <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-sm overflow-visible">
                                                {/* Wings - Flapping very fast */}
                                                <path d="M12 10 Q 16 0 22 8 Q 18 14 12 12" fill="white" fillOpacity="0.8" stroke="white" strokeWidth="1" className="animate-[wing-flutter_0.1s_linear_infinite] origin-bottom" />
                                                <path d="M14 10 Q 18 2 24 8 Q 20 16 14 12" fill="white" fillOpacity="0.6" stroke="white" strokeWidth="1" className="animate-[wing-flutter_0.15s_linear_infinite] origin-bottom" />
                                                
                                                {/* Legs */}
                                                <path d="M14 20 L14 24 M18 20 L18 24 M22 20 L22 24" stroke="black" strokeWidth="1" />
                                                
                                                {/* Body Group */}
                                                <g className="animate-[bee-buzz_0.1s_linear_infinite]">
                                                    {/* Stinger */}
                                                    <path d="M10 18 L6 18 L10 16" fill="black" />
                                                    {/* Body */}
                                                    <ellipse cx="18" cy="18" rx="8" ry="5" fill="#FACC15" stroke="black" strokeWidth="1" />
                                                    {/* Stripes */}
                                                    <path d="M16 14 Q 15 22 16 22" stroke="black" strokeWidth="2.5" fill="none" />
                                                    <path d="M20 14 Q 19 22 20 22" stroke="black" strokeWidth="2.5" fill="none" />
                                                    {/* Eye */}
                                                    <circle cx="23" cy="16" r="1.5" fill="black" />
                                                </g>
                                            </svg>
                                        </div>
                                    )}

                                    {bug.type === 'butterfly' && (
                                        <div className="w-12 h-12 animate-[bob-vertical_2s_ease-in-out_infinite]">
                                            <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md overflow-visible">
                                                 {/* Back Wing */}
                                                <path d="M16 16 C 24 0 34 8 28 20 C 26 28 16 26 16 16" fill={bug.color} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" className="animate-[butterfly-wing-flap_0.4s_ease-in-out_infinite] origin-center delay-75" />
                                                
                                                {/* Body */}
                                                <path d="M14 14 Q 16 18 18 24" stroke="#4a2c2a" strokeWidth="2" strokeLinecap="round" />
                                                
                                                {/* Front Wing */}
                                                <path d="M14 16 C 6 -4 0 4 6 22 C 10 30 14 26 14 16" fill={bug.color} filter="brightness(1.1)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" className="animate-[butterfly-wing-flap_0.4s_ease-in-out_infinite] origin-center" />
                                                
                                                {/* Antennae */}
                                                <path d="M14 14 L10 10 M14 14 L16 10" stroke="#4a2c2a" strokeWidth="1" />
                                            </svg>
                                        </div>
                                    )}

                                    {bug.type === 'firefly' && (
                                        <div className="w-8 h-8 animate-[bob-vertical_3s_ease-in-out_infinite]">
                                            <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible">
                                                {/* Glow Halo */}
                                                <g className="animate-pulse">
                                                    <circle cx="12" cy="14" r="8" fill="#bef264" fillOpacity="0.2" className="animate-ping" style={{ animationDuration: '3s' }} />
                                                    <circle cx="12" cy="14" r="5" fill="#bef264" fillOpacity="0.4" className="blur-sm" />
                                                </g>
                                                {/* Body */}
                                                <ellipse cx="12" cy="12" rx="3" ry="5" fill="#3f3f46" />
                                                {/* Light Bulb (Abdomen) */}
                                                <circle cx="12" cy="15" r="2.5" fill="#d9f99d" className="animate-[glow-pulse_2s_ease-in-out_infinite]" />
                                                {/* Wings (folded) */}
                                                <path d="M12 10 L 9 8 M12 10 L 15 8" stroke="white" strokeWidth="1" opacity="0.5" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 5. Signs Layer (Lowered to bottom-5%) */}
                    <div className="absolute inset-x-0 bottom-[5%] h-[300px] z-10">
                        {/* Center "New Plot" */}
                        <div className="absolute bottom-0 flex flex-col items-center group cursor-pointer animate-pop z-20"
                            style={{ left: '50%', transform: 'translateX(-50%)' }}
                            onClick={onAddPlant}
                        >
                             {/* Hurbee Character */}
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChatClick?.();
                                }}
                                className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-24 z-0 cursor-pointer transition-transform hover:scale-110 hover:-translate-y-2 active:scale-95 animate-[sway_3s_ease-in-out_infinite]"
                                title="Chat with Hurbee!"
                            >
                                <img src={hurbeeIcon} alt="Hurbee" className="w-full h-full object-contain drop-shadow-lg" />
                                {/* Speech Bubble Hint */}
                                <div className="absolute -top-8 -right-8 bg-white px-2 py-1 rounded-lg text-xs font-bold text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Need help?
                                    <div className="absolute bottom-[-4px] left-2 w-2 h-2 bg-white rotate-45" />
                                </div>
                            </div>

                            <div className="wood-texture relative w-28 h-28 md:w-32 md:h-32 rounded border-4 border-[#5D4037] shadow-xl flex flex-col items-center justify-center gap-1 group-hover:brightness-110 transition-all z-10 relative">
                                <Plus className="size-10 text-[#3E2723] group-hover:rotate-90 transition-transform duration-300 drop-shadow-sm" />
                                <span className="text-[#3E2723] font-black text-xs uppercase tracking-widest text-center px-2 drop-shadow-sm">New Plot</span>
                                {/* Nail details */}
                                <div className="absolute top-2 left-2 size-1.5 bg-[#3E2723] rounded-full opacity-70 shadow-inner" />
                                <div className="absolute top-2 right-2 size-1.5 bg-[#3E2723] rounded-full opacity-70 shadow-inner" />
                                <div className="absolute bottom-2 left-2 size-1.5 bg-[#3E2723] rounded-full opacity-70 shadow-inner" />
                                <div className="absolute bottom-2 right-2 size-1.5 bg-[#3E2723] rounded-full opacity-70 shadow-inner" />
                            </div>
                            <div className="wood-post-texture w-4 h-24 mt-[-2px] shadow-lg z-0 relative border-x border-[#3E2723]">
                                <div className={`absolute bottom-0 -left-2 w-8 h-4 ${hillColors[0]} rounded-t-full blur-[1px] transition-colors duration-1000`} />
                            </div>
                        </div>

                        {/* Plant Signs */}
                        {plantPositions.map(({ plant, offset }, i) => (
                            <div key={plant.id} onClick={() => onPlantClick(plant.id)}
                                className="absolute bottom-0 flex flex-col items-center group cursor-pointer animate-pop hover:z-50"
                                style={{ left: '50%', marginLeft: `${offset}px`, transform: 'translateX(-50%)', animationDelay: `${i * 0.1}s` }}>
                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white text-black font-bold text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg pointer-events-none z-50">
                                    {plant.nickname}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                                </div>
                                <div className="wood-texture relative p-2 rounded shadow-2xl border-2 border-[#5D4037] transform transition-transform group-hover:scale-105 group-hover:rotate-1 animate-creak origin-bottom z-10">
                                    {/* Nail details */}
                                    <div className="absolute top-1 left-1 size-1 bg-[#3E2723] rounded-full opacity-70" />
                                    <div className="absolute top-1 right-1 size-1 bg-[#3E2723] rounded-full opacity-70" />
                                    
                                    <div className="w-28 h-28 md:w-32 md:h-32 bg-stone-900 overflow-hidden rounded border border-[#5D4037]/50 relative">
                                        <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                                        {plant.waterLevel < 30 && <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full animate-bounce shadow-md border border-white"><Droplets className="size-4" /></div>}
                                    </div>
                                    <div className="mt-1 bg-[#4E342E] py-0.5 px-2 rounded-sm text-center shadow-inner border border-[#3E2723]/30">
                                        <span className="text-[10px] text-[#FFECB3] uppercase tracking-wider font-semibold block truncate max-w-[110px] drop-shadow-sm">{plant.name || 'Plant'}</span>
                                    </div>
                                </div>
                                <div className="wood-post-texture w-4 h-24 mt-[-2px] shadow-lg relative border-x border-[#3E2723] z-0">
                                    <div className={`absolute bottom-0 w-full h-8 bg-gradient-to-t ${hillColors[2].replace('bg-gradient-to-t ', '')} to-transparent opacity-100`} />
                                    <div className={`absolute -bottom-1 -left-3 w-3 h-8 ${hillColors[1]} rounded-t-full rotate-[-15deg] blur-[1px]`} />
                                    <div className={`absolute -bottom-1 -right-3 w-3 h-6 ${hillColors[1]} rounded-t-full rotate-[15deg] blur-[1px]`} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 5. Foreground Grass (Lowered threshold) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                        {grassTufts.filter(t => t.bottom <= FOREGROUND_THRESHOLD).map((tuft) => (
                            <div key={tuft.id} className={`grass-blade absolute w-[4px] origin-bottom animate-sway-grass shadow-sm ${tuft.color} transition-colors duration-1000`}
                                style={{ left: `${tuft.left}%`, bottom: `${tuft.bottom}%`, height: `${tuft.height}px`, animationDelay: `${tuft.delay}s`, transform: `rotate(${tuft.rotation}deg)` }}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
          {garden.plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} onClick={() => onPlantClick(plant.id)} />
          ))}
          <button onClick={onAddPlant} className="flex flex-col items-center justify-center min-h-[300px] rounded-xl border-2 border-dashed border-border bg-card/30 hover:border-primary/50 hover:bg-primary/5 transition-all group">
            <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4 group-hover:scale-110 duration-300">
               <Plus className="size-8 text-primary" />
            </div>
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">Add New Plant</p>
          </button>
        </div>
      )}
    </div>
  );
}
