import { MeetingRecord, AttendanceApiData } from '@/types';

interface AttendanceMeetingCheckInProps {
  selectedMeetingForCheck: MeetingRecord;
  nuidInput: string;
  setNuidInput: (nuid: string) => void;
  handleMarkAttendance: () => void;
  attendanceRecord: Record<string, AttendanceApiData[]>;
  closeAttendanceCheck: () => void;
  setAttendanceCheckStep: (
    step: 'select-meeting' | 'user-list' | 'check-in'
  ) => void;
}

const AttedanceMeetingCheckIn: React.FC<AttendanceMeetingCheckInProps> = ({
  selectedMeetingForCheck,
  nuidInput,
  setNuidInput,
  handleMarkAttendance,
  attendanceRecord,
  closeAttendanceCheck,
  setAttendanceCheckStep
}) => {
  return (
    <>
      <div className='mb-6'>
        <h3 className='text-xl font-semibold text-gray-900 mb-1 flex justify-between items-center'>
          <div>Check-In</div>
          <button
            className='cursor-pointer text-gray-500 hover:text-gray-900'
            onClick={closeAttendanceCheck}
          >
            X
          </button>
        </h3>
        <p className='text-sm text-gray-600'>
          {selectedMeetingForCheck.name} • {selectedMeetingForCheck.date}
        </p>
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <p className='text-sm text-blue-900 font-medium'>
          📱 Member Check-In Mode
        </p>
      </div>

      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Enter Your NUID
        </label>
        <input
          type='text'
          value={nuidInput}
          onChange={e => setNuidInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleMarkAttendance();
            }
          }}
          className='w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
          placeholder='Enter NUID (e.g., 001234567)'
          autoFocus
        />
      </div>

      <div className='bg-gray-50 rounded-lg p-4 mb-6'>
        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-700'>Attendance Progress</span>
          <span className='text-sm font-semibold text-gray-900'>
            {
              attendanceRecord[selectedMeetingForCheck.meetingId]?.filter(
                record => record.status === 'PRESENT'
              ).length
            }{' '}
            / {attendanceRecord[selectedMeetingForCheck.meetingId].length}{' '}
            present
          </span>
        </div>
        <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-[#C8102E] h-2 rounded-full transition-all duration-300'
            style={{
              width: `${(attendanceRecord[
                selectedMeetingForCheck.meetingId
              ]?.filter(record => record.status === 'PRESENT').length /
                attendanceRecord[selectedMeetingForCheck.meetingId].length) *
                100}%`
            }}
          ></div>
        </div>
      </div>

      <div className='flex space-x-3'>
        <button
          type='button'
          onClick={() => setAttendanceCheckStep('user-list')}
          className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
        >
          Back to List
        </button>
        <button
          type='button'
          onClick={handleMarkAttendance}
          className='flex-1 px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E]'
        >
          Confirm Attendance
        </button>
      </div>
    </>
  );
};
export default AttedanceMeetingCheckIn;
