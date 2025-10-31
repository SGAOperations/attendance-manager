import { prisma } from '../lib/prisma';
import { AttendanceStatus } from '../generated/prisma';

function convertToAttendanceStatus(status: string): AttendanceStatus {
  switch (status) {
    case 'PRESENT':
      return AttendanceStatus.PRESENT;
    case 'EXCUSED_ABSENCE':
      return AttendanceStatus.EXCUSED_ABSENCE;
    case 'UNEXCUSED_ABSENCE':
      return AttendanceStatus.UNEXCUSED_ABSENCE;
    default:
      throw new Error(`Invalid attendance status: ${status}`);
  }
}

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
    status: AttendanceStatus;
  }) {
    return prisma.attendance.create({ data });
  },

  // Update attendance status
  async updateAttendance(
    attendanceId: string,
    data: { status?: AttendanceStatus }
  ) {
    return prisma.attendance.update({
      where: { attendanceId: attendanceId },
      data: {
        ...data
      }
    });
  },

  async upsertAttendance(
    userId: string,
    meetingId: string,
    status: AttendanceStatus
  ) {
    return prisma.attendance.upsert({
      where: {
        userId_meetingId: { userId, meetingId }
      },
      update: {
        status
      },
      create: {
        userId,
        meetingId,
        status
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
      throw new Error('Invalid attendance status: ' + status);
    }
    const attendanceRecord = await prisma.attendance.update({
      where: { attendanceId, userId },
      data: { status: convertToAttendanceStatus(status) }
    });
    if (!attendanceRecord) {
      throw new Error('Attendance record not found for this user');
    }
  },

  // Update attendance status based on request
  async updateAttendanceStatus(requestId: string, status: string) {
    if (!isAttendanceStatus(status)) {
      throw new Error('Invalid attendance status: ' + status);
    }

    const request = await prisma.request.findUnique({
      where: { requestId },
      include: { attendance: true }
    });

    if (!request || !request.attendance) {
      throw new Error('Request or related attendance record not found');
    }

    const attendanceRecord = await prisma.attendance.update({
      where: { attendanceId: request.attendance.attendanceId },
      data: { status: convertToAttendanceStatus(status) }
    });

    return attendanceRecord;
  }
};
