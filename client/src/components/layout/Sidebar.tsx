import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

interface NavItem {
  name: string;
  path: string;
  icon: string;
  permission?: string;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
}

const menuItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: 'fa-gauge-high' },
  { name: 'Products', path: '/products', icon: 'fa-box', permission: 'product:read' },
  { name: 'Inventory', path: '/inventory', icon: 'fa-boxes-stacked', permission: 'inventory:read' },
  { name: 'Sales', path: '/sales', icon: 'fa-cart-shopping', permission: 'sale:read' },
  { name: 'Supplies', path: '/supplies', icon: 'fa-truck-fast', permission: 'supply:read' },
  { name: 'Customers', path: '/customers', icon: 'fa-users', permission: 'customer:read' },
  { name: 'Expenses', path: '/expenses', icon: 'fa-money-bill-trend-up', permission: 'expense:read' },
  { name: 'Activities', path: '/activities', icon: 'fa-clock-rotate-left', permission: 'activity:read' },
  { name: 'Reports', path: '/reports', icon: 'fa-chart-line', permission: 'analytics:read' },
  { name: 'Manage Staff', path: '/staff', icon: 'fa-id-card', permission: 'staff:read' },
  { name: 'Branches', path: '/branches', icon: 'fa-code-branch', permission: 'branch:read' },
];

const supportItems: NavItem[] = [
  { name: 'Profile', path: '/me', icon: 'fa-user' },
  { name: 'Help', path: '/help', icon: 'fa-circle-question' },
  { name: 'Settings', path: '/system-settings', icon: 'fa-gear', permission: 'settings:manage' },
  { name: 'Report Issue', path: '/report-issue', icon: 'fa-bug' },
];

function Sidebar({ collapsed, onToggle, isMobile = false, isOpen = false }: SidebarProps) {
  const { logout, can, isImpersonating } = useAuth();

  const filteredMenuItems = menuItems.filter(item => !item.permission || can(item.permission));
  const filteredSupportItems = supportItems.filter(item => !item.permission || can(item.permission));

  const renderNavItems = (items: NavItem[], closeMobileMenu?: () => void) => (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            end={item.path === '/'}
            title={collapsed ? item.name : undefined}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`} />
            {(!collapsed || isMobile) && item.name}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  // Mobile sidebar
  if (isMobile) {
    return (
      <aside
        className={`fixed left-0 ${isImpersonating ? 'top-10' : 'top-0'} h-screen w-[65%] max-w-xs bg-white shadow-lg flex flex-col z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with Logo and Close Button */}
        <div className="px-6 py-4 flex items-center justify-between">
          <Logo variant="full" />
        </div>
        <div className="mx-6 border-b border-gray-200" />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <p className="text-xs text-gray-500 tracking-wider mb-4 px-3">Menu</p>
          {renderNavItems(filteredMenuItems, onToggle)}

          <p className="text-xs text-gray-500 tracking-wider mt-8 mb-4 px-3">Support</p>
          {renderNavItems(filteredSupportItems, onToggle)}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => {
              logout();
              onToggle();
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center" />
            Logout
          </button>
        </div>
      </aside>
    );
  }

  // Desktop sidebar
  return (
    <aside className={`fixed left-0 ${isImpersonating ? 'top-10' : 'top-0'} h-screen ${collapsed ? 'w-16' : 'w-64'} bg-white shadow-md flex flex-col transition-all duration-300`}>
      {/* Logo */}
      <div className={`${collapsed ? 'px-2' : 'px-6'} py-4`}>
        {collapsed ? (
          <div className="flex justify-center">
            <Logo variant="icon" />
          </div>
        ) : (
          <Logo variant="full" />
        )}
        <div className="mt-4 border-b border-gray-200" />
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-4'} py-4 overflow-y-auto`}>
        {/* Menu Section */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-4 ${collapsed ? '' : 'px-3'}`}>
          {!collapsed && (
            <p className="text-xs text-gray-500 tracking-wider">
              Menu
            </p>
          )}
          <button
            onClick={onToggle}
            className={`${collapsed ? 'w-full px-3 py-2.5 rounded-lg hover:bg-gray-100' : 'p-2 rounded-lg hover:bg-gray-100'} text-gray-500 hover:text-gray-700 transition-colors cursor-pointer flex items-center justify-center`}
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            <i className={`fa-solid ${collapsed ? 'fa-angle-right' : 'fa-angle-left'}`} />
          </button>
        </div>
        {renderNavItems(filteredMenuItems)}

        {/* Support Section */}
        {!collapsed && (
          <p className="text-xs text-gray-500 tracking-wider mt-8 mb-4 px-3">
            Support
          </p>
        )}
        {collapsed && <div className="mt-8" />}
        {renderNavItems(filteredSupportItems)}
      </nav>

      {/* Logout */}
      <div className={`${collapsed ? 'p-2' : 'p-4'} border-t border-gray-100`}>
        <button
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors`}
        >
          <i className="fa-solid fa-right-from-bracket w-5 text-center" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
