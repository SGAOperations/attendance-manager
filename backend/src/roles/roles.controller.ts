import { NextResponse } from 'next/server';
import { RolesService } from './roles.service';
export const RolesController = {
  async listRoles() {
      const users = await RolesService.getAllRoles();
      return NextResponse.json(users);
    },
  
  async createRole(request: Request) {
    const body = await request.json();
    if (!body.roleType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    const newUser = await RolesService.createRole(body);
    return NextResponse.json(newUser, { status: 201 });
  }

};
