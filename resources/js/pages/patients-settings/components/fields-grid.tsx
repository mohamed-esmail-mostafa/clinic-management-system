import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import useImport from '@/hooks/use-import'
import { PatientFieldType } from '@/types'
import { AlignLeft, Calendar, CheckSquare, CircleDot, Hash, ListFilter, Pencil, Sliders, Trash2, Type } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function FieldsGrid({ filteredFields ,getTypeIcon,handleToggleStatus,getTypeLabel,setOptionsField,setEditingField ,setDeletingField}: any) {
    const { t } = useImport()
    

  
    return (

        <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
            <CardContent className="p-4 md:p-6">
                {filteredFields.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
                            <Sliders size={24} />
                        </div>

                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {t('patients_settings.no_fields_title', 'No Custom Fields Found')}
                        </h3>

                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            {t(
                                'patients_settings.no_fields_desc',
                                'Click the button above to add custom fields for patient registration.'
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredFields.map((field: any) => (
                            <Card
                                key={field.id}
                                className="group relative rounded-2xl border-gray-100 dark:border-gray-800 shadow-none hover:shadow-sm transition-all duration-200 bg-white dark:bg-gray-950"
                            >
                                <CardContent className="p-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                {getTypeIcon(field.type)}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                                        {field.label}
                                                    </h3>

                                                    <Badge
                                                        variant="outline"
                                                        className="shrink-0 rounded-md text-[10px] font-mono text-gray-400"
                                                    >
                                                        #{field.sort_order}
                                                    </Badge>
                                                </div>

                                                <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                                                    {field.name}
                                                </p>
                                            </div>
                                        </div>

                                        <Switch
                                            checked={field.is_active}
                                            onCheckedChange={() => handleToggleStatus(field)}
                                            className="shrink-0 data-[state=checked]:bg-primary"
                                        />
                                    </div>

                                    {/* Type & Required */}
                                    <div className="flex items-center gap-2 mt-4">
                                        <Badge
                                            variant="secondary"
                                            className="rounded-lg text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                                        >
                                            {getTypeLabel(field.type)}
                                        </Badge>

                                        {field.is_required ? (
                                            <Badge
                                                className="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 rounded-lg text-[11px] border border-rose-200 dark:border-rose-900"
                                            >
                                                {t('patients_settings.required', 'Required')}
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="text-gray-400 rounded-lg text-[11px]"
                                            >
                                                {t('patients_settings.optional', 'Optional')}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Options */}
                                    {field.options && field.options.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[11px] font-medium text-gray-400">
                                                    {t('patients_settings.col_options', 'Options')}
                                                </span>

                                                <span className="text-[10px] text-gray-400">
                                                    {field.options.length}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {field.options.slice(0, 4).map((opt:any) => (
                                                    <Badge
                                                        key={opt.id || opt.label}
                                                        variant="secondary"
                                                        className="text-[11px] rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                    >
                                                        {opt.label}
                                                    </Badge>
                                                ))}

                                                {field.options.length > 4 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[11px] rounded-lg text-gray-400"
                                                    >
                                                        +{field.options.length - 4}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer Actions */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-[11px] text-gray-400">
                                            {field.is_active
                                                ? t('patients_settings.active', 'Active')
                                                : t('patients_settings.inactive', 'Inactive')}
                                        </span>

                                        <div className="flex items-center gap-1">
                                            {['select', 'radio', 'checkbox'].includes(field.type) && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setOptionsField(field)}
                                                    className="h-8 w-8 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 cursor-pointer"
                                                    title={t(
                                                        'patients_settings.manage_options',
                                                        'Manage Options'
                                                    )}
                                                >
                                                    <ListFilter size={15} />
                                                </Button>
                                            )}

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingField(field)}
                                                className="h-8 w-8 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 cursor-pointer"
                                                title={t('patients_settings.edit', 'Edit')}
                                            >
                                                <Pencil size={15} />
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeletingField(field)}
                                                className="h-8 w-8 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                                title={t('patients_settings.delete', 'Delete')}
                                            >
                                                <Trash2 size={15} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>


    )
}
