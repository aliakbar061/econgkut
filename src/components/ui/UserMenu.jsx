import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';

const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
        data-testid="user-menu-button"
      >
        {/* Avatar or User Icon */}
        {user?.picture ? (
          <img 
            src={user.picture} 
            alt={user.name}
            className="w-8 h-8 rounded-full border-2 border-green-500"
          />
        ) : (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-green-600" />
          </div>
        )}
        
        {/* Name - Hidden on mobile */}
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user?.name || 'User'}
        </span>
        
        {/* Dropdown icon - Hidden on mobile */}
        <ChevronDown className={`hidden md:block w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            {user?.role === 'admin' && (
              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                Admin
              </span>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;