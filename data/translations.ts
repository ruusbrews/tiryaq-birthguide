export type Language = 'ar' | 'en';

export const translations = {
    common: {
        back: { ar: 'العودة', en: 'Back' },
        next: { ar: 'التالي', en: 'Next' },
        finish: { ar: 'إنهاء', en: 'Finish' },
        agree: { ar: 'أوافق', en: 'I Agree' },
        cancel: { ar: 'إلغاء', en: 'Cancel' },
        emergency: { ar: 'طوارئ', en: 'Emergency' },
        home: { ar: 'الرئيسية', en: 'Home' },
        loading: { ar: 'جارٍ التحميل...', en: 'Loading...' },
    },
    home: {
        title: { ar: 'BirthGuide', en: 'BirthGuide' },
        subtitle: { ar: 'دليلك للولادة في حالات الطوارئ', en: 'Your guide for emergency childbirth' },
        start_assessment: { ar: 'ابدأ التقييم', en: 'Start Assessment' },
        emergency_protocols: { ar: 'بروتوكولات الطوارئ', en: 'Emergency Protocols' },
        health_tracking: { ar: 'سجل الحمل', en: 'Pregnancy Record' },
        disclaimer_title: { ar: 'تنبيه طبي هام', en: 'Important Medical Disclaimer' },
        disclaimer_brief: { ar: 'هذا التطبيق للاستخدام في حالات الطوارئ فقط عند عدم توفر مساعدة طبية.', en: 'This app is for emergency use only when medical help is unavailable.' },
        view_disclaimer: { ar: 'عرض التنبيه القانوني', en: 'View Legal Disclaimer' },
    },
    assessment: {
        title: { ar: 'تقييم الحالة', en: 'Case Assessment' },
        progress: { ar: 'التقدم', en: 'Progress' },
        risk_safe: { ar: 'الوضع مستقر', en: 'Status Stable' },
        risk_monitor: { ar: 'تحت المراقبة', en: 'Under Observation' },
        risk_danger: { ar: 'خطر - بحاجة لمساعدة', en: 'Danger - Needs Help' },
        restart: { ar: 'إعادة التقييم', en: 'Restart Assessment' },
    },
    health_tracking: {
        title: { ar: 'سجل الحمل', en: 'Pregnancy Record' },
        subtitle: { ar: 'أكمل النموذج لمساعدة وزارة الصحة في تخصيص الموارد', en: 'Complete the form to help the Ministry of Health allocate resources' },
        progress_label: { ar: 'تقدم الإنجاز', en: 'Completion Progress' },
        sections_completed: { ar: '{count} من {total} أقسام مكتملة', en: '{count} of {total} sections completed' },
        submit_records: { ar: 'إرسال السجلات', en: 'Submit Records' },
        back_home: { ar: 'العودة للرئيسية', en: 'Back to Home' },
    },
    legal: {
        emergency_notice_title: { ar: '⚠️ تنبيه طوارئ', en: '⚠️ Emergency Alert' },
        emergency_notice_agree: { ar: 'أوافق - أرسل الرسالة الآن', en: 'I Agree - Send Message Now' },
        emergency_notice_cancel: { ar: 'إلغاء', en: 'Cancel' },
    },
    emergency_csection: {
        title: { ar: 'حالة طوارئ', en: 'Emergency Situation' },
        subtitle: { ar: 'عملية قيصرية مطلوبة', en: 'C-Section Required' },
        sms_sent: { ar: 'تم إرسال رسالة الطوارئ', en: 'Emergency SMS Sent' },
        sms_pending: { ar: 'بانتظار إرسال الرسالة', en: 'Waiting to send message' },
        location_fixed: { ar: 'تم تحديد الموقع', en: 'Location Identified' },
        stay_strong: { ar: 'أنت قوية', en: 'You are strong' },
        what_to_do: { ar: 'ما يجب فعله الآن:', en: 'What to do now:' },
        resend_sms: { ar: 'إعادة إرسال رسالة الطوارئ', en: 'Resend Emergency Message' },
    }
};
