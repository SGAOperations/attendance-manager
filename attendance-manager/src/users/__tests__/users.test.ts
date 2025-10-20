import { UsersService } from '../users.service';
import { UsersController } from '../users.controller';
import { prisma } from '../../lib/prisma';
import { NextResponse } from 'next/server';

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

describe('UsersController.validateNuid', () => {
  let testRoleId: string;

  beforeAll(async () => {
    const role = await prisma.role.create({
      data: { roleType: 'MEMBER' },
    });
    testRoleId = role.roleId;

    // Create a test user for validation
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
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  it('should validate correct NUID and name combination', async () => {
    const response = await UsersController.validateNuid({
      nuid: '001234567',
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(response).toBeInstanceOf(NextResponse);
    const data = await response.json();
    expect(data.valid).toBe(true);
    expect(data.message).toBe('NUID format is valid and matches the provided name');
    expect(data.user).toBeDefined();
    expect(data.user.nuid).toBe('001234567');
    expect(data.user.firstName).toBe('John');
    expect(data.user.lastName).toBe('Doe');
    expect(data.user.email).toBe('jdoe@northeastern.edu');
  });

  it('should reject missing required fields', async () => {
    const response = await UsersController.validateNuid({
      nuid: '',
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(response).toBeInstanceOf(NextResponse);
    const data = await response.json();
    expect(data.valid).toBe(false);
    expect(data.error).toBe('Missing required fields: nuid, firstName, lastName');
  });

  it('should reject invalid NUID format', async () => {
    const response = await UsersController.validateNuid({
      nuid: '123', // too short
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(response).toBeInstanceOf(NextResponse);
    const data = await response.json();
    expect(data.valid).toBe(false);
    expect(data.error).toBe('Invalid NUID format. Must be exactly 9 digits.');
  });

  it('should reject non-existent NUID', async () => {
    const response = await UsersController.validateNuid({
      nuid: '999999999',
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(response).toBeInstanceOf(NextResponse);
    const data = await response.json();
    expect(data.valid).toBe(false);
    expect(data.error).toBe('No user found with this NUID');
  });

  it('should reject mismatched name', async () => {
    const response = await UsersController.validateNuid({
      nuid: '001234567',
      firstName: 'Jane', // wrong name
      lastName: 'Smith'
    });

    expect(response).toBeInstanceOf(NextResponse);
    const data = await response.json();
    expect(data.valid).toBe(false);
    expect(data.error).toBe('NUID does not match the provided name');
  });
});