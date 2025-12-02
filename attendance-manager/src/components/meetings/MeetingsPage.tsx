import React, { useEffect, useMemo, useState } from 'react';
import {
  MeetingApiData,
  UserApiData,
  RequestApiData,
  RemainingAbsences,
  MeetingType,
  RequestForm
} from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import VotingModal, { VotingType } from './VotingModal';
import ViewRequestsPanel from './ViewRequestsPanel';
import ViewRequestsModal from './ViewRequestsModal';
import AbsencesBanner from './AbsencesBanner';
import MeetingStatisticsPanel from './MeetingStatisticsPanel';
import MeetingHistoryPanel from './MeetingHistoryPanel';
import CreateMeetingModal from './CreateMeetingModal';
import EditMeetingModal from './EditMeetingModal';
import CreateRequestModal from './CreateRequestModal';

const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'past' | 'upcoming'>('past');
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingApiData | null>(
    null
  );
  const [newMeeting, setNewMeeting] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
    type: 'REGULAR' as MeetingType, // defaults to REGULAR
    selectedAttendees: [] as string[]
  });
  const [editMeeting, setEditMeeting] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
    type: 'REGULAR' as 'FULL_BODY' | 'REGULAR'
  });
  const [meetings, setMeetings] = useState<MeetingApiData[]>([]);
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [showMyRequestsModal, setShowMyRequestsModal] = useState(false);
  const [myRequests, setMyRequests] = useState<RequestApiData[]>([]);
  const [requestForm, setRequestForm] = useState<RequestForm>({
    selectedMeetings: [] as string[],
    requestTypes: {
      leavingEarly: false,
      comingLate: false,
      goingOnline: false
    },
    explanation: ''
  });
  const [typeFilter, setTypeFilter] = useState<MeetingType | null>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [selectedVotingType, setSelectedVotingType] = useState<VotingType | null>(null);

  // Check if user is admin (EBOARD)
  const isAdmin = user?.role === 'EBOARD';
  const isMember = user?.role === 'MEMBER';
  const [
    remainingAbsences,
    setRemainingAbsences
  ] = useState<RemainingAbsences | null>(null);

  const fetchMeetings = () => {
    fetch('/api/meeting')
      .then(response => response.json())
      .then(json => {
        console.log(json);
        setMeetings(json);
      })
      .catch(error => console.error(error));
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleEditMeeting = (meeting: MeetingApiData) => {
    setEditingMeeting(meeting);
    setEditMeeting({
      name: meeting.name,
      date: meeting.date,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      notes: meeting.notes,
      type: meeting.type as 'FULL_BODY' | 'REGULAR'
    });
    setShowEditMeetingModal(true);
  };

  const handleUpdateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;

    try {
      const response = await fetch(`/api/meeting/${editingMeeting.meetingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editMeeting)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(
          `Failed to update meeting: ${errorData.error || 'Unknown error'}`
        );
        return;
      }

      const updatedMeeting = await response.json();
      console.log('Meeting updated:', updatedMeeting);

      // Refresh meetings list
      fetchMeetings();

      // Close modal and reset
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
      alert('Meeting updated successfully!');
    } catch (error) {
      console.error('Error updating meeting:', error);
      alert('Failed to update meeting. Please try again.');
    }
  };

  // Fetch remaining unexcused absences
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/attendance/user/${user.id}/remaining-absences`)
        .then(response => response.json())
        .then((data: RemainingAbsences) => {
          setRemainingAbsences(data);
        })
        .catch(error => {
          console.error('Failed to fetch remaining absences:', error);
        });
    }
  }, [user]);

  const [members, setMembers] = useState<UserApiData[]>([]);
  const [bulkSelectionActive, setBulkSelectionActive] = useState({
    nonEboard: false,
    allMembers: false
  });

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched members:', data); // <-- check this
        setMembers(data);
      })
      .catch(err => console.error(err));
  }, []);

  const nonEboardMembers = useMemo(
    () => members.filter(member => member.role.roleType !== 'EBOARD'),
    [members]
  );
  const nonEboardMemberIds = useMemo(
    () => nonEboardMembers.map(member => member.userId),
    [nonEboardMembers]
  );
  const allMemberIds = useMemo(() => members.map(member => member.userId), [
    members
  ]);
  const selectedAttendeeSet = useMemo(
    () => new Set(newMeeting.selectedAttendees),
    [newMeeting.selectedAttendees]
  );

  const bulkSelectButtonClasses = (active: boolean) =>
    `px-3 py-1 text-xs font-medium border rounded-full transition-colors ${
      active
        ? 'bg-[#C8102E] text-white border-[#C8102E]'
        : 'text-gray-700 border-gray-300 hover:bg-gray-100'
    }`;

  const toggleNonEboardSelection = () => {
    if (bulkSelectionActive.nonEboard) {
      setNewMeeting(prev => ({
        ...prev,
        selectedAttendees: prev.selectedAttendees.filter(
          id => !nonEboardMemberIds.includes(id)
        )
      }));
      setBulkSelectionActive(prev => ({ ...prev, nonEboard: false }));
    } else {
      setNewMeeting(prev => ({
        ...prev,
        selectedAttendees: nonEboardMemberIds
      }));
      setBulkSelectionActive({ nonEboard: true, allMembers: false });
    }
  };

  const toggleAllMembersSelection = () => {
    if (bulkSelectionActive.allMembers) {
      setNewMeeting(prev => ({ ...prev, selectedAttendees: [] }));
      setBulkSelectionActive(prev => ({ ...prev, allMembers: false }));
    } else {
      setNewMeeting(prev => ({ ...prev, selectedAttendees: allMemberIds }));
      setBulkSelectionActive({ nonEboard: false, allMembers: true });
    }
  };

  useEffect(() => {
    if (!bulkSelectionActive.nonEboard) return;
    const allSelected =
      nonEboardMemberIds.length > 0 &&
      nonEboardMemberIds.every(id => selectedAttendeeSet.has(id));
    if (!allSelected) {
      setBulkSelectionActive(prev => ({ ...prev, nonEboard: false }));
    }
  }, [bulkSelectionActive.nonEboard, nonEboardMemberIds, selectedAttendeeSet]);

  useEffect(() => {
    if (!bulkSelectionActive.allMembers) return;
    const allSelected =
      allMemberIds.length > 0 &&
      allMemberIds.every(id => selectedAttendeeSet.has(id));
    if (!allSelected) {
      setBulkSelectionActive(prev => ({ ...prev, allMembers: false }));
    }
  }, [bulkSelectionActive.allMembers, allMemberIds, selectedAttendeeSet]);

  // Calculate statistics from real meetings
  const today = new Date();
  // Calculate statistics from real data
  const attendedMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.date);
    if (meetingDate > today) return false; // Skip upcoming meetings
    // Check if current user attended this meeting
    return m.attendance.some(
      a => a.userId === user?.id && a.status === 'PRESENT'
    );
  }).length;

  const missedMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.date);
    if (meetingDate > today) return false; // Skip upcoming meetings
    // Check if current user was absent
    return m.attendance.some(
      a =>
        a.userId === user?.id &&
        (a.status === 'UNEXCUSED_ABSENCE' || a.status === 'EXCUSED_ABSENCE')
    );
  }).length;

  const upcomingMeetings = meetings.filter(m => new Date(m.date) > today)
    .length;

  // Filter meetings based on active tab
  const filteredMeetings = meetings.filter(m => {
    // change to 'meetings' for implementation
    const meetingDate = new Date(m.date);
    if (activeTab === 'past') {
      return meetingDate <= today;
    } else {
      return meetingDate > today;
    }
  });
  function parseEST(dateString: string) {
    return new Date(`${dateString}T00:00:00-05:00`);
  }

  // Get upcoming meetings for request creation
  const upcomingMeetingsList = meetings.filter(m => parseEST(m.date) > today);

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

    if (
      !requestForm.requestTypes.leavingEarly &&
      !requestForm.requestTypes.comingLate &&
      !requestForm.requestTypes.goingOnline
    ) {
      alert('Please select at least one request type');
      return;
    }

    if (!requestForm.explanation.trim()) {
      alert('Please provide an explanation');
      return;
    }

    // Map frontend form data to backend format
    // attendanceMode: if goingOnline is checked, use ONLINE, otherwise IN_PERSON
    const attendanceMode = requestForm.requestTypes.goingOnline
      ? 'ONLINE'
      : 'IN_PERSON';

    // timeAdjustment: can only have one (leavingEarly or comingLate)
    let timeAdjustment:
      | 'ARRIVING_LATE'
      | 'LEAVING_EARLY'
      | undefined = undefined;
    if (
      requestForm.requestTypes.leavingEarly &&
      requestForm.requestTypes.comingLate
    ) {
      alert(
        'Please select only one time adjustment (either leaving early OR coming late)'
      );
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
            status: 'PENDING'
          })
        });

        if (!attendanceResponse.ok) {
          throw new Error(
            `Failed to create/update attendance for meeting ${meetingId}`
          );
        }

        // Fetch the user's attendance to find the one we just created/updated
        const userAttendanceResponse = await fetch(
          `/api/attendance/user/${user.id}`
        );
        if (!userAttendanceResponse.ok) {
          throw new Error('Failed to fetch attendance record'); // single quotes
        }

        const userAttendance = await userAttendanceResponse.json();
        const attendanceRecord = userAttendance.find(
          (a: any) => a.meetingId === meetingId
        );

        if (!attendanceRecord || !attendanceRecord.attendanceId) {
          throw new Error(
            `Attendance record not found for meeting ${meetingId}`
          );
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
          throw new Error(
            errorData.error ||
              `Failed to create request for meeting ${meetingId}`
          );
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create request: ${message}`);
    }
  };

  // visibleMeetings are meetings post-type-filter
  const visibleMeetings = typeFilter
    ? filteredMeetings.filter(m => m.type === typeFilter)
    : filteredMeetings;

  // Determine banner color based on remaining absences
  const getBannerColor = () => {
    if (!remainingAbsences) return 'bg-blue-50 border-blue-200';

    const regularRemaining = remainingAbsences.regular.remaining;
    const fullBodyRemaining = remainingAbsences.fullBody.remaining;

    // Red if no absences left for either type
    if (regularRemaining === 0 || fullBodyRemaining === 0) {
      return 'bg-red-50 border-red-200';
    }
    // Yellow if 1 remaining for regular
    if (regularRemaining <= 1) {
      return 'bg-yellow-50 border-yellow-200';
    }
    // Green if okay
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className='flex-1 p-6 bg-gray-50'>
      {/* Header Section */}
      <ViewRequestsPanel
        isMember={isMember}
        setShowCreateRequestModal={setShowCreateRequestModal}
        setShowMyRequestsModal={setShowMyRequestsModal}
        setMyRequests={setMyRequests}
        user={user}
      />

      {/* Remaining Unexcused Absences Banner */}
      {remainingAbsences && (
        <AbsencesBanner
          remainingAbsences={remainingAbsences}
          bannerColor={getBannerColor()}
        />
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Panel - Statistics */}
        <MeetingStatisticsPanel
          attendedMeetings={attendedMeetings}
          missedMeetings={missedMeetings}
          upcomingMeetings={upcomingMeetings}
          isAdmin={isAdmin}
          setShowCreateMeetingModal={setShowCreateMeetingModal}
        />

        {/* Right Panel - Meeting History */}
        <div className='lg:col-span-2'>
          <MeetingHistoryPanel
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            meetings={meetings}
            handleEditMeeting={handleEditMeeting}
            visibleMeetings={visibleMeetings}
          />
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateMeetingModal && (
        <CreateMeetingModal
          newMeeting={newMeeting}
          setNewMeeting={setNewMeeting}
          members={members}
          toggleAllMembersSelection={toggleAllMembersSelection}
          toggleNonEboardSelection={toggleNonEboardSelection}
          bulkSelectButtonClasses={bulkSelectButtonClasses}
          bulkSelectionActive={bulkSelectionActive}
          setMeetings={setMeetings}
          setShowCreateMeetingModal={setShowCreateMeetingModal}
        />
      )}

      {/* Edit Meeting Modal */}
      {showEditMeetingModal && editingMeeting && (
        <EditMeetingModal
          editMeeting={editMeeting}
          handleUpdateMeeting={handleUpdateMeeting}
          setEditMeeting={setEditMeeting}
          setShowEditMeetingModal={setShowEditMeetingModal}
          setEditingMeeting={setEditingMeeting}
        />
      )}

      {/* Create Request Modal - For Members */}
      {showCreateRequestModal && (
        <CreateRequestModal
          upcomingMeetingsList={upcomingMeetingsList}
          requestForm={requestForm}
          setRequestForm={setRequestForm}
          setShowCreateRequestModal={setShowCreateRequestModal}
          handleSubmitRequest={handleSubmitRequest}
        />
      )}

      {/* View My Requests Modal - For Members (Pending only) */}
      {showMyRequestsModal && (
        <ViewRequestsModal
          myRequests={myRequests}
          setShowMyRequestsModal={setShowMyRequestsModal}
        />
      )}

      {/* Voting Modal */}
      <VotingModal
        isOpen={showVotingModal}
        onClose={() => {
          setShowVotingModal(false);
          setSelectedVotingType(null);
        }}
        members={members}
        votingType={selectedVotingType}
        onVotingTypeSelect={setSelectedVotingType}
      />
    </div>
  );
};

export default MeetingsPage;
