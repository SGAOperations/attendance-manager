import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../profile/LoginPage';
import { User } from '@/types';

interface Meeting {
  meetingId: string;
  name: string;
  startTime: string;
  endTime: string;
  date: string;
  meetingType: 'FULL_BODY' | 'REGULAR';
  notes: string;
}

// API service functions with endpoints
const meetingAPI = {
  async getAllMeetings(): Promise<Meeting[]> {
    try {
      const response = await fetch('/api/meeting');
      console.log('getAllMeetings response status:', response.status);
      console.log(
        'getAllMeetings response headers:',
        response.headers.get('content-type')
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log('getAllMeetings error response:', errorText);
        throw new Error(
          `Failed to fetch meetings (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      console.log('getAllMeetings data:', data);
      return data;
    } catch (error) {
      console.error('getAllMeetings error:', error);
      throw error;
    }
  },

  async getMeetingsByDate(): Promise<Record<string, Meeting[]>> {
    try {
      const response = await fetch('/api/meeting/by-date');
      console.log('getMeetingsByDate response status:', response.status);
      console.log(
        'getMeetingsByDate response headers:',
        response.headers.get('content-type')
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log('getMeetingsByDate error response:', errorText);
        throw new Error(
          `Failed to fetch meetings by date (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      console.log('getMeetingsByDate data:', data);
      return data;
    } catch (error) {
      console.error('getMeetingsByDate error:', error);
      throw error;
    }
  },

  async getMeeting(meetingId: string): Promise<Meeting> {
    try {
      const response = await fetch(`/api/meeting/${meetingId}`);
      console.log('getMeeting response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('getMeeting error response:', errorText);
        throw new Error(
          `Failed to fetch meeting (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      console.log('getMeeting data:', data);
      return data;
    } catch (error) {
      console.error('getMeeting error:', error);
      throw error;
    }
  }
};

const Dashboard: React.FC = () => {
  const user = useContext<User>(UserContext);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsByDate, setMeetingsByDate] = useState<
    Record<string, Meeting[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load meetings data on component mount
  useEffect(() => {
    const loadMeetings = async () => {
      try {
        setLoading(true);
        setError(null);

        const [allMeetings, groupedMeetings] = await Promise.all([
          meetingAPI.getAllMeetings(),
          meetingAPI.getMeetingsByDate()
        ]);

        setMeetings(allMeetings);
        setMeetingsByDate(groupedMeetings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load meetings'
        );
        console.error('Error loading meetings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const hasMeeting = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return meetingsByDate[dateString] && meetingsByDate[dateString].length > 0;
  };

  const getMeetingsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return meetingsByDate[dateString] || [];
  };

  // Get meetings within the next 5 days
  const getUpcomingMeetings = () => {
    const today = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);

    return meetings
      .filter((meeting: Meeting) => {
        const meetingDate = new Date(meeting.date);
        return meetingDate >= today && meetingDate <= fiveDaysFromNow;
      })
      .sort(
        (a: Meeting, b: Meeting) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  };

  const getDisplayMeetings = () => {
    if (selectedDate) {
      return getMeetingsForDate(selectedDate);
    }
    return getUpcomingMeetings();
  };

  function formatMeetingDate(dateString: string) {
    const [year, month, day] = dateString.split('-');
    const localDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );

    return localDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  const days = getDaysInMonth(currentDate);
  const displayMeetings = getDisplayMeetings();

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading meetings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-800">Error: {error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div>{user.email}</div>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          {selectedDate
            ? `Meetings for ${selectedDate.toLocaleDateString()}`
            : 'Upcoming meetings (next 5 days)'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() - 1
                    )
                  )
                }
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1
                    )
                  )
                }
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {formatDate(currentDate)}
            </h3>
            <div className="w-16 h-1 bg-[#C8102E] rounded-full"></div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={`aspect-square p-1 ${!day ? 'bg-gray-50' : ''}`}
              >
                {day && (
                  <button
                    onClick={() => setSelectedDate(day)}
                    className={`w-full h-full flex flex-col items-center justify-center text-sm rounded-xl transition-all duration-200 ${
                      isToday(day)
                        ? 'bg-[#C8102E] text-white shadow-lg'
                        : isSelected(day)
                        ? 'bg-[#C8102E] bg-opacity-10 text-[#C8102E] border-2 border-[#C8102E]'
                        : hasMeeting(day)
                        ? 'bg-[#A4804A] bg-opacity-10 text-[#A4804A] hover:bg-[#A4804A] hover:bg-opacity-20'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{day.getDate()}</span>
                    {hasMeeting(day) && (
                      <div className="w-2 h-2 bg-[#A4804A] rounded-full mt-1"></div>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Clear Selection Button */}
          {selectedDate && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm text-[#C8102E] hover:text-[#A8102E] font-medium"
              >
                Show upcoming meetings (next 5 days)
              </button>
            </div>
          )}
        </div>

        {/* Meetings List Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedDate ? 'Scheduled Meetings' : 'Upcoming Meetings'}
            </h2>
            <span className="text-sm text-gray-500">
              {selectedDate
                ? selectedDate.toLocaleDateString()
                : `${displayMeetings.length} meetings`}
            </span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {displayMeetings.length === 0 ? (
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  {selectedDate
                    ? 'No meetings scheduled'
                    : 'No upcoming meetings'}
                </p>
                <p className="text-gray-400 text-sm">
                  {selectedDate
                    ? `for ${selectedDate.toLocaleDateString()}`
                    : 'in the next 5 days'}
                </p>
              </div>
            ) : (
              displayMeetings.map(meeting => (
                <div
                  key={meeting.meetingId}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {meeting.name}
                    </h3>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#A4804A] bg-opacity-10 text-[#A4804A]">
                      Meeting
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm">{meeting.notes}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{formatMeetingDate(meeting.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        {meeting.startTime} - {meeting.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-xs text-gray-500">
                        Meeting details
                      </span>
                    </div>
                    <button className="text-[#C8102E] hover:text-[#A8102E] text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
