import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LightToggleProps {
  isOn?: boolean;
  onChange?: (isOn: boolean) => void;
  className?: string;
}

const LightToggle = ({ isOn = false, onChange, className }: LightToggleProps) => {
  const [isActive, setIsActive] = useState(isOn);
  
  const toggleLight = () => {
    const newState = !isActive;
    setIsActive(newState);
    onChange?.(newState);
  };
  
  return (
    <motion.button
      type="button"
      onClick={toggleLight}
      className={cn(
        "relative w-9 h-5 rounded-full p-1 transition-colors duration-300",
        isActive ? "bg-electric-blue shadow-glow" : "bg-gray-700",
        className
      )}
      whileTap={{ scale: 0.9 }}
      title={isActive ? "Turn off light" : "Turn on light"}
    >
      <motion.div 
        className="w-3 h-3 bg-white rounded-full"
        animate={{ 
          x: isActive ? 16 : 0,
          backgroundColor: isActive ? "#ffffff" : "#a0a0a0" 
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      
      {/* Light glow effect */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-electric-blue opacity-0"
        animate={{ opacity: isActive ? 0.3 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
};

export default LightToggle;