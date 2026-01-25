/**
 * Intent Matcher Service
 * 
 * Maps simulated Arabic transcripts to deterministic answer values.
 */

export class IntentMatcher {
    /**
     * Match a transcript to an assessment or decision option
     */
    static match(questionId: string | number, transcript: string): any {
        const normalized = transcript.toLowerCase().trim();

        // 1. Keyword based matching
        if (questionId === 0) { // Months pregnant
            if (normalized.includes("9") || normalized.includes("تاسع")) return 9;
            if (normalized.includes("8") || normalized.includes("ثامن")) return 8;
            if (normalized.includes("7") || normalized.includes("سابع")) return 7;
            if (normalized.includes("6") || normalized.includes("أقل")) return 6;
        }

        if (questionId === 1) { // Contractions
            if (normalized.includes("أقل من دقيقة")) return 1;
            if (normalized.includes("دقيقة") || normalized.includes("دقيقتين") || normalized.includes("2")) return 2;
            if (normalized.includes("3") || normalized.includes("4") || normalized.includes("5")) return 4;
            if (normalized.includes("10") || normalized.includes("أكثر")) return 12;
            return 7; // Default/Middle
        }

        // 2. Binary Yes/No matching
        const isYes = normalized.includes("نعم") || normalized.includes("ايوه") || normalized.includes("اه") || normalized.includes("بدي") || normalized.includes("حاسة");
        const isNo = normalized.includes("لا") || normalized.includes("لأ") || normalized.includes("ما في") || normalized.includes("خفيف");

        if (questionId === 2 || questionId === 3 || questionId === 'baby_breathing' || questionId === 'placenta' || questionId === 'crowning') {
            if (isYes) return true;
            if (isNo) return false;
        }

        if (questionId === 'presentation') {
            if (normalized.includes("رأس")) return "رأس";
            if (normalized.includes("مؤخرة")) return "مؤخرة";
            return "شيء آخر";
        }

        if (questionId === 'bleeding') {
            if (normalized.includes("شديد")) return "شديد";
            return "طبيعي"; // Default
        }

        return null; // No match
    }
}

export default IntentMatcher;
