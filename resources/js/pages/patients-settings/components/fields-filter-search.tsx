import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useImport from '@/hooks/use-import';


export default function FieldsFilterSearch({searchTerm,setSearchTerm,selectedTypeFilter,setSelectedTypeFilter,availableFieldTypes}:any) {
    const {t}=useImport()
    return (
        <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search
                            size={16}
                            className="absolute inset-y-0 inset-s-3 my-auto text-gray-400"
                        />
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('patients_settings.search_placeholder', 'Search fields...')}
                            className="h-10 ps-9 rounded-xl border-gray-200 dark:border-gray-800"
                        />
                    </div>
                    <div className="w-full sm:w-60">
                        <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                            <SelectTrigger className="h-10 rounded-xl border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder={t('patients_settings.filter_by_type', 'Filter by Type')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">
                                    {t('patients_settings.all_types', 'All Types')}
                                </SelectItem>
                                {availableFieldTypes.map((typeOption:any) => (
                                    <SelectItem key={typeOption.value} value={typeOption.value}>
                                        {typeOption.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
