import useImport from '@/hooks/use-import'
import { CheckCircle2 } from 'lucide-react'
import React from 'react'

export default function BookingProgressBar({ stats }: any) {
    const { t } = useImport();
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border shadow-xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    {t('bookings.completion_progress', "Today's Clinic Progress")}
                </span>
                <span className="font-mono text-muted-foreground">
                    {stats.completed} / {stats.total} ({stats.completionRate}%)
                </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div
                    className="bg-linear-to-r from-emerald-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${stats.completionRate}%` }}
                />
            </div>
        </div>
    )
}
