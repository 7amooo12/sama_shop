import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProductViewerProps {
  imageUrl: string;
  lightImageUrl?: string;
  isLightOn: boolean;
  alt: string;
}

const ProductViewer = ({ imageUrl, lightImageUrl, isLightOn, alt }: ProductViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [lastRotation, setLastRotation] = useState({ x: 0, y: 0 });

  // Simulate loading the 3D model
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPosition({ x: e.clientX, y: e.clientY });
    setLastRotation({ ...rotation });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - startPosition.x;
      const deltaY = e.clientY - startPosition.y;
      
      setRotation({
        x: lastRotation.x + deltaY * 0.5,
        y: lastRotation.y + deltaX * 0.5
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] bg-rich-black rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-electric-blue animate-spin" />
          <span className="ml-2 text-sm text-white">Loading 3D model...</span>
        </div>
      ) : (
        <>
          {/* 3D Model Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative"
              animate={{
                rotateX: rotation.x,
                rotateY: rotation.y,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {/* Product images with transition effect */}
              <div className="relative">
                <motion.img 
                  src={imageUrl} 
                  alt={alt}
                  className="max-h-[350px] object-contain z-10"
                  animate={{
                    opacity: isLightOn ? 0 : 1
                  }}
                  transition={{ duration: 0.5 }}
                />
                {lightImageUrl && (
                  <motion.img 
                    src={lightImageUrl} 
                    alt={`${alt} - illuminated`}
                    className="max-h-[350px] object-contain z-10 absolute inset-0"
                    animate={{
                      opacity: isLightOn ? 1 : 0
                    }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Light effect */}
          {isLightOn && (
            <motion.div 
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-radial from-electric-blue to-transparent opacity-30" />
            </motion.div>
          )}
          
          {/* Controls hint */}
          <div className="absolute bottom-4 left-4 text-xs text-muted-gray bg-dark-gray bg-opacity-70 px-3 py-1 rounded-full">
            Drag to rotate
          </div>
        </>
      )}
    </div>
  );
};

export default ProductViewer;