import { AttendanceApiData, MeetingRecord, UserApiData } from '@/types';

// API service functions with endpoints
export const meetingAPI = {
  async getAllMeetings(): Promise<MeetingRecord[]> {
    try {
      const response = await fetch('/api/meeting');

      if (!response.ok) {
        const errorText = await response.text();
        console.log('getAllMeetings error response:', errorText);
        throw new Error(
          `Failed to fetch meetings (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getAttendances(meetingId: string): Promise<AttendanceApiData[]> {
    try {
      const response = await fetch(`/api/attendance/meeting/${meetingId}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch meeting (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getUsers(): Promise<UserApiData[]> {
    try {
      const response = await fetch('/api/users/only-name');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch meeting (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
};
