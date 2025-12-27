import { UserApiData } from '@/types';

interface AttendanceMembersProps {
  eboardMembers: UserApiData[];
  regularMembers: UserApiData[];
}

const AttedanceMembers: React.FC<AttendanceMembersProps> = ({
  eboardMembers,
  regularMembers
}) => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Eboard Members */}
      <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>Eboard</h2>
        <div className='space-y-3 max-h-64 overflow-y-auto'>
          {eboardMembers.map(member => (
            <div
              key={member.userId}
              className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
            >
              <div className='w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-semibold'>
                  {member.firstName.charAt(0)}
                </span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>
                  {member.firstName} {member.lastName}
                </p>
                <p className='text-xs text-gray-500'>{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regular Members */}
      <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>Members</h2>
        <div className='space-y-3 max-h-64 overflow-y-auto'>
          {regularMembers.map(member => (
            <div
              key={member.userId}
              className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
            >
              <div className='w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-semibold'>
                  {member.firstName.charAt(0)}
                </span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>
                  {member.firstName} {member.lastName}
                </p>
                <p className='text-xs text-gray-500'>{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttedanceMembers;
