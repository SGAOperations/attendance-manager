import { prisma } from '../../lib/prisma';
import { AttendanceController } from '@/attendance/attendance.controller';
import { cleanupTestData } from '../../utils/test-helpers';
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

  beforeEach(async () => {
    await cleanupTestData();

    // Test role
    const memberRole = await prisma.role.create({
      data: { roleType: 'MEMBER' }
    });
    const adminRole = await prisma.role.create({
      data: { roleType: 'EBOARD' }
    });

    // CREATE USERS
    const user = await prisma.user.create({
      data: {
        nuid: '001234569',
        email: 'user@northeastern.edu',
        firstName: 'Test',
        lastName: 'User',
        roleId: memberRole.roleId
      }
    });
    testUserId = user.userId;

    const user2 = await prisma.user.create({
      data: {
        nuid: '001234570',
        email: 'testuser2@example.edu',
        firstName: 'Test2',
        lastName: 'User2',
        roleId: memberRole.roleId
      }
    });
    testUser2Id = user2.userId;

    const user3 = await prisma.user.create({
      data: {
        nuid: '001234571',
        email: 'admin@northeastern.edu',
        firstName: 'Test3',
        lastName: 'User3',
        roleId: adminRole.roleId
      }
    });
    testUser3Id = user3.userId;

    // CREATE MEETINGS
    // Archived/previous meeting
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

    // Future meetings
    function getTomorrowEST() {
      const now = new Date();

      // Convert now to EST components
      const estFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const { year, month, day } = Object.fromEntries(
        estFormatter.formatToParts(now).map(p => [p.type, p.value])
      );

      // Create a JS date that represents EST midnight
      const estMidnight = new Date(`${year}-${month}-${day}T00:00:00-05:00`);
      estMidnight.setDate(estMidnight.getDate() + 1);

      return estMidnight.toISOString().slice(0, 10); // YYYY-MM-DD
    }
    const meeting2 = await prisma.meeting.create({
      data: {
        name: 'Test Meeting 2',
        date: getTomorrowEST(),
        startTime: '9:00',
        endTime: '10:00',
        notes: 'Test notes 2',
        type: 'REGULAR'
      }
    });
    testMeeting2Id = meeting2.meetingId;

    const meeting3 = await prisma.meeting.create({
      data: {
        name: 'Test Meeting 3',
        date: getTomorrowEST(),
        startTime: '11:00',
        endTime: '12:00',
        notes: 'Test notes 3',
        type: 'FULL_BODY'
      }
    });
    testMeeting3Id = meeting3.meetingId;

    // CREATE ATTENDANCE RECORDS
    // This will not have a request
    const attendance = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: testMeetingId,
        status: 'EXCUSED_ABSENCE',
        request: {}
      }
    });
    // This request will be approved
    const attendance1 = await prisma.attendance.create({
      data: {
        userId: testUser3Id,
        meetingId: testMeetingId,
        status: 'EXCUSED_ABSENCE',
        request: {}
      }
    });
    const testAttendanceId2 = attendance1.attendanceId;

    // This request will be unapproved
    const attendance2 = await prisma.attendance.create({
      data: {
        userId: testUser2Id,
        meetingId: testMeetingId,
        status: 'UNEXCUSED_ABSENCE',
        request: {}
      }
    });
    const testAttendanceId3 = attendance2.attendanceId;

    // This request will be pending
    const attendance3 = await prisma.attendance.create({
      data: {
        userId: testUser2Id,
        meetingId: testMeeting2Id,
        status: 'PENDING',
        request: {}
      }
    });
    const testAttendanceId4 = attendance3.attendanceId;

    // CREATE REQUESTS
    await prisma.request.create({
      data: {
        attendanceId: testAttendanceId3,
        reason: 'Initial test reason',
        attendanceMode: 'ONLINE',
        timeAdjustment: 'ARRIVING_LATE'
      }
    });
    await prisma.request.create({
      data: {
        attendanceId: testAttendanceId2,
        reason: 'Initial test reason',
        attendanceMode: 'ONLINE',
        timeAdjustment: 'ARRIVING_LATE'
      }
    });
     await prisma.request.create({
      data: {
        attendanceId: testAttendanceId4,
        reason: 'Initial test reason',
        attendanceMode: 'ONLINE',
        timeAdjustment: 'ARRIVING_LATE'
      }
    });
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
    expect(attendance2.length).toBe(2);
    expect(attendance2[0].userId).toBe(testUser2Id);
  });
});
