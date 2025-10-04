import backgroundImage from '../assets/start-background.png';

interface StartScreenProps {
  onStartGame: () => void;
}

export function StartScreen({ onStartGame }: StartScreenProps) {
  return (
    <div 
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-end text-white p-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-black/30 backdrop-blur-sm p-8 rounded-2xl">
        <button
          onClick={onStartGame}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-full text-2xl shadow-lg shadow-green-500/30 transform transition-all duration-300 hover:scale-110 active:scale-100"
        >
          Start Farming
        </button>
      </div>
    </div>
  );
}

