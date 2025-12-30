import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export a DOM element to PDF
 * @param {string} elementId - ID of the element to export
 * @param {string} filename - Name of the output file
 * @param {object} options - Additional options
 */
export const exportToPDF = async (elementId, filename = 'report.pdf', options = {}) => {
  const {
    orientation = 'landscape',
    format = 'a4',
    scale = 2,
    backgroundColor = '#0a0a0f'
  } = options;

  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`);
    return false;
  }

  try {
    // Show loading state
    const originalContent = element.innerHTML;
    
    // Capture the element
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions to fit the page
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const width = imgWidth * ratio;
    const height = imgHeight * ratio;
    const x = (pdfWidth - width) / 2;
    const y = (pdfHeight - height) / 2;
    
    pdf.addImage(imgData, 'PNG', x, y, width, height);
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

/**
 * Export a DOM element to PNG image
 * @param {string} elementId - ID of the element to export
 * @param {string} filename - Name of the output file
 * @param {object} options - Additional options
 */
export const exportToPNG = async (elementId, filename = 'chart.png', options = {}) => {
  const {
    scale = 2,
    backgroundColor = '#0a0a0f'
  } = options;

  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      logging: false
    });
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    return false;
  }
};

/**
 * Export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the output file
 * @param {Array} columns - Optional array of column names to include
 */
export const exportToCSV = (data, filename = 'data.csv', columns = null) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return false;
  }

  try {
    // Determine columns
    const cols = columns || Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      // Header row
      cols.join(','),
      // Data rows
      ...data.map(row => 
        cols.map(col => {
          const value = row[col];
          // Handle values that need quoting
          if (value === null || value === undefined) return '';
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        }).join(',')
      )
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

/**
 * Export player stats to CSV
 */
export const exportPlayerStats = (players, filename = 'player_stats.csv') => {
  const columns = [
    'player',
    'team',
    'position',
    'total_touches',
    'passes_attempted',
    'passes_successful',
    'pass_accuracy',
    'duels_attempted',
    'duels_won',
    'duel_success_rate',
    'shots_attempted',
    'shots_on_target',
    'shot_accuracy',
    'recoveries',
    'defensive_actions'
  ];
  
  return exportToCSV(players, filename, columns);
};

/**
 * Export team stats to CSV
 */
export const exportTeamStats = (team, filename = 'team_stats.csv') => {
  const data = Array.isArray(team) ? team : [team];
  return exportToCSV(data, filename);
};

/**
 * Export events to CSV
 */
export const exportEvents = (events, filename = 'events.csv') => {
  const columns = [
    'minute',
    'second',
    'player',
    'team',
    'event_type',
    'outcome',
    'x',
    'y',
    'zone_3x3',
    'zone_third',
    'is_successful'
  ];
  
  return exportToCSV(events, filename, columns);
};

/**
 * Generate a comprehensive match report PDF
 */
export const generateMatchReport = async (matchData, options = {}) => {
  const {
    filename = 'match_report.pdf',
    title = 'Match Analysis Report'
  } = options;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(16, 185, 129); // Accent green
  pdf.text(title, margin, yPosition);
  yPosition += 15;

  // Date
  pdf.setFontSize(12);
  pdf.setTextColor(156, 163, 175); // Gray
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 20;

  // Team Stats Section
  if (matchData.teamStats) {
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Team Statistics', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setTextColor(200, 200, 200);
    
    const stats = matchData.teamStats;
    const statLines = [
      `Total Shots: ${stats.total_shots || 0} (On Target: ${stats.shots_on_target || 0})`,
      `Pass Accuracy: ${stats.pass_accuracy?.toFixed(1) || 0}%`,
      `Duels Won: ${stats.defensive_duels_won || 0}`,
      `Recoveries: ${stats.total_recoveries || 0}`
    ];

    statLines.forEach(line => {
      pdf.text(line, margin, yPosition);
      yPosition += 7;
    });
    yPosition += 10;
  }

  // Top Players Section
  if (matchData.players && matchData.players.length > 0) {
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Top Performers', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(200, 200, 200);

    // Sort by touches and take top 5
    const topPlayers = [...matchData.players]
      .sort((a, b) => (b.total_touches || 0) - (a.total_touches || 0))
      .slice(0, 5);

    topPlayers.forEach((player, idx) => {
      const line = `${idx + 1}. ${player.player} - ${player.total_touches} touches, ${player.pass_accuracy?.toFixed(0) || 0}% pass accuracy`;
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
  }

  pdf.save(filename);
  return true;
};
