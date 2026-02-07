import { prisma } from '../lib/prisma';

export const VotingService = {
  async getAllVotingEvents() {
    return await prisma.votingEvent.findMany({
      include: {
        meeting: true,
        votingRecords: true,
      },
    });
  },

  async getVotingEventById(votingEventId: string) {
    return await prisma.votingEvent.findUnique({
      where: { votingEventId },
      include: {
        meeting: true,
        votingRecords: true,
      },
    });
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
    updatedBy?: string;
  }) {
    return await prisma.votingEvent.create({
      data: {
        meetingId: data.meetingId,
        name: data.name,
        voteType: data.voteType,
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
};
