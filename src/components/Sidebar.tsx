import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Clipboard,
  Calendar,
  Package,
  Truck,
  Receipt,
  BarChart3,
  Settings,
  Calculator,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  Building,
  UserCheck,
  Cog,
  DollarSign,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  path?: string;
  icon: React.ComponentType<any>;
  label: string;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["masters"]);

  const menuItems: MenuItem[] = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/binding-advice", icon: FileText, label: "Binding Advice" },
    { path: "/job-cards", icon: Clipboard, label: "Job Cards" },
    {
      path: "/production-planning",
      icon: Calendar,
      label: "Production Planning",
    },
    {
      icon: Package,
      label: "Inventory",
      children: [
        { path: "/inventory", icon: Package, label: "Overview" },
        {
          path: "/inventory/raw-materials",
          icon: Package,
          label: "Raw Materials",
        },
        {
          path: "/inventory/finished-products",
          icon: Package,
          label: "Finished Products",
        },
      ],
    },
    { path: "/dispatch", icon: Truck, label: "Dispatch" },
    {
      icon: Receipt,
      label: "Billing",
      children: [
        { path: "/billing", icon: Receipt, label: "Invoices" },
        { path: "/billing/payments", icon: DollarSign, label: "Payments" },
      ],
    },
    { path: "/reports", icon: BarChart3, label: "Reports" },
    { path: "/calculations", icon: Calculator, label: "Calculations" },
    {
      icon: Settings,
      label: "Masters",
      children: [
        {
          icon: Cog,
          label: "Production Masters",
          children: [
            {
              path: "/masters/paper-sizes",
              icon: Package,
              label: "Paper Sizes",
            },
            {
              path: "/masters/notebook-types",
              icon: FileText,
              label: "Notebook Types",
            },
            {
              path: "/masters/calculation-rules",
              icon: Calculator,
              label: "Calculation Rules",
            },
          ],
        },
        {
          icon: Building,
          label: "Business Masters",
          children: [
            { path: "/masters/clients", icon: Users, label: "Client Master" },
            {
              path: "/masters/suppliers",
              icon: Building,
              label: "Supplier Master",
            },
            {
              path: "/masters/transporters",
              icon: Truck,
              label: "Transporter Master",
            },
            { path: "/masters/teams", icon: Users, label: "Team Setup" },
          ],
        },
        {
          icon: UserCheck,
          label: "System Masters",
          children: [
            { path: "/system/users", icon: Users, label: "User Management" },
            {
              path: "/system/roles",
              icon: UserCheck,
              label: "Role Management",
            },
            {
              path: "/system/settings",
              icon: Settings,
              label: "System Settings",
            },
          ],
        },
      ],
    },
  ];

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuKey)
        ? prev.filter((key) => key !== menuKey)
        : [...prev, menuKey]
    );
  };

  const getMenuKey = (label: string, parentKey?: string) => {
    const key = label.toLowerCase().replace(/\s+/g, "-");
    return parentKey ? `${parentKey}-${key}` : key;
  };

  const renderMenuItem = (
    item: MenuItem,
    level: number = 0,
    parentKey?: string
  ) => {
    const menuKey = getMenuKey(item.label, parentKey);
    const isExpanded = expandedMenus.includes(menuKey);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path && location.pathname === item.path;
    const Icon = item.icon;

    const paddingLeft = level === 0 ? "pl-6" : level === 1 ? "pl-10" : "pl-14";

    if (hasChildren) {
      return (
        <div key={menuKey}>
          <button
            onClick={() => toggleMenu(menuKey)}
            className={`w-full flex items-center justify-between ${paddingLeft} pr-6 py-3 text-sm font-medium transition-colors duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
          >
            <div className="flex items-center space-x-3">
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {isExpanded && (
            <div className="bg-gray-25">
              {item.children?.map((child) =>
                renderMenuItem(child, level + 1, menuKey)
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={menuKey}
        to={item.path || "#"}
        onClick={() => onClose()}
        className={`flex items-center space-x-3 ${paddingLeft} pr-6 py-3 text-sm font-medium transition-colors duration-200 ${
          isActive
            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 z-50 lg:z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 pt-20 lg:pt-6">
          <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
          <button onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="mt-6 pb-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
