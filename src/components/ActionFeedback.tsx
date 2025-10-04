import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, DollarSign, Droplets, Leaf, Bug, Wheat } from 'lucide-react';

export interface ActionResult {
  type: 'success' | 'warning' | 'info';
  action: string;
  message: string;
  changes: {
    money?: number;
    health?: number;
    moisture?: number;
    pestLevel?: number;
    harvest?: number;
  };
}

interface ActionFeedbackProps {
  result: ActionResult | null;
  onClose: () => void;
}

export function ActionFeedback({ result, onClose }: ActionFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (result) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [result, onClose]);

  if (!result) return null;

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'plant': return <Leaf className="h-6 w-6" />;
      case 'water': return <Droplets className="h-6 w-6" />;
      case 'fertilize': return <Leaf className="h-6 w-6" />;
      case 'pestControl': return <Bug className="h-6 w-6" />;
      case 'harvest': return <Wheat className="h-6 w-6" />;
      default: return <CheckCircle className="h-6 w-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500 border-green-600';
      case 'warning': return 'bg-yellow-500 border-yellow-600';
      case 'info': return 'bg-blue-500 border-blue-600';
      default: return 'bg-green-500 border-green-600';
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 transition-all duration-300 transform
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        ${getTypeColor(result.type)} text-white rounded-xl p-4 shadow-lg border-2 min-w-80 max-w-sm
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getActionIcon(result.action)}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg capitalize">{result.action} Complete!</h4>
            <p className="text-sm opacity-90 mb-3">{result.message}</p>
            
            {/* Changes Summary */}
            <div className="space-y-1">
              {result.changes.money !== undefined && (
                <div className="flex items-center justify-between text-sm bg-white/20 rounded px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Money</span>
                  </div>
                  <span className={`font-bold ${result.changes.money >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {result.changes.money >= 0 ? '+' : ''}${result.changes.money}
                  </span>
                </div>
              )}
              {result.changes.health !== undefined && (
                <div className="flex items-center justify-between text-sm bg-white/20 rounded px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <Leaf className="h-4 w-4" />
                    <span>Health</span>
                  </div>
                  <span className={`font-bold ${result.changes.health >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {result.changes.health >= 0 ? '+' : ''}{result.changes.health}%
                  </span>
                </div>
              )}
              {result.changes.moisture !== undefined && (
                <div className="flex items-center justify-between text-sm bg-white/20 rounded px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <Droplets className="h-4 w-4" />
                    <span>Moisture</span>
                  </div>
                  <span className="font-bold text-blue-200">
                    +{Math.round(result.changes.moisture * 100)}%
                  </span>
                </div>
              )}
              {result.changes.pestLevel !== undefined && (
                <div className="flex items-center justify-between text-sm bg-white/20 rounded px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <Bug className="h-4 w-4" />
                    <span>Pests</span>
                  </div>
                  <span className="font-bold text-green-200">
                    -{result.changes.pestLevel}%
                  </span>
                </div>
              )}
              {result.changes.harvest !== undefined && (
                <div className="flex items-center justify-between text-sm bg-white/20 rounded px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <Wheat className="h-4 w-4" />
                    <span>Harvest Value</span>
                  </div>
                  <span className="font-bold text-yellow-200">
                    +${result.changes.harvest}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}