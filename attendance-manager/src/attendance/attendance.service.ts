import { prisma } from '../lib/prisma';

export const AttendanceService = {
  // Get all attendance records for a user
  async getUserAttendance(userId: string) {
    return prisma.attendance.findMany({
      where: { userId },
      include: {
        meeting: true,
        request: true,
      },
    });
  },

  // Get all attendance records for a meeting
  async getMeetingAttendance(meetingId: string) {
    return prisma.attendance.findMany({
      where: { meetingId },
      include: {
        user: true,
        request: true,
      },
    });
  },

  // Create an attendance record
  async createAttendance(data: {
    userId: string;
    meetingId: string;
    status: string;
  }) {
    return prisma.attendance.create({ data });
  },

  // Update attendance status
  async updateAttendance(attendanceId: string, data: { status?: string }) {
    return prisma.attendance.update({
      where: { attendanceId: attendanceId },
      data: {
        ...data,
      },
    });
  },

  // Delete an attendance record
  async deleteAttendance(attendanceId: string) {
    return prisma.attendance.delete({
      where: { attendanceId },
    });
  },
};
