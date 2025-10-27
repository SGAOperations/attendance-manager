import { RequestController } from '../request.controller';
import { prisma } from '../../lib/prisma';

jest.setTimeout(20000);

interface Attendance {
  attendanceId: string;
  userId: string;
  meetingId: string;
  status: 'EXCUSED_ABSENCE' | 'PRESENT' | 'ABSENT';
}

interface AttendanceRequest {
  requestId: string;
  attendanceId: string;
  reason: string;
  attendanceMode: 'ONLINE' | 'IN_PERSON';
  timeAdjustment: 'ARRIVING_LATE' | 'LEAVING_EARLY';
  attendance: Attendance;
}

describe('RequestController', () => {
  let testRoleId: string;
  let testUserId: string;
  let secondTestUserId: string;
  let testMeetingId: string;
  let testAttendanceId: string;
  let secondTestAtendanceId: string;
  let testRequestId: string;
  let secondTestRequestId: string;

  beforeAll(async () => {
    // Create a test role
    const role = await prisma.role.create({ data: { roleType: 'MEMBER' } });
    testRoleId = role.roleId;

    // Create a test user
    const user = await prisma.user.create({
      data: {
        nuid: '001234567',
        password: 'testpassword',
        email: 'requestuser@example.com',
        firstName: 'Request',
        lastName: 'User',
        roleId: testRoleId
      }
    });
    testUserId = user.userId;

    // Create a test user
    const secondUser = await prisma.user.create({
      data: {
        nuid: '001234568',
        password: 'testpassword',
        email: 'otherrequestuser@example.com',
        firstName: 'Other',
        lastName: 'Request',
        roleId: testRoleId
      }
    });
    secondTestUserId = secondUser.userId;

    // Create a test meeting
    const meeting = await prisma.meeting.create({
      data: {
        name: 'Request Meeting',
        date: '2025-08-15',
        startTime: '13:00',
        endTime: '14:00',
        notes: 'Meeting for request tests',
        type: 'REGULAR'
      }
    });
    testMeetingId = meeting.meetingId;

    // Create a test attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: testMeetingId,
        status: 'EXCUSED_ABSENCE'
      }
    });
    testAttendanceId = attendance.attendanceId;

    // Create a second test attendance record
    const secondAttendance = await prisma.attendance.create({
      data: {
        userId: secondTestUserId,
        meetingId: testMeetingId,
        status: 'EXCUSED_ABSENCE'
      }
    });
    secondTestAtendanceId = secondAttendance.attendanceId;

    // Create a test request
    const request = await prisma.request.create({
      data: {
        attendanceId: testAttendanceId,
        reason: 'Initial test reason',
        attendanceMode: 'ONLINE',
        timeAdjustment: 'ARRIVING_LATE'
      }
    });
    testRequestId = request.requestId;

    // Create a second test request
    const secondRequest = await prisma.request.create({
      data: {
        attendanceId: secondTestAtendanceId,
        reason: 'Initial test reason',
        attendanceMode: 'IN_PERSON',
        timeAdjustment: 'LEAVING_EARLY'
      }
    });
    secondTestRequestId = secondRequest.requestId;
  });

  afterAll(async () => {
    await prisma.request.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  it('should get a request by requestId', async () => {
    const request = await RequestController.getRequest(testRequestId);
    expect(request).toBeDefined();
    if (!request) throw new Error('Request not found');

    expect(request.requestId).toBe(testRequestId);
    expect(request.reason).toBe('Initial test reason');
    expect(request.attendanceId).toBe(testAttendanceId);
    expect(request.attendanceMode).toBe('ONLINE');
    expect(request.timeAdjustment).toBe('ARRIVING_LATE');
  });

  it('should get all requests', async () => {
    const response = await RequestController.listRequest();
    const requests = await response.json();
    expect(requests).toBeDefined();
    if (!requests) throw new Error('Request not found');
    expect(requests).toHaveLength(2);
    requests.forEach((req: AttendanceRequest) => {
    expect(req.attendance.attendanceId).toBe(req.attendanceId);
  });
  });

  it('should create a new request', async () => {
    const newMeeting = await prisma.meeting.create({
      data: {
        name: 'Request Meeting 2',
        date: '2025-09-01',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Additional meeting for requests',
        type: 'REGULAR'
      }
    });
    const attendance2 = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: newMeeting.meetingId,
        status: 'EXCUSED_ABSENCE'
      }
    });
    const testAttendanceId2 = attendance2.attendanceId;

    const data = {
      attendanceId: testAttendanceId2,
      reason: 'New request reason',
      attendanceMode: 'IN_PERSON',
      timeAdjustment: 'LEAVING_EARLY'
    };
    const newRequest = await RequestController.createRequest(data);
    expect(newRequest).toBeDefined();
    expect(newRequest.reason).toBe('New request reason');
    expect(newRequest.attendanceId).toBe(testAttendanceId2);
    expect(newRequest.attendanceMode).toBe('IN_PERSON');
    expect(newRequest.timeAdjustment).toBe('LEAVING_EARLY');
  });

  it('should update a requests reason', async () => {
    const newReason = 'Updated reason';
    const updated = await RequestController.updateRequest(testRequestId, {
      reason: newReason
    });
    expect(updated).toBeDefined();
    expect(updated.reason).toBe(newReason);
  });

  it('should throw error when updating with invalid reason', async () => {
    await expect(
      RequestController.updateRequest(testRequestId, { reason: ' ' })
    ).rejects.toThrow('Invalid request reason');
  });

  it('should throw error when creating with invalid data', async () => {
    await expect(RequestController.createRequest({})).rejects.toThrow(
      'Invalid input data for creating request'
    );
    await expect(
      RequestController.createRequest({ attendanceId: testAttendanceId })
    ).rejects.toThrow('Invalid input data for creating request');
    await expect(
      RequestController.createRequest({
        attendanceId: testAttendanceId,
        reason: ''
      })
    ).rejects.toThrow('Invalid input data for creating request');
    await expect(
      RequestController.createRequest({
        attendanceId: testAttendanceId,
        reason: 'Valid reason',
        attendanceMode: 'INVALID'
      })
    ).rejects.toThrow('Invalid input data for creating request');
  });

  it('should delete a request', async () => {
    const newMeeting = await prisma.meeting.create({
      data: {
        name: 'Request Meeting 3',
        date: '2025-09-02',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Additional meeting for requests',
        type: 'REGULAR'
      }
    });
    const attendance2 = await prisma.attendance.create({
      data: {
        userId: testUserId,
        meetingId: newMeeting.meetingId,
        status: 'EXCUSED_ABSENCE'
      }
    });
    const testAttendanceId2 = attendance2.attendanceId;

    // Create a request to delete
    const requestToDelete = await prisma.request.create({
      data: {
        attendanceId: testAttendanceId2,
        reason: 'To be deleted',
        attendanceMode: 'ONLINE'
      }
    });

    await RequestController.deleteRequest(requestToDelete.requestId);

    const deleted = await prisma.request.findUnique({
      where: { requestId: requestToDelete.requestId }
    });
    expect(deleted).toBeNull();
  });
});
