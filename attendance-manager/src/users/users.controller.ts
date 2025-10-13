import { NextResponse } from 'next/server';
import { UsersService } from './users.service';
import { AttendanceService } from '@/attendance/attendance.service';

export const UsersController = {
  async listUsers() {
    const users = await UsersService.getAllUsers();
    return NextResponse.json(users);
  },

  async getUser(params: { userId: string }) {
    const user = await UsersService.getUserById(params.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
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
      // Don't need to send a confirmed password back to the user
      const { password, roleId, ...userData } = user;
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
      !body.password ||
      !body.email ||
      !body.firstName ||
      !body.lastName ||
      !body.roleId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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
      { message: 'User deleted successfully' },
      { status: 204 }
    );
  },

  async updateAttendence(request: Request) {
    const body = await request.json();
    if (!body.email || !body.attendenceId || body.attendance === undefined) {
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
    if (!validStatuses.includes(body.attendance)) {
      return NextResponse.json(
        { error: 'Invalid attendance value' },
        { status: 400 }
      );
    }
    const user = await UsersService.getUserByEmail(body.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await AttendanceService.updateAttendanceForUser(
      user.userId,
      body.attendenceId,
      body.attendance
    );
    return NextResponse.json({
      success: true,
      message: 'Attendance updated successfully'
    });
  }
};
