export interface User {
  id: string;
  email: string;
  name: string;
  role: 'MEMBER' | 'EBOARD';
  avatar?: string;
}

export interface MeetingApiData {
  meetingId: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  type: MeetingType;
  attendance: AttendanceApiData[];
}

export interface AttendanceRecord {
  id: string;
  meetingId: string;
  meetingTitle: string;
  meetingDescription: string;
  date: Date;
  time: string;
  totalMembers: number;
  attendedMembers: number;
  attendanceRate: number;
}

export interface MeetingRecord {
  meetingId: string;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  notes: string;
  totalMembers: number;
  attendedMembers: number;
  percentage: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface RoleData {
  roleId: string;
  roleType: string;
}

export interface UserData {
  userId: string;
  nuid: string
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleData;
  password: string;
}

export type MeetingType = 'FULL_BODY' | 'REGULAR';

export interface UserApiData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  nuid: string;
  attendance: AttendanceApiData[];
  attendanceId?: string;
  role: RoleData
}

export interface AttendanceApiData {
  attendanceId: string;
  userId: string;
  meetingId: string;
  status: string;
  meeting: MeetingApiData;
  user: UserData
}

export interface RequestApiData {
  requestId: string;
  attendanceId: string;
  reason: string;
  attendanceMode: 'ONLINE' | 'IN_PERSON';
  timeAdjustment: 'ARRIVING_LATE' | 'LEAVING_EARLY';
  attendance: AttendanceApiData;
}

export interface RemainingAbsences {
  regular: {
    used: number;
    allowed: number;
    remaining: number;
  };
  fullBody: {
    used: number;
    allowed: number;
    remaining: number;
  };
}

export interface RequestForm {
    selectedMeetings: string[];
    requestTypes: {
      leavingEarly: boolean;
      comingLate: boolean;
      goingOnline: boolean;
    };
    explanation: string;
}