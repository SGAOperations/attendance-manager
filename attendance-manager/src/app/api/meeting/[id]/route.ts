import { MeetingController } from '@/meeting/meeting.controller';

/**
 * @swagger
 * /api/meeting/{id}:
 *   get:
 *     summary: Returns a single meeting by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single meeting object.
 *       404:
 *         description: Meeting not found.
 */
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