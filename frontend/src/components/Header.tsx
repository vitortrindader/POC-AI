import { NavLink } from 'react-router-dom';
import React from 'react';

const Header = () => {
  const navItems = [
    { path: '/documentos', label: 'Documentos' },
    { path: '/workflows', label: 'Workflows' },
    { path: '/busca', label: 'Busca Inteligente' },
  ];

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <nav className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <div className="flex space-x-8">
            {navItems.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;