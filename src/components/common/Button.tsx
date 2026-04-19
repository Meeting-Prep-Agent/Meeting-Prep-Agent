import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  loading, 
  children, 
  className, 
  disabled,
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary hover:opacity-90 text-primary-foreground shadow-sm',
    secondary: 'bg-secondary hover:bg-muted text-foreground border border-border',
    ghost: 'bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground',
    destructive: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      disabled={disabled || loading}
      className={cn(
        "relative flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-primary/20",
        variants[variant],
        className
      )}
      {...(props as any)}
    >
      <span className={cn("flex items-center space-x-2", loading && "opacity-0 invisible")}>
        {children}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        </div>
      )}
    </motion.button>
  );
};
