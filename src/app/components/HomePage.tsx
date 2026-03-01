import React from 'react';
import Slider from 'react-slick';
import { Plus, Sprout, ChevronRight, ChevronLeft, Droplets, Leaf } from 'lucide-react';
import { Garden } from '../types';

interface HomePageProps {
  gardens: Garden[];
  onSelectGarden: (index: number) => void;
  onAddGarden: () => void;
}

function NextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all backdrop-blur-sm border border-primary/20"
    >
      <ChevronRight className="size-6" />
    </button>
  );
}

function PrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all backdrop-blur-sm border border-primary/20"
    >
      <ChevronLeft className="size-6" />
    </button>
  );
}

export function HomePage({ gardens, onSelectGarden, onAddGarden }: HomePageProps) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    className: "center",
    centerMode: true,
    centerPadding: "0px",
    focusOnSelect: true,
    customPaging: (i: number) => (
      <div className="mt-6 size-2 rounded-full bg-primary/30 hover:bg-primary/60 transition-all cursor-pointer" />
    ),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-green-950 via-emerald-900 to-slate-900">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <Leaf className="size-5 text-green-400" />
            <span className="text-green-100 font-medium tracking-wider">GROWTH TRACKER</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-400">
            Your Gardens
          </h1>
          <p className="text-green-200/60 max-w-md mx-auto">
            Swipe to select a garden and view detailed health statistics.
          </p>
        </div>

        {/* Carousel Window */}
        <div className="w-full max-w-md mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-3xl blur-xl" />
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl relative z-20">
            <Slider {...settings}>
              {gardens.map((garden, index) => {
                 const healthyCount = garden.plants.filter(p => p.isHealthy).length;
                 const totalPlants = garden.plants.length;
                 
                 return (
                  <div key={garden.id} className="px-2 cursor-pointer" onClick={() => onSelectGarden(index)}>
                    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 h-64 flex flex-col justify-between hover:border-green-500/50 transition-all group">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-green-500/20 rounded-xl text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                          <Sprout className="size-6" />
                        </div>
                        <div className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-green-200 border border-white/5">
                          {garden.plants.length} Plants
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-2xl font-semibold text-white group-hover:text-green-300 transition-colors">
                          {garden.name}
                        </h3>
                        <p className="text-green-200/50 text-sm">
                          {garden.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-green-200/70">
                        <div className="flex items-center gap-1.5">
                          <Droplets className="size-4 text-blue-400" />
                          <span>Stats</span>
                        </div>
                        <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-1000" 
                            style={{ width: `${(healthyCount / totalPlants) * 100}%` }}
                          />
                        </div>
                        <span>{Math.round((healthyCount / totalPlants) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        </div>

        {/* Add Garden Button */}
        <button
          onClick={onAddGarden}
          className="group flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-full transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] active:scale-95"
        >
          <div className="bg-white/20 rounded-full p-1 group-hover:scale-110 transition-transform">
            <Plus className="size-5" />
          </div>
          <span className="font-semibold text-lg">Add New Garden</span>
        </button>
      </div>
    </div>
  );
}
