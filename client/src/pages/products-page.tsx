import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { Product } from '@shared/schema';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import FilterBar from '@/components/filter-bar';
import ProductCard from '@/components/ui/product-card';
import { Loader2 } from 'lucide-react';
import NeoButton from '@/components/ui/neo-button';
import Pagination from '@/components/product/pagination';

const PRODUCTS_PER_PAGE = 6;

const ProductsPage = () => {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/products/:category?');
  
  // State for filtering and sorting
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSort, setActiveSort] = useState('newest');
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || '';
    const sort = urlParams.get('sort') || 'newest';
    const page = parseInt(urlParams.get('page') || '1');
    
    setActiveCategory(category);
    setActiveSort(sort);
    setCurrentPage(page);
  }, [location]);
  
  // Fetch products
  const { data: allProducts, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products', { category: activeCategory }],
  });
  
  // Apply sorting
  const sortProducts = (products: Product[]) => {
    if (!products) return [];
    
    switch (activeSort) {
      case 'price_asc':
        return [...products].sort((a, b) => 
          (a.salePrice || a.price) - (b.salePrice || b.price)
        );
      case 'price_desc':
        return [...products].sort((a, b) => 
          (b.salePrice || b.price) - (a.salePrice || a.price)
        );
      case 'popular':
        return [...products].sort((a, b) => b.rating - a.rating);
      case 'newest':
      default:
        return products; // Assuming the API returns sorted by newest
    }
  };
  
  const sortedProducts = sortProducts(allProducts || []);
  
  // Pagination
  const totalPages = Math.ceil((sortedProducts?.length || 0) / PRODUCTS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  
  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
    
    // Update URL
    const urlParams = new URLSearchParams();
    if (category) urlParams.set('category', category);
    urlParams.set('sort', activeSort);
    urlParams.set('page', '1');
    
    setLocation(`/products?${urlParams.toString()}`);
  };
  
  const handleSortChange = (sort: string) => {
    setActiveSort(sort);
    
    // Update URL
    const urlParams = new URLSearchParams();
    if (activeCategory) urlParams.set('category', activeCategory);
    urlParams.set('sort', sort);
    urlParams.set('page', currentPage.toString());
    
    setLocation(`/products?${urlParams.toString()}`);
  };
  
  const handleViewChange = (view: 'grid' | 'list') => {
    setActiveView(view);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Update URL
    const urlParams = new URLSearchParams();
    if (activeCategory) urlParams.set('category', activeCategory);
    urlParams.set('sort', activeSort);
    urlParams.set('page', page.toString());
    
    setLocation(`/products?${urlParams.toString()}`);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero banner */}
        <div className="relative h-[30vh] overflow-hidden">
          <div className="absolute inset-0 hex-pattern circuit-lines opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-rich-black to-transparent"></div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
            <motion.h1 
              className="font-space font-bold text-3xl md:text-5xl mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Our <span className="text-electric-blue">Collection</span>
            </motion.h1>
            <motion.p 
              className="max-w-xl text-muted-gray"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover premium lighting fixtures that blend artistry with cutting-edge technology
            </motion.p>
          </div>
        </div>
        
        {/* Filter Bar */}
        <FilterBar 
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onViewChange={handleViewChange}
          activeCategory={activeCategory}
          activeSort={activeSort}
          activeView={activeView}
        />
        
        {/* Products Grid */}
        <div className="max-w-7xl mx-auto py-12 px-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-electric-blue" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-xl text-red-500">Error loading products</p>
              <p className="text-muted-gray mt-2">Please try again later</p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-white">No products found</p>
              <p className="text-muted-gray mt-2">Try changing your filters</p>
            </div>
          ) : (
            <>
              <motion.div 
                className={`grid ${
                  activeView === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
                    : 'grid-cols-1 gap-6'
                }`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {paginatedProducts.map((product) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductsPage;
