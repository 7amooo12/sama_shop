import { ReactNode, useState, useEffect } from 'react';
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
  const [prevDir, setPrevDir] = useState(i18n.dir());
  const [key, setKey] = useState(0); // Used to force remount when direction changes
  
  // When direction changes, trigger the animation
  useEffect(() => {
    const currentDir = i18n.dir();
    if (prevDir !== currentDir) {
      // Update the key to force remount with animation
      setKey(prevKey => prevKey + 1);
      setPrevDir(currentDir);
    }
  }, [i18n.dir(), prevDir]);
  
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default RTLTransitionWrapper;