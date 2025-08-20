import { prisma } from '../lib/prisma';

export const RolesService = {
  async createRole(data: { roleType: string }) {
    return prisma.role.create({ data });
  },

  async getAllRoles() {
    return prisma.role.findMany({});
  }
};
