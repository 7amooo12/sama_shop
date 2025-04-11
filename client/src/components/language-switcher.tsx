import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');
  
  // Set the document direction based on language
  useEffect(() => {
    // Get HTML element
    const htmlElement = document.querySelector('html');
    if (!htmlElement) return;
    
    // Set direction attribute based on language
    const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
    htmlElement.setAttribute('dir', direction);
    
    // Update RTL state
    setIsRTL(direction === 'rtl');
    
    // Add a class to the body to make additional RTL/LTR styles easier
    if (direction === 'rtl') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);
  
  // Toggle dropdown
  const toggleLanguageDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-switcher')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Change language handler
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };
  
  return (
    <div className="language-switcher relative z-50">
      <button
        onClick={toggleLanguageDropdown}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full",
          "transition-all duration-300 ease-in-out",
          "bg-dark-gray hover:bg-gray-800 text-white",
          "border border-gray-700 hover:border-electric-blue"
        )}
        aria-label="Toggle language menu"
      >
        <GlobeIcon size={18} />
        <span className="text-sm font-medium">
          {isRTL ? 'العربية' : 'English'}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute mt-2 py-2 w-40 bg-dark-gray",
              "border border-gray-700 rounded-lg shadow-lg",
              isRTL ? "right-0" : "left-0"
            )}
          >
            <ul>
              <li>
                <button
                  onClick={() => changeLanguage('en')}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm",
                    "transition-colors duration-200",
                    "hover:bg-gray-800 hover:text-electric-blue",
                    i18n.language === 'en' ? "text-electric-blue" : "text-white"
                  )}
                >
                  {t('language.english')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => changeLanguage('ar')}
                  className={cn(
                    "w-full text-right px-4 py-2 text-sm",
                    "transition-colors duration-200",
                    "hover:bg-gray-800 hover:text-electric-blue",
                    i18n.language === 'ar' ? "text-electric-blue" : "text-white"
                  )}
                >
                  {t('language.arabic')}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;