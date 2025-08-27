import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, LoginCredentials, AuthContextType, UserDetails } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      let url =
        "api/users?" +
        new URLSearchParams({
          email: credentials.email,
          password: credentials.password,
        }).toString();
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
        console.error("User does not exist");
        return;
      }
      if (
        !(
          user_details.user.role.roleType === "admin" ||
          user_details.user.role.roleType === "user"
        )
      ) {
        console.error("Incorrect Roles");
        return;
      }
      // Mock user data based on email
      const user: User = {
        id: user_details.user.userId,
        email: credentials.email,
        name: user_details.user.firstName + user_details.user.lastName,
        role: user_details.user.role.roleType,
        avatar: undefined,
      };

      setUser(user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
