import { NextResponse } from 'next/server';
import { UsersService } from './users.service';
import { RoleType } from '../generated/prisma';
import { AttendanceService } from '../attendance/attendance.service';

export const UsersController = {
  async listUsers() {
    const users = await UsersService.getAllUsers();
    return NextResponse.json(users);
  },

  async listRoles() {
    const roles = await UsersService.getAllRoles();
    return NextResponse.json(roles);
  },

  async getUserByNUID(params: { nuid: string }) {
    const roles = await UsersService.getUserByNUID(params.nuid);
    return NextResponse.json(roles);
  },

  async getUserByEmail(params: { email: string }) {
    const user = await UsersService.getUserByEmail(params.email);
    return NextResponse.json(user);
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
  },

  async validateNuid(params: { nuid: string; firstName: string; lastName: string }) {
    try {
      // Validate required fields
      if (!params.nuid || !params.firstName || !params.lastName) {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'Missing required fields: nuid, firstName, lastName' 
          },
          { status: 400 }
        );
      }

      // Validate NUID format (exactly 9 digits)
      const nuidRegex = /^\d{9}$/;
      if (!nuidRegex.test(params.nuid)) {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'Invalid NUID format. Must be exactly 9 digits.' 
          },
          { status: 400 }
        );
      }

      // Check if user exists with this NUID
      const user = await UsersService.getUserByNuid(params.nuid);
      
      if (!user) {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'No user found with this NUID' 
          },
          { status: 400 }
        );
      }

      // Validate that names match
      const namesMatch = 
        user.firstName.toLowerCase() === params.firstName.toLowerCase() &&
        user.lastName.toLowerCase() === params.lastName.toLowerCase();

      if (!namesMatch) {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'NUID does not match the provided name' 
          },
          { status: 400 }
        );
      }

      // Return success response
      return NextResponse.json({
        valid: true,
        message: 'NUID format is valid and matches the provided name',
        user: {
          userId: user.userId,
          nuid: user.nuid,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (error) {
      console.error('NUID validation error:', error);
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Internal server error' 
        },
        { status: 500 }
      );
    }
  },

  async updateAttendence(request: Request) {
    const body = await request.json();
    console.log('body', body);
    if (!body.userId || !body.meetingId || body.status === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    const validStatuses = [
      'PENDING',
      'PRESENT',
      'PENDING_ABSENCE',
      'EXCUSED_ABSENCE',
      'UNEXCUSED_ABSENCE'
    ];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid attendance value' },
        { status: 400 }
      );
    }

    await AttendanceService.upsertAttendance(
      body.userId,
      body.meetingId,
      body.status
    );
    return NextResponse.json({
      success: true,
      message: 'Attendance updated successfully'
    });
  }
};
