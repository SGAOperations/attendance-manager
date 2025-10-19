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
  
  // Check if user is admin (EBOARD)
  const isAdmin = user?.role === 'EBOARD';

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

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meetings</h1>
        <p className="text-gray-600">
          Track your meeting attendance and view meeting history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Statistics */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Meeting Statistics
            </h2>

            <div className="space-y-6">
              {/* Attended Meetings */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg
                    className="w-8 h-8 text-[#A4804A]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  Attended Meetings
                </h3>
                <p className="text-2xl font-bold text-[#C8102E]">
                  {attendedMeetings}
                </p>
              </div>

              {/* Missed Meetings */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg
                    className="w-8 h-8 text-[#A4804A]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  Missed Meetings
                </h3>
                <p className="text-2xl font-bold text-[#C8102E]">
                  {missedMeetings}
                </p>
              </div>

              {/* Upcoming Meetings */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg
                    className="w-8 h-8 text-[#A4804A]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  Upcoming Meetings
                </h3>
                <p className="text-2xl font-bold text-[#C8102E]">
                  {upcomingMeetings}
                </p>
              </div>
            </div>
          </div>

          {/* Create Meeting Button - Only for Admins */}
          {isAdmin && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateMeetingModal(true)}
                className="w-full px-4 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                + Create New Meeting
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Meeting History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Meeting History
              </h2>

              {/* Tab Buttons */}
              <div className="flex space-x-2">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Meeting
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Description
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">
                      # of Members
                    </th>
                  </tr>
                </thead>
                <tbody>
                {filteredMeetings.map(meeting => (
                  <tr
                    key={meeting.meetingId}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        {new Date(meeting.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {meeting.startTime} - {meeting.endTime}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">
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
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        {meeting.notes}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {meeting.attendance.length}
                      </div>
                      <div className="text-xs text-gray-500">
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
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  No {activeTab === 'past' ? 'past' : 'upcoming'} meetings
                </p>
                <p className="text-gray-400 text-sm">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Create New Meeting
            </h3>
            <form className="space-y-6">
              {/* Meeting Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Name
                </label>
                <input
                  type="text"
                  value={newMeeting.name}
                  onChange={e =>
                    setNewMeeting(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]"
                  placeholder="Enter meeting name"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={e =>
                      setNewMeeting(prev => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newMeeting.startTime}
                    onChange={e =>
                      setNewMeeting(prev => ({
                        ...prev,
                        startTime: e.target.value
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newMeeting.endTime}
                    onChange={e =>
                      setNewMeeting(prev => ({
                        ...prev,
                        endTime: e.target.value
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newMeeting.notes || ''}
                  onChange={e =>
                    setNewMeeting(prev => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]"
                  placeholder="Enter meeting notes or agenda"
                  rows={3}
                />
              </div>

              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Type
                </label>
                <select
                  value={newMeeting.type || 'REGULAR'}
                  onChange={e =>
                    setNewMeeting(prev => ({ ...prev, type: e.target.value as 'FULL_BODY' | 'REGULAR' }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]"
                >
                  <option value="REGULAR">Regular Meeting</option>
                  <option value="FULL_BODY">Full Body Meeting</option>
                </select>
              </div>

              {/* Attendees Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Attendees
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-xl p-4 space-y-3">
                  {members.map(member => (
                    <label
                      key={member.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
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
                        className="w-4 h-4 text-[#C8102E] border-gray-300 rounded focus:ring-[#C8102E]"
                      />
                      <div className="w-8 h-8 bg-[#C8102E] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {member.firstName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{member.email}</p>
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
                <p className="text-sm text-gray-500 mt-2">
                  {newMeeting.selectedAttendees.length} member(s) selected
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
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
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors font-medium"
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
                          attendeeIds: newMeeting.selectedAttendees, // Send attendee IDs to backend
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
    </div>
  );
};

export default MeetingsPage;
