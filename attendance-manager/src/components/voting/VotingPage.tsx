import React, { useEffect, useState } from 'react';
import { MeetingApiData } from '@/types';
import VotingAdminPanel from '@/components/voting/VotingAdminPanel';

const VotingPage: React.FC = () => {
  const [meetings, setMeetings] = useState<MeetingApiData[]>([]);

  useEffect(() => {
    fetch('/api/meeting')
      .then(res => res.json())
      .then((data: MeetingApiData[]) => setMeetings(data))
      .catch(err => console.error('Failed to fetch meetings:', err));
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
    </div>
  );
};

export default VotingPage;
