import { UsersController } from '@/users/users.controller';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string, password: string }> }
) {
  const { email, password } = await params;
  return UsersController.loginUser({ email, password });
}
