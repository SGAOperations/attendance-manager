import { VotingEventWithRelations } from '@/types';

export function getVoteCounts(
  event: VotingEventWithRelations,
): Record<string, number> {
  if (event.voteType === 'SECRET_BALLOT') {
    return event.resultCounts ?? {};
  }
  return (event.votingRecords ?? [])
    .filter((r) => !r.deletedAt)
    .reduce<Record<string, number>>((acc, r) => {
      acc[r.result] = (acc[r.result] || 0) + 1;
      return acc;
    }, {});
}
