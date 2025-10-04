// F1: This file manages the game's state (the brain).
import { create } from 'zustand';
import { postDecision } from '@/services/api'; // <--- Imports the clean API function

// ------------------------------------------------
// 1. Initial State: The single source of truth for the game
// ------------------------------------------------
const initialGameState = {
    // Player/Financial Metrics (UPDATED)
    turn: 1, // Current game week (1 to 6)
    budget: 50000, // Starting budget
    farmHealth: 85, // Starting health percentage (0-100)
    sustainabilityScore: 75, // NEW: Starting score (0-100)
    yieldImpact: 0, // Yield impact accumulated this turn
    
    // Geographical State (NEW)
    farmLocation: 'Punjab, India', // Default location until selected
    
    // NASA Data (Updated by B1/B2 via API) (UPDATED with new metrics)
    currentNASAData: {
        soilMoisture: 0.50, // SMAP data proxy (0 to 1)
        ndvi: 0.40, // Vegetation Health Index
        precipitationForecast: 0, // GPM data (mm)
        tempAnomaly: 0, // Deviation from historical average (°C)
        pestRisk: 0, // NEW: 0 to 1, calculated from temp/humidity data
    },
    
    // History/Reports for F2's End-Game Charts
    decisionHistory: [], // Stores results of each turn
    
    // UI State
    isLoading: false,
    message: "Welcome back, Alex. The clock is ticking.",
};

// ------------------------------------------------
// 2. The Game Store Definition
// ------------------------------------------------
export const useGameStore = create((set, get) => ({
    ...initialGameState,

    // NEW ACTION: Allows F2's Globe page to set the starting location
    setFarmLocation: (location) => set({ farmLocation: location }),

    // ACTION: Resets the game state (for the restart button)
    resetGame: () => set(initialGameState),

    // ACTION: Simulates the core game turn logic and updates state
    // This is the most crucial action and calls the API (stub for now).
    handleEndTurn: async (decision) => {
        set({ isLoading: true, message: "Analyzing data and calculating impact..." });

        try {
            // 1. POST the decision to the backend (B1/B2)
            const turn = get().turn;
            // Send the current location data along with the decision
            const location = get().farmLocation;
            const apiResponse = await postDecision(turn, decision, location); 

            // 2. Update the state with results
            set((state) => ({
                // Update player metrics
                budget: state.budget + apiResponse.budgetChange,
                farmHealth: Math.min(100, Math.max(0, state.farmHealth + apiResponse.healthChange)),
                sustainabilityScore: Math.min(100, Math.max(0, state.sustainabilityScore + apiResponse.sustainabilityChange)), // NEW
                turn: state.turn + 1,
                yieldImpact: apiResponse.yieldImpact,

                // Update NASA data for the *next* turn (from the API response)
                currentNASAData: apiResponse.nextNASAData,

                // Record the turn in history for F2's report
                decisionHistory: [...state.decisionHistory, { 
                    turn: state.turn,
                    decision: decision,
                    impact: apiResponse.healthChange,
                    sustainabilityImpact: apiResponse.sustainabilityChange, // NEW
                    budget: apiResponse.budgetChange,
                    soilMoisture: state.currentNASAData.soilMoisture,
                    ndvi: state.currentNASAData.ndvi
                }],

                message: apiResponse.message, // Narrative feedback
            }));
            
        } catch (error) {
            console.error("Game Turn Failed:", error);
            set({ message: "System Error: Could not connect to the Legacy Project servers." });
        } finally {
            set({ isLoading: false });
        }
    },
}));
