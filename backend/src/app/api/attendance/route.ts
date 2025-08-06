import { NextRequest, NextResponse } from "next/server";
import { AttendanceController } from "../../../attendance/attendance.controller"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const attendance = await AttendanceController.createAttendance(data);
    return NextResponse.json(attendance, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create attendance" },
      { status: 400 }
    );
  }
}
