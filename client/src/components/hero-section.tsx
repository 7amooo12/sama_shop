import { motion } from 'framer-motion';
import { Link } from 'wouter';
import NeoButton from '@/components/ui/neo-button';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };
  
  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Background with pattern and blur */}
      <div className="absolute inset-0 hex-pattern circuit-lines opacity-20"></div>
      
      {/* Hero content */}
      <motion.div 
        className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="font-space font-bold text-4xl md:text-6xl lg:text-7xl mb-4 leading-tight"
          variants={itemVariants}
        >
          <span className="block">Illuminate Your Space</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue via-glowing-cyan to-soft-violet">
            With Modern Design
          </span>
        </motion.h1>
        
        <motion.p 
          className="max-w-2xl mx-auto text-lg md:text-xl text-muted-gray mb-8"
          variants={itemVariants}
        >
          Discover our collection of premium chandeliers and lighting fixtures that blend artistry with cutting-edge technology.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          variants={itemVariants}
        >
          <Link href="/products">
            <a className="px-8 py-3 font-syncopate text-sm font-semibold uppercase tracking-wide bg-gradient-to-r from-electric-blue to-vivid-purple rounded-lg hover:opacity-90 transition duration-300 text-white">
              Explore Collection
            </a>
          </Link>
          <Link href="/ar-experience">
            <a className="px-8 py-3 font-syncopate text-sm font-semibold uppercase tracking-wide neo-button border border-electric-blue rounded-lg hover:opacity-90 transition duration-300 text-white">
              Try With AR
            </a>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Animated glowing particles at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-rich-black to-transparent"></div>
    </section>
  );
};

export default HeroSection;
