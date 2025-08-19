export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'eboard' | 'member';
  joinDate: Date;
  status: 'active' | 'inactive';
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
  type: "in-person" | "virtual";
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
  id: string;
  userId: string;
  meetingId: string;
  status: "present" | "absent" | "late";
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
