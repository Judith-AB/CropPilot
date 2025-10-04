import { useState } from 'react';
import { GameState } from '../App';
import { Button } from './ui/button';
import { Sprout, Droplets, Leaf, Bug, Wheat, ChevronDown } from 'lucide-react';

interface ActionPanelProps {
  gameState: GameState;
  onAction: (action: string, level: string, cost: number) => void;
  isProcessing: boolean;
}

const actions = [
  {
    id: 'plant',
    label: 'PLANT SEED',
    cost: 100,
    icon: <Sprout className="h-5 w-5" />,
    color: 'bg-orange-500 hover:bg-orange-600',
    description: '$100 | Starts crop',
    levels: [{ id: 'standard', cost: 100 }],
    disabled: (plot) => !plot || plot.cropType !== null,
  },
  {
    id: 'water',
    label: 'WATER',
    icon: <Droplets className="h-5 w-5" />,
    color: 'bg-blue-500 hover:bg-blue-600',
    levels: [
      { id: 'light', label: 'Light Water', cost: 25, description: '$25 | +15% Moist.', levelColor: 'bg-sky-500/20 hover:bg-sky-500/40 border-sky-400/30' },
      { id: 'moderate', label: 'Moderate Water', cost: 50, description: '$50 | +30% Moist.', levelColor: 'bg-blue-500/20 hover:bg-blue-500/40 border-blue-500/30' },
      { id: 'heavy', label: 'Heavy Water', cost: 75, description: '$75 | +50% Moist.', levelColor: 'bg-indigo-500/20 hover:bg-indigo-500/40 border-indigo-500/30' },
    ],
    disabled: (plot) => !plot || plot.cropType === null,
  },
  {
    id: 'fertilize',
    label: 'FERTILIZE',
    icon: <Leaf className="h-5 w-5" />,
    color: 'bg-green-500 hover:bg-green-600',
    levels: [
      { id: 'cheap', label: 'Cheap Fertilizer', cost: 75, description: '$75 | +10% Health', levelColor: 'bg-lime-500/20 hover:bg-lime-500/40 border-lime-400/30' },
      { id: 'premium', label: 'Premium Fertilizer', cost: 150, description: '$150 | +25% Health', levelColor: 'bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30' },
    ],
    disabled: (plot) => !plot || plot.cropType === null,
  },
  {
    id: 'pestControl',
    label: 'PEST CONTROL',
    icon: <Bug className="h-5 w-5" />,
    color: 'bg-red-500 hover:bg-red-600',
    levels: [
        { id: 'basic', label: 'Basic Spray', cost: 50, description: '$50 | -40% Pests', levelColor: 'bg-pink-500/20 hover:bg-pink-500/40 border-pink-400/30' },
        { id: 'advanced', label: 'Advanced Spray', cost: 100, description: '$100 | -80% Pests', levelColor: 'bg-rose-500/20 hover:bg-rose-500/40 border-rose-500/30' },
    ],
    disabled: (plot) => !plot || plot.cropType === null,
  },
  {
    id: 'harvest',
    label: 'HARVEST',
    icon: <Wheat className="h-5 w-5" />,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    levels: [{ id: 'standard', cost: 0, description: 'Week 6 | $50-800' }],
    disabled: (plot) => !plot || plot.growthStage !== 5,
  },
];

export function ActionPanel({ gameState, onAction, isProcessing }: ActionPanelProps) {
  const selectedPlot = gameState.selectedPlot !== null ? gameState.plots[gameState.selectedPlot] : null;
  const [openAction, setOpenAction] = useState<string | null>(null);

  return (
    <div className="bg-gradient-to-br from-violet-900/50 via-fuchsia-900/50 to-purple-900/50 backdrop-blur-md rounded-3xl p-5 border-2 border-violet-400/40 shadow-2xl h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
            <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-400/30">
                <span className="text-xl">🎯</span>
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">ACTIONS</h2>
                <p className="text-xs text-violet-300">Farm tools</p>
            </div>
        </div>
        {gameState.selectedPlot !== null && (
            <div className="px-3 py-1 bg-violet-500/20 rounded-lg border border-violet-400/30">
                <div className="text-xs text-violet-300">
                    Plot #{gameState.selectedPlot + 1}
                </div>
            </div>
        )}
      </div>
      
      <div className="divide-y divide-violet-500/20 overflow-y-auto flex-1 -mr-2 pr-2">
        {actions.map((actionGroup) => {
          const isGroupDisabled = actionGroup.disabled(selectedPlot) || isProcessing;
          return (
            <div key={actionGroup.id} className="py-4">
              {actionGroup.levels.length === 1 ? (
                // --- RENDER SINGLE-LEVEL ACTIONS (PLANT, HARVEST) ---
                <Button
                  onClick={() => onAction(actionGroup.id, actionGroup.levels[0].id, actionGroup.levels[0].cost)}
                  disabled={isGroupDisabled || gameState.money < actionGroup.levels[0].cost}
                  className={`w-full h-auto text-sm font-bold text-white flex justify-between items-center px-3 py-2 rounded-xl transition-transform transform hover:scale-105 ${isGroupDisabled || gameState.money < actionGroup.levels[0].cost ? 'bg-gray-600/50 cursor-not-allowed' : actionGroup.color}`}
                >
                  <div className="flex items-center space-x-2">
                    {actionGroup.icon}
                    <span>{actionGroup.label}</span>
                  </div>
                  <div>{actionGroup.levels[0].description}</div>
                </Button>
              ) : (
                // --- RENDER MULTI-LEVEL ACTIONS (WATER, FERTILIZE, ETC) ---
                <div className="space-y-2">
                  <Button
                    onClick={() => setOpenAction(openAction === actionGroup.id ? null : actionGroup.id)}
                    disabled={isGroupDisabled}
                    className={`w-full h-auto text-sm font-bold text-white flex justify-between items-center px-3 py-2 rounded-xl transition-transform transform hover:scale-105 ${isGroupDisabled ? 'bg-gray-600/50 cursor-not-allowed' : actionGroup.color}`}
                  >
                    <div className="flex items-center space-x-2">
                      {actionGroup.icon}
                      <span>{actionGroup.label}</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openAction === actionGroup.id ? 'rotate-180' : ''}`} />
                  </Button>
                  {openAction === actionGroup.id && (
                    <div className="pl-6 mt-2 space-y-2 rounded-lg bg-black/10 p-3">
                      {actionGroup.levels.map(level => {
                         const isDisabled = gameState.money < level.cost;
                         return (
                          <Button
                              key={level.id}
                              onClick={() => onAction(actionGroup.id, level.id, level.cost)}
                              disabled={isDisabled}
                              className={`w-full h-auto text-xs font-bold text-white justify-between border transition-transform transform hover:scale-105 ${isDisabled ? 'bg-gray-700/70 cursor-not-allowed border-gray-600/30' : level.levelColor}`}
                          >
                              <span>{level.label}</span>
                              <span>{level.description}</span>
                          </Button>
                         )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {gameState.selectedPlot === null && (
        <div className="mt-3 bg-violet-600/20 rounded-xl p-4 text-center border border-violet-500/30 flex-shrink-0">
          <div className="text-3xl mb-2">👈</div>
          <p className="text-white font-bold text-sm mb-1">Select a plot to begin</p>
          <p className="text-violet-200 text-xs">
            Click any farm plot to start
          </p>
        </div>
      )}
      
      {selectedPlot && (
        <div className="mt-3 bg-violet-600/20 rounded-xl p-3 transition-all duration-300 border border-violet-500/30 flex-shrink-0">
          <h4 className="text-white font-bold mb-2 text-sm">Plot Status</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-violet-100">
            <div className="flex items-center justify-between">
              <span>Health:</span> 
              <span className={`font-bold ${
                selectedPlot.health >= 80 ? 'text-green-200' :
                selectedPlot.health >= 60 ? 'text-yellow-200' :
                selectedPlot.health >= 40 ? 'text-orange-200' : 'text-red-200'
              }`}>
                {Math.round(selectedPlot.health)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Moisture:</span> 
              <span className={`font-bold ${
                selectedPlot.soilMoisture < 0.3 ? 'text-yellow-200' :
                selectedPlot.soilMoisture > 0.7 ? 'text-blue-200' : 'text-green-200'
              }`}>
                {Math.round(selectedPlot.soilMoisture * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pests:</span> 
              <span className={`font-bold ${
                selectedPlot.pestLevel > 50 ? 'text-red-200' :
                selectedPlot.pestLevel > 25 ? 'text-yellow-200' : 'text-green-200'
              }`}>
                {Math.round(selectedPlot.pestLevel)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Stage:</span> 
              <span className={`font-bold ${
                selectedPlot.growthStage === 5 ? 'text-yellow-200' : 'text-green-200'
              }`}>
                {selectedPlot.growthStage}/5
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

