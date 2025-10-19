import { RoleType } from '@/generated/prisma';
import { prisma } from '../lib/prisma';

export const UsersService = {
  async getAllUsers() {
    return prisma.user.findMany({
      include: { role: true }
    });
  },

  async getAllRoles() {
    return prisma.role.findMany({
      include: {}
    });
  },

  async getUserByNUID(nuid: string) {
    return prisma.user.findUnique({
      where: { nuid },
      include: { role: true }
    });
  },

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { userId },
      include: { role: true }
    });
  },

  async getUserByEmail(userEmail: string) {
    console.log(userEmail);
    return prisma.user.findUnique({
      where: { email: userEmail },
      include: { role: true }
    });
  },

  async getUserByNuid(nuid: string) {
    return prisma.user.findUnique({
      where: { nuid },
      include: { role: true }
    });
  },

  async createUser(data: {
    nuid: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
  }) {
    return prisma.user.create({ data });
  },

  async createRole(data: { roleType: RoleType }) {
    return prisma.role.create({ data });
  },

  async getRoleIdByRoleType(roleType: RoleType) {
    const role = await prisma.role.findFirst({
      where: { roleType },
      select: { roleId: true }
    });
    return role?.roleId;
  },

  async updateUser(
    userId: string,
    updates: Partial<{
      nuid: string;
      password: string;
      email: string;
      firstName: string;
      lastName: string;
      roleId: string;
    }>
  ) {
    return prisma.user.update({
      where: { userId },
      data: updates
    });
  },

  async deleteUser(userId: string) {
    // Delete attendance records first to avoid foreign key constraint
    await prisma.attendance.deleteMany({
      where: { userId },
    });
    
    return prisma.user.delete({
      where: { userId }
    });
  },

  async getRoles() {
    return prisma.role.findMany();
  },

  async getRolesByRoleId(roleId: string) {
    return prisma.role.findUnique({
      where: { roleId: roleId }
    });
  },

  async getUsersByRole(roleId: string) {
    return prisma.user.findMany({
      where: {
        role: {
          roleType: roleId as RoleType
        }
      },
      include: {
        role: true
      }
    });
  }
};
