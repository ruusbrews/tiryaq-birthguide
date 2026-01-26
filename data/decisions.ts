export interface DecisionPoint {
    id: string;
    question: string;
    voice: string;
    options: { label: string; value: string; emergency?: string }[];
}

export const CRITICAL_DECISIONS: DecisionPoint[] = [
    {
        id: 'presentation',
        question: 'هل ترين رأس الطفل أم مؤخرته؟',
        voice: 'انظري للأسفل. هل ترين رأس الطفل أم مؤخرته؟',
        options: [
            { label: 'رأس', value: 'head' },
            { label: 'مؤخرة / قدم', value: 'breech', emergency: 'breech' },
            { label: 'شيء آخر', value: 'other', emergency: 'breech' }, // Treat unknown as breech/emergency for safety
            { label: 'لا أعرف', value: 'unknown' },
        ],
    },
    {
        id: 'crowning',
        question: 'هل يظهر رأس الطفل ثم يتراجع؟',
        voice: 'هل يظهر الرأس ثم يختفي بين الانقباضات؟',
        options: [
            { label: 'نعم', value: 'yes' },
            { label: 'لا (الرأس عالق)', value: 'stuck' }, // Could trigger position change
        ],
    },
    {
        id: 'bleeding',
        question: 'كيف تصفين النزيف الآن؟',
        voice: 'كيف هو النزيف؟ هل هو خفيف أم شديد جداً؟',
        options: [
            { label: 'خفيف / متوسط', value: 'normal' },
            { label: 'شديد (يملأ فوطة في 5 دقائق)', value: 'severe', emergency: 'hemorrhage' },
        ],
    },
    {
        id: 'baby_breathing',
        question: 'الطفل خرج. هل يبكي ويتنفس؟',
        voice: 'الطفل خرج الآن. هل يبكي ويتنفس؟',
        options: [
            { label: 'نعم', value: 'yes' },
            { label: 'لا', value: 'no', emergency: 'resuscitation' },
        ],
    },
    {
        id: 'placenta',
        question: 'هل خرجت المشيمة؟',
        voice: 'هل خرجت المشيمة بعد الطفل؟',
        options: [
            { label: 'نعم', value: 'yes' },
            { label: 'لا', value: 'no' },
        ],
    },
];
