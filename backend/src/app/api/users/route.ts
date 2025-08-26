import { UsersController } from "@/users/users.controller";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns a list of users.
 *     responses:
 *       200:
 *         description: A JSON array of user objects.
 */
export async function GET(req: Request) {
  let split_var = req.url.split("?");
  if (split_var.length == 1) {
    return UsersController.listUsers();
  } else if (split_var.length == 2) {
    let password, email;
    let params = split_var[1].split("&");
    for (const param of params) {
      let [key, value] = param.split("=");
      if (!(key == "email" || key == "password")) {
        return NextResponse.json(
          { error: "Only email or password fields" },
          { status: 400 }
        );
      }
      if (key == "password") password = value;
      if (key == "email") email = value;
    }
    if (!password || !email)
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    console.log("The");
    return UsersController.checkUserExists({
      userEmail: email,
      userPassword: password,
    });
  }
  return NextResponse.json({ error: "Too many parameters" }, { status: 400 });
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Posts a single user with the given request.
 *     @param {Request} request - The incoming request object, expected to contain a JSON body with user data:
 *     responses:
 *       201:
 *         description: A JSON array of user objects.
 *       400:
 *         description: Missing required fields.
 */
export async function POST(request: Request) {
  return UsersController.createUser(request);
}
