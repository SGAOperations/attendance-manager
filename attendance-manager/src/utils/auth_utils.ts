import { LoginCredentials, User, UserDetails } from '@/types';
import { Dispatch, SetStateAction } from 'react';

export const login = async (
  credentials: LoginCredentials,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  setIsLoading(true);
  console.log(decodeURIComponent(credentials.email));
  try {
    let url = `/api/users?email=${decodeURIComponent(
      credentials.email
    )}&password=${credentials.password}`;
    console.log(url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(
        `Response status: ${res.status}\n. Response Msg: ${await res.text}`
      );
      throw new Error(
        `Response status: ${res.status}\n. Response Msg: ${await res.text}`
      );
    }

    let user_details: UserDetails = await res.json();
    console.log(user_details);
    if (!user_details.exists) {
      console.error('User does not exist');
      return;
    }
    if (
      !(
        user_details.user.role.roleType === 'user' ||
        user_details.user.role.roleType === 'admin'
      )
    ) {
      console.error('Incorrect Roles');
      return;
    }

    // Mock user data based on email
    const user: User = {
      id: user_details.user.userId,
      email: credentials.email,
      name: user_details.user.firstName + user_details.user.lastName,
      role: user_details.user.role.roleType,
      avatar: undefined
    };

    setUser(user);
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

export const logout = (setUser: (arg0: null) => void) => {
  setUser(null);
};
