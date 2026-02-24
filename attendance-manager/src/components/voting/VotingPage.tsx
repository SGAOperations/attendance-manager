import React, { useEffect, useState } from 'react';
import { MeetingApiData, VotingEventApiData, VotingRecordApiData } from '@/types';
import VotingAdminPanel from '@/components/voting/VotingAdminPanel';
import VotingResultsPanel from '@/components/voting/VotingResultsPanel';

type VotingEventWithRelations = VotingEventApiData & {
  meeting?: {
    name: string;
    date: string;
  };
  votingRecords?: VotingRecordApiData[];
};

const VotingPage: React.FC = () => {
  const [meetings, setMeetings] = useState<MeetingApiData[]>([]);
  const [events, setEvents] = useState<VotingEventWithRelations[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [meetingsRes, eventsRes] = await Promise.all([
          fetch('/api/meeting'),
          fetch('/api/voting-event')
        ]);

        if (meetingsRes.ok) {
          const meetingsData: MeetingApiData[] = await meetingsRes.json();
          setMeetings(meetingsData);
        } else {
          console.error('Failed to fetch meetings');
        }

        if (eventsRes.ok) {
          const eventsData: VotingEventWithRelations[] = await eventsRes.json();
          setEvents(eventsData);
        } else {
          console.error('Failed to fetch voting events');
        }
      } catch (err) {
        console.error('Failed to load voting data:', err);
      } finally {
        setEventsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className='flex-1 p-6 bg-gray-50'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Voting</h1>
        <p className='text-gray-600 mt-1'>
          Create and manage voting events. When a vote is active, all users will
          see a modal to submit their vote.
        </p>
      </div>
      <VotingAdminPanel meetings={meetings} />
      <VotingResultsPanel events={events} loading={eventsLoading} />
    </div>
  );
};

export default VotingPage;
