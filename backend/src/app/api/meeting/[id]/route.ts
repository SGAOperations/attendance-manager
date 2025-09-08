import { MeetingController } from "@/meeting/meeting.controller";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return MeetingController.getMeeting({ meetingId: params.id });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return MeetingController.updateMeeting(request, { meetingId: params.id });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return MeetingController.deleteMeeting({ meetingId: params.id });
}
