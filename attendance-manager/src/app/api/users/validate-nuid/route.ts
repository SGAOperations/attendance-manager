import { NextResponse } from 'next/server';
import { UsersService } from '@/users/users.service';

/**
 * @swagger
 * /api/users/validate-nuid:
 *   get:
 *     summary: Validates NUID format and matches it with provided name.
 *     responses:
 *       200:
 *         description: Validation result with user data if valid.
 *       400:
 *         description: Invalid request or validation failed.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nuid = searchParams.get('nuid');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');

    if (!nuid || !firstName || !lastName) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Missing required fields: nuid, firstName, lastName' 
        },
        { status: 400 }
      );
    }

    const nuidRegex = /^\d{9}$/;
    if (!nuidRegex.test(nuid)) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Invalid NUID format. Must be exactly 9 digits.' 
        },
        { status: 400 }
      );
    }

    const user = await UsersService.getUserByNuid(nuid);
    
    if (!user) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'No user found with this NUID' 
        },
        { status: 400 }
      );
    }

    const namesMatch = 
      user.firstName.toLowerCase() === firstName.toLowerCase() &&
      user.lastName.toLowerCase() === lastName.toLowerCase();

    if (!namesMatch) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'NUID does not match the provided name' 
        },
        { status: 400 }
      );
    }

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
}
