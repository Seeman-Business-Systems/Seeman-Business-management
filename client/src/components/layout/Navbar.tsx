import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

function Navbar({ onMobileMenuToggle, mobileMenuOpen }: NavbarProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white flex items-center justify-between px-4 md:px-6 py-4 shadow-sm">
      {/* Mobile: Logo */}
      <div className="md:hidden">
        <Logo variant="full" />
      </div>

      {/* Desktop: Search Bar */}
      <div className="hidden md:block flex-1 max-w-xl mr-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent transition-all"
          />
          <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notification Icon */}
        <button className="relative w-10 h-10 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-full border border-gray-200 shadow-sm cursor-pointer transition-colors flex items-center justify-center">
          <i className="fa-regular fa-bell text-lg" />
          {/* Notification badge */}
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Desktop: Divider */}
        <div className="hidden md:block h-8 w-px bg-gray-200" />

        {/* Desktop: User Profile with name */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.role?.name || 'Staff'}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-user text-indigo-600" />
          </div>
        </div>

        {/* Mobile: Hamburger Menu */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden w-10 h-10 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-full border border-gray-200 shadow-sm cursor-pointer transition-colors flex items-center justify-center"
        >
          <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;