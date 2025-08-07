import { NextResponse } from "next/server";
import { UsersService } from "./users.service";

export const UsersController = {
  async listUsers() {
    const users = await UsersService.getAllUsers();
    return NextResponse.json(users);
  },

  async getUser(params: { userId: string }) {
    const user = await UsersService.getUserById(params.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  },

  async createUser(request: Request) {
    const body = await request.json();
    if (
      !body.username ||
      !body.email ||
      !body.firstName ||
      !body.lastName ||
      !body.roleId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    const newUser = await UsersService.createUser(body);
    return NextResponse.json(newUser, { status: 201 });
  },

  async updateUser(request: Request, params: { userId: string }) {
    const updates = await request.json();
    const updatedUser = await UsersService.updateUser(params.userId, updates);
    return NextResponse.json(updatedUser);
  },

  async deleteUser(params: { userId: string }) {
    await UsersService.deleteUser(params.userId);
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 204 },
    );
  },
};
