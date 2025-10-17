import { UsersService } from '../users.service';
import { prisma } from '../../lib/prisma';

jest.setTimeout(20000);

describe('UsersService', () => {
  let testRoleId: string;

  beforeAll(async () => {
    const role = await prisma.role.create({
      data: { roleType: 'MEMBER' },
    });
    testRoleId = role.roleId;

    await UsersService.createUser({
      nuid: '001234567',
      email: 'jdoe@northeastern.edu',
      firstName: 'John',
      lastName: 'Doe',
      roleId: testRoleId,
      password: 'pass',
    });
  });

  afterAll(async () => {
    await prisma.request.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  it('should fetch users by role type', async () => {
    const users = await UsersService.getUsersByRole('MEMBER');
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].role.roleType).toBe('MEMBER');
  });

  it('should create a new user', async () => {
    const newUser = await UsersService.createUser({
      nuid: '001234568',
      email: 'jdoe2@northeastern.edu',
      firstName: 'Jane',
      lastName: 'Doe',
      roleId: testRoleId,
      password: 'pass',
    });

    expect(newUser).toBeDefined();
    expect(newUser.email).toBe('jdoe2@northeastern.edu');
    expect(newUser.nuid).toBe('001234568');
  });

  it('should fetch all users', async () => {
    const users = await UsersService.getAllUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should fetch a user by id', async () => {
    const [user] = await UsersService.getAllUsers();
    const fetchedUser = await UsersService.getUserById(user.userId);
    expect(fetchedUser?.userId).toBe(user.userId);
  });

  it('should update a user', async () => {
    const [user] = await UsersService.getAllUsers();
    const updatedUser = await UsersService.updateUser(user.userId, {
      email: 'updated@northeastern.edu',
      firstName: 'Updated',
      lastName: 'User',
      password: 'password',
    });

    expect(updatedUser.email).toBe('updated@northeastern.edu');
  });

  it('should delete a user', async () => {
    const [user] = await UsersService.getAllUsers();
    await UsersService.deleteUser(user.userId);
    const deletedUser = await UsersService.getUserById(user.userId);
    expect(deletedUser).toBeNull();
  });
});