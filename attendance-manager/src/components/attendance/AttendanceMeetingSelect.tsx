interface AttendanceMeetingSelectProps {
  meetingsWithAttendance: {
    meetingId: string;
    name: string;
    notes?: string;
    date: string;
    startTime: string;
    endTime: string;
  }[];
  attendanceRecord: Record<string, { status: string }[]>;
  handleMeetingSelection: (meeting: any) => void;
  closeAttendanceCheck: () => void;
  editAttendance?: boolean;
}

const AttedanceMeetingSelect: React.FC<AttendanceMeetingSelectProps> = ({
  meetingsWithAttendance,
  attendanceRecord,
  handleMeetingSelection,
  closeAttendanceCheck,
  editAttendance = false
}) => {
  return (
    <>
      <h3 className='text-xl font-semibold text-gray-900 mb-2'>
        Select Meeting
      </h3>
      <p className='text-sm text-gray-600 mb-6'>
        Choose the meeting to take attendance for
      </p>

      <div className='max-h-96 overflow-y-auto border border-gray-300 rounded-lg'>
        {meetingsWithAttendance.length === 0 ? (
          <p className='text-center py-8 text-gray-500'>
            No meetings available
          </p>
        ) : (
          <div className='divide-y divide-gray-200'>
            {meetingsWithAttendance.map(meeting => (
              <button
                key={meeting.meetingId}
                onClick={() => handleMeetingSelection(meeting)}
                className='w-full p-4 text-left hover:bg-gray-50 transition-colors'
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <h4 className='text-sm font-semibold text-gray-900'>
                      {meeting.name}
                    </h4>
                    <p className='text-xs text-gray-600 mt-1'>
                      {meeting.notes}
                    </p>
                    <div className='flex items-center space-x-4 mt-2'>
                      <div className='flex items-center space-x-1 text-xs text-gray-500'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z'
                          />
                        </svg>
                        <span>{meeting.date}</span>
                      </div>
                      <div className='flex items-center space-x-1 text-xs text-gray-500'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        <span>
                          {meeting.startTime} - {meeting.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='text-right ml-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {attendanceRecord[meeting.meetingId]?.filter(
                        record => record.status === 'PRESENT'
                      ).length ?? 0}{' '}
                      / {attendanceRecord[meeting.meetingId]?.length ?? 0}{' '}
                      present
                    </div>
                    <div className='text-xs text-[#C8102E] font-medium'>
                      {Math.floor(
                        ((attendanceRecord[meeting.meetingId]?.filter(
                          record => record.status === 'PRESENT'
                        ).length ?? 0) /
                          (attendanceRecord[meeting.meetingId]?.length ?? 1)) *
                          10000
                      ) / 100}
                      %
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!editAttendance && (
        <div className='flex space-x-3 mt-6'>
          <button
            type='button'
            onClick={closeAttendanceCheck}
            className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
};
export default AttedanceMeetingSelect;
