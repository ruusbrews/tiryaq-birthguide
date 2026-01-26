export interface ProtocolStep {
    id: string;
    text: string; // Display text
    voice: string; // TTS text (simplified)
    image?: string; // Placeholder for image asset name
    warning?: string;
}

export interface Protocol {
    id: string;
    title: string;
    steps: ProtocolStep[];
    reference?: string;
}

export const EMERGENCY_PROTOCOLS: Record<string, Protocol> = {
    hemorrhage: {
        id: 'hemorrhage',
        title: 'النزيف الشديد',
        steps: [
            {
                id: 'stop_pushing',
                text: 'توقفي عن الدفع فوراً. استلقي على ظهرك.',
                voice: 'توقفي عن الدفع. استلقي على ظهرك.',
            },
            {
                id: 'massage',
                text: 'افركي الجزء الأسفل من بطنك بقوة.',
                voice: 'افركي بطنك بقوة باستخدام كف يدك.',
                image: 'uterine_massage',
            },
            {
                id: 'internal_compression',
                text: 'إذا استمر النزيف، أدخلي يدك واضغطي داخل الرحم.',
                voice: 'بعد غسل اليدين، أدخلي يدك واضغطي على داخل الرحم.',
                warning: 'هذا مؤلم لكنه ضروري لإنقاذ الحياة',
            },
            {
                id: 'seek_help',
                text: 'اطلبي المساعدة فوراً إذا كان هناك أحد.',
                voice: 'إذا كان هناك أحد، اطلبي المساعدة الآن. هذا خطر شديد.',
            },
        ],
        reference: 'WHO Emergency Obstetric Care - Protocol 3A',
    },
    breech: {
        id: 'breech',
        title: 'الولادة المقعدية (الطفل مقعدي)',
        steps: [
            {
                id: 'stop_pushing_breech',
                text: 'لا تدفعي! توقفي عن الدفع فوراً.',
                voice: 'توقفي عن الدفع الآن. هذا وضع خطر.',
            },
            {
                id: 'position',
                text: 'اتخذي وضعية الركوع والصدر على الأرض.',
                voice: 'ارتكزي بوضع صدرك على الأرض. هذه الوضعية تساعد.',
                image: 'knee_chest_position',
            },
            {
                id: 'gravity',
                text: 'دعي الطفل يخرج ببطء. لا تسحبي.',
                voice: 'دعي الطفل ينزلق خارجاً. لا تحاولي سحبه.',
            },
            {
                id: 'stuck',
                text: 'إذا توقف التقدم، اطلبي المساعدة فوراً.',
                voice: 'إذا لم يتحرك الطفل، اطلبي المساعدة. قد تحتاجين عملية.',
            },
        ],
    },
    resuscitation: {
        id: 'resuscitation',
        title: 'إنعاش الطفل',
        steps: [
            {
                id: 'dry',
                text: 'جففي الطفل بقوة بمنشفة نظيفة.',
                voice: 'جففي الطفل بقوة بمنشفة نظيفة.',
            },
            {
                id: 'rub',
                text: 'افركي ظهره من الأسفل إلى الأعلى.',
                voice: 'افركي ظهره من الأسفل إلى الأعلى.',
            },
            {
                id: 'breaths',
                text: 'إذا لم يبكي، ضعي فمك على فمه وأنفه وانفخي بلطف.',
                voice: 'إذا لم يبكي، ضعي فمك على فمه وأنفه وانفخي بلطف.',
            },
            {
                id: 'repeat',
                text: 'كرري 5 مرات ثم راقبي الصدر يتحرك.',
                voice: 'كرري خمس مرات ثم راقبي الصدر يتحرك.',
            },
        ],
    },
};
