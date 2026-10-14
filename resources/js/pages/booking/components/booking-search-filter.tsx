import { Input } from '@/components/ui/input'
import useImport from '@/hooks/use-import'
import { Search } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function BookingSearchFilter({searchTerm,setSearchTerm,setStatusFilter,statusFilter,stats,typeFilter,setTypeFilter,doctors,doctorFilter,setDoctorFilter}:any) {
  const {t}=useImport()
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3.5 rounded-xl border shadow-xs">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-55">
                        <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('bookings.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 rtl:pl-3 rtl:pr-9 h-9 text-sm"
                        />
                    </div>

                    {/* Filter Pills / Selects */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Pills */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-xs">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                                    statusFilter === 'all'
                                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {t('common.all')} ({stats.total})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('pending')}
                                className={`px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                                    statusFilter === 'pending'
                                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 shadow-xs'
                                        : 'text-muted-foreground hover:text-amber-700'
                                }`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {t('bookings.status_pending', 'Pending')} ({stats.pending})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('confirmed')}
                                className={`px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                                    statusFilter === 'confirmed'
                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-xs'
                                        : 'text-muted-foreground hover:text-emerald-700'
                                }`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {t('bookings.status_confirmed', 'Confirmed')} ({stats.confirmed})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('completed')}
                                className={`px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                                    statusFilter === 'completed'
                                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 shadow-xs'
                                        : 'text-muted-foreground hover:text-blue-700'
                                }`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                {t('bookings.status_completed', 'Completed')} ({stats.completed})
                            </button>
                        </div>

                        {/* Type Select */}
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="h-9 w-32.5 text-xs">
                                <SelectValue placeholder={t('bookings.all_types', 'All Types')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('bookings.all_types')}</SelectItem>
                                <SelectItem value="new">{t('bookings.type_new')}</SelectItem>
                                <SelectItem value="follow_up">{t('bookings.type_follow_up')}</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Doctor Filter if doctors exist */}
                        {doctors.length > 0 && (
                            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                                <SelectTrigger className="h-9 w-[140px] text-xs">
                                    <SelectValue placeholder={t('bookings.all_doctors', 'All Doctors')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('bookings.all_doctors', 'All Doctors')}</SelectItem>
                                    {doctors.map((doc:any) => (
                                        <SelectItem key={doc.id} value={String(doc.id)}>
                                            {doc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {/* View Switcher: Timeline Cards vs Table */}
                        {/* <div className="flex items-center border rounded-lg p-0.5 bg-gray-50 dark:bg-gray-800">
                            <Button
                                type="button"
                                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('cards')}
                                title={t('bookings.cards_view', 'Queue Cards View')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('table')}
                                title={t('bookings.table_view', 'Table View')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div> */}
                    </div>
                </div>
  )
}
