interface MeetingStatisticsPanelProps {
  attendedMeetings: number;
  missedMeetings: number;
  upcomingMeetings: number;
  isAdmin: boolean;
  setShowCreateMeetingModal: (show: boolean) => void;
  setShowVotingModal: (show: boolean) => void;
}

const MeetingStatisticsPanel: React.FC<MeetingStatisticsPanelProps> = ({
  attendedMeetings,
  missedMeetings,
  upcomingMeetings,
  isAdmin,
  setShowCreateMeetingModal,
  setShowVotingModal
}) => {
  return (
    <div className='lg:col-span-1'>
      <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
        <h2 className='text-lg font-semibold text-gray-900 mb-6'>
          Meeting Statistics
        </h2>

        <div className='space-y-6'>
          {/* Attended Meetings */}
          <div className='text-center'>
            <div className='flex justify-center mb-2'>
              <svg
                className='w-8 h-8 text-[#A4804A]'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
              </svg>
            </div>
            <h3 className='text-sm font-medium text-gray-900 mb-1'>
              Attended Meetings
            </h3>
            <p className='text-2xl font-bold text-[#C8102E]'>
              {attendedMeetings}
            </p>
          </div>

          {/* Missed Meetings */}
          <div className='text-center'>
            <div className='flex justify-center mb-2'>
              <svg
                className='w-8 h-8 text-[#A4804A]'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
              </svg>
            </div>
            <h3 className='text-sm font-medium text-gray-900 mb-1'>
              Missed Meetings
            </h3>
            <p className='text-2xl font-bold text-[#C8102E]'>
              {missedMeetings}
            </p>
          </div>

          {/* Upcoming Meetings */}
          <div className='text-center'>
            <div className='flex justify-center mb-2'>
              <svg
                className='w-8 h-8 text-[#A4804A]'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z' />
              </svg>
            </div>
            <h3 className='text-sm font-medium text-gray-900 mb-1'>
              Upcoming Meetings
            </h3>
            <p className='text-2xl font-bold text-[#C8102E]'>
              {upcomingMeetings}
            </p>
          </div>
        </div>
      </div>

      {/* Create Meeting Button - Only for Admins */}
      {isAdmin && (
        <div className='mt-6 space-y-3'>
          <button
            onClick={() => setShowCreateMeetingModal(true)}
            className='w-full px-4 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors font-medium shadow-lg hover:shadow-xl'
          >
            + Create New Meeting
          </button>
          <button
                onClick={() => setShowVotingModal(true)}
                className='w-full px-4 py-3 bg-[#A4804A] text-white rounded-xl hover:bg-[#8A6D3F] transition-colors font-medium shadow-lg hover:shadow-xl'
              >
                + Start New Voting
          </button>
        </div>
      )}
    </div>
  );
};

export default MeetingStatisticsPanel;
