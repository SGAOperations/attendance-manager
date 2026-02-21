import { MeetingApiData } from '@/types';

interface EditMeetingModalProps {
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

const EditMeetingModal: React.FC<EditMeetingModalProps> = ({
  editMeeting,
  handleUpdateMeeting,
  setEditMeeting,
  setShowEditMeetingModal,
  setEditingMeeting
}) => {
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
                value={editMeeting.date}
                onChange={e =>
                  setEditMeeting({
                    ...editMeeting,
                    date: e.target.value
                  })
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
                value={editMeeting.startTime}
                onChange={e =>
                  setEditMeeting({
                    ...editMeeting,
                    startTime: e.target.value
                  })
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
                value={editMeeting.endTime}
                onChange={e =>
                  setEditMeeting({
                    ...editMeeting,
                    endTime: e.target.value
                  })
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
              className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='flex-1 px-6 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors font-medium'
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
