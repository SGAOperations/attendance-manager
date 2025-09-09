import { UsersController } from '@/users/users.controller';
import {
  isUserEmailPass,
  isUserId,
  UserEmailPass,
  UserId,
} from '@/utils/user_utils';

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Returns a response.
 *     @param {Request} request - The incoming request object, expected to contain a JSON body with user data:
 *     @param {string} id - The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Request completed.
 *       404:
 *         description: User not found.
 */

export async function GET(request: Request, { params }: { params: UserId }) {
  return UsersController.getUser({ userId: params.id });
}

// export async function GET(
//   request: Request,
//   { params }: { params: { email: string } }
// ) {
//   return UsersController.getUser({ userId: params.id });
// }

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Returns a response.
 *     @param {Request} request - The incoming request object, expected to contain a JSON body with user data:
 *     @param {string} id - The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Request completed.
 *       404:
 *         description: User not found.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return UsersController.updateUser(request, { userId: params.id });
}

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Returns a response.
 *     @param {Request} request - The incoming request object, expected to contain a JSON body with user data:
 *     @param {string} id - The ID of the user to retrieve
 *     responses:
 *       204:
 *         description: Request completed.
 *       404:
 *         description: User not found.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return UsersController.deleteUser({ userId: params.id });
}
