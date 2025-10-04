'use client';

// F1's temporary placeholder: Buttons that trigger the core game loop function.
// This component sends the player's decision (e.g., 'medium' irrigation) 
// back to the game logic in useGameStore.js.
export function ActionButtons({ onAction, disabled, turn }) {
    const actionType = 'irrigation';
    
    // Function to handle the click and send the level back to F1's logic
    const handleClick = (level) => {
        // This calls the handleAction function defined in page.js
        onAction(actionType, level);
    };

    return (
        <div className="flex justify-center space-x-4 p-2">
            <h3 className="text-lg font-bold mr-4 text-gray-700">Week {turn} Action:</h3>
            
            {/* Action: Low Irrigation */}
            <button 
                onClick={() => handleClick('low')} 
                disabled={disabled}
                className={`px-4 py-2 rounded-lg font-bold transition duration-300 ${disabled ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-green-400 hover:bg-green-500 text-white shadow-md'}`}
            >
                Low Irrigation
            </button>

            {/* F1 tests the 'medium' action (Optimal scenario in mock data) */}
            <button 
                onClick={() => handleClick('medium')} 
                disabled={disabled}
                className={`px-4 py-2 rounded-lg font-bold transition duration-300 ${disabled ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'}`}
            >
                Medium Irrigation
            </button>
            
            {/* F1 tests the 'high' action (Penalty scenario in mock data) */}
             <button 
                onClick={() => handleClick('high')} 
                disabled={disabled}
                className={`px-4 py-2 rounded-lg font-bold transition duration-300 ${disabled ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white shadow-md'}`}
            >
                High Irrigation
            </button>
        </div>
    );
}
