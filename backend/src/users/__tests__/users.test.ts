import { UsersService } from "../users.service";
import { prisma } from "../../lib/prisma";

jest.setTimeout(20000);

describe("UsersService", () => {
  let roleId: string;

  beforeAll(async () => {
    try {
      const role = await UsersService.createRole("member");
      roleId = role.roleId;
    } catch (err) {
      console.error("❌ Failed in beforeAll:", err);
      throw err;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a new user", async () => {
    const newUser = await UsersService.createUser({
      username: "jdoe",
      email: "jdoe@northeastern.edu",
      firstName: "John",
      lastName: "Doe",
      roleId: roleId,
    });

    expect(newUser).toBeDefined();
    expect(newUser.username).toBe("jdoe");
    expect(newUser.email).toBe("jdoe@northeastern.edu");
    expect(newUser.firstName).toBe("John");
    expect(newUser.lastName).toBe("Doe");
  });

  it("should fetch all users", async () => {
    const users = await UsersService.getAllUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  it("should fetch a user by id", async () => {
    const [newUser] = await UsersService.getAllUsers();
    const fetchedUser = await UsersService.getUserById(newUser.userId);
    expect(fetchedUser?.userId).toBe(newUser.userId);
  });

  it("should update a user", async () => {
    const [newUser] = await UsersService.getAllUsers();
    const updatedUser = await UsersService.updateUser(newUser.userId, {
      username: "jdoe2",
      email: "jdoe2@northeastern.edu",
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(updatedUser.username).toBe("jdoe2");
    expect(updatedUser.email).toBe("jdoe2@northeastern.edu");
    expect(updatedUser.firstName).toBe("Jane");
    expect(updatedUser.lastName).toBe("Doe");
  });

  it("should delete a user", async () => {
    const [newUser] = await UsersService.getAllUsers();
    await UsersService.deleteUser(newUser.userId);
    const deletedUser = await UsersService.getUserById(newUser.userId);
    expect(deletedUser).toBeNull();
  });
});