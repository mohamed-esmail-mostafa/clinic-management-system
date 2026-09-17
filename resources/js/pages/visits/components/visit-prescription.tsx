import React from 'react';
import { Visit } from '@/types/visit';
import { Patient } from '@/types/patient';
import { Pill, Phone, MapPin, Calendar, User, Stethoscope, Clock, ShieldCheck } from 'lucide-react';

interface VisitPrescriptionProps {
    clinic?: any;
    patient?: Patient;
    visit?: Visit | null;
}

export default function VisitPrescription({ clinic, patient, visit }: VisitPrescriptionProps) {
    if (!visit) {
        return null;
    }

    const patientName = patient
        ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Patient'
        : 'Patient';

    const medications = visit.visit_medications || [];

    const formattedDate = visit.visited_at
        ? new Date(visit.visited_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : new Date().toLocaleDateString();

    const visitTime = visit.visited_at
        ? new Date(visit.visited_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : '';

    const isExamination = visit.type === 'examination';

    return (
        <div
            className="w-[800px] min-h-[1100px] bg-white text-slate-900 font-sans p-10 flex flex-col justify-between border border-slate-200 shadow-sm relative overflow-hidden"
            style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
        >
            {/* Top Decorative Border */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />

            <div>
                {/* Clinic Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-200 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                        {clinic?.image ? (
                            <img
                                src={clinic.image}
                                alt={clinic.name}
                                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
                                <Stethoscope className="w-10 h-10" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">
                                {clinic?.name || 'Medical Clinic'}
                            </h1>
                            <p className="text-sm font-semibold text-blue-600 mt-0.5">
                                {clinic?.clinic_type?.name || 'Specialized Medical Center / مركز طبي متخصص'}
                            </p>
                            {clinic?.description && (
                                <p className="text-xs text-slate-500 mt-1 max-w-md line-clamp-1">
                                    {clinic.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Clinic Contacts */}
                    <div className="text-right text-xs text-slate-600 space-y-1.5 pt-1">
                        {clinic?.phone && (
                            <div className="flex items-center justify-end gap-1.5 font-medium text-slate-800">
                                <span>{clinic.phone}</span>
                                <Phone className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                        )}
                        {clinic?.address && (
                            <div className="flex items-center justify-end gap-1.5 text-slate-600">
                                <span>{clinic.address}</span>
                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                        )}
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold text-[11px] mt-1">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>Prescription / تذكرة علاج</span>
                        </div>
                    </div>
                </div>

                {/* Patient Information Box */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-3 gap-4 text-xs">
                    <div>
                        <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                            Patient Name / اسم المريض
                        </span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            {patientName}
                        </p>
                    </div>

                    <div>
                        <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                            Date & Time / التاريخ
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {formattedDate} {visitTime ? `• ${visitTime}` : ''}
                        </p>
                    </div>

                    <div>
                        <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                            Visit Type / نوع الزيارة
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                            <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                    isExamination
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                }`}
                            >
                                {isExamination ? 'Examination / كشف' : 'Follow-up / إعادة'}
                            </span>
                        </p>
                    </div>

                    {patient?.phone && (
                        <div>
                            <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                                Contact / الهاتف
                            </span>
                            <p className="font-semibold text-slate-800 mt-0.5">
                                {patient.phone}
                            </p>
                        </div>
                    )}

                    {patient?.gender && (
                        <div>
                            <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                                Gender / النوع
                            </span>
                            <p className="font-semibold text-slate-800 mt-0.5 capitalize">
                                {patient.gender === 'male' ? 'Male / ذكر' : 'Female / أنثى'}
                            </p>
                        </div>
                    )}

                    <div>
                        <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                            Visit Ref / رقم الزيارة
                        </span>
                        <p className="font-mono font-semibold text-slate-700 mt-0.5">
                            #{visit.id}
                        </p>
                    </div>
                </div>

                {/* Prescription Body with Rx Logo */}
                <div className="relative pt-2">
                    <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-2 mb-6">
                        <span
                            className="text-5xl font-black font-serif text-blue-700 select-none"
                            style={{ fontFamily: 'Georgia, Cambria, serif' }}
                        >
                            ℞
                        </span>
                        <div>
                            <h2 className="text-lg font-black tracking-wide uppercase text-slate-900">
                                Prescribed Medications
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                الروشتة الطبية والتعليمات العلاجية
                            </p>
                        </div>
                    </div>

                    {/* Medications List */}
                    <div className="space-y-4">
                        {medications.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                                <Pill className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-sm font-medium">
                                    No medications recorded for this visit.
                                </p>
                                <p className="text-xs mt-0.5">
                                    لا توجد أدوية مسجلة لهذه الزيارة
                                </p>
                            </div>
                        ) : (
                            medications.map((med, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold text-slate-900">
                                                {med.medication_name}
                                            </h3>
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Pill className="w-3.5 h-3.5 text-blue-500" />
                                                <span>جرعة الدواء حسب إرشادات الطبيب</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Ruled lines for notes */}
                    <div className="mt-8 space-y-4">
                        <div className="border-b border-dashed border-slate-200 h-6" />
                        <div className="border-b border-dashed border-slate-200 h-6" />
                        <div className="border-b border-dashed border-slate-200 h-6" />
                    </div>
                </div>
            </div>

            {/* Footer / Signatures */}
            <div className="pt-8 border-t border-slate-200 mt-10">
                <div className="grid grid-cols-2 gap-8 mb-6">
                    {/* Instructions */}
                    <div className="text-xs text-slate-500 space-y-1">
                        <p className="font-bold text-slate-700">Medical Instructions / تعليمات هامة:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            <li>الالتزام التام بالجرعات والمواعيد المحددة للعلاج.</li>
                            <li>مراجعة الطبيب في حالة ظهور أي أعراض جانبية غير معتادة.</li>
                            <li>إحضار الروشتة في زيارة الاستشارة أو المتابعة القادمة.</li>
                        </ul>
                    </div>

                    {/* Doctor Signature & Stamp */}
                    <div className="flex justify-end gap-6 items-end text-center">
                        <div className="w-36">
                            <div className="h-16 border-b-2 border-slate-400 border-dashed mb-1" />
                            <p className="text-xs font-bold text-slate-700">
                                Doctor's Signature
                            </p>
                            <p className="text-[10px] text-slate-400">توقيع الطبيب المعالج</p>
                        </div>

                        <div className="w-32">
                            <div className="h-16 border-2 border-slate-300 rounded-lg flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                                Clinic Stamp
                            </div>
                            <p className="text-xs font-bold text-slate-700">
                                Clinic Stamp
                            </p>
                            <p className="text-[10px] text-slate-400">ختم العيادة</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <p className="font-semibold text-blue-700">
                        ✨ نتمنى لكم دوام الصحة والعافية والشفاء العاجل ✨
                    </p>
                    <p>
                        {clinic?.name || 'Clinic Management System'} • Visit #{visit.id}
                    </p>
                </div>
            </div>
        </div>
    );
}
