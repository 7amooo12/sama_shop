import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Cart, CartItem } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import NeoButton from '@/components/ui/neo-button';
import { formatPrice } from '@/lib/utils';
import { 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  ShoppingCart,
  Loader2,
  CreditCard,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CartPage = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  
  // Fetch cart
  const { data: cart, isLoading } = useQuery<Cart>({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });
  
  // Update cart item quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number, quantity: number }) => {
      return await apiRequest("PUT", `/api/cart/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update quantity",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest("DELETE", `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Product has been removed from your cart"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/orders", { shippingAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!"
      });
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle quantity change
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ productId, quantity: newQuantity });
  };
  
  // Handle remove item
  const handleRemoveItem = (productId: number) => {
    removeFromCartMutation.mutate(productId);
  };
  
  // Handle promo code
  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Enter a promo code",
        description: "Please enter a promo code to apply",
        variant: "destructive"
      });
      return;
    }
    
    // Mock promo code application
    if (promoCode.toLowerCase() === 'lumina20') {
      setIsPromoApplied(true);
      toast({
        title: "Promo applied",
        description: "20% discount has been applied to your order"
      });
    } else {
      toast({
        title: "Invalid promo code",
        description: "The entered promo code is invalid or expired",
        variant: "destructive"
      });
    }
  };
  
  // Handle checkout
  const handleCheckout = () => {
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip || !shippingAddress.country) {
      toast({
        title: "Incomplete shipping information",
        description: "Please fill in all shipping details",
        variant: "destructive"
      });
      return;
    }
    
    createOrderMutation.mutate();
  };
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!cart || !cart.items.length) return 0;
    
    return cart.items.reduce((total, item) => {
      const price = (item.product.salePrice || item.product.price);
      return total + (price * item.quantity);
    }, 0);
  };
  
  const subtotal = calculateSubtotal();
  const shipping = subtotal > 999 ? 0 : 49.99;
  const discount = isPromoApplied ? subtotal * 0.2 : 0;
  const total = subtotal + shipping - discount;
  
  // Empty cart view
  if (!isLoading && (!cart || !cart.items.length)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-gray mb-6" />
              <h1 className="font-space font-bold text-3xl text-white mb-4">Your Cart is Empty</h1>
              <p className="text-muted-gray max-w-md mx-auto mb-8">
                Looks like you haven't added any products to your cart yet. Explore our collection to find the perfect lighting for your space.
              </p>
              <Link href="/products">
                <a className="px-8 py-3 font-medium bg-gradient-to-r from-electric-blue to-vivid-purple rounded-lg text-white inline-flex items-center">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-space font-bold text-3xl text-white mb-8">Your Cart</h1>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-electric-blue" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="rounded-xl bg-dark-gray bg-opacity-50 border border-gray-800 overflow-hidden">
                  <div className="p-6">
                    <h2 className="font-space font-semibold text-xl text-white mb-6">Items ({cart?.items.length || 0})</h2>
                    
                    <div className="space-y-6">
                      <AnimatePresence mode="popLayout">
                        {cart?.items.map((item) => (
                          <motion.div 
                            key={item.productId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-gray-800"
                          >
                            {/* Product Image */}
                            <Link href={`/product/${item.productId}`}>
                              <a className="w-24 h-24 rounded-lg overflow-hidden bg-rich-black flex-shrink-0">
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product.name} 
                                  className="w-full h-full object-cover"
                                />
                              </a>
                            </Link>
                            
                            {/* Product Info */}
                            <div className="flex-grow">
                              <Link href={`/product/${item.productId}`}>
                                <a className="font-space font-medium text-white hover:text-electric-blue transition-colors">
                                  {item.product.name}
                                </a>
                              </Link>
                              <p className="text-sm text-muted-gray">{item.product.category}</p>
                              <div className="mt-2 flex items-center">
                                <p className="font-medium text-white">
                                  {formatPrice(item.product.salePrice || item.product.price)}
                                </p>
                                {item.product.salePrice && (
                                  <p className="ml-2 text-sm line-through text-muted-gray">
                                    {formatPrice(item.product.price)}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Quantity and Remove */}
                            <div className="flex items-center space-x-4 sm:space-x-6">
                              <div className="flex items-center h-9 rounded-lg overflow-hidden border border-gray-700">
                                <button 
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  className="w-9 h-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                                  disabled={updateQuantityMutation.isPending}
                                >
                                  <Minus size={14} className="text-white" />
                                </button>
                                <div className="w-9 h-full flex items-center justify-center text-white text-sm font-medium">
                                  {item.quantity}
                                </div>
                                <button 
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  className="w-9 h-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                                  disabled={updateQuantityMutation.isPending}
                                >
                                  <Plus size={14} className="text-white" />
                                </button>
                              </div>
                              
                              <button 
                                onClick={() => handleRemoveItem(item.productId)}
                                className="w-9 h-9 rounded-lg neo-button flex items-center justify-center"
                                disabled={removeFromCartMutation.isPending}
                              >
                                <Trash2 size={16} className="text-red-400" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <div className="bg-rich-black p-6 flex flex-wrap justify-between items-center">
                    <Link href="/products">
                      <a className="text-sm text-electric-blue flex items-center hover:underline">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Continue Shopping
                      </a>
                    </Link>
                    
                    <div className="text-right mt-4 sm:mt-0">
                      <p className="text-sm text-muted-gray mb-1">Subtotal</p>
                      <p className="text-lg font-medium text-white">{formatPrice(subtotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="rounded-xl bg-dark-gray bg-opacity-50 border border-gray-800 overflow-hidden">
                  <div className="p-6">
                    <h2 className="font-space font-semibold text-xl text-white mb-6">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-gray">Subtotal</span>
                        <span className="text-white">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-gray">Shipping</span>
                        <span className="text-white">
                          {shipping === 0 ? 'Free' : formatPrice(shipping)}
                        </span>
                      </div>
                      {isPromoApplied && (
                        <div className="flex justify-between text-green-400">
                          <span>Discount (20%)</span>
                          <span>-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="pt-4 border-t border-gray-800 flex justify-between font-medium">
                        <span className="text-white">Total</span>
                        <span className="text-xl text-white">{formatPrice(total)}</span>
                      </div>
                    </div>
                    
                    {/* Promo Code */}
                    <div className="mb-6">
                      <h3 className="font-space font-medium text-white mb-3">Promo Code</h3>
                      <div className="flex space-x-2">
                        <Input 
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter code"
                          className="bg-rich-black border-gray-700"
                          disabled={isPromoApplied}
                        />
                        <Button 
                          onClick={handleApplyPromo}
                          disabled={isPromoApplied}
                          variant="secondary"
                        >
                          Apply
                        </Button>
                      </div>
                      {isPromoApplied && (
                        <p className="mt-2 text-xs text-green-400">
                          20% discount applied successfully!
                        </p>
                      )}
                    </div>
                    
                    {/* Shipping Information */}
                    <div className="mb-6">
                      <h3 className="font-space font-medium text-white mb-3">Shipping Information</h3>
                      <div className="space-y-3">
                        <Input 
                          value={shippingAddress.address}
                          onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                          placeholder="Address"
                          className="bg-rich-black border-gray-700"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input 
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                            placeholder="City"
                            className="bg-rich-black border-gray-700"
                          />
                          <Input 
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                            placeholder="State"
                            className="bg-rich-black border-gray-700"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input 
                            value={shippingAddress.zip}
                            onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                            placeholder="Zip Code"
                            className="bg-rich-black border-gray-700"
                          />
                          <Input 
                            value={shippingAddress.country}
                            onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                            placeholder="Country"
                            className="bg-rich-black border-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Checkout Button */}
                    <button 
                      className="w-full h-12 bg-gradient-to-r from-electric-blue to-vivid-purple rounded-lg font-medium text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      onClick={handleCheckout}
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="h-5 w-5 mr-2" />
                      )}
                      <span>Proceed to Checkout</span>
                    </button>
                    
                    <p className="mt-4 text-xs text-muted-gray text-center">
                      <AlertTriangle className="inline-block h-3 w-3 mr-1" />
                      This is a demo checkout and no payment will be processed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CartPage;
