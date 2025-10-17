import { prisma } from '../lib/prisma';
import { MeetingType } from '../generated/prisma';

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
    return await prisma.meeting.findMany({
      include: { 
        attendance: {
          include: {
            user: true
          }
        } 
      }
    });
  },

  async getAllMeetingByDate() {
    const meetings = await prisma.meeting.findMany();
    return groupBy(meetings, (meeting) => meeting.date);
  },

  async getMeetingById(meetingId: string) {
    return prisma.meeting.findUnique({
      where: { meetingId },
    });
  },

  async createMeeting(
    meetingData: {
      name: string;
      startTime: string;
      date: string;
      endTime: string;
      notes: string;
      type: MeetingType;
    },
    attendeeIds: string[]
  ) {
    // Create meeting - only pass meeting fields to Prisma
    const meeting = await prisma.meeting.create({ 
      data: {
        name: meetingData.name,
        startTime: meetingData.startTime,
        date: meetingData.date,
        endTime: meetingData.endTime,
        notes: meetingData.notes,
        type: meetingData.type,
      }
    });
  
    // Create attendance records for all selected attendees
    if (attendeeIds.length > 0) {
      await prisma.attendance.createMany({
        data: attendeeIds.map(userId => ({
          userId,
          meetingId: meeting.meetingId,
          status: 'UNEXCUSED_ABSENCE' as const,
        })),
      });
    }
  
    return meeting;
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
      type: MeetingType;
    }>
  ) {
    return prisma.meeting.update({
      where: { meetingId },
      data: updates,
    });
  },

  async deleteMeeting(meetingId: string) {
    // Delete attendance records first to avoid foreign key constraint
    await prisma.attendance.deleteMany({
      where: { meetingId },
    });
    
    return prisma.meeting.delete({
      where: { meetingId },
    });
  }
};