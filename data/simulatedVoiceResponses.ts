/**
 * Simulated Arabic Voice Responses
 * 
 * Maps question IDs to natural spoken Arabic phrases.
 * Updated for SPECIFIC DEMO SCRIPT.
 */

export const SIMULATED_VOICE_RESPONSES: Record<string | number, string[]> = {
    // Assessment Questions (Scripted)
    0: ["أنا في الشهر التاسع"],      // Script: 9 months
    1: ["بينهم دقيقة أو دقيقتين"],   // Script: 1-2 minutes
    2: ["نعم انفجر"],               // Script: Yes
    3: ["نعم أشعر بالدفع"],          // Script: Yes

    // Decision Logic IDs (Scripted)
    'presentation': ["مؤخرة"],       // Script: Behind/Posterior -> Trigger Breech
    'bleeding': ["خفيف"],
    'crowning': ["نعم الرأس يخرج"],
    'baby_breathing': ["نعم يتنفس"],
    'placenta': ["نعم نزلت المشيمة"],

    // Universal responses (for protocols)
    'yes': ["نعم", "تم", "جاهز"]
};
