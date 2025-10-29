// src/components/ui/label.jsx

import React from 'react';

/**
 * Basic label component styled with Tailwind.
 */
export const Label = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <label
            ref={ref}
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block ${className}`}
            {...props}
        >
            {children}
        </label>
    );
});

Label.displayName = "Label";