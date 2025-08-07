import { prisma } from "../lib/prisma";

export const MeetingService = {
  async getAllMeeting() {
    return prisma.meeting.findMany();
  },

  async getMeetingById(meetingId: string) {
    return prisma.meeting.findUnique({
      where: { meetingId },
    });
  },

  async createMeeting(data: {
    name: string;
    meetingId: string;
    startTime: string;
    date: string;
    endTime: string;
    notes: string;
  }) {
    return prisma.meeting.create({ data });
  },

  async updateMeeting(
    meetingId: string,
    updates: Partial<{
      name: string;
      meetingId: string;
      startTime: string;
      endTime: string;
      notes: string;
      date: string;
    }>,
  ) {
    return prisma.meeting.update({
      where: { meetingId },
      data: updates,
    });
  },

  async deleteMeeting(meetingId: string) {
    return prisma.meeting.delete({
      where: { meetingId },
    });
  },
};
