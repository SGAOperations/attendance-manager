import { NextResponse } from 'next/server';
import { UsersService } from './users.service';
import { RoleType } from '@/generated/prisma';

export const UsersController = {
  async listUsers() {
    const users = await UsersService.getAllUsers();
    return NextResponse.json(users);
  },

  async listRoles() {
    const roles = await UsersService.getAllRoles();
    return NextResponse.json(roles);
  },

  async listUsersSantizied() {
    const users = await UsersService.getAllUsers();
    const sanitizedUsers = users.map(user => {
      const { email: _email, password: _password, ...safeUser } = user;
      return safeUser;
    });
    return NextResponse.json(sanitizedUsers);
  },

  async getUser(params: { userId: string }) {
    const user = await UsersService.getUserById(params.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  },

  async getRoleId(params: { role: RoleType }) {
    const roleId = await UsersService.getRoleIdByRoleType(params.role);
    if (!roleId) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    return roleId;
  },

  async checkUserExists(params: { userEmail: string; userPassword: string }) {
    const user = await UsersService.getUserByEmail(params.userEmail);
    console.log(user);
    if (!user) {
      return NextResponse.json({
        exists: false,
        user: null
      });
    }
    if (user.password === params.userPassword) {
      const { password: _password, roleId: _roleId, ...userData } = user;
      const res = NextResponse.json({
        exists: true,
        user: userData
      });
      res.headers.append('Access-Control-Allow-Credentials', 'true');
      res.headers.append('Access-Control-Allow-Origin', '*');
      res.headers.append(
        'Access-Control-Allow-Methods',
        'GET,DELETE,PATCH,POST,PUT'
      );
      res.headers.append(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
      );
      console.log('Res:', res);
      return res;
    } else {
      return NextResponse.json(
        { error: 'Incorrect Password' },
        { status: 400 }
      );
    }
  },

  async createUser(request: Request) {
    const body = await request.json();
    if (
      !body.nuid || // Added validation
      !body.password ||
      !body.email ||
      !body.firstName ||
      !body.lastName
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    const roleId = await UsersService.getRoleIdByRoleType(RoleType.MEMBER);
    body.roleId = roleId;
    const newUser = await UsersService.createUser(body);
    return NextResponse.json(newUser, { status: 201 });
  },

  async createRole(request: Request) {
    const body = await request.json();
    const newRole = await UsersService.createRole(body);
    return NextResponse.json(newRole, { status: 201 });
  },

  async updateUser(request: Request, params: { userId: string }) {
    const updates = await request.json();
    const updatedUser = await UsersService.updateUser(params.userId, updates);
    return NextResponse.json(updatedUser);
  },

  async deleteUser(params: { userId: string }) {
    await UsersService.deleteUser(params.userId);
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 204 }
    );
  }
};
