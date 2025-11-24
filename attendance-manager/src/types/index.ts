export interface User {
  id: string;
  email: string;
  name: string;
  role: 'MEMBER' | 'EBOARD';
  avatar?: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  joinDate: Date;
  status: 'active' | 'inactive';
  role: { [key: string]: string };
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendees: string[];
  location?: string;
  type: 'in-person' | 'virtual';
}

export interface MeetingApiData {
  type: MeetingType;
  meetingId: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  type?: 'FULL_BODY' | 'REGULAR';
  attendance: AttendanceApiData[];
}

export interface AttendanceApiData {
  attendanceId: string;
  userId: string;
  meetingId: string;
  status: 'PRESENT' | 'EXCUSED_ABSENCE' | 'UNEXCUSED_ABSENCE';
  user: UserApiData;
}

export interface UserApiData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  password: string;
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

export interface Attendance {
  attendanceId: string;
  userId: string;
  meetingId: string;
  status: 'PRESENT' | 'EXCUSED_ABSENCE' | 'UNEXCUSED_ABSENCE';
  timestamp: Date;
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
