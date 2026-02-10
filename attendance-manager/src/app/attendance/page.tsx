'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AttedanceMeetingSelect from '@/components/attendance/AttendanceMeetingSelect';

import {
  MeetingApiData,
  AttendanceApiData,
  UserApiData,
  RequestApiData
} from '@/types';
import AttendanceMeetingEdit from '@/components/attendance/AttendanceMeetingEdit';
import AttedanceMeetingUserList from '@/components/attendance/AttendanceMeetingUserList';
import AttedanceMeetingCheckIn from '@/components/attendance/AttendanceMeetingCheckIn';
import AttendanceHistory from '@/components/attendance/AttendanceHistory';
import AttedanceMembers from '@/components/attendance/AttendanceMembers';

import { meetingAPI } from '@/utils/attendance_utils';
import AttendancePageRequestsModal from '@/components/attendance/AttendancePageRequestsModal';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'history'>('members');
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [meetings, setMeetings] = useState<MeetingApiData[]>([]);
  const [meetingsWithAttendance, setMeetingsWithAttendance] = useState<
    MeetingApiData[]
  >([]);
  const [users, setUsers] = useState<UserApiData[]>([]);

  // New state for attendance marking and editing
  const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingApiData | null>(
    null
  );
  const [nuidInput, setNuidInput] = useState('');
  const [attendanceUsers, setAttendanceUsers] = useState<UserApiData[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [attendanceRecord, setAttendanceRecord] = useState<
    Record<string, AttendanceApiData[]>
  >({});

  // New state for Attendance Check flow
  const [showAttendanceCheck, setShowAttendanceCheck] = useState(false);
  const [attendanceCheckStep, setAttendanceCheckStep] = useState<
    'select-meeting' | 'user-list' | 'check-in'
  >('select-meeting');
  const [
    selectedMeetingForCheck,
    setSelectedMeetingForCheck
  ] = useState<MeetingApiData | null>(null);

  // New state for Requests viewing (admin archive)
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [requests, setRequests] = useState<RequestApiData[]>([]);
  const [requestsView, setRequestsView] = useState<'active' | 'history'>(
    'active'
  );
  const [declinedRequestIds, setDeclinedRequestIds] = useState<string[]>([]);

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
    const fetchAttendanceUsers = async () => {
      if (!selectedMeetingForCheck?.meetingId) return;

      try {
        const response = await fetch(
          `/api/attendance/meeting/${selectedMeetingForCheck.meetingId}`
        );
        const allAttendance = await response.json();
        setAttendanceRecord((prev: Record<string, AttendanceApiData[]>) => ({
          ...prev,
          [selectedMeetingForCheck.meetingId]: allAttendance
        }));
      } catch (error) {
        console.error('Error fetching attendance users:', error);
      }
    };

    fetchAttendanceUsers();
  }, [selectedMeetingForCheck, attendanceUsers]);

  useEffect(() => {
    if (meetings.length === 0) return;

    const updateMeetingsWithAttendance = async () => {
      const updatedMeetings: MeetingApiData[] = [];

      for (const meeting of meetings) {
        const attendances = await meetingAPI.getAttendances(meeting.meetingId);

        const totalMembers = attendances.length;
        const attendedMembers = attendances.filter(a => a.status === 'Present')
          .length;
        const percentage =
          totalMembers === 0
            ? 0
            : Math.round((attendedMembers / totalMembers) * 100);

        updatedMeetings.push({
          ...meeting,
          totalMembers,
          attendedMembers,
          percentage
        });
        setAttendanceRecord((prev: Record<string, AttendanceApiData[]>) => ({
          ...prev,
          [meeting.meetingId]: attendances
        }));
      }
      setMeetingsWithAttendance(updatedMeetings);
    };

    updateMeetingsWithAttendance();
  }, [meetings]);

  // Function to load attendance users for a meeting
  const loadAttendanceUsers = async () => {
    setIsLoadingAttendance(true);
    try {
      // TODO (jwuchen): get members for the meeting instead of all members
      const allUsers: UserApiData[] = await fetch('/api/users').then(res =>
        res.json()
      );
      setAttendanceUsers(allUsers);
    } catch (error) {
      console.error('Error loading attendance users:', error);
      alert('Failed to load attendance data');
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Function to handle meeting selection in Attendance Check
  const handleMeetingSelection = async (meeting: MeetingApiData) => {
    setSelectedMeetingForCheck(meeting);
    await loadAttendanceUsers();
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
      const attendanceForMeeting = userToMark.attendance.find(
        attendance => attendance.meetingId === selectedMeetingForCheck.meetingId
      );
      if (
        attendanceForMeeting?.status === 'PRESENT' ||
        attendanceForMeeting?.status === 'Present'
      ) {
        alert(
          `${userToMark.firstName} ${userToMark.lastName} is already marked as present!`
        );
        setNuidInput('');
        return;
      }

      const response = await fetch('/api/users/attendance_update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userToMark.userId,
          meetingId: selectedMeetingForCheck.meetingId,
          status: 'PRESENT'
        })
      });
      const updatedUsers = attendanceUsers.map(u => {
        if (u.nuid === nuidInput.trim()) {
          return { ...u, status: 'PRESENT' }; // update just this user
        }
        return u; // keep others unchanged
      });

      setAttendanceUsers(updatedUsers);

      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }

      alert(
        `✓ ${userToMark.firstName} ${userToMark.lastName} marked as present!`
      );
      setNuidInput('');

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
    setAttendanceCheckStep('select-meeting');
    setSelectedMeetingForCheck(null);
    setNuidInput('');
  };

  // Function to toggle attendance status in edit modal
  const toggleAttendanceStatus = async (
    attendanceId: string,
    currentStatus: string,
    userId: string,
    meetingId: string
  ) => {
    try {
      const newStatus =
        currentStatus === 'PRESENT' || currentStatus === 'Present'
          ? 'PENDING'
          : 'PRESENT';
      const response = await fetch(`/api/attendance/${attendanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }

      // Reload attendance data
      if (selectedMeeting) {
        setAttendanceUsers(prev =>
          prev.map(u =>
            u.userId === userId
              ? {
                  ...u,
                  attendance: u.attendance.map(a =>
                    a.attendanceId === attendanceId
                      ? { ...a, status: newStatus }
                      : a
                  )
                }
              : u
          )
        );
        // TODO (jwuchen): either find a better way to do this or don't trigger this till edit attendance componenet is closed
        setMeetings(prevMeetings =>
          prevMeetings.map(meeting =>
            meeting.meetingId === meetingId
              ? {
                  ...meeting,
                  attendance: meeting.attendance.map(a =>
                    a.attendanceId === attendanceId
                      ? { ...a, status: newStatus }
                      : a
                  )
                }
              : meeting
          )
        );
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

  // Function to open edit attendance modal
  const openEditAttendanceModal = async (meeting: MeetingApiData) => {
    setSelectedMeeting(meeting);
    await loadAttendanceUsers();
    setShowEditAttendanceModal(true);
  };

  const eboardMembers = users.filter(m => m.role.roleType === 'EBOARD');
  const regularMembers = users.filter(m => m.role.roleType === 'MEMBER');

  return (
    <div className='flex-1 p-6 bg-gray-50'>
      {/* Header Section */}
      <div className='mb-6 flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Attendance Management
          </h1>
          <p className='text-gray-600'>
            Manage SGA members and track attendance history
          </p>
        </div>
        {isAdmin && (
          <div className='flex flex-col space-y-3'>
            <button
              onClick={() => setShowAttendanceCheck(true)}
              className='px-6 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A8102E] transition-colors font-medium shadow-lg hover:shadow-xl'
            >
              📋 Attendance Check
            </button>
            <button
              onClick={async () => {
                setShowRequestsModal(true);
                setRequestsView('active');
                try {
                  const response = await fetch('/api/requests');
                  if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                  }
                  const fetchedRequests = await response.json();
                  // Archive view: show all requests as read-only
                  setRequests(fetchedRequests || []);
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : 'Unknown error';

                  alert(`Failed to load requests: ${message}`);
                  setRequests([]);
                }
              }}
              className='px-6 py-3 bg-[#A4804A] text-white rounded-xl hover:bg-[#8A6D3F] transition-colors font-medium shadow-lg hover:shadow-xl'
            >
              📝 View Requests
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className='mb-6'>
        <div className='flex space-x-2'>
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
        <AttedanceMembers
          eboardMembers={eboardMembers}
          regularMembers={regularMembers}
        />
      ) : (
        /* Attendance History Section */
        <AttendanceHistory
          meetingsWithAttendance={meetingsWithAttendance}
          attendanceRecord={attendanceRecord}
          isAdmin={isAdmin}
          openEditAttendanceModal={openEditAttendanceModal}
        />
      )}

      {/* Bulk Add Modal */}
      {showBulkAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Bulk Add Members
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  CSV File
                </label>
                <input
                  type='file'
                  accept='.csv'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Role
                </label>
                <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]'>
                  <option value='member'>Member</option>
                  <option value='eboard'>Eboard</option>
                </select>
              </div>
              <div className='text-sm text-gray-500'>
                <p>CSV format: Name, Email</p>
                <p>Example: John Doe, john.doe@northeastern.edu</p>
              </div>
              <div className='flex space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowBulkAddModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 bg-[#A4804A] text-white rounded-lg hover:bg-[#8A6D3F]'
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
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto'>
            {/* Step 1: Select Meeting */}
            {attendanceCheckStep === 'select-meeting' && (
              <AttedanceMeetingSelect
                meetingsWithAttendance={meetingsWithAttendance}
                attendanceRecord={attendanceRecord}
                handleMeetingSelection={handleMeetingSelection}
                closeAttendanceCheck={closeAttendanceCheck}
              />
            )}

            {/* Step 2: User List */}
            {attendanceCheckStep === 'user-list' && selectedMeetingForCheck && (
              <AttedanceMeetingUserList
                selectedMeetingForCheck={selectedMeetingForCheck}
                isLoadingAttendance={isLoadingAttendance}
                attendanceUsers={attendanceUsers}
                attendanceRecord={attendanceRecord}
                setAttendanceCheckStep={setAttendanceCheckStep}
                handleStartCheckIn={handleStartCheckIn}
              />
            )}

            {/* Step 3: Check-In (NUID Entry) */}
            {attendanceCheckStep === 'check-in' && selectedMeetingForCheck && (
              <AttedanceMeetingCheckIn
                selectedMeetingForCheck={selectedMeetingForCheck}
                nuidInput={nuidInput}
                setNuidInput={setNuidInput}
                handleMarkAttendance={handleMarkAttendance}
                attendanceRecord={attendanceRecord}
                closeAttendanceCheck={closeAttendanceCheck}
                setAttendanceCheckStep={setAttendanceCheckStep}
              />
            )}
          </div>
        </div>
      )}

      {/* Edit Attendance Modal - Admin Checklist */}
      {showEditAttendanceModal && selectedMeeting && (
        <AttendanceMeetingEdit
          attendanceUsers={attendanceUsers}
          attendanceRecord={attendanceRecord}
          selectedMeeting={selectedMeeting}
          toggleAttendanceStatus={toggleAttendanceStatus}
          isLoadingAttendance={isLoadingAttendance}
          setShowEditAttendanceModal={setShowEditAttendanceModal}
          setSelectedMeeting={setSelectedMeeting}
        />
      )}

      {/* View Requests Modal - For Admins (Read-only archive with filters) */}
      {/* <AttendancePage */}
      {showRequestsModal && (
        <AttendancePageRequestsModal
          setRequestsView={setRequestsView}
          requestsView={requestsView}
          requests={requests}
          declinedRequestIds={declinedRequestIds}
          setDeclinedRequestIds={setDeclinedRequestIds}
          setShowRequestsModal={setShowRequestsModal}
          setRequests={setRequests}
        />
      )}
    </div>
  );
};

export default function Attendance() {
  return <AttendancePage />;
}
