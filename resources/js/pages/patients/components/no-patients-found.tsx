import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import useImport from '@/hooks/use-import';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
export default function NoPatientsFound({ searchTerm, genderFilter, statusFilter, setSearchTerm, setGenderFilter, setStatusFilter, clinicSlug }: any) {
    const { t } = useImport()
    return (
        <Card className="border-gray-200 dark:border-gray-800 shadow-xs text-center py-16">
            <CardContent>
                <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {t('patients.no_patients', 'No patients found')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                    {searchTerm || genderFilter !== 'all' || statusFilter !== 'all'
                        ? t('patients.no_matching_patients', 'No patients match your search criteria. Try clearing the filters.')
                        : t('patients.no_patients_desc', 'Start by adding your clinic\'s first patient record.')}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                    {(searchTerm || genderFilter !== 'all' || statusFilter !== 'all') ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearchTerm('');
                                setGenderFilter('all');
                                setStatusFilter('all');
                            }}
                        >
                            {t('common.clear_filters', 'Clear Filters')}
                        </Button>
                    ) : (
                        <Link href={`/clinic/${clinicSlug}/patients/create`}>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t('patients.add_new', 'Add New Patient')}
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
