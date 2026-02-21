import { AttendanceService } from './attendance.service';

const allowedStatuses = [
  'PRESENT',
  'EXCUSED_ABSENCE',
  'UNEXCUSED_ABSENCE',
  'PENDING',
] as const;

type AttendanceStatus = typeof allowedStatuses[number];

function isValidStatus(status: any): status is AttendanceStatus {
  return (
    typeof status === 'string' &&
    allowedStatuses.includes(status as AttendanceStatus)
  );
}

export const AttendanceController = {
  async getRequestsByUser(userId: string) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid or missing userId');
    }

    const attendances = await AttendanceService.getUserAttendance(userId);
    const filtered_attendances = attendances
      .filter(a => a.request)
      .map(a => ({
        ...a.request,
        AttendanceStatus: a.status,
        attendance: {
          attendanceId: a.attendanceId,
          meeting: a.meeting,
          status: a.status
        }
      }));
    return filtered_attendances;
  },

  async getUserAttendance(userId: string) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid or missing userId');
    }
    return AttendanceService.getUserAttendance(userId);
  },

  async getMeetingAttendance(meetingId: string) {
    if (!meetingId || typeof meetingId !== 'string') {
      throw new Error('Invalid or missing meetingId');
    }
    return AttendanceService.getMeetingAttendance(meetingId);
  },

  async createAttendance(data: any) {
    if (
      !data ||
      typeof data.userId !== 'string' ||
      typeof data.meetingId !== 'string' ||
      !isValidStatus(data.status)
    ) {
      throw new Error('Invalid input data for creating attendance');
    }
    return AttendanceService.createAttendance({
      userId: data.userId,
      meetingId: data.meetingId,
      status: data.status
    });
  },

  async updateAttendance(attendanceId: string, data: any) {
    if (!attendanceId || typeof attendanceId !== 'string') {
      throw new Error('Invalid or missing attendanceId');
    }

    if (data.status && !isValidStatus(data.status)) {
      throw new Error('Invalid attendance status');
    }

    const updateData: Partial<{ status: AttendanceStatus }> = {};
    if (data.status) {
      updateData.status = data.status as AttendanceStatus;
    }

    return AttendanceService.updateAttendance(attendanceId, updateData);
  },

  async deleteAttendance(attendanceId: string) {
    if (!attendanceId || typeof attendanceId !== 'string') {
      throw new Error('Invalid or missing attendanceId');
    }
    return AttendanceService.deleteAttendance(attendanceId);
  },

  async getRemainingUnexcusedAbsences(userId: string) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid or missing userId');
    }
    return AttendanceService.getRemainingUnexcusedAbsences(userId);
  },

  async updateAttendanceStatus(requestId: string, status: string) {
    if (!requestId || typeof requestId !== 'string') {
      throw new Error('Invalid or missing requestId');
    }

    if (!isValidStatus(status)) {
      throw new Error('Invalid attendance status');
    }

    return AttendanceService.updateAttendanceStatus(requestId, status);
  }
};
