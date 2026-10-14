import { Card, CardContent } from '@/components/ui/card'
import useImport from '@/hooks/use-import'
import { Calendar, CheckCircle2, Clock, UserCheck } from 'lucide-react'
import React from 'react'

export default function BookingStats({statusFilter,setStatusFilter,stats}:any) {
  const {t}=useImport()
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    {/* Total Today */}
                    <Card
                        className={`cursor-pointer transition-all border-l-4 border-l-primary hover:shadow-md ${
                            statusFilter === 'all' ? 'ring-2 ring-primary/40' : ''
                        }`}
                        onClick={() => setStatusFilter('all')}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('bookings.todays_total')}
                                </p>
                                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                                    {stats.total}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {t('bookings.scheduled')}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Queue */}
                    <Card
                        className={`cursor-pointer transition-all border-l-4 border-l-amber-500 hover:shadow-md ${
                            statusFilter === 'pending' ? 'ring-2 ring-amber-500/50' : ''
                        }`}
                        onClick={() => setStatusFilter('pending')}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                                        {t('bookings.status_pending', 'Pending')}
                                    </p>
                                    {stats.pending > 0 && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-2xl font-bold mt-1 text-amber-900 dark:text-amber-300">
                                    {stats.pending}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {t('bookings.awaiting_arrival', 'Awaiting arrival')}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Clock className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Confirmed / Ready */}
                    <Card
                        className={`cursor-pointer transition-all border-l-4 border-l-emerald-500 hover:shadow-md ${
                            statusFilter === 'confirmed' ? 'ring-2 ring-emerald-500/50' : ''
                        }`}
                        onClick={() => setStatusFilter('confirmed')}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
                                    {t('bookings.status_confirmed', 'Confirmed')}
                                </p>
                                <p className="text-2xl font-bold mt-1 text-emerald-900 dark:text-emerald-300">
                                    {stats.confirmed}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {t('bookings.in_waiting_room', 'In clinic / ready')}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <UserCheck className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completed Bookings */}
                    <Card
                        className={`cursor-pointer transition-all border-l-4 border-l-blue-500 hover:shadow-md ${
                            statusFilter === 'completed' ? 'ring-2 ring-blue-500/50' : ''
                        }`}
                        onClick={() => setStatusFilter('completed')}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-800 dark:text-blue-400">
                                    {t('bookings.status_completed', 'Completed')}
                                </p>
                                <p className="text-2xl font-bold mt-1 text-blue-900 dark:text-blue-300">
                                    {stats.completed}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {t('bookings.finished_visits', 'Visits finished')}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
  )
}
