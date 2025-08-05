import { AttendanceController } from "../attendance.controller";
import { prisma } from "../../lib/prisma";

jest.setTimeout(20000);

describe("AttendanceController", () => {
  let testUserId: string;
  let testMeetingId: string;
  let testAttendanceId: string;

  beforeAll(async () => {
    // Create a test role
    const role = await prisma.role.create({ data: { roleType: "member" } });

    // Create test user
    const user = await prisma.user.create({
      data: {
        username: "testuser",
        email: "testuser@example.com",
        firstName: "Test",
        lastName: "User",
        roleId: role.roleId,
      },
    });
    testUserId = user.userId;

    // Create test meeting
    const meeting = await prisma.meeting.create({
      data: {
        name: "Test Meeting",
        date: "2025-08-04",
        startTime: "10:00",
        endTime: "11:00",
        notes: "Test notes",
      },
    });
    testMeetingId = meeting.meetingId;

    // Create initial attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: testMeetingId,
        status: "Pending",
      },
    });
    testAttendanceId = attendance.attendanceId;
  });

  afterAll(async () => {
    await prisma.attendance.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  it("should get attendance by userId", async () => {
    const attendance = await AttendanceController.getUserAttendance(testUserId);
    expect(attendance).toBeDefined();
    expect(attendance.length).toBeGreaterThan(0);
    expect(attendance[0].userId).toBe(testUserId);
  });

  it("should get attendance by meetingId", async () => {
    const attendance = await AttendanceController.getMeetingAttendance(
      testMeetingId
    );
    expect(attendance).toBeDefined();
    expect(attendance.length).toBeGreaterThan(0);
    expect(attendance[0].meetingId).toBe(testMeetingId);
  });

  it("should create a new attendance record", async () => {
    const data = {
      userId: testUserId,
      meetingId: testMeetingId,
      status: "Present",
    };
    const newAttendance = await AttendanceController.createAttendance(data);
    expect(newAttendance).toBeDefined();
    expect(newAttendance.status).toBe("Present");
  });

  it("should update attendance status", async () => {
    const updateData = { status: "Excused absence" };
    const updated = await AttendanceController.updateAttendance(
      testAttendanceId,
      updateData
    );
    expect(updated).toBeDefined();
    expect(updated.status).toBe("Excused absence");
  });

  it("should throw error for invalid status update", async () => {
    await expect(
      AttendanceController.updateAttendance(testAttendanceId, {
        status: "InvalidStatus",
      })
    ).rejects.toThrow("Invalid attendance status");
  });

  it("should delete attendance record", async () => {
    // Create record to delete
    const attendance = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: testMeetingId,
        status: "Pending",
      },
    });

    await AttendanceController.deleteAttendance(attendance.attendanceId);

    const deleted = await prisma.attendance.findUnique({
      where: { attendanceId: attendance.attendanceId },
    });
    expect(deleted).toBeNull();
  });
});
