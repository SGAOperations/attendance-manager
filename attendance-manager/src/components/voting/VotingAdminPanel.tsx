import React, { useMemo, useState } from 'react';
import { MeetingApiData, VotingEventApiData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface VotingAdminPanelProps {
  meetings: MeetingApiData[];
  onEventCreated?: (event: VotingEventApiData) => void;
}

const VotingAdminPanel: React.FC<VotingAdminPanelProps> = ({
  meetings,
  onEventCreated
}) => {
  const { user } = useAuth();
  const [meetingId, setMeetingId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [voteType, setVoteType] = useState<string>('YES_NO');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<VotingEventApiData | null>(
    null
  );

  const meetingsForDropdown = useMemo(() => {
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    const upcoming = meetings.filter(m => {
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meetingId,
          name,
          voteType,
          updatedBy: user.id
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create voting event');
      }

      const event: VotingEventApiData = await res.json();
      setCurrentEvent(event);
      if (onEventCreated) {
        onEventCreated(event);
      }
      setName('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async () => {
    if (!currentEvent) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/voting-event/${currentEvent.votingEventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deletedAt: new Date().toISOString(),
          updatedBy: user?.id
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to end voting event');
      }

      const updated: VotingEventApiData = await res.json();
      setCurrentEvent(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
      <h2 className='text-lg font-semibold text-gray-900 mb-4'>Voting Controls</h2>

      <form onSubmit={handleCreate} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Meeting
          </label>
          <select
            value={meetingId}
            onChange={e => setMeetingId(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]'
          >
            <option value=''>Select a meeting</option>
            {meetingsForDropdown.map(m => (
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
            onChange={e => setName(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]'
            placeholder='e.g. Approve the budget for Q2?'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Vote Type
          </label>
          <select
            value={voteType}
            onChange={e => setVoteType(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]'
          >
            <option value='YES_NO'>Yes / No / Abstain</option>
            <option value='UNANIMOUS_CONSENT'>Unanimous Consent</option>
            <option value='PLACARD'>Placard</option>
            <option value='ROLL_CALL'>Roll Call</option>
            <option value='SECRET_BALLOT'>Secret Ballot</option>
          </select>
        </div>

        {error && (
          <p className='text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2'>
            {error}
          </p>
        )}

        <div className='flex items-center justify-between pt-2'>
          <button
            type='submit'
            disabled={submitting}
            className='px-4 py-2 bg-[#C8102E] text-white rounded-lg text-sm font-medium hover:bg-[#A8102E] disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {submitting ? 'Starting…' : 'Create & Start Voting Event'}
          </button>

          {currentEvent && !currentEvent.deletedAt && (
            <button
              type='button'
              onClick={handleEnd}
              disabled={submitting}
              className='px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed'
            >
              End Current Voting Event
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VotingAdminPanel;

