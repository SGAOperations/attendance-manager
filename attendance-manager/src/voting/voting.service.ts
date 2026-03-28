import { prisma } from '../lib/prisma';
import { VOTING_TYPES } from '../utils/consts';

const SECRET_BALLOT = VOTING_TYPES.SECRET_BALLOT.key;

/** Canonical Yes vs No for passage (Roll Call / standard labels). */
export function computeVotePassedFromCounts(
  counts: Record<string, number>,
  options: string[]
): boolean | null {
  const yes =
    (counts['YES'] ?? 0) +
    (counts['Yes'] ?? 0);
  const no =
    (counts['NO'] ?? 0) +
    (counts['No'] ?? 0);
  if (yes > 0 || no > 0) {
    return yes > no;
  }

  if (options.length >= 2) {
    const a = options[0];
    const b = options[1];
    const ca = counts[a] ?? 0;
    const cb = counts[b] ?? 0;
    if (ca + cb > 0) {
      return ca > cb;
    }
  }

  return null;
}

function buildResultCountsFromRecords(records: any[]): Record<string, number> {
  const resultCounts: Record<string, number> = {};
  for (const r of records) {
    if (r?.deletedAt) continue;
    const key = r?.result;
    if (typeof key !== 'string') continue;
    resultCounts[key] = (resultCounts[key] ?? 0) + 1;
  }
  return resultCounts;
}

/**
 * Secret ballot: expose only aggregate counts + passage + notes — never per-voter records.
 */
function redactSecretBallotForResults<T extends {
  voteType: string;
  votingRecords?: any[];
  options?: string[];
  resultCounts?: Record<string, number>;
}>(event: T): T {
  if (event.voteType !== SECRET_BALLOT) return event;

  const records = event.votingRecords || [];
  const hasRecords = records.some((r: any) => r && !r.deletedAt);
  if (!hasRecords && event.resultCounts) {
    return event;
  }

  const resultCounts = hasRecords
    ? buildResultCountsFromRecords(records)
    : (event.resultCounts ?? {});
  const options = Array.isArray(event.options) ? event.options : [];
  const votePassed = computeVotePassedFromCounts(resultCounts, options);

  const { votingRecords: _omit, ...rest } = event as any;
  return {
    ...rest,
    resultCounts,
    votePassed,
  } as T;
}

export function formatVotingEventForApi<T extends { voteType: string; votingRecords?: any[] }>(
  event: T | null
): T | null {
  if (!event) return event;
  return redactSecretBallotForResults(event as T);
}

async function attachVoterNamesToVotingEvent<T extends { voteType: string; votingRecords?: any[] }>(
  event: T | null
): Promise<T | null> {
  if (!event) return event;
  if (event.voteType !== 'ROLL_CALL') return event;
  if (!event.votingRecords || event.votingRecords.length === 0) return event;

  const userIds = Array.from(
    new Set(
      event.votingRecords
        .map((r: any) => r?.userId)
        .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)
    )
  );

  if (userIds.length === 0) return event;

  const users = await prisma.user.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, firstName: true, lastName: true },
  });

  const userById = new Map(users.map(u => [u.userId, u]));

  return {
    ...event,
    votingRecords: event.votingRecords.map((record: any) => {
      const user = typeof record?.userId === 'string' ? userById.get(record.userId) : undefined;
      return {
        ...record,
        user: user
          ? { firstName: user.firstName, lastName: user.lastName }
          : null,
      };
    }),
  };
}

export const VotingService = {
  async getAllVotingEvents() {
    const events = await prisma.votingEvent.findMany({
      include: {
        meeting: true,
        votingRecords: true,
      },
    });
    const withNames = await Promise.all(
      events.map(e => attachVoterNamesToVotingEvent(e))
    );
    return withNames.map(e => formatVotingEventForApi(e)!);
  },

  async getVotingEventById(votingEventId: string) {
    const event = await prisma.votingEvent.findUnique({
      where: { votingEventId },
      include: {
        meeting: true,
        votingRecords: true,
      },
    });
    const withNames = await attachVoterNamesToVotingEvent(event);
    return formatVotingEventForApi(withNames);
  },

  async getVotingEventsByVoteType(voteType: string) {
    const events = await prisma.votingEvent.findMany({
      where: { voteType },
      include: {
        meeting: true,
        votingRecords: true,
      },
    });
    const withNames = await Promise.all(
      events.map(e => attachVoterNamesToVotingEvent(e))
    );
    return withNames.map(e => formatVotingEventForApi(e)!);
  },

  async createVotingEvent(data: {
    meetingId: string;
    name: string;
    voteType: string;
    notes?: string;
    options?: string[];
    updatedBy?: string;
  }) {
    return await prisma.votingEvent.create({
      data: {
        meetingId: data.meetingId,
        name: data.name,
        voteType: data.voteType,
        notes: data.notes,
        options: data.options,
        updatedBy: data.updatedBy,
      },
      include: {
        meeting: true,
        votingRecords: true,
      },
    });
  },

  async updateVotingEvent(
    votingEventId: string,
    updates: Partial<{
      meetingId: string;
      name: string;
      voteType: string;
      notes: string | null;
      options: string[];
      updatedBy: string;
      deletedAt: Date | null;
    }>
  ) {
    return await prisma.votingEvent.update({
      where: { votingEventId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      include: {
        meeting: true,
        votingRecords: true,
      },
    });
  },

  async deleteVotingEvent(votingEventId: string) {
    return prisma.votingEvent.delete({
      where: { votingEventId }
    });
  },
};
