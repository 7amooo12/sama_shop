import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronDown, Grid, List } from 'lucide-react';
import NeoButton from '@/components/ui/neo-button';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'All Products', value: '' },
  { name: 'Modern', value: 'Modern' },
  { name: 'Crystal', value: 'Crystal' },
  { name: 'Smart Lighting', value: 'Smart Lighting' },
  { name: 'Pendants', value: 'Pendants' },
  { name: 'Chandeliers', value: 'Chandeliers' }
];

const sortOptions = [
  { name: 'Newest', value: 'newest' },
  { name: 'Price: Low to High', value: 'price_asc' },
  { name: 'Price: High to Low', value: 'price_desc' },
  { name: 'Most Popular', value: 'popular' }
];

interface FilterBarProps {
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  activeCategory: string;
  activeSort: string;
  activeView: 'grid' | 'list';
}

const FilterBar = ({ 
  onCategoryChange, 
  onSortChange, 
  onViewChange, 
  activeCategory, 
  activeSort, 
  activeView 
}: FilterBarProps) => {
  const [pathname, setPathname] = useLocation();
  
  return (
    <div className="sticky top-[72px] z-30 bg-dark-gray bg-opacity-80 backdrop-blur-md border-t border-b border-gray-800">
      <div className="max-w-7xl mx-auto py-4 px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <motion.button
                key={category.value}
                className={cn(
                  "whitespace-nowrap text-sm px-4 py-2 rounded-lg transition",
                  activeCategory === category.value 
                    ? "bg-vivid-purple bg-opacity-20 border border-vivid-purple text-white" 
                    : "neo-button text-muted-gray hover:text-white"
                )}
                onClick={() => onCategoryChange(category.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-muted-gray mr-2">Sort by:</span>
              <select 
                className="bg-dark-gray text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-electric-blue"
                onChange={(e) => onSortChange(e.target.value)}
                value={activeSort}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              <NeoButton
                size="icon"
                onClick={() => onViewChange('grid')}
                className={activeView === 'grid' ? 'text-white' : 'text-muted-gray'}
              >
                <Grid size={18} />
              </NeoButton>
              <NeoButton
                size="icon"
                onClick={() => onViewChange('list')}
                className={activeView === 'list' ? 'text-white' : 'text-muted-gray'}
              >
                <List size={18} />
              </NeoButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
