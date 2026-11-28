import { Check, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import useImport from '@/hooks/use-import';
import { Specialty } from '@/types/specialty';

interface ClinicSpecialtiesCardProps {
    specialties: Specialty[];
    selectedIds: number[];
    onToggle: (specialtyId: number) => void;
}

export default function ClinicSpecialtiesCard({
    specialties,
    selectedIds,
    onToggle,
}: ClinicSpecialtiesCardProps) {
    const { isRtl, tClinic } = useImport();

    return (
        <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <Stethoscope size={16} />
                        </span>
                        <span>{tClinic('specialties')}</span>
                    </h2>

                    {selectedIds.length > 0 && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                            {selectedIds.length} {tClinic('selected')}
                        </span>
                    )}
                </div>

                {specialties.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                        {specialties.map((s) => {
                            const isSelected = selectedIds.includes(s.id);
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => onToggle(s.id)}
                                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-medium transition-all cursor-pointer ${
                                        isSelected
                                            ? 'border-primary bg-orange-50/70 dark:bg-orange-950/30 text-primary dark:text-orange-300 font-semibold shadow-2xs'
                                            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                                    }`}
                                >
                                    <span className="truncate">
                                        {isRtl ? s.name_ar : s.name_en}
                                    </span>
                                    {isSelected && (
                                        <Check
                                            size={14}
                                            className="text-primary shrink-0"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 py-2">
                        {tClinic('no_specialties')}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
