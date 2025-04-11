import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LightToggleProps {
  isOn?: boolean;
  onChange?: (isOn: boolean) => void;
  className?: string;
}

const LightToggle = ({ isOn = false, onChange, className }: LightToggleProps) => {
  const [on, setOn] = useState(isOn);
  
  const handleToggle = () => {
    const newState = !on;
    setOn(newState);
    if (onChange) onChange(newState);
  };
  
  return (
    <motion.div
      className={cn(
        "relative h-[26px] w-[50px] rounded-[13px] cursor-pointer transition-all duration-300",
        on ? "bg-[#41FFFF] shadow-[0_0_15px_rgba(65,255,255,0.8)]" : "bg-[#1A1E2E] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)]",
        className
      )}
      onClick={handleToggle}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }}
    >
      <motion.div 
        className="absolute top-[3px] w-[20px] h-[20px] bg-white rounded-full"
        animate={{ 
          left: on ? '27px' : '3px',
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30 
        }}
      />
    </motion.div>
  );
};

export default LightToggle;
