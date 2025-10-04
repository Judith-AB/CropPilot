import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Droplets, Pause, Wrench, Leaf, DollarSign } from 'lucide-react';

interface GameState {
  budget: number;
  isLoading: boolean;
}

interface ActionBarProps {
  gameState: GameState;
  onIrrigationDecision: (level: 'low' | 'medium' | 'high') => void;
}

export function ActionBar({ gameState, onIrrigationDecision }: ActionBarProps) {
  const irrigationOptions = [
    {
      level: 'low' as const,
      label: 'Low Irrigation',
      cost: 2000,
      description: 'Light watering',
      icon: <Droplets className="h-4 w-4" />,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      level: 'medium' as const,
      label: 'Medium Irrigation',
      cost: 4000,
      description: 'Standard watering',
      icon: <Droplets className="h-4 w-4" />,
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      level: 'high' as const,
      label: 'High Irrigation',
      cost: 6000,
      description: 'Heavy watering',
      icon: <Droplets className="h-4 w-4" />,
      color: 'bg-blue-800 hover:bg-blue-900'
    }
  ];

  const otherActions = [
    {
      label: 'Fertilize',
      cost: 3000,
      description: 'Boost crop growth',
      icon: <Leaf className="h-4 w-4" />,
      disabled: true
    },
    {
      label: 'Wait',
      cost: 0,
      description: 'Skip this week',
      icon: <Pause className="h-4 w-4" />,
      disabled: true
    },
    {
      label: 'Invest in Tech',
      cost: 8000,
      description: 'Upgrade equipment',
      icon: <Wrench className="h-4 w-4" />,
      disabled: true
    }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Action Center</h3>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-400" />
          <span className="text-lg font-semibold text-green-400">
            ${gameState.budget.toLocaleString()}
          </span>
          <span className="text-sm text-slate-400">Available</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Irrigation Decisions */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Irrigation Decisions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {irrigationOptions.map((option) => {
              const canAfford = gameState.budget >= option.cost;
              const isDisabled = !canAfford || gameState.isLoading;
              
              return (
                <Button
                  key={option.level}
                  onClick={() => onIrrigationDecision(option.level)}
                  disabled={isDisabled}
                  className={`relative h-auto p-4 flex flex-col items-start space-y-2 ${
                    isDisabled 
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : option.color
                  } transition-all duration-200`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        canAfford ? 'border-green-400 text-green-400' : 'border-red-400 text-red-400'
                      }`}
                    >
                      ${option.cost.toLocaleString()}
                    </Badge>
                  </div>
                  <p className="text-xs text-left opacity-75">{option.description}</p>
                  
                  {gameState.isLoading && (
                    <div className="absolute inset-0 bg-slate-900/50 rounded flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Other Actions (Coming Soon) */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Other Actions (Coming Soon)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {otherActions.map((action, index) => (
              <Button
                key={index}
                disabled={true}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2 border-slate-600 text-slate-500 cursor-not-allowed"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    {action.icon}
                    <span className="font-medium">{action.label}</span>
                  </div>
                  <Badge variant="outline" className="border-slate-500 text-slate-500">
                    {action.cost === 0 ? 'Free' : `$${action.cost.toLocaleString()}`}
                  </Badge>
                </div>
                <p className="text-xs text-left opacity-75">{action.description}</p>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {gameState.isLoading && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-400/50 rounded">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <p className="text-sm text-blue-400">
              Processing your decision and updating satellite data...
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}