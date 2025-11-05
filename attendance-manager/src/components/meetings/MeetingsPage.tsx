import React, { useEffect, useState } from 'react';
import { MeetingApiData, Member } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface MeetingRecord {
  id: string;
  date: string;
  time: string;
  meetingName: string;
  description: string;
  attendedMembers: number;
  totalMembers: number;
  status: 'attended' | 'missed' | 'upcoming';
}

const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'past' | 'upcoming'>('past');
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
    type: 'REGULAR' as 'FULL_BODY' | 'REGULAR',
    selectedAttendees: [] as string[]
  });
  const [meetings, setMeetings] = useState<MeetingApiData[]>([]);
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [showMyRequestsModal, setShowMyRequestsModal] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [requestForm, setRequestForm] = useState({
    selectedMeetings: [] as string[],
    requestTypes: {
      leavingEarly: false,
      comingLate: false,
      goingOnline: false
    },
    explanation: ''
  });
  
  // Check if user is admin (EBOARD)
  const isAdmin = user?.role === 'EBOARD';
  const isMember = user?.role === 'MEMBER';

  useEffect(() => {
    fetch('/api/meeting')
      .then(response => response.json())
      .then(json => {
        console.log(json);
        setMeetings(json);
      })
      .catch(error => console.error(error));
  }, []);

  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then(response => response.json())
      .then(json => {
        setMembers(json.map((u: any) => ({
          id: u.userId,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
          joinDate: new Date(),
          status: 'active'
        })));
      })
      .catch(error => console.error(error));
  }, []);

  // Calculate statistics from real meetings
  const today = new Date();
  // Calculate statistics from real data
  const attendedMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.date);
    if (meetingDate > today) return false; // Skip upcoming meetings
    // Check if current user attended this meeting
    return m.attendance.some(a => a.userId === user?.id && a.status === 'PRESENT');
  }).length;

  const missedMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.date);
    if (meetingDate > today) return false; // Skip upcoming meetings
    // Check if current user was absent
    return m.attendance.some(a => 
      a.userId === user?.id && 
      (a.status === 'UNEXCUSED_ABSENCE' || a.status === 'EXCUSED_ABSENCE')
    );
  }).length;

  const upcomingMeetings = meetings.filter(m => new Date(m.date) > today).length;

  // Filter meetings based on active tab
  const filteredMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.date);
    if (activeTab === 'past') {
      return meetingDate <= today;
    } else {
      return meetingDate > today;
    }
  });

  // Get upcoming meetings for request creation
  const upcomingMeetingsList = meetings.filter(m => new Date(m.date) > today);

  // Handle request submission
  const handleSubmitRequest = async () => {
    if (!user?.id) {
      alert('User not logged in');
      return;
    }

    if (requestForm.selectedMeetings.length === 0) {
      alert('Please select at least one meeting');
      return;
    }

    if (!requestForm.requestTypes.leavingEarly && 
        !requestForm.requestTypes.comingLate && 
        !requestForm.requestTypes.goingOnline) {
      alert('Please select at least one request type');
      return;
    }

    if (!requestForm.explanation.trim()) {
      alert('Please provide an explanation');
      return;
    }

    // Map frontend form data to backend format
    // attendanceMode: if goingOnline is checked, use ONLINE, otherwise IN_PERSON
    const attendanceMode = requestForm.requestTypes.goingOnline ? 'ONLINE' : 'IN_PERSON';
    
    // timeAdjustment: can only have one (leavingEarly or comingLate)
    let timeAdjustment: 'ARRIVING_LATE' | 'LEAVING_EARLY' | undefined = undefined;
    if (requestForm.requestTypes.leavingEarly && requestForm.requestTypes.comingLate) {
      alert('Please select only one time adjustment (either leaving early OR coming late)');
      return;
    } else if (requestForm.requestTypes.leavingEarly) {
      timeAdjustment = 'LEAVING_EARLY';
    } else if (requestForm.requestTypes.comingLate) {
      timeAdjustment = 'ARRIVING_LATE';
    }

    try {
      // For each selected meeting, get or create attendance record, then create request
      const requests = [];
      for (const meetingId of requestForm.selectedMeetings) {
        // Use the attendance_update endpoint which uses upsertAttendance
        // This will create or update the attendance record
        const attendanceResponse = await fetch('/api/users/attendance_update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            meetingId: meetingId,
            status: 'UNEXCUSED_ABSENCE'
          })
        });

        if (!attendanceResponse.ok) {
          throw new Error(`Failed to create/update attendance for meeting ${meetingId}`);
        }

        // Fetch the user's attendance to find the one we just created/updated
        const userAttendanceResponse = await fetch(`/api/attendance/user/${user.id}`);
        if (!userAttendanceResponse.ok) {
          throw new Error('Failed to fetch attendance record'); // single quotes
        }
        
        const userAttendance = await userAttendanceResponse.json();
        const attendanceRecord = userAttendance.find((a: any) => a.meetingId === meetingId);
        
        if (!attendanceRecord || !attendanceRecord.attendanceId) {
          throw new Error(`Attendance record not found for meeting ${meetingId}`);
        }

        const attendanceId = attendanceRecord.attendanceId;

        // Now create the request
        const requestPayload: any = {
          attendanceId,
          reason: requestForm.explanation,
          attendanceMode
        };
        
        if (timeAdjustment) {
          requestPayload.timeAdjustment = timeAdjustment;
        }

        const requestResponse = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });

        if (!requestResponse.ok) {
          const errorData = await requestResponse.json();
          throw new Error(errorData.error || `Failed to create request for meeting ${meetingId}`);
        }

        const newRequest = await requestResponse.json();
        requests.push(newRequest);
      }

      alert(`Successfully created ${requests.length} request(s)!`);
      
      // Reset form and close modal
      setRequestForm({
        selectedMeetings: [],
        requestTypes: {
          leavingEarly: false,
          comingLate: false,
          goingOnline: false
        },
        explanation: ''
      });
      setShowCreateRequestModal(false);
    } catch (error: any) {
      console.error('Error creating request:', error);
      alert(`Failed to create request: ${error.message}`);
    }
  };

  return (
    <div className='flex-1 p-6 bg-gray-50'>
      {/* Header Section */}
      <div className='mb-6 flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Meetings</h1>
          <p className='text-gray-600'>
            Track your meeting attendance and view meeting history
          </p>
        </div>
        {isMember && (
          <div className='flex flex-col space-y-3'>
            <button
              onClick={() => setShowCreateRequestModal(true)}
              className='px-6 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors font-medium shadow-lg hover:shadow-xl'
            >
              📝 Create Request
            </button>
            <button
              onClick={async () => {
                setShowMyRequestsModal(true);
                try {
                  // Fetch all requests
                  const response = await fetch('/api/requests');
                  if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                  }
                  const allRequests = await response.json();
                  // Filter requests for current user
                  const userRequests = allRequests.filter((req: any) => 
                    req.attendance?.user?.userId === user?.id
                  );
                  setMyRequests(userRequests || []);
                } catch (error: any) {
                  console.error('Error fetching my requests:', error);
                  alert(`Failed to load requests: ${error.message}`);
                  setMyRequests([]);
                }
              }}
              className='px-6 py-3 bg-[#A4804A] text-white rounded-xl hover:bg-[#8A6D3F] transition-colors font-medium shadow-lg hover:shadow-xl'
            >
              📋 View My Requests
            </button>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Panel - Statistics */}
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
            <div className='mt-6'>
              <button
                onClick={() => setShowCreateMeetingModal(true)}
                className='w-full px-4 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors font-medium shadow-lg hover:shadow-xl'
              >
                + Create New Meeting
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Meeting History */}
        <div className='lg:col-span-2'>
          <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Meeting History
              </h2>

              {/* Tab Buttons */}
              <div className='flex space-x-2'>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'past'
                      ? 'bg-[#C8102E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Past Meetings
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'upcoming'
                      ? 'bg-[#C8102E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Upcoming Meetings
                </button>
              </div>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-3 px-4 font-medium text-gray-900'>
                      Date
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900'>
                      Meeting
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900'>
                      Description
                    </th>
                    <th className='text-right py-3 px-4 font-medium text-gray-900'>
                      # of Members
                    </th>
                  </tr>
                </thead>
                <tbody>
                {filteredMeetings.map(meeting => (
                  <tr
                    key={meeting.meetingId}
                    className='border-b border-gray-100 hover:bg-gray-50'
                  >
                    <td className='py-3 px-4'>
                      <div className='text-sm text-gray-900'>
                        {new Date(meeting.date).toLocaleDateString()}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {meeting.startTime} - {meeting.endTime}
                      </div>
                    </td>
                    <td className='py-3 px-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {meeting.name}
                      </div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        meeting.type === 'FULL_BODY'
                          ? 'bg-[#C8102E] bg-opacity-10 text-[#C8102E]'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {meeting.type === 'FULL_BODY' ? 'Full Body' : 'Regular'}
                      </span>
                    </td>
                    <td className='py-3 px-4'>
                      <div className='text-sm text-gray-600'>
                        {meeting.notes}
                      </div>
                    </td>
                    <td className='py-3 px-4 text-right'>
                      <div className='text-sm font-medium text-gray-900'>
                        {meeting.attendance.length}
                      </div>
                      <div className='text-xs text-gray-500'>
                        attendees
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredMeetings.length === 0 && (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <p className='text-gray-500 text-lg font-medium'>
                  No {activeTab === 'past' ? 'past' : 'upcoming'} meetings
                </p>
                <p className='text-gray-400 text-sm'>
                  {activeTab === 'past'
                    ? 'No meeting history available'
                    : 'No upcoming meetings scheduled'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateMeetingModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Create New Meeting
            </h3>
            <form className='space-y-6'>
              {/* Meeting Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Meeting Name
                </label>
                <input
                  type='text'
                  value={newMeeting.name}
                  onChange={e =>
                    setNewMeeting(prev => ({ ...prev, name: e.target.value }))
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
                    value={newMeeting.date}
                    onChange={e =>
                      setNewMeeting(prev => ({ ...prev, date: e.target.value }))
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
                    value={newMeeting.startTime}
                    onChange={e =>
                      setNewMeeting(prev => ({
                        ...prev,
                        startTime: e.target.value
                      }))
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
                    value={newMeeting.endTime}
                    onChange={e =>
                      setNewMeeting(prev => ({
                        ...prev,
                        endTime: e.target.value
                      }))
                    }
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Notes
                </label>
                <textarea
                  value={newMeeting.notes || ''}
                  onChange={e =>
                    setNewMeeting(prev => ({ ...prev, notes: e.target.value }))
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
                  placeholder='Enter meeting notes or agenda'
                  rows={3}
                />
              </div>

              {/* Meeting Type */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Meeting Type
                </label>
                <select
                  value={newMeeting.type || 'REGULAR'}
                  onChange={e =>
                    setNewMeeting(prev => ({ ...prev, type: e.target.value as 'FULL_BODY' | 'REGULAR' }))
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
                >
                  <option value='REGULAR'>Regular Meeting</option>
                  <option value='FULL_BODY'>Full Body Meeting</option>
                </select>
              </div>

              {/* Attendees Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Select Attendees
                </label>
                <div className='max-h-48 overflow-y-auto border border-gray-300 rounded-xl p-4 space-y-3'>
                  {members.map(member => (
                    <label
                      key={member.id}
                      className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={newMeeting.selectedAttendees.includes(
                          member.id
                        )}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewMeeting(prev => ({
                              ...prev,
                              selectedAttendees: [
                                ...prev.selectedAttendees,
                                member.id
                              ]
                            }));
                          } else {
                            setNewMeeting(prev => ({
                              ...prev,
                              selectedAttendees: prev.selectedAttendees.filter(
                                id => id !== member.id
                              )
                            }));
                          }
                        }}
                        className='w-4 h-4 text-[#C8102E] border-gray-300 rounded focus:ring-[#C8102E]'
                      />
                      <div className='w-8 h-8 bg-[#C8102E] rounded-full flex items-center justify-center'>
                        <span className='text-white text-sm font-semibold'>
                          {member.firstName.charAt(0)}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900'>
                          {member.firstName} {member.lastName}
                        </p>
                        <p className='text-xs text-gray-500'>{member.email}</p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            member.role.roleType === 'EBOARD'
                              ? 'bg-[#A4804A] text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {member.role.roleType === 'EBOARD' ? 'Eboard' : 'Member'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                <p className='text-sm text-gray-500 mt-2'>
                  {newMeeting.selectedAttendees.length} member(s) selected
                </p>
              </div>

              {/* Action Buttons */}
              <div className='flex space-x-4 pt-6 border-t border-gray-200'>
                <button
                  type='button'
                  onClick={() => {
                    setShowCreateMeetingModal(false);
                    setNewMeeting({
                      name: '',
                      date: '',
                      startTime: '',
                      endTime: '',
                      notes: '',
                      type: 'REGULAR',
                      selectedAttendees: []
                    });
                  }}
                  className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-6 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors font-medium'
                  onClick={async (e) => {
                    e.preventDefault();
                    
                    try {
                      const response = await fetch('/api/meeting', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          name: newMeeting.name,
                          date: newMeeting.date,
                          startTime: newMeeting.startTime,
                          endTime: newMeeting.endTime,
                          notes: newMeeting.notes,
                          type: newMeeting.type,
                          attendeeIds: newMeeting.selectedAttendees,
                        }),
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to create meeting');
                      }
                      
                      const createdMeeting = await response.json();
                      console.log('Meeting created:', createdMeeting);
                      
                      // Refresh meetings list
                      const meetingsResponse = await fetch('/api/meeting');
                      const updatedMeetings = await meetingsResponse.json();
                      setMeetings(updatedMeetings);
                      
                      // Close modal and reset form
                      setShowCreateMeetingModal(false);
                      setNewMeeting({
                        name: '',
                        date: '',
                        startTime: '',
                        endTime: '',
                        notes: '',
                        type: 'REGULAR',
                        selectedAttendees: []
                      });
                      
                      alert('Meeting created successfully!');
                    } catch (error) {
                      console.error('Error creating meeting:', error);
                      alert('Failed to create meeting. Please try again.');
                    }
                  }}
                >
                  Create Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Request Modal - For Members */}
      {showCreateRequestModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Create Attendance Request
            </h3>
            
            {/* Select Upcoming Meetings */}
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-3'>
                Select Meeting(s)
              </label>
              <div className='max-h-48 overflow-y-auto border border-gray-300 rounded-xl p-4 space-y-3'>
                {upcomingMeetingsList.length === 0 ? (
                  <p className='text-center py-4 text-gray-500'>No upcoming meetings available</p>
                ) : (
                  upcomingMeetingsList.map(meeting => (
                    <label
                      key={meeting.meetingId}
                      className='flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={requestForm.selectedMeetings.includes(meeting.meetingId)}
                        onChange={e => {
                          if (e.target.checked) {
                            setRequestForm(prev => ({
                              ...prev,
                              selectedMeetings: [...prev.selectedMeetings, meeting.meetingId]
                            }));
                          } else {
                            setRequestForm(prev => ({
                              ...prev,
                              selectedMeetings: prev.selectedMeetings.filter(
                                id => id !== meeting.meetingId
                              )
                            }));
                          }
                        }}
                        className='w-4 h-4 text-[#C8102E] border-gray-300 rounded focus:ring-[#C8102E]'
                      />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900'>
                          {meeting.name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {new Date(meeting.date).toLocaleDateString()} • {meeting.startTime} - {meeting.endTime}
                        </p>
                        {meeting.notes && (
                          <p className='text-xs text-gray-400 mt-1'>{meeting.notes}</p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className='text-sm text-gray-500 mt-2'>
                {requestForm.selectedMeetings.length} meeting(s) selected
              </p>
            </div>

            {/* Request Type Checkboxes */}
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-3'>
                Request Type
              </label>
              <div className='space-y-3'>
                <label className='flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={requestForm.requestTypes.leavingEarly}
                    onChange={e =>
                      setRequestForm(prev => ({
                        ...prev,
                        requestTypes: {
                          ...prev.requestTypes,
                          leavingEarly: e.target.checked
                        }
                      }))
                    }
                    className='w-4 h-4 text-[#C8102E] border-gray-300 rounded focus:ring-[#C8102E]'
                  />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>Leaving Early</p>
                    <p className='text-xs text-gray-500'>I need to leave the meeting early</p>
                  </div>
                </label>

                <label className='flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={requestForm.requestTypes.comingLate}
                    onChange={e =>
                      setRequestForm(prev => ({
                        ...prev,
                        requestTypes: {
                          ...prev.requestTypes,
                          comingLate: e.target.checked
                        }
                      }))
                    }
                    className='w-4 h-4 text-[#C8102E] border-gray-300 rounded focus:ring-[#C8102E]'
                  />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>Coming Late</p>
                    <p className='text-xs text-gray-500'>I will arrive late to the meeting</p>
                  </div>
                </label>

                <label className='flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={requestForm.requestTypes.goingOnline}
                    onChange={e =>
                      setRequestForm(prev => ({
                        ...prev,
                        requestTypes: {
                          ...prev.requestTypes,
                          goingOnline: e.target.checked
                        }
                      }))
                    }
                    className='w-4 h-4 text-[#C8102E] border-gray-300 rounded focus:ring-[#C8102E]'
                  />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>Attending Online</p>
                    <p className='text-xs text-gray-500'>I will attend the meeting online instead of in person</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Explanation Text Box */}
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Explanation
              </label>
              <textarea
                value={requestForm.explanation}
                onChange={e =>
                  setRequestForm(prev => ({ ...prev, explanation: e.target.value }))
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]'
                placeholder='Please provide a brief explanation for your request...'
                rows={4}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className='flex space-x-4 pt-6 border-t border-gray-200'>
              <button
                type='button'
                onClick={() => {
                  setShowCreateRequestModal(false);
                  setRequestForm({
                    selectedMeetings: [],
                    requestTypes: {
                      leavingEarly: false,
                      comingLate: false,
                      goingOnline: false
                    },
                    explanation: ''
                  });
                }}
                className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleSubmitRequest}
                className='flex-1 px-6 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors font-medium'
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View My Requests Modal - For Members */}
      {showMyRequestsModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              My Submitted Requests
            </h3>
            
            {myRequests.length === 0 ? (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <p className='text-gray-500 text-lg font-medium'>No requests found</p>
                <p className='text-gray-400 text-sm'>You haven't submitted any attendance requests yet.</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {myRequests.map((request) => (
                  <div
                    key={request.requestId}
                    className='border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow'
                  >
                    <div className='flex justify-between items-start mb-4'>
                      <div className='flex-1'>
                        {/* Meeting Info */}
                        <div className='mb-3'>
                          <h4 className='text-lg font-semibold text-gray-900 mb-1'>
                            {request.attendance.meeting.name}
                          </h4>
                          <div className='flex items-center space-x-4 text-sm text-gray-600 mb-2'>
                            <div className='flex items-center space-x-1'>
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
                              <span>{new Date(request.attendance.meeting.date).toLocaleDateString()}</span>
                            </div>
                            <div className='flex items-center space-x-1'>
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
                              <span>{request.attendance.meeting.startTime} - {request.attendance.meeting.endTime}</span>
                            </div>
                          </div>
                          {request.attendance.meeting.notes && (
                            <p className='text-xs text-gray-500 mt-1'>{request.attendance.meeting.notes}</p>
                          )}
                        </div>

                        {/* Request Details */}
                        <div className='bg-gray-50 rounded-lg p-3 mb-3'>
                          <div className='flex flex-wrap gap-2 mb-2'>
                            {request.attendanceMode === 'ONLINE' && (
                              <span className='inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'>
                                🌐 Attending Online
                              </span>
                            )}
                            {request.attendanceMode === 'IN_PERSON' && (
                              <span className='inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full'>
                                👤 Attending In Person
                              </span>
                            )}
                            {request.timeAdjustment === 'ARRIVING_LATE' && (
                              <span className='inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full'>
                                ⏰ Arriving Late
                              </span>
                            )}
                            {request.timeAdjustment === 'LEAVING_EARLY' && (
                              <span className='inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full'>
                                🚪 Leaving Early
                              </span>
                            )}
                          </div>
                          <p className='text-sm text-gray-700'>
                            <span className='font-medium'>Explanation: </span>
                            {request.reason}
                          </p>
                        </div>

                        {/* Request Status */}
                        <div className='mt-3'>
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            request.attendance?.status === 'EXCUSED_ABSENCE' 
                              ? 'bg-green-100 text-green-800'
                              : request.attendance?.status === 'UNEXCUSED_ABSENCE'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {request.attendance?.status === 'EXCUSED_ABSENCE' 
                              ? '✓ Approved'
                              : request.attendance?.status === 'UNEXCUSED_ABSENCE'
                              ? '⏳ Pending'
                              : 'Pending Review'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Close Button */}
            <div className='flex justify-end mt-6 pt-6 border-t border-gray-200'>
              <button
                type='button'
                onClick={() => setShowMyRequestsModal(false)}
                className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
