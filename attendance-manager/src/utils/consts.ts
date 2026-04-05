export const votingTypes = {
  rollCall: 'ROLL_CALL',
  secretBallot: 'SECRET_BALLOT',
  unanimousConsent: 'UNANIMOUS_CONSENT',
  placard: 'PLACARD',
} as const;

export type VoteType = (typeof votingTypes)[keyof typeof votingTypes];

export const yesNoOptions = {
  yes: 'Yes',
  no: 'No',
  abstain: 'Abstain',
};
