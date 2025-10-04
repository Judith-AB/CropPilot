'use client'; 
// Use 'use client' in all components that use hooks or handle interactivity.

// F1's temporary placeholder: This component shows the budget and message.
// F2 will replace this file with the beautiful final dashboard.
export function GameDashboard({ budget, message, health, nasaData, isLoading }) {
    return (
        <div className="bg-blue-100 p-4 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-blue-800">DASHBOARD PLACEHOLDER</h3>
            <p className="mt-2">💰 Budget: ${budget.toLocaleString()}</p>
            <p>💖 Health: {health}%</p>
            <p className="text-sm italic mt-2">NASA Data (Moisture): {nasaData.soilMoisture}</p>
            <p className="mt-2 p-2 bg-yellow-200 rounded text-sm font-semibold">{message}</p>
            {isLoading && <p className="text-red-500 font-bold">LOADING...</p>}
        </div>
    );
}