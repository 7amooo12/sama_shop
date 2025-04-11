import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Order, CartItem } from '@shared/schema';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/sidebar';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Clock,
  Loader2
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300',
  processing: 'bg-blue-500/20 text-blue-300',
  shipped: 'bg-purple-500/20 text-purple-300',
  delivered: 'bg-green-500/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-300',
};

const AdminOrders = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  
  // Fetch orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return await apiRequest("PUT", `/api/admin/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setIsStatusChanging(false);
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully"
      });
    },
    onError: (error) => {
      setIsStatusChanging(false);
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle update order status
  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    setIsStatusChanging(true);
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
  };
  
  // Handle view order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };
  
  // Toggle expand/collapse order row
  const toggleExpandOrder = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  
  // Filter orders based on search term and status
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) || 
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  return (
    <div className="min-h-screen bg-rich-black flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="font-space font-bold text-2xl md:text-3xl text-white">Orders Management</h1>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-grow">
                <Input 
                  type="text"
                  placeholder="Search by order ID or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-gray" />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Orders Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
              <Loader2 className="h-12 w-12 animate-spin text-electric-blue" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-dark-gray rounded-xl p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-gray mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Orders Found</h3>
              <p className="text-muted-gray">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No orders match your search criteria.' 
                  : 'There are no orders in the system yet.'}
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="bg-dark-gray rounded-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-rich-black">
                      <th className="p-4 font-medium text-muted-gray"></th>
                      <th className="p-4 font-medium text-muted-gray">Order ID</th>
                      <th className="p-4 font-medium text-muted-gray">Customer</th>
                      <th className="p-4 font-medium text-muted-gray">Date</th>
                      <th className="p-4 font-medium text-muted-gray">Status</th>
                      <th className="p-4 font-medium text-muted-gray">Total</th>
                      <th className="p-4 font-medium text-muted-gray">Items</th>
                      <th className="p-4 font-medium text-muted-gray">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <>
                        <tr 
                          key={order.id} 
                          className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors cursor-pointer"
                          onClick={() => toggleExpandOrder(order.id)}
                        >
                          <td className="p-4 w-10">
                            {expandedOrder === order.id ? (
                              <ChevronDown size={16} className="text-electric-blue" />
                            ) : (
                              <ChevronRight size={16} className="text-muted-gray" />
                            )}
                          </td>
                          <td className="p-4 font-medium text-white">#{order.id}</td>
                          <td className="p-4 text-white">{order.email}</td>
                          <td className="p-4 text-muted-gray">
                            {formatDate(order.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="p-4">
                            <Badge 
                              className={`${orderStatusColors[order.status] || 'bg-gray-500/20 text-gray-300'}`}
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-4 font-medium text-white">{formatPrice(order.total)}</td>
                          <td className="p-4 text-muted-gray">{(order.items as CartItem[]).length} items</td>
                          <td className="p-4">
                            <button 
                              className="px-3 py-1 rounded-lg bg-electric-blue bg-opacity-20 text-electric-blue text-sm hover:bg-opacity-30 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewOrderDetails(order);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Order Details */}
                        {expandedOrder === order.id && (
                          <tr className="bg-rich-black/50">
                            <td colSpan={8} className="p-4">
                              <div className="flex flex-col space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Shipping Address */}
                                  <div>
                                    <h4 className="font-medium text-white mb-2">Shipping Address</h4>
                                    <div className="bg-rich-black p-3 rounded-lg text-sm">
                                      <p className="text-muted-gray">
                                        {order.shippingAddress.address}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                                        {order.shippingAddress.country}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Order Timeline */}
                                  <div>
                                    <h4 className="font-medium text-white mb-2">Order Timeline</h4>
                                    <div className="bg-rich-black p-3 rounded-lg">
                                      <div className="flex items-start">
                                        <div className="mt-1 mr-3 w-5 h-5 rounded-full bg-electric-blue bg-opacity-20 flex items-center justify-center">
                                          <Clock size={12} className="text-electric-blue" />
                                        </div>
                                        <div>
                                          <p className="text-white text-sm">Order Placed</p>
                                          <p className="text-xs text-muted-gray">
                                            {formatDate(order.createdAt, { 
                                              year: 'numeric', 
                                              month: 'short', 
                                              day: 'numeric', 
                                              hour: '2-digit', 
                                              minute: '2-digit' 
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Change Status */}
                                <div>
                                  <h4 className="font-medium text-white mb-2">Change Status</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                      <button
                                        key={status}
                                        className={`px-3 py-1 rounded-lg text-sm capitalize ${
                                          order.status === status
                                            ? 'bg-vivid-purple text-white'
                                            : 'bg-gray-800 text-muted-gray hover:bg-gray-700'
                                        } transition-colors`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateStatus(order.id, status);
                                        }}
                                        disabled={isStatusChanging || order.status === status}
                                      >
                                        {status}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {/* Order Details Dialog */}
          <Dialog 
            open={isOrderDetailsOpen} 
            onOpenChange={setIsOrderDetailsOpen}
          >
            <DialogContent className="max-w-3xl bg-dark-gray">
              <DialogHeader>
                <DialogTitle className="text-white font-space">
                  Order #{selectedOrder?.id}
                </DialogTitle>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-white mb-2">Order Information</h4>
                      <div className="bg-rich-black p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-muted-gray">Order ID:</div>
                          <div className="text-white">#{selectedOrder.id}</div>
                          
                          <div className="text-muted-gray">Date:</div>
                          <div className="text-white">
                            {formatDate(selectedOrder.createdAt, { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          
                          <div className="text-muted-gray">Status:</div>
                          <div>
                            <Badge 
                              className={`${
                                orderStatusColors[selectedOrder.status] || 'bg-gray-500/20 text-gray-300'
                              }`}
                            >
                              {selectedOrder.status}
                            </Badge>
                          </div>
                          
                          <div className="text-muted-gray">Customer:</div>
                          <div className="text-white">{selectedOrder.email}</div>
                          
                          <div className="text-muted-gray">Total:</div>
                          <div className="text-white font-medium">{formatPrice(selectedOrder.total)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-2">Shipping Address</h4>
                      <div className="bg-rich-black p-4 rounded-lg">
                        <p className="text-white">
                          {selectedOrder.shippingAddress.address}<br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}<br />
                          {selectedOrder.shippingAddress.country}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-white mb-2">Order Items</h4>
                  <div className="bg-rich-black rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="p-3 text-left text-muted-gray font-medium">Product</th>
                          <th className="p-3 text-left text-muted-gray font-medium">Price</th>
                          <th className="p-3 text-left text-muted-gray font-medium">Quantity</th>
                          <th className="p-3 text-right text-muted-gray font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedOrder.items as CartItem[]).map((item) => (
                          <tr key={item.productId} className="border-b border-gray-800">
                            <td className="p-3">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-dark-gray overflow-hidden mr-3">
                                  <img 
                                    src={item.product.imageUrl} 
                                    alt={item.product.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-white">{item.product.name}</div>
                              </div>
                            </td>
                            <td className="p-3 text-muted-gray">
                              {formatPrice(item.product.salePrice || item.product.price)}
                            </td>
                            <td className="p-3 text-muted-gray">{item.quantity}</td>
                            <td className="p-3 text-right text-white">
                              {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                            </td>
                          </tr>
                        ))}
                        
                        {/* Order Summary */}
                        <tr className="bg-gray-900/30">
                          <td colSpan={3} className="p-3 text-right text-muted-gray font-medium">
                            Total
                          </td>
                          <td className="p-3 text-right text-white font-medium">
                            {formatPrice(selectedOrder.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex gap-2">
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          className={`px-3 py-1 rounded-lg text-sm capitalize ${
                            selectedOrder.status === status
                              ? 'bg-vivid-purple text-white'
                              : 'bg-gray-800 text-muted-gray hover:bg-gray-700'
                          } transition-colors`}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                          disabled={isStatusChanging || selectedOrder.status === status}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                      onClick={() => setIsOrderDetailsOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
