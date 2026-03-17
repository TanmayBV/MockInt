import React from 'react';
import ProfileDropdown from './ProfileDropdown';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white">
              MockInt
            </h1>
          </div>

          {/* Profile Dropdown */}
          <div className="flex items-center">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
