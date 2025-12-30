# ISP Soccer Analytics Dashboard

A modern, production-ready soccer analytics dashboard built with React, Tailwind CSS, and Recharts. Visualize team performance, player statistics, and match events with interactive charts and heatmaps.

![Dashboard Preview](preview.png)

## Features

- **📊 Overview Dashboard**: KPI cards showing total shots, pass accuracy, duels won, and recoveries with trend charts
- **⚽ Team Analysis**: Shot map with coordinates, pressure zones heatmap (3x3 grid), and pass distribution
- **👤 Player Analysis**: Player selector grid, individual player KPIs, radar charts comparing player vs team average, activity heatmaps
- **📄 Reports**: Export to PDF, PNG, and CSV formats

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom dark theme
- **Charts**: Recharts for all visualizations
- **Backend**: Node.js + Express
- **Icons**: Lucide React
- **Export**: jsPDF + html2canvas

## Prerequisites

- Node.js 18+ and npm
- Your CSV data files (player_stats.csv, team_stats.csv, events_clean.csv)

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Add Your Data

Place your CSV files in the `server/data/` directory:
- `player_stats.csv`
- `team_stats.csv`
- `events_clean.csv`
- `match_summary.json`

### 3. Start the Application

```bash
# Start both frontend and backend (recommended)
npm start

# Or start separately:
# Terminal 1: Start the API server
npm run server

# Terminal 2: Start the React dev server
npm run dev
```

### 4. Open in Browser

Navigate to [http://localhost:5173](http://localhost:5173)

## Project Structure

```
isp-soccer-dashboard/
├── public/                 # Static assets
├── server/
│   ├── data/              # CSV data files
│   ├── index.js           # Express API server
│   └── package.json       # Server dependencies
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ActivityHeatmap.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── KPICard.jsx
│   │   ├── Layout.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── PlayerCard.jsx
│   │   ├── PlayerRadar.jsx
│   │   ├── PressureZones.jsx
│   │   ├── ShotMap.jsx
│   │   └── TrendChart.jsx
│   ├── hooks/
│   │   └── useFetchData.js  # Custom data fetching hooks
│   ├── pages/
│   │   ├── Overview.jsx
│   │   ├── TeamAnalysis.jsx
│   │   ├── PlayerAnalysis.jsx
│   │   └── Reports.jsx
│   ├── utils/
│   │   ├── calculations.js  # Statistical calculations
│   │   ├── coordinates.js   # Field/zone utilities
│   │   └── export.js        # PDF/CSV/PNG export
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## API Endpoints

The Express server provides the following endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/players` | All player statistics |
| `GET /api/players/:name` | Single player stats |
| `GET /api/players/:name/heatmap` | Player heatmap data |
| `GET /api/teams` | Team statistics |
| `GET /api/events` | All match events |
| `GET /api/events/shots` | Shot events only |
| `GET /api/events/defensive` | Defensive events |
| `GET /api/zones/pressure` | Pressure zone counts |
| `GET /api/zones/activity` | Zone activity counts |
| `GET /api/stats/overview` | Aggregated overview stats |
| `GET /api/stats/timeline` | Timeline/trend data |
| `GET /api/matches` | Match summary |

Query parameters:
- `matchId`: Filter by match ID
- `team`: Filter by team name
- `player`: Filter by player name
- `eventType`: Filter by event type
- `eventCategory`: Filter by event category

## Data Format

### player_stats.csv

```csv
match_id,player,team,position,passes_attempted,passes_successful,crosses_attempted,crosses_successful,shots_attempted,shots_on_target,duels_attempted,duels_won,recoveries,defensive_actions,gk_actions,total_touches,pass_accuracy,duel_success_rate,shot_accuracy
```

### events_clean.csv

```csv
date,match_id,team,player,minute,second,event_type,outcome,x,y,cell,notes,zone_third,lane,zone_3x3,timestamp,is_successful,event_category,distance_traveled
```

### team_stats.csv

```csv
match_id,team,total_shots,shots_on_target,total_passes,passes_successful,crosses_attempted,crosses_successful,defensive_duels_won,aerial_duels_won,total_recoveries,players_involved,conversion_rate,pass_accuracy
```

## Customization

### Changing Colors

Edit `tailwind.config.js` to modify the color scheme:

```js
theme: {
  extend: {
    colors: {
      dark: { ... },
      accent: {
        green: '#10b981',
        blue: '#3b82f6',
        // Add your colors
      }
    }
  }
}
```

### Adding New Visualizations

1. Create a new component in `src/components/`
2. Import and use Recharts components
3. Create a custom hook in `src/hooks/useFetchData.js` if needed
4. Add to the appropriate page

### Modifying Zone Grid

The 3x3 zone grid is defined in `src/utils/coordinates.js`. Modify `ZONES_3X3` to change zone definitions.

## Production Build

```bash
# Build the React app
npm run build

# The built files will be in the 'dist' directory
# Serve with any static file server or deploy to Vercel/Netlify
```

## Deployment Notes

1. **API Server**: Deploy the Express server to a Node.js hosting service (Railway, Render, Heroku)
2. **Frontend**: Deploy the built React app to any static hosting (Vercel, Netlify, GitHub Pages)
3. Update the API URL in `src/hooks/useFetchData.js` to point to your production server

## Troubleshooting

### "Failed to fetch data"
- Ensure the API server is running on port 3001
- Check that CSV files are in `server/data/`
- Verify file permissions

### Charts not rendering
- Check browser console for errors
- Ensure data format matches expected structure

### Export not working
- PDF/PNG export requires the element to be visible
- Large exports may take a few seconds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this for your team's analytics needs!

## Credits

Built for ISP Soccer Analytics by the development team.
Powered by React, Recharts, and Tailwind CSS.
