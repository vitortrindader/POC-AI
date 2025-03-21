import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-start">
          <div className="flex space-x-8">
            <NavLink
              to="/documentos"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              Documentos
            </NavLink>
            <NavLink
              to="/workflows"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              Workflows
            </NavLink>
            <NavLink
              to="/busca"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              Busca Inteligente
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
