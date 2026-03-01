import { useState } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight, Plus, Sprout, Leaf, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useGardens } from '../context/GardenContext';
import { AddGardenModal } from '../components/AddGardenModal';
import { Garden } from '../types';

function NextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 hover:bg-primary/30 transition-all text-primary hover:scale-110 shadow-lg"
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
      className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 hover:bg-primary/30 transition-all text-primary hover:scale-110 shadow-lg"
    >
      <ChevronLeft className="size-6" />
    </button>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { gardens, addGarden, deleteGarden } = useGardens();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteGarden = (e: React.MouseEvent, gardenId: string, gardenName: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${gardenName}"? This cannot be undone.`)) {
        deleteGarden(gardenId);
    }
  };

  const handleAddGarden = (newGarden: { name: string; location: string; image: string | null }) => {
    addGarden(newGarden);
    setIsModalOpen(false);
  };

  const settings = {
    dots: true,
    infinite: gardens.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: (current: number, next: number) => setCurrentSlide(next),
    customPaging: (i: number) => (
      <div
        className={`mt-4 size-2 rounded-full transition-all ${
          i === currentSlide ? 'bg-primary scale-125' : 'bg-primary/30'
        }`}
      />
    ),
    dotsClass: 'slick-dots !flex !justify-center !items-center gap-2 !bottom-[-30px]',
  };

  // Helper to determine the image source for a garden card
  const getGardenImage = (garden: Garden) => {
    if (garden.image) return garden.image;
    if (garden.plants.length > 0 && garden.plants[0].image) return garden.plants[0].image;
    return null;
  };

  return (
    <div className="min-h-screen bg-background relative font-sans flex flex-col">
      {/* Consistent Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Leaf className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-br from-green-700 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">Growth</h1>
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">
            Dashboard
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="w-full max-w-4xl flex flex-col items-center gap-8 md:gap-12 relative z-10">
          
          {/* Welcome Message */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-2">
              <Sprout className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
              Your Gardens
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Select a garden to monitor health and growth.
            </p>
          </div>

          {/* Carousel Window */}
          {gardens.length > 0 ? (
            <div className="w-full max-w-lg mx-auto relative">
              {/* Window Frame */}
              <div className="relative bg-card rounded-3xl border border-border p-6 shadow-xl">
                <Slider {...settings} className="px-2">
                  {gardens.map((garden) => {
                    const displayImage = getGardenImage(garden);
                    const healthPercentage = garden.plants.length > 0 
                      ? Math.round((garden.plants.filter(p => p.isHealthy).length / garden.plants.length) * 100) 
                      : 0;
                    
                    return (
                      <div key={garden.id} className="outline-none py-2 px-1">
                        <div 
                          onClick={() => navigate(`/garden/${garden.id}`)}
                          className="group relative transform transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-background rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg"
                        >
                          {/* Image Preview */}
                          <div className="h-40 w-full bg-secondary relative overflow-hidden">
                            {displayImage ? (
                               <div className="w-full h-full relative">
                                 <img 
                                   src={displayImage} 
                                   alt={garden.name}
                                   className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                 />
                                 <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                                 <button
                                    onClick={(e) => handleDeleteGarden(e, garden.id, garden.name)}
                                    className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white/90 transition-all opacity-0 group-hover:opacity-100 z-10"
                                    title="Delete Garden"
                                 >
                                    <Trash2 className="size-4" />
                                 </button>
                               </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-secondary relative">
                                 <button
                                    onClick={(e) => handleDeleteGarden(e, garden.id, garden.name)}
                                    className="absolute top-2 right-2 p-2 bg-black/10 hover:bg-red-500/80 backdrop-blur-md rounded-full text-foreground/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                                    title="Delete Garden"
                                 >
                                    <Trash2 className="size-4" />
                                 </button>
                                 <Leaf className="size-12 text-muted-foreground/30" />
                              </div>
                            )}
                            
                            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                                 <span className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-foreground border border-border">
                                    {garden.location}
                                 </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{garden.name}</h3>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <Sprout className="size-3.5" />
                                      <span>{garden.plants.length} Plants</span>
                                  </div>
                              </div>
                              
                              {/* Mini Status Bar */}
                              <div className="space-y-2">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>Health Status</span>
                                      <span>{healthPercentage}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                      <div 
                                          className="h-full bg-primary transition-all duration-500"
                                          style={{ width: `${healthPercentage}%` }} 
                                      />
                                  </div>
                              </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Slider>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg mx-auto bg-card rounded-3xl border border-border p-8 text-center shadow-sm">
                <Leaf className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Gardens Yet</h3>
                <p className="text-muted-foreground text-sm">Create your first garden to get started!</p>
            </div>
          )}

          {/* Add Garden Button */}
          <button 
              onClick={() => setIsModalOpen(true)} 
              className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 active:scale-95"
          >
            <Plus className="size-5" />
            <span>Add New Garden</span>
          </button>

          {/* Add Garden Modal */}
          {isModalOpen && (
            <AddGardenModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)}
              onAdd={handleAddGarden} 
            />
          )}

        </div>
      </div>
    </div>
  );
}
