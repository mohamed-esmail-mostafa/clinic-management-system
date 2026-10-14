import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import useImport from '@/hooks/use-import';
import { CalendarCheck, Filter, Plus } from 'lucide-react';
import React from 'react'

export default function NoBooking({ stats, setSearchTerm, setStatusFilter, setTypeFilter, setDoctorFilter ,handleOpenAdd}: any) {
    const { t } = useImport()
    return (
        <Card className="border-dashed py-12 text-center bg-gray-50/50 dark:bg-gray-900/40">
            <CardContent className="flex flex-col items-center justify-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CalendarCheck className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {stats.total === 0
                        ? t('bookings.no_bookings_today')
                        : t('bookings.no_matching_bookings')}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                    {stats.total === 0
                        ? t('bookings.no_bookings_today_desc',)
                        : t('bookings.reset_filters_hint')}
                </p>
                {stats.total === 0 ? (
                    <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 mt-2">
                        <Plus className="h-4 w-4" />
                        <span>{t('bookings.schedule_today')}</span>
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setTypeFilter('all');
                            setDoctorFilter('all');
                        }}
                        className="gap-1.5 mt-2"
                    >
                        <Filter className="h-4 w-4" />
                        <span>{t('common.reset_filters')}</span>
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
