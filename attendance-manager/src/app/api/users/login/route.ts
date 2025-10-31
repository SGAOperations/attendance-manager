import { UsersController } from '@/users/users.controller';

export async function POST(
  request: Request
) {
  const { email, password } = await request.json();
  return UsersController.loginUser({ email, password });
}
