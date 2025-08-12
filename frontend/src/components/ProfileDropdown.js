import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile...');
        const response = await API.get('/auth/user');
        console.log('User profile response:', response.data);
        setUser(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        console.error('Error response:', error.response?.data);
        setError('Failed to load user profile');
        
        // Fallback: Try to get user data from localStorage
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('Using stored user data:', parsedUser);
            setUser(parsedUser);
            setError(null);
          } else {
            // Set default user data if no stored data
            setUser({
              name: 'User',
              email: 'user@example.com'
            });
          }
        } catch (localStorageError) {
          console.error('Error reading from localStorage:', localStorageError);
          setUser({
            name: 'User',
            email: 'user@example.com'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/60"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur border border-white/10 rounded-xl shadow-2xl shadow-black/40 z-50">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || 'user@example.com'}
                </p>
                {error && (
                  <p className="text-xs text-red-400 mt-1">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
