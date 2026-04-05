import { VotingEventWithRelations } from '@/types';
import { votingTypes } from '@/utils/consts';

const voteTypeLabels: Record<string, string> = {
  [votingTypes.rollCall]: 'Roll Call',
  [votingTypes.secretBallot]: 'Secret Ballot',
  [votingTypes.unanimousConsent]: 'Unanimous Consent',
  [votingTypes.placard]: 'Placard',
};

export function getVoteTypeLabel(voteType: string): string {
  return voteTypeLabels[voteType] ?? voteType;
}

export function getVoteCounts(
  event: VotingEventWithRelations,
): Record<string, number> {
  if (event.voteType === votingTypes.secretBallot) {
    return event.resultCounts ?? {};
  }
  return (event.votingRecords ?? [])
    .filter((r) => !r.deletedAt)
    .reduce<Record<string, number>>((acc, r) => {
      acc[r.result] = (acc[r.result] || 0) + 1;
      return acc;
    }, {});
}
