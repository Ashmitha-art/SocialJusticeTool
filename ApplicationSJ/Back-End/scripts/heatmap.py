import matplotlib.pyplot as plt
import numpy as np

# Example weather data: 12 cities with their average temperature for each month
# Data format: [city_name, [temp_jan, temp_feb, ..., temp_dec]]
weather_data = [
    ['New York', [1, 3, 8, 14, 19, 24, 27, 26, 21, 15, 9, 3]],
    ['Los Angeles', [15, 16, 17, 18, 20, 22, 25, 25, 23, 20, 17, 15]],
    ['Chicago', [-3, -1, 4, 10, 16, 22, 26, 25, 20, 13, 6, -1]],
    ['Houston', [12, 14, 17, 21, 26, 29, 31, 31, 28, 23, 17, 13]],
    ['Phoenix', [14, 16, 19, 22, 27, 32, 36, 35, 30, 23, 17, 14]],
    ['San Francisco', [10, 11, 12, 14, 16, 18, 19, 19, 18, 15, 12, 11]],
    ['Seattle', [5, 6, 9, 12, 16, 20, 23, 23, 19, 14, 9, 6]],
    ['Miami', [21, 22, 23, 25, 27, 28, 29, 29, 28, 26, 24, 22]],
    ['Boston', [-1, 0, 5, 10, 16, 22, 26, 25, 20, 13, 7, 1]],
    ['Dallas', [8, 10, 15, 20, 25, 29, 32, 32, 28, 23, 17, 11]],
    ['Atlanta', [6, 8, 12, 18, 22, 26, 29, 28, 23, 17, 12, 7]],
    ['Denver', [1, 3, 9, 15, 21, 26, 30, 29, 24, 17, 10, 4]],
]

# Convert weather data to a 2D numpy array for plotting
temps = np.array([city[1] for city in weather_data])

# Create the heatmap using matplotlib
plt.figure(figsize=(14, 6))

# Plotting the heatmap
plt.imshow(temps, cmap='coolwarm', aspect='auto', interpolation='nearest')

# Adding labels and title
plt.title('Weather Heatmap of 12 U.S. Cities for 12 Months')
plt.xlabel('Month')
plt.ylabel('City')
plt.xticks(np.arange(12), ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
plt.yticks(np.arange(12), [city[0] for city in weather_data])

# Displaying the color bar
plt.colorbar(label='Temperature (°C)')

# Save the heatmap as a PNG image file
plt.tight_layout()
plt.savefig('weather_heatmap.png', dpi=300)  # Save the heatmap with high resolution

# Optionally, display the heatmap
plt.show()
