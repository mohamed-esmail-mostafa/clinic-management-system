import { Card, CardContent } from '@/components/ui/card'
import useImport from '@/hooks/use-import'
import { Stethoscope,Activity, CheckCircle2, Calendar } from 'lucide-react';
import React from 'react'

export default function VisitsStats({stats}:any) {
    const {t}=useImport();
  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('visits.total', 'Total Visits')}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('visits.examinations', 'Examinations')}
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                    {stats.examinations}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                                <Activity className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('visits.follow_ups', 'Follow-ups')}
                                </p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                    {stats.followUps}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('visits.last_visit', 'Latest Visit')}
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.lastVisitDate ? new Date(stats.lastVisitDate).toLocaleDateString() : '-'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
  )
}
