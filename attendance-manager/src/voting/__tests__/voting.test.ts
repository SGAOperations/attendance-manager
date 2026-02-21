import { VotingService } from '../voting.service';
import { VotingController } from '../voting.controller';
import { prisma } from '../../lib/prisma';
import { MeetingService } from '@/meeting/meeting.service';

jest.setTimeout(20000);

describe('VotingService', () => {
  let testMeetingId: string;
  let testMeeting2Id: string;
  let testVotingEventId: string;
  beforeAll(async () => {
    // Create test meetings
    const meeting = await prisma.meeting.create({
      data: {
        name: 'Test Meeting',
        date: '2025-08-04',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Test notes',
        type: 'REGULAR'
      }
    });
    testMeetingId = meeting.meetingId;

    const meeting2 = await prisma.meeting.create({
      data: {
        name: 'Test Meeting 2',
        date: '2025-10-04',
        startTime: '9:00',
        endTime: '10:00',
        notes: 'Test notes 2',
        type: 'FULL_BODY'
      }
    });
    testMeeting2Id = meeting2.meetingId;

    // Create a test voting event for tests that need it
    const votingEvent = await VotingService.createVotingEvent({
      meetingId: testMeetingId,
      name: 'Test Voting Event',
      voteType: 'YES_NO',
      updatedBy: 'test-user'
    });
    testVotingEventId = votingEvent.votingEventId;
  });

  afterAll(async () => {
    await prisma.votingEvent.deleteMany({
      where: {
        meetingId: {
          in: [testMeetingId, testMeeting2Id]
        }
      }
    });
    await MeetingService.deleteMeeting(testMeetingId);
    await MeetingService.deleteMeeting(testMeeting2Id);
  });

  it('should create a new voting event', async () => {
    const newVotingEvent = await VotingService.createVotingEvent({
      meetingId: testMeetingId,
      name: 'New Test Voting Event',
      voteType: 'APPROVAL',
      updatedBy: 'test-user-2'
    });

    expect(newVotingEvent).toBeDefined();
    expect(newVotingEvent.name).toBe('New Test Voting Event');
    expect(newVotingEvent.votingEventId).toBeDefined();
    expect(newVotingEvent.meetingId).toBe(testMeetingId);
    expect(newVotingEvent.voteType).toBe('APPROVAL');
    expect(newVotingEvent.updatedBy).toBe('test-user-2');
    expect(newVotingEvent.createdAt).toBeDefined();
    expect(newVotingEvent.updatedAt).toBeDefined();
  });

  it('should fetch all voting events', async () => {
    const votingEvents = await VotingService.getAllVotingEvents();
    expect(Array.isArray(votingEvents)).toBe(true);
    expect(votingEvents.length).toBeGreaterThan(0);
  });

  it('should fetch a voting event by id', async () => {
    const fetchedVotingEvent = await VotingService.getVotingEventById(
      testVotingEventId
    );
    expect(fetchedVotingEvent?.votingEventId).toBe(testVotingEventId);
    expect(fetchedVotingEvent?.name).toBe('Test Voting Event');
  });

  it('should fetch voting events by vote type', async () => {
    // Create another voting event with same voteType
    await VotingService.createVotingEvent({
      meetingId: testMeeting2Id,
      name: 'Another YES_NO Event',
      voteType: 'YES_NO'
    });

    const votingEvents = await VotingService.getVotingEventsByVoteType(
      'YES_NO'
    );
    expect(Array.isArray(votingEvents)).toBe(true);
    expect(votingEvents.length).toBeGreaterThanOrEqual(2);
    votingEvents.forEach(event => {
      expect(event.voteType).toBe('YES_NO');
    });
  });

  it('should update a voting event', async () => {
    const updatedVotingEvent = await VotingService.updateVotingEvent(
      testVotingEventId,
      {
        name: 'Updated Voting Event Name',
        voteType: 'APPROVAL'
      }
    );

    expect(updatedVotingEvent.name).toBe('Updated Voting Event Name');
    expect(updatedVotingEvent.voteType).toBe('APPROVAL');
    expect(updatedVotingEvent.votingEventId).toBe(testVotingEventId);
    expect(updatedVotingEvent.updatedAt).toBeDefined(); // Should be set after update
  });

  it('should include meeting and votingRecords in responses', async () => {
    const votingEvent = await VotingService.getVotingEventById(
      testVotingEventId
    );
    expect(votingEvent?.meeting).toBeDefined();
    expect(votingEvent?.meeting.meetingId).toBe(testMeetingId);
    expect(votingEvent?.votingRecords).toBeDefined();
    expect(Array.isArray(votingEvent?.votingRecords)).toBe(true);
  });
});

describe('VotingController', () => {
  let testMeetingId: string;
  let testMeeting2Id: string;
  let testVotingEventId: string;

  beforeAll(async () => {
    // Create test meetings
    const meeting = await prisma.meeting.create({
      data: {
        name: 'Controller Test Meeting',
        date: '2025-08-04',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Test notes',
        type: 'REGULAR'
      }
    });
    testMeetingId = meeting.meetingId;

    const meeting2 = await prisma.meeting.create({
      data: {
        name: 'Controller Test Meeting 2',
        date: '2025-10-04',
        startTime: '9:00',
        endTime: '10:00',
        notes: 'Test notes 2',
        type: 'FULL_BODY'
      }
    });
    testMeeting2Id = meeting2.meetingId;
  });

  afterAll(async () => {
    await prisma.votingEvent.deleteMany({
      where: {
        meetingId: {
          in: [testMeetingId, testMeeting2Id]
        }
      }
    });
    await MeetingService.deleteMeeting(testMeetingId);
    await MeetingService.deleteMeeting(testMeeting2Id);
  });

  describe('GET ALL', () => {
    it('should return all voting events', async () => {
      // Create a test voting event
      const testVotingEvent = await VotingService.createVotingEvent({
        meetingId: testMeetingId,
        name: 'GET ALL Test Event',
        voteType: 'YES_NO'
      });

      const response = await VotingController.getAllVotingEvents();
      expect(response).toBeDefined();
      const responseData = await response.json();
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData.length).toBeGreaterThan(0);
      await VotingService.deleteVotingEvent(testVotingEvent.votingEventId);
    });
  });

  describe('GET SINGULAR', () => {
    it('should return a single voting event by id', async () => {
      const testVotingEvent = await VotingService.createVotingEvent({
        meetingId: testMeetingId,
        name: 'GET SINGULAR Test Event',
        voteType: 'APPROVAL'
      });

      const response = await VotingController.getVotingEvent({
        votingEventId: testVotingEvent.votingEventId
      });

      expect(response).toBeDefined();
      const responseData = await response.json();
      expect(responseData.votingEventId).toBe(testVotingEvent.votingEventId);
      expect(responseData.name).toBe('GET SINGULAR Test Event');
      await VotingService.deleteVotingEvent(testVotingEvent.votingEventId);
    });

    it('should return 404 for non-existent voting event', async () => {
      const response = await VotingController.getVotingEvent({
        votingEventId: 'non-existent-id-12345'
      });

      expect(response.status).toBe(404);
      const responseData = await response.json();
      expect(responseData.error).toBe('Voting event not found');
    });
  });

  describe('GET by VoteType', () => {
    it('should return voting events filtered by vote type', async () => {
      // Create voting events with different vote types
      const votingEvent1 = await VotingService.createVotingEvent({
        meetingId: testMeetingId,
        name: 'Type Test Event 1',
        voteType: 'MULTIPLE_CHOICE'
      });

      const votingEvent2 = await VotingService.createVotingEvent({
        meetingId: testMeeting2Id,
        name: 'Type Test Event 2',
        voteType: 'MULTIPLE_CHOICE'
      });

      const response = await VotingController.getVotingEventsByVoteType({
        voteType: 'MULTIPLE_CHOICE'
      });

      expect(response).toBeDefined();
      const responseData = await response.json();
      expect(Array.isArray(responseData)).toBe(true);
      responseData.forEach((event: any) => {
        expect(event.voteType).toBe('MULTIPLE_CHOICE');
      });
      await VotingService.deleteVotingEvent(votingEvent1.votingEventId);
      await VotingService.deleteVotingEvent(votingEvent2.votingEventId);
    });

    it('should return empty array for non-existent vote type', async () => {
      const response = await VotingController.getVotingEventsByVoteType({
        voteType: 'NON_EXISTENT_TYPE'
      });

      expect(response).toBeDefined();
      const responseData = await response.json();
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData.length).toBe(0);
    });
  });

  describe('POST', () => {
    it('should create a new voting event via controller', async () => {
      const createData = {
        meetingId: testMeetingId,
        name: 'POST Test Event',
        voteType: 'YES_NO',
        updatedBy: 'test-user'
      };

      const mockRequest = {
        json: async () => createData
      } as Request;

      const response = await VotingController.createVotingEvent(mockRequest);

      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData.name).toBe('POST Test Event');
      expect(responseData.voteType).toBe('YES_NO');
      expect(responseData.meetingId).toBe(testMeetingId);
      expect(responseData.votingEventId).toBeDefined();

      testVotingEventId = responseData.votingEventId;
      await VotingService.deleteVotingEvent(responseData.votingEventId);
    });

    it('should reject missing required fields', async () => {
      const createData = {
        name: 'Incomplete Event'
        // Missing meetingId and voteType
      };

      const mockRequest = {
        json: async () => createData
      } as Request;

      const response = await VotingController.createVotingEvent(mockRequest);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toContain('Missing required fields');
    });

    it('should reject invalid field types', async () => {
      const createData = {
        meetingId: 123, // Should be string
        name: 'Invalid Types Event',
        voteType: 'YES_NO'
      };

      const mockRequest = {
        json: async () => createData
      } as Request;

      const response = await VotingController.createVotingEvent(mockRequest);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toContain('Invalid field types');
    });

    it('should handle optional updatedBy field', async () => {
      const createData = {
        meetingId: testMeetingId,
        name: 'Optional UpdatedBy Event',
        voteType: 'APPROVAL'
        // updatedBy is optional
      };

      const mockRequest = {
        json: async () => createData
      } as Request;

      const response = await VotingController.createVotingEvent(mockRequest);

      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData.updatedBy).toBeNull();
      await VotingService.deleteVotingEvent(responseData.votingEventId);
    });
  });

  describe('PUT', () => {
    it('should update a voting event via controller', async () => {
      // Create a test voting event
      const testVotingEvent = await VotingService.createVotingEvent({
        meetingId: testMeetingId,
        name: 'PUT Test Event',
        voteType: 'YES_NO'
      });

      const updateData = {
        name: 'Updated PUT Test Event',
        voteType: 'APPROVAL',
        updatedBy: 'test-updater'
      };

      const mockRequest = {
        json: async () => updateData
      } as Request;

      const response = await VotingController.updateVotingEvent(mockRequest, {
        votingEventId: testVotingEvent.votingEventId
      });

      expect(response).toBeDefined();
      const responseData = await response.json();
      expect(responseData.name).toBe('Updated PUT Test Event');
      expect(responseData.voteType).toBe('APPROVAL');
      expect(responseData.updatedBy).toBe('test-updater');
      expect(responseData.updatedAt).toBeDefined(); // Should be set after update
      await VotingService.deleteVotingEvent(testVotingEvent.votingEventId);
    });

    it('should allow partial updates', async () => {
      const testVotingEvent = await VotingService.createVotingEvent({
        meetingId: testMeetingId,
        name: 'Partial Update Test',
        voteType: 'YES_NO'
      });

      // Update only the name
      const updateData = {
        name: 'Partially Updated Name'
      };

      const mockRequest = {
        json: async () => updateData
      } as Request;

      const response = await VotingController.updateVotingEvent(mockRequest, {
        votingEventId: testVotingEvent.votingEventId
      });

      expect(response).toBeDefined();
      const responseData = await response.json();
      expect(responseData.name).toBe('Partially Updated Name');
      // Other fields should remain unchanged
      expect(responseData.voteType).toBe('YES_NO');
      await VotingService.deleteVotingEvent(testVotingEvent.votingEventId);
    });

    it('should return 404 for non-existent voting event', async () => {
      const updateData = {
        name: 'Non-existent Event'
      };

      const mockRequest = {
        json: async () => updateData
      } as Request;

      const response = await VotingController.updateVotingEvent(mockRequest, {
        votingEventId: 'non-existent-id-12345'
      });

      expect(response.status).toBe(404);
      const responseData = await response.json();
      expect(responseData.error).toBe('Voting event not found');
    });

    it('should reject empty update body', async () => {
      const testVotingEvent = await VotingService.createVotingEvent({
        meetingId: testMeetingId,
        name: 'Empty Body Test',
        voteType: 'YES_NO'
      });

      const updateData = {};

      const mockRequest = {
        json: async () => updateData
      } as Request;

      const response = await VotingController.updateVotingEvent(mockRequest, {
        votingEventId: testVotingEvent.votingEventId
      });

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toContain('No valid fields to update');
    });

    it('should reject invalid field types in update', async () => {
      const testVotingEvent = await VotingService.createVotingEvent({
        meetingId: testMeetingId,
        name: 'Invalid Types Update Test',
        voteType: 'YES_NO'
      });

      const updateData = {
        name: 123, // Should be string
        voteType: 'APPROVAL'
      };

      const mockRequest = {
        json: async () => updateData
      } as Request;

      const response = await VotingController.updateVotingEvent(mockRequest, {
        votingEventId: testVotingEvent.votingEventId
      });

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toContain('must be a string');
      await VotingService.deleteVotingEvent(testVotingEvent.votingEventId);
    });

    it('should handle soft delete via deletedAt', async () => {
      const testVotingEvent = await VotingService.createVotingEvent({
        meetingId: testMeetingId,
        name: 'Soft Delete Test',
        voteType: 'YES_NO'
      });

      const updateData = {
        deletedAt: new Date()
      };

      const mockRequest = {
        json: async () => updateData
      } as Request;

      const response = await VotingController.updateVotingEvent(mockRequest, {
        votingEventId: testVotingEvent.votingEventId
      });

      expect(response).toBeDefined();
      const responseData = await response.json();
      expect(responseData.deletedAt).toBeDefined();
      await VotingService.deleteVotingEvent(testVotingEvent.votingEventId);
    });
  });
});

describe('GET /api/voting-event', () => {
  let routeTestMeetingId: string;
  let routeTestVotingEventId: string;

  beforeAll(async () => {
    // Create a test meeting
    const meeting = await prisma.meeting.create({
      data: {
        name: 'Route Test Meeting',
        date: '2025-08-04',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Test notes',
        type: 'REGULAR'
      }
    });
    routeTestMeetingId = meeting.meetingId;

    // Create a test voting event
    const votingEvent = await VotingService.createVotingEvent({
      meetingId: routeTestMeetingId,
      name: 'Route Test Event',
      voteType: 'YES_NO'
    });
    routeTestVotingEventId = votingEvent.votingEventId;
  });

  afterAll(async () => {
    await VotingService.deleteVotingEvent(routeTestVotingEventId);
    await MeetingService.deleteMeeting(routeTestMeetingId);
  });

  it('should fetch all voting events successfully', async () => {
    const { GET } = await import('../../app/api/voting-event/route');

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(
      data.some((event: any) => event.votingEventId === routeTestVotingEventId)
    ).toBe(true);
  });
});

describe('GET /api/voting-event/[id]', () => {
  let routeTestMeetingId: string;
  let routeTestVotingEventId: string;

  beforeAll(async () => {
    // Create a test meeting
    const meeting = await prisma.meeting.create({
      data: {
        name: 'Route Test Meeting',
        date: '2025-08-04',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Test notes',
        type: 'REGULAR'
      }
    });
    routeTestMeetingId = meeting.meetingId;

    // Create a test voting event
    const votingEvent = await VotingService.createVotingEvent({
      meetingId: routeTestMeetingId,
      name: 'Route Test Event',
      voteType: 'YES_NO'
    });
    routeTestVotingEventId = votingEvent.votingEventId;
  });

  afterAll(async () => {
    await VotingService.deleteVotingEvent(routeTestVotingEventId);
    await MeetingService.deleteMeeting(routeTestMeetingId);
  });

  it('should fetch voting event by id successfully', async () => {
    const { GET } = await import('../../app/api/voting-event/[id]/route');
    const req = new Request(
      `http://localhost/api/voting-event/${routeTestVotingEventId}`
    );

    const params = Promise.resolve({ id: routeTestVotingEventId });
    const response = await GET(req, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.votingEventId).toBe(routeTestVotingEventId);
    expect(data.name).toBe('Route Test Event');
    expect(data.voteType).toBe('YES_NO');
    expect(data.meeting).toBeDefined();
    expect(data.meeting.meetingId).toBe(routeTestMeetingId);
  });

  it('should return 404 when voting event is not found', async () => {
    const { GET } = await import('../../app/api/voting-event/[id]/route');
    const req = new Request(
      'http://localhost/api/voting-event/non-existent-id'
    );

    const params = Promise.resolve({ id: 'non-existent-id' });
    const response = await GET(req, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Voting event not found');
  });
});

describe('GET /api/voting-event/by-type/[voteType]', () => {
  let routeTestMeetingId: string;
  let routeTestMeeting2Id: string;
  let routeTestVotingEvent1Id: string;
  let routeTestVotingEvent2Id: string;

  beforeAll(async () => {
    // Create test meetings
    const meeting = await prisma.meeting.create({
      data: {
        name: 'Route Test Meeting',
        date: '2025-08-04',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Test notes',
        type: 'REGULAR'
      }
    });
    routeTestMeetingId = meeting.meetingId;

    const meeting2 = await prisma.meeting.create({
      data: {
        name: 'Route Test Meeting 2',
        date: '2025-10-04',
        startTime: '9:00',
        endTime: '10:00',
        notes: 'Test notes 2',
        type: 'FULL_BODY'
      }
    });
    routeTestMeeting2Id = meeting2.meetingId;

    // Create voting events with specific vote types
    const votingEvent1 = await VotingService.createVotingEvent({
      meetingId: routeTestMeetingId,
      name: 'Route Type Test Event 1',
      voteType: 'APPROVAL'
    });
    routeTestVotingEvent1Id = votingEvent1.votingEventId;

    const votingEvent2 = await VotingService.createVotingEvent({
      meetingId: routeTestMeeting2Id,
      name: 'Route Type Test Event 2',
      voteType: 'APPROVAL'
    });
    routeTestVotingEvent2Id = votingEvent2.votingEventId;
  });

  afterAll(async () => {
    await VotingService.deleteVotingEvent(routeTestVotingEvent1Id);
    await VotingService.deleteVotingEvent(routeTestVotingEvent2Id);
    await MeetingService.deleteMeeting(routeTestMeetingId);
    await MeetingService.deleteMeeting(routeTestMeeting2Id);
  });

  it('should fetch voting events by vote type successfully', async () => {
    const { GET } = await import(
      '../../app/api/voting-event/by-type/[voteType]/route'
    );
    const req = new Request(
      'http://localhost/api/voting-event/by-type/APPROVAL'
    );

    const params = Promise.resolve({ voteType: 'APPROVAL' });
    const response = await GET(req, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
    data.forEach((event: any) => {
      expect(event.voteType).toBe('APPROVAL');
    });
  });

  it('should return empty array for non-existent vote type', async () => {
    const { GET } = await import(
      '../../app/api/voting-event/by-type/[voteType]/route'
    );
    const req = new Request(
      'http://localhost/api/voting-event/by-type/NON_EXISTENT_TYPE'
    );

    const params = Promise.resolve({ voteType: 'NON_EXISTENT_TYPE' });
    const response = await GET(req, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });
});

describe('POST /api/voting-event', () => {
  let routeTestMeetingId: string;

  beforeAll(async () => {
    // Create a test meeting
    const meeting = await prisma.meeting.create({
      data: {
        name: 'Route Test Meeting',
        date: '2025-08-04',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Test notes',
        type: 'REGULAR'
      }
    });
    routeTestMeetingId = meeting.meetingId;
  });

  afterAll(async () => {
    await MeetingService.deleteMeeting(routeTestMeetingId);
  });

  it('should create a new voting event successfully', async () => {
    const { POST } = await import('../../app/api/voting-event/route');
    const requestBody = {
      meetingId: routeTestMeetingId,
      name: 'POST Route Test Event',
      voteType: 'YES_NO',
      updatedBy: 'test-user'
    };

    const req = new Request('http://localhost/api/voting-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toBeDefined();
    expect(data.name).toBe('POST Route Test Event');
    expect(data.voteType).toBe('YES_NO');
    expect(data.meetingId).toBe(routeTestMeetingId);
    expect(data.votingEventId).toBeDefined();
    expect(data.updatedBy).toBe('test-user');
    await VotingService.deleteVotingEvent(data.votingEventId);
  });

  it('should return 400 when required fields are missing', async () => {
    const { POST } = await import('../../app/api/voting-event/route');
    const requestBody = {
      name: 'Incomplete Event'
      // Missing meetingId and voteType
    };

    const req = new Request('http://localhost/api/voting-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });
});

describe('PUT /api/voting-event/[id]', () => {
  let routeTestMeetingId: string;
  let routeTestVotingEventId: string;

  beforeAll(async () => {
    // Create a test meeting
    const meeting = await prisma.meeting.create({
      data: {
        name: 'Route Test Meeting',
        date: '2025-08-04',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Test notes',
        type: 'REGULAR'
      }
    });
    routeTestMeetingId = meeting.meetingId;

    // Create a test voting event
    const votingEvent = await VotingService.createVotingEvent({
      meetingId: routeTestMeetingId,
      name: 'PUT Route Test Event',
      voteType: 'YES_NO'
    });
    routeTestVotingEventId = votingEvent.votingEventId;
  });

  afterAll(async () => {
    await VotingService.deleteVotingEvent(routeTestVotingEventId);
    await MeetingService.deleteMeeting(routeTestMeetingId);
  });

  it('should update a voting event successfully', async () => {
    const { PUT } = await import('../../app/api/voting-event/[id]/route');
    const requestBody = {
      name: 'Updated PUT Route Test Event',
      voteType: 'APPROVAL',
      updatedBy: 'test-updater'
    };

    const req = new Request(
      `http://localhost/api/voting-event/${routeTestVotingEventId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    const params = Promise.resolve({ id: routeTestVotingEventId });
    const response = await PUT(req, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.name).toBe('Updated PUT Route Test Event');
    expect(data.voteType).toBe('APPROVAL');
    expect(data.updatedBy).toBe('test-updater');
    expect(data.votingEventId).toBe(routeTestVotingEventId);
    expect(data.updatedAt).toBeDefined();
  });

  it('should return 404 when voting event is not found', async () => {
    const { PUT } = await import('../../app/api/voting-event/[id]/route');
    const requestBody = {
      name: 'Non-existent Event'
    };

    const req = new Request(
      'http://localhost/api/voting-event/non-existent-id',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    const params = Promise.resolve({ id: 'non-existent-id' });
    const response = await PUT(req, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Voting event not found');
  });
});
