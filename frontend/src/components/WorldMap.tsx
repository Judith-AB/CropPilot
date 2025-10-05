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
        story: 'As a research student, I\'m exploring sustainable farming methods in the breadbasket of India. I believe we can use technology to improve crop yields and reduce environmental impact.'
    },
    {
        id: 'Iowa', name: 'Iowa, USA', x: 23, y: 45,
        avatar: iowaAvatar, avatarName: 'John', role: 'Family Farmer',
        story: 'My family has been farming this land for generations. I want to combine our traditional knowledge with modern techniques to make our farm more efficient and sustainable for the future.'
    },
    {
        id: 'Sahel', name: 'Sahel, Africa', x: 49, y: 55,
        avatar: sahelAvatar, avatarName: 'Leyla', role: 'Climate Scientist',
        story: 'I\'m a climate scientist studying the effects of changing weather patterns. The Sahel is a critical region for this research. Join me in developing strategies to help farmers adapt and thrive.'
    },
    {
        id: 'Netherlands', name: 'Netherlands', x: 47.5, y: 39,
        avatar: netherlandsAvatar, avatarName: 'Chloe', role: 'Agri-Tech Innovator',
        story: 'I believe technology is the key to the future of farming. Here in the Netherlands, we are pioneering new methods. Join me in pushing the boundaries of what\'s possible in agriculture.'
    },
    {
        id: 'Brazil', name: 'Brazil', x: 32, y: 68,
        avatar: brazilAvatar, avatarName: 'Sara', role: 'Agricultural Student',
        story: 'As an agricultural student, I\'m passionate about learning new techniques. Brazil\'s diverse climate provides a great opportunity to study different crops. Let\'s innovate together!'
    },
];

export default function WorldMap({ onLocationSelect }: WorldMapProps) {
    const [selectedDestination, setSelectedDestination] = useState<typeof destinations[0] | null>(null);

    return (
        <div className="relative h-screen bg-white text-black overflow-hidden">
            <div className="flex flex-col items-center justify-center h-full p-4 lg:p-8">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-center text-black">
                    Select a Farming Region
                </h1>
                <p className="mb-8 text-center max-w-lg text-black">
                    Choose a region to start your farming journey. Each has unique climate data from NASA.
                </p>
                <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-white">
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
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white border-2 border-violet-500/30 rounded-2xl p-8 max-w-xl w-full relative shadow-2xl text-black">
                        <button
                            onClick={() => setSelectedDestination(null)}
                            className="absolute top-4 right-4 text-black hover:text-red-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center space-x-6">
                            <img
                                src={selectedDestination.avatar}
                                alt={`${selectedDestination.avatarName} avatar`}
                                className="w-40 h-40 object-cover rounded-full border-4 border-violet-400 shadow-lg flex-shrink-0"
                            />
                            <div className="relative bg-white text-black p-6 rounded-3xl shadow-lg w-full">
                                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white transform -translate-y-1/2 rotate-45"></div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold">{selectedDestination.avatarName}</h2>
                                    <p className="text-lg font-semibold text-black">{selectedDestination.role}</p>
                                    <p className="text-md text-black">{selectedDestination.story}</p>
                                </div>
                                <button
                                    onClick={() => onLocationSelect(selectedDestination.id)}
                                    className="w-full mt-4 px-6 py-3 rounded-lg text-lg font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors transform hover:scale-105"
                                >
                                    Start as {selectedDestination.avatarName}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
