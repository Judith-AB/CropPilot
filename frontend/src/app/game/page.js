'use client'; 
// Tells Next.js this code runs in the browser, necessary for React hooks

import { useGameStore } from '@/store/useGameStore';
import { useMemo } from 'react';
// These components are F2's responsibility (they must create these files!)
import { GameDashboard } from '@/components/GameDashboard'; 
import { FarmPlot } from '@/components/FarmPlot';
import { ActionButtons } from '@/components/ActionButtons';

export default function Game() {
    // F1: Connects the components to the global state
    const { 
        turn, 
        budget, 
        farmHealth, 
        currentNASAData, 
        isLoading, 
        message, 
        handleEndTurn,
        resetGame // Included for a restart button (F2 could implement this)
    } = useGameStore();

    // Game End Condition: The story is 6 weeks long.
    const MAX_TURNS = 6;
    const isGameRunning = turn <= MAX_TURNS;
    const canAct = useMemo(() => !isLoading && isGameRunning, [isLoading, isGameRunning]);

    // F1: The function passed to F2's ActionButtons
    const handleAction = (actionType, level) => {
        if (!canAct) return;
        
        // This is the payload B1/B2 expects
        const decision = {
            action: actionType, 
            level: level,       
        };

        // F1: Triggers the logic defined in the Zustand store
        handleEndTurn(decision);
    };

    // --- End-of-Game State (The Conclusion) ---
    if (!isGameRunning) {
        // F2 must create the EndGameReport component
        // return <EndGameReport />; 

        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
                <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl max-w-4xl w-full text-center">
                    <h1 className="text-5xl font-extrabold text-yellow-400 mb-4">
                        LEGACY PROJECT COMPLETE
                    </h1>
                    <p className="text-xl text-gray-300 mb-6">
                        The season is over. The bank's deadline has passed.
                    </p>
                    <div className="text-left bg-gray-700 p-6 rounded-lg mb-8">
                         <h2 className="text-2xl font-semibold text-white mb-2">Final Metrics:</h2>
                         <p>Budget Remaining: <span className="font-bold text-green-400">${budget.toLocaleString()}</span></p>
                         <p>Final Crop Health: <span className="font-bold text-yellow-400">{farmHealth}%</span></p>
                         <p className="mt-4 text-sm text-gray-400">
                             F2: Integrate the Report component here to show all historical data!
                         </p>
                    </div>
                    <button 
                        onClick={resetGame} 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-lg"
                    >
                        Start New Season
                    </button>
                </div>
            </div>
        );
    }

    // --- Main Game Running State ---
    return (
        // F1: Defines the main visual structure using Tailwind classes
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                TerraForm: The Legacy Project (Week {turn}/{MAX_TURNS})
            </h1>
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* --- COLUMN 1: Dashboard and NASA Data (F2's Work) --- */}
                <div className="lg:col-span-1 space-y-6">
                    {/* F1 passes the essential data to F2's component */}
                    <GameDashboard 
                        budget={budget} 
                        health={farmHealth} 
                        nasaData={currentNASAData} 
                        message={message}
                        isLoading={isLoading}
                    />
                    
                    {/* F2: Data Visualization Charts component will go here */}
                </div>

                {/* --- COLUMN 2: Farm Visual (F2's Work) --- */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-xl relative h-96 md:h-[500px]">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Field Monitoring View</h2>
                        
                        {/* F1 passes health data for F2 to apply conditional coloring */}
                        <FarmPlot health={farmHealth} /> 
                    </div>
                </div>
            </div>

            {/* --- ACTION BAR (F2's Work, but F1 provides the function) --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-4 border-gray-200 shadow-2xl z-10">
                 <div className="max-w-7xl mx-auto">
                    <ActionButtons 
                        onAction={handleAction} 
                        disabled={!canAct} 
                        turn={turn}
                    />
                 </div>
            </div>
        </div>
    );
}
