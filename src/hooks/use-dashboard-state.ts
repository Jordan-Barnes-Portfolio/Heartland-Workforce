import { useState, useEffect } from 'react';
import type { Widget } from '@/types/widget';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'dashboard_state';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

interface DashboardState {
  widgets: Widget[];
  version: string;
}

interface StorageError {
  type: 'quota_exceeded' | 'storage_unavailable' | 'parse_error';
  message: string;
}

export function useDashboardState(initialWidgets: Widget[]) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [error, setError] = useState<StorageError | null>(null);
  const { toast } = useToast();

  // Check if local storage is available
  const isStorageAvailable = () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Load dashboard state from storage
  useEffect(() => {
    if (!isStorageAvailable()) {
      setError({
        type: 'storage_unavailable',
        message: 'Local storage is not available. Your changes will not be saved.',
      });
      return;
    }

    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState: DashboardState = JSON.parse(savedState);
        setWidgets(parsedState.widgets);
      }
    } catch (e) {
      setError({
        type: 'parse_error',
        message: 'Failed to load saved dashboard state. Starting with default layout.',
      });
      setWidgets(initialWidgets);
    }
  }, [initialWidgets]);

  // Save dashboard state
  const saveState = (newWidgets: Widget[]) => {
    if (!isStorageAvailable()) {
      return;
    }

    try {
      const state: DashboardState = {
        widgets: newWidgets,
        version: '1.0', // For future migrations
      };

      const serializedState = JSON.stringify(state);
      
      // Check storage size
      if (serializedState.length > MAX_STORAGE_SIZE) {
        throw new Error('Storage quota would be exceeded');
      }

      localStorage.setItem(STORAGE_KEY, serializedState);
      setWidgets(newWidgets);
    } catch (e) {
      const isQuotaExceeded = e instanceof Error && 
        (e.name === 'QuotaExceededError' || 
         e.message.includes('quota') || 
         e.message.includes('persistent storage'));

      setError({
        type: isQuotaExceeded ? 'quota_exceeded' : 'storage_unavailable',
        message: isQuotaExceeded
          ? 'Storage quota exceeded. Some changes may not be saved.'
          : 'Failed to save dashboard state.',
      });

      toast({
        title: 'Warning',
        description: isQuotaExceeded
          ? 'Storage quota exceeded. Try removing some widgets.'
          : 'Failed to save dashboard state.',
        variant: 'destructive',
      });
    }
  };

  // Reset to default layout
  const resetLayout = () => {
    if (isStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setWidgets(initialWidgets);
    setError(null);
    toast({
      title: 'Layout Reset',
      description: 'Dashboard has been reset to default layout.',
    });
  };

  return {
    widgets,
    setWidgets: saveState,
    error,
    resetLayout,
  };
}