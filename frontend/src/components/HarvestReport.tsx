import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Trophy, TrendingUp, DollarSign, Leaf, Droplets, RotateCcw } from 'lucide-react';

interface GameState {
  budget: number;
  cropHealth: number;
  sustainabilityScore: number;
  decisionHistory: Array<{
    week: number;
    action: string;
    cost: number;
    soilMoisture: number;
    cropHealth: number;
  }>;
}

interface HarvestReportProps {
  gameState: GameState;
  onRestart: () => void;
}

export function HarvestReport({ gameState, onRestart }: HarvestReportProps) {
  const initialBudget = 45500;
  const finalProfit = gameState.budget - initialBudget;
  const averageHealth = gameState.decisionHistory.length > 0 
    ? gameState.decisionHistory.reduce((sum, decision) => sum + decision.cropHealth, 0) / gameState.decisionHistory.length
    : gameState.cropHealth;

  // Prepare chart data
  const chartData = gameState.decisionHistory.map((decision, index) => ({
    week: `Week ${decision.week}`,
    cropHealth: decision.cropHealth,
    soilMoisture: decision.soilMoisture * 100,
    cost: decision.cost
  }));

  const getPerformanceLevel = () => {
    if (finalProfit > 0 && gameState.cropHealth > 80) return 'Excellent';
    if (finalProfit > -10000 && gameState.cropHealth > 60) return 'Good';
    if (finalProfit > -20000 && gameState.cropHealth > 40) return 'Fair';
    return 'Poor';
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-blue-400';
      case 'Fair': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const generateNarrative = () => {
    const performance = getPerformanceLevel();
    
    if (performance === 'Excellent') {
      return "Outstanding! You've mastered the balance between cost efficiency and crop health. Your strategic use of NASA satellite data resulted in optimal irrigation decisions.";
    } else if (performance === 'Good') {
      return "Well done! You maintained good crop health while managing costs effectively. Your understanding of soil moisture data helped prevent major losses.";
    } else if (performance === 'Fair') {
      return "You managed to keep the farm operational, but there's room for improvement. Consider paying closer attention to the soil moisture indicators.";
    } else {
      return "This season was challenging. Focus on the relationship between soil moisture and irrigation needs. The NASA data provides crucial insights for better decisions.";
    }
  };

  const performance = getPerformanceLevel();

  return (
    <div className="container mx-auto px-6 py-8">
      <Card className="bg-slate-800/50 border-slate-700 p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className={`h-8 w-8 ${getPerformanceColor(performance)}`} />
            <h1 className="text-3xl font-bold text-white">HARVEST REPORT</h1>
          </div>
          <p className="text-xl text-slate-300">Season 1 Complete</p>
          <Badge 
            variant="outline" 
            className={`mt-2 ${
              performance === 'Excellent' ? 'border-green-400 text-green-400' :
              performance === 'Good' ? 'border-blue-400 text-blue-400' :
              performance === 'Fair' ? 'border-yellow-400 text-yellow-400' :
              'border-red-400 text-red-400'
            }`}
          >
            Performance: {performance}
          </Badge>
        </div>

        {/* Narrative */}
        <Card className="bg-slate-700/30 border-slate-600 p-6 mb-8">
          <p className="text-lg text-slate-200 leading-relaxed">
            {generateNarrative()}
          </p>
        </Card>

        {/* Final Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-700/30 border-slate-600 p-6 text-center">
            <DollarSign className={`h-8 w-8 mx-auto mb-3 ${finalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            <p className="text-2xl font-bold text-white mb-2">
              {finalProfit >= 0 ? '+' : ''}${finalProfit.toLocaleString()}
            </p>
            <p className="text-sm text-slate-400">Final Profit/Loss</p>
            <p className="text-xs text-slate-500 mt-1">Starting Budget: ${initialBudget.toLocaleString()}</p>
          </Card>

          <Card className="bg-slate-700/30 border-slate-600 p-6 text-center">
            <Leaf className="h-8 w-8 mx-auto mb-3 text-green-400" />
            <p className="text-2xl font-bold text-white mb-2">{gameState.cropHealth}%</p>
            <p className="text-sm text-slate-400">Final Crop Health</p>
            <p className="text-xs text-slate-500 mt-1">Average: {averageHealth.toFixed(0)}%</p>
          </Card>

          <Card className="bg-slate-700/30 border-slate-600 p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-3 text-yellow-400" />
            <p className="text-2xl font-bold text-white mb-2">{gameState.sustainabilityScore}</p>
            <p className="text-sm text-slate-400">Sustainability Score</p>
            <p className="text-xs text-slate-500 mt-1">Resource efficiency</p>
          </Card>
        </div>

        {/* Historical Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-700/30 border-slate-600 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Leaf className="h-5 w-5 text-green-400 mr-2" />
              Crop Health Over Time
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cropHealth" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-slate-700/30 border-slate-600 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Droplets className="h-5 w-5 text-blue-400 mr-2" />
              Soil Moisture vs Health
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="soilMoisture" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cropHealth" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span className="text-slate-400">Soil Moisture %</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span className="text-slate-400">Crop Health %</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Insights */}
        <Card className="bg-slate-700/30 border-slate-600 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Key Learning Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-400 mb-2">NASA Data Correlation</h4>
              <p className="text-slate-300">
                SMAP soil moisture readings directly influenced crop health outcomes. 
                Optimal moisture levels (0.35-0.65) consistently produced the best results.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-400 mb-2">Cost-Benefit Analysis</h4>
              <p className="text-slate-300">
                Strategic irrigation timing based on satellite data prevented both over-watering 
                costs and crop stress from drought conditions.
              </p>
            </div>
          </div>
        </Card>

        {/* Action */}
        <div className="text-center">
          <Button
            onClick={onRestart}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Start New Season
          </Button>
          <p className="text-sm text-slate-400 mt-2">
            Apply your learnings to improve next season's performance
          </p>
        </div>
      </Card>
    </div>
  );
}