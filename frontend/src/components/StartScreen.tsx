import backgroundImage from '../assets/start-background.png';

interface StartScreenProps {
  onStartGame: () => void;
}

export function StartScreen({ onStartGame }: StartScreenProps) {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col justify-end items-center text-white p-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <button
        onClick={onStartGame}
        className="mb-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-full text-2xl transform transition-all duration-300 hover:scale-110 active:scale-100"
      >
        Start Farming
      </button>
    </div>
  );
}
