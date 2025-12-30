import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * Custom hook for fetching data from the API
 * @param {string} endpoint - API endpoint to fetch from
 * @param {object} options - Additional options (params, enabled)
 * @returns {object} - { data, loading, error, refetch }
 */
export const useFetchData = (endpoint, options = {}) => {
  const { params = {}, enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });
      setData(response.data);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(params), enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching player statistics
 */
export const usePlayerStats = (matchId = null) => {
  const params = matchId ? { matchId } : {};
  return useFetchData('/players', { params });
};

/**
 * Hook for fetching team statistics
 */
export const useTeamStats = (matchId = null) => {
  const params = matchId ? { matchId } : {};
  return useFetchData('/teams', { params });
};

/**
 * Hook for fetching all events
 */
export const useEvents = (filters = {}) => {
  return useFetchData('/events', { params: filters });
};

/**
 * Hook for fetching shot events
 */
export const useShots = (matchId = null) => {
  const params = matchId ? { matchId } : {};
  return useFetchData('/events/shots', { params });
};

/**
 * Hook for fetching defensive events
 */
export const useDefensiveEvents = (matchId = null) => {
  const params = matchId ? { matchId } : {};
  return useFetchData('/events/defensive', { params });
};

/**
 * Hook for fetching zone pressure data
 */
export const useZonePressure = (matchId = null) => {
  const params = matchId ? { matchId } : {};
  return useFetchData('/zones/pressure', { params });
};

/**
 * Hook for fetching zone activity data
 */
export const useZoneActivity = (player = null, matchId = null, eventCategory = null) => {
  const params = {};
  if (player) params.player = player;
  if (matchId) params.matchId = matchId;
  if (eventCategory) params.eventCategory = eventCategory;
  
  return useFetchData('/zones/activity', { params, enabled: !!player || !!eventCategory });
};

/**
 * Hook for fetching overview statistics
 */
export const useOverviewStats = (matchId = null) => {
  const params = matchId ? { matchId } : {};
  return useFetchData('/stats/overview', { params });
};

/**
 * Hook for fetching timeline data
 */
export const useTimeline = (matchId = null, interval = 5) => {
  const params = { interval };
  if (matchId) params.matchId = matchId;
  
  return useFetchData('/stats/timeline', { params });
};

/**
 * Hook for fetching match summary
 */
export const useMatchSummary = () => {
  return useFetchData('/matches');
};

/**
 * Hook for fetching player heatmap data
 */
export const usePlayerHeatmap = (playerName, matchId = null) => {
  const params = matchId ? { matchId } : {};
  return useFetchData(`/players/${encodeURIComponent(playerName)}/heatmap`, { 
    params, 
    enabled: !!playerName 
  });
};

export default useFetchData;
