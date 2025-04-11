import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface ProductViewerProps {
  imageUrl: string;
  isLightOn: boolean;
  alt: string;
}

const ProductViewer = ({ imageUrl, isLightOn, alt }: ProductViewerProps) => {
  const lightControls = useAnimation();
  
  // Animate light effect when isLightOn changes
  useEffect(() => {
    if (isLightOn) {
      lightControls.start({
        opacity: 1,
        scale: 1.2,
        transition: { duration: 0.5 }
      });
    } else {
      lightControls.start({
        opacity: 0,
        scale: 1,
        transition: { duration: 0.5 }
      });
    }
  }, [isLightOn, lightControls]);
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Main product image */}
      <div className="w-full h-full relative">
        <img 
          src={imageUrl} 
          alt={alt}
          className="w-full h-full object-contain z-10 relative"
        />
        
        {/* Light glow effect overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={lightControls}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue to-vivid-purple opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-full bg-electric-blue filter blur-3xl opacity-30"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductViewer;