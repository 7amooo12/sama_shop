import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { 
  Upload, 
  Camera, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Move, 
  Sun, 
  Moon,
  Loader2,
  Lightbulb
} from 'lucide-react';
import HexCard from '@/components/ui/hex-card';
import NeoButton from '@/components/ui/neo-button';
import { Slider } from '@/components/ui/slider';
import LightToggle from '@/components/ui/light-toggle';
import { useToast } from '@/hooks/use-toast';

const ArExperience = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLightOn, setIsLightOn] = useState(true);
  const [productSize, setProductSize] = useState(50); // 0-100 scale
  const [brightness, setBrightness] = useState(70); // 0-100 scale
  
  // Fetch products for the selection panel
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Handle room image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setRoomImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Handle product selection
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsLightOn(true);
  };
  
  // Clear room image
  const handleClearImage = () => {
    setRoomImage(null);
    setSelectedProduct(null);
  };
  
  // Handle light toggle
  const handleToggleLight = (on: boolean) => {
    setIsLightOn(on);
  };
  
  // Handle camera capture (mock function)
  const handleCameraCapture = () => {
    toast({
      title: "Camera Access",
      description: "This feature would request access to your camera in a full implementation.",
    });
  };
  
  // Handle AR screenshot (mock function)
  const handleTakeScreenshot = () => {
    toast({
      title: "Screenshot Captured",
      description: "Your AR design has been saved to your gallery.",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-space font-bold text-3xl md:text-4xl text-white mb-3">
              AR <span className="text-electric-blue">Visualization</span> Tool
            </h1>
            <p className="max-w-2xl mx-auto text-muted-gray">
              Upload a photo of your space and see how our lighting fixtures would look in your home before making a purchase decision.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AR Viewer */}
            <div className="lg:col-span-2">
              <HexCard className="overflow-hidden">
                <div className="p-6">
                  <h2 className="font-space font-semibold text-xl text-white mb-4">
                    Your Space Visualizer
                  </h2>
                  
                  <div className="relative aspect-video bg-rich-black rounded-lg overflow-hidden border border-gray-800">
                    {roomImage ? (
                      <>
                        {/* Room Image */}
                        <img 
                          src={roomImage} 
                          alt="Your room" 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlaid Product (with dynamic positioning) */}
                        {selectedProduct && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative" style={{ transform: `scale(${productSize / 50})` }}>
                              <motion.img 
                                src={selectedProduct.imageUrl} 
                                alt={selectedProduct.name}
                                className="max-w-[50%] max-h-[50%] object-contain"
                                style={{ 
                                  filter: isLightOn 
                                    ? `brightness(${brightness / 50}) drop-shadow(0 0 15px rgba(65, 255, 255, 0.8))` 
                                    : 'brightness(0.7)' 
                                }}
                                drag
                                dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                                whileDrag={{ scale: 1.05 }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Controls overlay */}
                        <div className="absolute right-4 top-4 flex flex-col space-y-2">
                          <NeoButton 
                            variant="default" 
                            size="icon" 
                            onClick={handleClearImage}
                          >
                            <Trash2 size={16} className="text-white" />
                          </NeoButton>
                          <NeoButton 
                            variant="default" 
                            size="icon" 
                            onClick={handleTakeScreenshot}
                          >
                            <Camera size={16} className="text-white" />
                          </NeoButton>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-gray flex items-center justify-center">
                            <Upload size={24} className="text-electric-blue" />
                          </div>
                          <p className="text-muted-gray">Upload a photo of your room<br/>or use your camera</p>
                          
                          <div className="mt-6 flex justify-center space-x-4">
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleImageUpload} 
                              accept="image/*" 
                              className="hidden" 
                            />
                            <NeoButton onClick={triggerFileInput}>
                              <Upload size={16} className="mr-2" /> Upload Photo
                            </NeoButton>
                            <NeoButton onClick={handleCameraCapture}>
                              <Camera size={16} className="mr-2" /> Use Camera
                            </NeoButton>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* AR Controls */}
                  {roomImage && selectedProduct && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-space text-white mb-4 flex items-center">
                          <Move size={18} className="mr-2 text-electric-blue" />
                          Position & Size
                        </h3>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-muted-gray mb-2">
                            <span>Size</span>
                            <span>{productSize}%</span>
                          </div>
                          <div className="flex items-center">
                            <ZoomOut size={16} className="text-muted-gray mr-2" />
                            <Slider
                              value={[productSize]}
                              onValueChange={(values) => setProductSize(values[0])}
                              min={10}
                              max={100}
                              step={1}
                              className="flex-1"
                            />
                            <ZoomIn size={16} className="text-muted-gray ml-2" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-gray">
                          Drag the fixture to position it in your space
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-space text-white mb-4 flex items-center">
                          <Lightbulb size={18} className="mr-2 text-electric-blue" />
                          Lighting Effects
                        </h3>
                        <div className="flex items-center mb-4">
                          <span className="text-sm text-muted-gray mr-3">Light</span>
                          <LightToggle 
                            isOn={isLightOn} 
                            onChange={handleToggleLight} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm text-muted-gray mb-2">
                            <span>Brightness</span>
                            <span>{brightness}%</span>
                          </div>
                          <div className="flex items-center">
                            <Moon size={16} className="text-muted-gray mr-2" />
                            <Slider
                              value={[brightness]}
                              onValueChange={(values) => setBrightness(values[0])}
                              min={10}
                              max={100}
                              step={1}
                              disabled={!isLightOn}
                              className="flex-1"
                            />
                            <Sun size={16} className="text-muted-gray ml-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </HexCard>
            </div>
            
            {/* Product Selection Panel */}
            <div className="lg:col-span-1">
              <HexCard className="overflow-hidden">
                <div className="p-6">
                  <h2 className="font-space font-semibold text-xl text-white mb-4">
                    Select a Fixture
                  </h2>
                  
                  {isLoading ? (
                    <div className="py-20 flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {products?.map((product) => (
                        <div 
                          key={product.id}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                            selectedProduct?.id === product.id 
                              ? 'bg-electric-blue bg-opacity-20 border border-electric-blue' 
                              : 'bg-dark-gray border border-gray-800 hover:border-gray-600'
                          }`}
                          onClick={() => handleSelectProduct(product)}
                        >
                          <div className="w-16 h-16 rounded-md bg-rich-black overflow-hidden flex-shrink-0">
                            <img 
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-3 flex-grow">
                            <h3 className="font-medium text-white">{product.name}</h3>
                            <p className="text-xs text-muted-gray">{product.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </HexCard>
              
              {/* Instructions */}
              <div className="mt-6">
                <h3 className="font-space font-medium text-white mb-3">How It Works</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 w-6 h-6 rounded-full bg-electric-blue bg-opacity-20 flex items-center justify-center text-electric-blue text-xs">
                      1
                    </div>
                    <p className="text-sm text-muted-gray">
                      Upload a photo of your room where you want to install the lighting
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 w-6 h-6 rounded-full bg-electric-blue bg-opacity-20 flex items-center justify-center text-electric-blue text-xs">
                      2
                    </div>
                    <p className="text-sm text-muted-gray">
                      Choose a chandelier or fixture from our collection
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 w-6 h-6 rounded-full bg-electric-blue bg-opacity-20 flex items-center justify-center text-electric-blue text-xs">
                      3
                    </div>
                    <p className="text-sm text-muted-gray">
                      Drag to position, resize, and adjust the lighting effects
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 w-6 h-6 rounded-full bg-electric-blue bg-opacity-20 flex items-center justify-center text-electric-blue text-xs">
                      4
                    </div>
                    <p className="text-sm text-muted-gray">
                      Capture and save your design or add the product to cart
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArExperience;
