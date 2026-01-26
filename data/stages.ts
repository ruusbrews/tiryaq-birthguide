export interface LaborStage {
    id: string;
    title: string;
    instructions: string[];
    voiceInstructions: string[]; // Simplified for TTS
    nextAction: string;
    nextActionVoice: string;
}

export const LABOR_STAGES: Record<string, LaborStage> = {
    early: {
        id: 'early',
        title: 'المخاض المبكر',
        instructions: [
            'أنت في المرحلة الأولى. استريحي وتنفسي ببطء.',
            'يمكنك المشي ببطء إذا استطعت.',
            'اشربي الماء وكلي شيئاً خفيفاً.',
            'حاولي الاسترخاء بين الانقباضات.',
        ],
        voiceInstructions: [
            'أنت في المرحلة الأولى. استريحي وتنفسي ببطء.',
            'حاولي الاسترخاء بين الانقباضات.',
        ],
        nextAction: 'عندما تصبح الانقباضات كل 5 دقائق، اضغطي التالي.',
        nextActionVoice: 'عندما تصبح الانقباضات قوية وكل خمس دقائق، اضغطي التالي.',
    },
    active: {
        id: 'active',
        title: 'المخاض النشط',
        instructions: [
            'الانقباضات أصبحت أقوى. هذا طبيعي.',
            'تنفسي شهيقاً عميقاً عند بداية الانقباضة.',
            'زفيراً بطيئاً أثناء الانقباضة.',
            'غيري وضعيتك: جربي الجلوس أو الوقوف على أربع.',
        ],
        voiceInstructions: [
            'الانقباضات قوية الآن. تنفسي بعمق.',
            'غيري وضعيتك لتخفيف الألم.',
        ],
        nextAction: 'عندما تشعرين برغبة قوية للدفع، اضغطي التالي.',
        nextActionVoice: 'عندما تشعرين برغبة قوية للدفع، اضغطي التالي.',
    },
    pushing: {
        id: 'pushing',
        title: 'مرحلة الدفع',
        instructions: [
            'حان وقت الدفع! ولكن انتظري الإشارة.',
            'عندما تأتي الانقباضة، خذي نفساً عميقاً.',
            'احبسي نفسك وادفعي إلى الأسفل.',
            'استريحي بين الانقباضات.',
        ],
        voiceInstructions: [
            'حان وقت الدفع. ادفعي مع الانقباضة فقط.',
            'استريحي تماماً بين الانقباضات.',
        ],
        nextAction: 'مراقبة خروج الطفل',
        nextActionVoice: 'سنراقب خروج رأس الطفل الآن.',
    },
};
