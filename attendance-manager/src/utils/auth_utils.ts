'use client';

import { LoginCredentials, User, UserData } from '@/types';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

export const login = async (
  credentials: LoginCredentials,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setUser: Dispatch<SetStateAction<User>>,
  router: ReturnType<typeof useRouter>
) => {
  setIsLoading(true);
  console.log(decodeURIComponent(credentials.email));
  try {
    const res = await fetch(
      `/api/users/get-user-by-email/${credentials.email}`
    );
    if (!res.ok) {
      console.error(
        `Response status: ${res.status}\n. Response Msg: ${await res.text}`
      );
      throw new Error(
        `Response status: ${res.status}\n. Response Msg: ${await res.text}`
      );
    }

    let user_details: UserData = await res.json();
    console.log(user_details);
    if (
      !(
        user_details.role.roleType === 'EBOARD' ||
        user_details.role.roleType === 'MEMBER'
      )
    ) {
      alert('Incorrect Roles');
      return;
    }

    // Mock user data based on email
    const user: User = {
      id: user_details.userId,
      email: credentials.email,
      name: user_details.firstName + ' ' + user_details.lastName,
      role: user_details.role.roleType,
      avatar: undefined
    };

    setUser(user);
    router.push('/homepage');
  } catch (error) {
    alert(`Login failed: ${error}`);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

export const logout = (setUser: (arg0: null) => void) => {
  setUser(null);
};
