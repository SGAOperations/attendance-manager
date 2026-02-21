import { NextRequest, NextResponse } from 'next/server';
import { AttendanceController } from '../../../../attendance/attendance.controller';

export async function PUT(req: NextRequest) {
  try {
    const { requestId, status } = await req.json();

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Missing requestId or status' },
        { status: 400 }
      );
    }

    const updatedAttendance = await AttendanceController.updateAttendanceStatus(
      requestId,
      status
    );
    return NextResponse.json(updatedAttendance);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update attendance status' },
      { status: 400 }
    );
  }
}
