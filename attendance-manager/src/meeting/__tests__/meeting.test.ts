import { MeetingService } from '../meeting.service';
import { prisma } from '../../lib/prisma';
import { MeetingType } from '../../generated/prisma';

jest.setTimeout(20000);

describe('MeetingServices', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new meeting', async () => {
    const newMeeting = await MeetingService.createMeeting(
      {
        name: 'test2',
        startTime: '8:12:56 PM',
        date: '7/30/2025',
        endTime: '8:13:15 PM',
        notes: 'notes',
        type: MeetingType.REGULAR,
      },
      [] // Empty attendeeIds array
    );

    expect(newMeeting).toBeDefined();
    expect(newMeeting.name).toBe('test2');
    expect(newMeeting.meetingId).toBeDefined();
    expect(newMeeting.startTime).toBe('8:12:56 PM');
    expect(newMeeting.date).toBe('7/30/2025');
    expect(newMeeting.endTime).toBe('8:13:15 PM');
    expect(newMeeting.notes).toBe('notes');
    expect(newMeeting.type).toBe(MeetingType.REGULAR);
  });

  it('should fetch all meetings', async () => {
    const meetings = await MeetingService.getAllMeeting();
    expect(Array.isArray(meetings)).toBe(true);
  });

  it('should fetch a meetings by id', async () => {
    const [newMeeting] = await MeetingService.getAllMeeting();
    const fetchedMeeting = await MeetingService.getMeetingById(
      newMeeting.meetingId,
    );
    expect(fetchedMeeting?.meetingId).toBe(newMeeting.meetingId);
  });

  it('should update a meeting', async () => {
    const [newMeeting] = await MeetingService.getAllMeeting();
    const updatedMeeting = await MeetingService.updateMeeting(
      newMeeting.meetingId,
      {
        name: 'test',
        startTime: '8:07:56 PM',
        date: '7/29/2025',
        endTime: '8:08:15 PM',
        notes: 'notes',
        type: MeetingType.FULL_BODY,
      },
    );

    expect(updatedMeeting.name).toBe('test');
    expect(updatedMeeting.meetingId).toBe(newMeeting.meetingId);
    expect(updatedMeeting.startTime).toBe('8:07:56 PM');
    expect(updatedMeeting.date).toBe('7/29/2025');
    expect(updatedMeeting.endTime).toBe('8:08:15 PM');
    expect(updatedMeeting.notes).toBe('notes');
    expect(updatedMeeting.type).toBe(MeetingType.FULL_BODY);
  });

  it('should delete a meeting', async () => {
    const [newMeeting] = await MeetingService.getAllMeeting();
    await MeetingService.deleteMeeting(newMeeting.meetingId);
    const deletedMeeting = await MeetingService.getMeetingById(
      newMeeting.meetingId,
    );
    expect(deletedMeeting).toBeNull();
  });
});