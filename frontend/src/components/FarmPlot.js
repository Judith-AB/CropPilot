'use client'; 

// F1's temporary placeholder: A simple box that shows the farm health prop.
// F2 will enhance this to use more detailed visual feedback and potentially charts.
export function FarmPlot({ health }) {
    // Logic: use health prop to change color (Green is good, Red is bad)
    // 80%+ is healthy (Green), 50-80% is stressed (Yellow), below 50% is critical (Red).
    const color = health > 80 ? 'bg-green-600' : health > 50 ? 'bg-yellow-500' : 'bg-red-600';
    
    return (
        <div className={`w-full h-64 flex items-center justify-center rounded-lg shadow-inner transition duration-500 ${color}`}>
            <p className="text-white text-3xl font-bold">FARM PLOT ({health}%)</p>
        </div>
    );
}
