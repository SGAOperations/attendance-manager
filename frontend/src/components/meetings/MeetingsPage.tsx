import React, { useState } from 'react';

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
  const [activeTab, setActiveTab] = useState<'past' | 'upcoming'>('past');

  // Mock data for meetings and attendance - reduced to 6 rows for mockup
  const mockMeetings: MeetingRecord[] = [
    {
      id: '1',
      date: '01/07/2025',
      time: '6:00-7:00 PM',
      meetingName: 'General Meeting',
      description: 'First General Meeting of the semester',
      attendedMembers: 35,
      totalMembers: 42,
      status: 'attended',
    },
    {
      id: '2',
      date: '01/14/2025',
      time: '6:00-7:00 PM',
      meetingName: 'General Meeting',
      description: 'Second General Meeting of the semester',
      attendedMembers: 38,
      totalMembers: 42,
      status: 'attended',
    },
    {
      id: '3',
      date: '01/21/2025',
      time: '6:00-7:00 PM',
      meetingName: 'General Meeting',
      description: 'Third General Meeting of the semester',
      attendedMembers: 32,
      totalMembers: 42,
      status: 'attended',
    },
    {
      id: '4',
      date: '01/28/2025',
      time: '6:00-7:00 PM',
      meetingName: 'General Meeting',
      description: 'Fourth General Meeting of the semester',
      attendedMembers: 0,
      totalMembers: 42,
      status: 'missed',
    },
    {
      id: '5',
      date: '02/04/2025',
      time: '6:00-7:00 PM',
      meetingName: 'General Meeting',
      description: 'Fifth General Meeting of the semester',
      attendedMembers: 40,
      totalMembers: 42,
      status: 'attended',
    },
    {
      id: '6',
      date: '02/11/2025',
      time: '6:00-7:00 PM',
      meetingName: 'General Meeting',
      description: 'Sixth General Meeting of the semester',
      attendedMembers: 37,
      totalMembers: 42,
      status: 'attended',
    },
    {
      id: '7',
      date: '05/27/2025',
      time: '6:00-7:00 PM',
      meetingName: 'General Meeting',
      description: 'Twenty-first General Meeting of the semester',
      attendedMembers: 0,
      totalMembers: 42,
      status: 'upcoming',
    },
    {
      id: '8',
      date: '06/03/2025',
      time: '6:00-7:00 PM',
      meetingName: 'General Meeting',
      description: 'Twenty-second General Meeting of the semester',
      attendedMembers: 0,
      totalMembers: 42,
      status: 'upcoming',
    },
    {
      id: '9',
      date: '06/10/2025',
      time: '6:00-7:00 PM',
      meetingName: 'General Meeting',
      description: 'Twenty-third General Meeting of the semester',
      attendedMembers: 0,
      totalMembers: 42,
      status: 'upcoming',
    },
    {
      id: '10',
      date: '06/17/2025',
      time: '6:00-7:00 PM',
      meetingName: 'General Meeting',
      description: 'Twenty-fourth General Meeting of the semester',
      attendedMembers: 0,
      totalMembers: 42,
      status: 'upcoming',
    },
  ];

  // Calculate statistics
  const attendedMeetings = mockMeetings.filter(m => m.status === 'attended').length;
  const missedMeetings = mockMeetings.filter(m => m.status === 'missed').length;
  const upcomingMeetings = mockMeetings.filter(m => m.status === 'upcoming').length;

  // Filter meetings based on active tab
  const filteredMeetings = mockMeetings.filter(m => {
    if (activeTab === 'past') {
      return m.status === 'attended' || m.status === 'missed';
    } else {
      return m.status === 'upcoming';
    }
  });

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meetings</h1>
        <p className="text-gray-600">Track your meeting attendance and view meeting history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Statistics */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Meeting Statistics</h2>
            
            <div className="space-y-6">
              {/* Attended Meetings */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-[#A4804A]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Attended Meetings</h3>
                <p className="text-2xl font-bold text-[#C8102E]">{attendedMeetings}</p>
              </div>

              {/* Missed Meetings */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-[#A4804A]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Missed Meetings</h3>
                <p className="text-2xl font-bold text-[#C8102E]">{missedMeetings}</p>
              </div>

              {/* Upcoming Meetings */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-[#A4804A]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Upcoming Meetings</h3>
                <p className="text-2xl font-bold text-[#C8102E]">{upcomingMeetings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Meeting History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Meeting History</h2>
              
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Meeting</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900"># of Members</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetings.map((meeting) => (
                    <tr key={meeting.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{meeting.date}</div>
                        <div className="text-xs text-gray-500">{meeting.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{meeting.meetingName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">{meeting.description}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {meeting.status === 'upcoming' ? '-' : meeting.attendedMembers}
                        </div>
                        {meeting.status !== 'upcoming' && (
                          <div className="text-xs text-gray-500">of {meeting.totalMembers}</div>
                        )}
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
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  No {activeTab === 'past' ? 'past' : 'upcoming'} meetings
                </p>
                <p className="text-gray-400 text-sm">
                  {activeTab === 'past' 
                    ? 'No meeting history available'
                    : 'No upcoming meetings scheduled'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
