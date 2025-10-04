import pandas as pd
import numpy as np

INPUT_FILES = {
    'NDVI': 'raw_nasa_data/raw_ndvi.csv',  
    'LST': 'raw_nasa_data/raw_lst.csv',   
    'SMAP': 'raw_nasa_data/raw_smap.csv', 
}
COL_NAMES = {
    'NDVI': 'MOD13Q1_061__250m_16_days_NDVI',
    'LST_K': 'MYD11A1_061_LST_Day_1km',
    'SMAP_ROOT': 'SPL4SMGP_008_Geophysical_Data_sm_rootzone',
    'SMAP_SURF': 'SPL4SMGP_008_Geophysical_Data_sm_surface',
}



def process_data():
    """
    Reads all three NASA time-series files, aligns them all to the 16-day 'Turn' cadence,
    converts units, and outputs the final CSV for the API (B1).
    """
    print("Starting data processing for CropPilot...")

    # Load and Prepare NDVI
    df_ndvi = pd.read_csv(INPUT_FILES['NDVI'], parse_dates=['Date'])
    
    
    first_ndvi_date = df_ndvi['Date'].min()

    df_ndvi = df_ndvi[['Date', COL_NAMES['NDVI']]].set_index('Date')
    df_ndvi.columns = ['NDVI']

    df_smap = pd.read_csv(INPUT_FILES['SMAP'], parse_dates=['Date'], index_col='Date')

    df_smap.index = df_smap.index.tz_localize(None) 
    
    df_smap_daily = df_smap[[COL_NAMES['SMAP_ROOT'], COL_NAMES['SMAP_SURF']]].resample('D').mean()

    df_lst = pd.read_csv(INPUT_FILES['LST'], parse_dates=['Date'], index_col='Date')
    
    df_lst_k = df_lst[COL_NAMES['LST_K']]


    df_lst_c = np.where(df_lst_k > 273.15, df_lst_k - 273.15, np.nan)
    df_lst_c = pd.DataFrame(df_lst_c, index=df_lst.index, columns=['LST_Day_C'])
    df_lst_c_daily = df_lst_c.resample('D').mean()



    df_smap_16day = df_smap_daily.resample('16D', origin=first_ndvi_date).mean()
    df_lst_16day = df_lst_c_daily.resample('16D', origin=first_ndvi_date).mean()
    

    
    df_final = df_ndvi.copy()
    

    df_final = df_final.merge(df_smap_16day, left_index=True, right_index=True, how='left')
    df_final = df_final.merge(df_lst_16day, left_index=True, right_index=True, how='left')
  
    df_final = df_final.dropna(subset=['NDVI', COL_NAMES['SMAP_ROOT'], 'LST_Day_C']).reset_index().rename(columns={'Date': 'Start_Date'})

    df_final['Soil_Root_Pct'] = (df_final[COL_NAMES['SMAP_ROOT']] * 100).round(1)
    df_final['Soil_Surface_Pct'] = (df_final[COL_NAMES['SMAP_SURF']] * 100).round(1)


    df_final['Turn'] = range(1, len(df_final) + 1)
    

    df_output = df_final[['Turn', 'Start_Date', 'NDVI', 'Soil_Root_Pct', 'Soil_Surface_Pct', 'LST_Day_C']]
    

    output_filename = 'processed_data.csv'
    df_output.to_csv(output_filename, index=False)
    
    print(f"\n SUCCESS: '{output_filename}' created  with {len(df_output)} game turns.")

if __name__ == '__main__':

    import os
    for file_path in INPUT_FILES.values():
        if not os.path.exists(file_path):
            print(f"FATAL ERROR: Input file not found: {file_path}")
            exit()
            
    process_data()