import React, { useState, useEffect } from 'react';
import { Member } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

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
}

interface Attendance {
  attendanceId: string,
  userId: string,
  meetingId: string,
  status: string,
}

interface UserWithNUID extends Member {
  nuid: string;
}

interface AttendanceUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  nuid: string;
  status: string;
  attendanceId: string;
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'history'>('members');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [meetingsWithAttendance, setMeetingsWithAttendance] = useState<MeetingRecord[]>([]);
  const [users, setUsers] = useState<Member[]>([]);
  
  // New state for attendance marking and editing
  const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord | null>(null);
  const [nuidInput, setNuidInput] = useState('');
  const [attendanceUsers, setAttendanceUsers] = useState<AttendanceUser[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  
  // New state for Attendance Check flow
  const [showAttendanceCheck, setShowAttendanceCheck] = useState(false);
  const [attendanceCheckStep, setAttendanceCheckStep] = useState<'admin-verify' | 'select-meeting' | 'user-list' | 'check-in'>('admin-verify');
  const [adminNuidInput, setAdminNuidInput] = useState('');
  const [selectedMeetingForCheck, setSelectedMeetingForCheck] = useState<MeetingRecord | null>(null);
  
  // Check if user is admin (EBOARD)
  const isAdmin = user?.role === 'EBOARD';
useEffect(() => {
  const loadMeetings = async () => {
    try {
      const allMeetings = await meetingAPI.getAllMeetings();
      setMeetings(allMeetings);
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

  // Function to load attendance users for a meeting
  const loadAttendanceUsers = async (meetingId: string) => {
    setIsLoadingAttendance(true);
    try {
      // Get all users
      const allUsers = await fetch('/api/users/only-name').then(res => res.json());
      
      // Get attendance records for this meeting
      const attendances = await meetingAPI.getAttendances(meetingId);
      
      // Create a map of userId to attendance status
      const attendanceMap = new Map(
        attendances.map(a => [a.userId, { status: a.status, attendanceId: a.attendanceId }])
      );
      
      // Fetch complete user details including NUID
      const usersWithAttendance: AttendanceUser[] = await Promise.all(
        allUsers.map(async (user: Member) => {
          const userDetails = await fetch(`/api/users/${user.id}`).then(res => res.json());
          const attendance = attendanceMap.get(user.id);
          
          return {
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            nuid: userDetails.nuid || '',
            status: attendance?.status || 'PENDING',
            attendanceId: attendance?.attendanceId || ''
          };
        })
      );
      
      setAttendanceUsers(usersWithAttendance);
    } catch (error) {
      console.error('Error loading attendance users:', error);
      alert('Failed to load attendance data');
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Function to handle admin verification in Attendance Check
  const handleAdminVerification = async () => {
    if (!adminNuidInput.trim()) {
      alert('Please enter your admin NUID');
      return;
    }

    // TODO: Backend will verify admin NUID here
    // For now, just proceed to next step
    console.log('Admin NUID entered:', adminNuidInput);
    
    setAttendanceCheckStep('select-meeting');
  };

  // Function to handle meeting selection in Attendance Check
  const handleMeetingSelection = async (meeting: MeetingRecord) => {
    setSelectedMeetingForCheck(meeting);
    await loadAttendanceUsers(meeting.meetingId);
    setAttendanceCheckStep('user-list');
  };

  // Function to start check-in process
  const handleStartCheckIn = () => {
    setAttendanceCheckStep('check-in');
  };

  // Function to mark attendance via NUID in check-in mode
  const handleMarkAttendance = async () => {
    if (!nuidInput.trim() || !selectedMeetingForCheck) {
      alert('Please enter a valid NUID');
      return;
    }

    try {
      // Find user by NUID
      const userToMark = attendanceUsers.find(u => u.nuid === nuidInput.trim());
      
      if (!userToMark) {
        alert('NUID not found. Please check and try again.');
        return;
      }

      // Check if already marked as present
      if (userToMark.status === 'PRESENT' || userToMark.status === 'Present') {
        alert(`${userToMark.firstName} ${userToMark.lastName} is already marked as present!`);
        setNuidInput('');
        return;
      }

      // Update attendance status
      const response = await fetch(`/api/attendance/${userToMark.attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PRESENT' })
      });

      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }

      alert(`✓ ${userToMark.firstName} ${userToMark.lastName} marked as present!`);
      setNuidInput('');
      
      // Reload attendance data
      await loadAttendanceUsers(selectedMeetingForCheck.meetingId);
      
      // Reload meetings to update statistics
      const allMeetings = await meetingAPI.getAllMeetings();
      setMeetings(allMeetings);
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  // Function to close Attendance Check and reset
  const closeAttendanceCheck = () => {
    setShowAttendanceCheck(false);
    setAttendanceCheckStep('admin-verify');
    setAdminNuidInput('');
    setSelectedMeetingForCheck(null);
    setNuidInput('');
  };

  // Function to toggle attendance status in edit modal
  const toggleAttendanceStatus = async (attendanceId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'PRESENT' || currentStatus === 'Present' ? 'PENDING' : 'PRESENT';
      
      const response = await fetch(`/api/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }

      // Reload attendance data
      if (selectedMeeting) {
        await loadAttendanceUsers(selectedMeeting.meetingId);
        
        // Reload meetings to update statistics
        const allMeetings = await meetingAPI.getAllMeetings();
        setMeetings(allMeetings);
      }
      
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

  // Function to open edit attendance modal
  const openEditAttendanceModal = async (meeting: MeetingRecord) => {
    setSelectedMeeting(meeting);
    await loadAttendanceUsers(meeting.meetingId);
    setShowEditAttendanceModal(true);
  };
  
  const eboardMembers = users.filter(m => m.role.roleType === 'EBOARD');
  const regularMembers = users.filter(m => m.role.roleType === 'MEMBER');

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Manage SGA members and track attendance history</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAttendanceCheck(true)}
            className="px-6 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            📋 Attendance Check
          </button>
        )}
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
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#C8102E] text-white">
                    <th className="text-left py-3 px-4 font-medium">Date/Time</th>
                    <th className="text-left py-3 px-4 font-medium">Meeting</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-center py-3 px-4 font-medium"># of Members</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingsWithAttendance.map((record) => (
                    <tr key={record.meetingId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{record.date}</div>
                        <div className="text-xs text-gray-500">{record.startTime} - {record.endTime}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{record.name}</div>
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
                        <div className="flex justify-center space-x-2">
                          {isAdmin && (
                            <button 
                              onClick={() => openEditAttendanceModal(record)}
                              className="px-3 py-1 bg-[#A4804A] text-white text-xs rounded-lg hover:bg-[#8A6D3F] transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          <button className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors">
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

      {/* Attendance Check Modal - Multi-step flow */}
      {showAttendanceCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Step 1: Admin NUID Verification */}
            {attendanceCheckStep === 'admin-verify' && (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Attendance Check</h3>
                <p className="text-sm text-gray-600 mb-6">Please verify your admin credentials to continue</p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin NUID
                  </label>
                  <input
                    type="text"
                    value={adminNuidInput}
                    onChange={(e) => setAdminNuidInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAdminVerification();
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    placeholder="Enter your admin NUID"
                    autoFocus
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeAttendanceCheck}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminVerification}
                    className="flex-1 px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E]"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Select Meeting */}
            {attendanceCheckStep === 'select-meeting' && (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Meeting</h3>
                <p className="text-sm text-gray-600 mb-6">Choose the meeting to take attendance for</p>
                
                <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
                  {meetingsWithAttendance.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No meetings available</p>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {meetingsWithAttendance.map((meeting) => (
                        <button
                          key={meeting.meetingId}
                          onClick={() => handleMeetingSelection(meeting)}
                          className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-900">{meeting.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{meeting.notes}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  📅 {meeting.date}
                                </span>
                                <span className="text-xs text-gray-500">
                                  🕒 {meeting.startTime} - {meeting.endTime}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {meeting.attendedMembers}/{meeting.totalMembers}
                              </div>
                              <div className="text-xs text-[#C8102E] font-medium">
                                {meeting.percentage}%
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeAttendanceCheck}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Step 3: User List */}
            {attendanceCheckStep === 'user-list' && selectedMeetingForCheck && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedMeetingForCheck.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedMeetingForCheck.date} • {selectedMeetingForCheck.startTime} - {selectedMeetingForCheck.endTime}
                  </p>
                </div>

                {isLoadingAttendance ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8102E]"></div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700">
                          Members Expected
                        </p>
                        <p className="text-sm text-gray-600">
                          {attendanceUsers.filter(u => u.status === 'PRESENT' || u.status === 'Present').length} / {attendanceUsers.length} present
                        </p>
                      </div>
                    </div>

                    {/* User List */}
                    <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg mb-6">
                      {attendanceUsers.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No members found</p>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {attendanceUsers.map((user) => {
                            const isPresent = user.status === 'PRESENT' || user.status === 'Present';
                            return (
                              <div
                                key={user.userId}
                                className={`flex items-center space-x-3 p-3 ${
                                  isPresent ? 'bg-green-50' : 'bg-white'
                                }`}
                              >
                                <div className="w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-sm font-semibold">
                                    {user.firstName.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                {isPresent && (
                                  <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setAttendanceCheckStep('select-meeting')}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleStartCheckIn}
                        className="flex-1 px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E]"
                      >
                        Start Check-In
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Step 4: Check-In (NUID Entry) */}
            {attendanceCheckStep === 'check-in' && selectedMeetingForCheck && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Check-In</h3>
                  <p className="text-sm text-gray-600">
                    {selectedMeetingForCheck.name} • {selectedMeetingForCheck.date}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900 font-medium">
                    📱 Member Check-In Mode
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Your NUID
                  </label>
                  <input
                    type="text"
                    value={nuidInput}
                    onChange={(e) => setNuidInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleMarkAttendance();
                      }
                    }}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E]"
                    placeholder="Enter NUID (e.g., 001234567)"
                    autoFocus
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Attendance Progress</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {attendanceUsers.filter(u => u.status === 'PRESENT' || u.status === 'Present').length} / {attendanceUsers.length} present
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#C8102E] h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(attendanceUsers.filter(u => u.status === 'PRESENT' || u.status === 'Present').length / attendanceUsers.length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setAttendanceCheckStep('user-list')}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back to List
                  </button>
                  <button
                    type="button"
                    onClick={handleMarkAttendance}
                    className="flex-1 px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E]"
                  >
                    Confirm Attendance
                  </button>
                  <button
                    type="button"
                    onClick={closeAttendanceCheck}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Attendance Modal - Admin Checklist */}
      {showEditAttendanceModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Edit Attendance</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedMeeting.name} - {selectedMeeting.date}
            </p>
            
            {isLoadingAttendance ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8102E]"></div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Select members who attended:
                    </p>
                    <p className="text-sm text-gray-600">
                      {attendanceUsers.filter(u => u.status === 'PRESENT' || u.status === 'Present').length} / {attendanceUsers.length} present
                    </p>
                  </div>
                </div>

                {/* Attendance Checklist */}
                <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
                  {attendanceUsers.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No members found</p>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {attendanceUsers.map((user) => {
                        const isPresent = user.status === 'PRESENT' || user.status === 'Present';
                        return (
                          <label
                            key={user.userId}
                            className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              isPresent ? 'bg-green-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isPresent}
                              onChange={() => toggleAttendanceStatus(user.attendanceId, user.status)}
                              className="w-5 h-5 text-[#C8102E] border-gray-300 rounded focus:ring-[#C8102E]"
                            />
                            <div className="w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-semibold">
                                {user.firstName.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              <p className="text-xs text-gray-400">NUID: {user.nuid}</p>
                            </div>
                            {isPresent && (
                              <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditAttendanceModal(false);
                      setSelectedMeeting(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
