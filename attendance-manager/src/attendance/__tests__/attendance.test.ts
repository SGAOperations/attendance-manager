import { AttendanceController } from '../attendance.controller';
import { prisma } from '../../lib/prisma';
import dotenv from 'dotenv';
dotenv.config();
jest.setTimeout(20000);

describe('AttendanceController', () => {
  let testUserId: string;
  let testUser2Id: string;
  let testMeetingId: string;
  let testMeeting2Id: string;
  let testAttendanceId: string;
  let testMeeting3Id: string;
  let testUser3Id: string;

  beforeAll(async () => {
    // Test role
    const role = await prisma.role.create({ data: { roleType: 'MEMBER' } });

    // Test user
    const user = await prisma.user.create({
      data: {
        nuid: '001234569',
        password: 'testpassword',
        email: 'testuser@example.com',
        firstName: 'Test',
        lastName: 'User',
        roleId: role.roleId
      }
    });
    testUserId = user.userId;

    const user2 = await prisma.user.create({
      data: {
        nuid: '001234570',
        password: 'testpassword2',
        email: 'testuser2@example.com',
        firstName: 'Test2',
        lastName: 'User2',
        roleId: role.roleId
      }
    });
    testUser2Id = user2.userId;

    // Test meeting
    const meeting = await prisma.meeting.create({
      data: {
        name: 'Test Meeting',
        date: '2025-08-04',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Test notes',
        type: 'REGULAR'
      }
    });
    testMeetingId = meeting.meetingId;

    const meeting2 = await prisma.meeting.create({
      data: {
        name: 'Test Meeting 2',
        date: '2025-10-04',
        startTime: '9:00',
        endTime: '10:00',
        notes: 'Test notes 2',
        type: 'FULL_BODY'
      }
    });
    testMeeting2Id = meeting2.meetingId;

    const meeting3 = await prisma.meeting.create({
      data: {
        name: 'Test Meeting 3',
        date: '2025-10-05',
        startTime: '11:00',
        endTime: '12:00',
        notes: 'Test notes 3',
        type: 'FULL_BODY'
      }
    });
    testMeeting3Id = meeting3.meetingId;

    const user3 = await prisma.user.create({
      data: {
        nuid: '001234571',
        password: 'testpassword3',
        email: 'testuser3@example.com',
        firstName: 'Test3',
        lastName: 'User3',
        roleId: role.roleId
      }
    });
    testUser3Id = user3.userId;

    // Create initial attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: testMeetingId,
        status: 'EXCUSED_ABSENCE'
      }
    });
    testAttendanceId = attendance.attendanceId;

    // Create attendance record for testUser2Id
    await prisma.attendance.create({
      data: {
        userId: testUser2Id,
        meetingId: testMeeting2Id,
        status: 'PRESENT'
      }
    });
  });

  afterAll(async () => {
    await prisma.request.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  it('should get attendance by userId', async () => {
    const attendance = await AttendanceController.getUserAttendance(testUserId);
    expect(attendance).toBeDefined();
    expect(attendance.length).toBe(1);
    expect(attendance[0].userId).toBe(testUserId);

    const attendance2 = await AttendanceController.getUserAttendance(
      testUser2Id
    );
    expect(attendance2).toBeDefined();
    expect(attendance2.length).toBe(1);
    expect(attendance2[0].userId).toBe(testUser2Id);
  });

  it('should get attendance by meetingId', async () => {
    const attendance = await AttendanceController.getMeetingAttendance(
      testMeetingId
    );
    expect(attendance).toBeDefined();
    expect(attendance.length).toBe(1);
    expect(attendance[0].meetingId).toBe(testMeetingId);

    const attendance2 = await AttendanceController.getMeetingAttendance(
      testMeeting2Id
    );
    expect(attendance2).toBeDefined();
    expect(attendance2.length).toBe(1);
    expect(attendance2[0].meetingId).toBe(testMeeting2Id);
  });

  it('should create a new attendance record', async () => {
    const data = {
      userId: testUserId,
      meetingId: testMeeting2Id,
      status: 'PRESENT'
    };
    const newAttendance = await AttendanceController.createAttendance(data);
    expect(newAttendance).toBeDefined();
    expect(newAttendance.status).toBe('PRESENT');

    const attendance2 = await AttendanceController.getMeetingAttendance(
      testMeeting2Id
    );
    expect(attendance2).toBeDefined();
    expect(attendance2.length).toBe(2);
  });

  it('should update attendance status', async () => {
    const updateData = { status: 'UNEXCUSED_ABSENCE' };
    const updated = await AttendanceController.updateAttendance(
      testAttendanceId,
      updateData
    );
    expect(updated).toBeDefined();
    expect(updated.status).toBe('UNEXCUSED_ABSENCE');
  });

  it('should throw error for invalid status update', async () => {
    await expect(
      AttendanceController.updateAttendance(testAttendanceId, {
        status: 'INVALID_STATUS'
      })
    ).rejects.toThrow('Invalid attendance status');
  });

  it('should delete attendance record', async () => {
    // Create record to delete
    const attendance = await prisma.attendance.create({
      data: {
        userId: testUser2Id,
        meetingId: testMeetingId,
        status: 'PRESENT'
      }
    });

    await AttendanceController.deleteAttendance(attendance.attendanceId);

    const deleted = await prisma.attendance.findUnique({
      where: { attendanceId: attendance.attendanceId }
    });
    expect(deleted).toBeNull();
  });

  it('should throw error if requestId does not exist', async () => {
    await expect(
      AttendanceController.updateAttendanceStatus('nonexistent-id', 'PRESENT')
    ).rejects.toThrow('Request or related attendance record not found');
  });

  it('should throw error for invalid attendance status', async () => {
    // Create a new attendance + request pair
    const attendance = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: testMeeting3Id,
        status: 'PRESENT'
      }
    });

    const request = await prisma.request.create({
      data: {
        attendanceId: attendance.attendanceId,
        reason: 'Test invalid status',
        attendanceMode: 'IN_PERSON'
      }
    });

    await expect(
      AttendanceController.updateAttendanceStatus(request.requestId, 'INVALID')
    ).rejects.toThrow('Invalid attendance status');
  });

  it('should update attendance status given a valid requestId', async () => {
    // Create a new attendance + request pair
    const attendance = await prisma.attendance.create({
      data: {
        userId: testUser3Id,
        meetingId: testMeetingId,
        status: 'PRESENT'
      }
    });

    const request = await prisma.request.create({
      data: {
        attendanceId: attendance.attendanceId,
        reason: 'Test update status',
        attendanceMode: 'ONLINE'
      }
    });

    const updatedAttendance = await AttendanceController.updateAttendanceStatus(
      request.requestId,
      'EXCUSED_ABSENCE'
    );

    expect(updatedAttendance).toBeDefined();
    expect(updatedAttendance.status).toBe('EXCUSED_ABSENCE');

    const updated = await prisma.attendance.findUnique({
      where: { attendanceId: attendance.attendanceId }
    });
    expect(updated.status).toBe('EXCUSED_ABSENCE');
  });
});
