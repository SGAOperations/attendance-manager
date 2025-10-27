import { prisma } from '../lib/prisma';
import { AttendanceMode, TimeAdjustment } from '../generated/prisma';

export const RequestService = {
  // Create a new request
  async createRequest(data: {
    attendanceId: string;
    reason: string;
    attendanceMode: AttendanceMode;
    timeAdjustment?: TimeAdjustment;
  }) {
    return prisma.request.create({
      data
    });
  },

  // Get a single request by ID
  async getRequest(requestId: string) {
    return prisma.request.findUnique({
      where: { requestId },
      include: { attendance: true }
    });
  },

  // Get all requests
  async getAllRequest() {
    return await prisma.request.findMany({
      include: {
        attendance: {
          include: {
            user: true
          }
        }
      }
    });
  },

  // Update request
  async updateRequest(
    requestId: string,
    data: {
      reason?: string;
      attendanceMode?: AttendanceMode;
      timeAdjustment?: TimeAdjustment | null;
    }
  ) {
    return prisma.request.update({
      where: { requestId },
      data
    });
  },

  // Delete request
  async deleteRequest(requestId: string) {
    return prisma.request.delete({
      where: { requestId }
    });
  }
};
