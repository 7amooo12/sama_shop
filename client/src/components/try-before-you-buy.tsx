import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Image, Lightbulb, WandSparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuthSafe } from '@/hooks/use-auth-safe';
import { useTranslation } from 'react-i18next';
import HexCard from './ui/hex-card';
import NeoButton from './ui/neo-button';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';

const TryBeforeYouBuy = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuthSafe();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  
  // Fetch featured products to display in the thumbnail grid
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products', { featured: true }],
  });
  
  const renderThumbnails = () => {
    if (!products || products.length === 0) {
      return Array(4).fill(0).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg bg-dark-gray border border-gray-800 flex items-center justify-center animate-pulse" />
      ));
    }
    
    return (
      <>
        {products.slice(0, 3).map((product) => (
          <div 
            key={product.id} 
            className="aspect-square rounded-lg bg-dark-gray border border-gray-800 flex items-center justify-center cursor-pointer hover:border-electric-blue transition-colors"
            onClick={() => setSelectedImage(product.imageUrl)}
          >
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover rounded-lg" 
            />
          </div>
        ))}
        <div className="aspect-square rounded-lg bg-dark-gray border border-gray-700 flex items-center justify-center">
          <span className="text-sm text-muted-gray">+{Math.max(0, products.length - 3)}</span>
        </div>
      </>
    );
  };
  
  return (
    <section className="py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 hex-pattern circuit-lines opacity-10"></div>
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-space font-bold text-3xl md:text-4xl mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-glowing-cyan">
              Try Before You Buy
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-gray">
            Upload a photo of your space and see how our lighting fixtures would look in your home with our AR visualization tool.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div 
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HexCard className="p-6">
              <div className="relative aspect-video rounded-lg bg-rich-black overflow-hidden border border-gray-800">
                {/* AR Preview Area */}
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt="Selected product" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-gray flex items-center justify-center">
                        <Camera className="h-8 w-8 text-electric-blue" />
                      </div>
                      <p className="text-muted-gray text-sm">Upload a photo of your room<br/>or use your camera</p>
                    </div>
                  </div>
                )}
                
                {/* Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-dark-gray bg-opacity-70 backdrop-blur-md rounded-full px-4 py-2 flex items-center space-x-4">
                  <NeoButton size="icon" className="w-8 h-8">
                    <Upload size={14} className="text-white" />
                  </NeoButton>
                  <NeoButton size="icon" className="w-8 h-8">
                    <Camera size={14} className="text-white" />
                  </NeoButton>
                  <NeoButton size="icon" className="w-8 h-8">
                    <Image size={14} className="text-white" />
                  </NeoButton>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-4 gap-3">
                {renderThumbnails()}
              </div>
            </HexCard>
          </motion.div>
          
          <motion.div 
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="font-space font-semibold text-2xl text-white mb-4">Visualize Perfect Lighting</h3>
            <p className="text-muted-gray mb-6">
              Not sure if our chandeliers will match your space? Our cutting-edge AR tool lets you visualize any of our lighting fixtures in your own home before making a purchase.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="mt-1 mr-4 w-8 h-8 rounded-full bg-electric-blue bg-opacity-20 flex items-center justify-center text-electric-blue">
                  <Upload size={18} />
                </div>
                <div>
                  <h4 className="font-space font-medium text-white">Upload Your Space</h4>
                  <p className="text-sm text-muted-gray">Take a photo of your room or ceiling where you want to install the lighting.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-1 mr-4 w-8 h-8 rounded-full bg-electric-blue bg-opacity-20 flex items-center justify-center text-electric-blue">
                  <Lightbulb size={18} />
                </div>
                <div>
                  <h4 className="font-space font-medium text-white">Place & Customize</h4>
                  <p className="text-sm text-muted-gray">Drag, resize and position any of our fixtures to see how they look in your space.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-1 mr-4 w-8 h-8 rounded-full bg-electric-blue bg-opacity-20 flex items-center justify-center text-electric-blue">
                  <WandSparkles size={18} />
                </div>
                <div>
                  <h4 className="font-space font-medium text-white">Try Light Effects</h4>
                  <p className="text-sm text-muted-gray">Toggle lights on/off and adjust brightness to visualize the real lighting effect.</p>
                </div>
              </div>
            </div>
            
            {/* Try AR Experience Button */}
            <button
              onClick={() => {
                if (!user) {
                  toast({
                    title: t('auth.login_required', 'Login Required'),
                    description: t('auth.feature_redirect', 'Sign in to access this premium feature!'),
                    variant: "destructive"
                  });
                  navigate('/auth?redirect=/ar-experience');
                  return;
                }
                navigate('/ar-experience');
              }}
              className="inline-block px-8 py-3 font-syncopate text-sm font-semibold uppercase tracking-wide bg-gradient-to-r from-electric-blue to-vivid-purple rounded-lg hover:opacity-90 transition duration-300 text-white"
            >
              {t('ar.try_experience', 'Try AR Experience')}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TryBeforeYouBuy;
