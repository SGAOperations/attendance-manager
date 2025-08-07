import { UsersController } from "@/users/users.controller";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  return UsersController.getUser({ userId: params.id });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  return UsersController.updateUser(request, { userId: params.id });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  return UsersController.deleteUser({ userId: params.id });
}
