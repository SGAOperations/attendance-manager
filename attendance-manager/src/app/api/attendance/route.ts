import { NextRequest, NextResponse } from 'next/server';
import { AttendanceController } from '../../../attendance/attendance.controller';

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Posts a single user with the given request.
 *     @param {Request} req - The incoming request object, expected to contain a JSON body with user data:
 *     responses:
 *       201:
 *         description: A JSON array of attendance objects.
 *       400:
 *         description: Missing required fields.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const attendance = await AttendanceController.createAttendance(data);
    return NextResponse.json(attendance, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create attendance' },
      { status: 400 },
    );
  }
}
