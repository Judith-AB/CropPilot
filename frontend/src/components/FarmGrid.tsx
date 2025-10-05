import { useState, useEffect } from 'react';
import { Plot } from '../App';
import { Sprout, Wheat, Bug, Droplets, Plus, TrendingUp } from 'lucide-react';

interface FarmGridProps {
  plots: Plot[];
  selectedPlot: number | null;
  onSelectPlot: (plotId: number) => void;
}

interface PlotAnimation {
  plotId: number;
  type: 'health' | 'moisture' | 'pest';
  value: number;
}

export function FarmGrid({ plots, selectedPlot, onSelectPlot }: FarmGridProps) {
  const [plotAnimations, setPlotAnimations] = useState<PlotAnimation[]>([]);
  const [previousPlots, setPreviousPlots] = useState<Plot[]>([]);

  // Detect changes in plot values and trigger animations
  useEffect(() => {
    if (previousPlots.length > 0) {
      const newAnimations: PlotAnimation[] = [];
      
      plots.forEach(plot => {
        const prevPlot = previousPlots.find(p => p.id === plot.id);
        if (prevPlot) {
          // Check for health changes
          if (plot.health !== prevPlot.health && plot.cropType) {
            newAnimations.push({
              plotId: plot.id,
              type: 'health',
              value: plot.health - prevPlot.health
            });
          }
          
          // Check for moisture changes
          if (Math.abs(plot.soilMoisture - prevPlot.soilMoisture) > 0.05 && plot.cropType) {
            newAnimations.push({
              plotId: plot.id,
              type: 'moisture',
              value: (plot.soilMoisture - prevPlot.soilMoisture) * 100
            });
          }
          
          // Check for pest level changes
          if (Math.abs(plot.pestLevel - prevPlot.pestLevel) > 10 && plot.cropType) {
            newAnimations.push({
              plotId: plot.id,
              type: 'pest',
              value: prevPlot.pestLevel - plot.pestLevel
            });
          }
        }
      });
      
      if (newAnimations.length > 0) {
        setPlotAnimations(newAnimations);
        setTimeout(() => setPlotAnimations([]), 2000);
      }
    }
    
    setPreviousPlots([...plots]);
  }, [plots]);

  const getAnimationForPlot = (plotId: number) => {
    return plotAnimations.filter(anim => anim.plotId === plotId);
  };
  const getCropIcon = (plot: Plot) => {
    if (!plot.cropType) return null;
    
    switch (plot.growthStage) {
      case 1:
      case 2:
        return <Sprout className="h-6 w-6 text-green-600" />;
      case 3:
      case 4:
        return <Sprout className="h-8 w-8 text-green-500" />;
      case 5:
        return <Wheat className="h-8 w-8 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getPlotColor = (plot: Plot) => {
    // Empty plot - soil color based on moisture
    if (!plot.cropType) {
      if (plot.soilMoisture > 0.6) return 'bg-amber-900 border-amber-950'; // Dark wet soil
      if (plot.soilMoisture > 0.4) return 'bg-amber-800 border-amber-900'; // Medium soil
      return 'bg-amber-700 border-amber-800'; // Dry soil
    }
    
    // Plot with crops - color based on health (brown to vibrant green)
    if (plot.health >= 80) return 'bg-gradient-to-br from-green-500 to-green-600 border-green-700';
    if (plot.health >= 60) return 'bg-gradient-to-br from-lime-500 to-lime-600 border-lime-700';
    if (plot.health >= 40) return 'bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-800';
    return 'bg-gradient-to-br from-orange-700 to-red-800 border-red-900'; // Withering
  };

  const getHealthBar = (plot: Plot) => {
    if (!plot.cropType) return null;
    
    return (
      <div className="absolute bottom-1 left-1 right-1">
        <div className="bg-black/30 rounded-full h-2">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              plot.health >= 80 ? 'bg-green-400' :
              plot.health >= 60 ? 'bg-yellow-400' :
              plot.health >= 40 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${plot.health}%` }}
          />
        </div>
        <div className="text-xs text-white font-bold text-center mt-1">
          {Math.round(plot.health)}%
        </div>
      </div>
    );
  };

  const getStatusIndicators = (plot: Plot) => {
    return (
      <div className="absolute top-1 right-1 flex flex-col space-y-1">
        {/* Moisture Level Indicator */}
        {plot.cropType && (
          <div className={`rounded-full p-1 ${
            plot.soilMoisture < 0.3 ? 'bg-red-500' :
            plot.soilMoisture > 0.7 ? 'bg-blue-600' :
            'bg-blue-400'
          }`}>
            <Droplets className="h-3 w-3 text-white" />
          </div>
        )}
        {/* Pest Warning */}
        {plot.pestLevel > 50 && (
          <div className="bg-red-500 rounded-full p-1 animate-pulse">
            <Bug className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    );
  };
  
  const getPlotStatus = (plot: Plot) => {
    if (!plot.cropType) return 'Empty';
    if (plot.growthStage === 5) return 'Ready';
    if (plot.health < 40) return 'Withered';
    return 'Growing';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-3 gap-3 flex-1">
        {plots.map((plot) => (
          <button
            key={plot.id}
            onClick={() => onSelectPlot(plot.id)}
            className={`
              relative aspect-square rounded-lg border-4 p-4 
              transition-all duration-200 hover:scale-105
              ${getPlotColor(plot)}
              ${selectedPlot === plot.id ? 'border-yellow-300 ring-4 ring-yellow-300/50' : ''}
            `}
          >
            {/* Crop Icon */}
            <div className="flex items-center justify-center h-full">
              {getCropIcon(plot)}
            </div>
            
            {/* Health Bar */}
            {getHealthBar(plot)}
            
            {/* Status Indicators */}
            {getStatusIndicators(plot)}
            
            {/* Status Badge */}
            <div className={`absolute top-1 left-1 text-xs font-bold px-2 py-0.5 rounded ${
              !plot.cropType ? 'bg-gray-600 text-white' :
              plot.growthStage === 5 ? 'bg-yellow-400 text-yellow-900 animate-pulse' :
              plot.health < 40 ? 'bg-red-500 text-white' :
              'bg-green-600 text-white'
            }`}>
              {getPlotStatus(plot)}
            </div>
            
            {/* Animation Overlays */}
            {getAnimationForPlot(plot.id).map((animation, index) => (
              <div
                key={`${animation.type}-${index}`}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="animate-bounce">
                  {animation.type === 'health' && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                      animation.value > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      <span>{animation.value > 0 ? '+' : ''}{Math.round(animation.value)}%</span>
                    </div>
                  )}
                  {animation.type === 'moisture' && (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                      <Droplets className="h-3 w-3" />
                      <span>+{Math.round(animation.value)}%</span>
                    </div>
                  )}
                  {animation.type === 'pest' && animation.value > 0 && (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                      <Bug className="h-3 w-3" />
                      <span>-{Math.round(animation.value)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Empty Plot Placeholder */}
            {!plot.cropType && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Plus className="h-8 w-8 text-amber-900/50" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}