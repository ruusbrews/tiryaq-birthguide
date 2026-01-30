import AsyncStorage from '@react-native-async-storage/async-storage';

export const HEALTH_RECORD_KEYS = {
    IDENTIFICATION: 'health_record_identification',
    PREGNANCY: 'health_record_pregnancy',
    ANTENATAL: 'health_record_antenatal',
    LIVING: 'health_record_living',
    MENTAL: 'health_record_mental',
    CONSENT: 'health_record_consent',
    NOTES: 'health_record_notes',
    COMPLETED: 'health_record_completed',
    SUBMITTED_TIMESTAMP: 'health_record_submitted_timestamp',
};

export class HealthRecordStorage {
    static async saveData(key: string, data: any) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
            await this.updateCompletionStatus();
        } catch (error) {
            console.error('Error saving health record data:', error);
        }
    }

    static async getData(key: string) {
        try {
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting health record data:', error);
            return null;
        }
    }

    static async updateCompletionStatus() {
        const sections = [
            HEALTH_RECORD_KEYS.IDENTIFICATION,
            HEALTH_RECORD_KEYS.PREGNANCY,
            HEALTH_RECORD_KEYS.ANTENATAL,
            HEALTH_RECORD_KEYS.LIVING,
            HEALTH_RECORD_KEYS.MENTAL,
            HEALTH_RECORD_KEYS.CONSENT,
        ];

        let completedCount = 0;
        for (const key of sections) {
            const data = await this.getData(key);
            if (data) completedCount++;
        }

        const isCompleted = completedCount === sections.length;
        await AsyncStorage.setItem(HEALTH_RECORD_KEYS.COMPLETED, JSON.stringify(isCompleted));
        return { completedCount, isCompleted };
    }

    static async getProgress() {
        const sections = [
            HEALTH_RECORD_KEYS.IDENTIFICATION,
            HEALTH_RECORD_KEYS.PREGNANCY,
            HEALTH_RECORD_KEYS.ANTENATAL,
            HEALTH_RECORD_KEYS.LIVING,
            HEALTH_RECORD_KEYS.MENTAL,
            HEALTH_RECORD_KEYS.CONSENT,
        ];

        let completedSections = [];
        for (const key of sections) {
            const data = await this.getData(key);
            if (data) completedSections.push(key);
        }

        return {
            completedCount: completedSections.length,
            totalCount: sections.length,
            completedSections,
        };
    }
}
