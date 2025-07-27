import { prisma } from '../lib/prisma';

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
        })
    },

    async createUser(data: {
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        roleId: string;
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
            data: updates
        });
    },

    async deleteUser(userId: string) {
        return prisma.user.delete({
            where: { userId }
        });
    },

    async getRoles() {
        return prisma.role.findMany();
    },

    async createRole(roleType: string) {
        return prisma.role.create({
            data: { roleType }
        });
    },
};