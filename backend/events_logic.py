import pandas as pd
import os

PROCESSED_DATA_PATH = 'processed_data.csv'

def check_for_events(turn_number):
   
    

    if not os.path.exists(PROCESSED_DATA_PATH):
        return {"type": "ERROR", "message": "Processed data not found. Run data_processor.py first!"}

    df = pd.read_csv(PROCESSED_DATA_PATH)
    

    current_data_row = df[df['Turn'] == turn_number]
    if current_data_row.empty:
     
        return {"type": "none", "message": None}
    data = current_data_row.iloc[0] 
    
    # --- 1. HEAT STRESS CHECK ---
    # Trigger if daytime LST exceeds 40°C 
    if data['LST_Day_C'] > 45.0:
        return {"type": "Heat_Severe", 
                "message": f"CRITICAL HEAT: Temp is {data['LST_Day_C']:.1f}°C. Water loss is extreme; crop health will decline quickly!"}
    elif data['LST_Day_C'] > 40.0:
        return {"type": "Heat_Warning", 
                "message": f"HEAT WARNING: Daytime temperature is {data['LST_Day_C']:.1f}°C. Crop water demand is critically high!"}


    # --- 2. DROUGHT CHECK 

    if data['Soil_Root_Pct'] < 15.0:
        return {"type": "Drought_Warning", 
                "message": f"DROUGHT WARNING: Root moisture is {data['Soil_Root_Pct']}%. Consider irrigating immediately to save the crop."}
    
    # --- 3. NORMAL STATE ---
    return {"type": "none", "message": "Conditions are stable. Check NDVI to optimize fertilization before the next turn."}
