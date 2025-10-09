import { NextRequest, NextResponse } from 'next/server';
import { AttendanceController } from '../../../../../attendance/attendance.controller';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> },
) {
  try {
    const { meetingId } = await params;
    const attendance = await AttendanceController.getMeetingAttendance(meetingId);
    return NextResponse.json(attendance);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meeting attendance' },
      { status: 400 },
    );
  }
}