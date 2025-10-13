import { AttendanceStatus } from '@/generated/prisma';
import { prisma } from '../lib/prisma';

function isAttendanceStatus(status: string): status is AttendanceStatus {
  return Object.values(AttendanceStatus).includes(status as AttendanceStatus);
}

export const AttendanceService = {
  // Get all attendance records for a user
  async getUserAttendance(userId: string) {
    return prisma.attendance.findMany({
      where: { userId },
      include: {
        meeting: true,
        request: true
      }
    });
  },

  // Get all attendance records for a meeting
  async getMeetingAttendance(meetingId: string) {
    return prisma.attendance.findMany({
      where: { meetingId },
      include: {
        user: true,
        request: true
      }
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
        ...data
      }
    });
  },

  // Delete an attendance record
  async deleteAttendance(attendanceId: string) {
    return prisma.attendance.delete({
      where: { attendanceId }
    });
  },

  async updateAttendanceForUser(
    userId: string,
    attendanceId: string,
    status: string
  ) {
    if (!isAttendanceStatus(status)) {
      throw new Error(`Invalid attendance status: ${status}`);
    }
    const attendanceRecord = await prisma.attendance.update({
      where: { attendanceId, userId },
      data: { status }
    });
    if (!attendanceRecord) {
      throw new Error('Attendance record not found for this user');
    }
  }
};
