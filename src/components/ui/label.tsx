import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            className={cn('text-sm font-medium leading-none text-gray-900 dark:text-zinc-100', className)}
            {...props}
        />
    )
}
