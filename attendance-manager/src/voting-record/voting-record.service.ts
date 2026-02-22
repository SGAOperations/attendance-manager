import { prisma } from '../lib/prisma';

export const VotingRecordService = {
  async getAllVotingRecords() {
    return await prisma.votingRecord.findMany({
      include: {
        votingEvent: {
          include: {
            meeting: true,
          },
        },
      },
    });
  },

  async getVotingRecordsByVotingEvent(votingEventId: string) {
    return await prisma.votingRecord.findMany({
      where: { votingEventId },
      include: {
        votingEvent: {
          include: {
            meeting: true,
          },
        },
      },
    });
  },

  async createVotingRecord(data: {
    votingEventId: string;
    userId: string;
    result: string;
    updatedBy?: string;
  }) {
    return await prisma.votingRecord.create({
      data: {
        votingEventId: data.votingEventId,
        userId: data.userId,
        result: data.result,
        updatedBy: data.updatedBy,
      },
      include: {
        votingEvent: {
          include: {
            meeting: true,
          },
        },
      },
    });
  },
  async deleteVotingRecord(votingRecordId: string) {
    return prisma.votingRecord.delete({
      where: { votingRecordId }
    });
  },
};
