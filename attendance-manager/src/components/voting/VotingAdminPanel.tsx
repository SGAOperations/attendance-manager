import React, { useEffect, useMemo, useState } from 'react';
import { MeetingApiData, VotingEventWithRelations } from '@/types';
import { getVoteCounts } from '@/utils/voting_utils';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveVotingEvent } from '@/hooks/useActiveVotingEvent';
import { X } from 'lucide-react';
import { VOTING_TYPES, YES_NO_OPTIONS } from '@/utils/consts';

const FIXED_OPTIONS = ['Abstain', 'No Confidence'] as const;

const optionRank = (o: string) =>
  o === 'Abstain' ? 2 : o === 'No Confidence' ? 1 : 0;

const optionColors = new Map([
  ['Yes', '#bbf7d0'],
  ['No', '#fecaca'],
  ['Abstain', '#e5e7eb'],
  ['No Confidence', '#fde68a'],
]);
const FALLBACK_COLORS = ['#bfdbfe', '#ddd6fe', '#fbcfe8', '#99f6e4', '#fed7aa'];

const getOptionColor = (opt: string, idx: number): string =>
  optionColors.get(opt) ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

// ─── VoteBreakdown ────────────────────────────────────────────────────────────

interface VoteBreakdownProps {
  event: VotingEventWithRelations;
  eligible: number;
  voteCounts: Record<string, number>;
  totalVotes: number;
}

const VoteBreakdown: React.FC<VoteBreakdownProps> = ({
  event,
  eligible,
  voteCounts,
  totalVotes,
}) => {
  const opts =
    event.options.length > 0
      ? [...event.options].sort((a, b) => optionRank(a) - optionRank(b))
      : Object.values(YES_NO_OPTIONS);

  if (opts.length === 0) return null;

  // Bar widths are out of eligible (gray remainder = not yet voted).
  // Falls back to totalVotes if eligible is unavailable or stale.
  const barDenom = Math.max(eligible, totalVotes);

  return (
    <div className='mt-4 pt-4 border-t border-gray-200'>
      <p className='font-medium text-gray-900 mb-3'>
        Total Votes Cast: {totalVotes}/{eligible > 0 ? eligible : '—'}
        {eligible > 0 && (
          <span className='ml-1'>
            ({Math.round((Math.min(totalVotes, eligible) / eligible) * 100)}%)
          </span>
        )}
      </p>
      <div className='h-10 w-full rounded-xl overflow-hidden flex bg-gray-200'>
        {opts.map((opt, idx) => {
          const count = voteCounts[opt] ?? 0;
          const barPct = barDenom > 0 ? (count / barDenom) * 100 : 0;
          const labelPct =
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          return (
            <div
              key={opt}
              className='h-full flex items-center justify-center overflow-hidden transition-all duration-500'
              style={{
                width: `${barPct}%`,
                backgroundColor: getOptionColor(opt, idx),
              }}
              title={`${opt}: ${count} (${labelPct}%)`}
            >
              {barPct >= 8 && (
                <span className='text-sm font-medium text-gray-800 whitespace-nowrap px-2 truncate'>
                  {opt} · {count} · {labelPct}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── VotingAdminPanel ─────────────────────────────────────────────────────────

interface VotingAdminPanelProps {
  meetings: MeetingApiData[];
  onVotingEventsMutated?: () => void | Promise<void>;
}

const VotingAdminPanel: React.FC<VotingAdminPanelProps> = ({
  meetings,
  onVotingEventsMutated,
}) => {
  const { user } = useAuth();
  const [meetingId, setMeetingId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [voteType, setVoteType] = useState<string>(VOTING_TYPES.ROLL_CALL.key);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [endErrors, setEndErrors] = useState<Record<string, string | null>>({});
  const [pendingEvent, setPendingEvent] =
    useState<VotingEventWithRelations | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [eligibleCounts, setEligibleCounts] = useState<Record<string, number>>(
    {},
  );

  const {
    activeEvents,
    loading: activeEventLoading,
    refresh: refreshActiveEvent,
  } = useActiveVotingEvent();

  // Merge a freshly created event into the display list until the next poll
  const displayedActiveEvents = useMemo(() => {
    if (!pendingEvent || pendingEvent.endedAt || pendingEvent.deletedAt)
      return activeEvents;
    const alreadyPolled = activeEvents.some(
      (e) => e.votingEventId === pendingEvent.votingEventId,
    );
    return alreadyPolled ? activeEvents : [pendingEvent, ...activeEvents];
  }, [activeEvents, pendingEvent]);

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
    return upcoming.length > 0 ? upcoming : meetings;
  }, [meetings]);

  // Fetch eligible voter counts for any meeting not yet loaded.
  // eligibleCounts in deps is intentional: after each fetch completes the
  // effect re-runs, the filter finds no new IDs, and exits immediately.
  useEffect(() => {
    const unfetchedIds = [
      ...new Set(displayedActiveEvents.map((e) => e.meetingId)),
    ].filter((mid) => !(mid in eligibleCounts));

    if (unfetchedIds.length === 0) return;

    unfetchedIds.forEach(async (mid) => {
      try {
        const res = await fetch(`/api/attendance/meeting/${mid}`);
        if (!res.ok) return;
        const records: { status: string }[] = await res.json();
        const count = records.filter((r) => r.status === 'PRESENT').length;
        setEligibleCounts((prev) => ({ ...prev, [mid]: count }));
      } catch {
        // eligible count is best-effort; silently ignore
      }
    });
  }, [displayedActiveEvents, eligibleCounts]);

  if (!user || user.role !== 'EBOARD') {
    return null;
  }

  const addOption = () => {
    setOptions((prev) => {
      const count = prev.filter((o) => o.startsWith('Option')).length;
      return [...prev, count === 0 ? 'Option' : `Option ${count + 1}`];
    });
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingId || !name.trim()) {
      setCreateError('Please select a meeting and enter a vote name.');
      return;
    }

    setSubmitting(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/voting-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId,
          name,
          voteType,
          updatedBy: user.id,
          options:
            voteType === VOTING_TYPES.SECRET_BALLOT.key
              ? [...FIXED_OPTIONS, ...options]
              : options,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create voting event');
      }

      const event: VotingEventWithRelations = await res.json();
      setPendingEvent(event);
      await onVotingEventsMutated?.();
      setMeetingId('');
      setName('');
      setOptions([]);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async (votingEventId: string) => {
    setEndErrors((prev) => ({ ...prev, [votingEventId]: null }));

    try {
      const res = await fetch(`/api/voting-event/${votingEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ end: true, updatedBy: user.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to end voting event');
      }

      if (pendingEvent?.votingEventId === votingEventId) {
        setPendingEvent(null);
      }
      await refreshActiveEvent();
      await onVotingEventsMutated?.();
    } catch (err) {
      setEndErrors((prev) => ({
        ...prev,
        [votingEventId]: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  };

  return (
    <div className='mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>Voting Controls</h2>
        {displayedActiveEvents.length > 0 && (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'>
            <span className='h-1.5 w-1.5 rounded-full bg-green-500' />
            {displayedActiveEvents.length === 1
              ? 'Vote In Progress'
              : `${displayedActiveEvents.length} Votes In Progress`}
          </span>
        )}
      </div>

      {activeEventLoading && displayedActiveEvents.length === 0 && (
        <p className='mb-4 text-sm text-gray-500'>Checking for active votes…</p>
      )}

      {displayedActiveEvents.length > 0 && (
        <div className='space-y-2'>
          {displayedActiveEvents.map((event) => {
            const meeting = event.meeting;
            const voteTypeLabel =
              Object.values(VOTING_TYPES).find((t) => t.key === event.voteType)
                ?.value ?? event.voteType;
            const endError = endErrors[event.votingEventId];
            const voteCounts = getVoteCounts(event);
            const totalVotes = Object.values(voteCounts).reduce(
              (sum, n) => sum + n,
              0,
            );

            return (
              <div
                key={event.votingEventId}
                className='rounded-xl border border-gray-100 bg-gray-50 p-5 text-sm'
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0'>
                    <div className='font-medium text-gray-900'>
                      {event.name}
                    </div>
                    <div className='text-sm text-gray-400 mt-0.5'>
                      {[
                        voteTypeLabel,
                        meeting && `${meeting.date} · ${meeting.name}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleEnd(event.votingEventId)}
                    className='shrink-0 px-4 py-1 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed'
                  >
                    Close Vote
                  </button>
                </div>
                <VoteBreakdown
                  event={event}
                  eligible={eligibleCounts[event.meetingId] ?? 0}
                  voteCounts={voteCounts}
                  totalVotes={totalVotes}
                />
                {endError && (
                  <p className='mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2'>
                    {endError}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!activeEventLoading && displayedActiveEvents.length === 0 && (
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
                <option key={type.key} value={type.key}>
                  {type.value}
                </option>
              ))}
            </select>
          </div>

          {voteType === VOTING_TYPES.SECRET_BALLOT.key && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Options
              </label>
              <div className='space-y-2'>
                {FIXED_OPTIONS.map((fixed) => (
                  <div key={fixed} className='relative'>
                    <input
                      type='text'
                      value={fixed}
                      readOnly
                      disabled
                      className='w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600'
                    />
                  </div>
                ))}

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
                      className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] pr-8'
                    />
                    <X
                      onClick={() => removeOption(index)}
                      className='absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-sm hover:bg-red-50 rounded px-1'
                    />
                  </div>
                ))}
              </div>
              <div className='flex justify-end mt-2'>
                <button
                  type='button'
                  onClick={addOption}
                  className='text-sm font-medium hover:underline'
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

          {createError && (
            <p className='text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2'>
              {createError}
            </p>
          )}

          <div className='pt-2'>
            <button
              type='submit'
              disabled={submitting}
              className='px-4 py-2 bg-[#C8102E] text-white rounded-lg text-sm font-medium hover:bg-[#A8102E] disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {submitting ? 'Starting…' : 'Create & Start Voting Event'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VotingAdminPanel;
