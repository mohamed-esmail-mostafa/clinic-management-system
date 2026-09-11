import React from 'react'
import { Badge } from '../ui/badge'

export default function PageHeader({ title, count, icon, subtitle, children }: { title?: string, count?: number, icon?: any, subtitle?: string, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
                <div className="flex items-center gap-2">
                    {icon}
                    <h1 className="text-2xl font-bold tracking-tight">
                        {title}
                    </h1>
                    <Badge variant="outline" className="ml-2 font-mono">
                        {count}
                    </Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                    {subtitle}
                </p>
            </div>

            {children}
        </div>
    )
}
