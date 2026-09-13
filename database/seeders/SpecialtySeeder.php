<?php

namespace Database\Seeders;

use App\Models\Specialty;
use Illuminate\Database\Seeder;

class SpecialtySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specialties = [
            [
                'name_ar' => 'الباطنة العامة',
                'name_en' => 'Internal Medicine',
                'slug' => 'internal-medicine',
                'description_ar' => 'تشخيص وعلاج الأمراض الداخلية والمشكلات الصحية العامة لدى البالغين.',
                'description_en' => 'Diagnosis and treatment of internal diseases and general health conditions in adults.',
            ],
            [
                'name_ar' => 'طب الأطفال',
                'name_en' => 'Pediatrics',
                'slug' => 'pediatrics',
                'description_ar' => 'تشخيص وعلاج الأمراض والمشكلات الصحية لدى الأطفال.',
                'description_en' => 'Diagnosis and treatment of diseases and health conditions in children.',
            ],
            [
                'name_ar' => 'النساء والتوليد',
                'name_en' => 'Obstetrics and Gynecology',
                'slug' => 'obstetrics-gynecology',
                'description_ar' => 'رعاية صحة المرأة والحمل والولادة وأمراض الجهاز التناسلي.',
                'description_en' => 'Women’s health, pregnancy, childbirth, and reproductive system care.',
            ],
            [
                'name_ar' => 'أمراض القلب',
                'name_en' => 'Cardiology',
                'slug' => 'cardiology',
                'description_ar' => 'تشخيص وعلاج أمراض القلب والأوعية الدموية.',
                'description_en' => 'Diagnosis and treatment of heart and cardiovascular diseases.',
            ],
            [
                'name_ar' => 'الجلدية',
                'name_en' => 'Dermatology',
                'slug' => 'dermatology',
                'description_ar' => 'تشخيص وعلاج أمراض الجلد والشعر والأظافر.',
                'description_en' => 'Diagnosis and treatment of skin, hair, and nail conditions.',
            ],
            [
                'name_ar' => 'العظام',
                'name_en' => 'Orthopedics',
                'slug' => 'orthopedics',
                'description_ar' => 'تشخيص وعلاج أمراض وإصابات العظام والمفاصل والعضلات.',
                'description_en' => 'Diagnosis and treatment of bone, joint, and musculoskeletal conditions.',
            ],
            [
                'name_ar' => 'الأنف والأذن والحنجرة',
                'name_en' => 'ENT',
                'slug' => 'ent',
                'description_ar' => 'تشخيص وعلاج أمراض الأنف والأذن والحنجرة.',
                'description_en' => 'Diagnosis and treatment of ear, nose, and throat conditions.',
            ],
            [
                'name_ar' => 'طب وجراحة العيون',
                'name_en' => 'Ophthalmology',
                'slug' => 'ophthalmology',
                'description_ar' => 'تشخيص وعلاج أمراض العيون ومشكلات الإبصار.',
                'description_en' => 'Diagnosis and treatment of eye diseases and vision disorders.',
            ],
            [
                'name_ar' => 'طب الأسنان',
                'name_en' => 'Dentistry',
                'slug' => 'dentistry',
                'description_ar' => 'تشخيص وعلاج أمراض الأسنان والفم واللثة.',
                'description_en' => 'Diagnosis and treatment of dental, oral, and gum conditions.',
            ],
            [
                'name_ar' => 'المخ والأعصاب',
                'name_en' => 'Neurology',
                'slug' => 'neurology',
                'description_ar' => 'تشخيص وعلاج أمراض الجهاز العصبي والدماغ.',
                'description_en' => 'Diagnosis and treatment of neurological and brain disorders.',
            ],
            [
                'name_ar' => 'الطب النفسي',
                'name_en' => 'Psychiatry',
                'slug' => 'psychiatry',
                'description_ar' => 'تشخيص وعلاج الاضطرابات والمشكلات النفسية.',
                'description_en' => 'Diagnosis and treatment of mental health and psychiatric disorders.',
            ],
            [
                'name_ar' => 'المسالك البولية',
                'name_en' => 'Urology',
                'slug' => 'urology',
                'description_ar' => 'تشخيص وعلاج أمراض الجهاز البولي والجهاز التناسلي للرجال.',
                'description_en' => 'Diagnosis and treatment of urinary and male reproductive system conditions.',
            ],
            [
                'name_ar' => 'الجراحة العامة',
                'name_en' => 'General Surgery',
                'slug' => 'general-surgery',
                'description_ar' => 'التشخيص والعلاج الجراحي لمجموعة واسعة من الحالات.',
                'description_en' => 'Surgical diagnosis and treatment of a wide range of conditions.',
            ],
            [
                'name_ar' => 'جراحة المخ والأعصاب',
                'name_en' => 'Neurosurgery',
                'slug' => 'neurosurgery',
                'description_ar' => 'التشخيص والعلاج الجراحي لأمراض الدماغ والجهاز العصبي.',
                'description_en' => 'Surgical diagnosis and treatment of brain and nervous system conditions.',
            ],
            [
                'name_ar' => 'جراحة العظام',
                'name_en' => 'Orthopedic Surgery',
                'slug' => 'orthopedic-surgery',
                'description_ar' => 'العلاج الجراحي لإصابات وأمراض العظام والمفاصل.',
                'description_en' => 'Surgical treatment of bone, joint, and musculoskeletal conditions.',
            ],
            [
                'name_ar' => 'جراحة القلب والصدر',
                'name_en' => 'Cardiothoracic Surgery',
                'slug' => 'cardiothoracic-surgery',
                'description_ar' => 'العلاج الجراحي لأمراض القلب والصدر.',
                'description_en' => 'Surgical treatment of heart and chest conditions.',
            ],
            [
                'name_ar' => 'جراحة الأوعية الدموية',
                'name_en' => 'Vascular Surgery',
                'slug' => 'vascular-surgery',
                'description_ar' => 'تشخيص وعلاج أمراض الأوعية الدموية جراحيًا.',
                'description_en' => 'Diagnosis and surgical treatment of vascular diseases.',
            ],
            [
                'name_ar' => 'أمراض الجهاز الهضمي',
                'name_en' => 'Gastroenterology',
                'slug' => 'gastroenterology',
                'description_ar' => 'تشخيص وعلاج أمراض الجهاز الهضمي والكبد.',
                'description_en' => 'Diagnosis and treatment of digestive system and liver diseases.',
            ],
            [
                'name_ar' => 'أمراض الكلى',
                'name_en' => 'Nephrology',
                'slug' => 'nephrology',
                'description_ar' => 'تشخيص وعلاج أمراض الكلى واضطرابات وظائفها.',
                'description_en' => 'Diagnosis and treatment of kidney diseases and disorders.',
            ],
            [
                'name_ar' => 'أمراض الصدر',
                'name_en' => 'Pulmonology',
                'slug' => 'pulmonology',
                'description_ar' => 'تشخيص وعلاج أمراض الرئة والجهاز التنفسي.',
                'description_en' => 'Diagnosis and treatment of lung and respiratory diseases.',
            ],
            [
                'name_ar' => 'الغدد الصماء والسكري',
                'name_en' => 'Endocrinology and Diabetes',
                'slug' => 'endocrinology-diabetes',
                'description_ar' => 'تشخيص وعلاج أمراض الغدد الصماء والسكري واضطرابات الهرمونات.',
                'description_en' => 'Diagnosis and treatment of endocrine, diabetes, and hormonal disorders.',
            ],
            [
                'name_ar' => 'أمراض الدم',
                'name_en' => 'Hematology',
                'slug' => 'hematology',
                'description_ar' => 'تشخيص وعلاج أمراض الدم واضطراباتها.',
                'description_en' => 'Diagnosis and treatment of blood disorders and diseases.',
            ],
            [
                'name_ar' => 'الأورام',
                'name_en' => 'Oncology',
                'slug' => 'oncology',
                'description_ar' => 'تشخيص وعلاج الأورام والسرطان.',
                'description_en' => 'Diagnosis and treatment of cancer and tumors.',
            ],
            [
                'name_ar' => 'الروماتيزم',
                'name_en' => 'Rheumatology',
                'slug' => 'rheumatology',
                'description_ar' => 'تشخيص وعلاج أمراض المفاصل والعضلات وأمراض المناعة الذاتية.',
                'description_en' => 'Diagnosis and treatment of joint, muscle, and autoimmune diseases.',
            ],
            [
                'name_ar' => 'طب الأسرة',
                'name_en' => 'Family Medicine',
                'slug' => 'family-medicine',
                'description_ar' => 'الرعاية الطبية الشاملة والمستمرة للأفراد والعائلات.',
                'description_en' => 'Comprehensive and continuous healthcare for individuals and families.',
            ],
            [
                'name_ar' => 'طب الطوارئ',
                'name_en' => 'Emergency Medicine',
                'slug' => 'emergency-medicine',
                'description_ar' => 'التعامل مع الحالات الطبية والإصابات الطارئة والحادة.',
                'description_en' => 'Management of acute medical conditions and emergency injuries.',
            ],
            [
                'name_ar' => 'الطب الطبيعي وإعادة التأهيل',
                'name_en' => 'Physical Medicine and Rehabilitation',
                'slug' => 'physical-medicine-rehabilitation',
                'description_ar' => 'تأهيل المرضى وتحسين الحركة والوظائف الجسدية بعد الإصابات والأمراض.',
                'description_en' => 'Rehabilitation and improvement of physical function and mobility after illness or injury.',
            ],
            [
                'name_ar' => 'التخدير',
                'name_en' => 'Anesthesiology',
                'slug' => 'anesthesiology',
                'description_ar' => 'الرعاية الطبية المتعلقة بالتخدير وإدارة الألم.',
                'description_en' => 'Medical care related to anesthesia and pain management.',
            ],
            [
                'name_ar' => 'الأشعة',
                'name_en' => 'Radiology',
                'slug' => 'radiology',
                'description_ar' => 'التشخيص الطبي باستخدام الأشعة والتصوير الطبي.',
                'description_en' => 'Medical diagnosis using radiology and medical imaging.',
            ],
            [
                'name_ar' => 'الحساسية والمناعة',
                'name_en' => 'Allergy and Immunology',
                'slug' => 'allergy-immunology',
                'description_ar' => 'تشخيص وعلاج الحساسية واضطرابات الجهاز المناعي.',
                'description_en' => 'Diagnosis and treatment of allergies and immune system disorders.',
            ],
        ];
        foreach ($specialties as $specialty) {
            Specialty::updateOrCreate(['slug' => $specialty['slug']], array_merge($specialty, ['is_active' => true]));
        }
    }
}
