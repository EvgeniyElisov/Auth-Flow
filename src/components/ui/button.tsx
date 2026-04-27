import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', type = 'button', ...props }, ref) => (
        <button
            ref={ref}
            type={type}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                variant === 'default' && 'bg-blue-600 px-4 py-2 text-white hover:bg-blue-700',
                variant === 'outline' &&
                    'border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
                className
            )}
            {...props}
        />
    )
)
Button.displayName = 'Button'
