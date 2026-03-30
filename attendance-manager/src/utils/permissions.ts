export const checkCanViewMemberStats = (role?: string) => role === 'EBOARD';

export const checkCanAccessAttendance = (role?: string) => role === 'EBOARD';

export const checkCanManageAttendance = (role?: string) => role === 'EBOARD';

export const checkCanManageMeetings = (role?: string) => role === 'EBOARD';

export const checkCanEditMeetings = (role?: string) => role === 'EBOARD';

export const checkCanEditProfile = (role?: string) => role === 'EBOARD';

export const checkCanManageVoting = (role?: string) => role === 'EBOARD';
