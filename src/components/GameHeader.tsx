import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tractor, Calendar, DollarSign, Play, TrendingUp, TrendingDown } from 'lucide-react';

interface GameHeaderProps {
  week: number;
  totalWeeks: number;
  money: number;
  onAdvanceWeek: () => void;
  isProcessing: boolean;
}

export function GameHeader({ week, totalWeeks, money, onAdvanceWeek, isProcessing }: GameHeaderProps) {
  const progressPercentage = (week / totalWeeks) * 100;
  const [previousMoney, setPreviousMoney] = useState(money);
  const [moneyChange, setMoneyChange] = useState<number | null>(null);

  useEffect(() => {
    if (money !== previousMoney) {
      const change = money - previousMoney;
      setMoneyChange(change);
      setTimeout(() => setMoneyChange(null), 2000);
      setPreviousMoney(money);
    }
  }, [money, previousMoney]);
  
  return (
    <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 shadow-2xl border-b-2 border-purple-500/40 relative z-20">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5"></div>
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                <Tractor className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">TERRAFORM</h1>
                <p className="text-xs text-emerald-400 font-medium">🌍 The Legacy Project</p>
              </div>
            </div>
          </div>
          
          {/* Week Progress */}
          <div className="flex items-center space-x-6">
            <div className="text-right bg-purple-500/10 rounded-xl px-4 py-2 border border-purple-400/30">
              <div className="text-xs text-purple-300 uppercase tracking-wide">Week</div>
              <div className="text-2xl font-bold text-white">{week}/{totalWeeks}</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex space-x-1">
            {Array.from({ length: totalWeeks }, (_, i) => (
              <div 
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  i < week ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg shadow-green-500/50' : 
                  i === week - 1 ? 'bg-gradient-to-r from-emerald-300 to-green-400' :
                  'bg-slate-700/30'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Money Display */}
        <div className="mt-4 bg-green-500 rounded-lg p-4 flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-white" />
            <span className="text-sm text-green-100">MONEY</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-white">${money}</div>
            {moneyChange !== null && (
              <div className={`absolute -top-8 right-4 flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-bold animate-bounce ${
                moneyChange > 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-red-500 text-white'
              }`}>
                {moneyChange > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{moneyChange > 0 ? '+' : ''}${moneyChange}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Advance Week Button */}
        <div className="mt-4">
          <Button
            onClick={onAdvanceWeek}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white py-3 text-lg font-bold rounded-xl shadow-lg border-2 border-purple-400/50 transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing Week...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Advance to Week {week + 1}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}