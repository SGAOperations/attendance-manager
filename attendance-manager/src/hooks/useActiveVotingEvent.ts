import { useEffect, useState } from 'react';
import { VotingEventApiData } from '@/types';

interface UseActiveVotingEventOptions {
  pollIntervalMs?: number;
}

interface UseActiveVotingEventResult {
  activeEvent: VotingEventApiData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Polls the backend for the currently active voting event
 * "active" is defined as the most recently created VotingEvent
 * with deletedAt === null
 */
export function useActiveVotingEvent(
  options: UseActiveVotingEventOptions = {}
): UseActiveVotingEventResult {
  const { pollIntervalMs = 10000 } = options;
  const [activeEvent, setActiveEvent] = useState<VotingEventApiData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveEvent = async () => {
    try {
      setError(null);
      const res = await fetch('/api/voting-event');
      if (!res.ok) {
        throw new Error(`Failed to fetch voting events (${res.status})`);
      }
      const events: VotingEventApiData[] = await res.json();

      const activeEvents = events.filter(e => !e.deletedAt);

      if (activeEvents.length === 0) {
        setActiveEvent(null);
        return;
      }

      const sorted = [...activeEvents].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setActiveEvent(sorted[0]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching active voting event:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveEvent();

    const id = window.setInterval(() => {
      fetchActiveEvent();
    }, pollIntervalMs);

    return () => {
      window.clearInterval(id);
    };
  }, [pollIntervalMs]);

  return {
    activeEvent,
    loading,
    error,
    refresh: fetchActiveEvent
  };
}

