import { NextResponse } from 'next/server';
import { MeetingController } from '@/meeting/meeting.controller';
import { requireAuth } from '@/utils/api-auth';
import {
  checkCanEditMeetings,
  checkCanManageMeetings,
} from '@/utils/permissions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return MeetingController.getMeeting({ meetingId: id });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth();
  if (error) return error;
  if (!checkCanEditMeetings(user.roleType)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  return MeetingController.updateMeeting(request, { meetingId: id });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth();
  if (error) return error;
  if (!checkCanManageMeetings(user.roleType)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  return MeetingController.deleteMeeting({ meetingId: id });
}
