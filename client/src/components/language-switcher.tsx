import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪', isRTL: true }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    
    // Store the language preference
    localStorage.setItem('language', langCode);
    
    // Set the document direction based on language
    const isRTL = languages.find(lang => lang.code === langCode)?.isRTL;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  };
  
  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-white hover:text-electric-blue transition-colors p-1 rounded-lg"
        aria-label="Toggle language menu"
      >
        <Globe size={20} />
        <span className="text-sm hidden sm:inline-block">{currentLanguage.flag}</span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 w-40 py-2 bg-dark-gray rounded-lg shadow-xl border border-gray-800 z-50"
          >
            {languages.map(language => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={cn(
                  'flex items-center justify-between w-full px-4 py-2 text-sm text-left transition-colors',
                  language.code === i18n.language
                    ? 'text-electric-blue bg-muted'
                    : 'text-white hover:bg-muted hover:text-electric-blue'
                )}
              >
                <div className="flex items-center">
                  <span className="mr-2">{language.flag}</span>
                  <span>{language.name}</span>
                </div>
                {language.code === i18n.language && (
                  <Check size={16} className="text-electric-blue" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;