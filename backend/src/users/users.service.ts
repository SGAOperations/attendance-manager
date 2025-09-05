import { prisma } from "../lib/prisma";

export const UsersService = {
  async getAllUsers() {
    return prisma.user.findMany({
      include: { role: true },
    });
  },

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { userId },
      include: { role: true },
    });
  },

  async getUserByEmail(userEmail: string) {
    console.log(userEmail);
    return prisma.user.findUnique({
      where: { email: userEmail },
      include: { role: true },
    });
  },

  async createUser(data: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    password: string;
  }) {
    return prisma.user.create({ data });
  },

  async updateUser(
    userId: string,
    updates: Partial<{
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      roleId: string;
    }>
  ) {
    return prisma.user.update({
      where: { userId },
      data: updates,
    });
  },

  async deleteUser(userId: string) {
    return prisma.user.delete({
      where: { userId },
    });
  },

  async getRoles() {
    return prisma.role.findMany();
  },

  async getRolesByRoleId(roleId: string) {
    return prisma.role.findUnique({
      where: { roleId: roleId },
    });
  },

  async getUsersByRole(roleId: string) {
    return prisma.user.findMany({
      where: {
        role: {
          roleType: roleId,
        },
      },
      include: {
        role: true,
      },
    });
  },
};
