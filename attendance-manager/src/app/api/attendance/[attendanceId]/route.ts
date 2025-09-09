import { NextRequest, NextResponse } from 'next/server';
import { AttendanceController } from '../../../../attendance/attendance.controller';

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: A response code.
 *     @param {Request} request - The incoming request object, expected to contain a JSON body with attendance data:
 *     @param {string} id - The ID of the attendance to retrieve
 *     responses:
 *       204:
 *         description: Request complete.
 *       404:
 *         description: Attendance not found.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { attendanceId: string } },
) {
  try {
    const data = await req.json();
    const updatedAttendance = await AttendanceController.updateAttendance(
      params.attendanceId,
      data,
    );
    return NextResponse.json(updatedAttendance);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update attendance' },
      { status: 400 },
    );
  }
}

/**
 * @swagger
 * /api/attendance/{attendanceId}:
 *   delete:
 *     summary: A response code.
 *     @param {Request} request - The incoming request object, expected to contain a JSON body with attendance data:
 *     @param {string} attendanceId - The ID of the attendance to retrieve
 *     responses:
 *       204:
 *         description: Request complete.
 *       404:
 *         description: Attendance not found.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { attendanceId: string } },
) {
  try {
    await AttendanceController.deleteAttendance(params.attendanceId);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete attendance' },
      { status: 400 },
    );
  }
}
