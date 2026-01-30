import * as SMS from 'expo-sms';
import { HealthRecordStorage, HEALTH_RECORD_KEYS } from './HealthRecordStorage';

export class HealthRecordSMSService {
    static async generateSMSContent() {
        const id = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.IDENTIFICATION);
        const preg = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.PREGNANCY);
        const ant = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.ANTENATAL);
        const liv = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.LIVING);
        const ment = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.MENTAL);
        const con = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.CONSENT);
        const notes = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.NOTES);

        // Helper to map values to codes if needed (basic stringification for now as per spec)
        // Specification Example: BIRTHGUIDE|AGE:3|GOV:2|...

        let parts = ['BIRTHGUIDE'];

        if (id) {
            parts.push(`AGE:${id.ageGroup}`);
            parts.push(`GOV:${id.governorate}`);
            parts.push(`LOC:${id.locationType}`);
            parts.push(`DISP:${id.displaced === 'Yes' ? 'Y' : 'N'}`);
            parts.push(`PH:${id.phoneContact}`);
            parts.push(`SMS:${id.canReceiveSMS === 'Yes' ? 'Y' : 'N'}`);
        }

        if (preg) {
            parts.push(`PREG:${preg.currentlyPregnant === 'Yes, currently pregnant' ? 'Y' : 'N'}`);
            parts.push(`MO:${preg.monthsPregnant || 0}`);
            parts.push(`1ST:${preg.firstPregnancy === 'Yes' ? 'Y' : 'N'}`);
            parts.push(`PREV:${preg.previousBirths || 0}`);
            parts.push(`CSEC:${preg.previousCSection === 'Yes' ? 'Y' : 'N'}`);
            parts.push(`TWIN:${preg.twins === 'Yes' ? 'Y' : 'N'}`);
            parts.push(`BREECH:${preg.breech === 'Yes' ? 'Y' : 'N'}`);
            parts.push(`BLEED:${preg.bleeding === 'Yes' ? 'Y' : 'N'}`);
            parts.push(`HBP:${preg.medicalConditions?.includes('High blood pressure') ? 'Y' : 'N'}`);
            parts.push(`DIA:${preg.medicalConditions?.includes('Diabetes') ? 'Y' : 'N'}`);
            // Add other flags as needed based on specific form fields
        }

        if (ant) {
            parts.push(`ANC:${ant.visitedFacility === 'Yes' ? 'Y' : 'N'}`);
            parts.push(`VISITS:${ant.numVisits || 0}`);
            parts.push(`BP:${ant.bpMeasured === 'Yes' ? 'Y' : 'N'}`);
            parts.push(`BLOOD:${ant.bloodTest === 'Yes' ? 'Y' : 'N'}`);
            parts.push(`PLAN:${ant.plannedPlace}`);
        }

        if (liv) {
            parts.push(`FOOD:${liv.foodAccess}`);
            parts.push(`WATER:${liv.waterAccess}`);
            parts.push(`SAFE:${liv.physicalSafety === 'Yes' ? 'Y' : 'N'}`);
        }

        if (ment) {
            parts.push(`DEP:${ment.depressionFrequency}`);
        }

        if (con) {
            const consentStr = `${con.shareData === 'Yes' ? 'Y' : 'N'}${con.contactPermission === 'Yes' ? 'Y' : 'N'}${con.mobileTeamInterest === 'Yes' ? 'Y' : 'N'}`;
            parts.push(`CONSENT:${consentStr}`);
        }

        if (notes) {
            parts.push(`NOTES:${notes.substring(0, 50)}`); // Keep it short
        }

        return parts.join('|');
    }

    static async sendRecord(recipients: string[]) {
        const isAvailable = await SMS.isAvailableAsync();
        if (!isAvailable) {
            throw new Error('SMS is not available on this device');
        }

        const message = await this.generateSMSContent();
        const { result } = await SMS.sendSMSAsync(recipients, message);

        if (result === 'sent') {
            await HealthRecordStorage.saveData(HEALTH_RECORD_KEYS.SUBMITTED_TIMESTAMP, new Date().toISOString());
        }

        return result;
    }
}
