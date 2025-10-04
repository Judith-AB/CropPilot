'use client'; 

// This function will be replaced by B1/B2's real API endpoint in Phase 3.
// For now, it returns mock data to test F1's game logic in the store.
export async function postDecision(turn, decision) {
    // F1 Logic: Creates a unique key based on the turn and decision for mock data lookup
    const key = `${turn}_${decision.action}_${decision.level}`;
    console.log(`F1 API: Processing turn ${turn} with key: ${key}`);
    
    // --- MOCK LOGIC TABLE ---
    const mockResponses = {
        // TURN 1: Assume SMAP data is low (0.50). Medium irrigation is optimal.
        '1_irrigation_medium': { healthChange: 12, budgetChange: -4500, message: "Optimal moisture achieved! The field looks revitalized.", 
             nextNASAData: { soilMoisture: 0.62, ndvi: 0.50, precipitationForecast: 0, tempAnomaly: 0 } 
           },
        '1_irrigation_high': { healthChange: 5, budgetChange: -7000, message: "Heavy irrigation. Moisture is high, but the cost was steep.", 
             nextNASAData: { soilMoisture: 0.70, ndvi: 0.45, precipitationForecast: 0, tempAnomaly: 1 } 
           },
        // TURN 2: Assume SMAP data is high (0.62). High irrigation would be bad (penalty).
        '2_irrigation_medium': { healthChange: 2, budgetChange: -4000, message: "Maintenance level irrigation. Health is stable.", 
             nextNASAData: { soilMoisture: 0.55, ndvi: 0.65, precipitationForecast: 5, tempAnomaly: 0 } 
           },
        '2_irrigation_high': { healthChange: -8, budgetChange: -7500, message: "WARNING: Excessive moisture detected. Risk of root rot and runoff penalty.", 
             nextNASAData: { soilMoisture: 0.75, ndvi: 0.60, precipitationForecast: 0, tempAnomaly: 2 } 
           },
    };

    const response = mockResponses[key] || { 
        healthChange: -2, budgetChange: -1000, message: "Neutral action. Minor health decay.",
        nextNASAData: { soilMoisture: 0.45, ndvi: 0.50, precipitationForecast: 0, tempAnomaly: 1 }
    };

    // Simulate network delay for a realistic feel
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    return {
        healthChange: response.healthChange,
        budgetChange: response.budgetChange,
        yieldImpact: response.yieldImpact || 1, 
        message: response.message,
        nextNASAData: response.nextNASAData
    };
}
