import { MeetingApiData, AttendanceApiData } from '@/types';

interface AttendanceHistoryProps {
  meetingsWithAttendance: MeetingApiData[];
  attendanceRecord: Record<string, AttendanceApiData[]>;
  isAdmin: boolean;
  openEditAttendanceModal: (meeting: MeetingApiData) => void;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  meetingsWithAttendance,
  attendanceRecord,
  isAdmin,
  openEditAttendanceModal
}) => {
  return (
    <div className='bg-white rounded-2xl shadow-lg border border-gray-100'>
      <div className='p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>
          Attendance History
        </h2>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#C8102E] text-white'>
                <th className='text-left py-3 px-4 font-medium'>Date/Time</th>
                <th className='text-left py-3 px-4 font-medium'>Meeting</th>
                <th className='text-left py-3 px-4 font-medium'>Description</th>
                <th className='text-center py-3 px-4 font-medium'>
                  # of Members
                </th>
                <th className='text-center py-3 px-4 font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetingsWithAttendance.map(record => (
                <tr
                  key={record.meetingId}
                  className='border-b border-gray-200 hover:bg-gray-50'
                >
                  <td className='py-3 px-4'>
                    <div className='text-sm text-gray-900'>{record.date}</div>
                    <div className='text-xs text-gray-500'>
                      {record.startTime} - {record.endTime}
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {record.name}
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <div className='text-sm text-gray-600'>{record.notes}</div>
                  </td>
                  <td className='py-3 px-4 text-center'>
                    <div className='text-sm font-medium text-gray-900'>
                      {
                        attendanceRecord[record.meetingId]?.filter(
                          record => record.status === 'PRESENT'
                        ).length
                      }
                    </div>
                    <div className='text-xs text-gray-500'>
                      of {attendanceRecord[record.meetingId]?.length}
                    </div>
                    <div className='text-xs text-[#C8102E] font-medium'>
                      {Math.floor(
                        ((attendanceRecord[record.meetingId]?.filter(
                          r => r.status === 'PRESENT'
                        ).length ?? 0) /
                          (attendanceRecord[record.meetingId]?.length ?? 1)) *
                          10000
                      ) / 100}
                      %
                    </div>
                  </td>
                  <td className='py-3 px-4 text-center'>
                    <div className='flex justify-center space-x-2'>
                      {isAdmin && (
                        <button
                          onClick={() => openEditAttendanceModal(record)}
                          className='px-3 py-1 bg-[#A4804A] text-white text-xs rounded-lg hover:bg-[#8A6D3F] transition-colors'
                        >
                          Edit
                        </button>
                      )}
                      <button className='px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors'>
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
