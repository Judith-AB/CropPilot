import pandas as pd
import numpy as np
import os

REGIONS_TO_PROCESS = {
    'Punjab': 1,
    'Iowa': 2,
    'Sahel': 3,
    'Netherlands': 4,
    'Brazil': 5,
}

INPUT_FILE_PATHS = {
   
    'Punjab': {
        'NDVI': 'raw_nasa_data/raw_ndvi_punjab.csv',
        'LST': 'raw_nasa_data/raw_lst_punjab.csv',
        'SMAP': 'raw_nasa_data/raw_smap_punjab.csv',
    },

    'Multi': {
        'NDVI': 'raw_nasa_data/raw_ndvi_multi.csv',
        'LST': 'raw_nasa_data/raw_lst_multi.csv',
        'SMAP': 'raw_nasa_data/raw_smap_multi.csv',
    }
}

COL_NAMES = {
    'NDVI': 'MOD13Q1_061__250m_16_days_NDVI',
    'LST_K': 'MYD11A1_061_LST_Day_1km',
    'SMAP_ROOT': 'SPL4SMGP_008_Geophysical_Data_sm_rootzone',
    'SMAP_SURF': 'SPL4SMGP_008_Geophysical_Data_sm_surface',
    'ID': 'ID'
}
try:
    df_multi_ndvi = pd.read_csv(INPUT_FILE_PATHS['Multi']['NDVI'], parse_dates=['Date'])
    df_multi_lst = pd.read_csv(INPUT_FILE_PATHS['Multi']['LST'], parse_dates=['Date'])
    df_multi_smap = pd.read_csv(INPUT_FILE_PATHS['Multi']['SMAP'], parse_dates=['Date'])

    df_multi_smap.set_index('Date', inplace=True)
    df_multi_smap.index = df_multi_smap.index.tz_localize(None)
    df_multi_smap.reset_index(inplace=True)
    
except FileNotFoundError:
    print("WARNING: Multi-region files not found. Only processing Punjab data.")
    df_multi_ndvi, df_multi_lst, df_multi_smap = None, None, None
except Exception as e:
    print(f"Error loading multi-region data: {e}")
    df_multi_ndvi, df_multi_lst, df_multi_smap = None, None, None



def process_single_region(region_name, region_id):
    """Processes, cleans, and aligns data for a single region (ID) into a final CSV."""
    print(f"-> Processing data for region: {region_name} (ID: {region_id})")

    # Determine which files to load based on region ID
    if region_name == 'Punjab':
        # Load single-region files for Punjab
        files_to_load = INPUT_FILE_PATHS['Punjab']
    else:
        # Load from the multi-region dataframes
        if df_multi_ndvi is None:
            return None # Cannot process if multi-region data failed to load
        
     
        df_ndvi_raw = df_multi_ndvi[df_multi_ndvi[COL_NAMES['ID']] == region_id].copy()
        df_lst_raw = df_multi_lst[df_multi_lst[COL_NAMES['ID']] == region_id].copy()
        df_smap_raw = df_multi_smap[df_multi_smap[COL_NAMES['ID']] == region_id].copy()

        files_to_load = {'NDVI': df_ndvi_raw, 'LST': df_lst_raw, 'SMAP': df_smap_raw}
        
    # --- Load DataFrames ---
    if region_name == 'Punjab':
        df_ndvi = pd.read_csv(files_to_load['NDVI'], parse_dates=['Date'])
        df_lst = pd.read_csv(files_to_load['LST'], parse_dates=['Date'])
        df_smap = pd.read_csv(files_to_load['SMAP'], parse_dates=['Date'])
    else:
        df_ndvi = files_to_load['NDVI']
        df_lst = files_to_load['LST']
        df_smap = files_to_load['SMAP']
        

    # --- 1. Master Timeline and Anchor Date ---
    if df_ndvi.empty:
        print(f"   Skipping {region_name}: No NDVI data found.")
        return None
        

    first_ndvi_date = df_ndvi['Date'].min()

    df_ndvi = df_ndvi[['Date', COL_NAMES['NDVI']]].set_index('Date')
    df_ndvi.columns = ['NDVI']

    # --- 2. SMAP 
    df_smap.set_index('Date', inplace=True)
    if region_name == 'Punjab':

        df_smap.index = df_smap.index.tz_localize(None)
        
    df_smap_daily = df_smap[[COL_NAMES['SMAP_ROOT'], COL_NAMES['SMAP_SURF']]].resample('D').mean()
    df_smap_16day = df_smap_daily.resample('16D', origin=first_ndvi_date).mean()

    # --- 3. LST 
    df_lst.set_index('Date', inplace=True)
    
    # Select LST column (Kelvin)
    df_lst_k = df_lst[COL_NAMES['LST_K']]

    # Convert LST to Celsius
    df_lst_c = np.where(df_lst_k > 273.15, df_lst_k - 273.15, np.nan)
    df_lst_c = pd.DataFrame(df_lst_c, index=df_lst.index, columns=['LST_Day_C'])
    df_lst_16day = df_lst_c.resample('16D', origin=first_ndvi_date).mean()
    df_final = df_ndvi.copy()
    
    df_final = df_final.merge(df_smap_16day, left_index=True, right_index=True, how='left')
    df_final = df_final.merge(df_lst_16day, left_index=True, right_index=True, how='left')
    df_final = df_final.dropna(subset=['NDVI']).reset_index().rename(columns={'Date': 'Start_Date'})

    df_final['Soil_Root_Pct'] = (df_final[COL_NAMES['SMAP_ROOT']] * 100).round(1)
    df_final['Soil_Surface_Pct'] = (df_final[COL_NAMES['SMAP_SURF']] * 100).round(1)

    df_final['Turn'] = range(1, len(df_final) + 1)
    df_final['Region'] = region_name
    df_output = df_final[['Turn', 'Region', 'Start_Date', 'NDVI', 'Soil_Root_Pct', 'Soil_Surface_Pct', 'LST_Day_C']]
    

    output_filename = f'processed_data_{region_name.lower()}.csv'
    df_output.to_csv(output_filename, index=False)
    
    print(f"->  SUCCESS: '{output_filename}' created with {len(df_output)} turns.")
    return df_output


def run_multi_region_processing():
    """Runs the processor for all five regions."""
  
    print("--- Starting Multi-Region Data Processor ---")
    
    for region, region_id in REGIONS_TO_PROCESS.items():
        process_single_region(region, region_id)
    
    print("\n ALL REGIONS PROCESSED. Deliverables created: processed_data_[region].csv")
    print("Next step is updating B1's app.py to load all these files.")


if __name__ == '__main__':

    for file_type, path in INPUT_FILE_PATHS['Punjab'].items():
        if not os.path.exists(path):
            print(f"FATAL ERROR: Base file not found: {path}")
            print("Please ensure the Punjab files are renamed (e.g., 'raw_ndvi_punjab.csv') and placed correctly.")
            exit()
            
    run_multi_region_processing()
