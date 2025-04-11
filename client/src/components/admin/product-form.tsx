import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product, insertProductSchema } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import NeoButton from '@/components/ui/neo-button';
import { Loader2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Extend the insertProductSchema with custom validation
const formSchema = insertProductSchema.extend({
  price: z.coerce.number().min(0, "Price must be positive"),
  salePrice: z.coerce.number().min(0, "Sale price must be positive").optional(),
  rating: z.coerce.number().min(0, "Rating must be positive").max(5, "Rating must be max 5").default(0),
  ratingCount: z.coerce.number().min(0, "Rating count must be positive").default(0),
  // Optional fields allow empty string which we will handle later
  tags: z.string().optional(),
  features: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
}

const categories = [
  "Modern",
  "Crystal",
  "Smart Lighting",
  "Pendants",
  "Chandeliers"
];

const ProductForm = ({ initialData, onSubmit, isLoading = false }: ProductFormProps) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [features, setFeatures] = useState<Record<string, string>>(
    initialData?.features ? initialData.features as Record<string, string> : {}
  );
  const [featureKey, setFeatureKey] = useState('');
  const [featureValue, setFeatureValue] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      price: 0,
      salePrice: undefined,
      category: 'Chandeliers',
      imageUrl: '',
      isFeatured: false,
      inStock: true,
      rating: 0,
      ratingCount: 0,
      tags: '',
      features: ''
    }
  });

  const hasSalePrice = watch('salePrice') !== undefined && watch('salePrice') !== 0;
  
  // Handle form submission
  const handleFormSubmit = (data: FormValues) => {
    // Convert tags and features back to expected format
    const formattedData = {
      ...data,
      // Only include salePrice if it's defined and greater than 0
      salePrice: hasSalePrice ? data.salePrice : undefined,
      // Convert tags array to JSON string
      tags: JSON.stringify(tags),
      // Convert features object to JSON string
      features: JSON.stringify(features)
    };
    
    onSubmit(formattedData);
  };
  
  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle feature input
  const handleAddFeature = () => {
    if (featureKey.trim() && featureValue.trim()) {
      setFeatures({
        ...features,
        [featureKey.trim()]: featureValue.trim()
      });
      setFeatureKey('');
      setFeatureValue('');
    }
  };

  const handleRemoveFeature = (key: string) => {
    const newFeatures = { ...features };
    delete newFeatures[key];
    setFeatures(newFeatures);
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Product Name</Label>
          <Input 
            id="name" 
            {...register('name')} 
            placeholder="Enter product name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>
        
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-white">Category</Label>
          <select 
            id="category" 
            {...register('category')} 
            className="w-full h-10 px-3 rounded-md bg-dark-gray text-white border border-gray-700 focus:border-electric-blue focus:outline-none focus:ring-1 focus:ring-electric-blue"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>
        
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-white">Price ($)</Label>
          <Input 
            id="price" 
            type="number" 
            step="0.01" 
            min="0"
            {...register('price')} 
            placeholder="99.99"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>
        
        {/* Sale Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="salePrice" className="text-white">Sale Price ($)</Label>
            <div className="flex items-center space-x-2">
              <Label htmlFor="hasSalePrice" className="text-sm text-muted-gray">Enable</Label>
              <Switch 
                id="hasSalePrice" 
                checked={hasSalePrice}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setValue('salePrice', initialData?.salePrice || 0);
                  } else {
                    setValue('salePrice', undefined);
                  }
                }}
              />
            </div>
          </div>
          <Input 
            id="salePrice" 
            type="number" 
            step="0.01"
            min="0"
            disabled={!hasSalePrice}
            {...register('salePrice')} 
            placeholder="79.99"
            className={errors.salePrice ? "border-red-500" : ""}
          />
          {errors.salePrice && (
            <p className="text-red-500 text-sm">{errors.salePrice.message}</p>
          )}
        </div>
        
        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-white">Image URL</Label>
          <Input 
            id="imageUrl" 
            {...register('imageUrl')} 
            placeholder="https://example.com/image.jpg"
            className={errors.imageUrl ? "border-red-500" : ""}
          />
          {errors.imageUrl && (
            <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>
          )}
        </div>
        
        {/* Toggles */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch 
              id="inStock" 
              {...register('inStock')} 
              defaultChecked={initialData?.inStock ?? true} 
            />
            <Label htmlFor="inStock" className="text-white">In Stock</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="isFeatured" 
              {...register('isFeatured')} 
              defaultChecked={initialData?.isFeatured ?? false}
            />
            <Label htmlFor="isFeatured" className="text-white">Featured Product</Label>
          </div>
        </div>
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Description</Label>
        <Textarea 
          id="description" 
          {...register('description')} 
          placeholder="Enter product description"
          className={`min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>
      
      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-white">Tags</Label>
        <div className="flex space-x-2">
          <Input 
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <NeoButton 
            type="button" 
            onClick={handleAddTag}
            className="text-white" 
            aria-label="Add tag"
          >
            <Plus size={16} />
          </NeoButton>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <AnimatePresence>
            {tags.map(tag => (
              <motion.div 
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center px-3 py-1 bg-gray-800 rounded-full text-sm text-white"
              >
                {tag}
                <button 
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-muted-gray hover:text-white"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Features */}
      <div className="space-y-2">
        <Label className="text-white">Features</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input 
            value={featureKey}
            onChange={(e) => setFeatureKey(e.target.value)}
            placeholder="Feature name (e.g. Material)"
          />
          <div className="flex space-x-2">
            <Input 
              value={featureValue}
              onChange={(e) => setFeatureValue(e.target.value)}
              placeholder="Value (e.g. Crystal)"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
            />
            <NeoButton 
              type="button" 
              onClick={handleAddFeature}
              className="text-white" 
              aria-label="Add feature"
            >
              <Plus size={16} />
            </NeoButton>
          </div>
        </div>
        
        <div className="mt-2 grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {Object.entries(features).map(([key, value]) => (
              <motion.div 
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg text-sm"
              >
                <div>
                  <span className="text-white font-medium">{key}:</span>
                  <span className="text-muted-gray ml-2">{value}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => handleRemoveFeature(key)}
                  className="text-muted-gray hover:text-white"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <NeoButton 
          type="submit" 
          disabled={isLoading}
          className="min-w-[120px] bg-gradient-to-r from-electric-blue to-vivid-purple text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {initialData ? 'Update Product' : 'Create Product'}
        </NeoButton>
      </div>
    </form>
  );
};

export default ProductForm;