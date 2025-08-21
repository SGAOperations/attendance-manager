import { MeetingController } from '@/meeting/meeting.controller';

/**
 * @swagger
 * /api/meeting/{meetingId}:
 *   get:
 *     summary: Returns a single meeting by ID.
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single meeting object.
 *       404:
 *         description: Meeting not found.
 */
export async function GET(request: Request, { params }: { params: { meetingId: string } }) {
  return MeetingController.getMeeting(params);
}

export async function PUT(request: Request, { params }: { params: { meetingId: string } }) {
  return MeetingController.updateMeeting(request, params);
}

export async function DELETE(request: Request, { params }: { params: { meetingId: string } }) {
  return MeetingController.deleteMeeting(params);
}