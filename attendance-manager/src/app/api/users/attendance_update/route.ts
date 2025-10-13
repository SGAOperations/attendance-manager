import { UsersController } from '@/users/users.controller';

export async function POST(request: Request) {
  return UsersController.updateAttendence(request);
}
