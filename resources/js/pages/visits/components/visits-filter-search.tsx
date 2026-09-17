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

export default function VisitsFilterSearch({ searchTerm, setSearchTerm, typeFilter, setTypeFilter }: any) {
    const { isRtl, t } = useImport()
    return (
        <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
            <CardContent className="p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                    <Input
                        placeholder={t('visits.search_placeholder', 'Search by date, type, or medication...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={isRtl ? 'pr-9' : 'pl-9'}
                    />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-45">
                        <SelectValue placeholder={t('visits.type', 'Visit Type')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('visits.all_types', 'All Visit Types')}</SelectItem>
                        <SelectItem value="examination">{t('visits.examination', 'Examination')}</SelectItem>
                        <SelectItem value="follow_up">{t('visits.follow_up', 'Follow-up')}</SelectItem>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    )
}
