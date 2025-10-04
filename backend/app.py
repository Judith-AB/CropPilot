# --- Imports ---
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from events_logic import check_for_events

# --- Data Loading ---
try:
    csv_filename = 'processed_data.csv'
    game_data_df = pd.read_csv(csv_filename)
    game_data_df.fillna(method='ffill', inplace=True)
    print("✅ B2's final processed data loaded successfully.")
except FileNotFoundError:
    print(f"❌ Error: Data file '{csv_filename}' not found.")
    game_data_df = None

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)

# --- Main API Endpoint ---
@app.route('/api/gamestate')
def get_gamestate():
    try:
        # --- FIX 1: Default turn is now 1, matching our data file ---
        turn_number = int(request.args.get('turn', 1))
    except ValueError:
        return jsonify({"error": "Invalid turn number"}), 400

    event_data = check_for_events(turn_number)
    if event_data.get("type") == "ERROR":
        return jsonify({"error": event_data["message"]}), 500

    if game_data_df is None:
        return jsonify({"error": "Data not loaded"}), 500

    current_turn_data_row = game_data_df[game_data_df['Turn'] == turn_number]
    if current_turn_data_row.empty:
        return jsonify({"error": f"Turn {turn_number} not found in data file"}), 404
    current_turn_data = current_turn_data_row.iloc[0]

    crop_health_val = current_turn_data['NDVI']
    soil_root_val = current_turn_data['Soil_Root_Pct']
    temperature_val = current_turn_data['LST_Day_C']
    
    special_event_obj = None
    if event_data.get("type") != "none":
        special_event_obj = {
            "eventName": event_data["type"],
            "description": event_data["message"]
        }
    
    live_data = {
        "turnNumber": int(current_turn_data['Turn']),
        "date": current_turn_data['Start_Date'],
        "seasonData": {
            "soilMoisture": {"value": round(soil_root_val, 2)},
            # --- FIX 2: Removed misleading hardcoded precipitation data ---
            "cropHealth": {"value": round(crop_health_val, 2)},
            "temperature": {"value": round(temperature_val, 1), "unit": "C"}
        },
        "specialEvent": special_event_obj
    }
    
    return jsonify(live_data)

# --- Run the Server ---
if __name__ == '__main__':
    app.run(debug=True)