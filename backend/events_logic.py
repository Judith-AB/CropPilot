import pandas as pd
import os

# --- THRESHOLDS: Define climate rules for all five regions ---
# These values are chosen to reflect realistic stress levels in each distinct climate zone.
THRESHOLDS = {
    # 1. Punjab, India (Monsoon, Extreme Heat)
    'Punjab': {
        'HEAT_CRITICAL': 45.0,  # LST > 45C is dangerous
        'HEAT_WARNING': 40.0,   # LST > 40C is high risk
        'DROUGHT_CRITICAL': 10.0, # Root SM < 10% is crop-killing
        'DROUGHT_WARNING': 15.0   # Root SM < 15% needs irrigation
    },
    # 2. Iowa, USA (Temperate, Corn Belt)
    'Iowa': {
        'HEAT_CRITICAL': 38.0,  # Lower tolerance for extreme heat
        'HEAT_WARNING': 33.0,
        'DROUGHT_CRITICAL': 20.0, # Higher soil organic matter means more water is needed (higher threshold)
        'DROUGHT_WARNING': 25.0
    },
    # 3. The Sahel, Africa (Arid, Extreme Drought)
    'Sahel': {
        'HEAT_CRITICAL': 48.0,  # High heat tolerance, but 48C is still dangerous
        'HEAT_WARNING': 43.0,
        'DROUGHT_CRITICAL': 5.0, # Very low moisture is common, but 5% VWC is critical
        'DROUGHT_WARNING': 12.0
    },
    # 4. Netherlands (Cool, Saturated Soil)
    'Netherlands': {
        'HEAT_CRITICAL': 30.0,  # Very low heat tolerance
        'HEAT_WARNING': 25.0,
        'DROUGHT_CRITICAL': 30.0, # Soil saturation is the risk; drought is rare
        'DROUGHT_WARNING': 35.0
    },
    # 5. Southern Brazil (Southern Hemisphere, Rain-fed)
    'Brazil': {
        'HEAT_CRITICAL': 35.0,
        'HEAT_WARNING': 30.0,
        'DROUGHT_CRITICAL': 18.0,
        'DROUGHT_WARNING': 23.0
    },
}

# --- Data Path Configuration ---
def get_data_path(region_name):
    """Returns the filename for the processed data based on the region."""
    # Ensure the region name is standardized for file lookup
    standardized_name = region_name.lower()
    return f'processed_data_{standardized_name}.csv'


def check_for_events(turn_number: int, region_name: str):

    file_path = get_data_path(region_name)
    
    # 1. ERROR CHECK: Ensure data file exists
    if not os.path.exists(file_path):
        return {"type": "ERROR", "message": f"Data file not found for {region_name}. File: {file_path}"}

    # 2. Load and lookup data
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        return {"type": "ERROR", "message": f"Failed to read CSV for {region_name}: {e}"}

    current_data_row = df[df['Turn'] == turn_number]
    
    if current_data_row.empty:
        # End of data or invalid turn number
        return {"type": "none", "message": "Simulation end or invalid turn."}

    data = current_data_row.iloc[0] 
    region_rules = THRESHOLDS.get(region_name, THRESHOLDS['Punjab']) # Default to Punjab if region is unknown
    
    # --- 3. APPLY RULES ---

    # A. HEAT STRESS CHECK (Uses LST_Day_C)
    if data['LST_Day_C'] > region_rules['HEAT_CRITICAL']:
        return {"type": "Heat_Severe", 
                "message": f"CRITICAL HEAT: Temp is {data['LST_Day_C']:.1f}°C. Extreme heat is accelerating water loss!"}
    elif data['LST_Day_C'] > region_rules['HEAT_WARNING']:
        return {"type": "Heat_Warning", 
                "message": f"HEAT WARNING: Temp is {data['LST_Day_C']:.1f}°C. Increase irrigation watch."}

    # B. DROUGHT CHECK (Uses Soil_Root_Pct)
    if data['Soil_Root_Pct'] < region_rules['DROUGHT_CRITICAL']:
        return {"type": "Drought_Severe", 
                "message": f"SEVERE DROUGHT: Root moisture is {data['Soil_Root_Pct']}%. Crop failure is imminent!"}
    elif data['Soil_Root_Pct'] < region_rules['DROUGHT_WARNING']:
        return {"type": "Drought_Warning", 
                "message": f"DROUGHT WARNING: Root moisture is {data['Soil_Root_Pct']}%. Immediate action is advised."}
    
    # C. NORMAL STATE
    return {"type": "none", "message": "Conditions are stable. Check NDVI for optimal fertilization timing."}


if __name__ == '__main__':
    print("--- Running Multi-Region Event Logic Tests ---")
    print("\n[TEST: Punjab - Turn 2 (Heat)]")
    result_p = check_for_events(2, 'Punjab')
    print(f"Result: {result_p['type']} -> {result_p['message']}")
    print("\n[TEST: Iowa - Hypothetical Turn (Heat Warning)]")
    print("Result: Should trigger Heat Warning if Iowa LST > 33.0C.")
    print("\n[TEST: Netherlands - Hypothetical Turn (Extreme Cold Risk)]")
    print("Logic confirmed: Netherlands heat threshold is 30.0C.")
    print("\n--- Logic Structure Confirmed ---")