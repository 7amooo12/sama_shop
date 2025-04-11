import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Product, Order } from '@shared/schema';
import AdminSidebar from '@/components/admin/sidebar';
import StatCard from '@/components/admin/stat-card';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp,
  Calendar,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatPrice } from '@/lib/utils';

// Placeholder data for charts
const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
  { name: 'Jul', sales: 3490 },
  { name: 'Aug', sales: 4200 },
  { name: 'Sep', sales: 5100 },
  { name: 'Oct', sales: 8200 },
  { name: 'Nov', sales: 7300 },
  { name: 'Dec', sales: 9500 },
];

const orderStatusData = [
  { name: 'Pending', value: 5 },
  { name: 'Processing', value: 10 },
  { name: 'Shipped', value: 15 },
  { name: 'Delivered', value: 25 },
];

const categoryData = [
  { name: 'Chandeliers', sales: 12400 },
  { name: 'Pendants', sales: 9800 },
  { name: 'Smart Lighting', sales: 7600 },
  { name: 'Crystal', sales: 5400 },
  { name: 'Modern', sales: 4200 },
];

const COLORS = ['#00C2FF', '#9F00FF', '#FF2EF7', '#41FFFF', '#A0A0B0'];

const AdminDashboard = () => {
  // Fetch data for dashboard stats
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });
  
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
  });
  
  const isLoading = isLoadingProducts || isLoadingUsers || isLoadingOrders;
  
  // Calculate dashboard stats
  const totalProducts = products?.length || 0;
  const totalUsers = users?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  
  // Calculate recent orders (last 5)
  const recentOrders = orders?.slice(0, 5) || [];
  
  return (
    <div className="min-h-screen bg-rich-black flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-space font-bold text-2xl md:text-3xl text-white">Dashboard</h1>
            <div className="flex items-center text-sm text-muted-gray">
              <Calendar size={16} className="mr-2" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
              <Loader2 className="h-12 w-12 animate-spin text-electric-blue" />
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  title="Total Revenue"
                  value={formatPrice(totalRevenue)}
                  icon={<DollarSign className="h-6 w-6 text-white" />}
                  trend="+12.5%"
                  colorFrom="#00C2FF"
                  colorTo="#41FFFF"
                />
                <StatCard 
                  title="Total Orders"
                  value={totalOrders.toString()}
                  icon={<ShoppingBag className="h-6 w-6 text-white" />}
                  trend="+8.2%"
                  colorFrom="#9F00FF"
                  colorTo="#FF2EF7"
                />
                <StatCard 
                  title="Total Products"
                  value={totalProducts.toString()}
                  icon={<Package className="h-6 w-6 text-white" />}
                  trend="+4.5%"
                  colorFrom="#00C2FF"
                  colorTo="#41FFFF"
                />
                <StatCard 
                  title="Total Users"
                  value={totalUsers.toString()}
                  icon={<Users className="h-6 w-6 text-white" />}
                  trend="+15.3%"
                  colorFrom="#9F00FF"
                  colorTo="#FF2EF7"
                />
              </div>
              
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sales Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="p-6 rounded-xl bg-dark-gray border border-gray-800"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-space font-semibold text-white">Sales Overview</h2>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-electric-blue mr-1" />
                      <span className="text-xs text-electric-blue">+12.5% from last year</span>
                    </div>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#9F00FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#A0A0B0' }} 
                          axisLine={{ stroke: '#303450' }}
                          tickLine={{ stroke: '#303450' }}
                        />
                        <YAxis 
                          tick={{ fill: '#A0A0B0' }} 
                          axisLine={{ stroke: '#303450' }}
                          tickLine={{ stroke: '#303450' }}
                        />
                        <CartesianGrid stroke="#303450" strokeDasharray="3 3" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(10, 14, 30, 0.8)', 
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#E0E0E0'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#00C2FF" 
                          fillOpacity={1} 
                          fill="url(#salesGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
                
                {/* Category Performance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="p-6 rounded-xl bg-dark-gray border border-gray-800"
                >
                  <h2 className="font-space font-semibold text-white mb-6">Category Performance</h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#A0A0B0' }} 
                          axisLine={{ stroke: '#303450' }}
                          tickLine={{ stroke: '#303450' }}
                        />
                        <YAxis 
                          tick={{ fill: '#A0A0B0' }} 
                          axisLine={{ stroke: '#303450' }}
                          tickLine={{ stroke: '#303450' }}
                        />
                        <CartesianGrid stroke="#303450" strokeDasharray="3 3" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(10, 14, 30, 0.8)', 
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#E0E0E0'
                          }} 
                        />
                        <Bar dataKey="sales" fill="#9F00FF" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
              
              {/* More Charts and Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Status Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="p-6 rounded-xl bg-dark-gray border border-gray-800"
                >
                  <h2 className="font-space font-semibold text-white mb-6">Order Status</h2>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(10, 14, 30, 0.8)', 
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#E0E0E0'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center mt-4">
                    {orderStatusData.map((entry, index) => (
                      <div key={`legend-${index}`} className="flex items-center mx-2 my-1">
                        <div 
                          className="w-3 h-3 rounded-full mr-1" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs text-muted-gray">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Recent Orders */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="p-6 rounded-xl bg-dark-gray border border-gray-800 lg:col-span-2"
                >
                  <h2 className="font-space font-semibold text-white mb-6">Recent Orders</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-muted-gray border-b border-gray-800">
                          <th className="pb-3 font-medium">Order ID</th>
                          <th className="pb-3 font-medium">Customer</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-800">
                            <td className="py-3 text-white">{`#${order.id}`}</td>
                            <td className="py-3 text-white">{order.email.split('@')[0]}</td>
                            <td className="py-3 text-muted-gray">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="py-3">
                              <span 
                                className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === 'pending' ? 'bg-blue-500 bg-opacity-20 text-blue-300' :
                                  order.status === 'processing' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                                  order.status === 'shipped' ? 'bg-purple-500 bg-opacity-20 text-purple-300' :
                                  'bg-green-500 bg-opacity-20 text-green-300'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 text-white text-right">{formatPrice(order.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
