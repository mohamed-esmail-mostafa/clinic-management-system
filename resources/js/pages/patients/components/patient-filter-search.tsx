import { Card, CardContent } from '@/components/ui/card'
import useImport from '@/hooks/use-import'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function PatientFilterSearch({ searchTerm, setSearchTerm, genderFilter, setGenderFilter, statusFilter, setStatusFilter }: any) {
    const { t, isRtl } = useImport()
    return (
        <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
            <CardContent className="p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                    <Input
                        placeholder={t('patients.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={isRtl ? 'pr-9' : 'pl-9'}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:w-auto">
                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder={t('patients.gender', 'Gender')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('patients.all_genders', 'All Genders')}</SelectItem>
                            <SelectItem value="male">{t('patients.male', 'Male')}</SelectItem>
                            <SelectItem value="female">{t('patients.female', 'Female')}</SelectItem>
                            <SelectItem value="other">{t('patients.other', 'Other')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder={t('patients.is_active', 'Status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('patients.all_statuses', 'All Statuses')}</SelectItem>
                            <SelectItem value="active">{t('patients.active', 'Active')}</SelectItem>
                            <SelectItem value="inactive">{t('patients.inactive', 'Inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}
