import { NextResponse } from 'next/server';
import { prisma } from '../lib/prisma';
import { VoteType, yesNoOptions } from '../utils/consts';
import { VotingRecordService } from './voting-record.service';

const rollCallStyleResults = new Set<string>([
  ...Object.values(yesNoOptions),
  'YES',
  'NO',
  'ABSTAIN',
]);

function isValidVotingRecordResult(
  voteType: string,
  options: string[],
  result: string,
): boolean {
  if (voteType === VoteType.rollCall) {
    return rollCallStyleResults.has(result);
  }
  if (options.length > 0) {
    return options.includes(result);
  }
  return rollCallStyleResults.has(result);
}

export const VotingRecordController = {
  async getAllVotingRecords() {
    const votingRecords = await VotingRecordService.getAllVotingRecords();
    return NextResponse.json(votingRecords);
  },

  async getVotingRecordsByVotingEvent(params: { votingEventId: string }) {
    const votingEvent = await prisma.votingEvent.findUnique({
      where: { votingEventId: params.votingEventId },
      select: { voteType: true },
    });
    if (!votingEvent) {
      return NextResponse.json([]);
    }
    if (votingEvent.voteType === VoteType.secretBallot) {
      return NextResponse.json(
        {
          error:
            'Per-voter voting records are not available for secret ballot votes',
        },
        { status: 403 },
      );
    }
    const votingRecords =
      await VotingRecordService.getVotingRecordsByVotingEvent(
        params.votingEventId,
      );
    return NextResponse.json(votingRecords);
  },

  async createVotingRecord(request: Request) {
    const body = await request.json();

    // Validate required fields
    if (!body.votingEventId || !body.userId || !body.result) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: votingEventId, userId, and result are required',
        },
        { status: 400 },
      );
    }

    // Validate field types
    if (
      typeof body.votingEventId !== 'string' ||
      typeof body.userId !== 'string' ||
      typeof body.result !== 'string'
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid field types: votingEventId, userId, and result must be strings',
        },
        { status: 400 },
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
      if (error.message === 'User has already voted for this event') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message || 'Failed to create voting record' },
        { status: 400 },
      );
    }
  },

  async updateVotingRecord(
    request: Request,
    params: { votingRecordId: string },
  ) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (
      !body ||
      typeof body !== 'object' ||
      typeof (body as { result?: unknown }).result !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid field: result (string) is required' },
        { status: 400 },
      );
    }

    const { result, updatedBy } = body as {
      result: string;
      updatedBy?: unknown;
    };

    if (
      updatedBy !== undefined &&
      updatedBy !== null &&
      typeof updatedBy !== 'string'
    ) {
      return NextResponse.json(
        { error: 'updatedBy must be a string when provided' },
        { status: 400 },
      );
    }

    const record = await prisma.votingRecord.findUnique({
      where: { votingRecordId: params.votingRecordId },
      include: {
        votingEvent: true,
      },
    });

    if (!record || record.deletedAt) {
      return NextResponse.json(
        { error: 'Voting record not found' },
        { status: 404 },
      );
    }

    const event = record.votingEvent;
    if (event.deletedAt) {
      return NextResponse.json(
        { error: 'Cannot edit voting records for a completed voting event' },
        { status: 400 },
      );
    }

    if (event.voteType === VoteType.secretBallot) {
      return NextResponse.json(
        {
          error: 'Voting records cannot be edited for secret ballot events',
        },
        { status: 403 },
      );
    }

    const options = Array.isArray(event.options) ? event.options : [];
    if (!isValidVotingRecordResult(event.voteType, options, result)) {
      return NextResponse.json(
        { error: 'Invalid result for this voting event type' },
        { status: 400 },
      );
    }

    try {
      const updated = await VotingRecordService.updateVotingRecord({
        votingRecordId: params.votingRecordId,
        result,
        ...(typeof updatedBy === 'string' ? { updatedBy } : {}),
      });
      return NextResponse.json(updated);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update voting record';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },
};
