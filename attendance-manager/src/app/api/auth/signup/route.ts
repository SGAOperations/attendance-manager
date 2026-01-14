import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import { UsersService } from '@/users/users.service';
import { RoleType } from '@/generated/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, nuid, roleId } = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !nuid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Get roleId - default to MEMBER if not provided
    let finalRoleId = roleId;
    if (!finalRoleId) {
      finalRoleId = await UsersService.getRoleIdByRoleType(RoleType.MEMBER);
      if (!finalRoleId) {
        return NextResponse.json(
          { error: 'Failed to get default role' },
          { status: 500 }
        );
      }
    }

    // Create user profile in Prisma with Supabase user ID
    const userProfile = await prisma.user.create({
      data: {
        supabaseAuthId: authData.user.id, // Store Supabase auth ID
        email,
        firstName,
        lastName,
        nuid,
        roleId: finalRoleId,
        password: undefined, // Optional - Supabase handles authentication
      },
      include: {
        role: true,
      },
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userProfile 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}