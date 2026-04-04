import React, { useMemo, useState } from 'react';
import { MeetingApiData, VotingEventWithRelations } from '@/types';
import { getVoteCounts } from '@/utils/voting_utils';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveVotingEvent } from '@/hooks/useActiveVotingEvent';
import { X } from 'lucide-react';
import { VOTING_TYPES } from '@/utils/consts';

interface VotingAdminPanelProps {
  meetings: MeetingApiData[];

  onEventCreated?: (event: VotingEventWithRelations) => void;
}

const VotingAdminPanel: React.FC<VotingAdminPanelProps> = ({
  meetings,
  onEventCreated,
}) => {
  // ─── States ────────────────────────────────────────────────────────────────

  const { user } = useAuth();
  const [meetingId, setMeetingId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [voteType, setVoteType] = useState<string>(VOTING_TYPES.ROLL_CALL.key);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<VotingEventWithRelations | null>(
    null,
  );
  const [options, setOptions] = useState<string[]>([]);

  // Fixed options for Secret Ballot
  const fixedOptions = ['Abstain', 'No Confidence'];

  // ─── Functions ─────────────────────────────────────────────────────────────
  const addOption = () => {
    // Add default value 'Option', let them rename it later
    setOptions((prev) => {
      const count = prev.filter((o) => o.startsWith('Option')).length;
      const newOption = count === 0 ? 'Option' : `Option ${count + 1}`;
      return [...prev, newOption];
    });
  };

  const removeOption = (option: string) => {
    setOptions((prev) => prev.filter((o) => o !== option));
  };

  // ─── Hooks ─────────────────────────────────────────────────────────────────
  const { activeEvent, refresh: refreshActiveEvent } = useActiveVotingEvent();

  const effectiveCurrentEvent = currentEvent ?? activeEvent;
  const hasActiveEvent = !!(
    effectiveCurrentEvent && !effectiveCurrentEvent.deletedAt && !effectiveCurrentEvent.endedAt
  );

  const activeVoteCounts = hasActiveEvent && activeEvent
    ? getVoteCounts(activeEvent)
    : null;
  const activeTotalVotes = activeVoteCounts
    ? Object.values(activeVoteCounts).reduce((sum, n) => sum + n, 0)
    : 0;

  const meetingsForDropdown = useMemo(() => {
    const today = new Date();
    const todayStr =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');
    const upcoming = meetings.filter((m) => {
      const raw = (m.date && String(m.date).trim()) || '';
      const meetingDateStr = raw.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(meetingDateStr)) return true;
      return meetingDateStr >= todayStr;
    });
    if (upcoming.length > 0) return upcoming;
    return meetings;
  }, [meetings]);

  if (!user || user.role !== 'EBOARD') {
    return null;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasActiveEvent) {
      setError(
        'There is already an active voting event. Please end it before starting a new one.',
      );
      return;
    }
    if (!meetingId || !name.trim()) {
      setError('Please select a meeting and enter a vote name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/voting-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId,
          name,
          voteType,
          updatedBy: user.id,
          options:
            voteType === 'SECRET_BALLOT'
              ? [...fixedOptions, ...options]
              : options,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create voting event');
      }

      const event: VotingEventWithRelations = await res.json();
      setCurrentEvent(event);
      if (onEventCreated) {
        onEventCreated(event);
      }
      setName('');
      setOptions([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async () => {
    if (!effectiveCurrentEvent) {
      setError('No active event');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/voting-event/${effectiveCurrentEvent.votingEventId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ end: true, updatedBy: user?.id }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to end voting event');
      }

      const updated: VotingEventWithRelations = await res.json();
      setCurrentEvent(updated);
      await refreshActiveEvent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCurrentEvent(null);
      setSubmitting(false);
    }
  };

  return (
    <div className='mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
      <h2 className='text-lg font-semibold text-gray-900 mb-4'>
        Voting Controls
      </h2>

      <form onSubmit={handleCreate} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Meeting
          </label>
          <select
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]'
          >
            <option value=''>Select a meeting</option>
            {meetingsForDropdown.map((m) => (
              <option key={m.meetingId} value={m.meetingId}>
                {m.date} — {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Question / Name
          </label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]'
            placeholder='Enter the vote question or title'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Vote Type
          </label>
          <select
            value={voteType}
            onChange={(e) => setVoteType(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]'
          >
            {Object.values(VOTING_TYPES).map((type) => (
              <option value={type.key}>{type.value}</option>
            ))}
          </select>
        </div>

        {voteType === 'SECRET_BALLOT' && (
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Options
            </label>
            <div className='space-y-2'>
              {/* Shows two mandatory options */}
              {fixedOptions.map((fixed, idx) => (
                <div key={`fixed-${idx}`} className='relative'>
                  <input
                    type='text'
                    value={fixed}
                    readOnly
                    disabled
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600'
                  />
                </div>
              ))}

              {/* User-added options */}
              {options.map((option, index) => (
                <div key={index} className='relative'>
                  <input
                    type='text'
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      setOptions(newOptions);
                    }}
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] pr-8' // add padding for the x
                  />
                  <X
                    onClick={() => removeOption(option)}
                    className='absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-sm hover:bg-red-50 rounded px-1'
                  />
                </div>
              ))}
            </div>
            <div className='flex justify-end mt-2'>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  addOption();
                }}
                className='text-sm font-medium hover:underline'
              >
                + Add Option
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className='text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2'>
            {error}
          </p>
        )}

        <div className='flex items-center justify-between pt-2'>
          <button
            type='submit'
            disabled={submitting || hasActiveEvent}
            className='px-4 py-2 bg-[#C8102E] text-white rounded-lg text-sm font-medium hover:bg-[#A8102E] disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {submitting ? 'Starting…' : 'Create & Start Voting Event'}
          </button>

          {hasActiveEvent && (
            <div className='flex items-center space-x-3'>
              <p className='text-xs text-gray-600'>
                Active vote:{' '}
                <span className='font-medium'>
                  {effectiveCurrentEvent?.name ?? 'In progress'}
                </span>
              </p>
              <button
                type='button'
                onClick={handleEnd}
                disabled={submitting}
                className='px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                End Current Voting Event
              </button>
            </div>
          )}
        </div>
      </form>

      {hasActiveEvent && activeVoteCounts && (
        <div className='mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4'>
          <h3 className='text-sm font-semibold text-gray-800 mb-3'>
            Ongoing Vote Progress
          </h3>
          <p className='text-sm text-gray-600 mb-2'>
            Total votes received:{' '}
            <span className='font-semibold text-gray-900'>{activeTotalVotes}</span>
          </p>
          {activeTotalVotes > 0 && (
            <div className='flex flex-wrap gap-2'>
              {Object.entries(activeVoteCounts).map(([key, value]) => (
                <span
                  key={key}
                  className='inline-flex items-center rounded-full bg-white border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700'
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VotingAdminPanel;
