import { NextRequest, NextResponse } from "next/server";
import { AttendanceController } from "../../../../attendance/attendance.controller"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { attendanceId: string } }
) {
  try {
    const data = await req.json();
    const updatedAttendance = await AttendanceController.updateAttendance(
      params.attendanceId,
      data
    );
    return NextResponse.json(updatedAttendance);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update attendance" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { attendanceId: string } }
) {
  try {
    await AttendanceController.deleteAttendance(params.attendanceId);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete attendance" },
      { status: 400 }
    );
  }
}
