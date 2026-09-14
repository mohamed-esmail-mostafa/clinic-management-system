import { Card, CardContent } from '@/components/ui/card'
import useImport from '@/hooks/use-import'
import { CheckCircle2, Sliders, Users, XCircle } from 'lucide-react'
import React from 'react'

export default function PatientStats({ stats }: any) {
    const { t } = useImport()
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('patients.total', 'Total Patients')}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {stats.total}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('patients.active_count', 'Active Patients')}
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {stats.active}
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
                            {t('patients.inactive_count', 'Inactive Patients')}
                        </p>
                        <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
                            {stats.inactive}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                        <XCircle className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            {/* <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('patients.custom_fields_count', 'Clinic Custom Fields')}
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                    {stats.customFieldsCount}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                                <Sliders className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card> */}
        </div>
    )
}
