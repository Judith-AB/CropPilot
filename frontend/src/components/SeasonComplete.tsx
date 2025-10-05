import { GameState } from '../App';
import { Button } from './ui/button';
import { Trophy, RotateCcw } from 'lucide-react';
// import exampleImage from 'figma:asset/75398e1dcd2dc1a369b05d56a33954db2db69a3d.png'; // Removed unused asset

interface SeasonCompleteProps {
  gameState: GameState;
  onRestart: () => void;
}

export function SeasonComplete({ gameState, onRestart }: SeasonCompleteProps) {
  const getPerformanceLevel = () => {
    // Adjusting logic based on profit since full game logic is assumed incomplete
    if (gameState.seasonProfit > 1000 && gameState.totalHarvested >= 8) return 'Excellent';
    if (gameState.seasonProfit > 0 && gameState.totalHarvested >= 5) return 'Good';
    if (gameState.seasonProfit > -1000 && gameState.totalHarvested >= 3) return 'Fair';
    return 'Poor';
  };

  const performance = getPerformanceLevel();

  const getPerformanceMessage = () => {
    switch (performance) {
      case 'Excellent':
        return "Amazing! You're a master farmer who used NASA data perfectly!";
      case 'Good':
        return "Well done! You made smart decisions using satellite data.";
      case 'Fair':
        return "Not bad! You learned the basics of data-driven farming.";
      default:
        return "Keep trying! Understanding satellite data takes practice.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 shadow-2xl border-4 border-yellow-400 max-w-md w-full">

        {/* Trophy */}
        <div className="text-center mb-6">
          <div className="bg-yellow-400 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <Trophy className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SEASON</h1>
          <h1 className="text-3xl font-bold text-white">COMPLETE!</h1>
        </div>

        {/* Results Box */}
        <div className="bg-amber-600 rounded-2xl p-6 mb-6 border-2 border-amber-700">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Final Score</h2>

          {/* Money */}
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-yellow-300 mb-1">
              ${gameState.money}
            </div>
            <div className="text-sm text-amber-200">Total Money</div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center space-x-2 text-sm text-amber-200 mb-2">
            <span>🌾</span>
            <span>Harvested: {gameState.totalHarvested} crops</span>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-amber-200">
            <span>💰</span>
            <span>
              Profit: {gameState.seasonProfit >= 0 ? '+' : ''}${gameState.seasonProfit}
            </span>
          </div>
        </div>

        {/* Performance Message */}
        <div className="text-center mb-6">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-3 ${performance === 'Excellent' ? 'bg-green-400 text-green-900' :
              performance === 'Good' ? 'bg-blue-400 text-blue-900' :
                performance === 'Fair' ? 'bg-yellow-400 text-yellow-900' :
                  'bg-red-400 text-red-900'
            }`}>
            Performance: {performance}
          </div>
          <p className="text-white text-sm leading-relaxed">
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Play Again Button */}
        <Button
          onClick={onRestart}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-xl font-bold rounded-2xl flex items-center justify-center space-x-3"
        >
          <span className="text-2xl">☀️</span>
          <span>PLAY AGAIN</span>
          <RotateCcw className="h-6 w-6" />
        </Button>

        {/* Learning Summary */}
        <div className="mt-6 bg-orange-700 rounded-xl p-4">
          <h3 className="text-white font-bold text-center mb-2">What You Learned</h3>
          <div className="text-sm text-orange-100 space-y-1">
            <div>• NASA SMAP data helps optimize watering</div>
            <div>• NDVI shows crop health trends</div>
            <div>• Weather forecasts guide farm planning</div>
            <div>• Data-driven decisions increase profits</div>
          </div>
        </div>
      </div>
    </div>
  );
}
