import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import worldMapImage from '../assets/world-map.png';

import punjabAvatar from '../assets/Alex.png';
import iowaAvatar from '../assets/Granny.png';
import brazilAvatar from '../assets/Brazil.png';
import netherlandsAvatar from '../assets/Cloe.png';
import sahelAvatar from '../assets/africa.png';

interface WorldMapProps {
    onLocationSelect: (locationId: string) => void;
}

const destinations = [
    {
        id: 'Punjab', name: 'Punjab, India', x: 66, y: 52,
        avatar: punjabAvatar, avatarName: 'Alex', role: 'Research Student',
        story: 'My grandfather\'s hands were weathered from a lifetime of farming, yet he always smiled. When he passed, he made me promise to help farmers like him. Now I study sustainable methods, hoping to honor his memory and ease the burden for those who feed us all.'
    },
    {
        id: 'Iowa', name: 'Iowa, USA', x: 23, y: 45,
        avatar: iowaAvatar, avatarName: 'John', role: 'Family Farmer',
        story: 'Every morning, I walk the same fields my father did. He taught me to listen to the land, but lately it\'s been harder to understand. I\'m learning new ways while holding onto his lessons, hoping my kids will want to continue what we\'ve built together.'
    },
    {
        id: 'Sahel', name: 'Sahel, Africa', x: 49, y: 55,
        avatar: sahelAvatar, avatarName: 'Leyla', role: 'Climate Scientist',
        story: 'I remember my mother\'s worried face during the droughts, how she\'d skip meals to feed us. That memory pushed me through university. Now I return home not as the girl who left, but as someone who might finally have answers to help my community thrive again.'
    },
    {
        id: 'Netherlands', name: 'Netherlands', x: 47.5, y: 39,
        avatar: netherlandsAvatar, avatarName: 'Chloe', role: 'Agri-Tech Innovator',
        story: 'My grandmother always said we must leave the earth better than we found it. Watching her tend her small garden with such care inspired me to think bigger. Now I combine her gentle wisdom with modern technology, trying to grow food in harmony with nature.'
    },
    {
        id: 'Brazil', name: 'Brazil', x: 31, y: 68,
        avatar: brazilAvatar, avatarName: 'Sarah', role: 'Agricultural Student',
        story: 'I grew up helping my parents on our small farm, dreaming of faraway places. But when I left for university, I realized home was where I was needed most. I\'m learning everything I can to come back and show that we can farm sustainably and prosperously.'
    },
];

export default function WorldMap({ onLocationSelect }: WorldMapProps) {
    const [selectedDestination, setSelectedDestination] = useState<typeof destinations[0] | null>(null);

    return (
        <div style={{ background: 'linear-gradient(135deg, #122c73ff 0%, #8bc886ff 50%, #1e40af 100%)', minHeight: '100vh' }} className="relative overflow-hidden">
            <div className="flex flex-col items-center justify-center min-h-screen p-4 lg:p-8">
                <div className="mb-12 px-6">
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontFamily: '"Montserrat", "Raleway", "Inter", sans-serif',
                        letterSpacing: '0.02em'
                    }} 
                    className="font-bold text-white drop-shadow-xl text-center relative">
                        <span className="relative z-10">Select a Farming Region</span>
                        <div className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>
                    </h1>
                </div>
                
                <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
                    <img
                        src={worldMapImage}
                        alt="World Map Background"
                        className="w-full h-full object-cover"
                    />
                    {destinations.map((destination) => (
                        <div
                            key={destination.id}
                            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-125 group"
                            style={{ left: `${destination.x}%`, top: `${destination.y}%` }}
                            onClick={() => setSelectedDestination(destination)}
                        >
                            <div className="relative">
                                <MapPin className="w-10 h-10 text-red-600 fill-red-500 drop-shadow-lg relative z-10" strokeWidth={2.5} />
                                <div className="absolute inset-0 w-10 h-10 bg-red-500 rounded-full opacity-30 animate-ping"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedDestination && (
                <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl p-8 max-w-3xl w-full relative shadow-2xl text-black border-4 border-white">
                        <button
                            onClick={() => setSelectedDestination(null)}
                            className="absolute top-4 right-4 text-black hover:text-red-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-6">
                            <img
                                src={selectedDestination.avatar}
                                alt={`${selectedDestination.avatarName} avatar`}
                                className="w-48 h-48 object-cover rounded-full border-4 border-violet-400 shadow-lg flex-shrink-0"
                            />
                            
                            <div className="bg-white rounded-2xl shadow-2xl p-6 flex-1 border-2 border-gray-200">
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold">{selectedDestination.avatarName}</h2>
                                    <p className="text-lg font-semibold text-violet-600">{selectedDestination.role}</p>
                                    <p className="text-base text-gray-800 leading-relaxed">{selectedDestination.story}</p>
                                </div>
                                
                                <button
                                    onClick={() => onLocationSelect(selectedDestination.id)}
                                    className="w-full mt-6 px-6 py-3 rounded-lg text-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Play as {selectedDestination.avatarName}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}