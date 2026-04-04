import { useEffect, useState } from 'react';
import { VotingEventWithRelations } from '@/types';

interface UseActiveVotingEventOptions {
  pollIntervalMs?: number;
}

interface UseActiveVotingEventResult {
  activeEvent: VotingEventWithRelations | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Polls the backend for the currently active voting event
 * "active" is defined as the most recently created VotingEvent
 * with deletedAt === null and endedAt === null
 */
export function useActiveVotingEvent(
  options: UseActiveVotingEventOptions = {},
): UseActiveVotingEventResult {
  const { pollIntervalMs = 3000 } = options;
  const [activeEvent, setActiveEvent] = useState<VotingEventWithRelations | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveEvent = async () => {
    try {
      setError(null);
      const res = await fetch('/api/voting-event/active');
      if (!res.ok) {
        throw new Error(`Failed to fetch active voting event (${res.status})`);
      }
      const events: VotingEventWithRelations[] = await res.json();

      if (events.length === 0) {
        setActiveEvent(null);
        return;
      }

      const sorted = [...events].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setActiveEvent(sorted[0]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
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
    refresh: fetchActiveEvent,
  };
}
