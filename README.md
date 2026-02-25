# 🌍 World Map Geography Game

An interactive geography game built with Deno.js and Leaflet.js where players race against time to identify all countries in the world!

## Screenshot

![Game Screenshot](images/screenshot.png)

## Features

- 🗺️ **Interactive World Map** - Full-screen Leaflet.js map with all countries
- ⏱️ **Customizable Timer** - Default 20 minutes, adjustable from 1-120 minutes
- 🔍 **Smart Search** - Autocomplete suggestions as you type
- ✨ **Visual Feedback** - Countries highlight and zoom when found
- 📊 **Progress Tracking** - Real-time counter and sidebar list of found countries
- 🎮 **Game Controls** - Start, pause, and reset functionality
- 🏆 **End Game Stats** - Final score and percentage completion

## Prerequisites

- [Deno](https://deno.land/) installed on your system (v1.37 or higher recommended)

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd map-game
   ```

## Running the Game

Start the server with Deno:

```bash
deno task start
```

Or use the full command:

```bash
deno run --allow-net --allow-read server.ts
```

The game will be available at: **http://localhost:8000/**

## How to Play

1. **Set Your Timer** (Optional)
   - Default is 20 minutes
   - Enter a custom time (1-120 minutes) and click "Set"

2. **Start the Game**
   - Click the "Start Game" button
   - The timer begins counting down
   - The search bar becomes active

3. **Find Countries**
   - Type country names in the search bar
   - Use autocomplete suggestions for help
   - Press Enter or click a suggestion to submit
   - Correct countries will highlight in green and zoom into view

4. **Track Progress**
   - View your score at the top (e.g., "45/195 countries found")
   - See all found countries listed in the right sidebar
   - Timer changes color as time runs low (yellow at 5 min, red at 1 min)

5. **Game Controls**
   - **Pause**: Pause the timer and disable search
   - **Reset**: Start over with a fresh game

6. **Game End**
   - Game ends when timer reaches zero or all countries are found
   - View your final statistics
   - Click "Play Again" to restart

## Project Structure

```
map-game/
├── deno.json           # Deno configuration and tasks
├── server.ts           # Deno HTTP server
├── README.md           # This file
└── public/
    ├── index.html      # Main game page
    ├── styles.css      # Game styling
    ├── game.js         # Game logic and functionality
    └── data/           # (Reserved for local data files)
```

## Technologies Used

- **Deno** - Modern JavaScript/TypeScript runtime
- **Leaflet.js** - Interactive map library
- **GeoJSON** - Country boundary data from [datasets/geo-countries](https://github.com/datasets/geo-countries)
- **CARTO Dark Theme** - Map tile layer

## Tips for Players

- Start with larger, well-known countries
- Use the autocomplete feature to discover country names
- Pay attention to regions - finding one country can help you remember nearby ones
- The map zooms to each found country, helping you learn geography
- Try different time limits to challenge yourself

## Customization

### Change Default Timer
Edit `game.js` line 7:
```javascript
timeRemaining: 1200, // Change this value (in seconds)
```

### Change Map Theme
Edit `game.js` lines 52-57 to use a different tile layer:
```javascript
L.tileLayer('YOUR_TILE_LAYER_URL', {
    // Your configuration
}).addTo(mainState.map);
```

### Adjust Map Starting Position
Edit `game.js` line 50:
```javascript
.setView([20, 0], 2); // [latitude, longitude], zoom level
```

## Troubleshooting

**Map not loading?**
- Check your internet connection (map tiles load from external source)
- Ensure port 8000 is not in use by another application

**Countries not appearing?**
- The GeoJSON data loads from GitHub - ensure you have internet access
- Check browser console for any error messages

**Timer not working?**
- Ensure JavaScript is enabled in your browser
- Try refreshing the page

## License

This project is open source and available for educational purposes.

## Credits

- Country boundary data: [datasets/geo-countries](https://github.com/datasets/geo-countries)
- Map tiles: [CARTO](https://carto.com/)
- Map library: [Leaflet.js](https://leafletjs.com/)

---

Enjoy learning world geography! 🌎🌍🌏