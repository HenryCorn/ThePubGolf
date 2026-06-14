import pandas as pd
import folium
from folium.plugins import HeatMap
import os

# Define file paths
INPUT_FILE = '/Users/quique/repo/NYC_trip/Optimized_NewYork2026_Itinerary.csv'
OUTPUT_DIR = '/Users/quique/repo/NYC_trip/optimized'
OUTPUT_BASE = os.path.join(OUTPUT_DIR, 'nyc_trip_heatmap')

def generate_heatmap():
    if not os.path.exists(OUTPUT_DIR):
        print(f"Creating directory: {OUTPUT_DIR}")
        os.makedirs(OUTPUT_DIR)

    print(f"Loading data from {INPUT_FILE}...")
    try:
        df = pd.read_csv(INPUT_FILE)
    except FileNotFoundError:
        print(f"Error: File not found at {INPUT_FILE}")
        return

    # Clean data: Ensure Latitude and Longitude are numeric
    print("Cleaning data...")
    df['Latitude'] = pd.to_numeric(df['Latitude'], errors='coerce')
    df['Longitude'] = pd.to_numeric(df['Longitude'], errors='coerce')
    
    # Forward fill the Date column (just in case)
    df['Date'] = df['Date'].ffill()

    # Filter out rows where coordinates are NaN
    df_clean = df.dropna(subset=['Latitude', 'Longitude'])
    
    if df_clean.empty:
        print("Error: No valid coordinates found in the dataset.")
        return

    print(f"Found {len(df_clean)} valid locations.")

    # Function to create and save a map
    def create_and_save_map(data, filename_suffix=""):
        if data.empty:
            print(f"No data for {filename_suffix}, skipping.")
            return

        center_lat = data['Latitude'].mean()
        center_lon = data['Longitude'].mean()

        m = folium.Map(location=[center_lat, center_lon], zoom_start=13, tiles='CartoDB positron')
        heat_data = data[['Latitude', 'Longitude']].values.tolist()
        HeatMap(heat_data, radius=15, blur=10).add_to(m)

        output_file = f"{OUTPUT_BASE}{filename_suffix}.html"
        print(f"Saving heatmap to {output_file}...")
        m.save(output_file)

    # Generate overall heatmap
    create_and_save_map(df_clean)

    # Generate per-day heatmaps
    unique_dates = df_clean['Date'].unique()
    print(f"Found dates: {unique_dates}")

    for date in unique_dates:
        # Sanitize date for filename (replace / with -)
        safe_date = date.replace('/', '-')
        day_data = df_clean[df_clean['Date'] == date]
        create_and_save_map(day_data, f"_{safe_date}")

    print("Done!")

    # Generate color-coded heatmap per day
    print("Generating color-coded heatmap per day...")
    # Generate color-coded heatmap per day
    print("Generating color-coded heatmap per day...")
    m_colored = folium.Map(location=df_clean[['Latitude', 'Longitude']].mean().values, zoom_start=13, tiles='CartoDB positron')
    
    # Pastel/Joyful Hex Colors
    # Red, Orange, Gold (Yellow is too light), Green, Blue, Purple, Pink
    pastel_colors = ['#FF6961', '#FFB347', '#FFD700', '#77DD77', '#AEC6CF', '#B39EB5', '#FFB7B2']
    
    # Create Legend HTML
    legend_html = '''
     <div style="position: fixed; 
     bottom: 50px; left: 50px; width: 180px; height: auto; 
     border:2px solid grey; z-index:9999; font-size:14px;
     background-color:white; opacity: 0.85; padding: 10px; border-radius: 5px;">
     <b>Day Legend</b><br>
     '''
    
    for i, date in enumerate(unique_dates):
        day_data = df_clean[df_clean['Date'] == date]
        if day_data.empty:
            continue
            
        heat_data = day_data[['Latitude', 'Longitude']].values.tolist()
        
        # Cycle through colors
        color = pastel_colors[i % len(pastel_colors)]
        
        # Monochromatic gradient for distinctness
        gradient = {0.4: color, 0.7: color, 1: color}
        
        HeatMap(
            heat_data, 
            radius=15, 
            blur=10, 
            gradient=gradient,
            name=f"{date}"
        ).add_to(m_colored)
        
        # Add to Legend
        legend_html += f'&nbsp;<i style="background:{color};width:12px;height:12px;display:inline-block;border-radius:2px;"></i>&nbsp;{date}<br>'

    legend_html += '</div>'
    m_colored.get_root().html.add_child(folium.Element(legend_html))

    folium.LayerControl().add_to(m_colored)
    
    output_colored = os.path.join(OUTPUT_DIR, 'nyc_trip_heatmap_colored_by_day.html')
    print(f"Saving color-coded heatmap to {output_colored}...")
    m_colored.save(output_colored)
    print("Done!")

if __name__ == "__main__":
    generate_heatmap()
