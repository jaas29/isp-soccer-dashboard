import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for React frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Data directory - adjust path based on where CSV files are located
const DATA_DIR = path.join(__dirname, 'data');

// Helper function to parse CSV files
const parseCSV = (filepath) => {
  try {
    const fileContent = fs.readFileSync(filepath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      cast: (value, context) => {
        // Try to parse numbers
        if (context.header) return value;
        if (value === '') return null;
        const num = Number(value);
        return isNaN(num) ? value : num;
      }
    });
    return records;
  } catch (error) {
    console.error(`Error reading file ${filepath}:`, error.message);
    return null;
  }
};

// Helper function to parse JSON files
const parseJSON = (filepath) => {
  try {
    const fileContent = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading JSON file ${filepath}:`, error.message);
    return null;
  }
};

// Cache data in memory for faster access
let dataCache = {
  playerStats: null,
  teamStats: null,
  events: null,
  matchSummary: null,
  lastLoaded: null
};

// Load all data into cache
const loadData = () => {
  console.log('Loading data from files...');
  
  dataCache.playerStats = parseCSV(path.join(DATA_DIR, 'player_stats.csv')) || [];
  dataCache.teamStats = parseCSV(path.join(DATA_DIR, 'team_stats.csv')) || [];
  dataCache.events = parseCSV(path.join(DATA_DIR, 'events_clean.csv')) || [];
  dataCache.matchSummary = parseJSON(path.join(DATA_DIR, 'match_summary.json')) || {};
  dataCache.lastLoaded = new Date();
  
  console.log(`Loaded: ${dataCache.playerStats.length} players, ${dataCache.teamStats.length} teams, ${dataCache.events.length} events`);
};

// Initialize data on server start
loadData();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    dataLoaded: !!dataCache.lastLoaded,
    lastLoaded: dataCache.lastLoaded 
  });
});

// Reload data (useful for development)
app.post('/api/reload', (req, res) => {
  loadData();
  res.json({ success: true, message: 'Data reloaded', lastLoaded: dataCache.lastLoaded });
});

// Get all player stats
app.get('/api/players', (req, res) => {
  try {
    const { matchId, team } = req.query;
    let data = [...dataCache.playerStats];
    
    if (matchId) {
      data = data.filter(p => p.match_id === parseInt(matchId));
    }
    if (team) {
      data = data.filter(p => p.team === team);
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single player stats
app.get('/api/players/:playerName', (req, res) => {
  try {
    const { playerName } = req.params;
    const { matchId } = req.query;
    
    let data = dataCache.playerStats.filter(
      p => p.player.toLowerCase() === playerName.toLowerCase()
    );
    
    if (matchId) {
      data = data.filter(p => p.match_id === parseInt(matchId));
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team stats
app.get('/api/teams', (req, res) => {
  try {
    const { matchId } = req.query;
    let data = [...dataCache.teamStats];
    
    if (matchId) {
      data = data.filter(t => t.match_id === parseInt(matchId));
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events
app.get('/api/events', (req, res) => {
  try {
    const { matchId, team, player, eventType, eventCategory, zone } = req.query;
    let data = [...dataCache.events];
    
    if (matchId) {
      data = data.filter(e => e.match_id === parseInt(matchId));
    }
    if (team) {
      data = data.filter(e => e.team === team);
    }
    if (player) {
      data = data.filter(e => e.player.toLowerCase() === player.toLowerCase());
    }
    if (eventType) {
      data = data.filter(e => e.event_type === eventType);
    }
    if (eventCategory) {
      data = data.filter(e => e.event_category === eventCategory);
    }
    if (zone) {
      data = data.filter(e => e.zone_3x3 === zone);
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get events by type (for specific visualizations)
app.get('/api/events/shots', (req, res) => {
  try {
    const { matchId } = req.query;
    let data = dataCache.events.filter(e => e.event_type === 'Shot');
    
    if (matchId) {
      data = data.filter(e => e.match_id === parseInt(matchId));
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/passes', (req, res) => {
  try {
    const { matchId } = req.query;
    let data = dataCache.events.filter(e => 
      e.event_category === 'Pass' || 
      e.event_type === 'Pass' || 
      e.event_type === 'Long Pass'
    );
    
    if (matchId) {
      data = data.filter(e => e.match_id === parseInt(matchId));
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/defensive', (req, res) => {
  try {
    const { matchId } = req.query;
    let data = dataCache.events.filter(e => 
      e.event_category === 'Duel' ||
      e.event_type === 'Recovery' ||
      e.event_type === 'Clearance' ||
      e.event_type === 'Defensive Duel'
    );
    
    if (matchId) {
      data = data.filter(e => e.match_id === parseInt(matchId));
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get zone aggregations
app.get('/api/zones/pressure', (req, res) => {
  try {
    const { matchId } = req.query;
    let data = [...dataCache.events];
    
    if (matchId) {
      data = data.filter(e => e.match_id === parseInt(matchId));
    }
    
    // Filter defensive actions
    const defensiveEvents = data.filter(e => 
      e.event_category === 'Duel' ||
      e.event_type === 'Recovery' ||
      e.event_category === 'Recovery' ||
      e.event_type === 'Defensive Duel'
    );
    
    // Count by zone
    const zoneCounts = {};
    const zones = ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'];
    
    zones.forEach(zone => {
      zoneCounts[zone] = defensiveEvents.filter(e => e.zone_3x3 === zone).length;
    });
    
    res.json(zoneCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get zone activity for any event category
app.get('/api/zones/activity', (req, res) => {
  try {
    const { matchId, eventCategory, player } = req.query;
    let data = [...dataCache.events];
    
    if (matchId) {
      data = data.filter(e => e.match_id === parseInt(matchId));
    }
    if (eventCategory) {
      data = data.filter(e => e.event_category === eventCategory);
    }
    if (player) {
      data = data.filter(e => e.player.toLowerCase() === player.toLowerCase());
    }
    
    // Count by zone
    const zoneCounts = {};
    const zones = ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'];
    
    zones.forEach(zone => {
      zoneCounts[zone] = data.filter(e => e.zone_3x3 === zone).length;
    });
    
    res.json(zoneCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get match summary
app.get('/api/matches', (req, res) => {
  try {
    res.json(dataCache.matchSummary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get match by ID
app.get('/api/matches/:matchId', (req, res) => {
  try {
    const { matchId } = req.params;
    
    if (dataCache.matchSummary.match_id === parseInt(matchId)) {
      res.json(dataCache.matchSummary);
    } else {
      res.status(404).json({ error: 'Match not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get aggregated statistics
app.get('/api/stats/overview', (req, res) => {
  try {
    const { matchId } = req.query;
    let events = [...dataCache.events];
    let teamStats = [...dataCache.teamStats];
    
    if (matchId) {
      events = events.filter(e => e.match_id === parseInt(matchId));
      teamStats = teamStats.filter(t => t.match_id === parseInt(matchId));
    }
    
    const team = teamStats[0] || {};
    
    // Calculate additional stats from events
    const shots = events.filter(e => e.event_type === 'Shot');
    const passes = events.filter(e => e.event_category === 'Pass');
    const successfulPasses = passes.filter(e => e.is_successful);
    const progressivePasses = events.filter(e => e.outcome === 'Progressive Pass');
    const duels = events.filter(e => e.event_category === 'Duel');
    const duelsWon = duels.filter(e => e.is_successful);
    const recoveries = events.filter(e => e.event_type === 'Recovery');
    
    const overview = {
      totalShots: shots.length,
      shotsOnTarget: shots.filter(s => s.outcome === 'On Target').length,
      totalPasses: passes.length,
      successfulPasses: successfulPasses.length,
      passAccuracy: passes.length > 0 
        ? ((successfulPasses.length / passes.length) * 100).toFixed(1) 
        : 0,
      progressivePasses: progressivePasses.length,
      totalDuels: duels.length,
      duelsWon: duelsWon.length,
      duelSuccessRate: duels.length > 0 
        ? ((duelsWon.length / duels.length) * 100).toFixed(1) 
        : 0,
      recoveries: recoveries.length,
      totalEvents: events.length,
      ...team
    };
    
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get timeline data for trend charts
app.get('/api/stats/timeline', (req, res) => {
  try {
    const { matchId, interval = 5 } = req.query;
    let events = [...dataCache.events];
    
    if (matchId) {
      events = events.filter(e => e.match_id === parseInt(matchId));
    }
    
    // Group events by time intervals
    const maxMinute = Math.max(...events.map(e => e.minute || 0));
    const intervals = [];
    
    for (let i = 0; i <= maxMinute; i += parseInt(interval)) {
      const intervalEvents = events.filter(e => 
        e.minute >= i && e.minute < i + parseInt(interval)
      );
      
      const passes = intervalEvents.filter(e => e.event_category === 'Pass');
      const successfulPasses = passes.filter(e => e.is_successful);
      const duels = intervalEvents.filter(e => e.event_category === 'Duel');
      const duelsWon = duels.filter(e => e.is_successful);
      
      intervals.push({
        minute: `${i}-${i + parseInt(interval)}`,
        events: intervalEvents.length,
        passes: passes.length,
        passAccuracy: passes.length > 0 
          ? Math.round((successfulPasses.length / passes.length) * 100) 
          : 0,
        duels: duels.length,
        duelsWon: duelsWon.length,
        shots: intervalEvents.filter(e => e.event_type === 'Shot').length,
        recoveries: intervalEvents.filter(e => e.event_type === 'Recovery').length
      });
    }
    
    res.json(intervals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player activity heatmap data
app.get('/api/players/:playerName/heatmap', (req, res) => {
  try {
    const { playerName } = req.params;
    const { matchId } = req.query;
    
    let events = dataCache.events.filter(
      e => e.player.toLowerCase() === playerName.toLowerCase()
    );
    
    if (matchId) {
      events = events.filter(e => e.match_id === parseInt(matchId));
    }
    
    // Create grid for heatmap (10x10 for finer resolution)
    const gridSize = 10;
    const grid = [];
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const xMin = x * 10;
        const xMax = (x + 1) * 10;
        const yMin = y * 10;
        const yMax = (y + 1) * 10;
        
        const count = events.filter(e => 
          e.x >= xMin && e.x < xMax &&
          e.y >= yMin && e.y < yMax
        ).length;
        
        grid.push({
          x: xMin + 5,
          y: yMin + 5,
          value: count
        });
      }
    }
    
    res.json(grid);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Soccer Analytics API running on http://localhost:${PORT}`);
  console.log(`📊 Data directory: ${DATA_DIR}`);
});
