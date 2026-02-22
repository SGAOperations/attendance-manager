import { MeetingController } from '@/meeting/meeting.controller';
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns all users associated with the meeting
 *     responses:
 *       200:
 *         description: A JSON array of array of meeting objects.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return MeetingController.getUsers({ meetingId: id });
}