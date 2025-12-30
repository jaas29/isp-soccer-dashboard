/**
 * Coordinate and field visualization utilities
 */

// Standard field dimensions (in percentage 0-100)
export const FIELD_WIDTH = 100;
export const FIELD_HEIGHT = 100;

// Zone definitions for 3x3 grid
export const ZONES_3X3 = {
  R1C1: { row: 1, col: 1, xMin: 0, xMax: 33.33, yMin: 0, yMax: 33.33, label: 'Def Right' },
  R1C2: { row: 1, col: 2, xMin: 33.33, xMax: 66.67, yMin: 0, yMax: 33.33, label: 'Mid Right' },
  R1C3: { row: 1, col: 3, xMin: 66.67, xMax: 100, yMin: 0, yMax: 33.33, label: 'Att Right' },
  R2C1: { row: 2, col: 1, xMin: 0, xMax: 33.33, yMin: 33.33, yMax: 66.67, label: 'Def Center' },
  R2C2: { row: 2, col: 2, xMin: 33.33, xMax: 66.67, yMin: 33.33, yMax: 66.67, label: 'Mid Center' },
  R2C3: { row: 2, col: 3, xMin: 66.67, xMax: 100, yMin: 33.33, yMax: 66.67, label: 'Att Center' },
  R3C1: { row: 3, col: 1, xMin: 0, xMax: 33.33, yMin: 66.67, yMax: 100, label: 'Def Left' },
  R3C2: { row: 3, col: 2, xMin: 33.33, xMax: 66.67, yMin: 66.67, yMax: 100, label: 'Mid Left' },
  R3C3: { row: 3, col: 3, xMin: 66.67, xMax: 100, yMin: 66.67, yMax: 100, label: 'Att Left' }
};

// Zone order for grid display (top to bottom, left to right)
export const ZONE_GRID_ORDER = [
  ['R3C1', 'R3C2', 'R3C3'],
  ['R2C1', 'R2C2', 'R2C3'],
  ['R1C1', 'R1C2', 'R1C3']
];

// Flattened zone order for iteration
export const ZONE_ORDER = ['R3C1', 'R3C2', 'R3C3', 'R2C1', 'R2C2', 'R2C3', 'R1C1', 'R1C2', 'R1C3'];

/**
 * Convert raw coordinates to percentage (0-100)
 */
export const normalizeCoordinates = (x, y, maxX = 105, maxY = 68) => {
  return {
    x: (x / maxX) * 100,
    y: (y / maxY) * 100
  };
};

/**
 * Get zone from coordinates
 */
export const getZoneFromCoordinates = (x, y) => {
  for (const [zoneName, zone] of Object.entries(ZONES_3X3)) {
    if (x >= zone.xMin && x < zone.xMax && y >= zone.yMin && y < zone.yMax) {
      return zoneName;
    }
  }
  return null;
};

/**
 * Get zone center coordinates (for labels)
 */
export const getZoneCenter = (zoneName) => {
  const zone = ZONES_3X3[zoneName];
  if (!zone) return { x: 50, y: 50 };
  
  return {
    x: (zone.xMin + zone.xMax) / 2,
    y: (zone.yMin + zone.yMax) / 2
  };
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Convert SVG viewbox coordinates to pixel coordinates
 */
export const viewBoxToPixels = (x, y, viewBoxWidth, viewBoxHeight, pixelWidth, pixelHeight) => {
  return {
    x: (x / viewBoxWidth) * pixelWidth,
    y: (y / viewBoxHeight) * pixelHeight
  };
};

/**
 * Generate heatmap grid data from events
 */
export const generateHeatmapGrid = (events, gridSize = 10) => {
  const grid = [];
  const cellWidth = FIELD_WIDTH / gridSize;
  const cellHeight = FIELD_HEIGHT / gridSize;
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const xMin = col * cellWidth;
      const xMax = (col + 1) * cellWidth;
      const yMin = row * cellHeight;
      const yMax = (row + 1) * cellHeight;
      
      const count = events.filter(e => 
        e.x >= xMin && e.x < xMax &&
        e.y >= yMin && e.y < yMax
      ).length;
      
      grid.push({
        x: xMin + cellWidth / 2,
        y: yMin + cellHeight / 2,
        value: count,
        row,
        col
      });
    }
  }
  
  return grid;
};

/**
 * Get field zone label (defensive/middle/attacking third)
 */
export const getFieldThird = (x) => {
  if (x < 33.33) return 'Defensive Third';
  if (x < 66.67) return 'Middle Third';
  return 'Attacking Third';
};

/**
 * Get lane label (left/center/right)
 */
export const getLane = (y) => {
  if (y < 33.33) return 'Right Lane';
  if (y < 66.67) return 'Central Lane';
  return 'Left Lane';
};

/**
 * Calculate shot expected goals (simplified xG model)
 * This is a simplified model - real xG uses more factors
 */
export const calculateSimpleXG = (x, y) => {
  // Distance from goal center (assuming goal at x=100, y=50)
  const goalX = 100;
  const goalY = 50;
  const distance = calculateDistance(x, y, goalX, goalY);
  
  // Angle to goal (simplified)
  const angle = Math.atan2(Math.abs(y - goalY), Math.abs(goalX - x)) * (180 / Math.PI);
  
  // Base xG calculation (very simplified)
  let xg = 0;
  
  if (x >= 90) {
    // Inside the box
    xg = 0.4 - (distance * 0.01) - (angle * 0.003);
  } else if (x >= 75) {
    // Edge of box
    xg = 0.15 - (distance * 0.005);
  } else {
    // Long range
    xg = 0.05 - (distance * 0.001);
  }
  
  return Math.max(0, Math.min(1, xg));
};

/**
 * Get color based on value intensity
 */
export const getIntensityColor = (value, max, colorScheme = 'green') => {
  const intensity = max > 0 ? value / max : 0;
  
  const schemes = {
    green: {
      r: 16 + (intensity * 50),
      g: 185,
      b: 129 - (intensity * 50)
    },
    blue: {
      r: 59,
      g: 130 + (intensity * 50),
      b: 246
    },
    red: {
      r: 239,
      g: 68 + (intensity * 50),
      b: 68
    },
    heat: {
      r: Math.min(255, 50 + intensity * 205),
      g: Math.max(0, 200 - intensity * 150),
      b: Math.max(0, 50 - intensity * 50)
    }
  };
  
  const colors = schemes[colorScheme] || schemes.green;
  return `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${0.3 + intensity * 0.7})`;
};

/**
 * Soccer field SVG path elements
 */
export const FIELD_ELEMENTS = {
  // Outer boundary
  boundary: 'M 0 0 L 100 0 L 100 100 L 0 100 Z',
  
  // Center line
  centerLine: 'M 50 0 L 50 100',
  
  // Center circle (radius ~9.15m on real field, ~8.5% of length)
  centerCircle: 'M 50 41.5 A 8.5 8.5 0 1 1 50 58.5 A 8.5 8.5 0 1 1 50 41.5',
  
  // Center spot
  centerSpot: { cx: 50, cy: 50, r: 0.5 },
  
  // Left penalty area (16.5m = ~15.7% of field length)
  leftPenaltyArea: 'M 0 21.1 L 15.7 21.1 L 15.7 78.9 L 0 78.9',
  
  // Right penalty area
  rightPenaltyArea: 'M 100 21.1 L 84.3 21.1 L 84.3 78.9 L 100 78.9',
  
  // Left goal area (5.5m = ~5.2% of field length)
  leftGoalArea: 'M 0 36.8 L 5.2 36.8 L 5.2 63.2 L 0 63.2',
  
  // Right goal area
  rightGoalArea: 'M 100 36.8 L 94.8 36.8 L 94.8 63.2 L 100 63.2',
  
  // Left penalty spot
  leftPenaltySpot: { cx: 10.5, cy: 50, r: 0.5 },
  
  // Right penalty spot
  rightPenaltySpot: { cx: 89.5, cy: 50, r: 0.5 },
  
  // Left penalty arc
  leftPenaltyArc: 'M 15.7 39 A 9.15 9.15 0 0 1 15.7 61',
  
  // Right penalty arc
  rightPenaltyArc: 'M 84.3 39 A 9.15 9.15 0 0 0 84.3 61',
  
  // Corner arcs (1m = ~0.95% of field length)
  cornerTopLeft: 'M 0 0.95 A 0.95 0.95 0 0 0 0.95 0',
  cornerTopRight: 'M 99.05 0 A 0.95 0.95 0 0 0 100 0.95',
  cornerBottomLeft: 'M 0.95 100 A 0.95 0.95 0 0 0 0 99.05',
  cornerBottomRight: 'M 100 99.05 A 0.95 0.95 0 0 0 99.05 100'
};
