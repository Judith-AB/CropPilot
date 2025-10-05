import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
    currentLocation: string;
    onSelectLocation: (location: string) => void;
}

// --- MODIFICATION: Added all 5 locations from the backend ---
const locations = [
    { id: 'Punjab', name: 'Punjab, India' },
    { id: 'Iowa', name: 'Iowa, USA' },
    { id: 'Sahel', name: 'Sahel, Africa' },
    { id: 'Netherlands', name: 'Netherlands' },
    { id: 'Brazil', name: 'Brazil' },


];

export function LocationSelector({ currentLocation, onSelectLocation }: LocationSelectorProps) {
    return (
        <div className="mb-4 bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-5 w-5 text-violet-300" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Farm Location</h3>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {locations.map(loc => (
                    <button
                        key={loc.id}
                        onClick={() => onSelectLocation(loc.id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex-shrink-0
                        ${currentLocation === loc.id
                                ? 'bg-violet-500 text-white shadow-lg'
                                : 'bg-black/30 text-violet-200 hover:bg-violet-500/50'
                            }`
                        }
                    >
                        {loc.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

