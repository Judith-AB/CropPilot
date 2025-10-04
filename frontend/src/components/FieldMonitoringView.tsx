import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, Droplets, Leaf, MapPin } from 'lucide-react';

interface GameState {
  week: number;
  cropHealth: number;
  soilMoisture: number;
  isLoading: boolean;
}

interface FieldMonitoringViewProps {
  gameState: GameState;
}

export function FieldMonitoringView({ gameState }: FieldMonitoringViewProps) {
  const [viewMode, setViewMode] = useState<'health' | 'moisture'>('health');

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'bg-green-500';
    if (health >= 60) return 'bg-yellow-500';
    if (health >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMoistureColor = (moisture: number) => {
    if (moisture < 0.35) return 'bg-yellow-400'; // Dry
    if (moisture > 0.65) return 'bg-blue-500'; // Wet
    return 'bg-green-400'; // Optimal
  };

  const generateFieldPattern = () => {
    const cells = [];
    const rows = 8;
    const cols = 12;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const baseHealth = gameState.cropHealth;
        const baseMoisture = gameState.soilMoisture;
        
        // Add some variation across the field
        const variation = (Math.sin(row * 0.5) + Math.cos(col * 0.3)) * 0.1;
        const cellHealth = Math.max(0, Math.min(100, baseHealth + variation * 20));
        const cellMoisture = Math.max(0, Math.min(1, baseMoisture + variation * 0.2));
        
        const isHealthMode = viewMode === 'health';
        const colorClass = isHealthMode ? getHealthColor(cellHealth) : getMoistureColor(cellMoisture);
        const opacity = isHealthMode ? cellHealth / 100 : cellMoisture;
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`aspect-square ${colorClass} border border-slate-600/30 transition-all duration-300`}
            style={{ 
              opacity: Math.max(0.3, opacity),
              transform: gameState.isLoading ? 'scale(0.95)' : 'scale(1)'
            }}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div className="space-y-6">
      {/* Field Status Header */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <MapPin className="h-5 w-5 text-green-400 mr-2" />
            Field Monitoring
          </h2>
          <Badge variant="outline" className="border-green-400 text-green-400">
            Week {gameState.week} of 6
          </Badge>
        </div>
        
        {/* View Toggle */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={viewMode === 'health' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('health')}
            className="flex items-center space-x-1"
          >
            <Leaf className="h-4 w-4" />
            <span>Health Map</span>
          </Button>
          <Button
            variant={viewMode === 'moisture' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('moisture')}
            className="flex items-center space-x-1"
          >
            <Droplets className="h-4 w-4" />
            <span>Moisture Map</span>
          </Button>
        </div>

        {/* Field Visualization */}
        <div className="relative">
          <div 
            className={`grid grid-cols-12 gap-1 p-4 bg-slate-900/50 rounded-lg border-2 transition-all duration-500 ${
              gameState.isLoading ? 'border-blue-400 animate-pulse' : 'border-slate-600'
            }`}
          >
            {generateFieldPattern()}
          </div>
          
          {/* Loading Overlay */}
          {gameState.isLoading && (
            <div className="absolute inset-0 bg-slate-900/80 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                <p className="text-sm text-blue-400">Processing Decision...</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-slate-700/30 rounded">
          <p className="text-sm text-slate-300 mb-2 flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {viewMode === 'health' ? 'Crop Health Legend' : 'Soil Moisture Legend'}
          </p>
          <div className="flex items-center space-x-4 text-xs">
            {viewMode === 'health' ? (
              <>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-slate-400">Poor (&lt;40%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-slate-400">Fair (40-60%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-slate-400">Good (60-80%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-slate-400">Excellent (&gt;80%)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span className="text-slate-400">Dry (&lt;0.35)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <span className="text-slate-400">Optimal (0.35-0.65)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-slate-400">Saturated (&gt;0.65)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Current Stats */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Field Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-slate-700/30 rounded">
            <Leaf className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{gameState.cropHealth}%</p>
            <p className="text-sm text-slate-400">Average Health</p>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded">
            <Droplets className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-400">{(gameState.soilMoisture * 100).toFixed(0)}%</p>
            <p className="text-sm text-slate-400">Soil Moisture</p>
          </div>
        </div>
      </Card>
    </div>
  );
}