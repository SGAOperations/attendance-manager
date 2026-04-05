'use client';

import React, { useState } from 'react';
import { VotingEventWithRelations } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { VOTING_TYPES } from '@/utils/consts';
import { formatResultLabel } from './votingDisplayUtils';
import EditVotingRecordsModal from './EditVotingRecordsModal';

interface OngoingVotingPanelProps {
  events: VotingEventWithRelations[];
  loading: boolean;
  onRefresh: () => void;
}

const OngoingVotingPanel: React.FC<OngoingVotingPanelProps> = ({
  events,
  loading,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [editEventId, setEditEventId] = useState<string | null>(null);

  if (!user || user.role !== 'EBOARD') {
    return null;
  }

  const ongoingEvents = events
    .filter((e) => !e.deletedAt && !e.endedAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div className='mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>Ongoing Voting</h2>
      </div>

      {loading ? (
        <p className='text-sm text-gray-500'>Loading ongoing votes…</p>
      ) : ongoingEvents.length === 0 ? (
        <p className='text-sm text-gray-500'>No voting events in progress.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-200'>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  Meeting / Date
                </th>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  Question
                </th>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  Vote Type
                </th>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  Results
                </th>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ongoingEvents.map((event) => {
                const records =
                  (event.votingRecords || []).filter((r) => !r.deletedAt) || [];
                const counts = records.reduce<Record<string, number>>(
                  (acc, record) => {
                    acc[record.result] = (acc[record.result] || 0) + 1;
                    return acc;
                  },
                  {},
                );
                const totalVotes = Object.values(counts).reduce(
                  (sum, n) => sum + n,
                  0,
                );
                const isSecret =
                  event.voteType === VOTING_TYPES.SECRET_BALLOT.key;

                return (
                  <tr
                    key={event.votingEventId}
                    className='border-b border-gray-100 hover:bg-gray-50'
                  >
                    <td className='py-3 px-4 align-top'>
                      <div className='text-gray-900 font-medium'>
                        {event.meeting?.name ?? 'Unknown meeting'}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {event.meeting?.date
                          ? event.meeting.date
                          : new Date(event.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className='py-3 px-4 align-top'>
                      <div className='text-gray-900'>
                        {event.name || 'Untitled vote'}
                      </div>
                    </td>
                    <td className='py-3 px-4 align-top'>
                      <span className='inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700'>
                        {event.voteType}
                      </span>
                    </td>
                    <td className='py-3 px-4 align-top'>
                      {totalVotes === 0 ? (
                        <span className='text-xs text-gray-500'>
                          No votes recorded
                        </span>
                      ) : (
                        <div className='flex flex-wrap gap-2 items-center'>
                          {Object.entries(counts).map(([key, value]) => (
                            <span
                              key={key}
                              className='inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700'
                            >
                              {formatResultLabel(key)}: {value}
                            </span>
                          ))}
                          <span className='inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-500'>
                            Total: {totalVotes}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className='py-3 px-4 align-top'>
                      {isSecret ? (
                        <span
                          className='text-xs text-gray-500'
                          title='Per-voter records are not editable for secret ballot'
                        >
                          —
                        </span>
                      ) : (
                        <button
                          type='button'
                          onClick={() => setEditEventId(event.votingEventId)}
                          className='rounded-lg bg-[#C8102E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A8102E]'
                        >
                          Edit Voting Records
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editEventId && (
        <EditVotingRecordsModal
          votingEventId={editEventId}
          onClose={() => setEditEventId(null)}
          onSaved={() => {
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default OngoingVotingPanel;
