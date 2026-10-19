import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useImport from '@/hooks/use-import'
import { Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AllBookingSearchFilter({ searchTerm, setSearchTerm, dateFilter, setDateFilter, statusFilter, setStatusFilter, typeFilter, setTypeFilter }: any) {
    const { t, isRtl } = useImport()
    return (
        <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
            <CardContent className="p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                    <Input
                        placeholder={t('bookings.search_placeholder', 'Search by patient name, phone, notes...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={isRtl ? 'pr-9' : 'pl-9'}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:w-auto">
                    <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full sm:w-42.5"
                    />

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-37.5">
                            <SelectValue placeholder={t('bookings.status', 'Status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('bookings.all_statuses', 'All Statuses')}</SelectItem>
                            <SelectItem value="pending">{t('bookings.status_pending', 'Pending')}</SelectItem>
                            <SelectItem value="confirmed">{t('bookings.status_confirmed', 'Confirmed')}</SelectItem>
                            <SelectItem value="completed">{t('bookings.status_completed', 'Completed')}</SelectItem>
                            <SelectItem value="cancelled">{t('bookings.status_cancelled', 'Cancelled')}</SelectItem>
                            <SelectItem value="no_show">{t('bookings.status_no_show', 'No Show')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-37.5">
                            <SelectValue placeholder={t('bookings.type', 'Type')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('bookings.all_types', 'All Types')}</SelectItem>
                            <SelectItem value="new">{t('bookings.type_new', 'New Examination')}</SelectItem>
                            <SelectItem value="follow_up">{t('bookings.type_follow_up', 'Follow-up')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}
