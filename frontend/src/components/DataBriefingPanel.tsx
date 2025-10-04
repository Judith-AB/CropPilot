import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Cloud, Sun, Thermometer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface GameState {
  week: number;
  budget: number;
  cropHealth: number;
  sustainabilityScore: number;
  soilMoisture: number;
  ndviTrend: number[];
  rainForecast: number;
  tempAnomaly: number;
  isLoading: boolean;
}

interface DataBriefingPanelProps {
  gameState: GameState;
}

export function DataBriefingPanel({ gameState }: DataBriefingPanelProps) {
  const getMoistureStatus = (moisture: number) => {
    if (moisture < 0.35) return { status: 'Dry', color: 'text-yellow-400', bgColor: 'bg-yellow-400' };
    if (moisture > 0.65) return { status: 'Saturated', color: 'text-blue-400', bgColor: 'bg-blue-400' };
    return { status: 'Optimal', color: 'text-green-400', bgColor: 'bg-green-400' };
  };

  const getTrendDirection = () => {
    const recent = gameState.ndviTrend.slice(-2);
    if (recent.length < 2) return 'stable';
    return recent[1] > recent[0] ? 'up' : 'down';
  };

  const moistureStatus = getMoistureStatus(gameState.soilMoisture);
  const trendDirection = getTrendDirection();
  
  // Generate feedback based on current conditions
  const generateFeedback = () => {
    if (gameState.soilMoisture > 0.65) {
      return {
        type: 'warning',
        message: 'WARNING: High soil moisture detected. Irrigation NOT recommended.',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />
      };
    }
    if (gameState.soilMoisture < 0.35) {
      return {
        type: 'alert',
        message: 'ALERT: Low soil moisture. Consider irrigation to prevent crop stress.',
        icon: <AlertTriangle className="h-5 w-5 text-red-400" />
      };
    }
    return {
      type: 'optimal',
      message: 'CONDITIONS: Soil moisture in optimal range. Monitor for changes.',
      icon: <TrendingUp className="h-5 w-5 text-green-400" />
    };
  };

  const feedback = generateFeedback();
  
  // Chart data for NDVI trend
  const chartData = gameState.ndviTrend.map((value, index) => ({
    week: `W${gameState.week - gameState.ndviTrend.length + index + 1}`,
    ndvi: value
  }));

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <div className="h-2 w-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
          Mission Control
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">${gameState.budget.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Budget</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{gameState.cropHealth}%</p>
            <p className="text-sm text-slate-400">Crop Health</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{gameState.sustainabilityScore}</p>
            <p className="text-sm text-slate-400">Sustainability</p>
          </div>
        </div>
      </Card>

      {/* NASA Data Visualization */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Satellite Data Analysis</h3>
        
        {/* SMAP Soil Moisture */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">SMAP Soil Moisture</span>
            <span className={`text-sm font-semibold ${moistureStatus.color}`}>
              {moistureStatus.status}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={gameState.soilMoisture * 100} 
              className="h-3 bg-slate-700"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Dry (&lt;0.35)</span>
              <span>Optimal (0.35-0.65)</span>
              <span>Saturated (&gt;0.65)</span>
            </div>
          </div>
          <p className="text-sm text-slate-300 mt-2">
            Current: {gameState.soilMoisture.toFixed(2)}
          </p>
        </div>

        {/* NDVI Vegetation Index */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">NDVI Vegetation Index</span>
            <div className="flex items-center space-x-1">
              {trendDirection === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm ${trendDirection === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trendDirection === 'up' ? 'Healthy' : 'Stress'}
              </span>
            </div>
          </div>
          <div className="h-20 bg-slate-700/50 rounded p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="ndvi" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Forecast */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm text-slate-300">Rain Forecast</p>
              <p className="text-lg font-semibold text-blue-400">{gameState.rainForecast}mm</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm text-slate-300">Temp Anomaly</p>
              <p className="text-lg font-semibold text-red-400">+{gameState.tempAnomaly}°C</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Feedback Box */}
      <Card className={`border-2 p-4 ${
        feedback.type === 'warning' ? 'bg-yellow-900/20 border-yellow-400/50' :
        feedback.type === 'alert' ? 'bg-red-900/20 border-red-400/50' :
        'bg-green-900/20 border-green-400/50'
      }`}>
        <div className="flex items-start space-x-3">
          {feedback.icon}
          <div>
            <p className="font-semibold text-white">{feedback.message}</p>
            <p className="text-sm text-slate-300 mt-1">
              Week {gameState.week} of 6 • NASA Earth Observation Data
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}