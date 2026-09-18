import React from 'react';
import { Visit } from '@/types/visit';
import { Patient } from '@/types/patient';
import { Phone, MapPin, Calendar, Clock } from 'lucide-react';

interface VisitPrescriptionProps {
    clinic?: any;
    patient?: Patient;
    visit?: Visit | null;
}

/**
 * WhatsApp SVG icon for clean display without external dependency issues
 */
function WhatsAppIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
    );
}

/**
 * Silhouette medical emblem inspired by mother & child logo
 */
function MedicalLogoSilhouette({ className = 'w-16 h-16' }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="50" cy="50" r="46" stroke="#133E87" strokeWidth="2.5" strokeDasharray="4 2" />
            <circle cx="50" cy="50" r="41" stroke="#133E87" strokeWidth="1.5" />
            {/* Mother silhouette */}
            <path
                d="M48 24C52 24 55 27 55 31C55 35 52 38 48 38C44 38 41 35 41 31C41 27 44 24 48 24Z"
                fill="#133E87"
            />
            <path
                d="M36 50C36 40 43 38 52 38C58 38 64 42 64 49C64 58 56 65 52 72C49 70 46 66 45 61C42 62 39 60 38 57C36.8 54.8 36 52.4 36 50Z"
                fill="#133E87"
            />
            {/* Infant / Baby silhouette */}
            <circle cx="58" cy="56" r="5" fill="#133E87" />
            <path
                d="M54 62C54 59 62 59 63 63C64 68 59 72 55 72C54 70 54 66 54 62Z"
                fill="#133E87"
            />
            {/* Gentle embracing arc */}
            <path
                d="M32 64C34 73 43 80 53 80C65 80 74 71 74 58"
                stroke="#133E87"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function VisitPrescription({ clinic, patient, visit }: VisitPrescriptionProps) {
    if (!visit) {
        return null;
    }

    // Patient info
    const rawPatientName = patient
        ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Patient'
        : 'Patient';
    const patientPrefix = patient?.gender === 'female' ? 'م / ' : 'أ / ';
    const patientName = `${patientPrefix}${rawPatientName}`;

    // Calculate age from date_of_birth
    const calculateAge = (dob?: string | null): string => {
        if (!dob) return '';
        try {
            const birthDate = new Date(dob);
            if (isNaN(birthDate.getTime())) return '';
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age > 0 ? `${age} سنة` : '';
        } catch {
            return '';
        }
    };
    const patientAge = calculateAge(patient?.date_of_birth);

    // Formatted date in YYYY / M / D format matching the prescription style in the image
    const visitDate = visit.visited_at ? new Date(visit.visited_at) : new Date();
    const formattedDate = `${visitDate.getFullYear()} / ${visitDate.getMonth() + 1} / ${visitDate.getDate()}`;

    // Patient Address or phone
    const patientAddress = patient?.address || patient?.phone || '—';

    // Clinic details with graceful defaults matching standard Egyptian medical practice
    const clinicName = clinic?.name || 'دكتورة دينا الطويل';
    const clinicSpecialty = clinic?.clinic_type?.name || 'أخصائية النساء و التوليد';
    const clinicDescription = clinic?.description || 'و الحقن المجهري و تأخر الحمل';
    const clinicAffiliation = 'جامعة عين شمس';
    const clinicAddress = clinic?.address || 'ش التأمينات القديمة - خلف خير زمان - فوق القصر البريطاني للستاير';
    const primaryPhone = clinic?.phone || '01090218001';

    const clinicPhones: any[] = clinic?.phones || [];
    const activePhones = clinicPhones.filter((p: any) => p.is_active !== false);
    const displayPhones = activePhones.length > 0
        ? activePhones.slice(0, 4)
        : [
            { phone: primaryPhone, is_whatsapp: true },
            { phone: '01111933668', is_whatsapp: true },
            { phone: '01064925184', is_whatsapp: false },
            { phone: '045/3692122', is_whatsapp: false },
        ];

    const medications = visit.visit_medications || [];

    return (
        <div
            className="w-[800px] min-h-[1130px] bg-white text-slate-800 font-sans p-8 sm:p-10 flex flex-col justify-between border-t-8 border-[#133E87] border-x border-b border-slate-200 shadow-sm relative overflow-hidden select-none"
            style={{ backgroundColor: '#ffffff', color: '#1e293b' }}
        >
            {/* ===================== HEADER ===================== */}
            <div>
                <div className="flex items-start justify-between gap-4 pb-4">
                    {/* Patient Information (Left column - classic prescription slip lines) */}
                    <div className="w-64 text-right pt-1" dir="rtl">
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 border-b border-dashed border-slate-300 pb-1">
                                <span className="font-bold text-[#133E87] shrink-0 text-[11px]">الإســـم :</span>
                                <span className="font-semibold text-slate-900 truncate">{patientName}</span>
                            </div>

                            <div className="flex items-center gap-1.5 border-b border-dashed border-slate-300 pb-1">
                                <span className="font-bold text-[#133E87] shrink-0 text-[11px]">الســـن :</span>
                                <span className="font-medium text-slate-800">{patientAge || '—'}</span>
                            </div>

                            <div className="flex items-center gap-1.5 border-b border-dashed border-slate-300 pb-1">
                                <span className="font-bold text-[#133E87] shrink-0 text-[11px]">التاريخ :</span>
                                <span className="font-medium text-slate-800 font-mono text-[11px]">{formattedDate}</span>
                            </div>

                            <div className="flex items-center gap-1.5 border-b border-dashed border-slate-300 pb-1">
                                <span className="font-bold text-[#133E87] shrink-0 text-[11px]">العنوان :</span>
                                <span className="font-medium text-slate-800 truncate text-[11px]">{patientAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Center Emblem / Logo */}
                    <div className="flex flex-col items-center justify-center shrink-0 px-2">
                        {clinic?.image ? (
                            <img
                                src={clinic.image}
                                alt={clinic.name}
                                className="w-20 h-20 rounded-full object-cover border-2 border-[#133E87]/20 p-0.5 shadow-xs"
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <MedicalLogoSilhouette className="w-20 h-20 text-[#133E87]" />
                        )}
                        <span className="text-[10px] font-semibold text-[#133E87] tracking-wider mt-1 opacity-75">
                            {clinic?.name ? clinic.name.replace(/^دكتورة\s+|^د\.\s+/i, '') : 'Medical Clinic'}
                        </span>
                    </div>

                    {/* Doctor / Clinic Title & Specialty (Right column) */}
                    <div className="text-right flex-1 max-w-xs" dir="rtl">
                        <div className="inline-block bg-[#133E87] text-white text-[11px] font-bold px-3 py-0.5 rounded-full mb-1">
                            دكتورة
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-[#133E87] leading-snug">
                            {clinicName}
                        </h1>
                        <p className="text-xs font-bold text-slate-800 mt-1">
                            {clinicSpecialty}
                        </p>
                        <p className="text-[11px] font-medium text-slate-600 mt-0.5 leading-relaxed">
                            {clinicDescription}
                        </p>
                        <p className="text-[11px] font-semibold text-[#133E87] mt-0.5">
                            {clinicAffiliation}
                        </p>
                    </div>
                </div>

                {/* Elegant Navy Divider Line */}
                <div className="w-full h-[2px] bg-[#133E87] my-3" />

                {/* ===================== BODY ===================== */}
                <div className="relative pt-2 min-h-[580px] flex flex-col justify-between">
                    {/* Watermark in background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
                        <MedicalLogoSilhouette className="w-96 h-96 text-[#133E87]" />
                    </div>

                    <div>
                        {/* Classic Rx Medical Symbol */}
                        <div className="flex items-center justify-between mb-4">
                            <span
                                className="text-4xl font-black font-serif italic text-[#133E87] select-none tracking-tighter"
                                style={{ fontFamily: 'Georgia, Cambria, serif' }}
                            >
                                ℞
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                                Ref #{visit.id}
                            </span>
                        </div>

                        {/* Medications List */}
                        <div className="space-y-4 px-2">
                            {medications.length === 0 ? (
                                <div className="space-y-7 pt-4">
                                    {/* Empty state lines ready for physician handwriting */}
                                    {Array.from({ length: 7 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="border-b border-dashed border-slate-200/90 h-8"
                                        />
                                    ))}
                                </div>
                            ) : (
                                medications.map((med, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 py-2 border-b border-slate-100"
                                    >
                                        <span className="text-base font-bold text-[#133E87] shrink-0 leading-tight">
                                            -
                                        </span>
                                        <div className="flex-1">
                                            <h3 className="text-base font-bold text-slate-900 tracking-wide font-sans">
                                                {med.medication_name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1 font-medium" dir="rtl">
                                                الجرعة والتعليمات حسب إرشادات الطبيب المعالج
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Remaining Ruled Writing Lines for notes */}
                        {medications.length > 0 && medications.length < 5 && (
                            <div className="space-y-7 mt-8 px-2">
                                {Array.from({ length: Math.max(2, 5 - medications.length) }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="border-b border-dashed border-slate-200/80 h-7"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Subtle Doctor Signature placeholder */}
                    <div className="flex justify-end pt-4 px-4">
                        <div className="text-center w-36">
                            <div className="h-10 border-b border-slate-300 border-dashed mb-1" />
                            <p className="text-[11px] font-bold text-[#133E87]">توقيع الطبيب</p>
                            <p className="text-[9px] text-slate-400 font-sans">Doctor's Signature</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===================== FOOTER ===================== */}
            <div className="pt-4 border-t border-[#133E87]/30 mt-6">
                {/* Top Row: Emergency 24h Badge, Contact Numbers & Address */}
                <div className="flex items-center justify-between gap-4">
                    {/* 24 Hours Emergency Emblem (Left) */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-10 h-10 rounded-full border-2 border-[#133E87] flex items-center justify-center text-[#133E87]">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <span className="block text-xs font-black text-[#133E87] tracking-tight leading-tight">
                                24 HOURS
                            </span>
                            <span className="block text-[10px] font-bold text-slate-600">
                                طوارئ 24 ساعة
                            </span>
                        </div>
                    </div>

                    {/* Contact Numbers (Center) */}
                    <div className="flex flex-col items-center gap-1.5 flex-1" dir="ltr">
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-800">
                            {displayPhones.map((p: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-1 text-slate-800">
                                    {p.is_whatsapp ? (
                                        <WhatsAppIcon className="w-3.5 h-3.5 text-green-600" />
                                    ) : (
                                        <Phone className="w-3.5 h-3.5 text-[#133E87]" />
                                    )}
                                    <span>
                                        {p.country_code ? `${p.country_code} ` : ''}
                                        {p.phone}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Clinic Address */}
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-700 text-center font-medium" dir="rtl">
                            <MapPin className="w-3.5 h-3.5 text-[#133E87] shrink-0" />
                            <span>{clinicAddress}</span>
                        </div>
                    </div>
                </div>

                {/* Working Hours / Schedule Ribbon (Matching the Egyptian clinic prescription) */}
                <div
                    className="mt-3 py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between gap-2"
                    dir="rtl"
                >
                    <div className="flex items-center gap-1.5 font-bold text-[#133E87]">
                        <Calendar className="w-3.5 h-3.5 text-[#133E87] shrink-0" />
                        <span>السبت - الإثنين - الخميس : من 12 إلى 4</span>
                    </div>
                    <div className="h-3 w-px bg-slate-300" />
                    <div className="font-bold text-[#133E87]">
                        <span>الأحد - الثلاثاء - الأربعاء : من 2 إلى 6</span>
                    </div>
                    <div className="h-3 w-px bg-slate-300" />
                    <div className="text-slate-600 text-[10px] font-medium">
                        <span>الجمعة : بمستشفى التخصصي بالحجز المسبق</span>
                    </div>
                </div>

                {/* Grounding Bottom Line */}
                <div className="w-full h-1.5 bg-[#133E87] mt-3 rounded-full" />
            </div>
        </div>
    );
}
