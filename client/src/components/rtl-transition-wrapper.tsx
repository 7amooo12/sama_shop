import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface RTLTransitionWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component that provides smooth transition animation when
 * switching between RTL and LTR languages.
 */
const RTLTransitionWrapper = ({ children, className = '' }: RTLTransitionWrapperProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // The default variants for fade transition
  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
  
  // These more complex variants can be used for directional transitions
  const slideVariants = {
    initial: { 
      opacity: 0,
      x: isRTL ? -20 : 20,
    },
    animate: { 
      opacity: 1,
      x: 0,
    },
    exit: { 
      opacity: 0,
      x: isRTL ? 20 : -20,
    },
  };
  
  return (
    <motion.div
      key={i18n.language} // This key change forces a re-render on language change
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeVariants} // Use fadeVariants or slideVariants based on preference
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default RTLTransitionWrapper;