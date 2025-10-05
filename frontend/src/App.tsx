import { useState, useEffect } from 'react';
import { FarmGrid } from './components/FarmGrid';
import { GameHeader } from './components/GameHeader';
import { ActionPanel } from './components/ActionPanel';
import { DataPanel } from './components/DataPanel';
import { SeasonComplete } from './components/SeasonComplete';
import { ActionFeedback, ActionResult } from './components/ActionFeedback';
import { Tractor } from 'lucide-react';
import { StartScreen } from './components/StartScreen';
import WorldMap from './components/WorldMap';
import { LocationSelector } from './components/LocationSelector'; // Retaining import for compilation

// --- INTERFACE DEFINITIONS (EXPORTED FOR USE IN DATAPANEL) ---
interface DataValue { value: number | null; unit: string | null; }
interface SeasonData {
  soilMoisture: DataValue;
  cropHealth: DataValue;
  temperature: DataValue;
}
interface SpecialEvent { eventName: string; description: string; }

export interface Plot { // EXPORTED
  id: number;
  cropType: string | null;
  growthStage: number;
  health: number;
  soilMoisture: number; // 0-1 scale (Frontend's internal logic scale)
  fertilizerEffect: number;
  pestLevel: number;
}

export interface GameState { // EXPORTED
  week: number;
  money: number;
  selectedPlot: number | null;
  plots: Plot[];
  gameComplete: boolean;
  totalHarvested: number;
  seasonProfit: number;

  // --- API DATA FIELDS ---
  date: string;
  region: string;
  globalSoilMoisture: number;
  ndvi: number;
  temperature: { value: number; unit: string; };
  specialEvent: SpecialEvent | null;
  seasonData: SeasonData; // The full nested structure
}
// --- END INTERFACES ---

const TOTAL_WEEKS = 12;
const GRID_SIZE = 9;
const INITIAL_MONEY = 5000;
const API_URL = 'http://127.0.0.1:5000/api/gamestate';


export default function App() {
  const [currentScreen, setCurrentScreen] = useState('start');
  const [region, setRegion] = useState('Punjab');

  const [gameState, setGameState] = useState<GameState>({
    week: 1,
    money: INITIAL_MONEY,
    selectedPlot: null,
    plots: Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i, cropType: null, growthStage: 0, health: 100,
      soilMoisture: 0.5, fertilizerEffect: 0, pestLevel: 0,
    })),
    gameComplete: false,
    totalHarvested: 0,
    seasonProfit: 0,
    date: 'Loading...',
    region: 'Punjab',
    globalSoilMoisture: 0.0,
    ndvi: 0.0,
    temperature: { value: 0, unit: 'C' },
    specialEvent: null,
    seasonData: { // Initialize nested structure for safety
      soilMoisture: { value: 0, unit: '%' },
      cropHealth: { value: 0, unit: 'NDVI' },
      temperature: { value: 0, unit: 'C' },
    }
  });

  const [isProcessing, setIsProcessing] = useState(true);
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);

  const handleStartGame = () => setCurrentScreen('map');

  // CRITICAL FIX: Handles selection from WorldMap 
  const handleLocationSelect = (locationId: string) => {
    // FIX: Capitalize first letter to match API/Backend structure (e.g., 'punjab' -> 'Punjab')
    const selectedRegion = locationId.charAt(0).toUpperCase() + locationId.slice(1);
    setRegion(selectedRegion); // Triggers useEffect below
    setCurrentScreen('game');
  };

  const fetchBackendData = async (turnNumber: number, selectedRegion: string) => {
    try {
      // CRITICAL FIX: Correctly send 'region' parameter (matches app.py)
      const response = await fetch(`${API_URL}?region=${selectedRegion}&turn=${turnNumber}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Could not fetch data from backend:", error);
      return null;
    }
  };

  // --- EFFECT: Reloads data on initial load or region change ---
  useEffect(() => {
    if (currentScreen !== 'game' || !region) return;

    const loadInitialData = async () => {
      setIsProcessing(true);

      const initialData = await fetchBackendData(1, region);

      if (initialData && initialData.seasonData) {
        const smPct = initialData.seasonData.soilMoisture.value ?? 0;
        const ndviVal = initialData.seasonData.cropHealth.value ?? 0;

        setGameState(prev => ({
          ...prev,
          week: initialData.turnNumber,
          date: initialData.date,
          region: initialData.region,

          globalSoilMoisture: smPct / 100, // Mapped data
          ndvi: ndviVal,
          temperature: initialData.seasonData.temperature,
          specialEvent: initialData.specialEvent,

          seasonData: initialData.seasonData, // CRITICAL: Save nested structure for DataPanel

          plots: prev.plots.map(plot => ({ ...plot, soilMoisture: smPct / 100 }))
        }));
      } else {
        setGameState(prev => ({ ...prev, date: 'Data Error', gameComplete: false, region: region }));
      }
      setIsProcessing(false);
    };
    loadInitialData();
  }, [region, currentScreen]);

  const advanceWeek = async () => {
    if (isProcessing || gameState.gameComplete) return;
    setIsProcessing(true);

    const nextWeek = gameState.week + 1;
    // Pass the current 'region' from gameState
    const backendData = await fetchBackendData(nextWeek, gameState.region);

    if (!backendData) {
      console.log("No more data from backend. Ending season.");
      setGameState(prev => ({ ...prev, gameComplete: true }));
      setIsProcessing(false);
      return;
    }

    setGameState(prev => {
      const smPct = backendData.seasonData.soilMoisture.value ?? 0;
      const globalSoilMoisture = smPct / 100; // 0-1 scale for internal logic

      const isHeatwave = backendData.specialEvent?.eventName.includes('Heat');
      const isDrought = backendData.specialEvent?.eventName.includes('Drought');
      const isSevere = backendData.specialEvent?.eventName.includes('Severe');


      // --- INTERNAL GAME LOGIC: Update plots based on new NASA data ---
      const newPlots = prev.plots.map(plot => {
        let newPlot = { ...plot };
        if (!newPlot.cropType) return newPlot;

        if (newPlot.growthStage > 0 && newPlot.growthStage < 5) newPlot.growthStage++;
        newPlot.fertilizerEffect = Math.max(0, newPlot.fertilizerEffect - 1);

        let pestIncrease = isHeatwave ? 20 : 10;
        newPlot.pestLevel = Math.min(100, newPlot.pestLevel + Math.random() * pestIncrease);

        let healthChange = 0;
        const moistureDeficit = Math.abs(newPlot.soilMoisture - 0.5);
        if (moistureDeficit > 0.2) { healthChange -= moistureDeficit * 30; }
        else { healthChange += 10; }

        if (newPlot.fertilizerEffect > 0) healthChange += 15;
        if (newPlot.pestLevel > 40) healthChange -= (newPlot.pestLevel / 100) * 40;

        if (isSevere) healthChange -= 25;
        else if (isHeatwave || isDrought) healthChange -= 15;

        newPlot.health = Math.max(0, Math.min(100, newPlot.health + healthChange));

        const dryingRate = isHeatwave ? 0.2 : 0.1;
        newPlot.soilMoisture = Math.max(0, newPlot.soilMoisture - dryingRate);

        return newPlot;
      });

      return {
        ...prev,
        week: backendData.turnNumber,
        plots: newPlots,
        gameComplete: backendData.turnNumber >= TOTAL_WEEKS,
        date: backendData.date,
        globalSoilMoisture: globalSoilMoisture,
        ndvi: backendData.seasonData.cropHealth.value ?? 0,
        temperature: backendData.seasonData.temperature,
        specialEvent: backendData.specialEvent,
        seasonData: backendData.seasonData,
      };
    });

    setIsProcessing(false);
  };

  const performAction = (action: string, level: string, cost: number) => {
    if (gameState.money < cost || gameState.selectedPlot === null || isProcessing) return;

    setGameState(prev => {
      const plotIndex = prev.selectedPlot!;
      const newPlots = [...prev.plots];
      const plot = { ...newPlots[plotIndex] };

      switch (action) {
        case 'plant':
          plot.cropType = 'corn';
          plot.growthStage = 1;
          plot.health = 100;
          break;
        case 'water':
          let moistureGain = 0;
          if (level === 'light') moistureGain = 0.15;
          if (level === 'moderate') moistureGain = 0.30;
          if (level === 'heavy') moistureGain = 0.50;
          plot.soilMoisture = Math.min(1, plot.soilMoisture + moistureGain);
          break;
        case 'fertilize':
          let healthGain = 0;
          if (level === 'cheap') { healthGain = 10; plot.fertilizerEffect = 2; }
          if (level === 'premium') { healthGain = 25; plot.fertilizerEffect = 4; }
          plot.health = Math.min(100, plot.health + healthGain);
          break;
        case 'pestControl':
          let pestReduction = 0;
          if (level === 'basic') pestReduction = 40;
          if (level === 'advanced') pestReduction = 80;
          plot.pestLevel = Math.max(0, plot.pestLevel - pestReduction);
          break;
        case 'harvest':
          if (plot.growthStage === 5) {
            const harvestValue = Math.floor((plot.health / 100) * 800);
            plot.cropType = null;
            plot.growthStage = 0;
            plot.health = 100;

            return {
              ...prev,
              money: prev.money + harvestValue,
              totalHarvested: prev.totalHarvested + 1,
              plots: [...newPlots.slice(0, plotIndex), plot, ...newPlots.slice(plotIndex + 1)],
            };
          }
          return prev;
      }

      newPlots[plotIndex] = plot;
      const simpleActionResult: ActionResult = { type: 'success', action: action, message: `${action} applied successfully!`, changes: { money: -cost } };
      setActionResult(simpleActionResult);

      return { ...prev, money: prev.money - cost, plots: newPlots };
    });
  };

  const selectPlot = (plotId: number) => {
    setGameState(prev => ({
      ...prev,
      selectedPlot: prev.selectedPlot === plotId ? null : plotId,
    }));
  };

  const handleLocationChange = (newLocation: string) => {
    // FIX: Only runs if game is not started or location is different
    if (gameState.week > 1 || isProcessing || gameState.region === newLocation) return;

    // 1. Update the local state variable, which is the dependency for useEffect
    setRegion(newLocation);

    // 2. Reset the internal game state immediately (Week 1, reset plots)
    setGameState(prev => ({
      ...prev,
      week: 1,
      money: INITIAL_MONEY,
      selectedPlot: null,
      plots: Array.from({ length: GRID_SIZE }, (_, i) => ({
        id: i, cropType: null, growthStage: 0, health: 100,
        soilMoisture: 0.5, fertilizerEffect: 0, pestLevel: 0,
      })),
      gameComplete: false,
      totalHarvested: 0,
      seasonProfit: 0,
      region: newLocation, // Update the GameState region
    }));
  };

  const resetGame = () => { window.location.reload(); };

  useEffect(() => {
    setGameState(prev => ({ ...prev, seasonProfit: prev.money - INITIAL_MONEY }));
  }, [gameState.money]);

  if (gameState.gameComplete) {
    return <SeasonComplete gameState={gameState} onRestart={resetGame} />;
  }

  // --- Screen Manager ---
  if (currentScreen === 'start') {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  if (currentScreen === 'map') {
    return <WorldMap onLocationSelect={handleLocationSelect} />;
  }
  // --- End Screen Manager ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <GameHeader
        week={gameState.week}
        totalWeeks={TOTAL_WEEKS}
        money={gameState.money}
        onAdvanceWeek={advanceWeek}
        isProcessing={isProcessing}
      />

      <div className="flex-1 container mx-auto px-4 py-6 relative z-10">
        {/* CRITICAL FIX: REMOVED REDUNDANT LocationSelector from the main game screen */}
        {/* <LocationSelector currentLocation={gameState.region} onSelectLocation={handleLocationChange} /> */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full mt-4">

          <div className="lg:col-span-3">
            <DataPanel gameState={gameState} />
          </div>

          <div className="lg:col-span-6">
            <div className="bg-gradient-to-br from-emerald-900/50 via-green-900/50 to-teal-900/50 backdrop-blur-md rounded-3xl p-6 border-2 border-emerald-400/40 shadow-2xl h-full game-glow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
                    <Tractor className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">YOUR FARM - {gameState.region?.toUpperCase()}</h2>
                    <p className="text-xs text-emerald-300">Manage your crops</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
                  <div className="text-xs text-emerald-300">
                    {gameState.selectedPlot !== null
                      ? `Plot #${gameState.selectedPlot + 1}`
                      : 'No selection'}
                  </div>
                </div>
              </div>

              <FarmGrid
                plots={gameState.plots}
                selectedPlot={gameState.selectedPlot}
                onSelectPlot={selectPlot}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <ActionPanel
              gameState={gameState}
              onAction={performAction}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>

      <ActionFeedback
        result={actionResult}
        onClose={() => setActionResult(null)}
      />
    </div>
  );
}
