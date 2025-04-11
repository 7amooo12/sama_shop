import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LineChart, 
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminSidebar = () => {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logoutMutation } = useAuth();

  const sidebarItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      href: '/admin',
    },
    {
      name: 'Products',
      icon: <Package size={20} />,
      href: '/admin/products',
    },
    {
      name: 'Orders',
      icon: <ShoppingCart size={20} />,
      href: '/admin/orders',
    },
    {
      name: 'Customers',
      icon: <Users size={20} />,
      href: '/admin/customers',
    },
    {
      name: 'Analytics',
      icon: <LineChart size={20} />,
      href: '/admin/analytics',
    },
    {
      name: 'Settings',
      icon: <Settings size={20} />,
      href: '/admin/settings',
    },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center justify-between">
        <Link href="/admin">
          <a className={cn(
            "flex items-center transition-opacity",
            isCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible"
          )}>
            <span className="font-syncopate text-xl font-bold text-white">
              <span className="text-electric-blue">LUMI</span>NA
            </span>
            <span className="text-xs text-electric-blue ml-1 font-medium">ADMIN</span>
          </a>
        </Link>
        
        <button 
          onClick={isMobile ? toggleMobileSidebar : toggleCollapse}
          className="text-muted-gray hover:text-white transition-colors p-1"
        >
          {isMobile ? (
            <ChevronLeft size={20} />
          ) : isCollapsed ? (
            <Menu size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>
      
      <div className="mt-8 px-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
          >
            <a className={cn(
              "flex items-center py-3 px-3 rounded-lg transition-colors",
              location === item.href
                ? "bg-electric-blue bg-opacity-20 text-electric-blue"
                : "text-muted-gray hover:text-white hover:bg-gray-800"
            )}>
              <div className="flex items-center">
                {item.icon}
                <span className={cn(
                  "transition-all",
                  isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 ml-3"
                )}>
                  {item.name}
                </span>
              </div>
            </a>
          </Link>
        ))}
      </div>
      
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="flex items-center py-3 px-3 w-full rounded-lg text-muted-gray hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut size={20} />
          <span className={cn(
            "transition-all",
            isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 ml-3"
          )}>
            Logout
          </span>
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile trigger button */}
        <button
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-dark-gray rounded-lg text-white shadow-lg"
        >
          <Menu size={20} />
        </button>
        
        {/* Mobile sidebar - slide in from left */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-rich-black z-40"
                onClick={toggleMobileSidebar}
              />
              
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="fixed left-0 top-0 z-50 h-full w-64 bg-dark-gray border-r border-gray-800 shadow-xl flex flex-col"
              >
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div
      className={cn(
        "h-screen sticky top-0 bg-dark-gray border-r border-gray-800 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent />
    </div>
  );
};

export default AdminSidebar;