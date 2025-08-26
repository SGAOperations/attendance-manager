export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
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
}

export interface UserDetails {
  exists: true;
  user: UserData;
}
