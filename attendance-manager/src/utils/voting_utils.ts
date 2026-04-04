import { VotingEventWithRelations } from '@/types';
import { VOTING_TYPES } from '@/utils/consts';

export function getVoteCounts(
  event: VotingEventWithRelations,
): Record<string, number> {
  if (event.voteType === VOTING_TYPES.SECRET_BALLOT.key) {
    return event.resultCounts ?? {};
  }
  return (event.votingRecords ?? [])
    .filter((r) => !r.deletedAt)
    .reduce<Record<string, number>>((acc, r) => {
      acc[r.result] = (acc[r.result] || 0) + 1;
      return acc;
    }, {});
}
