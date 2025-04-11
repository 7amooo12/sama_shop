import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, RotateCw } from 'lucide-react';
import { Product } from '@shared/schema';
import { formatPrice } from '@/lib/utils';
import HexCard from './hex-card';
import LightToggle from './light-toggle';
import NeoButton from './neo-button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuthSafe } from '@/hooks/use-auth-safe';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isLightOn, setIsLightOn] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthSafe();
  
  const [, navigate] = useLocation();
  
  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    try {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`
      });
    } catch (error) {
      toast({
        title: "Failed to add to cart",
        description: "There was an error adding this item to your cart.",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleLight = (on: boolean) => {
    setIsLightOn(on);
  };
  
  return (
    <HexCard>
      <div className="relative overflow-hidden rounded-t-lg h-64">
        <div className="absolute inset-0 bg-gradient-to-t from-rich-black to-transparent z-10"></div>
        
        {/* Light toggle switch */}
        <div className="absolute top-4 right-4 z-20">
          <LightToggle onChange={handleToggleLight} />
        </div>
        
        {/* Product image */}
        <motion.img 
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500"
          animate={{
            filter: isLightOn ? 'brightness(1.3) contrast(1.1)' : 'brightness(1) contrast(1)',
          }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Glow effect */}
        <AnimatePresence>
          {isLightOn && (
            <motion.div 
              className="absolute inset-0 bg-[#41FFFF] mix-blend-overlay opacity-0 z-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
        
        {/* 360 view icon */}
        <Link href={`/product/${product.id}`}>
          <div className="absolute bottom-4 right-4 z-20 bg-dark-gray bg-opacity-70 p-2 rounded-lg text-xs text-white flex items-center cursor-pointer hover:bg-opacity-90 transition-all">
            <RotateCw size={12} className="mr-1" /> 360° View
          </div>
        </Link>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-space font-medium text-lg text-white cursor-pointer hover:text-electric-blue transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center">
            {product.isFeatured && (
              <div className="text-xs bg-electric-blue bg-opacity-20 text-electric-blue px-2 py-1 rounded font-semibold">
                NEW
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex text-glowing-cyan text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span 
                key={i}
                className={i < Math.floor(product.rating || 0) ? "text-glowing-cyan" : "text-muted-gray"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {i < Math.floor(product.rating || 0) ? "★" : "☆"}
              </motion.span>
            ))}
          </div>
          <span className="ml-2 text-xs text-muted-gray">({product.ratingCount})</span>
        </div>
        
        <p className="text-sm text-muted-gray mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-lg font-semibold text-white">
              {formatPrice(product.salePrice || product.price)}
            </span>
            {product.salePrice && (
              <span className="text-sm line-through text-muted-gray ml-2">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <NeoButton 
              size="icon" 
              variant="default" 
              aria-label="Add to wishlist"
              onClick={() => {
                if (!user) {
                  toast({
                    title: "Login required",
                    description: "Please login to add items to wishlist",
                    variant: "destructive"
                  });
                  navigate('/auth');
                  return;
                }
                // Add wishlist functionality here
              }}
            >
              <Heart size={18} />
            </NeoButton>
            <NeoButton 
              size="icon" 
              variant="primary" 
              aria-label="Add to cart"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} className="text-white" />
            </NeoButton>
          </div>
        </div>
      </div>
    </HexCard>
  );
};

export default ProductCard;
