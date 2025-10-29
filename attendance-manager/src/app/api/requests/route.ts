import { NextResponse } from 'next/server';
import { RequestController } from '@/request/request.controller';

// POST create new request
export async function POST(req: Request) {
  try {
    const { attendanceId, reason } = await req.json();

    if (!attendanceId || !reason) {
      return NextResponse.json(
        { error: 'attendanceId and reason are required' },
        { status: 400 }
      );
    }

    const newRequest = await RequestController.createRequest({
      attendanceId,
      reason
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create request';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return RequestController.listRequest();
}
