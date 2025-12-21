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
  status: string;
  attendanceId?: string;
  role: RoleData
}

export interface AttendanceApiData {
  attendanceId: string;
  userId: string;
  meetingId: string;
  status: string;
}
