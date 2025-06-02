import React from 'react';
import { motion } from 'framer-motion';
import { useClickSound, useHoverSound } from '@hooks/useAudio';
import clsx from 'clsx';

/**
 * TechFlixButton - Unified button component for consistent styling
 * 
 * @param {Object} props
 * @param {string} props.variant - 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props...rest - Other props passed to button element
 */
const TechFlixButton = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  className,
  type = 'button',
  ...rest
}, ref) => {
  const withClickSound = useClickSound();
  const hoverProps = useHoverSound();

  // Base styles that apply to all buttons
  const baseStyles = clsx(
    'inline-flex items-center justify-center',
    'font-semibold rounded transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'select-none',
    {
      // Size variants
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
      // Full width
      'w-full': fullWidth,
    }
  );

  // Variant-specific styles
  const variantStyles = {
    primary: clsx(
      'bg-netflix-red text-white',
      'hover:bg-red-700 active:bg-red-800',
      'focus-visible:ring-netflix-red',
      'shadow-sm hover:shadow-md'
    ),
    secondary: clsx(
      'bg-zinc-800 text-white',
      'hover:bg-zinc-700 active:bg-zinc-900',
      'focus-visible:ring-zinc-500',
      'border border-zinc-700'
    ),
    ghost: clsx(
      'bg-transparent text-white',
      'hover:bg-white/10 active:bg-white/20',
      'focus-visible:ring-white/50',
      'border border-white/20 hover:border-white/30'
    ),
    danger: clsx(
      'bg-red-900 text-white',
      'hover:bg-red-800 active:bg-red-950',
      'focus-visible:ring-red-500'
    )
  };

  const handleClick = (e) => {
    if (!disabled && !loading) {
      withClickSound()();
      if (onClick) onClick(e);
    }
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...hoverProps}
      {...rest}
    >
      {/* Loading spinner */}
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left icon */}
      {leftIcon && !loading && (
        <span className="mr-2 flex items-center">{leftIcon}</span>
      )}

      {/* Button text */}
      <span>{children}</span>

      {/* Right icon */}
      {rightIcon && !loading && (
        <span className="ml-2 flex items-center">{rightIcon}</span>
      )}
    </motion.button>
  );
});

TechFlixButton.displayName = 'TechFlixButton';

// Export button variants for consistency
export const ButtonVariants = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
  DANGER: 'danger'
};

export const ButtonSizes = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg'
};

export default TechFlixButton;