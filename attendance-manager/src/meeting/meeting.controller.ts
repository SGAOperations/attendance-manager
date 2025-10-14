import { NextResponse } from 'next/server';
import { MeetingService } from './meeting.service';
import { MeetingType } from '@/generated/prisma';

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
    
    // Validate required fields
    if (
      !body.name ||
      !body.startTime ||
      !body.date ||
      !body.endTime ||
      !body.notes ||
      !body.meetingType
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate type enum
    if (!Object.values(MeetingType).includes(body.meetingType)) {
      return NextResponse.json(
        { error: 'Invalid meeting type. Must be FULL_BODY or REGULAR' },
        { status: 400 }
      );
    }

    const newMeeting = await MeetingService.createMeeting(body);
    return NextResponse.json(newMeeting, { status: 201 });
  },

  async updateMeeting(request: Request, params: { meetingId: string }) {
    const updates = await request.json();
    
    // Validate type enum if provided
    if (updates.meetingType && !Object.values(MeetingType).includes(updates.meetingType)) {
      return NextResponse.json(
        { error: 'Invalid meeting type. Must be FULL_BODY or REGULAR' },
        { status: 400 }
      );
    }

    const updatedMeeting = await MeetingService.updateMeeting(
      params.meetingId,
      updates
    );
    return NextResponse.json(updatedMeeting);
  },

  async deleteMeeting(params: { meetingId: string }) {
    await MeetingService.deleteMeeting(params.meetingId);
    return NextResponse.json(
      { message: 'Meeting deleted successfully' },
      { status: 204 }
    );
  }
};