// Shows: Sidebar with member stats
export const checkCanViewMemberStats = (role?: string) => {
  return role === 'EBOARD' || 
         role === 'ADMIN' || 
         role === 'SUPER_ADMIN' || 
         role === 'SENATOR';
};

// Shows: AttendancePage (all other roles see Access Denied)
export const checkCanAccessAttendance = (role?: string) => {
  return role === 'EBOARD' || 
         role === 'MEMBER' || 
         role === 'ADMIN' || 
         role === 'SUPER_ADMIN' || 
         role === 'SENATOR';
};

// Shows: Attendance Check + View Requests buttons in AttendancePage
// Backend: PATCH /api/attendance/[attendanceId], DELETE /api/attendance/[attendanceId]
export const checkCanManageAttendance = (role?: string) => {
  return role === 'EBOARD' ||
         role === 'ADMIN' ||
         role === 'SUPER_ADMIN';
};

// Shows: Create Meeting button in MeetingStatisticsPanel
// Backend: POST /api/meeting, DELETE /api/meeting/[id]
export const checkCanManageMeetings = (role?: string) => {
  return role === 'EBOARD' ||
         role === 'ADMIN' ||
         role === 'SUPER_ADMIN';
};

// Shows: Edit and delete buttons on individual meeting rows in MeetingHistoryPanel
// Backend: PUT /api/meeting/[id]
export const checkCanEditMeetings = (role?: string) => {
  return role === 'EBOARD' ||
         role === 'ADMIN' ||
         role === 'SUPER_ADMIN';
};

// Shows: Edit Profile button in ProfilePage
export const checkCanEditProfile = (role?: string) => {
  return role === 'EBOARD' || 
         role === 'MEMBER' || 
         role === 'ADMIN' || 
         role === 'SUPER_ADMIN' || 
         role === 'SENATOR';
};

// Shows: Voting admin panel for creating and ending voting events
// Backend: POST /api/voting-event, PUT /api/voting-event/[id]
export const checkCanManageVoting = (role?: string) => {
  return role === 'EBOARD' ||
         role === 'ADMIN' ||
         role === 'SUPER_ADMIN';
};
