import { NextResponse } from 'next/server';
import { MeetingService } from './meeting.service';

export const MeetingController = {
  async listMeetings() {
    const meeting = await MeetingService.getAllMeeting();
    return NextResponse.json(meeting);
  },

  async listMeetingsByDate() {
    const meeting = await MeetingService.getAllMeetingByDate();
    return NextResponse.json(meeting);
  },

  async getMeeting(params: { meetingId: string }) {
    const meeting = await MeetingService.getMeetingById(params.meetingId);
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }
    return NextResponse.json(meeting);
  },

  async createMeeting(request: Request) {
    const body = await request.json();
    console.log('Body', body);
    if (
      !body.name ||
      !body.startTime ||
      !body.date ||
      !body.endTime ||
      !body.notes
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    // body.date = new Date().toLocaleString();
    const newMeeting = await MeetingService.createMeeting(body);
    return NextResponse.json(newMeeting, { status: 201 });
  },

  async updateMeeting(request: Request, params: { meetingId: string }) {
    const updates = await request.json();
    const updatedMeeting = await MeetingService.updateMeeting(
      params.meetingId,
      updates
    );
    return NextResponse.json(updatedMeeting);
  },

  async deleteMeeting(params: { meetingId: string }) {
    await MeetingService.deleteMeeting(params.meetingId);
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 204 }
    );
  },
};
