import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useAuthClinics from '@/hooks/use-auth-clinics'
import ClinicLayout from '@/layouts/clinic-layout'
import { router } from '@inertiajs/react'


export default function create_booking_page({ working_days }: any) {
    const { authClinic } = useAuthClinics()


    const handleGetDayBooking = (day:any) => {
        router.get(`/clinic/${authClinic.slug}/create/booking/page`,
            {
                day:day
            },
            // {
            //     preserveState: true,
            //     preserveScroll: true,
            //     replace: true,
            // }
            {
                onSuccess:()=>{
                    console.log("sucess")
                },
                onError:(errors)=>{
                    console.log(errors)
                }
            }
        )
    }
    return (
        <ClinicLayout>
            <Tabs>
                <TabsList>
                    {working_days.map((day: any, index: number) => (
                        <TabsTrigger key={day.id} value={day.id} className='flex flex-col' onClick={() => handleGetDayBooking(day.day_of_week)}>
                            <h1>{day.day_of_week}</h1>
                            <div>
                                <span>{day.start_time}</span>
                                <span>-</span>
                                <span>{day.end_time}</span>
                            </div>
                        </TabsTrigger>
                    ))}
                </TabsList>


                {working_days.map((day: any, index: number) => (
                    <TabsContent value={day.id}>content of tabe {day.day_of_week}</TabsContent>
                ))}
            </Tabs>
        </ClinicLayout>
    )
}
