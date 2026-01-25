/**
 * Simulated Arabic Voice Responses
 * 
 * Maps question IDs to natural spoken Arabic phrases.
 * Used for demoing hands-free functionality without real STT.
 */

export interface QuestionSimulation {
    questionId: string | number;
    responses: string[];
}

export const SIMULATED_VOICE_RESPONSES: Record<string | number, string[]> = {
    // Assessment Questions
    0: ["أنا في الشهر التاسع", "الشهر التاسع", "9 أشهر"], // Months pregnant
    1: ["دقيقتين بين الطلق", "كل دقيقتين", "دقيقتان"],   // Contractions
    2: ["نعم انفجر الكيس", "المي نزلت", "نعم"],          // Water broken
    3: ["حاسة بدي أدفع", "نعم أشعر بالدفع", "نعم"],      // Urge to push

    // Decision Logic IDs (from decisionTree.ts)
    'presentation': ["أرى الرأس", "طالع الرأس", "رأس"],
    'bleeding': ["النزيف طبيعي", "خفيف", "لا"],
    'crowning': ["نعم الرأس يخرج", "عم يطلع"],
    'baby_breathing': ["نعم يتنفس", "الحمد لله عم يتنفس", "نعم"],
    'placenta': ["نعم نزلت المشيمة", "طلعت المشيمة", "نعم"]
};
