import { create } from 'zustand';
import { postDecision } from '@/services/api'; // <--- Imports the clean API function

// ------------------------------------------------
// 1. Initial State: The single source of truth (The Brain)
// ------------------------------------------------
const initialGameState = {
    // Player/Financial Metrics
    turn: 1, 
    budget: 50000, 
    farmHealth: 85, // Health (0-100)
    yieldImpact: 0, 
    
    // NASA Data (Data that informs the player's decision)
    currentNASAData: {
        soilMoisture: 0.50, // Critical for irrigation decisions
        ndvi: 0.40, // Vegetation Health Index
        precipitationForecast: 0, 
        tempAnomaly: 0, 
    },
    
    // History/Reports for F2's End-Game Charts
    decisionHistory: [], 
    
    // UI State
    isLoading: false,
    message: "Welcome back, Alex. The clock is ticking.",
};

// ------------------------------------------------
// 2. The Game Store Definition
// ------------------------------------------------
export const useGameStore = create((set, get) => ({
    ...initialGameState,

    resetGame: () => set(initialGameState),

    // Core Game Loop Logic: F1's main responsibility
    handleEndTurn: async (decision) => {
        set({ isLoading: true, message: "Analyzing data and calculating impact..." });

        try {
            // 1. Execute the API POST (sends decision to B1/B2 logic)
            const turn = get().turn;
            const apiResponse = await postDecision(turn, decision); 

            // 2. Update the state based on the API response
            set((state) => ({
                // Update player metrics
                budget: state.budget + apiResponse.budgetChange,
                // Clamp health between 0 and 100
                farmHealth: Math.min(100, Math.max(0, state.farmHealth + apiResponse.healthChange)),
                turn: state.turn + 1,
                yieldImpact: apiResponse.yieldImpact,

                // Update NASA data for the *next* turn
                currentNASAData: apiResponse.nextNASAData,

                // Record the turn for F2's report
                decisionHistory: [...state.decisionHistory, { 
                    turn: state.turn,
                    decision: decision,
                    impact: apiResponse.healthChange,
                    budget: apiResponse.budgetChange,
                    soilMoisture: state.currentNASAData.soilMoisture,
                    ndvi: state.currentNASAData.ndvi
                }],

                message: apiResponse.message,
            }));
            
        } catch (error) {
            console.error("Game Turn Failed:", error);
            set({ message: "System Error: Could not connect to the Legacy Project servers." });
        } finally {
            set({ isLoading: false });
        }
    },
}));
