import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Search, ChevronDown } from 'lucide-react';
import { useAuthSafe } from '@/hooks/use-auth-safe';
import { useQuery } from '@tanstack/react-query';
import { Cart } from '@shared/schema';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/language-switcher';
import RTLTransitionWrapper from '@/components/rtl-transition-wrapper';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuthSafe();
  const { t, i18n } = useTranslation();

  // Fetch cart data
  const { data: cart } = useQuery<Cart>({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });

  // Calculate total items in cart
  const cartItems = Array.isArray(cart?.items) ? cart?.items : [];
  const cartItemCount = cartItems.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.products'), href: '/products' },
    ...(user ? [{ name: t('ar.experience'), href: '/ar-experience' }] : []),
    { name: t('navigation.about', 'About'), href: '/about' },
    { name: t('navigation.contact', 'Contact'), href: '/contact' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300',
        isScrolled ? 'glass-nav py-3 shadow-lg' : 'py-5 bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center">
            <span className="font-syncopate text-2xl font-bold text-white relative">
              <span className="text-electric-blue relative inline-block transform hover:scale-105 transition-transform">
                LUX
                <span className="absolute inset-0 blur-sm text-electric-blue opacity-70"></span>
              </span>
            </span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center" dir={i18n.dir()}>
          <div className={cn("flex gap-8", i18n.dir() === 'rtl' ? 'space-x-reverse' : '')}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={cn(
                  'text-sm font-medium transition-colors hover:text-electric-blue',
                  location === link.href
                    ? 'text-electric-blue'
                    : 'text-white'
                )}
              >
                {link.name}
              </a>
            </Link>
          ))}
          </div>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="text-white hover:text-electric-blue transition-colors">
            <Search size={20} />
          </button>
          
          {/* Language Switcher */}
          <LanguageSwitcher />

          {user ? (
            <div className="relative group">
              <button className="flex items-center space-x-1 text-white hover:text-electric-blue transition-colors">
                <User size={20} />
                <span className="text-sm font-medium max-w-[100px] truncate">
                  {user.username}
                </span>
                <ChevronDown size={16} />
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 py-2 bg-dark-gray rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-800">
                {user.isAdmin && (
                  <Link href="/admin">
                    <a className="block px-4 py-2 text-sm text-white hover:bg-muted hover:text-electric-blue transition-colors">
                      {t('navigation.admin', 'Admin Dashboard')}
                    </a>
                  </Link>
                )}
                <Link href="/profile">
                  <a className="block px-4 py-2 text-sm text-white hover:bg-muted hover:text-electric-blue transition-colors">
                    {t('navigation.profile', 'Profile')}
                  </a>
                </Link>
                <Link href="/orders">
                  <a className="block px-4 py-2 text-sm text-white hover:bg-muted hover:text-electric-blue transition-colors">
                    {t('navigation.orders', 'My Orders')}
                  </a>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-muted hover:text-electric-blue transition-colors"
                >
                  {t('navigation.logout', 'Logout')}
                </button>
              </div>
            </div>
          ) : (
            <Link href="/auth">
              <a className="text-white hover:text-electric-blue transition-colors flex items-center">
                <User size={20} />
              </a>
            </Link>
          )}

          <Link href="/cart">
            <a className="relative text-white hover:text-electric-blue transition-colors">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-vivid-purple text-white text-xs flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </a>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4 md:hidden">
          <Link href="/cart">
            <a className="relative text-white hover:text-electric-blue transition-colors">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-vivid-purple text-white text-xs flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </a>
          </Link>

          <button
            className="text-white hover:text-electric-blue transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-nav border-t border-gray-800"
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-syncopate text-xl font-bold text-white relative">
                  <span className="text-electric-blue relative inline-block transform hover:scale-105 transition-transform">
                    LUX
                    <span className="absolute inset-0 blur-sm text-electric-blue opacity-70">LUX</span>
                  </span>
                </span>
                <button
                  className="text-white hover:text-electric-blue transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a
                      className={cn(
                        'text-sm font-medium py-2 transition-colors hover:text-electric-blue',
                        location === link.href
                          ? 'text-electric-blue'
                          : 'text-white'
                      )}
                    >
                      {link.name}
                    </a>
                  </Link>
                ))}
                
                {/* Mobile Language Switcher */}
                <div className="py-2">
                  <LanguageSwitcher />
                </div>

                {user ? (
                  <>
                    <hr className="border-gray-800" />
                    <div className="text-sm text-muted-gray">
                      {t('navigation.signed_in_as', 'Signed in as:')} <span className="text-white">{user.username}</span>
                    </div>
                    {user.isAdmin && (
                      <Link href="/admin">
                        <a className="text-sm text-white hover:text-electric-blue transition-colors">
                          {t('navigation.admin', 'Admin Dashboard')}
                        </a>
                      </Link>
                    )}
                    <Link href="/profile">
                      <a className="text-sm text-white hover:text-electric-blue transition-colors">
                        {t('navigation.profile', 'Profile')}
                      </a>
                    </Link>
                    <Link href="/orders">
                      <a className="text-sm text-white hover:text-electric-blue transition-colors">
                        {t('navigation.orders', 'My Orders')}
                      </a>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-white hover:text-electric-blue transition-colors text-left"
                    >
                      {t('navigation.logout', 'Logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="border-gray-800" />


                    <Link href="/auth">
                      <a onClick={() => setIsOpen(false)} className="text-sm text-white hover:text-electric-blue transition-colors">
                        {t('navigation.signin', 'Sign In / Register')}
                      </a>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;