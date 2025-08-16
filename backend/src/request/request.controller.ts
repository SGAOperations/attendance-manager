import { RequestService } from "./request.service"

export const RequestController = {
  async getRequest(requestId: string) {
    if (!requestId || typeof requestId !== "string") {
      throw new Error("Invalid or missing requestId");
    }
    return RequestService.getRequest(requestId);
  },

  async createRequest(data: any) {
    if (
      !data ||
      typeof data.attendanceId !== "string" ||
      typeof data.reason !== "string" ||
      !data.reason.trim()
    ) {
      throw new Error("Invalid input data for creating request");
    }
    return RequestService.createRequest({
      attendanceId: data.attendanceId,
      reason: data.reason.trim(),
    });
  },

  async updateRequest(requestId: string, data: any) {
    if (!requestId || typeof requestId !== "string") {
      throw new Error("Invalid or missing requestId");
    }

    if (
      data.reason &&
      (typeof data.reason !== "string" || !data.reason.trim())
    ) {
      throw new Error("Invalid request reason");
    }

    const updateData: Partial<{ reason: string }> = {};
    if (data.reason) {
      updateData.reason = data.reason.trim();
    }

    return RequestService.updateRequest(requestId, updateData);
  },

  async deleteRequest(requestId: string) {
    if (!requestId || typeof requestId !== "string") {
      throw new Error("Invalid or missing requestId");
    }
    return RequestService.deleteRequest(requestId);
  },
};
