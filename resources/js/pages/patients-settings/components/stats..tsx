import { Card, CardContent } from '@/components/ui/card'
import useImport from '@/hooks/use-import'
import { AlertCircle, CheckCircle2, Layers, ListFilter } from 'lucide-react'
import React from 'react'

export default function Stats({ fields, activeCount, requiredCount, optionsCount }: any) {
    const { t } = useImport()
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Layers size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {t('patients_settings.stat_total_fields', 'Total Fields')}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {fields.length}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {t('patients_settings.stat_active_fields', 'Active Fields')}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {activeCount}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {t('patients_settings.stat_required_fields', 'Required Fields')}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {requiredCount}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <ListFilter size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {t('patients_settings.stat_choice_fields', 'Fields with Options')}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {optionsCount}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
