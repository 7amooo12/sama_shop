import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Product, InsertProduct } from '@shared/schema';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '@/components/admin/sidebar';
import ProductForm from '@/components/admin/product-form';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Eye, 
  Archive,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import NeoButton from '@/components/ui/neo-button';

const AdminProducts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: InsertProduct) => {
      return await apiRequest("POST", "/api/admin/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddingProduct(false);
      toast({
        title: "Product created",
        description: "The product has been created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: InsertProduct }) => {
      return await apiRequest("PUT", `/api/admin/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      toast({
        title: "Product updated",
        description: "The product has been updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle create product
  const handleCreateProduct = (productData: InsertProduct) => {
    createProductMutation.mutate(productData);
  };
  
  // Handle update product
  const handleUpdateProduct = (productData: InsertProduct) => {
    if (!editingProduct) return;
    updateProductMutation.mutate({ id: editingProduct.id, data: productData });
  };
  
  // Handle delete product
  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    deleteProductMutation.mutate(productToDelete.id);
  };
  
  // Open delete confirmation
  const openDeleteConfirm = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
  };
  
  // Filter products based on search term
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  return (
    <div className="min-h-screen bg-rich-black flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="font-space font-bold text-2xl md:text-3xl text-white">Products Management</h1>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-grow">
                <Input 
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-gray" />
              </div>
              
              <NeoButton 
                className="flex items-center justify-center text-white font-medium bg-gradient-to-r from-electric-blue to-vivid-purple"
                onClick={() => setIsAddingProduct(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </NeoButton>
            </div>
          </div>
          
          {/* Products Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
              <Loader2 className="h-12 w-12 animate-spin text-electric-blue" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-dark-gray rounded-xl p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Products Found</h3>
              <p className="text-muted-gray mb-6">
                {searchTerm ? 'No products match your search criteria.' : 'There are no products in the database.'}
              </p>
              <button 
                className="px-6 py-2 bg-gradient-to-r from-electric-blue to-vivid-purple rounded-lg text-white"
                onClick={() => setIsAddingProduct(true)}
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
              <table className="w-full bg-dark-gray rounded-xl text-left">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="p-4 font-medium text-muted-gray">Image</th>
                    <th className="p-4 font-medium text-muted-gray">Name</th>
                    <th className="p-4 font-medium text-muted-gray">Category</th>
                    <th className="p-4 font-medium text-muted-gray">Price</th>
                    <th className="p-4 font-medium text-muted-gray">Stock</th>
                    <th className="p-4 font-medium text-muted-gray">Featured</th>
                    <th className="p-4 font-medium text-muted-gray">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-md bg-rich-black overflow-hidden">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4 font-medium text-white">{product.name}</td>
                      <td className="p-4 text-muted-gray">{product.category}</td>
                      <td className="p-4 text-white">
                        {product.salePrice ? (
                          <div>
                            <span className="text-electric-blue">{formatPrice(product.salePrice)}</span>
                            <span className="text-xs text-muted-gray line-through ml-2">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        ) : (
                          formatPrice(product.price)
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.inStock 
                            ? 'bg-green-500 bg-opacity-20 text-green-300' 
                            : 'bg-red-500 bg-opacity-20 text-red-300'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.isFeatured 
                            ? 'bg-electric-blue bg-opacity-20 text-electric-blue' 
                            : 'bg-gray-500 bg-opacity-20 text-gray-300'
                        }`}>
                          {product.isFeatured ? 'Featured' : 'Not Featured'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button 
                            className="p-2 rounded-lg bg-dark-gray hover:bg-gray-800 transition-colors"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit size={16} className="text-electric-blue" />
                          </button>
                          <button 
                            className="p-2 rounded-lg bg-dark-gray hover:bg-gray-800 transition-colors"
                            onClick={() => openDeleteConfirm(product)}
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                          <a 
                            href={`/product/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-dark-gray hover:bg-gray-800 transition-colors"
                          >
                            <Eye size={16} className="text-muted-gray" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
          
          {/* Add Product Dialog */}
          <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
            <DialogContent className="max-w-3xl bg-dark-gray">
              <DialogHeader>
                <DialogTitle className="text-white font-space">Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm 
                onSubmit={handleCreateProduct} 
                isLoading={createProductMutation.isPending}
              />
            </DialogContent>
          </Dialog>
          
          {/* Edit Product Dialog */}
          <Dialog 
            open={!!editingProduct} 
            onOpenChange={(open) => !open && setEditingProduct(null)}
          >
            <DialogContent className="max-w-3xl bg-dark-gray">
              <DialogHeader>
                <DialogTitle className="text-white font-space">Edit Product</DialogTitle>
              </DialogHeader>
              {editingProduct && (
                <ProductForm 
                  initialData={editingProduct}
                  onSubmit={handleUpdateProduct} 
                  isLoading={updateProductMutation.isPending}
                />
              )}
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent className="bg-dark-gray">
              <DialogHeader>
                <DialogTitle className="text-white font-space">Confirm Deletion</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <p className="text-white text-center mb-2">
                  Are you sure you want to delete this product?
                </p>
                {productToDelete && (
                  <p className="text-muted-gray text-center font-medium">
                    "{productToDelete.name}"
                  </p>
                )}
                <p className="text-red-400 text-sm text-center mt-4">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-4 mt-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white"
                  onClick={handleDeleteProduct}
                  disabled={deleteProductMutation.isPending}
                >
                  {deleteProductMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : "Delete"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
