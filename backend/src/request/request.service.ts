import { prisma } from "../lib/prisma";

export const RequestService = {
  // Create a new request
  async createRequest(data: { attendanceId: string; reason: string }) {
    return prisma.request.create({
      data,
    });
  },

  // Get a single request by ID
  async getRequest(requestId: string) {
    return prisma.request.findUnique({
      where: { requestId },
      include: { attendance: true }, 
    });
  },

  // Update request reason
  async updateRequest(requestId: string, data: { reason?: string }) {
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
}
