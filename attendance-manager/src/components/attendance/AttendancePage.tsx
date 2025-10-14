import React, { useState, useEffect } from 'react';
import { Member } from '@/types';

interface MeetingRecord {
  meetingId: string;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  notes: string;
  totalMembers: number,
  attendedMembers: number;
  percentage: number;
  meetingType: 'FULL_BODY' | 'REGULAR';
}

interface Attendance {
  attendanceId: string,
  userId: string,
  meetingId: string,
  status: string,
}

// API service functions with endpoints
const meetingAPI = {
  async getAllMeetings(): Promise<MeetingRecord[]> {
    try {
      const response = await fetch('/api/meeting');
      console.log('getAllMeetings response status:', response.status);
      console.log(
        'getAllMeetings response headers:',
        response.headers.get('content-type'),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log('getAllMeetings error response:', errorText);
        throw new Error(
          `Failed to fetch meetings (${response.status}): ${errorText}`,
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

  async getAttendances(meetingId: string): Promise<Attendance[]> {
    try {
      const response = await fetch(`/api/attendance/meeting/${meetingId}`);
      console.log('getAttendance response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('getAttendances error response:', errorText);
        throw new Error(
          `Failed to fetch meeting (${response.status}): ${errorText}`,
        );
      }

      const data = await response.json();
      console.log('getAttendances data:', data);
      return data;
    } catch (error) {
      console.error('getAttendances error:', error);
      throw error;
    }
  },

  async getUsers(): Promise<Member[]> {
    try {
      const response = await fetch('/api/users/only-name');
      console.log('getAttendance response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('getUsers error response:', errorText);
        throw new Error(
          `Failed to fetch meeting (${response.status}): ${errorText}`,
        );
      }

      const data = await response.json();
      console.log('getUsers data:', data);
      return data;
    } catch (error) {
      console.error('getUsers error:', error);
      throw error;
    }
  },
};

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'history'>('members');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [meetingsWithAttendance, setMeetingsWithAttendance] = useState<MeetingRecord[]>([]);
  const [users, setUsers] = useState<Member[]>([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
useEffect(() => {
  const loadMeetings = async () => {
    try {
      const allMeetings = await meetingAPI.getAllMeetings();
      const normalized = allMeetings.map((m: any) => ({
        ...m,
        meetingType: m.meetingType ?? m.type ?? 'Unknown',
      }));
      setMeetings(normalized);
    } catch (err) {
      console.error('Error loading meetings:', err);
    }
  };

  loadMeetings();
}, []);

useEffect(() => {
  const loadUsers = async () => {
    try {
      const allUsers = await meetingAPI.getUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Error loading meetings:', err);
    }
  };

  loadUsers();
}, []);

useEffect(() => {
  if (meetings.length === 0) return;

  const updateMeetingsWithAttendance = async () => {
    const updatedMeetings: MeetingRecord[] = [];

    for (const meeting of meetings) {
      const attendances = await meetingAPI.getAttendances(meeting.meetingId);

      const totalMembers = attendances.length;
      const attendedMembers = attendances.filter(a => a.status === 'Present').length;
      const percentage = totalMembers === 0 ? 0 : Math.round((attendedMembers / totalMembers) * 100);

      updatedMeetings.push({
        ...meeting,
        totalMembers,
        attendedMembers,
        percentage,
      });
    }

    setMeetingsWithAttendance(updatedMeetings);
  };
  updateMeetingsWithAttendance();
}, [meetings]);

const meetingTypeOptions = ['ALL', 'FULL_BODY', 'REGULAR'];


const filteredMeetingsWithAttendance =
  typeFilter === 'ALL'
    ? meetingsWithAttendance
    : meetingsWithAttendance.filter(
        (m) => (m.meetingType ?? 'Unknown').trim() === typeFilter
      );
  
  const eboardMembers = users.filter(m => m.role.roleType === 'EBOARD');
  const regularMembers = users.filter(m => m.role.roleType === 'MEMBER');
  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Management</h1>
        <p className="text-gray-600">Manage SGA members and track attendance history</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-[#C8102E] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            SGA Members
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-[#C8102E] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Attendance History
          </button>
        </div>
      </div>

      {activeTab === 'members' ? (
        /* SGA Members Section */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Eboard Members */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Eboard</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {eboardMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {member.firstName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regular Members */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Members</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {regularMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {member.firstName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Attendance History Section */
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance History</h2>
            <div className="mb-4 flex items-center gap-3">
              <label className="text-sm text-gray-700">Filter by type:</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  >
                    {meetingTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === 'ALL'
                          ? 'All'
                          : opt === 'FULL_BODY'
                          ? 'Full Body'
                          : opt === 'REGULAR'
                          ? 'Regular'
                          : opt}
                      </option>
                      ))}
                  </select>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#C8102E] text-white">
                    <th className="text-left py-3 px-4 font-medium">Date/Time</th>
                    <th className="text-left py-3 px-4 font-medium">Meeting</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-center py-3 px-4 font-medium"># of Members</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetingsWithAttendance.map((record) => (
                    <tr key={record.meetingId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{record.date}</div>
                        <div className="text-xs text-gray-500">{record.startTime} - {record.endTime}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{record.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
                            {record.meetingType ?? 'Unknown'}
                            </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">{record.notes}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm font-medium text-gray-900">{record.attendedMembers}</div>
                        <div className="text-xs text-gray-500">of {record.totalMembers}</div>
                        <div className="text-xs text-[#C8102E] font-medium">{record.percentage}%</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Buttons */}
      {activeTab === 'members' && (
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E] transition-colors"
          >
            + Add Member
          </button>
          <button
            onClick={() => setShowBulkAddModal(true)}
            className="px-4 py-2 bg-[#A4804A] text-white rounded-lg hover:bg-[#8A6D3F] transition-colors"
          >
            + Bulk Add Members
          </button>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Member</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  placeholder="Enter member name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  placeholder="Enter member email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]">
                  <option value="member">Member</option>
                  <option value="eboard">Eboard</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E]"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Add Members</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]">
                  <option value="member">Member</option>
                  <option value="eboard">Eboard</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                <p>CSV format: Name, Email</p>
                <p>Example: John Doe, john.doe@northeastern.edu</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#A4804A] text-white rounded-lg hover:bg-[#8A6D3F]"
                >
                  Upload & Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
