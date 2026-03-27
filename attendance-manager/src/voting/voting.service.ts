import { prisma } from '../lib/prisma';

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
    return await Promise.all(events.map(e => attachVoterNamesToVotingEvent(e)));
  },

  async getVotingEventById(votingEventId: string) {
    const event = await prisma.votingEvent.findUnique({
      where: { votingEventId },
      include: {
        meeting: true,
        votingRecords: true,
      },
    });
    return await attachVoterNamesToVotingEvent(event);
  },

  async getVotingEventsByVoteType(voteType: string) {
    return await prisma.votingEvent.findMany({
      where: { voteType },
      include: {
        meeting: true,
        votingRecords: true,
      },
    });
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
