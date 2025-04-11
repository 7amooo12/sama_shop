import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/sidebar';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Shield,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  
  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });
  
  // Handle view user details
  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };
  
  // Filter users based on search term
  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];
  
  // Generate initials for avatar
  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="min-h-screen bg-rich-black flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-space font-bold text-2xl md:text-3xl text-white">User Management</h1>
            
            <div className="relative w-64">
              <Input 
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-gray" />
            </div>
          </div>
          
          {/* Users List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
              <Loader2 className="h-12 w-12 animate-spin text-electric-blue" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-dark-gray rounded-xl p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-gray mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Users Found</h3>
              <p className="text-muted-gray">
                {searchTerm ? 'No users match your search criteria.' : 'There are no users registered in the system.'}
              </p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="bg-dark-gray rounded-xl p-6 cursor-pointer hover:bg-gray-900/70 transition-colors border border-gray-800 hover:border-gray-700"
                    onClick={() => handleViewUserDetails(user)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 bg-gradient-to-br from-electric-blue to-vivid-purple">
                        <AvatarFallback>{getInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <h3 className="font-medium text-white">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username}
                        </h3>
                        <p className="text-sm text-muted-gray">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-xs text-muted-gray">
                        Joined {formatDate(user.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      {user.isAdmin && (
                        <Badge className="bg-vivid-purple/20 text-vivid-purple">Admin</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* User Details Dialog */}
          <Dialog 
            open={isUserDetailsOpen} 
            onOpenChange={setIsUserDetailsOpen}
          >
            <DialogContent className="bg-dark-gray">
              <DialogHeader>
                <DialogTitle className="text-white font-space">User Details</DialogTitle>
              </DialogHeader>
              
              {selectedUser && (
                <div className="py-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                    <Avatar className="h-24 w-24 bg-gradient-to-br from-electric-blue to-vivid-purple">
                      <AvatarFallback className="text-xl">{getInitials(selectedUser)}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="text-xl font-medium text-white text-center sm:text-left">
                        {selectedUser.firstName && selectedUser.lastName 
                          ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                          : selectedUser.username}
                      </h2>
                      <p className="text-muted-gray mb-2 text-center sm:text-left">{selectedUser.email}</p>
                      
                      {selectedUser.isAdmin && (
                        <Badge className="bg-vivid-purple/20 text-vivid-purple">Administrator</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-rich-black rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-white mb-3">User Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <UserIcon size={16} className="text-electric-blue mr-2" />
                        <div>
                          <p className="text-muted-gray">Username</p>
                          <p className="text-white">{selectedUser.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Mail size={16} className="text-electric-blue mr-2" />
                        <div>
                          <p className="text-muted-gray">Email</p>
                          <p className="text-white">{selectedUser.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar size={16} className="text-electric-blue mr-2" />
                        <div>
                          <p className="text-muted-gray">Joined</p>
                          <p className="text-white">
                            {formatDate(selectedUser.createdAt, { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Shield size={16} className="text-electric-blue mr-2" />
                        <div>
                          <p className="text-muted-gray">Role</p>
                          <p className="text-white">{selectedUser.isAdmin ? 'Administrator' : 'Customer'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional details could be added here, such as order history */}
                  <div className="flex justify-end">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                      onClick={() => setIsUserDetailsOpen(false)}
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

export default AdminUsers;
