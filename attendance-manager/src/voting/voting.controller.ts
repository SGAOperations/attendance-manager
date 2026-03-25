import { NextResponse } from 'next/server';
import { VotingService } from './voting.service';

export const VotingController = {
  async getAllVotingEvents() {
    const votingEvents = await VotingService.getAllVotingEvents();
    return NextResponse.json(votingEvents);
  },

  async getVotingEvent(params: { votingEventId: string }) {
    const votingEvent = await VotingService.getVotingEventById(params.votingEventId);
    if (!votingEvent) {
      return NextResponse.json(
        { error: 'Voting event not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(votingEvent);
  },

  async getVotingEventsByVoteType(params: { voteType: string }) {
    const votingEvents = await VotingService.getVotingEventsByVoteType(params.voteType);
    return NextResponse.json(votingEvents);
  },

  async createVotingEvent(request: Request) {
    const body = await request.json();

    // Validate required fields
    if (!body.meetingId || !body.name || !body.voteType) {
      return NextResponse.json(
        { error: 'Missing required fields: meetingId, name, and voteType are required' },
        { status: 400 }
      );
    }

    // Validate field types
    if (typeof body.meetingId !== 'string' || typeof body.name !== 'string' || typeof body.voteType !== 'string') {
      return NextResponse.json(
        { error: 'Invalid field types: meetingId, name, and voteType must be strings' },
        { status: 400 }
      );
    }
    if (body.notes !== undefined && body.notes !== null && typeof body.notes !== 'string') {
      return NextResponse.json(
        { error: 'notes must be a string when provided' },
        { status: 400 }
      );
    }
    if (body.options !== undefined && (!Array.isArray(body.options) || body.options.some((option: unknown) => typeof option !== 'string'))) {
      return NextResponse.json(
        { error: 'options must be an array of strings when provided' },
        { status: 400 }
      );
    }

    try {
      const newVotingEvent = await VotingService.createVotingEvent({
        meetingId: body.meetingId,
        name: body.name,
        voteType: body.voteType,
        notes: body.notes,
        options: body.options,
        updatedBy: body.updatedBy,
      });
      return NextResponse.json(newVotingEvent, { status: 201 });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to create voting event' },
        { status: 400 }
      );
    }
  },

  async updateVotingEvent(request: Request, params: { votingEventId: string }) {
    const updates = await request.json();

    // Validate that at least one field is being updated
    const allowedFields = ['meetingId', 'name', 'voteType', 'notes', 'options', 'updatedBy', 'deletedAt'];
    const updateKeys = Object.keys(updates);
    const hasValidUpdate = updateKeys.some(key => allowedFields.includes(key));

    if (!hasValidUpdate) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Validate field types if provided
    if (updates.meetingId && typeof updates.meetingId !== 'string') {
      return NextResponse.json(
        { error: 'meetingId must be a string' },
        { status: 400 }
      );
    }
    if (updates.name && typeof updates.name !== 'string') {
      return NextResponse.json(
        { error: 'name must be a string' },
        { status: 400 }
      );
    }
    if (updates.voteType && typeof updates.voteType !== 'string') {
      return NextResponse.json(
        { error: 'voteType must be a string' },
        { status: 400 }
      );
    }
    if (updates.notes !== undefined && updates.notes !== null && typeof updates.notes !== 'string') {
      return NextResponse.json(
        { error: 'notes must be a string or null' },
        { status: 400 }
      );
    }
    if (updates.options !== undefined && (!Array.isArray(updates.options) || updates.options.some((option: unknown) => typeof option !== 'string'))) {
      return NextResponse.json(
        { error: 'options must be an array of strings' },
        { status: 400 }
      );
    }
    if (updates.updatedBy && typeof updates.updatedBy !== 'string') {
      return NextResponse.json(
        { error: 'updatedBy must be a string' },
        { status: 400 }
      );
    }

    try {
      const updatedVotingEvent = await VotingService.updateVotingEvent(
        params.votingEventId,
        updates
      );
      return NextResponse.json(updatedVotingEvent);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Voting event not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message || 'Failed to update voting event' },
        { status: 400 }
      );
    }
  },
};
