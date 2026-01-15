import type React from 'react';

import { cn } from '@/lib/utils';

import { HTMLMotionProps, motion } from 'framer-motion';

type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'danger'
    | 'success'
    | 'warning'
    | 'ghost'
    | 'outline';

interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<'button'>>,
        HTMLMotionProps<'button'> {
    variant?: ButtonVariant;
    isLoading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary/30 shadow-lg shadow-secondary/20',
    secondary: 'bg-white/10 hover:bg-white/15 focus:ring-white/20 text-white border border-white/10',
    tertiary: 'bg-white/5 hover:bg-white/10 text-white/70 focus:ring-white/10 border border-white/5',
    danger: 'bg-red-500/90 hover:bg-red-600 focus:ring-red-500/30 text-white shadow-lg shadow-red-500/20',
    success: 'bg-emerald-500/90 hover:bg-emerald-600 focus:ring-emerald-500/30 text-white shadow-lg shadow-emerald-500/20',
    warning: 'bg-amber-500/90 hover:bg-amber-600 focus:ring-amber-400/30 text-white shadow-lg shadow-amber-500/20',
    ghost: 'bg-transparent hover:bg-white/5 focus:ring-white/10 text-white/70 hover:text-white',
    outline:
        'bg-transparent border border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary focus:ring-secondary/30',
};

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    loadingText = 'Chargement...',
    disabled,
    className = '',
    ...props
}) => {
    const baseStyle =
        'group relative w-auto flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
    const disabledStyle = 'opacity-50 cursor-not-allowed';

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={disabled || isLoading}
            className={cn(
                baseStyle,
                variantStyles[variant],
                (disabled || isLoading) && disabledStyle,
                className
            )}
            {...props}
        >
            {isLoading && (
                <svg
                    className="-ml-1 mr-3 h-5 w-5 animate-spin"
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
            {isLoading ? loadingText : children}
        </motion.button>
    );
};
