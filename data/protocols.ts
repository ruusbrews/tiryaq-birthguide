/**
 * Protocol Data Definitions
 * 
 * Contains all emergency and guidance protocols
 * 
 * IMPORTANT: This is PLACEHOLDER medical content
 * ALL protocol steps must be reviewed and approved by licensed
 * midwives or OB/GYN professionals before production use
 */

import { Protocol } from '../components/ProtocolViewer';

/**
 * Emergency Protocol: Severe Hemorrhage (Postpartum Bleeding)
 * 
 * Triggered when: User reports severe bleeding
 * PRD Reference: Section 3, Decision Point 2
 */
export const HEMORRHAGE_PROTOCOL: Protocol = {
    id: 'hemorrhage',
    title: 'بروتوكول النزيف الحاد',
    isEmergency: true,
    steps: [
        {
            id: 'step_1',
            instruction: 'استلقي على ظهرك فوراً',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_2',
            instruction: 'ضعي يديك على بطنك فوق السرة واضغطي بقوة',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_3',
            instruction: 'اطلبي من شخص الاتصال بالطوارئ 911 فوراً',
            critical: true,
            requiresConfirmation: false,
        },
        {
            id: 'step_4',
            instruction: 'استمري بالضغط على البطن حتى وصول المساعدة',
            critical: true,
            requiresConfirmation: false,
        },
    ],
};

/**
 * Emergency Protocol: Breech Birth
 * 
 * Triggered when: Buttocks appear first instead of head
 * PRD Reference: Section 3, Decision Point 1
 */
export const BREECH_PROTOCOL: Protocol = {
    id: 'breech',
    title: 'بروتوكول الولادة المقعدية',
    isEmergency: true,
    steps: [
        {
            id: 'step_1',
            instruction: 'لا تدفعي! توقفي عن الدفع فوراً',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_2',
            instruction: 'اتخذي وضعية الركوع (على اليدين والركبتين)',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_3',
            instruction: 'اخفضي رأسك وصدرك نحو الأرض مع رفع الأرداف',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_4',
            instruction: 'اطلبي من شخص الاتصال بالطوارئ 911 فوراً',
            critical: true,
            requiresConfirmation: false,
        },
        {
            id: 'step_5',
            instruction: 'ابقي في هذه الوضعية حتى وصول المساعدة الطبية',
            critical: true,
            requiresConfirmation: false,
        },
    ],
};

/**
 * Emergency Protocol: Cord Prolapse
 * 
 * Triggered when: Umbilical cord or arm appears first
 * PRD Reference: Section 3, Decision Point 1 (شيء آخر response)
 */
export const CORD_PROLAPSE_PROTOCOL: Protocol = {
    id: 'cord_prolapse',
    title: 'بروتوكول تدلي الحبل السري',
    isEmergency: true,
    steps: [
        {
            id: 'step_1',
            instruction: 'لا تدفعي! توقفي عن الدفع فوراً',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_2',
            instruction: 'اتخذي وضعية الركوع (على اليدين والركبتين)',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_3',
            instruction: 'اخفضي رأسك وصدرك نحو الأرض مع رفع الأرداف عالياً',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_4',
            instruction: 'لا تلمسي الحبل السري أو الذراع',
            critical: true,
            requiresConfirmation: false,
        },
        {
            id: 'step_5',
            instruction: 'اطلبي من شخص الاتصال بالطوارئ 911 فوراً - هذه حالة طوارئ قصوى',
            critical: true,
            requiresConfirmation: false,
        },
        {
            id: 'step_6',
            instruction: 'ابقي في وضعية الركوع حتى وصول المساعدة',
            critical: true,
            requiresConfirmation: false,
        },
    ],
};

/**
 * Emergency Protocol: Newborn Resuscitation
 * 
 * Triggered when: Baby is not breathing after birth
 * PRD Reference: Section 3, Decision Point 4
 */
export const RESUSCITATION_PROTOCOL: Protocol = {
    id: 'resuscitation',
    title: 'بروتوكول إنعاش المولود',
    isEmergency: true,
    steps: [
        {
            id: 'step_1',
            instruction: 'ضعي الطفل على ظهره على سطح صلب ومستوٍ',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_2',
            instruction: 'امسحي أنف وفم الطفل بلطف بقطعة قماش نظيفة',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_3',
            instruction: 'دلكي ظهر الطفل وقدميه بقوة لتحفيز التنفس',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_4',
            instruction: 'اطلبي من شخص الاتصال بالطوارئ 911 فوراً',
            critical: true,
            requiresConfirmation: false,
        },
        {
            id: 'step_5',
            instruction: 'إذا لم يتنفس الطفل خلال 30 ثانية، ابدئي الإنعاش القلبي الرئوي للأطفال',
            critical: true,
            requiresConfirmation: false,
        },
    ],
};

/**
 * Emergency Protocol: Retained Placenta
 * 
 * Triggered when: Placenta not delivered after 60 minutes
 * PRD Reference: Section 3, Decision Point 5
 */
export const RETAINED_PLACENTA_PROTOCOL: Protocol = {
    id: 'retained_placenta',
    title: 'بروتوكول احتباس المشيمة',
    isEmergency: true,
    steps: [
        {
            id: 'step_1',
            instruction: 'اجلسي في وضعية شبه جلوس مع ثني الركبتين',
            critical: true,
            requiresConfirmation: true,
        },
        {
            id: 'step_2',
            instruction: 'حاولي إرضاع الطفل - هذا يساعد على انقباض الرحم',
            critical: false,
            requiresConfirmation: false,
        },
        {
            id: 'step_3',
            instruction: 'لا تشدي الحبل السري بقوة',
            critical: true,
            requiresConfirmation: false,
        },
        {
            id: 'step_4',
            instruction: 'اطلبي من شخص الاتصال بالطوارئ 911',
            critical: true,
            requiresConfirmation: false,
        },
        {
            id: 'step_5',
            instruction: 'راقبي النزيف واستمري بمحاولة الإرضاع حتى وصول المساعدة',
            critical: false,
            requiresConfirmation: false,
        },
    ],
};

/**
 * Normal Guidance Protocol: Early Labor
 * (Not emergency - informational guidance)
 */
export const EARLY_LABOR_GUIDANCE: Protocol = {
    id: 'early_labor',
    title: 'إرشادات المرحلة المبكرة',
    isEmergency: false,
    steps: [
        {
            id: 'step_1',
            instruction: 'ابقي هادئة ومرتاحة - المخاض المبكر قد يستمر عدة ساعات',
            critical: false,
        },
        {
            id: 'step_2',
            instruction: 'تحركي بحرية - المشي والحركة يساعدان على تقدم المخاض',
            critical: false,
        },
        {
            id: 'step_3',
            instruction: 'اشربي الماء والسوائل بانتظام',
            critical: false,
        },
        {
            id: 'step_4',
            instruction: 'تنفسي ببطء وعمق مع كل انقباضة',
            critical: false,
        },
        {
            id: 'step_5',
            instruction: 'احسبي المدة بين الانقباضات - سنسألك عن ذلك لاحقاً',
            critical: false,
        },
    ],
};

/**
 * Normal Guidance Protocol: Active Labor
 */
export const ACTIVE_LABOR_GUIDANCE: Protocol = {
    id: 'active_labor',
    title: 'إرشادات المخاض النشط',
    isEmergency: false,
    steps: [
        {
            id: 'step_1',
            instruction: 'ابحثي عن الوضعية الأكثر راحة لك - جربي وضعيات مختلفة',
            critical: false,
        },
        {
            id: 'step_2',
            instruction: 'تنفسي بعمق مع كل انقباضة - الزفير الطويل يساعد',
            critical: false,
        },
        {
            id: 'step_3',
            instruction: 'اشربي رشفات صغيرة من الماء بين الانقباضات',
            critical: false,
        },
        {
            id: 'step_4',
            instruction: 'دعي شخص يدلك أسفل ظهرك إذا كان ذلك مريح',
            critical: false,
        },
        {
            id: 'step_5',
            instruction: 'أفرغي المثانة بانتظام - المثانة الممتلئة تبطئ الولادة',
            critical: false,
        },
    ],
};

/**
 * Normal Guidance Protocol: Pushing Stage
 */
export const PUSHING_GUIDANCE: Protocol = {
    id: 'pushing',
    title: 'إرشادات الدفع',
    isEmergency: false,
    steps: [
        {
            id: 'step_1',
            instruction: 'ادفعي فقط عندما تشعرين برغبة قوية في الدفع',
            critical: true,
        },
        {
            id: 'step_2',
            instruction: 'خذي نفساً عميقاً واحبسيه ثم ادفعي نحو الأسفل',
            critical: false,
        },
        {
            id: 'step_3',
            instruction: 'ادفعي لمدة 10 ثوانٍ، ثم خذي نفساً، ثم ادفعي مرة أخرى',
            critical: false,
        },
        {
            id: 'step_4',
            instruction: 'استريحي بين الانقباضات',
            critical: false,
        },
        {
            id: 'step_5',
            instruction: 'عندما يظهر الرأس، توقفي عن الدفع واثبتي - دعي الرأس يخرج ببطء',
            critical: true,
        },
    ],
};

/**
 * Normal Guidance Protocol: Postpartum
 */
export const POSTPARTUM_GUIDANCE: Protocol = {
    id: 'postpartum',
    title: 'إرشادات ما بعد الولادة',
    isEmergency: false,
    steps: [
        {
            id: 'step_1',
            instruction: 'ضعي الطفل على صدرك مباشرة - التلامس الجلدي مهم',
            critical: false,
        },
        {
            id: 'step_2',
            instruction: 'جففي الطفل بمنشفة نظيفة ودافئة',
            critical: false,
        },
        {
            id: 'step_3',
            instruction: 'غطي نفسك والطفل ببطانية للدفء',
            critical: false,
        },
        {
            id: 'step_4',
            instruction: 'حاولي إرضاع الطفل - هذا يساعد على خروج المشيمة',
            critical: false,
        },
        {
            id: 'step_5',
            instruction: 'انتظري المشيمة - عادةً تخرج خلال 30 دقيقة',
            critical: false,
        },
        {
            id: 'step_6',
            instruction: 'راقبي النزيف - القليل من الدم طبيعي',
            critical: false,
        },
    ],
};

/**
 * All protocols indexed by ID
 */
export const PROTOCOLS: Record<string, Protocol> = {
    hemorrhage: HEMORRHAGE_PROTOCOL,
    breech: BREECH_PROTOCOL,
    cord_prolapse: CORD_PROLAPSE_PROTOCOL,
    resuscitation: RESUSCITATION_PROTOCOL,
    retained_placenta: RETAINED_PLACENTA_PROTOCOL,
    early_labor: EARLY_LABOR_GUIDANCE,
    active_labor: ACTIVE_LABOR_GUIDANCE,
    pushing: PUSHING_GUIDANCE,
    postpartum: POSTPARTUM_GUIDANCE,
};

/**
 * Get protocol by emergency type
 */
export function getProtocolByType(type: string): Protocol | null {
    return PROTOCOLS[type] || null;
}

/**
 * Get protocol by labor stage
 */
export function getProtocolByStage(stage: string): Protocol | null {
    const stageMap: Record<string, string> = {
        early: 'early_labor',
        active: 'active_labor',
        transition: 'active_labor', // Use active labor guidance
        pushing: 'pushing',
        postpartum: 'postpartum',
    };

    const protocolId = stageMap[stage];
    return protocolId ? PROTOCOLS[protocolId] : null;
}
