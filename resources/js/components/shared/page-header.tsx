import React from 'react'
import { Badge } from '../ui/badge'

export default function PageHeader({ title, count, icon, subtitle, children }: { title?: string, count?: number, icon?: any, subtitle?: string, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b w-full min-w-0 max-w-full">
            <div className="min-w-0 flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
                    {icon}
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight break-words">
                        {title}
                    </h1>
                    {count !== undefined && count !== null && (
                        <Badge variant="outline" className="ml-1 sm:ml-2 font-mono shrink-0">
                            {count}
                        </Badge>
                    )}
                </div>
                {subtitle && (
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1 break-words">
                        {subtitle}
                    </p>
                )}
            </div>

            {children && (
                <div className="w-full sm:w-auto shrink-0 min-w-0">
                    {children}
                </div>
            )}
        </div>
    );
}
