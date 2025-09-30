import React from "react";
import { Menu, Bell, User, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, login } = useAuth();

  const handleRoleSwitch = (
    newRole: "Admin" | "Production Manager" | "Quotation Staff" | "Accounts"
  ) => {
    if (user) {
      login({
        ...user,
        role: newRole,
        name:
          newRole === "Admin"
            ? "System Admin"
            : newRole === "Production Manager"
            ? "Production Manager"
            : newRole === "Quotation Staff"
            ? "John Doe"
            : "Accounts User",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 lg:z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:hidden"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MP</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
              Madura Papers ERP
            </h1>
            <h1 className="text-lg font-bold text-gray-800 sm:hidden">
              MP ERP
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">
                {user?.name || "User"}
              </span>
              <select
                value={user?.role || "Admin"}
                onChange={(e) => handleRoleSwitch(e.target.value as any)}
                className="text-xs text-gray-500 bg-transparent border-none outline-none cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Production Manager">Production Manager</option>
                <option value="Quotation Staff">Quotation Staff</option>
                <option value="Accounts">Accounts</option>
              </select>
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center space-x-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
