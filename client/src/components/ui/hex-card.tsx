import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HexCardProps {
  children: ReactNode;
  className?: string;
}

const HexCard = ({ children, className }: HexCardProps) => {
  return (
    <div 
      className={cn(
        "relative bg-dark-gray overflow-hidden rounded-lg shadow-lg border border-gray-800 hover:border-electric-blue transition-all duration-300 group",
        className
      )}
    >
      {/* Hexagon grid background pattern */}
      <div className="absolute inset-0 opacity-5 hex-pattern pointer-events-none" />
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-electric-blue to-vivid-purple opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
      
      {children}
    </div>
  );
};

export default HexCard;