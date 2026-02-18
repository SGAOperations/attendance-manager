import React, { useState } from 'react';
import { VotingEventApiData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ActiveVotingModalProps {
  event: VotingEventApiData;
  onVoted?: () => void;
}

type VoteChoice = 'YES' | 'NO' | 'ABSTAIN';

const ActiveVotingModal: React.FC<ActiveVotingModalProps> = ({
  event,
  onVoted
}) => {
  const { user } = useAuth();
  const [choice, setChoice] = useState<VoteChoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  if (!user || hasVoted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!choice) {
      setError('Please select an option before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/voting-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          votingEventId: event.votingEventId,
          userId: user.id,
          result: choice,
          updatedBy: user.id
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit vote');
      }

      setHasVoted(true);
      if (onVoted) {
        onVoted();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4'>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>
          Active Vote
        </h2>
        <p className='text-sm text-gray-600 mb-4'>
          {event.name || 'A new voting event is in progress.'}
        </p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <fieldset className='space-y-2'>
            <legend className='text-sm font-medium text-gray-900'>
              Please select your vote:
            </legend>
            <div className='space-y-1'>
              <label className='flex items-center space-x-2 text-sm text-gray-800'>
                <input
                  type='radio'
                  name='vote'
                  value='YES'
                  checked={choice === 'YES'}
                  onChange={() => setChoice('YES')}
                  className='h-4 w-4 text-[#C8102E] border-gray-300 focus:ring-[#C8102E]'
                />
                <span>Yes</span>
              </label>
              <label className='flex items-center space-x-2 text-sm text-gray-800'>
                <input
                  type='radio'
                  name='vote'
                  value='NO'
                  checked={choice === 'NO'}
                  onChange={() => setChoice('NO')}
                  className='h-4 w-4 text-[#C8102E] border-gray-300 focus:ring-[#C8102E]'
                />
                <span>No</span>
              </label>
              <label className='flex items-center space-x-2 text-sm text-gray-800'>
                <input
                  type='radio'
                  name='vote'
                  value='ABSTAIN'
                  checked={choice === 'ABSTAIN'}
                  onChange={() => setChoice('ABSTAIN')}
                  className='h-4 w-4 text-[#C8102E] border-gray-300 focus:ring-[#C8102E]'
                />
                <span>Abstain</span>
              </label>
            </div>
          </fieldset>

          {error && (
            <p className='text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2'>
              {error}
            </p>
          )}

          <div className='flex justify-end space-x-2 pt-2'>
            <button
              type='submit'
              disabled={submitting}
              className='px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E] disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {submitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActiveVotingModal;

