import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import HeroSection from '@/components/hero-section';
import ProductCard from '@/components/ui/product-card';
import TryBeforeYouBuy from '@/components/try-before-you-buy';
import { Link } from 'wouter';
import NeoButton from '@/components/ui/neo-button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RTLTransitionWrapper from '@/components/rtl-transition-wrapper';

const HomePage = () => {
  const { t } = useTranslation();
  
  // Fetch featured products
  const { data: featuredProducts, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { featured: true }],
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Featured Products Section */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <motion.h2 
                className="font-space font-bold text-2xl md:text-3xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {t('homepage.featured_collection', 'Featured Collection')}
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Link href="/products">
                  <a className="text-electric-blue hover:text-glowing-cyan text-sm font-medium flex items-center transition-colors">
                    {t('homepage.view_all_products', 'View All Products')}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Link>
              </motion.div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="h-96 rounded-xl bg-dark-gray animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts?.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        <TryBeforeYouBuy />
        
        {/* Features Grid */}
        <section className="py-16 px-6 bg-gradient-to-b from-rich-black to-dark-gray">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-space font-bold text-3xl md:text-4xl mb-4">
                {t('homepage.why_choose_lux', 'Why Choose')} <span className="text-electric-blue">LUX</span>
              </h2>
              <p className="max-w-2xl mx-auto text-muted-gray">
                {t('homepage.experience_blend', 'Experience the perfect blend of artistry, technology, and luxury in every one of our furniture pieces.')}
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div 
                className="p-6 rounded-xl bg-dark-gray bg-opacity-50 border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-12 h-12 mb-4 rounded-lg bg-electric-blue bg-opacity-10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-space font-semibold text-xl text-white mb-2">{t('homepage.premium_quality', 'Premium Quality')}</h3>
                <p className="text-muted-gray">{t('homepage.premium_desc', 'Handcrafted furniture using premium materials that stand the test of time.')}</p>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl bg-dark-gray bg-opacity-50 border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-12 h-12 mb-4 rounded-lg bg-vivid-purple bg-opacity-10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-vivid-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-space font-semibold text-xl text-white mb-2">{t('homepage.smart_features', 'Smart Features')}</h3>
                <p className="text-muted-gray">{t('homepage.smart_desc', 'App-enabled furniture with voice controls, comfort settings, and customizable options.')}</p>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl bg-dark-gray bg-opacity-50 border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-12 h-12 mb-4 rounded-lg bg-neon-pink bg-opacity-10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-neon-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-space font-semibold text-xl text-white mb-2">{t('homepage.ar_technology', 'AR Technology')}</h3>
                <p className="text-muted-gray">{t('homepage.ar_desc', 'Preview furniture in your space with our advanced augmented reality tool.')}</p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
