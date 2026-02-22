import { MeetingService } from '../meeting.service';
import { MeetingController } from '../meeting.controller';
import { prisma } from '../../lib/prisma';
import { MeetingType } from '../../generated/prisma';

jest.setTimeout(20000);

describe('MeetingServices', () => {
  it('should create a new meeting', async () => {
    const newMeeting = await MeetingService.createMeeting(
      {
        name: 'test2',
        startTime: '8:12:56 PM',
        date: '7/30/2025',
        endTime: '8:13:15 PM',
        notes: 'notes',
        type: MeetingType.REGULAR
      },
      [] // Empty attendeeIds array
    );
    expect(newMeeting).toBeDefined();
    expect(newMeeting.name).toBe('test2');
    expect(newMeeting.meetingId).toBeDefined();
    expect(newMeeting.startTime).toBe('8:12:56 PM');
    expect(newMeeting.date).toBe('7/30/2025');
    expect(newMeeting.endTime).toBe('8:13:15 PM');
    expect(newMeeting.notes).toBe('notes');
    expect(newMeeting.type).toBe(MeetingType.REGULAR);
  });

  it('should fetch all meetings', async () => {
    const meetings = await MeetingService.getAllMeeting();
    expect(Array.isArray(meetings)).toBe(true);
  });

  it('should fetch a meetings by id', async () => {
    const [newMeeting] = await MeetingService.getAllMeeting();
    const fetchedMeeting = await MeetingService.getMeetingById(
      newMeeting.meetingId
    );
    expect(fetchedMeeting?.meetingId).toBe(newMeeting.meetingId);
  });

  it('should update a meeting', async () => {
    const [newMeeting] = await MeetingService.getAllMeeting();
    const updatedMeeting = await MeetingService.updateMeeting(
      newMeeting.meetingId,
      {
        name: 'test',
        startTime: '8:07:56 PM',
        date: '7/29/2025',
        endTime: '8:08:15 PM',
        notes: 'notes',
        type: MeetingType.FULL_BODY
      }
    );

    expect(updatedMeeting.name).toBe('test');
    expect(updatedMeeting.meetingId).toBe(newMeeting.meetingId);
    expect(updatedMeeting.startTime).toBe('8:07:56 PM');
    expect(updatedMeeting.date).toBe('7/29/2025');
    expect(updatedMeeting.endTime).toBe('8:08:15 PM');
    expect(updatedMeeting.notes).toBe('notes');
    expect(updatedMeeting.type).toBe(MeetingType.FULL_BODY);
  });

  it('should delete a meeting', async () => {
    const [newMeeting] = await MeetingService.getAllMeeting();
    await MeetingService.deleteMeeting(newMeeting.meetingId);
    const deletedMeeting = await MeetingService.getMeetingById(
      newMeeting.meetingId
    );
    expect(deletedMeeting).toBeNull();
  });
});

describe('MeetingController', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should update a meeting via controller', async () => {
    // Create a test meeting
    const testMeeting = await MeetingService.createMeeting(
      {
        name: 'Controller Test Meeting',
        startTime: '10:00',
        date: '2025-12-01',
        endTime: '11:00',
        notes: 'Test notes',
        type: MeetingType.REGULAR
      },
      []
    );

    // Create a mock request with update data
    const updateData = {
      name: 'Updated Meeting Name',
      startTime: '14:00',
      date: '2025-12-02',
      endTime: '15:00',
      notes: 'Updated notes',
      type: MeetingType.FULL_BODY
    };

    const mockRequest = {
      json: async () => updateData
    } as Request;

    const response = await MeetingController.updateMeeting(mockRequest, {
      meetingId: testMeeting.meetingId
    });

    expect(response).toBeDefined();
    const responseData = await response.json();
    expect(responseData.name).toBe('Updated Meeting Name');
    expect(responseData.startTime).toBe('14:00');
    expect(responseData.date).toBe('2025-12-02');
    expect(responseData.endTime).toBe('15:00');
    expect(responseData.notes).toBe('Updated notes');
    expect(responseData.type).toBe(MeetingType.FULL_BODY);

    await MeetingService.deleteMeeting(testMeeting.meetingId);
  });

  it('should reject invalid meeting type via controller', async () => {
    // Create a test meeting
    const testMeeting = await MeetingService.createMeeting(
      {
        name: 'Invalid Type Test',
        startTime: '10:00',
        date: '2025-12-01',
        endTime: '11:00',
        notes: 'Test notes',
        type: MeetingType.REGULAR
      },
      []
    );

    // Create mock request with invalid type
    const updateData = {
      type: 'INVALID_TYPE'
    };

    const mockRequest = {
      json: async () => updateData
    } as Request;

    const response = await MeetingController.updateMeeting(mockRequest, {
      meetingId: testMeeting.meetingId
    });

    expect(response.status).toBe(400);
    const responseData = await response.json();
    expect(responseData.error).toContain('Invalid meeting type');

    await MeetingService.deleteMeeting(testMeeting.meetingId);
  });

  it('should allow partial updates via controller', async () => {
    const testMeeting = await MeetingService.createMeeting(
      {
        name: 'Partial Update Test',
        startTime: '10:00',
        date: '2025-12-01',
        endTime: '11:00',
        notes: 'Original notes',
        type: MeetingType.REGULAR
      },
      []
    );

    // Update only the name
    const updateData = {
      name: 'Partially Updated Name'
    };

    const mockRequest = {
      json: async () => updateData
    } as Request;

    const response = await MeetingController.updateMeeting(mockRequest, {
      meetingId: testMeeting.meetingId
    });

    expect(response).toBeDefined();
    const responseData = await response.json();
    expect(responseData.name).toBe('Partially Updated Name');
    // Other fields should remain unchanged
    expect(responseData.startTime).toBe('10:00');
    expect(responseData.notes).toBe('Original notes');

    await MeetingService.deleteMeeting(testMeeting.meetingId);
  });

  it('should handle non-existent meetingId', async () => {
    const updateData = {
      name: 'Non-existent Meeting'
    };

    const mockRequest = {
      json: async () => updateData
    } as Request;

    // throw an error for non-existent meetingId
    await expect(
      MeetingController.updateMeeting(mockRequest, {
        meetingId: 'non-existent-id-12345'
      })
    ).rejects.toThrow();
  });

  it('should handle empty request body', async () => {
    const testMeeting = await MeetingService.createMeeting(
      {
        name: 'Empty Body Test',
        startTime: '10:00',
        date: '2025-12-01',
        endTime: '11:00',
        notes: 'Test notes',
        type: MeetingType.REGULAR
      },
      []
    );

    const updateData = {};

    const mockRequest = {
      json: async () => updateData
    } as Request;

    const response = await MeetingController.updateMeeting(mockRequest, {
      meetingId: testMeeting.meetingId
    });

    expect(response).toBeDefined();
    const responseData = await response.json();
    expect(responseData.meetingId).toBe(testMeeting.meetingId);

    await MeetingService.deleteMeeting(testMeeting.meetingId);
  });

  it('should handle malformed JSON in request', async () => {
    const testMeeting = await MeetingService.createMeeting(
      {
        name: 'Malformed JSON Test',
        startTime: '10:00',
        date: '2025-12-01',
        endTime: '11:00',
        notes: 'Test notes',
        type: MeetingType.REGULAR
      },
      []
    );

    const mockRequest = ({
      json: async () => {
        throw new Error('Invalid JSON');
      }
    } as unknown) as Request;

    // Should throw error when parsing fails
    await expect(
      MeetingController.updateMeeting(mockRequest, {
        meetingId: testMeeting.meetingId
      })
    ).rejects.toThrow('Invalid JSON');

    await MeetingService.deleteMeeting(testMeeting.meetingId);
  });

  it('should accept valid FULL_BODY type', async () => {
    const testMeeting = await MeetingService.createMeeting(
      {
        name: 'Full Body Type Test',
        startTime: '10:00',
        date: '2025-12-01',
        endTime: '11:00',
        notes: 'Test notes',
        type: MeetingType.REGULAR
      },
      []
    );

    const updateData = {
      type: MeetingType.FULL_BODY
    };

    const mockRequest = {
      json: async () => updateData
    } as Request;

    const response = await MeetingController.updateMeeting(mockRequest, {
      meetingId: testMeeting.meetingId
    });

    expect(response).toBeDefined();
    const responseData = await response.json();
    expect(responseData.type).toBe(MeetingType.FULL_BODY);

    await MeetingService.deleteMeeting(testMeeting.meetingId);
  });

  it('should accept valid REGULAR type', async () => {
    const testMeeting = await MeetingService.createMeeting(
      {
        name: 'Regular Type Test',
        startTime: '10:00',
        date: '2025-12-01',
        endTime: '11:00',
        notes: 'Test notes',
        type: MeetingType.FULL_BODY
      },
      []
    );

    const updateData = {
      type: MeetingType.REGULAR
    };

    const mockRequest = {
      json: async () => updateData
    } as Request;

    const response = await MeetingController.updateMeeting(mockRequest, {
      meetingId: testMeeting.meetingId
    });

    expect(response).toBeDefined();
    const responseData = await response.json();
    expect(responseData.type).toBe(MeetingType.REGULAR);

    await MeetingService.deleteMeeting(testMeeting.meetingId);
  });
});
