import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useImport from "@/hooks/use-import";
import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ListFilter, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCreateUpdate from "../hooks/use-custom-patient-fields";

export default function CustomFieldsDialog({ 
    field_types, 
    fields , 
    isAddModalOpen,
    setIsAddModalOpen,
    formik
}: any) {
    const { t } = useImport()
    const {  editingField, setEditingField, availableFieldTypes, addOptionRow, getTypeIcon, hasOptions, removeOptionRow } = useCreateUpdate({ field_types, fields })
    return (
        <Dialog
            open={isAddModalOpen || editingField !== null}
            onOpenChange={(open) => {
                if (!open) {
                    setIsAddModalOpen(false);
                    setEditingField(null);
                    formik.resetForm();
                }
            }}
        >

            <DialogContent className="sm:max-w-lg rounded-2xl">

                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">
                        {editingField
                            ? t('patients_settings.edit_field_title', 'Edit Patient Field')
                            : t('patients_settings.add_field_title', 'Add New Patient Field')}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        {t(
                            'patients_settings.modal_subtitle',
                            'Configure the label, type, requirement status, and options for this field.'
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
                    {/* Field Label */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium flex items-center gap-1">
                            <span>{t('patients_settings.field_label', 'Field Label')}</span>
                            <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            name="label"
                            value={formik.values.label}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder={t('patients_settings.label_placeholder', 'e.g. Blood Type, Allergies')}
                            className="h-10 rounded-xl"
                        />
                        {formik.touched.label && formik.errors.label && (
                            <InputError message={formik.errors.label} />
                        )}
                    </div>

                    {/* System Name / Key */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            <span>{t('patients_settings.field_name_key', 'System Name / Key (Optional)')}</span>
                        </Label>
                        <Input
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder={t('patients_settings.name_placeholder', 'e.g. blood_type')}
                            className="h-10 rounded-xl font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            {t(
                                'patients_settings.name_hint',
                                'Auto-generated from label if left empty.'
                            )}
                        </p>
                    </div>

                    {/* Field Type & Sort Order */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                <span>{t('patients_settings.field_type', 'Field Type')}</span>
                                <span className="text-rose-500">*</span>
                            </Label>
                            <Select
                                value={formik.values.type}
                                onValueChange={(val) => formik.setFieldValue('type', val)}
                            >
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue placeholder={t('patients_settings.select_type', 'Select field type')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {availableFieldTypes.map((typeOption: any) => (
                                        <SelectItem key={typeOption.value} value={typeOption.value}>
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(typeOption.value)}
                                                <span>{typeOption.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                <span>{t('patients_settings.sort_order', 'Sort Order')}</span>
                            </Label>
                            <Input
                                type="number"
                                name="sort_order"
                                value={formik.values.sort_order}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="h-10 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Switches: Required & Active */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium cursor-pointer" htmlFor="is_required">
                                {t('patients_settings.is_required', 'Required Field')}
                            </Label>
                            <Switch
                                id="is_required"
                                checked={formik.values.is_required}
                                onCheckedChange={(val) => formik.setFieldValue('is_required', val)}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium cursor-pointer" htmlFor="is_active">
                                {t('patients_settings.is_active', 'Active Status')}
                            </Label>
                            <Switch
                                id="is_active"
                                checked={formik.values.is_active}
                                onCheckedChange={(val) => formik.setFieldValue('is_active', val)}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </div>

                    {/* Options builder for select, radio, checkbox */}
                    {hasOptions && (
                        <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold flex items-center gap-1.5">
                                    <ListFilter size={14} className="text-primary" />
                                    <span>{t('patients_settings.options_label', 'Field Options')}</span>
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addOptionRow}
                                    className="h-8 rounded-lg gap-1 text-xs text-primary border-primary/20 hover:bg-primary/10 cursor-pointer"
                                >
                                    <Plus size={14} />
                                    <span>{t('patients_settings.add_option', 'Add Option')}</span>
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto pe-1">
                                {formik.values.options.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic text-center py-2">
                                        {t('patients_settings.no_options_yet', 'No options added yet. Click "Add Option" to create choices.')}
                                    </p>
                                ) : (
                                    formik.values.options.map((opt: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Input
                                                placeholder={t('patients_settings.option_label_ph', 'Option Label (e.g. O+)')}
                                                value={opt.label}
                                                onChange={(e) => {
                                                    const newOpts = [...formik.values.options];
                                                    newOpts[idx].label = e.target.value;
                                                    if (!newOpts[idx].value) {
                                                        newOpts[idx].value = e.target.value.toLowerCase().replace(/\s+/g, '_');
                                                    }
                                                    formik.setFieldValue('options', newOpts);
                                                }}
                                                className="h-9 text-xs rounded-xl flex-1"
                                            />
                                            <Input
                                                placeholder={t('patients_settings.option_val_ph', 'Value')}
                                                value={opt.value}
                                                onChange={(e) => {
                                                    const newOpts = [...formik.values.options];
                                                    newOpts[idx].value = e.target.value;
                                                    formik.setFieldValue('options', newOpts);
                                                }}
                                                className="h-9 text-xs rounded-xl flex-1 font-mono"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOptionRow(idx)}
                                                className="h-9 w-9 text-gray-400 hover:text-rose-500 rounded-xl shrink-0 cursor-pointer"
                                            >
                                                <X size={15} />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setIsAddModalOpen(false);
                                setEditingField(null);
                                formik.resetForm();
                            }}
                            className="rounded-xl h-10 px-4 cursor-pointer"
                        >
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={formik.isSubmitting}
                            
                        >
                            {formik.isSubmitting
                                ? t('common.saving', 'Saving...')
                                : editingField
                                    ? t('patients_settings.save_changes', 'Save Changes')
                                    : t('patients_settings.create_field', 'Create Field')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
