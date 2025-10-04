import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

# --- (Your data loading code from before stays the same) ---
try:
    csv_filename = 'processed_data.csv' # Make sure this is B2's filename
    game_data_df = pd.read_csv(csv_filename)
    game_data_df.fillna(method='ffill', inplace=True)
    print("✅ B2's final processed data loaded successfully.")
except FileNotFoundError:
    print(f"❌ Error: Data file '{csv_filename}' not found.")
    game_data_df = None
# -----------------------------------------------------------

app = Flask(__name__)
CORS(app)

@app.route('/api/gamestate')
def get_gamestate():
    try:
        turn_number = int(request.args.get('turn', 0))
    except ValueError:
        return jsonify({"error": "Invalid turn number"}), 400

    if game_data_df is None or not (0 <= turn_number < len(game_data_df)):
        return jsonify({"error": "Data not loaded or invalid turn number"}), 404

    current_turn_data = game_data_df.iloc[turn_number]

    # --- Use the EXACT column names you provided ---
    # These are the keys to reading the data from B2's file
    crop_health_val = current_turn_data['NDVI']
    soil_root_val = current_turn_data['Soil_Root_Pct']
    temperature_val = current_turn_data['LST_Day_C']
    # -----------------------------------------------

    # --- Implement Heat-Based Game Logic ---
    HEATWAVE_THRESHOLD = 38  # 38°C is a good threshold for a heatwave in Punjab
    
    precipitation_obj = {}
    special_event_obj = None

    if temperature_val > HEATWAVE_THRESHOLD:
        # If it's hot, there's no "rain" and a special event is triggered
        precipitation_obj = {"value": 0, "level": "Dry Conditions"}
        special_event_obj = {
            "eventName": "Heatwave",
            "description": f"It's {round(temperature_val)}°C! The heat is intense, increasing crop water needs."
        }
    else:
        # If it's not a heatwave, conditions are normal (no rain is the default)
        precipitation_obj = {"value": 0, "level": "Normal"}
        special_event_obj = None
    # ------------------------------------------

    # --- Create the Final JSON Response ---
    live_data = {
        "turnNumber": int(current_turn_data['Turn']),
        "date": current_turn_data['Start_Date'],
        "seasonData": {
            "soilMoisture": {"value": round(soil_root_val, 2)},
            "precipitation": precipitation_obj, # Use our new dynamic object
            "cropHealth": {"value": round(crop_health_val, 2)},
            "temperature": {"value": round(temperature_val, 1), "unit": "C"} # Added temperature to the response!
        },
        "specialEvent": special_event_obj # Use our new dynamic object
    }
    
    return jsonify(live_data)

if __name__ == '__main__':
    app.run(debug=True)