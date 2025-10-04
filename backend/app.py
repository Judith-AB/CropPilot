import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import numpy as np
# Import B2's external logic file, which contains the region-specific rules
from events_logic import check_for_events 

# List of all available regions for validation
REGIONS = ['Punjab', 'Iowa', 'Sahel', 'Netherlands', 'Brazil']

# Dictionary to hold all 5 DataFrames, keyed by region name

GAME_DATA_DICT = {}

# --- DATA LOADING FUNCTION
def load_all_game_data():
    """Loads all 5 processed CSV files into the global dictionary."""
    global GAME_DATA_DICT
    data_loaded = True
    
    print("--- Starting Multi-Region Data Loading ---")
    for region_name in REGIONS:
        # Construct the unique filename B2 created
        file_name = f'processed_data_{region_name.lower()}.csv'
        try:
            # Load file and set 'Turn' column as index for fast lookups
            df = pd.read_csv(file_name)
            
            # Use 'Turn' column as index for 1-based indexing lookup 
            df.set_index('Turn', inplace=True) 
            
            GAME_DATA_DICT[region_name] = df
            print(f" Loaded data for {region_name}")
            
        except FileNotFoundError:
            print(f"ERROR: File not found for {region_name}. Check B2's push.")
            data_loaded = False
        except Exception as e:
            print(f"ERROR loading {region_name} data: {e}")
            data_loaded = False
            
    if not data_loaded:
        print("\nFATAL: Not all data files loaded. Deployment may fail for missing regions.")
        
load_all_game_data()

# --- Flask App Setup ---
app = Flask(__name__)

CORS(app) 

# --- Main API Endpoint ---
@app.route('/api/gamestate')
def get_gamestate():
    """
    Returns the current environmental data and any triggered events for a given turn and region.
    Endpoint structure: /api/gamestate?turn=2&region=Iowa
    """
    
    # 1. Get and Validate Parameters (Default region is Punjab; default turn is 1)
    try:
        region = request.args.get('region', 'Punjab')
        turn_number = int(request.args.get('turn', 1))
    except ValueError:
        return jsonify({"error": "Invalid turn number"}), 400

    # Validate region input against the list of available regions
    if region not in REGIONS:
        return jsonify({"error": f"Invalid region selected. Options: {', '.join(REGIONS)}"}), 404

    # Select the correct DataFrame based on the region parameter
    current_df = GAME_DATA_DICT.get(region)
    if current_df is None:
        return jsonify({"error": f"Data not loaded for region: {region}. Check server startup logs."}), 500

    # 2. Check for Turn Validity and Lookup
    if turn_number not in current_df.index:
        max_turns = len(current_df)
        return jsonify({"error": f"Turn {turn_number} not found. Max turns for {region} is {max_turns}."}), 404

    current_turn_data = current_df.loc[turn_number]

    # 3. Get Event Data from B2's Logic (The key integration point)
    event_data = check_for_events(turn_number, region) 
    
    special_event_obj = None
    if event_data.get("type") == "ERROR":
        return jsonify({"error": event_data["message"]}), 500
    elif event_data.get("type") != "none":
        special_event_obj = {
            "eventName": event_data["type"],
            "description": event_data["message"]
        }
    
    # --- 4. Create Final JSON Response ---
    
    live_data = {
        "turnNumber": turn_number,
        "region": region,
        "date": current_turn_data['Start_Date'],
        
        "seasonData": {
            # Soil Moisture: Rounded to 1 decimal place (matches B2's output)
            "soilMoisture": {"value": round(current_turn_data['Soil_Root_Pct'], 1), "unit": "%"},
            # Crop Health: Rounded to 3 decimal places for scientific precision
            "cropHealth": {"value": round(current_turn_data['NDVI'], 3), "unit": "NDVI"},
            # Temperature: Rounded to 1 decimal place
            "temperature": {"value": round(current_turn_data['LST_Day_C'], 1), "unit": "C"},
        },
        
        "specialEvent": special_event_obj
    }
    
    return jsonify(live_data)

# --- Run the Server ---
if __name__ == '__main__':
    # Running on 0.0.0.0 allows other teammates (Frontend) to access the API easily
    app.run(debug=True, host='0.0.0.0')