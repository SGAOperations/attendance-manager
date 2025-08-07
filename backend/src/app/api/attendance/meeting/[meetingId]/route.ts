import { NextRequest, NextResponse } from "next/server";
import { AttendanceController } from "../../../../../attendance/attendance.controller";

/**
 * @swagger
 * /api/attendance/meeting/{meetingId}:
 *   get:
 *     summary: Returns a meetings attednace.
 *     responses:
 *       200:
 *         description: A JSON array of a meeting attedance.
 *       400:
 *         description: Failed to fetch
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { meetingId: string } },
) {
  try {
    const attendance = await AttendanceController.getMeetingAttendance(
      params.meetingId,
    );
    return NextResponse.json(attendance);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch meeting attendance" },
      { status: 400 },
    );
  }
}
