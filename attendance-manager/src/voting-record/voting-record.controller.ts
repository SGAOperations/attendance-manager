import { NextResponse } from 'next/server';
import { VotingRecordService } from './voting-record.service';

export const VotingRecordController = {
  async getAllVotingRecords() {
    const votingRecords = await VotingRecordService.getAllVotingRecords();
    return NextResponse.json(votingRecords);
  },

  async getVotingRecordsByVotingEvent(params: { votingEventId: string }) {
    const votingRecords = await VotingRecordService.getVotingRecordsByVotingEvent(params.votingEventId);
    return NextResponse.json(votingRecords);
  },

  async createVotingRecord(request: Request) {
    const body = await request.json();

    // Validate required fields
    if (!body.votingEventId || !body.userId || !body.result) {
      return NextResponse.json(
        { error: 'Missing required fields: votingEventId, userId, and result are required' },
        { status: 400 }
      );
    }

    // Validate field types
    if (
      typeof body.votingEventId !== 'string' ||
      typeof body.userId !== 'string' ||
      typeof body.result !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid field types: votingEventId, userId, and result must be strings' },
        { status: 400 }
      );
    }

    try {
      const newVotingRecord = await VotingRecordService.createVotingRecord({
        votingEventId: body.votingEventId,
        userId: body.userId,
        result: body.result,
        updatedBy: body.updatedBy,
      });
      return NextResponse.json(newVotingRecord, { status: 201 });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to create voting record' },
        { status: 400 }
      );
    }
  },
};
