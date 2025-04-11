import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'amber' | 'red';
  trend?: {
    value: number; // Percentage change
    label: string; // e.g. "vs last month"
  };
}

const StatCard = ({ title, value, icon: Icon, color, trend }: StatCardProps) => {
  const colorStyles = {
    blue: {
      iconBg: 'bg-electric-blue bg-opacity-20',
      iconColor: 'text-electric-blue',
      trendUp: 'text-green-400',
      trendDown: 'text-red-400'
    },
    purple: {
      iconBg: 'bg-vivid-purple bg-opacity-20',
      iconColor: 'text-vivid-purple',
      trendUp: 'text-green-400',
      trendDown: 'text-red-400'
    },
    green: {
      iconBg: 'bg-green-500 bg-opacity-20',
      iconColor: 'text-green-400',
      trendUp: 'text-green-400',
      trendDown: 'text-red-400'
    },
    amber: {
      iconBg: 'bg-amber-500 bg-opacity-20',
      iconColor: 'text-amber-400',
      trendUp: 'text-green-400',
      trendDown: 'text-red-400'
    },
    red: {
      iconBg: 'bg-red-500 bg-opacity-20',
      iconColor: 'text-red-400',
      trendUp: 'text-green-400',
      trendDown: 'text-red-400'
    }
  };
  
  const styles = colorStyles[color];
  
  return (
    <motion.div 
      className="bg-dark-gray rounded-xl p-6 backdrop-blur-sm relative overflow-hidden border border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background grid pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 hex-pattern"></div>
      
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-muted-gray font-medium text-sm">{title}</h3>
          <p className="text-white text-2xl font-semibold mt-1">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-1">
              <span 
                className={cn(
                  "text-xs font-medium",
                  trend.value >= 0 ? styles.trendUp : styles.trendDown
                )}
              >
                {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-gray ml-1">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        
        <div className={cn("p-3 rounded-lg self-start", styles.iconBg)}>
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;