import { UsersController } from "@/users/users.controller";

export async function GET() {
    return UsersController.listUsers();
}

export async function POST(request: Request) {
    return UsersController.createUser(request);
}