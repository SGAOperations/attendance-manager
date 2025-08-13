import { prisma } from "../lib/prisma";

function groupBy<T, K extends string | number | symbol>(
  items: T[],
  keyGetter: (item: T) => K
): Record<K, T[]> {
  return items.reduce((result, item) => {
    const key = keyGetter(item);
    (result[key] ||= []).push(item);
    return result;
  }, {} as Record<K, T[]>);
}

export const MeetingService = {
  async getAllMeeting() {
    const meetings = await prisma.meeting.findMany();
    return groupBy(meetings, (meeting) => meeting.date);
  },

  async getMeetingById(meetingId: string) {
    return prisma.meeting.findUnique({
      where: { meetingId },
    });
  },

  async createMeeting(data: {
    name: string;
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
    }>
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
