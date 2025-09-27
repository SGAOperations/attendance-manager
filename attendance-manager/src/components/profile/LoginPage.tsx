'use client';
import React, { createContext, useState } from 'react';
import { User, LoginCredentials } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
// import { useRouter } from 'next/navigation';
// import { login } from '@/utils/auth_utils';

const defaultUser: User = {
  id: '',
  email: '',
  name: '',
  role: 'MEMBER'
};

export const UserContext = createContext(defaultUser);

interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const LoginPage: React.FC = () => {
  // const router = useRouter();
  const { login, isLoading } = useAuth();
  // const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User>({
    id: '',
    email: '',
    name: '',
    role: 'MEMBER'
  });
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [signupCredentials, setSignupCredentials] = useState<SignupCredentials>(
    {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  );
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      // Login logic
      if (!credentials.email || !credentials.password) {
        setError('Please fill in all fields');
        return;
      }

      try {
        console.log('Logging in...');
        await login(credentials);
        // console.log('Logged in :)');
      } catch (error) {
        setError('Login failed. Please try again.\n Error msg: ' + error);
      }
    } else {
      // Signup logic
      if (
        !signupCredentials.firstName ||
        !signupCredentials.lastName ||
        !signupCredentials.email ||
        !signupCredentials.password ||
        !signupCredentials.confirmPassword
      ) {
        setError('Please fill in all fields');
        return;
      }

      if (signupCredentials.password !== signupCredentials.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (signupCredentials.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      try {
        await login({
          email: signupCredentials.email,
          password: signupCredentials.password
        });
        alert(
          `Welcome ${signupCredentials.firstName} ${signupCredentials.lastName}! Your account has been created successfully.`
        );
      } catch (error) {
        setError('Signup failed. Please try again.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isLoginMode) {
      setCredentials(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setSignupCredentials(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForms = () => {
    setError('');
    setCredentials({ email: '', password: '' });
    setSignupCredentials({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleModeChange = (isLogin: boolean) => {
    setIsLoginMode(isLogin);
    resetForms();
  };

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Toggle Switch */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-4 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => handleModeChange(true)}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  isLoginMode
                    ? 'bg-[#C8102E] text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleModeChange(false)}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  !isLoginMode
                    ? 'bg-[#C8102E] text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLoginMode ? 'Welcome Back' : 'Join SGA'}
            </h2>
            <p className="text-gray-600 text-lg">
              {isLoginMode
                ? 'Sign in to your SGA Dashboard'
                : 'Create your SGA Dashboard account'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name fields - only for signup */}
              {!isLoginMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required={!isLoginMode}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl text-white bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] transition-colors"
                        placeholder="First name"
                        value={signupCredentials.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required={!isLoginMode}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl text-white bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] transition-colors"
                        placeholder="Last name"
                        value={signupCredentials.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl text-white bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] transition-colors"
                    placeholder="Enter your email"
                    value={
                      isLoginMode ? credentials.email : signupCredentials.email
                    }
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={
                      isLoginMode ? 'current-password' : 'new-password'
                    }
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl text-white bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] transition-colors"
                    placeholder={
                      isLoginMode ? 'Enter your password' : 'Create a password'
                    }
                    value={
                      isLoginMode
                        ? credentials.password
                        : signupCredentials.password
                    }
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Confirm Password field - only for signup */}
              {!isLoginMode && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required={!isLoginMode}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl text-white bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] transition-colors"
                      placeholder="Confirm your password"
                      value={signupCredentials.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900 border border-red-700 rounded-xl p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#C8102E] hover:bg-[#A8102E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8102E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isLoginMode ? 'Signing in...' : 'Creating account...'}
                    </div>
                  ) : isLoginMode ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {isLoginMode
                    ? "Use any email with 'admin' for admin access"
                    : 'Password must be at least 6 characters long'}
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 Northeastern University Student Government Association. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </UserContext.Provider>
  );
};

export default LoginPage;
