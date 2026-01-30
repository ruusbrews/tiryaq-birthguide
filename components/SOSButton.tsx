import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { emergencyService } from '../services/EmergencyService';
import { ComplianceModal } from './ComplianceModal';

interface SOSButtonProps {
    style?: any;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ style }) => {
    const [noticeVisible, setNoticeVisible] = React.useState(false);

    const handlePress = () => {
        setNoticeVisible(true);
    };

    const handleConfirm = () => {
        emergencyService.sendSOS();
    };

    return (
        <>
            <Button
                mode="contained"
                onPress={handlePress}
                style={[styles.button, style]}
                labelStyle={styles.label}
                buttonColor="#B71C1C" // Darker red for SOS
                textColor="white"
                icon="message-alert"
            >
                SOS - أرسل موقعي
            </Button>

            <ComplianceModal
                visible={noticeVisible}
                type="emergency_notice"
                onDismiss={() => setNoticeVisible(false)}
                onAgree={handleConfirm}
            />
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        marginVertical: 16,
        borderRadius: 24,
        elevation: 6,
        paddingVertical: 8,
        borderWidth: 2,
        borderColor: '#FFEBEE',
    },
    label: {
        fontSize: 22,
        fontWeight: 'bold',
    }
});
