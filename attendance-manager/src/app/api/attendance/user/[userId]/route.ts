import { NextRequest, NextResponse } from 'next/server';
import { AttendanceController } from '../../../../../attendance/attendance.controller';

/**
 * @swagger
 * /api/attendance/user/{userId}:
 *   get:
 *     summary: Returns a users attendance record.
 *     responses:
 *       200:
 *         description: A JSON array of user objects.
 *       400:
 *         descrption: Failed to fetch user attendance
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const attendance = await AttendanceController.getUserAttendance(
      params.userId,
    );
    return NextResponse.json(attendance);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user attendance' },
      { status: 400 },
    );
  }
}
