import React, { useMemo, useState } from 'react';
import { MeetingApiData } from '@/types';
import { VOTING_TYPES } from '@/utils/consts';
import { X } from 'lucide-react';

const FIXED_OPTIONS = ['Abstain', 'No Confidence'] as const;

interface CreateVoteFormProps {
  meetings: MeetingApiData[];
  userId: string;
  onCreated: () => Promise<void>;
}

const CreateVoteForm: React.FC<CreateVoteFormProps> = ({
  meetings,
  userId,
  onCreated,
}) => {
  // Form fields
  const [meetingId, setMeetingId] = useState('');
  const [name, setName] = useState('');
  const [voteType, setVoteType] = useState(VOTING_TYPES.ROLL_CALL.key);
  const [options, setOptions] = useState<string[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const addOption = () => {
    setOptions((prev) => {
      const count = prev.filter((o) => o.startsWith('Option')).length;
      return [...prev, count === 0 ? 'Option' : `Option ${count + 1}`];
    });
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingId || !name.trim()) {
      setError('Please select a meeting and enter a vote name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/voting-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId,
          name,
          voteType,
          updatedBy: userId,
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

      await onCreated();
      setMeetingId('');
      setName('');
      setOptions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Meeting
        </label>
        <select
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
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
          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
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
          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
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
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-8'
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

      {error && (
        <p className='text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2'>
          {error}
        </p>
      )}

      <div className='pt-2'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed'
        >
          {isSubmitting ? 'Starting…' : 'Create & Start Voting Event'}
        </button>
      </div>
    </form>
  );
};

export default CreateVoteForm;
