import { MeetingApiData } from '@/types';
import { useState, useEffect } from 'react';

interface EditMeetingModalProps {
  selectedUserIds: string[],
  setSelectedUserIds: React.Dispatch<React.SetStateAction<string[]>>,
  editMeeting: {
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    notes: string;
    type: 'FULL_BODY' | 'REGULAR';
  };
  handleUpdateMeeting: (
    e: React.FormEvent<HTMLFormElement>
  ) => void | Promise<void>;
  setEditMeeting: (meeting: {
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    notes: string;
    type: 'FULL_BODY' | 'REGULAR';
  }) => void;
  setShowEditMeetingModal: (show: boolean) => void;
  setEditingMeeting: (editing: MeetingApiData | null) => void;
}

const formatDate = (dateStr: string) => {
  if (dateStr.includes('/')) {
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  throw new Error(`Unsupported date format: ${dateStr}`);
};

const formatTime = (timeStr: string) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (period === 'PM' && hours !== '12') hours = String(Number(hours) + 12);
  if (period === 'AM' && hours === '12') hours = '00';
  return `${hours.padStart(2, '0')}:${minutes}`;
};

const EditMeetingModal: React.FC<EditMeetingModalProps> = ({
  selectedUserIds,
  setSelectedUserIds,
  editMeeting,
  handleUpdateMeeting,
  setEditMeeting,
  setShowEditMeetingModal,
  setEditingMeeting
}) => {

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev: any) =>
      prev.includes(userId) ? prev.filter((id: any) => id !== userId) : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const fetchUsers = () => {
    fetch('/api/users')
      .then(response => response.json())
      .then(json => setUsers(json))
      .catch(error => console.error(error));
  };

  

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <h3 className='text-xl font-semibold text-gray-900 mb-6'>
          Edit Meeting
        </h3>
        <form className='space-y-6' onSubmit={handleUpdateMeeting}>

          {/* Meeting Name */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Meeting Name
            </label>
            <input
              type='text'
              value={editMeeting.name}
              onChange={e =>
                setEditMeeting({ ...editMeeting, name: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
              placeholder='Enter meeting name'
              required
            />
          </div>

          {/* Date and Time */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Date
              </label>
              <input
                type='date'
                value={formatDate(editMeeting.date)}
                onChange={e =>
                  setEditMeeting({ ...editMeeting, date: e.target.value })
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Start Time
              </label>
              <input
                type='time'
                value={formatTime(editMeeting.startTime)}
                onChange={e =>
                  setEditMeeting({ ...editMeeting, startTime: e.target.value })
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                End Time
              </label>
              <input
                type='time'
                value={formatTime(editMeeting.endTime)}
                onChange={e =>
                  setEditMeeting({ ...editMeeting, endTime: e.target.value })
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
                required
              />
            </div>
          </div>

          {/* Meeting Type */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Meeting Type
            </label>
            <select
              value={editMeeting.type}
              onChange={e =>
                setEditMeeting({
                  ...editMeeting,
                  type: e.target.value as 'FULL_BODY' | 'REGULAR'
                })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
              required
            >
              <option value='REGULAR'>Regular</option>
              <option value='FULL_BODY'>Full Body</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Notes
            </label>
            <textarea
              value={editMeeting.notes}
              onChange={e =>
                setEditMeeting({ ...editMeeting, notes: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
              placeholder='Enter meeting notes'
              rows={4}
              required
            />
          </div>

          {/* Attendees */}
          <div>
            <div className='flex items-center justify-between mb-3'>
              <label className='block text-sm font-medium text-gray-700'>
                Attendees
              </label>
              {selectedUserIds.length > 0 && (
                <span className='text-xs font-medium text-[#C8102E] bg-red-50 px-2.5 py-1 rounded-full transition-all duration-150'>
                  {selectedUserIds.length} selected
                </span>
              )}
            </div>

            <div className='border border-gray-300 rounded-xl overflow-hidden'>
              {/* Search bar */}
              <div className='flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50'>
                <svg className='w-4 h-4 text-gray-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z' />
                </svg>
                <input
                  type='text'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder='Search members...'
                  className='w-full text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 transition-all duration-150'
                />
                {search && (
                  <button
                    type='button'
                    onClick={() => setSearch('')}
                    className='text-gray-400 hover:text-gray-600 transition-colors duration-150'
                  >
                    <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </button>
                )}
              </div>

              {/* Scrollable list */}
              <div className='max-h-40 overflow-y-auto divide-y divide-gray-100'>
                {filteredUsers.length === 0 ? (
                  <div className='flex items-center justify-center py-6 text-sm text-gray-400'>
                    {users.length === 0 ? 'Loading members...' : 'No members found'}
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.userId);
                    return (
                      <div
                        key={user.userId}
                        onClick={() => toggleUser(user.userId)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 select-none ${
                          isSelected ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-150 ${
                          isSelected ? 'bg-[#C8102E] text-white scale-105' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <span className={`flex-1 text-sm font-medium transition-colors duration-150 ${
                          isSelected ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {user.firstName} {user.lastName}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                          isSelected ? 'bg-[#C8102E] border-[#C8102E] scale-110' : 'border-gray-300 scale-100'
                        }`}>
                          {isSelected && (
                            <svg
                              className='w-3 h-3 text-white'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex space-x-4 pt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={() => {
                setShowEditMeetingModal(false);
                setEditingMeeting(null);
                setEditMeeting({
                  name: '',
                  date: '',
                  startTime: '',
                  endTime: '',
                  notes: '',
                  type: 'REGULAR'
                });
              }}
              className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-150 font-medium'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='flex-1 px-6 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors duration-150 font-medium'
            >
              Update Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMeetingModal;