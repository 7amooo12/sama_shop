import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@shared/schema';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import LightToggle from '@/components/ui/light-toggle';
import NeoButton from '@/components/ui/neo-button';
import { 
  Heart, 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  Truck, 
  Shield, 
  RotateCw,
  Loader2
} from 'lucide-react';
import ProductViewer from '@/components/product/3d-viewer';
import { formatPrice } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuthSafe } from '@/hooks/use-auth-safe';

const ProductPage = () => {
  const [, params] = useRoute('/product/:id');
  const productId = parseInt(params?.id || '0');
  const [isLightOn, setIsLightOn] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { user } = useAuthSafe();
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Fetch related products (same category)
  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: ['/api/products', { category: product?.category }],
    enabled: !!product?.category,
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/cart", {
        productId,
        quantity
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product?.name} has been added to your cart.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle quantity changes
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive"
      });
      return;
    }
    
    addToCartMutation.mutate();
  };
  
  // Toggle light effect
  const handleToggleLight = (on: boolean) => {
    setIsLightOn(on);
  };
  
  // Filter related products to exclude the current product
  const filteredRelatedProducts = relatedProducts?.filter(p => p.id !== productId).slice(0, 3) || [];
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-electric-blue" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
            <p className="text-muted-gray mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/products">
              <a className="px-6 py-3 bg-gradient-to-r from-electric-blue to-vivid-purple rounded-lg text-white font-medium">
                Back to Products
              </a>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-6">
          {/* Breadcrumb */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/">
                <a className="text-muted-gray hover:text-white transition-colors">Home</a>
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-gray" />
              <Link href="/products">
                <a className="text-muted-gray hover:text-white transition-colors">Products</a>
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-gray" />
              <Link href={`/products?category=${product.category}`}>
                <a className="text-muted-gray hover:text-white transition-colors">{product.category}</a>
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-gray" />
              <span className="text-white font-medium truncate">{product.name}</span>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image with 3D Viewer */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-xl overflow-hidden bg-rich-black border border-gray-800 aspect-square">
                {/* Light toggle switch */}
                <div className="absolute top-4 right-4 z-20">
                  <LightToggle onChange={handleToggleLight} />
                </div>
                
                {/* 3D Viewer or Image */}
                <ProductViewer 
                  imageUrl={product.imageUrl} 
                  isLightOn={isLightOn} 
                  alt={product.name}
                />
                
                {/* 360 view badge */}
                <div className="absolute bottom-4 right-4 z-20 bg-dark-gray bg-opacity-70 p-2 rounded-lg text-xs text-white flex items-center">
                  <RotateCw size={12} className="mr-1" /> 360° View
                </div>
              </div>
              
              {/* Thumbnails (could be expanded for multiple images) */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-electric-blue">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Additional thumbnails would go here */}
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-700 bg-dark-gray opacity-60"></div>
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-700 bg-dark-gray opacity-60"></div>
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-700 bg-dark-gray opacity-60"></div>
              </div>
            </motion.div>
            
            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Product Title and Rating */}
              <div className="mb-6">
                <h1 className="font-space font-bold text-3xl text-white mb-2">{product.name}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex text-glowing-cyan">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span 
                        key={i}
                        className={i < Math.floor(product.rating || 0) ? "text-glowing-cyan" : "text-muted-gray"}
                      >
                        {i < Math.floor(product.rating || 0) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-gray">({product.ratingCount || 0} reviews)</span>
                </div>
                
                {/* Price */}
                <div className="mb-6">
                  {product.salePrice ? (
                    <div className="flex items-center">
                      <span className="text-3xl font-semibold text-white mr-3">
                        {formatPrice(product.salePrice)}
                      </span>
                      <span className="text-lg line-through text-muted-gray">
                        {formatPrice(product.price)}
                      </span>
                      <span className="ml-3 px-2 py-1 bg-electric-blue bg-opacity-20 text-electric-blue text-xs font-semibold rounded">
                        {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-semibold text-white">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-8">
                <p className="text-muted-gray leading-relaxed">{product.description}</p>
              </div>
              
              {/* Features */}
              {product.features && (
                <div className="mb-8">
                  <h3 className="font-space font-semibold text-white mb-3">Features</h3>
                  <ul className="grid grid-cols-2 gap-3">
                    {Object.entries(product.features as Record<string, any>).map(([key, value]) => (
                      <li key={key} className="flex items-start">
                        <div className="w-1 h-1 rounded-full bg-electric-blue mt-2 mr-2"></div>
                        <div>
                          <span className="text-white text-sm capitalize">{key}</span>
                          <span className="text-muted-gray text-sm ml-1">{value.toString()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-3 py-1 text-xs bg-dark-gray border border-gray-700 rounded-full text-muted-gray"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add to Cart */}
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center h-12 rounded-lg overflow-hidden border border-gray-700">
                    <button 
                      onClick={decrementQuantity}
                      className="w-12 h-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <Minus size={16} className="text-white" />
                    </button>
                    <div className="w-12 h-full flex items-center justify-center text-white font-medium">
                      {quantity}
                    </div>
                    <button 
                      onClick={incrementQuantity}
                      className="w-12 h-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={16} className="text-white" />
                    </button>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button 
                    className="flex-1 h-12 bg-gradient-to-r from-electric-blue to-vivid-purple rounded-lg font-medium text-white flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                  >
                    {addToCartMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 mr-2" />
                    )}
                    <span>Add to Cart</span>
                  </button>
                  
                  {/* Wishlist Button */}
                  <button className="w-12 h-12 rounded-lg neo-button">
                    <Heart className="h-5 w-5 text-white" />
                  </button>
                </div>
                
                {/* Shipping and warranty info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center p-4 rounded-lg bg-dark-gray">
                    <Truck className="h-5 w-5 text-electric-blue mr-3" />
                    <div>
                      <p className="text-sm font-medium text-white">Free Shipping</p>
                      <p className="text-xs text-muted-gray">Orders over $999</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 rounded-lg bg-dark-gray">
                    <Shield className="h-5 w-5 text-vivid-purple mr-3" />
                    <div>
                      <p className="text-sm font-medium text-white">5 Year Warranty</p>
                      <p className="text-xs text-muted-gray">Full coverage</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Related Products */}
          {filteredRelatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="font-space font-bold text-2xl text-white mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRelatedProducts.map(relatedProduct => (
                  <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                    <a className="group block">
                      <div className="relative rounded-xl overflow-hidden bg-dark-gray aspect-video mb-4">
                        <img 
                          src={relatedProduct.imageUrl} 
                          alt={relatedProduct.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-rich-black to-transparent opacity-60"></div>
                      </div>
                      <h3 className="font-space font-medium text-white group-hover:text-electric-blue transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm text-muted-gray">{formatPrice(relatedProduct.salePrice || relatedProduct.price)}</p>
                    </a>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductPage;
