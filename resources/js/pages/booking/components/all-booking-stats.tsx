import { Card, CardContent } from '@/components/ui/card'
import useImport from '@/hooks/use-import'
import { Calendar, CalendarCheck, CheckCircle2, Clock } from 'lucide-react'
import React from 'react'

export default function AllBookingStats({ stats }: any) {
    const { t } = useImport()
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('bookings.total', 'Total Bookings')}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {stats.total}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('bookings.todays_bookings', "Today's Bookings")}
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                            {stats.todays}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                        <CalendarCheck className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('bookings.confirmed_count', 'Confirmed')}
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {stats.confirmed}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('bookings.pending_count', 'Pending')}
                        </p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                            {stats.pending}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
                        <Clock className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
