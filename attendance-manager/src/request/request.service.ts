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
      data,
    });
  },

  // Get a single request by ID
  async getRequest(requestId: string) {
    return prisma.request.findUnique({
      where: { requestId },
      include: { 
        attendance: {
          include: {
            meeting: true,
            user: true,
          }
        }
      }, 
    });
  },

  // Get all requests with meeting and user info
  async getAllRequests() {
    return prisma.request.findMany({
      include: {
        attendance: {
          include: {
            meeting: true,
            user: true,
          }
        }
      },
      orderBy: {
        attendance: {
          meeting: {
            date: 'desc'
          }
        }
      }
    });
  },

  // Update request
  async updateRequest(requestId: string, data: { 
    reason?: string;
    attendanceMode?: AttendanceMode;
    timeAdjustment?: TimeAdjustment | null;
  }) {
    return prisma.request.update({
      where: { requestId },
      data,
    });
  },

  // Delete request
  async deleteRequest(requestId: string) {
    return prisma.request.delete({
      where: { requestId },
    });
  },
};