import { RequestController } from "../request.controller";
import { prisma } from "../../lib/prisma";

jest.setTimeout(20000);

describe("RequestController", () => {
  let testRoleId: string;
  let testUserId: string;
  let testMeetingId: string;
  let testAttendanceId: string;
  let testRequestId: string;

  beforeAll(async () => {
    // Create a test role
    const role = await prisma.role.create({ data: { roleType: "member" } });
    testRoleId = role.roleId;

    // Create a test user
    const user = await prisma.user.create({
      data: {
        username: "requestuser",
        email: "requestuser@example.com",
        firstName: "Request",
        lastName: "User",
        roleId: testRoleId,
      },
    });
    testUserId = user.userId;

    // Create a test meeting
    const meeting = await prisma.meeting.create({
      data: {
        name: "Request Meeting",
        date: "2025-08-15",
        startTime: "13:00",
        endTime: "14:00",
        notes: "Meeting for request tests",
      },
    });
    testMeetingId = meeting.meetingId;

    // Create a test attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: testMeetingId,
        status: "Pending",
      },
    });
    testAttendanceId = attendance.attendanceId;

    // Create a test request
    const request = await prisma.request.create({
      data: {
        attendanceId: testAttendanceId,
        reason: "Initial test reason",
      },
    });
    testRequestId = request.requestId;
  });

  afterAll(async () => {
    await prisma.request.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  it("should get a request by requestId", async () => {
    const request = await RequestController.getRequest(testRequestId);
    expect(request).toBeDefined();
    if (!request) throw new Error("Request not found");  // <-- guard clause

    expect(request.requestId).toBe(testRequestId);
    expect(request.reason).toBe("Initial test reason");
    expect(request.attendanceId).toBe(testAttendanceId);
    });


  it("should create a new request", async () => {

    const attendance2 = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: testMeetingId,
        status: "Pending",
      },
    });
    const testAttendanceId2 = attendance2.attendanceId;

    const data = {
      attendanceId: testAttendanceId2,
      reason: "New request reason",
    };
    const newRequest = await RequestController.createRequest(data);
    expect(newRequest).toBeDefined();
    expect(newRequest.reason).toBe("New request reason");
    expect(newRequest.attendanceId).toBe(testAttendanceId2);
  });

  it("should update a request's reason", async () => {
    const newReason = "Updated reason";
    const updated = await RequestController.updateRequest(testRequestId, {
      reason: newReason,
    });
    expect(updated).toBeDefined();
    expect(updated.reason).toBe(newReason);
  });

  it("should throw error when updating with invalid reason", async () => {
    await expect(
      RequestController.updateRequest(testRequestId, { reason: " " }),
    ).rejects.toThrow("Invalid request reason");
  });

  it("should throw error when creating with invalid data", async () => {
    await expect(RequestController.createRequest({})).rejects.toThrow(
      "Invalid input data for creating request",
    );
    await expect(
      RequestController.createRequest({ attendanceId: testAttendanceId }),
    ).rejects.toThrow("Invalid input data for creating request");
    await expect(
      RequestController.createRequest({ attendanceId: testAttendanceId, reason: "" }),
    ).rejects.toThrow("Invalid input data for creating request");
  });

  it("should delete a request", async () => {
     const attendance2 = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: testMeetingId,
        status: "Pending",
      },
    });
    const testAttendanceId2 = attendance2.attendanceId;

    // Create a request to delete
    const requestToDelete = await prisma.request.create({
      data: {
        attendanceId: testAttendanceId2,
        reason: "To be deleted",
      },
    });

    await RequestController.deleteRequest(requestToDelete.requestId);

    const deleted = await prisma.request.findUnique({
      where: { requestId: requestToDelete.requestId },
    });
    expect(deleted).toBeNull();
  });
});
