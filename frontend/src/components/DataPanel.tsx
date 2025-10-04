import { GameState } from '../App';
import { Leaf, Thermometer, Droplets, Calendar, Banknote, ShieldCheck, AlertTriangle } from 'lucide-react';

// A simple component for a stat display
const Stat = ({ icon, label, value, unit, colorClass, size = 'normal' }) => (
  <div className="flex items-center space-x-3">
    <div className={`p-2 bg-${colorClass}-500/20 rounded-xl border border-${colorClass}-400/30`}>
      {icon}
    </div>
    <div>
      <div className={`text-xs text-${colorClass}-300 uppercase tracking-wide`}>{label}</div>
      <div className={`font-bold text-white ${size === 'large' ? 'text-xl' : 'text-lg'}`}>{value} <span className="text-sm font-normal">{unit}</span></div>
    </div>
  </div>
);

export const DataPanel = ({ gameState }: { gameState: GameState }) => {
  const ndviValue = (gameState.ndvi * 100).toFixed(0);
  const soilMoistureValue = (gameState.globalSoilMoisture * 100).toFixed(0);
  const temperatureValue = gameState.temperature.value.toFixed(1);
  const sustainabilityScore = Math.round((gameState.plots.filter(p => p.cropType).reduce((sum, p) => sum + p.health, 0) / Math.max(1, gameState.plots.filter(p => p.cropType).length)));

  return (
    <div className="bg-gradient-to-br from-slate-900/80 via-blue-950/80 to-slate-900/80 backdrop-blur-md rounded-3xl p-6 border-2 border-blue-400/40 shadow-2xl h-full flex flex-col space-y-4 game-glow">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">FARM DASHBOARD</h2>
        <p className="text-xs text-blue-300">Week {gameState.week} Report</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Stat 
          icon={<Calendar className="h-6 w-6 text-blue-400" />}
          label="Date"
          value={gameState.date}
          colorClass="blue"
          size="large"
        />
        <Stat 
          icon={<Banknote className="h-6 w-6 text-green-400" />}
          label="Budget"
          value={`$${gameState.money}`}
          colorClass="green"
          size="large"
        />
      </div>
      <div className="w-full h-[1px] bg-blue-400/20"></div>

      {/* NASA Data Section */}
      <div className="flex-1 flex flex-col justify-around space-y-3">
        <p className="text-xs text-blue-300 uppercase tracking-wide">NASA Satellite Feed</p>
        <Stat 
          icon={<Droplets className="h-5 w-5 text-cyan-400" />}
          label="Global Soil Moisture"
          value={soilMoistureValue}
          unit="%"
          colorClass="cyan"
        />
        <Stat 
          icon={<Leaf className="h-5 w-5 text-emerald-400" />}
          label="Avg. Crop Health (NDVI)"
          value={ndviValue}
          unit="%"
          colorClass="emerald"
        />
        <Stat 
          icon={<Thermometer className="h-5 w-5 text-amber-400" />}
          label="Surface Temperature"
          value={temperatureValue}
          unit="°C"
          colorClass="amber"
        />
      </div>
      <div className="w-full h-[1px] bg-blue-400/20"></div>
      
      {/* Farm Status Section */}
       <div className="flex-1 flex flex-col justify-around space-y-3">
         <p className="text-xs text-blue-300 uppercase tracking-wide">Farm Status</p>
        <Stat 
          icon={<ShieldCheck className="h-5 w-5 text-lime-400" />}
          label="Sustainability Score"
          value={sustainabilityScore}
          unit="%"
          colorClass="lime"
        />
      </div>

      {/* Alert Box */}
      <div className={`p-3 rounded-xl border-2 flex-shrink-0 ${
          gameState.specialEvent ? 'bg-red-500/20 border-red-500/50' : 'bg-purple-500/10 border-purple-400/30'
        }`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
             {gameState.specialEvent ? <AlertTriangle className="h-5 w-5 text-red-400" /> : '💡'}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-sm mb-1">{gameState.specialEvent?.eventName || "Smart Tip"}</h4>
            <p className="text-xs text-slate-200 leading-tight">
              {gameState.specialEvent?.description || "Conditions look stable. Plan your actions based on the satellite data."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

