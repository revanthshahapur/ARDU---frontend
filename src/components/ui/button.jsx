// src/components/ui/button.jsx

import React from 'react';

/**
 * Basic button component styled with Tailwind.
 * @param {object} props - Component props.
 * @param {string} props.className - Additional Tailwind classes.
 * @param {boolean} props.disabled - Disable state.
 * @param {string} props.variant - Defines the button style (e.g., 'default', 'outline').
 */
export const Button = React.forwardRef(({ className = '', variant = 'default', disabled = false, children, ...props }, ref) => {
    
    // Define base and variant styles
    let baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2";
    
    let variantStyles = '';
    
    if (variant === 'default') {
        variantStyles = 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500';
    } else if (variant === 'outline') {
        variantStyles = 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-400';
    } 
    // Add more variants (e.g., destructive, ghost) as needed

    const allClasses = `${baseStyles} ${variantStyles} ${className}`;

    return (
        <button
            className={allClasses}
            disabled={disabled}
            ref={ref}
            {...props}
        >
            {/* Simple loading indicator if disabled */}
            {disabled && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
});

Button.displayName = "Button";